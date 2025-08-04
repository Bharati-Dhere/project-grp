import React, { useState, useEffect } from "react";

export default function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    // Always read latest user info from adminUserUpdates if present
    const updatedUsers = JSON.parse(localStorage.getItem("adminUserUpdates")) || JSON.parse(localStorage.getItem("users")) || [];
    setUsers(updatedUsers);
    setOrders(JSON.parse(localStorage.getItem("orders")) || []);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setReviews(
        JSON.parse(localStorage.getItem("adminReviews"))?.filter(r => r.userEmail === selectedUser.email) || []
      );
      setFeedbacks(
        JSON.parse(localStorage.getItem("guestFeedbacks"))?.filter(fb => fb.userEmail === selectedUser.email) || []
      );
    }
  }, [selectedUser]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Customer Management</h1>
      <ul className="space-y-2 mb-6">
        {users.length === 0 ? (
          <li className="text-gray-500">No registered users found.</li>
        ) : (
          users.map((u) => (
            <li key={u.email} className="bg-gray-50 p-4 rounded flex justify-between items-center cursor-pointer hover:bg-blue-50" onClick={() => setSelectedUser(u)}>
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
            <p><strong>Phone:</strong> {selectedUser.phone || <span className="text-gray-400">N/A</span>}</p>
            <p><strong>Address:</strong> {selectedUser.address || <span className="text-gray-400">N/A</span>}</p>
            <p><strong>Gender:</strong> {selectedUser.gender || <span className="text-gray-400">N/A</span>}</p>
            <p><strong>Notifications:</strong> {selectedUser.notifications ? 'Enabled' : 'Disabled'}</p>
          </div>
          <h3 className="font-semibold mt-4 mb-2">Order History</h3>
          <ul className="space-y-1 mb-2">
            {orders.filter(o => o.userEmail === selectedUser.email).length === 0 ? (
              <li className="text-gray-500">No orders.</li>
            ) : (
              orders.filter(o => o.userEmail === selectedUser.email).map(o => (
                <li key={o.id} className="text-sm">Order #{o.id} - {o.product} ({o.status})</li>
              ))
            )}
          </ul>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setSelectedUser(null)}>Back</button>
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => {
              if(window.confirm('Are you sure you want to delete this user?')) {
                const updatedUsers = users.filter(u => u.email !== selectedUser.email);
                setUsers(updatedUsers);
                localStorage.setItem('users', JSON.stringify(updatedUsers));
                localStorage.setItem('adminUserUpdates', JSON.stringify(updatedUsers));
                setSelectedUser(null);
              }
            }}>Delete User</button>
          </div>
        </div>
      )}
    </div>
  );
}
