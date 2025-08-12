// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });
    const user = req.user;
    const index = user.wishlist.findIndex(id => id.toString() === productId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Item not in wishlist' });
    }
    user.wishlist.splice(index, 1);
    await user.save();
    res.json({ success: true, message: 'Removed from wishlist', data: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

const Product = require('../models/Product');
const Accessory = require('../models/Accessory');
const User = require('../models/User');

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    console.log('addToWishlist called, user:', req.user && req.user.email, 'userId:', req.user && req.user._id, 'productId:', productId);
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });

    // Try to find in Product or Accessory
    let product = await Product.findById(productId);
    if (!product) {
      product = await Accessory.findById(productId);
      if (!product) return res.status(404).json({ success: false, message: 'Product/Accessory not found' });
    }

    const user = req.user;
    if (!user) {
      console.log('No user found in addToWishlist');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (user.wishlist.includes(productId)) {
      return res.json({ success: true, message: 'Already in wishlist', data: user.wishlist });
    }
    user.wishlist.push(productId);
    await user.save();
    res.json({ success: true, message: 'Added to wishlist', data: user.wishlist });
  } catch (err) {
    console.error('Error in addToWishlist:', err);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('wishlist');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Wishlist fetched', data: user.wishlist });
  } catch {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};
