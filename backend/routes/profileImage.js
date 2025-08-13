const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Profile image upload endpoint
router.post('/profile-image', upload.single('image'), async (req, res) => {
  const userId = req.body.userId;
  const imageUrl = `/uploads/${req.file.filename}`;
  await User.findByIdAndUpdate(userId, { profileImage: imageUrl });
  res.json({ success: true, imageUrl });
});

module.exports = router;
