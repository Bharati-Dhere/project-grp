import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProducts, fetchAccessories, updateProduct, updateAccessory } from "../utils/api";

const categoryOptions = ["Smartphones", "Smartwatches", "Tablets", "Laptops", "Accessories", "Fashion", "Home", "Electronics"];
const brandOptions = ["Apple", "Samsung", "OnePlus", "HP", "Dell", "Lenovo", "Boat", "Sony", "Other"];
const colorOptions = ["Black", "Silver", "White", "Blue", "Green", "Red", "Yellow", "Other"];

const AdminEditProduct = () => {
  const { id } = useParams();
  const query = new URLSearchParams(window.location.search);
  const type = query.get("type") || "Product";
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (type === "Product") {
      fetchProducts().then((products) => {
        const found = products.find((p) => String(p._id || p.id) === String(id));
        setProduct(found);
      });
    } else {
      fetchAccessories().then((accessories) => {
        const found = accessories.find((p) => String(p._id || p.id) === String(id));
        setProduct(found);
      });
    }
  }, [id, type]);

  if (!product) return <div className="p-6">Product not found.</div>;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const updatedProduct = {
      ...product,
      price: Number(product.price),
      rating: Number(product.rating),
      offerPrice: product.offer ? Number(product.offerPrice) : undefined,
      discountPercent: product.offer ? Number(product.discountPercent) : undefined,
      bestSeller: !!product.bestSeller,
      freeDelivery: !!product.freeDelivery,
      deliveryPrice: product.freeDelivery ? 0 : Number(product.deliveryPrice),
      inStock: !!product.inStock
    };
    try {
      if (type === "Product") {
        await updateProduct(product._id || product.id, updatedProduct);
      } else {
        await updateAccessory(product._id || product.id, updatedProduct);
      }
      navigate("/admin/existing-products");
    } catch (err) {
      alert("Error saving changes. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <input className="w-full border p-2" name="name" placeholder="Name" value={product.name} onChange={handleChange} required />
        <input className="w-full border p-2" name="price" placeholder="Price" type="number" min="1" value={product.price} onChange={handleChange} required />
        <input className="w-full border p-2" name="stock" placeholder="Stock Quantity" type="number" min="0" value={product.stock} onChange={handleChange} required />
        <input className="w-full border p-2" name="image" placeholder="Image URL" value={product.image} onChange={handleChange} required />

        <select className="w-full border p-2" name="category" value={product.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>

        <select className="w-full border p-2" name="brand" value={product.brand} onChange={handleChange} required>
          <option value="">Select Brand</option>
          {brandOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>

        <select className="w-full border p-2" name="color" value={product.color} onChange={handleChange} required>
          <option value="">Select Color</option>
          {colorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>

        <input className="w-full border p-2" name="rating" placeholder="Rating (1-5)" type="number" min="1" max="5" step="0.1" value={product.rating} onChange={handleChange} required />
        <textarea className="w-full border p-2" name="description" placeholder="Description" value={product.description} onChange={handleChange} />

        <div className="flex items-center gap-2">
          <input type="checkbox" name="offer" checked={!!product.offer} onChange={handleChange} id="offer" />
          <label htmlFor="offer">Offer</label>
        </div>
        {product.offer && (
          <div className="flex gap-2">
            <input className="w-1/2 border p-2" name="offerPrice" placeholder="Offer Price" type="number" value={product.offerPrice || ""} onChange={handleChange} />
            <input className="w-1/2 border p-2" name="discountPercent" placeholder="Discount %" type="number" value={product.discountPercent || ""} onChange={handleChange} />
          </div>
        )}
        <div className="flex items-center gap-2">
          <input type="checkbox" name="bestSeller" checked={!!product.bestSeller} onChange={handleChange} id="bestSeller" />
          <label htmlFor="bestSeller">Best Seller</label>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="freeDelivery" checked={!!product.freeDelivery} onChange={handleChange} id="freeDelivery" />
          <label htmlFor="freeDelivery">Free Delivery</label>
        </div>
        {!product.freeDelivery && (
          <input className="w-full border p-2" name="deliveryPrice" placeholder="Delivery Price" type="number" value={product.deliveryPrice || ""} onChange={handleChange} />
        )}
        <div className="flex items-center gap-4">
          <span className="font-medium">Stock Status:</span>
          <label className="flex items-center gap-1">
            <input type="radio" name="inStock" value="true" checked={!!product.inStock} onChange={() => setProduct(prev => ({ ...prev, inStock: true }))} />
            In Stock
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" name="inStock" value="false" checked={!product.inStock} onChange={() => setProduct(prev => ({ ...prev, inStock: false }))} />
            Out of Stock
          </label>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save Changes</button>
          <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => navigate("/admin/existing-products")}>Back</button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditProduct;
