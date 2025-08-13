import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct, addAccessory } from "../utils/api";

const AdminAddProduct = () => {
  const [productType, setProductType] = useState("Product");
  const [product, setProduct] = useState({
    name: "",
    price: "",
    images: [], // Array of base64 strings
    category: "",
    brand: "",
    color: "",
    description: "",
    offer: false,
    offerPrice: "",
    discountPercent: "",
    bestSeller: false,
    freeDelivery: false,
    deliveryPrice: "",
    inStock: true,
    stock: 10
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Handle multiple image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 3;
    const currentImages = product.images || [];
    const remainingSlots = maxImages - currentImages.length;
    const filesToAdd = files.slice(0, remainingSlots);

    // Upload each file to backend and get URL
    const uploadPromises = filesToAdd.map(async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/products/upload-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      return data.imageUrl;
    });

    const urls = await Promise.all(uploadPromises);
    const newImages = [...currentImages, ...urls].slice(0, maxImages);
    setProduct(prev => ({ ...prev, images: newImages }));
    setImagePreviews(newImages);
  };

  // Remove a selected image
  const handleRemoveImage = (idx) => {
    const updatedImages = product.images.filter((_, i) => i !== idx);
    setProduct(prev => ({ ...prev, images: updatedImages }));
    setImagePreviews(updatedImages);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const newProduct = {
      ...product,
      price: Number(product.price),
      isOffer: !!product.offer,
      isBestSeller: !!product.bestSeller,
      offerPrice: product.offer ? Number(product.offerPrice) : undefined,
      discountPercent: product.offer ? Number(product.discountPercent) : undefined,
      freeDelivery: !!product.freeDelivery,
      deliveryPrice: product.freeDelivery ? 0 : Number(product.deliveryPrice),
      inStock: !!product.inStock,
      images: product.images || [],
      image: (product.images && product.images.length > 0) ? product.images[0] : ""
    };
    try {
      if (productType === "Product") {
        await addProduct(newProduct);
      } else {
        const accessoryData = {
          name: product.name,
          price: Number(product.price),
          image: (product.images && product.images.length > 0) ? product.images[0] : "",
          images: product.images || [],
          category: product.category,
          brand: product.brand,
          color: product.color,
          inStock: !!product.inStock,
          stock: Number(product.stock),
          isOffer: !!product.offer,
          isBestSeller: !!product.bestSeller,
          description: product.description,
          offerPrice: product.offer ? Number(product.offerPrice) : 0,
          discountPercent: product.offer ? Number(product.discountPercent) : 0,
          freeDelivery: !!product.freeDelivery,
          deliveryPrice: product.freeDelivery ? 0 : Number(product.deliveryPrice)
        };
        await addAccessory(accessoryData);
      }
      navigate("/admin/existing-products");
    } catch (err) {
      alert("Error adding item. Please try again.");
    }
  };

  const PRODUCT_CATEGORIES = ["Smartphones", "Smartwatches", "Tablets", "Laptops"];
  const PRODUCT_BRANDS = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Realme", "Oppo", "Vivo", "Lenovo", "HP", "Dell", "Asus"];
  const ACCESSORY_CATEGORIES = [
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
  const ACCESSORY_BRANDS = [
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
  const categoryOptions = productType === "Product" ? PRODUCT_CATEGORIES : ACCESSORY_CATEGORIES;
  const brandOptions = productType === "Product" ? PRODUCT_BRANDS : ACCESSORY_BRANDS;
  const colorOptions = ["Black", "Silver", "White", "Blue", "Green", "Red", "Yellow", "Other"];

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Add New {productType}</h2>
      <form onSubmit={handleAdd} className="space-y-4">
        <div className="flex gap-4 mb-2">
          <label className="font-semibold">Add to:</label>
          <select className="border p-2 rounded" value={productType} onChange={e => setProductType(e.target.value)}>
            <option value="Product">Products</option>
            <option value="Accessory">Accessories</option>
          </select>
        </div>
        <input className="w-full border p-2 rounded" name="name" placeholder="Name" value={product.name} onChange={handleChange} required />
        <input className="w-full border p-2 rounded" name="price" placeholder="Price" type="number" min="1" value={product.price} onChange={handleChange} required />
        <input className="w-full border p-2 rounded" name="stock" placeholder="Stock Quantity" type="number" min="0" value={product.stock} onChange={handleChange} required />
        <div>
          <label className="block font-semibold mb-1">Product Images (up to 3):</label>
          <label className="inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 transition mb-2">
            Upload Images
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </label>
          <div className="flex gap-2 mt-2">
            {imagePreviews.map((img, idx) => (
              <div key={idx} className="relative">
                <img src={img} alt={`Preview ${idx+1}`} className="w-20 h-20 object-cover rounded border" />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                  onClick={() => handleRemoveImage(idx)}
                  title="Remove image"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        <textarea className="w-full border p-2 rounded" name="description" placeholder="Description" value={product.description} onChange={handleChange} />
        <select className="w-full border p-2 rounded" name="category" value={product.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select className="w-full border p-2 rounded" name="brand" value={product.brand} onChange={handleChange} required>
          <option value="">Select Brand</option>
          {brandOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select className="w-full border p-2 rounded" name="color" value={product.color} onChange={handleChange} required>
          <option value="">Select Color</option>
          {colorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
  {/* Removed size field */}
        <input className="w-full border p-2 rounded" name="tags" placeholder="Tags (comma separated)" value={product.tags} onChange={handleChange} />
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2"><input type="checkbox" name="offer" checked={product.offer} onChange={handleChange} /> Offer</label>
          {product.offer && (
            <>
              <input className="border p-2 rounded" name="offerPrice" placeholder="Offer Price" type="number" min="1" value={product.offerPrice} onChange={handleChange} />
              <input className="border p-2 rounded" name="discountPercent" placeholder="Discount %" type="number" min="0" max="100" value={product.discountPercent} onChange={handleChange} />
            </>
          )}
        </div>
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2"><input type="checkbox" name="bestSeller" checked={product.bestSeller} onChange={handleChange} /> Best Seller</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="freeDelivery" checked={product.freeDelivery} onChange={handleChange} /> Free Delivery</label>
          {!product.freeDelivery && (
            <input className="border p-2 rounded" name="deliveryPrice" placeholder="Delivery Price" type="number" min="0" value={product.deliveryPrice} onChange={handleChange} />
          )}
        </div>
        <label className="flex items-center gap-2"><input type="checkbox" name="inStock" checked={product.inStock} onChange={handleChange} /> In Stock</label>
        <div className="flex gap-2">
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Add {productType}</button>
          <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => navigate("/admin/existing-products")}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddProduct;
