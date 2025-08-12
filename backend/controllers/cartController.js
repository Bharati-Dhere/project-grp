// Remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { product, model } = req.body;
    if (!product || !model) return res.status(400).json({ success: false, message: 'Product ID and model required' });
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    console.log('removeFromCart called with:', { product, model });
    console.log('User cart before:', JSON.stringify(user.cart));
    const initialLength = user.cart.length;
    user.cart = user.cart.filter(item => {
      const match = item.product.equals(product) && item.model === model;
      if (match) console.log('Removing cart item:', item);
      return !match;
    });
    if (user.cart.length === initialLength) {
      console.log('No matching item found to remove.');
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
    await user.save();
    console.log('User cart after:', JSON.stringify(user.cart));
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
    const { productId, model } = req.body;
    console.log('addToCart called, user:', req.user && req.user.email, 'userId:', req.user && req.user._id, 'productId:', productId, 'model:', model);
    if (!productId || !model) return res.status(400).json({ success: false, message: 'Product ID and model required' });

    // Validate model and existence
    let product = null;
    if (model === 'Product') {
      product = await Product.findById(productId);
    } else if (model === 'Accessory') {
      product = await Accessory.findById(productId);
    }
    if (!product) return res.status(404).json({ success: false, message: 'Product/Accessory not found' });

    const user = req.user;
    if (!user) {
      console.log('No user found in addToCart');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const cartItem = user.cart.find(item => item.product.equals(productId) && item.model === model);
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      user.cart.push({ product: productId, model, quantity: 1 });
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
    const user = await User.findById(req.params.userId).populate('cart.product'); // refPath used in schema
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // Return populated cart items as flat array
    const cart = user.cart.map(item => {
      const product = item.product && item.product.toObject ? item.product.toObject() : item.product;
      return {
        ...product,
        _cartModel: item.model,
        quantity: item.quantity,
      };
    });
    res.json({ success: true, message: 'Cart fetched', data: cart });
  } catch (err) {
    console.error('Error in getCart:', err);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};
