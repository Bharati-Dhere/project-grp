const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  images: [String],
  category: String,
  brand: String,
  color: String,
  ratings: [{ user: String, value: Number }], // Array of user ratings
  inStock: Boolean,
  stock: Number,
  isOffer: Boolean,
  isBestSeller: Boolean,
  badge: String,
  description: String
});

module.exports = mongoose.model('Product', productSchema);
