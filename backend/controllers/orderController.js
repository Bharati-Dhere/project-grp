// Update order status and delivery date (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, deliveryDate } = req.body;
    const update = {};
    if (status) update.status = status;
    if (deliveryDate) update.deliveryDate = deliveryDate;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    ).populate('user', 'email name').populate('items.product', 'name price image');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order updated', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};
const Order = require('../models/Order');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'email name')
      .populate('items.product', 'name price image');
    res.json({ success: true, message: 'Orders fetched', data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order fetched', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const { items, total, address, paymentInfo } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items required' });
    }
    const order = await Order.create({ user: req.userId, items, total, address, paymentInfo });
    // Optionally add order to user's orders array if your User model supports it
    // await User.findByIdAndUpdate(req.userId, { $push: { orders: order._id } });
    res.status(201).json({ success: true, message: 'Order placed', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};
