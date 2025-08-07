// Usage: node backend/scripts/makeAdmin.js <email>
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const email = process.argv[2];
if (!email) {
  console.error('Usage: node makeAdmin.js <email>');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (user) {
      console.log(`User ${email} is now an admin.`);
    } else {
      console.log(`User with email ${email} not found.`);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
