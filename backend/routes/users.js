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

module.exports = router;
