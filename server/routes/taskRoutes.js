const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const tasksController = require('../controllers/tasksController');

// CREATE: Assign New Task (Burnout Guard)
router.post('/assign-new', asyncHandler(tasksController.assignNew));

// READ: Get All Tasks
router.get('/', asyncHandler(tasksController.list));

// GET: Leaderboard
router.get('/leaderboard', asyncHandler(tasksController.leaderboard));

// UPDATE: Change Task Status or Priority
router.put('/:id', asyncHandler(tasksController.update));

// DELETE: Remove Task
router.delete('/:id', asyncHandler(tasksController.remove));

module.exports = router;
