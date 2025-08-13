// Add a review to an accessory (for POST /api/accessories/:id/reviews)
exports.addReview = async (req, res) => {
  try {
    const { user, value, review, avatar } = req.body;
    if (!user || typeof value !== 'number') {
      return res.status(400).json({ success: false, message: 'User and value required' });
    }
    const accessory = await Accessory.findById(req.params.id);
    if (!accessory) {
      return res.status(404).json({ success: false, message: 'Accessory not found' });
    }
    accessory.reviews = accessory.reviews || [];
    // Prevent duplicate reviews by same user
    const existing = accessory.reviews.find(r => r.user === user);
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already reviewed' });
    }
    accessory.reviews.push({ user, value, review, avatar, date: new Date() });
    await accessory.save();
    // Optionally, recalculate avgRating and ratingCount
    const reviews = accessory.reviews;
    const ratingCount = reviews.length;
    const avgRating = ratingCount ? (reviews.reduce((sum, r) => sum + r.value, 0) / ratingCount).toFixed(2) : null;
    res.json({
      success: true,
      message: 'Review added',
      data: {
        reviews,
        avgRating,
        ratingCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const Accessory = require('../models/Accessory');
// Controller for managing accessories
exports.getAllAccessories = async (req, res) => {
  try {
    const accessories = await Accessory.find();
    const accessoriesWithRatings = accessories.map(accessory => {
      const reviews = accessory.reviews || [];
      const ratings = accessory.ratings || [];
      const allRatings = reviews.length > 0 ? reviews : ratings;
      const ratingCount = allRatings.length;
      const avgRating = ratingCount ? (allRatings.reduce((sum, r) => sum + r.value, 0) / ratingCount) : null;
      return {
        ...accessory.toObject(),
        avgRating: avgRating !== null ? Number(avgRating.toFixed(2)) : null,
        ratingCount,
      };

    });
    res.json({ success: true, message: 'Accessories fetched', data: accessoriesWithRatings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

exports.getAccessoryById = async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id);
    if (!accessory) return res.status(404).json({ success: false, message: 'Accessory not found' });
    // Calculate average rating and count (from reviews if present, else ratings)
    const reviews = accessory.reviews || [];
    const ratings = accessory.ratings || [];
    const allRatings = reviews.length > 0 ? reviews : ratings;
    const ratingCount = allRatings.length;
    const avgRating = ratingCount ? (allRatings.reduce((sum, r) => sum + r.value, 0) / ratingCount).toFixed(2) : null;
    res.json({
      ...accessory.toObject(),
      avgRating,
      ratingCount,
      reviews,
      images: Array.isArray(accessory.images) ? accessory.images : (accessory.image ? [accessory.image] : []),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

exports.addAccessory = async (req, res) => {
  try {
    const requiredFields = ['name', 'price', 'image', 'category', 'brand', 'color', 'inStock', 'stock'];
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === '') {
        return res.status(400).json({ success: false, message: `Missing required field: ${field}` });
      }
    }
    const newAccessory = new Accessory({
      name: req.body.name || "",
      price: req.body.price !== undefined ? Number(req.body.price) : 0,
      image: req.body.image || "",
      images: Array.isArray(req.body.images) ? req.body.images : (req.body.image ? [req.body.image] : []),
      category: req.body.category || "",
      brand: req.body.brand || "",
      color: req.body.color || "",
      ratings: Array.isArray(req.body.ratings) ? req.body.ratings : [],
      reviews: Array.isArray(req.body.reviews) ? req.body.reviews : [],
      inStock: req.body.inStock !== undefined ? !!req.body.inStock : false,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : 0,
      isOffer: req.body.isOffer !== undefined ? !!req.body.isOffer : false,
      isBestSeller: req.body.isBestSeller !== undefined ? !!req.body.isBestSeller : false,
      badge: req.body.badge || "",
      description: req.body.description || "",
      offerPrice: req.body.offerPrice !== undefined ? Number(req.body.offerPrice) : 0,
      discountPercent: req.body.discountPercent !== undefined ? Number(req.body.discountPercent) : 0,
      freeDelivery: req.body.freeDelivery !== undefined ? !!req.body.freeDelivery : false,
      deliveryPrice: req.body.freeDelivery ? 0 : (req.body.deliveryPrice !== undefined ? Number(req.body.deliveryPrice) : 0),
      size: req.body.size || "",
      tags: req.body.tags || ""
    });
    await newAccessory.save();
    res.status(201).json({ success: true, message: 'Accessory created', data: newAccessory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

exports.updateAccessory = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name || "",
      price: req.body.price !== undefined ? Number(req.body.price) : 0,
      image: req.body.image || "",
      images: Array.isArray(req.body.images) ? req.body.images : (req.body.image ? [req.body.image] : []),
      category: req.body.category || "",
      brand: req.body.brand || "",
      color: req.body.color || "",
      ratings: Array.isArray(req.body.ratings) ? req.body.ratings : [],
      reviews: Array.isArray(req.body.reviews) ? req.body.reviews : [],
      inStock: req.body.inStock !== undefined ? !!req.body.inStock : false,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : 0,
      isOffer: req.body.isOffer !== undefined ? !!req.body.isOffer : false,
      isBestSeller: req.body.isBestSeller !== undefined ? !!req.body.isBestSeller : false,
      badge: req.body.badge || "",
      description: req.body.description || "",
      offerPrice: req.body.offerPrice !== undefined ? Number(req.body.offerPrice) : 0,
      discountPercent: req.body.discountPercent !== undefined ? Number(req.body.discountPercent) : 0,
      freeDelivery: req.body.freeDelivery !== undefined ? !!req.body.freeDelivery : false,
      deliveryPrice: req.body.freeDelivery ? 0 : (req.body.deliveryPrice !== undefined ? Number(req.body.deliveryPrice) : 0),
      size: req.body.size || "",
      tags: req.body.tags || ""
    };
    const updated = await Accessory.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, message: 'Accessory updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

exports.deleteAccessory = async (req, res) => {
  try {
    await Accessory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Accessory deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rateAccessory = async (req, res) => {
  try {
    const { user, value, review, avatar } = req.body;
    if (!user || typeof value !== 'number') return res.status(400).json({ success: false, message: 'User and value required' });
    const accessory = await Accessory.findById(req.params.id);
    if (!accessory) return res.status(404).json({ success: false, message: 'Accessory not found' });
    accessory.ratings = accessory.ratings || [];
    accessory.reviews = accessory.reviews || [];
    const existing = accessory.reviews.find(r => r.user === user);
    if (existing) return res.status(400).json({ success: false, message: 'User already reviewed' });
    accessory.reviews.push({ user, value, review, avatar });
    accessory.ratings.push({ user, value });
    await accessory.save();
    res.json({ success: true, message: 'Review added', data: accessory.reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
