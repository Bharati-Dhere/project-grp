// Admin.jsx
import React, { useEffect, useState } from 'react';
import ProductForm from '../components/ProductForm';
import productsData from '../utils/productsData';
import { useAuth } from '../context/AuthContext';


const Admin = () => {
  const { user, isAdmin, login, logout } = useAuth();
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [signupUsers, setSignupUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState('');
  // Product management state
  const [products, setProducts] = useState(() => {
    // Try to load from localStorage for persistence, else use productsData
    const stored = localStorage.getItem('products');
    return stored ? JSON.parse(stored) : productsData;
  });

  useEffect(() => {
    async function fetchUsers() {
      setLoadingUsers(true);
      try {
        const res = await fetch('/api/users', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        // Use .data property from backend response
        setSignupUsers(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setSignupUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
    const storedFeedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    setFeedbacks(storedFeedbacks);
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminEmail === 'admin@example.com' && adminPassword === 'admin123') {
      login({ email: adminEmail, password: adminPassword });
      setError('');
    } else {
      setError('Invalid admin credentials');
    }
  };

  const handleDeleteUser = (email) => {
    const updatedUsers = signupUsers.filter(user => user.email !== email);
    setSignupUsers(updatedUsers);
    localStorage.setItem('signupUsers', JSON.stringify(updatedUsers));
  };

  // Add product handler
  const addProduct = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  // Delete product handler (optional)
  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Show admin login form if not logged in or not admin
  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Admin Login</h2>
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Admin Email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Admin Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
          {error && <p className="text-red-600">{error}</p>}
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">
            Login
          </button>
        </form>
      </div>
    );
  }

  // ✅ If admin is logged in, show dashboard
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-green-600">Admin Dashboard</h2>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Product Management Section */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold mb-4">Add New Product</h3>
        <ProductForm onSubmit={addProduct} />
        <h3 className="text-2xl font-semibold mt-8 mb-4">All Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Category</th>
                <th className="p-2">Brand</th>
                <th className="p-2">Price</th>
                <th className="p-2">Color</th>
                <th className="p-2">Rating</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-gray-300">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.category}</td>
                  <td className="p-2">{p.brand}</td>
                  <td className="p-2">₹{p.price}</td>
                  <td className="p-2">{p.color}</td>
                  <td className="p-2">{p.rating}</td>
                  <td className="p-2">
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => deleteProduct(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Section */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold mb-4">Signed-up Users</h3>
        {loadingUsers ? (
          <p className="text-gray-600">Loading users...</p>
        ) : signupUsers.length === 0 ? (
          <p className="text-gray-600">No user details available.</p>
        ) : (
          <table className="w-full text-left border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {signupUsers.map((u, idx) => (
                <tr key={u._id || idx} className="border-t border-gray-300">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role || 'user'}</td>
                  <td className="p-2">
                    {/* Optionally implement delete via backend */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Feedback Section */}
      <div>
        <h3 className="text-2xl font-semibold mb-4">User & Guest Feedback</h3>
        {feedbacks.length === 0 ? (
          <p className="text-gray-600">No feedback available.</p>
        ) : (
          <ul className="space-y-4">
            {feedbacks.map((fb, i) => (
              <li key={i} className="p-4 border rounded-md bg-gray-100">
                <p><strong>Name:</strong> {fb.name || "Guest"}</p>
                <p><strong>Email:</strong> {fb.email || "Not provided"}</p>
                <p><strong>Message:</strong> {fb.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Admin;
