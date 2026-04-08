const express = require('express');
const router = express.Router();
const OnboardingChecklist = require('../models/OnboardingChecklist');

const defaultTemplate = () => [
  {
    title: 'Welcome + Company Tour',
    description: 'Read the welcome note, find HR policies, and locate key documents.',
    category: 'Day 1'
  },
  {
    title: 'Set up Accounts & Tools',
    description: 'Email, Git, project access, and required software installation.',
    category: 'Day 1'
  },
  {
    title: 'Meet Your Manager',
    description: '15-min intro: expectations, current priorities, and first-week goals.',
    category: 'Day 1'
  },
  {
    title: 'Meet Your Team',
    description: 'Quick introductions and who to ask for what.',
    category: 'Week 1'
  },
  {
    title: 'Read Project Context',
    description: 'Review docs, architecture notes, and the task workflow.',
    category: 'Week 1'
  },
  {
    title: 'Complete First Task',
    description: 'Pick a small starter task and move it to Completed.',
    category: 'Week 1'
  }
];

// GET or auto-create checklist for a user
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    let doc = await OnboardingChecklist.findOne({ userId });
    if (!doc) {
      doc = await OnboardingChecklist.create({
        userId,
        items: defaultTemplate().map((t) => ({ ...t, completedAt: null }))
      });
    }
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch onboarding checklist.', error: err.message });
  }
});

// PATCH: mark an item complete/incomplete
router.patch('/:userId/items/:itemId', async (req, res) => {
  try {
    const { completed } = req.body || {};
    const doc = await OnboardingChecklist.findOne({ userId: req.params.userId });
    if (!doc) return res.status(404).json({ message: 'Checklist not found.' });

    const item = doc.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    item.completedAt = completed ? new Date() : null;
    await doc.save();

    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update checklist item.', error: err.message });
  }
});

module.exports = router;

