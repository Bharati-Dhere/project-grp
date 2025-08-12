// Script to fix missing productId and name in delivered order items
// Usage: node scripts/fix_order_items.js

const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Accessory = require('../models/Accessory');

const MONGO_URI = 'mongodb+srv://bharati-dhere:bharati123@cluster0.ehjfhm3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
async function fixOrderItems() {
  await mongoose.connect(MONGO_URI);
  const orders = await Order.find({ status: 'Delivered' });
  let updatedCount = 0;
  for (const order of orders) {
    let changed = false;
    for (const item of order.items) {
      // Try to find product or accessory by price (fallback), or update logic as needed
      if (!item.product || !item.name || !item.productType) {
        let prod = await Product.findOne({ price: item.price });
        let acc = await Accessory.findOne({ price: item.price });
        if (prod) {
          item.product = prod._id;
          item.name = prod.name;
          item.productType = 'Product';
        } else if (acc) {
          item.product = acc._id;
          item.name = acc.name;
          item.productType = 'Accessory';
        }
        changed = true;
      }
    }
    if (changed) {
      await order.save();
      updatedCount++;
      console.log(`Fixed order ${order._id}`);
    }
  }
  console.log(`Done. Updated ${updatedCount} orders.`);
  mongoose.disconnect();
}

fixOrderItems().catch(console.error);
