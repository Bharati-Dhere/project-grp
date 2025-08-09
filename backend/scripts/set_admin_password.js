// Usage: node backend/scripts/set_admin_password.js <email> <newPassword>
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('Usage: node set_admin_password.js <email> <newPassword>');
  process.exit(1);
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email });
  if (!user) {
    console.error('User not found:', email);
    process.exit(1);
  }
  user.role = 'admin';
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  console.log('Admin password updated for:', email);
  mongoose.disconnect();
}

run();
