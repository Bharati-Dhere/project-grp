const express = require('express');
const router = express.Router();
const accessoryController = require('../controllers/accessoryController');

// Get all accessories
router.get('/', accessoryController.getAllAccessories);

// Get single accessory
router.get('/:id', accessoryController.getAccessoryById);

// Add accessory
router.post('/', accessoryController.addAccessory);

// Update accessory
router.put('/:id', accessoryController.updateAccessory);

// Delete accessory
router.delete('/:id', accessoryController.deleteAccessory);

// Add rating and review to accessory
router.post('/:id/rate', accessoryController.rateAccessory);

module.exports = router;
