import React, { useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

export default function OrderRelatedCard({ item, inCart, inWishlist, onAddToCart, onRemoveFromCart, onAddToWishlist, onRemoveFromWishlist, onOrderNow }) {
  const [amount, setAmount] = useState(1);

  // Helper to get correct image src
  const getImageSrc = (imgPath) => {
    if (!imgPath) return '';
    if (imgPath.startsWith('http')) return imgPath;
    // For local images, prepend backend domain in production
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}${imgPath}`;
  };

  return (
    <div className="shadow-lg rounded-lg p-6 flex flex-col md:flex-row gap-6 bg-white max-w-2xl mx-auto">
      <div className="flex-shrink-0">
        <img
          src={getImageSrc(item.image)}
          alt={item.name}
          className="w-64 h-64 object-cover rounded-lg"
        />
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
        <p className="text-gray-700 mb-2">{item.description}</p>
        <div className="mb-2 flex items-center gap-2">
          <span className="font-semibold">Category:</span>
          <span>{item.category}</span>
        </div>
        <div className="mb-2 flex items-center gap-2">
          <span className="font-semibold">Price:</span>
          <span>₹{item.price}</span>
        </div>
        <div className="mb-2 flex items-center gap-2">
          <span className="font-semibold">Rating:</span>
          <span>{item.rating} ⭐</span>
        </div>
        <div className="mb-4">
          <label className="mr-2 font-semibold">Amount:</label>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="border px-2 py-1 rounded w-20"
          />
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={inCart ? onRemoveFromCart : onAddToCart}
            className={`px-4 py-2 rounded transition font-semibold ${inCart ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
          >
            {inCart ? 'Remove from Cart' : 'Add to Cart'}
          </button>
          <button
            onClick={() => onOrderNow(amount)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
          >
            Order Now
          </button>
          <button
            onClick={inWishlist ? onRemoveFromWishlist : onAddToWishlist}
            className="ml-2 p-2 rounded-full border border-pink-500 bg-white hover:bg-pink-100 transition"
            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            {inWishlist ? (
              <FaHeart className="text-pink-500" size={20} />
            ) : (
              <FaRegHeart className="text-pink-500" size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
