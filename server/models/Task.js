const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    projectName: { type: String, default: 'Unassigned Project' },
    priority: { type: Number, required: true, min: 1, max: 5 },
    dueDate: { type: Date },
    status: { type: String, enum: ['Assigned', 'Pending', 'Hold', 'Completed'], default: 'Assigned' },
    isEscalated: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
