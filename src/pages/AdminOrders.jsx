import React, { useState, useEffect } from "react";
import { fetchOrders, updateOrderStatus } from "../utils/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('active'); // 'active', 'cancelled', or 'history'
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [deliveryDateInput, setDeliveryDateInput] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetchOrders();
        const data = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        setOrders(data);
      } catch (err) {
        setOrders([]);
      }
    }
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId) {
      alert('Order ID is missing. Cannot update status.');
      return;
    }
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      const fresh = await fetchOrders();
      setOrders(Array.isArray(fresh) ? fresh : []);
      // If modal is open, update detailsOrder with the latest order data
      if (detailsOrder && detailsOrder._id === orderId) {
        const updated = (Array.isArray(fresh) ? fresh : []).find(o => o._id === orderId);
        if (updated) setDetailsOrder(updated);
      }
    } catch (err) {}
  };

  const handleDeliveryDateChange = async (orderId, newDate) => {
    if (!orderId) {
      alert('Order ID is missing. Cannot update delivery date.');
      return;
    }
    try {
      await updateOrderStatus(orderId, { deliveryDate: newDate });
      const fresh = await fetchOrders();
      setOrders(Array.isArray(fresh) ? fresh : []);
      // If modal is open, update detailsOrder with the latest order data
      if (detailsOrder && detailsOrder._id === orderId) {
        const updated = (Array.isArray(fresh) ? fresh : []).find(o => o._id === orderId);
        if (updated) setDetailsOrder(updated);
      }
    } catch (err) {}
  };

  const handlePaymentReturnStatusChange = (orderId, newStatus) => {
    const updatedOrders = orders.map((o) =>
      o._id === orderId ? { ...o, paymentReturnStatus: newStatus } : o
    );
    setOrders(updatedOrders);
    // Optionally update backend here
  };

  const filteredOrders = orders.filter(o => {
    if (tab === 'active') {
      // Show orders that are not Cancelled and not Delivered
      return o.status !== 'Cancelled' && o.status !== 'Delivered';
    } else if (tab === 'cancelled') {
      return o.status === 'Cancelled';
    } else if (tab === 'history') {
      return o.status === 'Delivered';
    }
    return false;
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
          className={`px-4 py-2 rounded ${tab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setTab('history')}
        >History</button>
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
            <li key={o._id} className="bg-gray-50 p-4 rounded flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <span className="font-medium text-gray-800">Order #{o._id}</span>
              <span className="text-xs text-gray-500">Placed on: {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'}</span>
              <span className="text-xs text-blue-700 font-semibold">Total: ₹{(o.items || []).reduce((sum, prod) => sum + (Number(prod.price) * Number(prod.quantity || 1)), 0)}</span>
              <span className={`px-2 py-1 rounded text-xs ${o.status === "Delivered" ? "bg-green-100 text-green-700" : o.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{o.status}</span>
              <span className="text-sm text-gray-500">{o.userEmail || o.user?.email || ''}</span>
              <span className="text-sm text-gray-500">{o.paymentInfo?.method || ''}</span>
              <span className="text-xs text-gray-500">Delivery: {o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString() : 'Not set'}</span>
              <span className="text-xs text-gray-500">Address: {o.address || ''}</span>
              <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200" onClick={() => setDetailsOrder(o)}>View Details</button>
              <select
                value={o.status}
                onChange={e => handleStatusChange(o._id, e.target.value)}
                className="px-2 py-1 rounded border text-xs"
              >
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              {/* Payment return status for cancelled online/UPI orders */}
              {tab === 'cancelled' && (o.paymentInfo?.method === 'UPI' || o.paymentInfo?.method === 'Online') && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-700">Payment:</span>
                  <select
                    value={o.paymentReturnStatus || 'Processing'}
                    onChange={e => handlePaymentReturnStatusChange(o._id, e.target.value)}
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

      {/* Order Details Modal */}
      {detailsOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl" onClick={() => setDetailsOrder(null)}>&times;</button>
            <h2 className="text-xl font-bold mb-2 text-blue-700">Order #{detailsOrder._id} Details</h2>
            <div className="mb-2"><span className="font-semibold">Placed on:</span> {detailsOrder.createdAt ? new Date(detailsOrder.createdAt).toLocaleDateString() : 'N/A'}</div>
            <div className="mb-2"><span className="font-semibold">Delivery Date:</span> {detailsOrder.deliveryDate ? new Date(detailsOrder.deliveryDate).toLocaleDateString() : 'Not set'}</div>
            <div className="mb-2"><span className="font-semibold">Status:</span> {detailsOrder.status}</div>
            <div className="mb-2"><span className="font-semibold">Customer Email:</span> {detailsOrder.userEmail || detailsOrder.user?.email || 'N/A'}</div>
            <div className="mb-2"><span className="font-semibold">Address:</span> {detailsOrder.address || 'N/A'}</div>
            <div className="mb-2"><span className="font-semibold">Payment:</span> {detailsOrder.paymentInfo?.method || 'N/A'}</div>
            <div className="mb-2"><span className="font-semibold">Total Price:</span> ₹{(detailsOrder.items || []).reduce((sum, prod) => sum + (Number(prod.price) * Number(prod.quantity || 1)), 0)}</div>
            <div className="mb-2"><span className="font-semibold">Products:</span>
              <ul className="ml-4 list-disc">
                {(detailsOrder.items || []).map((item, idx) => {
                  const category = item.product?.category || '';
                  const brand = item.product?.brand || '';
                  return (
                    <li key={idx} className="mb-1">
                      <span className="font-semibold text-blue-800">{item.product?.name || ''}</span> - Qty: {item.quantity} - Price: ₹{item.price} - Category: {category} - Brand: {brand}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="mb-2 flex flex-col md:flex-row gap-2 items-center">
              <label className="font-semibold">Update Delivery Date: </label>
              <input type="date" value={deliveryDateInput} onChange={e => setDeliveryDateInput(e.target.value)} className="border px-2 py-1 rounded mr-2" />
              <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => handleDeliveryDateChange(detailsOrder._id, deliveryDateInput)}>Save</button>
            </div>
            <div className="mb-2 flex flex-col md:flex-row gap-2 items-center">
              <label className="font-semibold">Update Status: </label>
              <select
                value={detailsOrder.status}
                onChange={e => handleStatusChange(detailsOrder._id, e.target.value)}
                className="px-2 py-1 rounded border text-xs"
              >
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
