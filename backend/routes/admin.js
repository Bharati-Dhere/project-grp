const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to check admin
function adminAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.id;
    User.findById(req.userId).then(user => {
      if (user && user.role === 'admin') {
        next();
      } else {
        res.status(403).json({ message: 'Admin access required' });
      }
    });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Get all orders
router.get('/orders', adminAuth, async (req, res) => {
  const orders = await Order.find().populate('user').populate('items.product');
  res.json(orders);
});

// Get all products
router.get('/products', adminAuth, async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Delete a user
router.delete('/users/:id', adminAuth, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

// Delete an order
router.delete('/orders/:id', adminAuth, async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: 'Order deleted' });
});

module.exports = router;
