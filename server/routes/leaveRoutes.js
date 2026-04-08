const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const leavesController = require('../controllers/leavesController');

// @route   POST api/leaves
router.post('/', asyncHandler(leavesController.create));

// @route   GET api/leaves
router.get('/', asyncHandler(leavesController.list));

// @route   PATCH api/leaves/:id (Admin approve/reject)
router.patch('/:id', asyncHandler(leavesController.decide));

module.exports = router;
