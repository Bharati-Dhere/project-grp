import React, { useState } from "react";

const initialState = {
  name: "",
  price: "",
  image: "",
  images: ["", "", ""],
  category: "",
  brand: "",
  color: "",
  inStock: true,
  stock: "",
  isOffer: false,
  isBestSeller: false,
  badge: "",
  description: ""
};

const categories = [
  "Smartphones",
  "Smartwatches",
  "Tablets",
  "Laptops",
  "Accessories",
  "Fashion",
  "Home",
  "Electronics"
];

const ProductForm = ({ onSubmit, initialProduct }) => {
  const [product, setProduct] = useState(initialProduct || initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (idx, value) => {
    setProduct((prev) => {
      const newImages = [...prev.images];
      newImages[idx] = value;
      return { ...prev, images: newImages };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!product.name || !product.price || !product.image || !product.category) {
      alert("Please fill all required fields.");
      return;
    }
    onSubmit({
      ...product,
      price: Number(product.price),
      id: Date.now()
    });
    setProduct(initialState);
  };

  return (
    <form className="space-y-4 bg-white p-6 rounded shadow max-w-lg mx-auto" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-2">Add New Product</h2>
      <input name="name" value={product.name} onChange={handleChange} placeholder="Product Name" className="w-full border p-2 rounded" required />
      <input name="price" value={product.price} onChange={handleChange} placeholder="Price" type="number" className="w-full border p-2 rounded" required />
      <input name="image" value={product.image} onChange={handleChange} placeholder="Main Image URL" className="w-full border p-2 rounded" required />
      <div className="flex gap-2">
        {product.images.map((img, idx) => (
          <input
            key={idx}
            value={img}
            onChange={e => handleImageChange(idx, e.target.value)}
            placeholder={`Image ${idx + 1} URL`}
            className="flex-1 border p-2 rounded"
          />
        ))}
      </div>
      <select name="category" value={product.category} onChange={handleChange} className="w-full border p-2 rounded" required>
        <option value="">Select Category</option>
        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      <input name="brand" value={product.brand} onChange={handleChange} placeholder="Brand" className="w-full border p-2 rounded" />
      <input name="color" value={product.color} onChange={handleChange} placeholder="Color" className="w-full border p-2 rounded" />
      <textarea name="description" value={product.description} onChange={handleChange} placeholder="Description" className="w-full border p-2 rounded" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Add Product</button>
    </form>
  );
};

export default ProductForm;
