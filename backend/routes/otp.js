const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// In-memory OTP store (for demo; use Redis or DB for production)
const otpStore = {};

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ message: 'Mobile number required' });
  const user = await User.findOne({ mobile });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[mobile] = otp;
  // TODO: Integrate SMS provider here
  console.log(`OTP for ${mobile}: ${otp}`);
  res.json({ message: 'OTP sent', otp }); // For demo, return OTP
});

// Verify OTP and login
router.post('/verify-otp', async (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) return res.status(400).json({ message: 'Mobile and OTP required' });
  if (otpStore[mobile] !== otp) return res.status(400).json({ message: 'Invalid OTP' });
  const user = await User.findOne({ mobile });
  if (!user) return res.status(404).json({ message: 'User not found' });
  // Login: create JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
  delete otpStore[mobile];
  res.json({ user });
});

module.exports = router;
