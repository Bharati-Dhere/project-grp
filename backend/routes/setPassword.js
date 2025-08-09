const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

router.post('/', async (req, res) => {
  const { email, password, verified } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  if (!verified) {
    return res.status(400).json({ message: 'Email must be verified before resetting the password.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found with this email.' });

  user.password = await bcrypt.hash(password, 10);
  user.hasPassword = true;
  await user.save();

    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Password update error:', err);
    return res.status(500).json({ message: 'Failed to update password. Please try again later.' });
  }

});

module.exports = router;
