import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProducts, fetchAccessories, updateProduct, updateAccessory } from "../utils/api";

const PRODUCT_CATEGORIES = ["Smartphones", "Smartwatches", "Tablets", "Laptops"];
const PRODUCT_BRANDS = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Realme", "Oppo", "Vivo", "Lenovo", "HP", "Dell", "Asus"];
const ACCESSORY_CATEGORIES = [
  "Mobile Covers", "Headphones", "USB", "Chargers", "Screen Protectors", "Power Banks", "Bluetooth Speakers", "Smart Bands", "Car Accessories", "Other"
];
const ACCESSORY_BRANDS = ["Boat", "JBL", "Realme", "Samsung", "MI", "Portronics", "Noise", "OnePlus", "Sony", "Other"];
const COLOR_OPTIONS = ["Black", "Silver", "White", "Blue", "Green", "Red", "Yellow", "Other"];
const colorOptions = ["Black", "Silver", "White", "Blue", "Green", "Red", "Yellow", "Other"];

const AdminEditProduct = () => {
  const { id } = useParams();
  const query = new URLSearchParams(window.location.search);
  const type = query.get("type") || "Product";
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (type === "Product") {
      fetchProducts().then((products) => {
        const found = products.find((p) => String(p._id || p.id) === String(id));
        if (!found) {
          // Debug output
          alert(`Product with id ${id} not found. Products: ` + JSON.stringify(products));
        }
        setProduct(found);
        setImagePreviews(found?.images || (found?.image ? [found.image] : []));
      }).catch(err => {
        alert('Error fetching products: ' + err.message);
      });
    } else {
      fetchAccessories().then((accessories) => {
        const found = accessories.find((p) => String(p._id || p.id) === String(id));
        if (!found) {
          // Debug output
          alert(`Accessory with id ${id} not found. Accessories: ` + JSON.stringify(accessories));
        }
        setProduct(found);
        setImagePreviews(found?.images || (found?.image ? [found.image] : []));
      }).catch(err => {
        alert('Error fetching accessories: ' + err.message);
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 3;
    const currentImages = product.images || imagePreviews || [];
    const remainingSlots = maxImages - currentImages.length;
    const filesToAdd = files.slice(0, remainingSlots);
    const readers = filesToAdd.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(imgs => {
      const newImages = [...currentImages, ...imgs].slice(0, maxImages);
      setProduct(prev => ({ ...prev, images: newImages }));
      setImagePreviews(newImages);
    });
  };

  const handleRemoveImage = (idx) => {
    const updatedImages = (product.images || imagePreviews).filter((_, i) => i !== idx);
    setProduct(prev => ({ ...prev, images: updatedImages }));
    setImagePreviews(updatedImages);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const updatedProduct = {
      ...product,
      price: Number(product.price),
      isOffer: !!product.isOffer,
      isBestSeller: !!product.isBestSeller,
      offerPrice: product.isOffer ? Number(product.offerPrice) : undefined,
      discountPercent: product.isOffer ? Number(product.discountPercent) : undefined,
      freeDelivery: !!product.freeDelivery,
      deliveryPrice: product.freeDelivery ? 0 : Number(product.deliveryPrice),
      inStock: !!product.inStock,
      size: product.size,
      tags: product.tags,
      images: product.images || imagePreviews || []
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
      <h2 className="text-2xl font-bold mb-6">Edit {type}</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <input className="w-full border p-2" name="name" placeholder="Name" value={product.name} onChange={handleChange} required />
        <input className="w-full border p-2" name="price" placeholder="Price" type="number" min="1" value={product.price} onChange={handleChange} required />
        <input className="w-full border p-2" name="stock" placeholder="Stock Quantity" type="number" min="0" value={product.stock || 0} onChange={handleChange} required />
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

        <select className="w-full border p-2" name="category" value={product.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          {(type === "Product" ? PRODUCT_CATEGORIES : ACCESSORY_CATEGORIES).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>

        <select className="w-full border p-2" name="brand" value={product.brand} onChange={handleChange} required>
          <option value="">Select Brand</option>
          {(type === "Product" ? PRODUCT_BRANDS : ACCESSORY_BRANDS).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>

        <select className="w-full border p-2" name="color" value={product.color} onChange={handleChange} required>
          <option value="">Select Color</option>
          {COLOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>

        <textarea className="w-full border p-2" name="description" placeholder="Description" value={product.description} onChange={handleChange} />

        <div className="flex items-center gap-2">
          <input type="checkbox" name="isOffer" checked={!!product.isOffer} onChange={handleChange} id="isOffer" />
          <label htmlFor="isOffer">Offer</label>
        </div>
        {product.isOffer && (
          <div className="flex gap-2">
            <input className="w-1/2 border p-2" name="offerPrice" placeholder="Offer Price" type="number" value={product.offerPrice || ""} onChange={handleChange} />
            <input className="w-1/2 border p-2" name="discountPercent" placeholder="Discount %" type="number" value={product.discountPercent || ""} onChange={handleChange} />
          </div>
        )}
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isBestSeller" checked={!!product.isBestSeller} onChange={handleChange} id="isBestSeller" />
          <label htmlFor="isBestSeller">Best Seller</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="freeDelivery"
            checked={product.freeDelivery === true || product.freeDelivery === 'true'}
            onChange={handleChange}
            id="freeDelivery"
          />
          <label htmlFor="freeDelivery">Free Delivery</label>
        </div>
        {!(product.freeDelivery === true || product.freeDelivery === 'true') && (
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
