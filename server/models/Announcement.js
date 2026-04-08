const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    priority: { type: String, enum: ['Normal', 'High'], default: 'Normal' },
    audience: { type: String, enum: ['All', 'Employees'], default: 'All' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', AnnouncementSchema);

