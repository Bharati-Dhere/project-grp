const express = require('express');
const router = express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// POST /api/auth/admin-forgot-password
router.post('/', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      return res.json({ message: 'If your email is registered as admin, you will receive a reset link.' });
    }
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 30; // 30 min
    await user.save();
    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const resetUrl = `${process.env.FRONTEND_URL}/admin/reset-password?token=${token}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Admin Password Reset',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your admin password. This link expires in 30 minutes.</p>`
    });
    res.json({ message: 'Reset link sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending reset link.' });
  }
});

module.exports = router;
