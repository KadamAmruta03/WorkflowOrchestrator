const Task = require('../models/Task');
const User = require('../models/User');

const ACTIVE_STATUSES = ['Assigned', 'Pending', 'Hold'];
const WORKLOAD_LIMIT = 8;

async function calculateWorkloadPoints(userId) {
  const active = await Task.find({ userId, status: { $in: ACTIVE_STATUSES } }).select('priority');
  return active.reduce((sum, t) => sum + (Number(t.priority) || 0), 0);
}

async function syncUserWorkloadScore(userId) {
  const points = await calculateWorkloadPoints(userId);
  await User.findByIdAndUpdate(userId, { workloadScore: points }).catch(() => {});
  return points;
}

exports.assignNew = async (req, res) => {
  const { title, priority, userId, projectName, dueDate, allowOverload } = req.body || {};

  if (!title || !String(title).trim()) return res.status(400).json({ message: 'title is required.' });
  if (!userId) return res.status(400).json({ message: 'userId is required.' });

  const pr = Number(priority);
  if (!Number.isFinite(pr) || pr < 1 || pr > 5) return res.status(400).json({ message: 'priority must be 1-5.' });

  const current = await calculateWorkloadPoints(userId);
  const next = current + pr;

  if (next > WORKLOAD_LIMIT && !allowOverload) {
    return res.status(403).json({
      message: 'Burnout Guard: assignment blocked (workload would exceed 8 points).',
      currentWorkload: current,
      requestedPriority: pr,
      workloadLimit: WORKLOAD_LIMIT
    });
  }

  const doc = await Task.create({
    title: String(title).trim(),
    priority: pr,
    userId,
    projectName: projectName || 'Unassigned Project',
    dueDate: dueDate || undefined,
    status: 'Assigned',
    isEscalated: false
  });

  const workloadPoints = await syncUserWorkloadScore(userId);

  return res.status(201).json({
    message: 'Task assigned successfully!',
    task: doc,
    ...(next > WORKLOAD_LIMIT ? { warning: 'Workload exceeded limit; assignment allowed by allowOverload.', workloadPoints } : { workloadPoints })
  });
};

exports.list = async (req, res) => {
  const tasks = await Task.find()
    .populate('userId', 'name role employeeId department')
    .sort({ createdAt: -1 });
  return res.json(tasks);
};

exports.leaderboard = async (req, res) => {
  const leaderboard = await Task.aggregate([
    { $match: { status: { $regex: /^completed$/i } } },
    {
      $group: {
        _id: '$userId',
        completedTasks: { $sum: 1 },
        totalPriority: { $sum: '$priority' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        completedTasks: 1,
        totalPriority: 1,
        user: { _id: '$user._id', name: '$user.name', employeeId: '$user.employeeId', department: '$user.department' }
      }
    },
    { $sort: { completedTasks: -1, totalPriority: -1 } }
  ]);

  return res.json(leaderboard);
};

exports.update = async (req, res) => {
  const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Task not found.' });

  const assigneeId = updated.userId?._id || updated.userId;
  if (assigneeId) await syncUserWorkloadScore(assigneeId);

  return res.json({ message: 'Task updated successfully', task: updated });
};

exports.remove = async (req, res) => {
  const doc = await Task.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Task not found.' });

  const assigneeId = doc.userId?._id || doc.userId;
  if (assigneeId) await syncUserWorkloadScore(assigneeId);

  return res.json({ message: 'Task deleted successfully' });
};

