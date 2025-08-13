const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Get user by email (for Clerk sync, not for general use)
router.get('/by-email/:email', userController.getUserByEmail);
// Get user by Clerk externalId
router.get('/by-external-id/:externalId', userController.getUserByExternalId);
// Get user by ID
router.get('/:id', auth, userController.getUserById);
// Update user by ID
router.put('/:id', auth, userController.updateUser);
// Get all users
router.get('/', auth, userController.getAllUsers);
// Sync Clerk user to backend DB (upsert)
router.post('/', userController.syncClerkUser);
const profileImageRoutes = require('./profileImage');
router.use(profileImageRoutes);

module.exports = router;
