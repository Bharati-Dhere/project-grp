const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to check auth
function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Get user profile
router.get('/:id', auth, async (req, res) => {
  if (req.userId !== req.params.id) return res.status(403).json({ message: 'Forbidden' });
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// Update user profile
router.put('/:id', auth, async (req, res) => {
  if (req.userId !== req.params.id) return res.status(403).json({ message: 'Forbidden' });
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  res.json(user);
});

// Get all users (for account switching, admin only)
// Get all users (for admin dashboard/customer page)
router.get('/', auth, async (req, res) => {
  const adminUser = await User.findById(req.userId);
  if (!adminUser || adminUser.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  const users = await User.find().select('-password');
  res.json(users);
});

// Sync Clerk user to backend DB (upsert)
router.post('/', async (req, res) => {
  try {
    const { email, name, role, password } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const bcrypt = require('bcryptjs');

    let user = await User.findOne({ email });
    if (user) {
      user.name = name || user.name;
      user.role = role || user.role;
      if (password) {
        user.password = await bcrypt.hash(password, 10);
        user.hasPassword = true;
      }
      await user.save();
      console.log('User updated:', user.email);
    } else {
      let hashedPassword = password ? await bcrypt.hash(password, 10) : null;
      let hasPassword = !!password;
      user = await User.create({ email, name, role: role || 'user', password: hashedPassword, hasPassword });
      console.log('User created:', user.email);
    }
    res.json(user);
  } catch (err) {
    console.error('Error syncing Clerk user:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

module.exports = router;
