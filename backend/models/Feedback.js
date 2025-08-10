const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  subject: { type: String },
  message: { type: String, required: true },
  isContactForm: { type: Boolean, default: false },
  isRegistered: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
