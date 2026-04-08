const Leave = require('../models/Leave');
const User = require('../models/User');

function isUserOnLeaveToday(leave, now) {
  if (!leave?.startDate) return false;
  if (leave.status && leave.status !== 'Approved') return false;

  const start = new Date(leave.startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + (Number(leave.days) || 1));
  end.setHours(0, 0, 0, 0);

  return now >= start && now < end;
}

exports.create = async (req, res) => {
  const { userId, type, days, startDate, reason } = req.body || {};
  if (!userId || !startDate || !days) return res.status(400).json({ message: 'userId, startDate, days are required.' });

  const doc = await Leave.create({ userId, type, days, startDate, reason });
  return res.status(201).json(doc);
};

exports.list = async (req, res) => {
  if (req.query.view === 'today') {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const [users, leaves] = await Promise.all([
      User.find().select('name employeeId role department').sort({ createdAt: -1 }),
      Leave.find({ status: 'Approved' }).populate('userId', 'name employeeId').sort({ startDate: -1 })
    ]);

    const status = users.map((u) => {
      const active = leaves.find((l) => String(l.userId?._id || l.userId) === String(u._id) && isUserOnLeaveToday(l, now));
      return {
        userId: String(u._id),
        name: u.name,
        employeeId: u.employeeId,
        department: u.department,
        status: active ? 'On Leave' : 'In Office',
        leaveType: active ? active.type : null
      };
    });

    return res.json(status);
  }

  const leaves = await Leave.find().populate('userId', 'name employeeId').sort({ startDate: -1 });
  return res.json(leaves);
};

exports.decide = async (req, res) => {
  const { status } = req.body || {};
  if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  const updated = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('userId', 'name employeeId');
  if (!updated) return res.status(404).json({ message: 'Leave request not found.' });
  return res.json(updated);
};

