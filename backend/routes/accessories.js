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
  const accessory = await Accessory.findById(req.params.id);
  res.json(accessory);
});

// Add accessory
router.post('/', async (req, res) => {
  const newAccessory = new Accessory(req.body);
  await newAccessory.save();
  res.status(201).json(newAccessory);
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

module.exports = router;
