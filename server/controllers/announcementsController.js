const Announcement = require('../models/Announcement');

exports.list = async (req, res) => {
  const list = await Announcement.find().sort({ createdAt: -1 }).limit(200);
  return res.json(list);
};

exports.create = async (req, res) => {
  const { title, body, priority, audience } = req.body || {};
  if (!title || !String(title).trim()) return res.status(400).json({ message: 'title is required.' });
  if (!body || !String(body).trim()) return res.status(400).json({ message: 'body is required.' });

  const doc = await Announcement.create({
    title: String(title).trim(),
    body: String(body).trim(),
    priority: priority || 'Normal',
    audience: audience || 'All'
  });

  return res.status(201).json(doc);
};
