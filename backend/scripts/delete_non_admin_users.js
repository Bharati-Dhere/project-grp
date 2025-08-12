// Script to delete all users except those with email-verified status (and not admin)
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = 'mongodb+srv://bharati-dhere:bharati123@cluster0.ehjfhm3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // <-- CHANGE THIS TO YOUR DB

async function deleteNonEmailUsers() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  // Find all users except admin (role !== 'admin')
  const users = await User.find({ role: { $ne: 'admin' } });
  let deleted = 0;
  for (const user of users) {
    // If user is not admin, delete
    await User.deleteOne({ _id: user._id });
    deleted++;
    console.log(`Deleted user: ${user.email}`);
  }
  console.log(`Done. Deleted ${deleted} users (all except admin).`);
  await mongoose.disconnect();
}

deleteNonEmailUsers().catch(err => {
  console.error('Error deleting users:', err);
  process.exit(1);
});
