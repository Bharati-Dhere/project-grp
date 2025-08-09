const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const admin = require('firebase-admin');

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, mobile, idToken } = req.body;
    if (!mobile || typeof mobile !== 'string' || !mobile.trim()) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }
    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token required for mobile verification' });
    }
    // Verify Firebase ID token
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid Firebase ID token' });
    }
    if (!decodedToken.phone_number || !decodedToken.phone_number.endsWith(mobile)) {
      return res.status(400).json({ message: 'Mobile number mismatch or not verified' });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'Email already exists' });
    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) return res.status(400).json({ message: 'Mobile number already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, mobile });
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// Google Login
router.post('/google-login', async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = await admin.auth().verifyIdToken(token);
    let user = await User.findOne({ email: decoded.email });
    if (!user) {
      user = await User.create({
        email: decoded.email,
        name: decoded.name || decoded.email,
      });
    }
    // Optionally set a session/cookie here
    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    console.error('Google login backend error:', err);
    res.status(401).json({ message: 'Invalid Google token or server error' });
  }
});

module.exports = router;
