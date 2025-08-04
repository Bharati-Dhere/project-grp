import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import accessoriesData from "../utils/accessoriesData";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const AccessoriesDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accessory, setAccessory] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [amount, setAmount] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("accessories");
    const accessories = stored ? JSON.parse(stored) : accessoriesData;
    const found = accessories.find((a) => String(a.id) === String(id));
    setAccessory(found);
    setMainImage(found?.images ? found.images[0] : found?.image);
    // Cart & Wishlist logic (simplified)
    setIsInCart(false);
    setIsInWishlist(false);
  }, [id]);

  if (!accessory) return <div className="p-6">Accessory not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow-lg">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center gap-4">
          <img src={mainImage} alt={accessory.name} className="w-64 h-64 object-cover rounded border" />
          <div className="flex gap-2 mt-2">
            {accessory.images && accessory.images.map((img, idx) => (
              <img key={idx} src={img} alt={`Thumb ${idx+1}`} className="w-16 h-16 object-cover rounded border cursor-pointer" onClick={() => setMainImage(img)} />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">{accessory.name}</h2>
          <div className="flex gap-2 mb-2">
            {accessory.isBestSeller && <span className="bg-yellow-400 text-white px-2 py-1 rounded text-xs font-semibold">Best Seller</span>}
            {accessory.isOffer && <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">Offer</span>}
            {accessory.badge && <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">{accessory.badge}</span>}
          </div>
          <p className="mb-2"><span className="font-semibold">Category:</span> {accessory.category}</p>
          <p className="mb-2"><span className="font-semibold">Brand:</span> {accessory.brand}</p>
          <p className="mb-2"><span className="font-semibold">Color:</span> {accessory.color}</p>
          <p className="mb-2"><span className="font-semibold">Price:</span> ₹{accessory.price}</p>
          <p className="mb-2"><span className="font-semibold">Rating:</span> {accessory.rating}</p>
          <p className="mb-2"><span className="font-semibold">Stock:</span> {accessory.inStock ? "In Stock" : "Out of Stock"}</p>
          <p className="mb-4"><span className="font-semibold">Description:</span> {accessory.description}</p>
          <div className="flex gap-4">
            <button className="bg-green-500 text-white px-4 py-2 rounded">Order Now</button>
            <button className="bg-blue-500 text-white px-4 py-2 rounded">Add to Wishlist</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessoriesDetails;
