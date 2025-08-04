import React, { useState, useEffect } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('active'); // 'active' or 'cancelled'

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(storedOrders);
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  const handlePaymentReturnStatusChange = (orderId, newStatus) => {
    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, paymentReturnStatus: newStatus } : o
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  const filteredOrders = orders.filter(o => {
    if (tab === 'active') {
      return o.status !== 'Cancelled';
    } else {
      return o.status === 'Cancelled';
    }
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${tab === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setTab('active')}
        >Active Orders</button>
        <button
          className={`px-4 py-2 rounded ${tab === 'cancelled' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setTab('cancelled')}
        >Cancelled Orders</button>
      </div>
      <ul className="space-y-2">
        {filteredOrders.length === 0 ? (
          <li className="text-gray-500">No orders found.</li>
        ) : (
          filteredOrders.map((o) => (
            <li key={o.id} className="bg-gray-50 p-4 rounded flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <span className="font-medium text-gray-800">Order #{o.id}</span>
              <span className="text-xs text-gray-500">Placed on: {o.date && !isNaN(Date.parse(o.date)) ? new Date(o.date).toLocaleDateString() : 'N/A'}</span>
              <span className="text-xs text-blue-700 font-semibold">Total: ₹{(o.products || []).reduce((sum, prod) => sum + (Number(prod.price) * Number(prod.quantity || 1)), 0)}</span>
              <span className={`px-2 py-1 rounded text-xs ${o.status === "Delivered" ? "bg-green-100 text-green-700" : o.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{o.status}</span>
              <span className="text-sm text-gray-500">{o.userEmail}</span>
              <span className="text-sm text-gray-500">{o.paymentMethod}</span>
              <select
                value={o.status}
                onChange={e => handleStatusChange(o.id, e.target.value)}
                className="px-2 py-1 rounded border text-xs"
              >
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              {/* Payment return status for cancelled online/UPI orders */}
              {tab === 'cancelled' && (o.paymentMethod === 'UPI' || o.paymentMethod === 'Online') && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-700">Payment:</span>
                  <select
                    value={o.paymentReturnStatus || 'Processing'}
                    onChange={e => handlePaymentReturnStatusChange(o.id, e.target.value)}
                    className="px-2 py-1 rounded border text-xs"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
