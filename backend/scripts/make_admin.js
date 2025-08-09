// Usage: node make_admin.js <email>

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;
console.log('MONGO_URI:', MONGO_URI);
const email = process.argv[2];

if (!email) {
  console.error('Usage: node make_admin.js <email>');
  process.exit(1);
}

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found:', email);
      process.exit(1);
    }
    user.role = 'admin';
    await user.save();
    console.log('User updated to admin:', email);
    process.exit(0);
  })
  .catch(err => {
    console.error('DB error:', err);
    process.exit(1);
  });
