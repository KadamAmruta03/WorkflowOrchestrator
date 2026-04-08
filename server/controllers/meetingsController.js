const Meeting = require('../models/Meeting');

exports.list = async (req, res) => {
  const meetings = await Meeting.find().sort({ createdAt: -1 });
  return res.json(meetings);
};

exports.create = async (req, res) => {
  const { title, date, time, link } = req.body || {};
  if (!title || !date || !time) {
    return res.status(400).json({ message: 'title, date, and time are required.' });
  }

  const doc = await Meeting.create({ title, date, time, link });
  return res.status(201).json(doc);
};

exports.remove = async (req, res) => {
  const deleted = await Meeting.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Meeting not found.' });
  return res.json({ message: 'Meeting deleted successfully' });
};

