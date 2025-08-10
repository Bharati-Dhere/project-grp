const Feedback = require('../models/Feedback');
const User = require('../models/User');

module.exports = {
  // Create feedback/contact
  createFeedback: async (req, res) => {
    try {
      const { name, email, subject, message, isContactForm } = req.body;
      let isRegistered = false;
      if (email) {
        const user = await User.findOne({ email });
        isRegistered = !!user;
      }
      const feedback = await Feedback.create({
        name,
        email,
        subject,
        message,
        isContactForm: !!isContactForm,
        isRegistered,
        date: new Date()
      });
      res.json({ success: true, message: 'Feedback submitted', data: feedback });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },
  // Get all feedback/contact
  getAllFeedback: async (req, res) => {
    try {
      const feedbacks = await Feedback.find().sort({ date: -1 });
      res.json({ success: true, message: 'Feedbacks fetched', data: feedbacks });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },
  // Delete feedback/contact by id
  deleteFeedback: async (req, res) => {
    try {
      await Feedback.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Feedback deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  }
};
