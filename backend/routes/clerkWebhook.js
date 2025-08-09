const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Clerk webhook for password update
router.post('/', async (req, res) => {
  try {
    const { data } = req.body;
    const email = data?.email_addresses?.[0]?.email_address;
    if (!email) return res.status(400).json({ message: 'Email not found in webhook' });

    // Mark user as having password set (do not store password, Clerk does not send it)
    let user = await User.findOne({ email });
    if (user) {
      user.hasPassword = true; // Add this field to your User model if needed
      await user.save();
      return res.json({ message: 'User password status updated in backend' });
    }
    res.status(404).json({ message: 'User not found in backend' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

module.exports = router;
