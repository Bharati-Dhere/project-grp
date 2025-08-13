// Script to sync Clerk user to MongoDB and add test products to wishlist
// Usage: node scripts/sync_clerk_and_wishlist.js <clerkId> <email> <name> <productId> <model>

const mongoose = require('mongoose');
const User = require('../backend/models/User');
const Product = require('../backend/models/Product');
const Accessory = require('../backend/models/Accessory');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mobile-store';

async function main() {
  const [,, clerkId, email, name, productId, model] = process.argv;
  if (!clerkId || !email || !name || !productId || !model) {
    console.log('Usage: node scripts/sync_clerk_and_wishlist.js <clerkId> <email> <name> <productId> <model>');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, name, externalId: clerkId });
    console.log('Created new user:', user);
  } else {
    user.externalId = clerkId;
    user.name = name;
    await user.save();
    console.log('Updated user:', user);
  }
  // Add product to wishlist if not present
  if (!user.wishlist.some(w => w.item.toString() === productId && w.model === model)) {
    user.wishlist.push({ item: productId, model });
    await user.save();
    console.log('Added product to wishlist:', productId, model);
  } else {
    console.log('Product already in wishlist');
  }
  mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
