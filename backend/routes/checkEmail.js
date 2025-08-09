const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Check if email exists in backend
router.post('/', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });
  const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
  if (user) return res.json({ exists: true });
  res.json({ exists: false });
});

module.exports = router;
