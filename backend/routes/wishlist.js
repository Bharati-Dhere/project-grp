
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const wishlistController = require('../controllers/wishlistController');

// Remove from wishlist (POST /wishlist/remove)
router.post('/remove', auth, wishlistController.removeFromWishlist);

// Add to wishlist (POST /wishlist/add)
router.post('/add', auth, wishlistController.addToWishlist);

// Get wishlist (GET /wishlist/:userId)
router.get('/:userId', wishlistController.getWishlist);

module.exports = router;
