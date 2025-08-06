// src/utils/api.js
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const fetchProducts = async () => {
  const res = await axios.get(`${API_BASE}/products`);
  return res.data;
};

export const fetchAccessories = async () => {
  const res = await axios.get(`${API_BASE}/accessories`);
  return res.data;
};

export const addProduct = async (product) => {
  const res = await axios.post(`${API_BASE}/products`, product);
  return res.data;
};

export const updateProduct = async (id, product) => {
  const res = await axios.put(`${API_BASE}/products/${id}`, product);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await axios.delete(`${API_BASE}/products/${id}`);
  return res.data;
};

export const addAccessory = async (accessory) => {
  const res = await axios.post(`${API_BASE}/accessories`, accessory);
  return res.data;
};

export const updateAccessory = async (id, accessory) => {
  const res = await axios.put(`${API_BASE}/accessories/${id}`, accessory);
  return res.data;
};

export const deleteAccessory = async (id) => {
  const res = await axios.delete(`${API_BASE}/accessories/${id}`);
  return res.data;
};
// User Authentication & Profile
export const signup = async (userData) => {
  const res = await axios.post(`${API_BASE}/auth/signup`, userData);
  return res.data;
};

export const login = async (credentials) => {
  const res = await axios.post(`${API_BASE}/auth/login`, credentials, { withCredentials: true });
  return res.data;
};

export const logout = async () => {
  const res = await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
  return res.data;
};

export const fetchUserProfile = async (userId) => {
  const res = await axios.get(`${API_BASE}/users/${userId}`, { withCredentials: true });
  return res.data;
};

export const updateUserProfile = async (userId, profileData) => {
  const res = await axios.put(`${API_BASE}/users/${userId}`, profileData, { withCredentials: true });
  return res.data;
};

// Cart
export const fetchCart = async () => {
  const res = await axios.get(`${API_BASE}/cart`, { withCredentials: true });
  return res.data;
};

export const updateCart = async (cartData) => {
  const res = await axios.put(`${API_BASE}/cart`, cartData, { withCredentials: true });
  return res.data;
};

// Wishlist
export const fetchWishlist = async () => {
  const res = await axios.get(`${API_BASE}/wishlist`, { withCredentials: true });
  return res.data;
};

export const updateWishlist = async (wishlistData) => {
  const res = await axios.put(`${API_BASE}/wishlist`, wishlistData, { withCredentials: true });
  return res.data;
};

// Orders
export const fetchOrders = async () => {
  const res = await axios.get(`${API_BASE}/orders`, { withCredentials: true });
  return res.data;
};

export const placeOrder = async (orderData) => {
  const res = await axios.post(`${API_BASE}/orders`, orderData, { withCredentials: true });
  return res.data;
};

// Account Switching (fetch all user accounts for switching, if supported)
export const fetchUserAccounts = async () => {
  const res = await axios.get(`${API_BASE}/users`, { withCredentials: true });
  return res.data;
};
