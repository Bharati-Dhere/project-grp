const Product = require('../models/Product');
const User = require('../models/User');

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const user = req.user;
    if (user.wishlist.includes(productId)) {
      return res.json({ success: true, message: 'Already in wishlist', data: user.wishlist });
    }
    user.wishlist.push(productId);
    await user.save();
    res.json({ success: true, message: 'Added to wishlist', data: user.wishlist });
  } catch (err) {
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
