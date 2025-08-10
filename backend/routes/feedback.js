const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const auth = require('../middleware/auth');

// Public: Create feedback/contact
router.post('/', feedbackController.createFeedback);
// Admin: Get all feedback/contact
router.get('/', auth, feedbackController.getAllFeedback);
// Admin: Delete feedback/contact by id
router.delete('/:id', auth, feedbackController.deleteFeedback);

module.exports = router;
