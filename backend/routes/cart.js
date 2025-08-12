const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const cartController = require('../controllers/cartController');

// Remove from cart (POST /cart/remove)
router.post('/remove', auth, cartController.removeFromCart);
// Add to cart (POST /cart/add)
router.post('/add', auth, cartController.addToCart);
// Get cart (GET /cart/:userId)
router.get('/:userId', auth, cartController.getCart);

module.exports = router;
