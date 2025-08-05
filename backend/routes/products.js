const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Get single product
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  // Calculate average rating and count
  const ratings = product.ratings || [];
  const ratingCount = ratings.length;
  const avgRating = ratingCount ? (ratings.reduce((sum, r) => sum + r.value, 0) / ratingCount).toFixed(2) : null;
  res.json({ ...product.toObject(), avgRating, ratingCount });
});

// Add product
router.post('/', async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.status(201).json(newProduct);
});

// Update product
router.put('/:id', async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Delete product
router.delete('/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
});

// Add rating to product
router.post('/:id/rate', async (req, res) => {
  const { user, value } = req.body;
  if (!user || typeof value !== 'number') return res.status(400).json({ error: 'User and value required' });
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  product.ratings = product.ratings || [];
  // Optionally: prevent duplicate ratings by same user
  const existing = product.ratings.find(r => r.user === user);
  if (existing) return res.status(400).json({ error: 'User already rated' });
  product.ratings.push({ user, value });
  await product.save();
  res.json({ message: 'Rating added', ratings: product.ratings });
});

module.exports = router;
