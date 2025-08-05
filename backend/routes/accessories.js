const express = require('express');
const router = express.Router();
const Accessory = require('../models/Accessory');

// Get all accessories
router.get('/', async (req, res) => {
  const accessories = await Accessory.find();
  res.json(accessories);
});

// Get single accessory
router.get('/:id', async (req, res) => {
  console.log('Accessory details requested for ID:', req.params.id);
  const accessory = await Accessory.findById(req.params.id);
  if (!accessory) {
    console.log('Accessory not found for ID:', req.params.id);
    return res.status(404).json({ error: 'Accessory not found' });
  }
  // Calculate average rating and count
  const ratings = accessory.ratings || [];
  const ratingCount = ratings.length;
  const avgRating = ratingCount ? (ratings.reduce((sum, r) => sum + r.value, 0) / ratingCount).toFixed(2) : null;
  res.json({ ...accessory.toObject(), avgRating, ratingCount });
});

// Add accessory
// Add accessory
router.post('/', async (req, res) => {
  try {
    // Log request URL and body for debugging
    console.log('POST /api/accessories');
    console.log('Request body:', req.body);

    // Basic validation: check required fields (description can be empty)
    const requiredFields = ['name', 'price', 'image', 'category', 'brand', 'color', 'inStock', 'stock'];
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === '') {
        console.log(`Missing required field: ${field}`);
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    const newAccessory = new Accessory(req.body);
    await newAccessory.save();
    res.status(201).json(newAccessory);
  } catch (err) {
    console.log('Error adding accessory:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update accessory
router.put('/:id', async (req, res) => {
  const updated = await Accessory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Delete accessory
router.delete('/:id', async (req, res) => {
  await Accessory.findByIdAndDelete(req.params.id);
  res.json({ message: 'Accessory deleted' });
});

// Add rating to accessory
router.post('/:id/rate', async (req, res) => {
  const { user, value } = req.body;
  if (!user || typeof value !== 'number') return res.status(400).json({ error: 'User and value required' });
  const accessory = await Accessory.findById(req.params.id);
  if (!accessory) return res.status(404).json({ error: 'Accessory not found' });
  accessory.ratings = accessory.ratings || [];
  // Optionally: prevent duplicate ratings by same user
  const existing = accessory.ratings.find(r => r.user === user);
  if (existing) return res.status(400).json({ error: 'User already rated' });
  accessory.ratings.push({ user, value });
  await accessory.save();
  res.json({ message: 'Rating added', ratings: accessory.ratings });
});

module.exports = router;
