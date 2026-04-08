const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema(
  {
    scope: { type: String, enum: ['group', 'direct'], required: true },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // only for direct
    text: { type: String, required: true }
  },
  { timestamps: true }
);

ChatMessageSchema.index({ scope: 1, createdAt: -1 });
ChatMessageSchema.index({ scope: 1, fromUserId: 1, toUserId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);

