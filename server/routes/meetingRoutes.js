const express = require('express');
const router = express.Router();

const asyncHandler = require('../middleware/asyncHandler');
const meetingsController = require('../controllers/meetingsController');

router.get('/', asyncHandler(meetingsController.list));
router.post('/', asyncHandler(meetingsController.create));
router.delete('/:id', asyncHandler(meetingsController.remove));

module.exports = router;

