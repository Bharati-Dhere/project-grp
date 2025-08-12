import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile, updateUserProfile, fetchOrders } from '../utils/api';
import defaultAvatar from '../assets/default-avtar.jpg';
import AuthModal from '../components/AuthModal';

function OrderListItem({ order, onTrack, onCancel, onReorder, onUserCancel, onClick, onViewDetails }) {
  // Calculate total price for all products in the order
  const totalPrice = (order.products || []).reduce((sum, prod) => sum + (Number(prod.price) * Number(prod.quantity || 1)), 0);
  return (
    <li className="flex flex-col md:flex-row justify-between items-start md:items-center group hover:bg-blue-50 rounded transition-all duration-200 p-2 border border-blue-100 shadow-sm cursor-pointer">
      <div className="flex flex-col flex-1">
        <span className="flex items-center gap-2 font-semibold text-blue-900">
          <span>Order #{order.id}</span>
        </span>
        <div className="mt-1 mb-1 flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs text-gray-500">Placed on: {order.date && !isNaN(Date.parse(order.date)) ? new Date(order.date).toLocaleDateString() : 'N/A'}</span>
          <span className="text-xs text-blue-700 font-semibold">Total: ₹{totalPrice}</span>
        </div>
        <div className="bg-blue-50 rounded p-2 mb-2">
          <span className="font-medium text-blue-700 text-sm">Products:</span>
          <ul className="ml-4 list-disc text-sm">
            {(order.products || []).map((prod, idx) => (
              <li key={idx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                <span className="font-semibold text-blue-800">{prod.name}</span>
                <span className="text-gray-600">Qty: {prod.quantity}</span>
                <span className="text-gray-600">Price: ₹{prod.price}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <button onClick={() => onViewDetails(order)} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">View Details</button>
          {onTrack && <button onClick={onTrack} className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1" title="Track this order">Track</button>}
          {onCancel && order.status !== 'Cancelled' && <button onClick={onCancel} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-700 flex items-center gap-1" title="Cancel this order">Cancel</button>}
          {onReorder && order.status === 'Cancelled' && <button onClick={onReorder} className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Reorder</button>}
          {onUserCancel && order.status === 'Cancelled' && <button onClick={onUserCancel} className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-600">Remove</button>}
        </div>
      </div>
    </li>
  );
}
export default function Profile() {
  const { user, login, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("");
  const [authModalActive, setAuthModalActive] = useState(false); // prevent infinite modal
  const [allUsers, setAllUsers] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [avatar, setAvatar] = useState(null);
  const [notifications, setNotifications] = useState(false);
  const [orders, setOrders] = useState([]);
  const [errors, setErrors] = useState({});
  const [centerTab, setCenterTab] = useState("profile"); // profile, current, history, track
  const [trackOrderId, setTrackOrderId] = useState("");
  const [trackStatus, setTrackStatus] = useState("");
  const [adminOrderModal, setAdminOrderModal] = useState(null);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  function handleAdminOrderClick(order) {
    setAdminOrderModal(order);
  }

  function AdminOrderDetailsModal({ order, onClose }) {
    if (!order) return null;
    const totalPrice = (order.products || []).reduce((sum, prod) => sum + (Number(prod.price) * Number(prod.quantity || 1)), 0);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
          <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl" onClick={onClose}>&times;</button>
          <h2 className="text-xl font-bold mb-2 text-blue-700">Order #{order.id} Details</h2>
          <div className="mb-2">
            <span className="font-semibold">Placed on:</span> {order.date && !isNaN(Date.parse(order.date)) ? new Date(order.date).toLocaleDateString() : 'N/A'}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Delivery Date:</span> {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'Not set'}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Status:</span> {order.status}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Customer Email:</span> {order.email || 'N/A'}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Mobile Number:</span> {order.phone || 'N/A'}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Address:</span> {order.address || 'N/A'}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Total Price:</span> ₹{totalPrice}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Products:</span>
            <ul className="ml-4 list-disc">
              {(order.products || []).map((prod, idx) => (
                <li key={idx} className="mb-1">
                  <span className="font-semibold text-blue-800">{prod.name}</span> - Qty: {prod.quantity} - Price: ₹{prod.price}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    async function loadProfileAndOrders() {
      if (!user && !authModalActive) {
        setShowAuthModal(true);
        setAuthModalActive(true);
        return;
      }
      if (!user) return;
      try {
        const profileRes = await fetchUserProfile(user._id || user.id);
        // Support both { data: { ...user } } and { ...user }
        const userData = profileRes.data || profileRes;
        setProfile(userData);
        // Flatten profile fields for form
        setForm({
          ...userData.profile,
          email: userData.email,
          phone: userData.profile?.phone || userData.phone || ""
        });
        setAvatar(userData.profile?.avatar || null);
        setNotifications(userData.profile?.notifications || false);
  const ordersData = await fetchOrders();
  setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (err) {
        setShowAuthModal(true);
        setAuthModalActive(true);
      }
    }
    loadProfileAndOrders();
  }, [user, centerTab, authModalActive]);


  //Track order
  const handleTrackOrder = (orderId) => {
    // If orderId is provided, use it, else use trackOrderId from state
    const idToTrack = orderId !== undefined ? orderId : trackOrderId;
    setTrackOrderId(idToTrack);
    const order = orders.find(o => String(o.id) === String(idToTrack));
    setTrackStatus(order ? order.status : "Order not found");
  };
  // Cancel order handler (calls backend and refreshes orders)
  const handleCancelOrder = async (orderId) => {
    try {
      // Call backend API to cancel order
      await import('../utils/api').then(api => api.cancelOrder(orderId));
      // Refresh orders from backend so admin sees update
      const ordersData = await fetchOrders();
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      toast.info('Order cancelled.');
    } catch (err) {
      let msg = 'Failed to cancel order.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      toast.error(msg);
    }
  };

  // Logout: use backend/context only
  const handleLogout = () => {
    logout();
  };

  // Sign Out: delete account via backend only
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account? This cannot be undone.")) return;
    try {
      // Call backend API to delete user (implement in your backend and api.js)
      // await deleteUser(user._id);
      logout();
      toast.success('Account deleted.');
    } catch (err) {
      toast.error('Failed to delete account.');
    }
  };

  // Switch user: backend/context only (implement as needed)
  const handleSwitchUser = (email) => {
    // Implement account switching via backend/context if needed
    toast.info('Account switching is now handled by backend.');
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm(user);
    setAvatar(user?.avatar || null);
    setNotifications(user?.notifications || false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatar(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNotificationToggle = () => {
    setNotifications((prev) => !prev);
  };

  // Validation (only name required in edit mode; email is not editable)
  const validateForm = () => {
    const newErrors = {};
    if (!form.name || form.name.length < 2) newErrors.name = "Name is required.";
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) newErrors.pincode = "Pincode must be 6 digits.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix errors before saving.");
      return;
    }
    try {
      // Only send editable fields in profile
      const profileUpdate = {
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        gender: form.gender,
        avatar: avatar,
        notifications: notifications
      };
      await updateUserProfile(user._id || user.id, profileUpdate);
      // Re-fetch profile and orders after update
      const profileRes = await fetchUserProfile(user._id || user.id);
      const userData = profileRes.data || profileRes;
      setProfile(userData);
      setForm({
        ...userData.profile,
        email: userData.email,
        phone: userData.profile?.phone || userData.phone || ""
      });
      setAvatar(userData.profile?.avatar || null);
      setNotifications(userData.profile?.notifications || false);
      const ordersData = await fetchOrders();
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setEditMode(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  // Order management
  // Removed unused: handleTrackOrder

  // User-side cancel for cancelled order (shows popup, UPI refund if needed)

  // User-side cancel for cancelled order (shows popup, UPI refund if needed)

  // --- Place these just before the return statement, only once ---

  // --- Only one correct version of each handler below ---
  // User-side cancel for cancelled order (backend only)
  const handleUserCancelOrder = async (order) => {
    try {
      // Call backend API to remove/cancel order (implement in your backend and api.js)
      // await removeOrder(order.id);
      setOrders(orders => orders.filter(o => o.id !== order.id));
      toast.info('Order cancelled and removed.');
    } catch (err) {
      toast.error('Failed to remove order.');
    }
  };

  // Reorder logic: backend only
  const handleReorder = async (order) => {
    try {
      // Call backend API to reorder (implement in your backend and api.js)
      // await reorderOrder(order.id);
      toast.success('Order placed again!');
    } catch (err) {
      toast.error('Failed to reorder.');
    }
  };

  // Update order delivery date (admin, backend only)
  function updateOrderDeliveryDate(orderId, newDate) {
    // Call backend API to update delivery date (implement in your backend and api.js)
    toast.success("Delivery date updated.");
  }

  // Don't show anything while modal is open and user is not logged in
  if (!user && showAuthModal) {
    return (
      <AuthModal
        onClose={() => {
          setShowAuthModal(false);
          setAuthModalActive(false);
          setTimeout(() => {
            if (window.location && window.location.reload && typeof login === 'function') {
              if (localStorage.getItem('user')) window.location.reload();
            }
          }, 200);
        }}
        setUser={login}
      />
    );
  }

  // Prevent rendering if user is still null (hydrating)
  if (!user) {
    return null;
  }

  // (Removed handleClearAllData function)

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-blue-50 to-white">
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}  
          setUser={() => setShowAuthModal(false)}
        />
      )}
      {/* Sidebar */}
      <aside className="w-full md:w-72 min-h-[120px] md:min-h-full bg-white border-b md:border-b-0 md:border-r shadow-lg flex flex-row md:flex-col items-center md:items-center py-4 md:py-8 gap-4 md:gap-6 z-10">
        <div className="flex flex-col items-center cursor-pointer w-1/3 md:w-full" onClick={() => setCenterTab('profile')}>
          <img
            src={profile?.avatar && profile?.avatar.trim() !== '' ? profile.avatar : (profile?.profile?.avatar && profile.profile.avatar.trim() !== '' ? profile.profile.avatar : defaultAvatar)}
            onError={e => { e.target.onerror = null; e.target.src = defaultAvatar; }}
            alt="Avatar"
            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-blue-400 mb-1 md:mb-2 hover:scale-105 transition"
          />
          <div className="font-bold text-base md:text-lg text-blue-700 truncate w-full text-center">{profile?.name || profile?.profile?.name || user.name}</div>
          <div className="text-xs text-gray-500 truncate w-full text-center">{profile?.email || user.email}</div>
        </div>
        <nav className="flex flex-1 flex-row md:flex-col w-2/3 md:w-full gap-2 px-2 md:px-4 justify-center md:justify-start">
          <button className={`py-2 px-2 md:px-4 rounded text-left text-xs md:text-base ${centerTab==='profile' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-blue-50'}`} onClick={() => setCenterTab('profile')}>Profile Info</button>
          <button className={`py-2 px-2 md:px-4 rounded text-left text-xs md:text-base ${centerTab==='current' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-blue-50'}`} onClick={() => setCenterTab('current')}>Current Orders</button>
          <button className={`py-2 px-2 md:px-4 rounded text-left text-xs md:text-base ${centerTab==='history' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-blue-50'}`} onClick={() => setCenterTab('history')}>My Orders</button>
          <button className={`py-2 px-2 md:px-4 rounded text-left text-xs md:text-base ${centerTab==='track' ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-blue-50'}`} onClick={() => setCenterTab('track')}>Track Order</button>
        </nav>
        <div className="hidden md:block w-full px-4">
          <div className="font-semibold mb-1 text-sm text-gray-700 flex items-center justify-between">
            <span>Switch Account:</span>
            {/* <button
              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              onClick={() => setShowAuthModal(true)}
            >+ Add Account</button> */}
            <button
  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
  onClick={() => { setAuthModalReason("add-account"); setShowAuthModal(true); }}
>+ Add Account</button>
          </div>
          <ul className="space-y-1">
            {allUsers.map((u) => (
              <li key={u.email} className="flex items-center gap-2">
                <button
                  onClick={() => handleSwitchUser(u.email)}
                  className={`flex-1 text-left px-2 py-1 rounded transition-all duration-200 border flex items-center gap-2 ${u.email === user.email ? 'bg-blue-200 border-blue-500 font-bold cursor-default text-blue-900' : 'text-blue-600 hover:underline hover:bg-blue-50 border-transparent'}`}
                  disabled={u.email === user.email}
                >
                  {u.email === user.email ? (
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mr-2" title="Active account"></span>
                  ) : null}
                  <span>{u.name} ({u.email})</span>
                  {u.email === user.email ? (
                    <span className="ml-auto text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">Active</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto flex flex-col w-full gap-2 px-2 md:px-4">
          <button onClick={handleLogout} className="w-full py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center justify-center gap-2 text-xs md:text-base" title="Logout from your account">Logout</button>
          <button onClick={handleDeleteAccount} className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center gap-2 text-xs md:text-base" title="Sign out and delete your account">Sign Out</button>
        </div>
      </aside>
      {/* Center Content */}
      <main className="flex-1 flex flex-col items-center justify-start py-6 px-2 sm:px-4 md:px-12 w-full">
        {/* Danger zone: Remove all users and orders */}
        {/* (Removed 'Remove All User Accounts & Orders' button) */}
        {centerTab === 'profile' && (
          <div className="w-full max-w-xl">
            {/* ...existing profile info/edit form code here... */}
            {editMode ? (
              <>
                <div className="flex flex-col items-center mb-4 relative">
                  <div className="relative w-24 h-24 mb-2">
                    <img
                      src={avatar && avatar.trim() !== '' ? avatar : (profile?.avatar && profile.avatar.trim() !== '' ? profile.avatar : (profile?.profile?.avatar && profile.profile.avatar.trim() !== '' ? profile.profile.avatar : defaultAvatar))}
                      onError={e => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                      alt="Avatar Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-blue-400"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-md focus:outline-none flex items-center justify-center"
                      title="Change avatar"
                      style={{ zIndex: 2 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2a2.828 2.828 0 11-4-4 2.828 2.828 0 014 4z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7v.01M4 20h16M4 20a2 2 0 01-2-2V6a2 2 0 012-2h7.586a1 1 0 01.707.293l7.414 7.414a1 1 0 01.293.707V18a2 2 0 01-2 2H4z" />
                      </svg>
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                </div>
                <input type="text" name="name" value={form.name || ""} onChange={handleInputChange} className="border px-2 py-1 rounded w-full mb-2" placeholder="Name" />
                {errors.name && <p className="text-red-500 text-xs mb-1">{errors.name}</p>}
                <input type="number" name="age" value={form.age || ""} onChange={handleInputChange} className="border px-2 py-1 rounded w-full mb-2" placeholder="Age" min={0} />
                <input type="email" name="email" value={user.email || ""} readOnly className="border px-2 py-1 rounded w-full mb-2 bg-gray-100 cursor-not-allowed" placeholder="Email (read-only)" />
                {errors.email && <p className="text-red-500 text-xs mb-1">{errors.email}</p>}
                <input type="text" name="phone" value={form.phone || form.mobile || ""} onChange={handleInputChange} className="border px-2 py-1 rounded w-full mb-2" placeholder="Mobile" />
                <input type="text" name="address" value={form.address || ""} onChange={handleInputChange} className="border px-2 py-1 rounded w-full mb-2" placeholder="Address" />
                <input type="text" name="city" value={form.city || ""} onChange={handleInputChange} className="border px-2 py-1 rounded w-full mb-2" placeholder="City" />
                <input type="text" name="state" value={form.state || ""} onChange={handleInputChange} className="border px-2 py-1 rounded w-full mb-2" placeholder="State" />
                <input type="text" name="pincode" value={form.pincode || ""} onChange={handleInputChange} className="border px-2 py-1 rounded w-full mb-2" placeholder="Pincode (6 digits)" maxLength={6} />
                {errors.pincode && <p className="text-red-500 text-xs mb-1">{errors.pincode}</p>}
                <select name="gender" value={form.gender || ""} onChange={handleInputChange} className="border px-2 py-1 rounded w-full mb-2">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">Notifications:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={handleNotificationToggle}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 transition-all duration-200 ${notifications ? 'bg-green-400' : ''}`}></div>
                    <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${notifications ? 'translate-x-5' : ''}`}></span>
                  </label>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                  <button onClick={handleCancel} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-1">{profile?.name || profile?.profile?.name || user?.name || ''}</h2>
                <p className="text-gray-600 mb-1"><span className="font-semibold">Email:</span> {profile?.email || user?.email || ''}</p>
                <p className="text-gray-600 mb-1"><span className="font-semibold">Age:</span> {profile?.age || profile?.profile?.age || ''}</p>
                <p className="text-gray-600 mb-1"><span className="font-semibold">Phone:</span> {profile?.phone || profile?.profile?.phone || ''}</p>
                <p className="text-gray-600 mb-1"><span className="font-semibold">Address:</span> {profile?.address || profile?.profile?.address || ''}</p>
                <p className="text-gray-600 mb-1"><span className="font-semibold">City:</span> {profile?.city || profile?.profile?.city || ''}</p>
                <p className="text-gray-600 mb-1"><span className="font-semibold">State:</span> {profile?.state || profile?.profile?.state || ''}</p>
                <p className="text-gray-600 mb-1"><span className="font-semibold">Pincode:</span> {profile?.pincode || profile?.profile?.pincode || ''}</p>
                <p className="text-gray-600 mb-1"><span className="font-semibold">Gender:</span> {profile?.gender || profile?.profile?.gender || ''}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">Notifications:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile?.notifications || profile?.profile?.notifications || false}
                      readOnly
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 transition-all duration-200 ${(profile?.notifications || profile?.profile?.notifications) ? 'bg-green-400' : ''}`}></div>
                    <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${(profile?.notifications || profile?.profile?.notifications) ? 'translate-x-5' : ''}`}></span>
                  </label>
                </div>
                <button onClick={handleEdit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-2">Edit Profile</button>
              </>
            )}
          </div>
        )}
        {centerTab === 'current' && (
          <div className="w-full max-w-xl">
            <h3 className="text-lg font-semibold mb-2">Current Orders</h3>
            {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length === 0 ? (
              <p className="text-gray-500">No current orders.</p>
            ) : (
              <ul className="space-y-2">
        {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').map(o => (
          <OrderListItem
            key={o.id}
            order={o}
            onTrack={() => { setCenterTab('track'); setTimeout(() => handleTrackOrder(o.id), 0); }}
            onCancel={() => handleCancelOrder(o.id)}
            onViewDetails={setDetailsOrder}
          />
        ))}
              </ul>
            )}
          </div>
        )}
        {centerTab === 'history' && (
          <div className="w-full max-w-xl">
            <h3 className="text-lg font-semibold mb-2">My Orders</h3>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders found.</p>
            ) : (
              <ul className="space-y-2">
        {orders.map(o => (
          <OrderListItem
            key={o.id}
            order={o}
            onTrack={() => { setCenterTab('track'); setTimeout(() => handleTrackOrder(o.id), 0); }}
            onReorder={() => handleReorder(o)}
            onUserCancel={() => handleUserCancelOrder(o)}
            onViewDetails={setDetailsOrder}
          />
        ))}
              </ul>
            )}
          </div>
        )}
        {centerTab === 'track' && (
          <div className="w-full max-w-xl">
            <h3 className="text-lg font-semibold mb-2">Track Order</h3>
            <p className="text-gray-500 mb-2">Enter your Order ID below to track its status.</p>
            <div className="flex gap-2 items-center">
              <input type="text" placeholder="Order ID" className="border px-2 py-1 rounded" value={trackOrderId} onChange={e => setTrackOrderId(e.target.value)} />
              <button onClick={() => handleTrackOrder()} className="px-3 py-1 bg-blue-600 text-white rounded">Track</button>
            </div>
            {trackOrderId && trackStatus && (() => {
              const trackedOrder = orders.find(o => String(o.id) === String(trackOrderId));
              if (!trackedOrder) {
                return <div className="mt-4 text-red-600 font-semibold">Order not found</div>;
              }
              // Stepper logic
              const steps = [
                { label: 'Placed', key: 'Placed' },
                { label: 'Processing', key: 'Processing' },
                { label: 'Shipped', key: 'Shipped' },
                { label: 'Out for Delivery', key: 'Out for Delivery' },
                { label: 'Delivered', key: 'Delivered' },
                { label: 'Cancelled', key: 'Cancelled' },
              ];
              // Map order status to step index
              const statusOrder = {
                'Placed': 0,
                'Processing': 1,
                'Shipped': 2,
                'Out for Delivery': 3,
                'Delivered': 4,
                'Cancelled': 5,
              };
              let activeStep = statusOrder[trackedOrder.status] !== undefined ? statusOrder[trackedOrder.status] : 0;
              // If cancelled, only show up to cancelled
              const showSteps = trackedOrder.status === 'Cancelled' ? steps.slice(0, 6) : steps.slice(0, 5);
              return (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-10 relative">
                    {showSteps.map((s, idx) => (
                      <React.Fragment key={s.key}>
                        <div className="flex flex-col items-center z-10 min-w-[80px]">
                          <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-300 ${
                            idx < activeStep
                              ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg'
                              : idx === activeStep
                                ? (trackedOrder.status === 'Cancelled' ? 'bg-red-500 border-red-500 text-white scale-110 shadow-lg' : 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg')
                                : 'bg-gray-200 border-gray-300 text-gray-500'
                          } font-bold text-lg`}>
                            {idx + 1}
                          </div>
                          <span className={`mt-2 text-xs font-semibold ${idx === activeStep ? 'text-blue-600' : 'text-gray-500'}`}>{s.label}</span>
                        </div>
                        {idx < showSteps.length - 1 && (
                          <div className={`flex-1 h-1 mx-1 transition-all duration-300 ${
                            idx < activeStep
                              ? (trackedOrder.status === 'Cancelled' ? 'bg-red-400' : 'bg-blue-400')
                              : 'bg-gray-300'
                          }`}></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <div className="text-base font-semibold text-blue-700">Current Status: {trackedOrder.status}</div>
                    <div className="text-sm text-gray-600 mt-1">Placed on: {trackedOrder.date ? new Date(trackedOrder.date).toLocaleDateString() : 'N/A'}</div>
                    <div className="text-sm text-gray-600 mt-1">Delivery Date: {trackedOrder.deliveryDate ? new Date(trackedOrder.deliveryDate).toLocaleDateString() : 'Not set'}</div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      {/* Order Details Modal (user side) */}
      {detailsOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl" onClick={() => setDetailsOrder(null)}>&times;</button>
            <h2 className="text-xl font-bold mb-2 text-blue-700">Order #{detailsOrder.id} Details</h2>
            <div className="mb-2"><span className="font-semibold">Placed on:</span> {detailsOrder.date ? new Date(detailsOrder.date).toLocaleDateString() : 'N/A'}</div>
            <div className="mb-2"><span className="font-semibold">Delivery Date:</span> {detailsOrder.deliveryDate ? new Date(detailsOrder.deliveryDate).toLocaleDateString() : 'Not set'}</div>
            <div className="mb-2"><span className="font-semibold">Status:</span> {detailsOrder.status}</div>
            <div className="mb-2"><span className="font-semibold">Address:</span> {detailsOrder.address || 'N/A'}</div>
            <div className="mb-2"><span className="font-semibold">Payment:</span> {detailsOrder.paymentInfo?.method || 'N/A'}</div>
            <div className="mb-2"><span className="font-semibold">Total Price:</span> ₹{(detailsOrder.products || []).reduce((sum, prod) => sum + (Number(prod.price) * Number(prod.quantity || 1)), 0)}</div>
            <div className="mb-2"><span className="font-semibold">Products:</span>
              <ul className="ml-4 list-disc">
                {(detailsOrder.products || []).map((prod, idx) => {
                  // Try to get category and brand from both prod and prod.product
                  const category = prod.category || (prod.product && prod.product.category) || '';
                  const brand = prod.brand || (prod.product && prod.product.brand) || '';
                  return (
                    <li key={idx} className="mb-1">
                      <span className="font-semibold text-blue-800">{prod.name}</span> - Qty: {prod.quantity} - Price: ₹{prod.price} - Category: {category} - Brand: {brand}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      </main>
    </div>
  ); }

