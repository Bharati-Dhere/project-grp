const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, message: 'Products fetched', data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

exports.getLatestOffers = async (req, res) => {
  try {
    const products = await Product.find({ isOffer: true }).sort({ updatedAt: -1 }).limit(10);
    res.json({ success: true, message: 'Latest offers fetched', data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

exports.getLatestBestSellers = async (req, res) => {
  try {
    const products = await Product.find({ isBestSeller: true }).sort({ updatedAt: -1 }).limit(10);
    res.json({ success: true, message: 'Latest best sellers fetched', data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const reviews = product.reviews || [];
    const ratings = product.ratings || [];
    const allRatings = reviews.length > 0 ? reviews : ratings;
    const ratingCount = allRatings.length;
    const avgRating = ratingCount ? (allRatings.reduce((sum, r) => sum + r.value, 0) / ratingCount).toFixed(2) : null;
    res.json({ ...product.toObject(), avgRating, ratingCount, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const newProduct = new Product({
      ...req.body,
      price: Number(req.body.price),
      offerPrice: req.body.isOffer ? Number(req.body.offerPrice) : undefined,
      discountPercent: req.body.isOffer ? Number(req.body.discountPercent) : undefined,
      freeDelivery: !!req.body.freeDelivery,
      deliveryPrice: req.body.freeDelivery ? 0 : Number(req.body.deliveryPrice),
      inStock: !!req.body.inStock,
      stock: Number(req.body.stock),
      isOffer: !!req.body.isOffer,
      isBestSeller: !!req.body.isBestSeller
    });
    await newProduct.save();
    res.status(201).json({ success: true, message: 'Product created', data: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      price: Number(req.body.price),
      offerPrice: req.body.isOffer ? Number(req.body.offerPrice) : undefined,
      discountPercent: req.body.isOffer ? Number(req.body.discountPercent) : undefined,
      freeDelivery: !!req.body.freeDelivery,
      deliveryPrice: req.body.freeDelivery ? 0 : Number(req.body.deliveryPrice),
      inStock: !!req.body.inStock,
      stock: Number(req.body.stock),
      isOffer: !!req.body.isOffer,
      isBestSeller: !!req.body.isBestSeller
    };
    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, message: 'Product updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rateProduct = async (req, res) => {
  try {
    const { user, value, review } = req.body;
    if (!user || typeof value !== 'number') return res.status(400).json({ success: false, message: 'User and value required' });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.ratings = product.ratings || [];
    product.reviews = product.reviews || [];
    const existing = product.reviews.find(r => r.user === user);
    if (existing) return res.status(400).json({ success: false, message: 'User already reviewed' });
    product.reviews.push({ user, value, review });
    product.ratings.push({ user, value });
    await product.save();
    res.json({ success: true, message: 'Review added', data: product.reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
