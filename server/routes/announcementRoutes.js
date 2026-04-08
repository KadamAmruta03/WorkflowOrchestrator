const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const announcementsController = require('../controllers/announcementsController');

// GET: list announcements (latest first)
router.get('/', asyncHandler(announcementsController.list));

// POST: create announcement (admin UI uses this; no auth enforced in this project)
router.post('/', asyncHandler(announcementsController.create));

module.exports = router;
