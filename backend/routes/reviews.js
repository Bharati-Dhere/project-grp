
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Accessory = require('../models/Accessory');

// Add a review to a product or accessory
router.post('/', async (req, res) => {
  try {
    const { type, productId, accessoryId, name, rating, description, userName, userEmail, date } = req.body;
    let model, idField, idValue;
    if (type === 'Product' && productId) {
      model = Product;
      idField = '_id';
      idValue = productId;
    } else if (type === 'Accessory' && accessoryId) {
      model = Accessory;
      idField = '_id';
      idValue = accessoryId;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid type or id' });
    }
    const review = {
      user: userEmail || 'Anonymous',
      value: rating,
      review: description,
      name: userName || name || 'User',
      createdAt: date ? new Date(date) : new Date(),
    };
    const doc = await model.findByIdAndUpdate(
      idValue,
      { $push: { reviews: review } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all reviews for all products and accessories
router.get('/', async (req, res) => {
  try {
    // Get all product reviews
    const products = await Product.find({}, 'name reviews');
    const accessories = await Accessory.find({}, 'name reviews');
    const productReviews = products.flatMap(p => (p.reviews || []).map(r => ({
      type: 'Product',
      productId: p._id,
      name: p.name,
      ...r
    })));
    const accessoryReviews = accessories.flatMap(a => (a.reviews || []).map(r => ({
      type: 'Accessory',
      accessoryId: a._id,
      name: a.name,
      ...r
    })));
    res.json({ success: true, data: [...productReviews, ...accessoryReviews] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
