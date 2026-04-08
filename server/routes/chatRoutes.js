const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const chatController = require('../controllers/chatController');

// Group chat: GET messages
router.get('/group', asyncHandler(chatController.groupList));

// Group chat: POST message
router.post('/group', asyncHandler(chatController.groupPost));

// Direct chat: GET messages between two users (query: userId=me)
router.get('/direct/:otherUserId', asyncHandler(chatController.directList));

// Direct chat: POST message
router.post('/direct', asyncHandler(chatController.directPost));

module.exports = router;
