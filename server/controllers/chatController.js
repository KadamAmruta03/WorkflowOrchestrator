const ChatMessage = require('../models/ChatMessage');

const MAX_LIMIT = 200;

exports.groupList = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 80, MAX_LIMIT);
  const before = req.query.before ? new Date(req.query.before) : null;

  const q = { scope: 'group' };
  if (before && !Number.isNaN(before.valueOf())) q.createdAt = { $lt: before };

  const list = await ChatMessage.find(q)
    .populate('fromUserId', 'name role employeeId')
    .sort({ createdAt: -1 })
    .limit(limit);

  return res.json(list.reverse());
};

exports.groupPost = async (req, res) => {
  const { fromUserId, text } = req.body || {};
  if (!fromUserId) return res.status(400).json({ message: 'fromUserId is required.' });
  if (!text || !String(text).trim()) return res.status(400).json({ message: 'text is required.' });

  const doc = await ChatMessage.create({ scope: 'group', fromUserId, text: String(text).trim() });
  const populated = await ChatMessage.findById(doc._id).populate('fromUserId', 'name role employeeId');
  return res.status(201).json(populated);
};

exports.directList = async (req, res) => {
  const userId = req.query.userId;
  const otherUserId = req.params.otherUserId;
  if (!userId) return res.status(400).json({ message: 'userId query param is required.' });

  const limit = Math.min(Number(req.query.limit) || 80, MAX_LIMIT);
  const before = req.query.before ? new Date(req.query.before) : null;

  const participants = [
    { fromUserId: userId, toUserId: otherUserId },
    { fromUserId: otherUserId, toUserId: userId }
  ];

  const q = { scope: 'direct', $or: participants };
  if (before && !Number.isNaN(before.valueOf())) q.createdAt = { $lt: before };

  const list = await ChatMessage.find(q)
    .populate('fromUserId', 'name role employeeId')
    .populate('toUserId', 'name role employeeId')
    .sort({ createdAt: -1 })
    .limit(limit);

  return res.json(list.reverse());
};

exports.directPost = async (req, res) => {
  const { fromUserId, toUserId, text } = req.body || {};
  if (!fromUserId || !toUserId) return res.status(400).json({ message: 'fromUserId and toUserId are required.' });
  if (!text || !String(text).trim()) return res.status(400).json({ message: 'text is required.' });

  const doc = await ChatMessage.create({
    scope: 'direct',
    fromUserId,
    toUserId,
    text: String(text).trim()
  });

  const populated = await ChatMessage.findById(doc._id)
    .populate('fromUserId', 'name role employeeId')
    .populate('toUserId', 'name role employeeId');

  return res.status(201).json(populated);
};

