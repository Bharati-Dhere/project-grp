const mongoose = require('mongoose');

const userReviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  text: { type: String, required: true },
  rating: { type: Number, required: true },
  avatar: { type: String }, // optional, for future use
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserReview', userReviewSchema);
