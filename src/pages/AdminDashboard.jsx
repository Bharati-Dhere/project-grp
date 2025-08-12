import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { fetchProducts, fetchAccessories } from "../utils/api";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from "chart.js";
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);



export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [sales, setSales] = useState([]);
  const [type, setType] = useState("Product");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [dateRange, setDateRange] = useState("week");
  const [highestSale, setHighestSale] = useState(null);
  const [lowestSale, setLowestSale] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAll() {
      try {
        const [productsRes, accessoriesRes, ordersRes, usersRes, feedbackRes] = await Promise.all([
          fetchProducts(),
          fetchAccessories(),
          axios.get('/api/orders', { withCredentials: true }),
          axios.get('/api/users', { withCredentials: true }),
          axios.get('/api/feedback'),
        ]);
        setProducts(Array.isArray(productsRes) ? productsRes : []);
        setAccessories(Array.isArray(accessoriesRes) ? accessoriesRes : []);
        setOrders(Array.isArray(ordersRes.data?.data) ? ordersRes.data.data : []);
        setUsers(Array.isArray(usersRes.data?.data) ? usersRes.data.data : []);
        setFeedback(Array.isArray(feedbackRes.data?.data) ? feedbackRes.data.data : []);
  // Low stock alert (products + accessories)
  const lowStockProducts = (productsRes || []).filter(p => Number(p.stock) < 5);
  const lowStockAccessories = (accessoriesRes || []).filter(a => Number(a.stock) < 5);
  setLowStock([...lowStockProducts, ...lowStockAccessories]);
      } catch {
        setProducts([]);
        setAccessories([]);
        setOrders([]);
        setUsers([]);
        setFeedback([]);
        setLowStock([]);
      }
    }
    fetchAll();
  }, []);

  // Fetch sales analytics when filters change
  useEffect(() => {
    async function fetchSales() {
      try {
        const params = [];
        if (type) params.push(`type=${encodeURIComponent(type)}`);
        if (category) params.push(`category=${encodeURIComponent(category)}`);
        if (brand) params.push(`brand=${encodeURIComponent(brand)}`);
        if (dateRange) params.push(`range=${encodeURIComponent(dateRange)}`);
        const url = `/api/analytics/sales?${params.join('&')}`;
        const salesRes = await axios.get(url);
        setSales(salesRes.data.data.sales || []);
        setHighestSale(salesRes.data.data.highestSale || null);
        setLowestSale(salesRes.data.data.lowestSale || null);
      } catch {
        setSales([]);
        setHighestSale(null);
        setLowestSale(null);
      }
    }
    fetchSales();
  }, [type, category, brand, dateRange]);

  const handleStatusChange = async (orderId, newStatus) => {
    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updatedOrders);
    // Update order status in backend
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus })
    });
  };


  // --- Modern Analytics Dashboard ---
  // Filter options
  const allCategories = Array.from(new Set([
    ...products.map(p => p.category),
    ...accessories.map(a => a.category)
  ].filter(Boolean)));
  const allBrands = Array.from(new Set([
    ...products.map(p => p.brand),
    ...accessories.map(a => a.brand)
  ].filter(Boolean)));

  // Filtered data
  const items = type === "Product" ? products : accessories;
  const filtered = items.filter(item =>
    (!category || item.category === category) &&
    (!brand || item.brand === brand)
  );

  // Stock chart data
  const stockChartData = {
    labels: filtered.map(i => i.name),
    datasets: [
      {
        label: "Stock",
        data: filtered.map(i => Number(i.stock) || 0),
        backgroundColor: "rgba(99, 102, 241, 0.7)",
      },
    ],
  };

  // Sales chart data
  const salesChartData = {
    labels: sales.map(s => s.name),
    datasets: [
      {
        label: "Total Sold",
        data: sales.map(s => s.totalSold),
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        type: 'bar',
      },
      {
        label: "Total Revenue",
        data: sales.map(s => s.totalRevenue),
        backgroundColor: "rgba(99, 102, 241, 0.4)",
        type: 'bar',
      },
    ],
  };

  // Pie chart by category
  const pieCategoryData = {
    labels: allCategories,
    datasets: [
      {
        label: "Stock by Category",
        data: allCategories.map(cat => items.filter(i => i.category === cat).reduce((sum, i) => sum + (Number(i.stock) || 0), 0)),
        backgroundColor: ["#6366f1", "#f59e42", "#10b981", "#f43f5e", "#fbbf24", "#3b82f6", "#a21caf", "#14b8a6"],
      },
    ],
  };

  // Pie chart by brand
  const pieBrandData = {
    labels: allBrands,
    datasets: [
      {
        label: "Stock by Brand",
        data: allBrands.map(brand => items.filter(i => i.brand === brand).reduce((sum, i) => sum + (Number(i.stock) || 0), 0)),
        backgroundColor: ["#6366f1", "#f59e42", "#10b981", "#f43f5e", "#fbbf24", "#3b82f6", "#a21caf", "#14b8a6"],
      },
    ],
  };

  // --- Animated Summary Boxes ---
  const productCount = products.length;
  const accessoryCount = accessories.length;
  const userCount = users.length;
  // Only count active orders (not delivered, not cancelled)
  const orderCount = orders.filter(o => o.status !== 'Cancelled' && o.status !== 'Delivered').length;
  const feedbackCount = feedback.length;
  const customerCount = userCount; // If customers are different, adjust logic

  return (
    <main className="flex-1 p-6 transition-all duration-500 ease-in-out">
      <h1 className="text-2xl font-bold mb-8 text-purple-700 animate-fade-in">Admin Dashboard</h1>
      {/* Summary Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-green-100 shadow rounded p-6 flex flex-col items-center animate-bounce-in cursor-pointer" onClick={() => navigate('/admin/orders')}>
          <span className="text-3xl font-bold text-green-700">{orderCount}</span>
          <span className="text-gray-600 mt-2">Orders</span>
        </div>
        <div className="bg-purple-100 shadow rounded p-6 flex flex-col items-center animate-bounce-in cursor-pointer" onClick={() => navigate('/admin/existing-products')}>
          <span className="text-3xl font-bold text-purple-700">{productCount + accessoryCount}</span>
          <span className="text-gray-600 mt-2">Products + Accessories</span>
        </div>
        <div className="bg-yellow-100 shadow rounded p-6 flex flex-col items-center animate-bounce-in cursor-pointer" onClick={() => navigate('/admin/customers')}>
          <span className="text-3xl font-bold text-yellow-700">{customerCount}</span>
          <span className="text-gray-600 mt-2">Customers</span>
        </div>
        <div className="bg-pink-100 shadow rounded p-6 flex flex-col items-center animate-bounce-in cursor-pointer" onClick={() => navigate('/admin/feedback')}>
          <span className="text-3xl font-bold text-pink-700">{feedbackCount}</span>
          <span className="text-gray-600 mt-2">Feedback</span>
        </div>
      </div>
      Highest/Lowest Sale & Low Stock Alerts
      <div className="grid md:grid-cols-3 gap-8 mb-10">
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded shadow animate-fade-in">
          <strong>Highest Sale (Week):</strong><br />
          {highestSale ? (() => {
            let prod = null, acc = null;
            if (highestSale._id || highestSale.id) {
              prod = products.find(p => p._id === highestSale._id || p.id === highestSale.id);
              acc = accessories.find(a => a._id === highestSale._id || a.id === highestSale.id);
            } else {
              prod = products.find(p => p.name === highestSale.name);
              acc = accessories.find(a => a.name === highestSale.name);
            }
            return (
              <>
                <span className="font-semibold">{prod?.name || acc?.name || highestSale.name || '-'}</span><br />
                Type: {prod ? 'Product' : acc ? 'Accessory' : (highestSale.type || '-') }<br />
                Category: {prod?.category || acc?.category || highestSale.category || '-'}<br />
                Brand: {prod?.brand || acc?.brand || highestSale.brand || '-'}<br />
                Sold: {highestSale.totalSold}, Revenue: {highestSale.totalRevenue}
              </>
            );
          })() : 'N/A'}
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded shadow animate-fade-in">
          <strong>Lowest Sale (Week):</strong><br />
          {lowestSale ? (() => {
            let prod = null, acc = null;
            if (lowestSale._id || lowestSale.id) {
              prod = products.find(p => p._id === lowestSale._id || p.id === lowestSale.id);
              acc = accessories.find(a => a._id === lowestSale._id || a.id === lowestSale.id);
            } else {
              prod = products.find(p => p.name === lowestSale.name);
              acc = accessories.find(a => a.name === lowestSale.name);
            }
            return (
              <>
                <span className="font-semibold">{prod?.name || acc?.name || lowestSale.name || '-'}</span><br />
                Type: {prod ? 'Product' : acc ? 'Accessory' : (lowestSale.type || '-') }<br />
                Category: {prod?.category || acc?.category || lowestSale.category || '-'}<br />
                Brand: {prod?.brand || acc?.brand || lowestSale.brand || '-'}<br />
                Sold: {lowestSale.totalSold}, Revenue: {lowestSale.totalRevenue}
              </>
            );
          })() : 'N/A'}
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded shadow animate-pulse">
          <strong>Low Stock Alert:</strong><br />
          {lowStock.length > 0 ? (
            <ul className="list-disc ml-4">
              {lowStock.map(i => {
                const acc = accessories.find(a =>
                  String(a._id) === String(i._id) ||
                  String(a._id) === String(i.id) ||
                  String(a.id) === String(i._id) ||
                  String(a.id) === String(i.id)
                );
                const prod = products.find(p =>
                  String(p._id) === String(i._id) ||
                  String(p._id) === String(i.id) ||
                  String(p.id) === String(i._id) ||
                  String(p.id) === String(i.id)
                );
                return (
                  <li
                    key={i._id || i.id}
                    className="cursor-pointer text-blue-700 hover:underline"
                    onClick={() => {
                      if (acc) navigate(`/admin/edit-product/${acc._id || acc.id}?type=Accessory`);
                      else if (prod) navigate(`/admin/edit-product/${prod._id || prod.id}?type=Product`);
                    }}
                  >
                    {i.name} (Stock: {i.stock})
                  </li>
                );
              })}
            </ul>
          ) : 'No low stock items!'}
        </div>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <select value={type} onChange={e => setType(e.target.value)} className="border px-3 py-2 rounded">
          <option value="Product">Products</option>
          <option value="Accessory">Accessories</option>
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">All Categories</option>
          {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select value={brand} onChange={e => setBrand(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">All Brands</option>
          {allBrands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        {/* Date range filter placeholder */}
        <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="border px-3 py-2 rounded">
          <option value="day">Last Day</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>
      </div>
      {/* Stock Bar Chart */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Stock Distribution</h2>
        <Bar data={stockChartData} options={{
          responsive: true,
          plugins: { legend: { display: false }, title: { display: true, text: `${type} Stock Distribution` } },
          scales: { x: { title: { display: true, text: type } }, y: { title: { display: true, text: "Stock" }, beginAtZero: true } },
        }} />
      </div>
      {/* Pie Charts */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Stock by Category</h2>
          <Pie data={pieCategoryData} />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Stock by Brand</h2>
          <Pie data={pieBrandData} />
        </div>
      </div>
      {/* Sales Analytics */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Sales Analytics</h2>
        {sales.length === 0 || sales.every(s => (!s.totalSold && !s.totalRevenue)) ? (
          <div className="bg-gray-100 p-6 rounded shadow text-gray-500">No sales data for this period.</div>
        ) : (
          <>
            <Bar data={salesChartData} options={{
              responsive: true,
              plugins: { legend: { display: true }, title: { display: true, text: `${type} Sales (Total Sold & Revenue)` } },
              scales: {
                x: { title: { display: true, text: type } },
                y: {
                  title: { display: true, text: "Count / Revenue" },
                  beginAtZero: true,
                  min: 0,
                  // Dynamically set max for better scaling
                  max: Math.max(
                    ...sales.map(s => s.totalSold || 0),
                    ...sales.map(s => s.totalRevenue || 0),
                    10
                  )
                }
              },
              animation: true
            }} />
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded shadow">
                <strong>Highest Sale:</strong><br />
                {highestSale ? (
                  <>
                    <span className="font-semibold">{highestSale.name}</span><br />
                    Sold: {highestSale.totalSold}, Revenue: \t{highestSale.totalRevenue}
                  </>
                ) : 'N/A'}
              </div>
              <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded shadow">
                <strong>Lowest Sale:</strong><br />
                {lowestSale ? (
                  <>
                    <span className="font-semibold">{lowestSale.name}</span><br />
                    Sold: {lowestSale.totalSold}, Revenue: {lowestSale.totalRevenue}
                  </>
                ) : 'N/A'}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
