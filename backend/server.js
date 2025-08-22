require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const cors = require('cors');
const crypto = require('crypto');
const adminForgotPassword = require('./routes/adminForgotPassword');



const adminRoutes = require('./routes/admin');

const productRoutes = require('./routes/products');
const accessoryRoutes = require('./routes/accessories');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');

const otpRoutes = require('./routes/otp');
const ordersRoutes = require('./routes/orders');


const cookieParser = require('cookie-parser');
const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://project-grp.vercel.app'
];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});

// Log CORS headers for debugging

// Ensure Access-Control-Allow-Origin is set for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.on('finish', () => {
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Credentials': res.getHeader('Access-Control-Allow-Credentials'),
    });
  });
  next();
});

// Catch-all OPTIONS handler for preflight requests
app.options('*', cors());
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
app.use('/api/check-email', require('./routes/checkEmail'));
const reviewsRouter = require('./routes/reviews');
app.use('/api/change-password', require('./routes/changePassword'));



app.use('/api/products', productRoutes);
app.use('/api/clerk-webhook', require('./routes/clerkWebhook'));
app.use('/api/accessories', accessoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth/admin-forgot-password', adminForgotPassword);
app.use('/api/users', usersRoutes);
app.use('/api/set-password', require('./routes/setPassword'));
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/otp', otpRoutes);

app.use('/api/admin', adminRoutes);


// Email sending route
app.use('/api/send-email', require('./routes/sendEmail'));

const PORT = process.env.PORT || 5000;
app.use('/api/reviews', reviewsRouter);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));


  // const app = express();
// app.use(cors());
// app.use(express.json());

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order API
app.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify payment API
app.post('/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest("hex");

  if (expectedSign === razorpay_signature) {
    res.json({ success: true, message: "Payment verified" });
  } else {
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
});

// app.listen(process.env.PORT, () => {
//   console.log(`Backend running on port ${process.env.PORT}`);
// });
