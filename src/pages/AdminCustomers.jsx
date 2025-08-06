import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const usersRes = await axios.get("/api/users", { withCredentials: true });
        setUsers(usersRes.data);
        const ordersRes = await axios.get("/api/admin/orders", { withCredentials: true });
        setOrders(ordersRes.data);
      } catch (err) {
        setUsers([]);
        setOrders([]);
      }
    }
    fetchData();
  }, []);

  // (Optional) Fetch reviews/feedbacks from backend if implemented
  useEffect(() => {
    setReviews([]);
    setFeedbacks([]);
  }, [selectedUser]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Customer Management</h1>
      <ul className="space-y-2 mb-6">
        {users.length === 0 ? (
          <li className="text-gray-500">No registered users found.</li>
        ) : (
          users.map((u) => (
            <li key={u._id} className="bg-gray-50 p-4 rounded flex justify-between items-center cursor-pointer hover:bg-blue-50" onClick={() => setSelectedUser(u)}>
              <span className="font-semibold text-blue-800">{u.name}</span>
              <span className="text-sm text-gray-500">{u.email}</span>
            </li>
          ))
        )}
      </ul>
      {selectedUser && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Profile Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 mb-2">
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Mobile:</strong> {selectedUser.mobile || <span className="text-gray-400">N/A</span>}</p>
            {/* Address, Gender, Notifications may not exist in schema */}
          </div>
          <h3 className="font-semibold mt-4 mb-2">Order History</h3>
          <ul className="space-y-1 mb-2">
            {orders.filter(o => o.user && o.user.email === selectedUser.email).length === 0 ? (
              <li className="text-gray-500">No orders.</li>
            ) : (
              orders.filter(o => o.user && o.user.email === selectedUser.email).map(o => (
                <li key={o._id} className="text-sm">Order #{o._id} - {o.status}</li>
              ))
            )}
          </ul>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setSelectedUser(null)}>Back</button>
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={async () => {
              if(window.confirm('Are you sure you want to delete this user?')) {
                try {
                  await axios.delete(`/api/admin/users/${selectedUser._id}`, { withCredentials: true });
                  setUsers(users.filter(u => u._id !== selectedUser._id));
                  setSelectedUser(null);
                } catch {}
              }
            }}>Delete User</button>
          </div>
        </div>
      )}
    </div>
  );
}
