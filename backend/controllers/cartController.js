// Remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const initialLength = user.cart.length;
    user.cart = user.cart.filter(item => !item.product.equals(productId));
    if (user.cart.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Product not found in cart' });
    }
    await user.save();
    res.json({ success: true, message: 'Removed from cart', data: user.cart });
  } catch (err) {
    console.error('Error in removeFromCart:', err);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

const Product = require('../models/Product');
const Accessory = require('../models/Accessory');
const User = require('../models/User');

exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    console.log('addToCart called, user:', req.user && req.user.email, 'userId:', req.user && req.user._id, 'productId:', productId);
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });

    // Try to find in Product or Accessory
    let product = await Product.findById(productId);
    if (!product) {
      product = await Accessory.findById(productId);
      if (!product) return res.status(404).json({ success: false, message: 'Product/Accessory not found' });
    }

    const user = req.user;
    if (!user) {
      console.log('No user found in addToCart');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const cartItem = user.cart.find(item => item.product.equals(productId));
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      user.cart.push({ product: productId, quantity: 1 });
    }
    await user.save();
    res.json({ success: true, message: 'Added to cart', data: user.cart });
  } catch (err) {
    console.error('Error in addToCart:', err);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('cart.product');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // Flatten product fields and add quantity at top level
    const cart = user.cart.map(item => {
      const product = item.product && item.product.toObject ? item.product.toObject() : item.product;
      return {
        ...product,
        quantity: item.quantity,
      };
    });
    res.json({ success: true, message: 'Cart fetched', data: cart });
  } catch (err) {
    console.error('Error in getCart:', err);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};
