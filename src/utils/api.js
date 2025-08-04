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
