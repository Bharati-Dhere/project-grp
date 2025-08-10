const Product = require('../models/Product');
const User = require('../models/User');

exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const user = req.user;
    const cartItem = user.cart.find(item => item.productId.equals(productId));
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      user.cart.push({ productId, quantity: 1 });
    }
    await user.save();
    res.json({ success: true, message: 'Added to cart', data: user.cart });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('cart.productId');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const cart = user.cart.map(item => ({
      product: item.productId,
      quantity: item.quantity,
    }));
    res.json({ success: true, message: 'Cart fetched', data: cart });
  } catch {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};
