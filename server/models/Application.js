const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    role: { type: String, enum: ['Employee', 'Intern'], required: true },
    status: {
      type: String,
      enum: ['Applied', 'Interviewing', 'Approved', 'Rejected'],
      default: 'Applied'
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    employeeId: { type: String },
    approvedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

applicationSchema.index(
  { employeeId: 1 },
  { unique: true, partialFilterExpression: { employeeId: { $type: 'string' } } }
);

module.exports = mongoose.model('Application', applicationSchema);

