const User = require('../models/User');

module.exports = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find();
      res.json({ success: true, message: 'Users fetched', data: users });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', data: null });
    }
  },
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, message: 'User fetched', data: user });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', data: null });
    }
  },
  getUserByEmail: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.params.email }).select('-password');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, message: 'User fetched', data: user });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', data: null });
    }
  },
  updateUser: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, message: 'User updated', data: user });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', data: null });
    }
  },
  syncClerkUser: async (req, res) => {
    try {
      const { email, name, role, password } = req.body;
      if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
      const bcrypt = require('bcryptjs');
      let user = await User.findOne({ email });
      if (user) {
        user.name = name || user.name;
        user.role = role || user.role;
        if (password) {
          user.password = await bcrypt.hash(password, 10);
          user.hasPassword = true;
        }
        await user.save();
      } else {
        let hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        let hasPassword = !!password;
        user = await User.create({ email, name, role: role || 'user', password: hashedPassword, hasPassword });
      }
      res.json({ success: true, message: 'User synced', data: user });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
  }
};
