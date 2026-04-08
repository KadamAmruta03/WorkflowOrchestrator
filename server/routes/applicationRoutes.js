const express = require('express');
const router = express.Router();

const asyncHandler = require('../middleware/asyncHandler');
const applicationsController = require('../controllers/applicationsController');

router.get('/', asyncHandler(applicationsController.list));
router.post('/', asyncHandler(applicationsController.create));
router.patch('/:id', asyncHandler(applicationsController.update));
router.post('/:id/approve', asyncHandler(applicationsController.approve));

module.exports = router;

