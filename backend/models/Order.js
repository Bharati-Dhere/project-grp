const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, required: true }, // Can reference Product or Accessory
      productType: { type: String, enum: ['Product', 'Accessory'], required: true },
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true }
    }
  ],
  total: { type: Number, required: true },
  status: { type: String, default: 'Processing' },
  deliveryDate: { type: Date },
  address: { type: String },
  paymentInfo: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
