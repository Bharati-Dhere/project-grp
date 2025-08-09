const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Change password with current password verification
router.post('/', async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  if (!email || !currentPassword || !newPassword) return res.status(400).json({ message: 'All fields required' });
  const user = await User.findOne({ email });
  if (!user || !user.password) return res.status(404).json({ message: 'User not found or no password set' });
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return res.status(400).json({ message: 'Current password incorrect' });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password updated successfully' });
});

module.exports = router;
