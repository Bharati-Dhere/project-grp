const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// No OTP store needed; Firebase handles OTP

// Send OTP
router.post('/send-otp', async (req, res) => {
  // No longer needed; handled by Firebase on frontend
  res.status(400).json({ message: 'Use Firebase Phone Auth on frontend.' });
});

// Verify OTP and login
router.post('/verify-otp', async (req, res) => {
  const { mobile, idToken } = req.body;
  if (!mobile || !idToken) return res.status(400).json({ message: 'Mobile and Firebase ID token required' });
  // Verify Firebase ID token
  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (!decodedToken.phone_number || !decodedToken.phone_number.endsWith(mobile)) {
      return res.status(400).json({ message: 'Mobile number mismatch' });
    }
    let user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Login: create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ user });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid Firebase ID token' });
  }
});

module.exports = router;
