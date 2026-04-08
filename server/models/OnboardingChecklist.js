const mongoose = require('mongoose');

const OnboardingChecklistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        category: { type: String, default: 'Week 1' },
        completedAt: { type: Date, default: null }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('OnboardingChecklist', OnboardingChecklistSchema);

