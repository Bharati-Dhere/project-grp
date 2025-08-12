const mongoose = require('mongoose');


const accessorySchema = new mongoose.Schema({
  name: { type: String, default: "" },
  price: { type: Number, default: 0 },
  image: { type: String, default: "" },
  images: { type: [String], default: [] },
  category: { type: String, default: "" },
  brand: { type: String, default: "" },
  color: { type: String, default: "" },
  ratings: { type: [{ user: String, value: Number }], default: [] },
  reviews: { type: [{ user: String, value: Number, review: String, avatar: { type: String, default: '' }, createdAt: { type: Date, default: Date.now } }], default: [] },
  inStock: { type: Boolean, default: false },
  stock: { type: Number, default: 0 },
  isOffer: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  badge: { type: String, default: "" },
  description: { type: String, default: "" },
  offerPrice: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  freeDelivery: { type: Boolean, default: false },
  deliveryPrice: { type: Number, default: 0 },
  size: { type: String, default: "" },
  tags: { type: String, default: "" }
});

module.exports = mongoose.model('Accessory', accessorySchema);
