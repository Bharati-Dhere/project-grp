const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const router = express.Router();
const jwt = require('jsonwebtoken');

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

// Get wishlist
router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.userId).populate('wishlist');
  res.json(user.wishlist);
});

// Update wishlist
router.put('/', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  user.wishlist = req.body.wishlist;
  await user.save();
  res.json(user.wishlist);
});

module.exports = router;
