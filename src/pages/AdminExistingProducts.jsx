import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts, fetchAccessories, deleteProduct, deleteAccessory } from "../utils/api";

const FIXED_PRODUCT_CATEGORIES = [
  "Smartphones",
  "Smartwatches",
  "Tablets",
  "Laptops"
];
const FIXED_PRODUCT_BRANDS = [
  "Apple",
  "Samsung",
  "OnePlus",
  "Xiaomi",
  "Realme",
  "Oppo",
  "Vivo",
  "Lenovo",
  "HP",
  "Dell",
  "Asus"
];
const FIXED_ACCESSORY_CATEGORIES = [
  "Mobile Covers",
  "Headphones",
  "USB",
  "Chargers",
  "Screen Protectors",
  "Power Banks",
  "Bluetooth Speakers",
  "Smart Bands",
  "Car Accessories",
  "Other"
];
const FIXED_ACCESSORY_BRANDS = [
  "Boat",
  "JBL",
  "Realme",
  "Samsung",
  "MI",
  "Portronics",
  "Noise",
  "OnePlus",
  "Sony",
  "Other"
];

const AdminExistingProducts = () => {
  const [type, setType] = useState("Product");
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [accessoryCount, setAccessoryCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = () => {
      if (type === "Product") {
        fetchProducts().then((data) => {
          const products = Array.isArray(data) ? data : [];
          setItems(products);
          setProductCount(products.length);
          setCategories(FIXED_PRODUCT_CATEGORIES);
          setBrands(FIXED_PRODUCT_BRANDS);
        });
      } else {
        fetchAccessories().then((data) => {
          const accessories = Array.isArray(data) ? data : [];
          setItems(accessories);
          setAccessoryCount(accessories.length);
          setCategories(FIXED_ACCESSORY_CATEGORIES);
          setBrands(FIXED_ACCESSORY_BRANDS);
        });
      }
    };
    fetchAll();
    // Listen for review submissions to auto-refresh admin list
    window.addEventListener('reviewSubmitted', fetchAll);
    return () => window.removeEventListener('reviewSubmitted', fetchAll);
  }, [type]);

  const handleEdit = (id) => {
    if (type === "Product") {
      navigate(`/admin/edit-product/${id}?type=Product`);
    } else {
      navigate(`/admin/edit-product/${id}?type=Accessory`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this ${type.toLowerCase()}?`)) {
      if (type === "Product") {
        await deleteProduct(id);
        const products = await fetchProducts();
        setItems(Array.isArray(products) ? products : []);
        setProductCount(Array.isArray(products) ? products.length : 0);
      } else {
        await deleteAccessory(id);
        const accessories = await fetchAccessories();
        setItems(Array.isArray(accessories) ? accessories : []);
        setAccessoryCount(Array.isArray(accessories) ? accessories.length : 0);
      }
    }
  };

  // productCount and accessoryCount now come from backend fetch

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-700">Existing {type}s</h2>
          <div className="text-sm text-gray-600 mt-2">
            <span className="mr-4">Admin Products: <span className="font-bold">{productCount}</span></span>
            <span>Admin Accessories: <span className="font-bold">{accessoryCount}</span></span>
          </div>
        </div>
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
              <tr key={p._id || p.id} className="border-t border-gray-300 hover:bg-gray-50">
                <td className="p-2">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded border" />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </td>
                <td className="p-2 font-semibold">{p.name}</td>
                <td className="p-2">{p.category}</td>
                <td className="p-2">{p.brand || "-"}</td>
                <td className="p-2">{p.color || "-"}</td>
                <td className="p-2">₹{p.price}</td>
                <td className="p-2">{(p.avgRating !== undefined && p.avgRating !== null) ? p.avgRating.toFixed(1) : (p.rating ? (typeof p.rating === 'number' ? p.rating.toFixed(1) : p.rating) : "-")}</td>
                <td className="p-2">{p.isOffer ? "Offer" : "-"}</td>
                <td className="p-2">{p.isBestSeller ? "Yes" : "No"}</td>
                <td className="p-2">{p.inStock ? "In Stock" : "Out of Stock"}</td>
                <td className="p-2 flex gap-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => handleEdit(p._id || p.id)}>Edit</button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDelete(p._id || p.id)}>Delete</button>
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
