const mongoose = require('mongoose');

const accessorySchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  images: [String],
  category: String,
  brand: String,
  color: String,
  rating: Number,
  inStock: Boolean,
  stock: Number,
  isOffer: Boolean,
  isBestSeller: Boolean,
  badge: String,
  description: String
});

module.exports = mongoose.model('Accessory', accessorySchema);
