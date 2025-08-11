require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');



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
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/check-email', require('./routes/checkEmail'));
const reviewsRouter = require('./routes/reviews');
app.use('/api/change-password', require('./routes/changePassword'));



app.use('/api/products', productRoutes);
app.use('/api/clerk-webhook', require('./routes/clerkWebhook'));
app.use('/api/accessories', accessoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/set-password', require('./routes/setPassword'));
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/otp', otpRoutes);

app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

app.use('/api/reviews', reviewsRouter);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
