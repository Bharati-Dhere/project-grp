// Script to clean up all users' carts by removing invalid entries (missing product or model)
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = 'mongodb+srv://bharati-dhere:bharati123@cluster0.ehjfhm3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // <-- CHANGE THIS TO YOUR DB

async function cleanCarts() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const users = await User.find({});
  let fixed = 0;
  for (const user of users) {
    const originalLength = user.cart.length;
    user.cart = (user.cart || []).filter(c => c && c.product && c.model);
    if (user.cart.length !== originalLength) {
      await user.save();
      fixed++;
      console.log(`Fixed cart for user: ${user.email}`);
    }
  }
  console.log(`Done. Fixed ${fixed} users.`);
  await mongoose.disconnect();
}

cleanCarts().catch(err => {
  console.error('Error cleaning carts:', err);
  process.exit(1);
});
