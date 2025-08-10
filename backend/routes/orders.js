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

const orderController = require('../controllers/orderController');

// Get orders
router.get('/', auth, orderController.getAllOrders);

// Place order
router.post('/', auth, orderController.placeOrder);

module.exports = router;
