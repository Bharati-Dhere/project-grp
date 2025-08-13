const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  externalId: { type: String, unique: true, sparse: true }, // Clerk user id
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
  password: { type: String }, // optional for Google/Clerk users
  hasPassword: { type: Boolean, default: false }, // set by Clerk webhook
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'cart.model'
    },
    model: {
      type: String,
      enum: ['Product', 'Accessory'],
      required: true
    },
    quantity: { type: Number, default: 1 }
  }],
  wishlist: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'wishlist.model'
    },
    model: {
      type: String,
      enum: ['Product', 'Accessory'],
      required: true
    }
  }],
  profile: {
    name: { type: String },
    age: { type: Number },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    gender: { type: String },
    avatar: { type: String },
    notifications: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
