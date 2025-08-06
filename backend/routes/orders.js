const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
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

// Get orders
router.get('/', auth, async (req, res) => {
  const orders = await Order.find({ user: req.userId }).populate('items.product');
  res.json(orders);
});

// Place order
router.post('/', auth, async (req, res) => {
  const { items, total, address, paymentInfo } = req.body;
  const order = await Order.create({ user: req.userId, items, total, address, paymentInfo });
  // Add order to user's orders array
  await User.findByIdAndUpdate(req.userId, { $push: { orders: order._id } });
  res.status(201).json(order);
});

module.exports = router;
