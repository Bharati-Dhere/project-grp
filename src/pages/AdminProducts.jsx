import React, { useState, useEffect } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", image: "" });

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
    setProducts(storedProducts);
  }, []);

  const handleAddProduct = () => {
    if (!form.name || !form.price) return;
    const newProduct = { ...form, id: Date.now() };
    const updated = [...products, newProduct];
    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));
    setForm({ name: "", price: "", image: "" });
  };

  const handleDeleteProduct = (id) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));
  };

  const handleEditProduct = (product) => {
    setEditProduct(product);
    setForm(product);
  };

  const handleUpdateProduct = () => {
    const updated = products.map((p) =>
      p.id === editProduct.id ? { ...form, id: p.id } : p
    );
    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));
    setEditProduct(null);
    setForm({ name: "", price: "", image: "" });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Product Management</h1>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">{editProduct ? "Edit Product" : "Add Product"}</h2>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="border px-3 py-2 rounded mr-2"
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          className="border px-3 py-2 rounded mr-2"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={form.image}
          onChange={e => setForm({ ...form, image: e.target.value })}
          className="border px-3 py-2 rounded mr-2"
        />
        {editProduct ? (
          <button onClick={handleUpdateProduct} className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
        ) : (
          <button onClick={handleAddProduct} className="bg-green-600 text-white px-4 py-2 rounded">Add</button>
        )}
      </div>
      <h2 className="text-lg font-semibold mb-4">All Products</h2>
      <ul className="space-y-2">
        {products.length === 0 ? (
          <li className="text-gray-500">No products found.</li>
        ) : (
          products.map((p) => (
            <li key={p.id} className="bg-gray-50 p-4 rounded flex justify-between items-center">
              <div>
                <img src={p.image} alt={p.name} className="w-16 h-16 object-contain mb-2" />
                <div className="font-semibold">{p.name}</div>
                <div className="text-green-700">₹{p.price}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditProduct(p)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                <button onClick={() => handleDeleteProduct(p.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
