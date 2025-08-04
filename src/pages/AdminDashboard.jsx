import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState([]); // FIXED: use [] instead of null
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [selectedFeedbacks, setSelectedFeedbacks] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", image: "", stock: "" });
  
  // Filtering and pagination states
  const [productFilter, setProductFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  useEffect(() => {
    // Always read latest user info from adminUserUpdates
    const updatedUsers = JSON.parse(localStorage.getItem("adminUserUpdates")) || JSON.parse(localStorage.getItem("users")) || [];
    setUsers(updatedUsers);
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

  useEffect(() => {
    const loadReviews = () => {
      if (selectedUser) {
        const userOrders = orders.filter((o) => o.userEmail === selectedUser);
        setSelectedOrder(userOrders);
        // Read reviews/feedback from adminReviews (synced from user/guest)
        const adminReviews = JSON.parse(localStorage.getItem("adminReviews"))?.filter(
          (r) => r.userEmail === selectedUser
        ) || [];
        setSelectedReviews(adminReviews);
        setSelectedFeedbacks(adminReviews); // treat all as feedback for display
      }
    };
    loadReviews();
    window.addEventListener("adminReviewsUpdated", loadReviews);
    return () => {
      window.removeEventListener("adminReviewsUpdated", loadReviews);
    };
  }, [selectedUser, orders]);

  // Dashboard analytics summary
  const totalUsers = users.length;
  const totalOrders = orders.filter(o => o.status !== 'Cancelled').length;
  const totalProducts = (JSON.parse(localStorage.getItem("products")) || []).length;
  const totalFeedback = (JSON.parse(localStorage.getItem("adminReviews")) || []).length + (JSON.parse(localStorage.getItem("contactForms")) || []).length;

  return (
    <main className="flex-1 p-6 transition-all duration-500 ease-in-out">
      <h1 className="text-2xl font-bold mb-6 text-purple-700">Admin Dashboard</h1>

      {/* Dashboard Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded p-4 flex flex-col items-center">
          <span className="text-3xl font-bold text-blue-700">{totalUsers}</span>
          <span className="text-gray-500 mt-2">Users</span>
        </div>
        <div className="bg-white shadow rounded p-4 flex flex-col items-center">
          <span className="text-3xl font-bold text-green-700">{totalOrders}</span>
          <span className="text-gray-500 mt-2">Orders</span>
        </div>
        <div className="bg-white shadow rounded p-4 flex flex-col items-center">
          <span className="text-3xl font-bold text-purple-700">{totalProducts}</span>
          <span className="text-gray-500 mt-2">Products</span>
        </div>
        <div className="bg-white shadow rounded p-4 flex flex-col items-center">
          <span className="text-3xl font-bold text-pink-700">{totalFeedback}</span>
          <span className="text-gray-500 mt-2">Feedback</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Registered Users */}
        <div className="bg-white shadow p-4 rounded">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Registered Users</h2>
          <ul className="space-y-2">
            {users.map((user) => (
              <li
                key={user.email}
                className="p-3 bg-gray-50 rounded hover:bg-blue-100 cursor-pointer shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.02] flex justify-between items-center"
              >
                <div onClick={() => setSelectedUser(user.email)} className="flex-1">
                  <div className="font-semibold text-blue-800">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <div className="text-xs text-gray-500">{user.phone}</div>
                  <div className="text-xs text-gray-500">{user.address}</div>
                  <div className="text-xs text-gray-500">Gender: {user.gender}</div>
                </div>
                <button
                  onClick={() => {
                    const updatedUsers = users.filter(u => u.email !== user.email);
                    localStorage.setItem("users", JSON.stringify(updatedUsers));
                    localStorage.setItem("adminUserUpdates", JSON.stringify(updatedUsers));
                    setUsers(updatedUsers);
                  }}
                  className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                >Delete</button>
              </li>
            ))}
          </ul>
        </div>

        {/* User Details / Orders */}
        <div className="bg-white shadow p-4 rounded transition-all duration-300">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            {selectedUser ? `Orders of ${selectedUser}` : "Select a user to view orders"}
          </h2>

          {selectedUser ? (
            <div className="animate-fade-in">
              <button
                className="mb-4 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition duration-200"
                onClick={() => setSelectedUser(null)}
              >
                ← Back
              </button>

              {/* Profile Info */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700">Profile Information</h3>
                {users
                  .filter((u) => u.email === selectedUser)
                  .map((u) => (
                    <div key={u.email} className="mb-2 text-sm text-gray-600">
                      <p><strong>Name:</strong> {u.name}</p>
                      <p><strong>Email:</strong> {u.email}</p>
                      <p><strong>Phone:</strong> {u.phone}</p>
                      <p><strong>Address:</strong> {u.address}</p>
                      <p><strong>Gender:</strong> {u.gender}</p>
                      <p><strong>Notifications:</strong> {u.notifications ? "Enabled" : "Disabled"}</p>
                    </div>
                  ))}
              </div>

              {/* Orders */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700">Orders</h3>
                <ul className="space-y-2">
                  {selectedOrder.length === 0 ? (
                    <li className="text-gray-500">No orders for this user.</li>
                  ) : (
                    selectedOrder.map((o) => (
                      <li
                        key={o.id}
                        className="bg-gray-50 p-3 rounded shadow-sm hover:shadow-md transition-all duration-300 hover:bg-blue-50"
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                          <span className="font-medium text-gray-800">
                            Order #{o.id}
                          </span>
                          <span className="text-xs text-gray-500">Placed on: {o.date && !isNaN(Date.parse(o.date)) ? new Date(o.date).toLocaleDateString() : 'N/A'}</span>
                          <span className="text-xs text-blue-700 font-semibold">Total: ₹{(o.products || []).reduce((sum, prod) => sum + (Number(prod.price) * Number(prod.quantity || 1)), 0)}</span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              o.status === "Delivered"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {o.status}
                          </span>
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            className="px-2 py-1 rounded border text-xs focus:ring-2 focus:ring-blue-400 transition"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => {
                              const updatedOrders = orders.filter(ord => ord.id !== o.id);
                              setOrders(updatedOrders);
                              localStorage.setItem("orders", JSON.stringify(updatedOrders));
                            }}
                            className="bg-red-500 text-white px-2 py-1 rounded ml-2 text-xs"
                          >Cancel</button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Reviews & Feedback */}
              {/* Feedback removed from user details. Only shown in admin feedback page. */}

              {/* Feedbacks */}
              {/* Feedbacks removed from user details. Only shown in admin feedback page. */}
            </div>
          ) : (
            <p className="text-gray-500">Please select a user to view their orders.</p>
          )}
        </div>
      </div>

      {/* Product Stock Analytics Chart */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-6 text-gray-700">Product Stock Analytics</h2>
        {(() => {
          const products = JSON.parse(localStorage.getItem("products")) || [];
          if (products.length === 0) return <p className="text-gray-500 mb-8">No products to show chart.</p>;
          const data = {
            labels: products.map(p => p.name),
            datasets: [
              {
                label: "Stock",
                data: products.map(p => Number(p.stock) || 0),
                backgroundColor: "rgba(99, 102, 241, 0.7)",
              },
            ],
          };
          const options = {
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: true, text: "Product Stock Distribution" },
            },
            scales: {
              x: { title: { display: true, text: "Product" } },
              y: { title: { display: true, text: "Stock" }, beginAtZero: true },
            },
          };
          return <div className="mb-8"><Bar data={data} options={options} /></div>;
        })()}
        <h2 className="text-lg font-semibold mb-6 text-gray-700">Listed Products</h2>
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={productFilter}
            onChange={e => { setProductFilter(e.target.value); setCurrentPage(1); }}
            className="border px-3 py-2 rounded w-full md:w-1/3"
          />
          <select
            value={stockFilter}
            onChange={e => { setStockFilter(e.target.value); setCurrentPage(1); }}
            className="border px-3 py-2 rounded w-full md:w-1/4"
          >
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
        {/* Products List with Filtering and Pagination */}
        {(() => {
          const allProducts = JSON.parse(localStorage.getItem("products")) || [];
          let filtered = allProducts.filter(p =>
            p.name.toLowerCase().includes(productFilter.toLowerCase())
          );
          if (stockFilter === "in") filtered = filtered.filter(p => Number(p.stock) > 0);
          if (stockFilter === "out") filtered = filtered.filter(p => !p.stock || Number(p.stock) === 0);
          const totalPages = Math.ceil(filtered.length / productsPerPage);
          const paginated = filtered.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);
          return (
            <>
              <ul className="space-y-2 mb-8">
                {filtered.length === 0 ? (
                  <li className="text-gray-500">No products found.</li>
                ) : (
                  paginated.map((p) => (
                    <li key={p.id} className="bg-gray-50 p-4 rounded flex justify-between items-center">
                      <div>
                        <img src={p.image} alt={p.name} className="w-16 h-16 object-contain mb-2" />
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-green-700">₹{p.price}</div>
                        <div className="text-xs text-gray-500">Stock: {p.stock || "N/A"}</div>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => setEditProduct(p)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                          <button onClick={() => {
                            const products = JSON.parse(localStorage.getItem("products")) || [];
                            const updated = products.filter(prod => prod.id !== p.id);
                            localStorage.setItem("products", JSON.stringify(updated));
                            window.location.reload();
                          }} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex gap-2 justify-center mb-8">
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >Prev</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >{i + 1}</button>
                  ))}
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >Next</button>
                </div>
              )}
            </>
          );
        })()}
        {/* Edit Product Modal */}
        {editProduct && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-blue-700">Edit Product</h3>
              <input
                type="text"
                placeholder="Name"
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                className="border px-3 py-2 rounded w-full mb-2"
              />
              <input
                type="number"
                placeholder="Price"
                value={editForm.price}
                onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                className="border px-3 py-2 rounded w-full mb-2"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={editForm.image}
                onChange={e => setEditForm({ ...editForm, image: e.target.value })}
                className="border px-3 py-2 rounded w-full mb-2"
              />
              <input
                type="number"
                placeholder="Stock"
                value={editForm.stock}
                onChange={e => setEditForm({ ...editForm, stock: e.target.value })}
                className="border px-3 py-2 rounded w-full mb-4"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const products = JSON.parse(localStorage.getItem("products")) || [];
                    const updated = products.map(prod => prod.id === editProduct.id ? { ...editForm, id: prod.id } : prod);
                    localStorage.setItem("products", JSON.stringify(updated));
                    setEditProduct(null);
                    window.location.reload();
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditProduct(null)}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
