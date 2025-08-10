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
  reviews: [{ user: String, value: Number, review: String, createdAt: { type: Date, default: Date.now } }], // Array of user reviews (with text)
  inStock: Boolean,
  stock: Number,
  isOffer: Boolean,
  isBestSeller: Boolean,
  badge: String,
  description: String,
  offerPrice: Number,
  discountPercent: Number,
  freeDelivery: Boolean,
  deliveryPrice: Number,
  size: String,
  tags: String
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
