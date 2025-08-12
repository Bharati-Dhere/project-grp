// Script to clean up all users' wishlists by removing invalid entries (missing item or model)
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = 'mongodb+srv://bharati-dhere:bharati123@cluster0.ehjfhm3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // <-- CHANGE THIS TO YOUR DB

async function cleanWishlists() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const users = await User.find({});
  let fixed = 0;
  for (const user of users) {
    const originalLength = user.wishlist.length;
    user.wishlist = (user.wishlist || []).filter(w => w && w.item && w.model);
    if (user.wishlist.length !== originalLength) {
      await user.save();
      fixed++;
      console.log(`Fixed wishlist for user: ${user.email}`);
    }
  }
  console.log(`Done. Fixed ${fixed} users.`);
  await mongoose.disconnect();
}

cleanWishlists().catch(err => {
  console.error('Error cleaning wishlists:', err);
  process.exit(1);
});
