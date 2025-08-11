// Script to fix existing delivered orders: set productType and ensure product references Accessory if needed
// Usage: node scripts/fix_order_accessory_items.js

const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Accessory = require('../models/Accessory');

const MONGO_URI = 'mongodb+srv://bharati-dhere:bharati123@cluster0.ehjfhm3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function fixAccessoryOrderItems() {
  await mongoose.connect(MONGO_URI);
  const orders = await Order.find({ status: 'Delivered' });
  let updatedCount = 0;
  for (const order of orders) {
    let changed = false;
    for (const item of order.items) {
      // If productType is missing, try to detect if it's a Product or Accessory
      if (!item.productType) {
        let prod = await Product.findById(item.product);
        let acc = await Accessory.findById(item.product);
        if (prod) {
          item.productType = 'Product';
        } else if (acc) {
          item.productType = 'Accessory';
        } else {
          // Try to match by price and name if product field is not set
          if (!item.product) {
            acc = await Accessory.findOne({ price: item.price, name: item.name });
            prod = await Product.findOne({ price: item.price, name: item.name });
            if (acc) {
              item.product = acc._id;
              item.productType = 'Accessory';
            } else if (prod) {
              item.product = prod._id;
              item.productType = 'Product';
            }
          }
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

fixAccessoryOrderItems().catch(console.error);
