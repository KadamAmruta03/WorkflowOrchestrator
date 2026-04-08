const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    type: { 
      type: String, 
      enum: [
        'Vacation', 
        'Sick Leave', 
        'Remote', 
        'Maternity', 
        'Paternity', 
        'Bereavement', 
        'Personal Leave',
        'Public Holiday'
      ], 
      default: 'Vacation' 
    },
    startDate: { type: Date, required: true }, // Required field
    days: { type: Number, required: true },
    reason: { type: String }, 
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    }
  }, { timestamps: true });

module.exports = mongoose.model('Leave', LeaveSchema);
