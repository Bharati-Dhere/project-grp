import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import productsData from "../utils/productsData";
import accessoriesData from "../utils/accessoriesData";

const AdminExistingProducts = () => {
  const [type, setType] = useState("Product");
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (type === "Product") {
      const stored = localStorage.getItem("products");
      setItems(stored ? JSON.parse(stored) : productsData);
    } else {
      const stored = localStorage.getItem("accessories");
      setItems(stored ? JSON.parse(stored) : accessoriesData);
    }
  }, [type]);

  const handleEdit = (id) => {
    navigate(`/admin/edit-product/${id}?type=${type}`);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete this ${type.toLowerCase()}?`)) {
      const updated = items.filter((p) => p.id !== id);
      setItems(updated);
      localStorage.setItem(type === "Product" ? "products" : "accessories", JSON.stringify(updated));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-blue-700">Existing {type}s</h2>
        <div className="flex gap-4 items-center">
          <select className="border p-2 rounded" value={type} onChange={e => setType(e.target.value)}>
            <option value="Product">Products</option>
            <option value="Accessory">Accessories</option>
          </select>
          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => navigate("/admin/add-product")}>Add New {type}</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Image</th>
              <th className="p-2">Name</th>
              <th className="p-2">Category</th>
              <th className="p-2">Brand</th>
              <th className="p-2">Color</th>
              <th className="p-2">Price</th>
              <th className="p-2">Rating</th>
              <th className="p-2">Offer</th>
              <th className="p-2">Best Seller</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-gray-300 hover:bg-gray-50">
                <td className="p-2">
                  {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} alt={p.name} className="w-16 h-16 object-cover rounded border" />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </td>
                <td className="p-2 font-semibold">{p.name}</td>
                <td className="p-2">{p.category}</td>
                <td className="p-2">{p.brand || "-"}</td>
                <td className="p-2">{p.color || "-"}</td>
                <td className="p-2">₹{p.price}</td>
                <td className="p-2">{p.rating || "-"}</td>
                <td className="p-2">{p.offer ? `₹${p.offerPrice} (${p.discountPercent}% off)` : "-"}</td>
                <td className="p-2">{p.bestSeller ? "Yes" : "No"}</td>
                <td className="p-2">{p.inStock ? "In Stock" : "Out of Stock"}</td>
                <td className="p-2 flex gap-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => handleEdit(p.id)}>Edit</button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminExistingProducts;
