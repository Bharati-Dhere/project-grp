import defaultAvatar from '../assets/default-avtar.jpg';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaHeart, FaRegHeart } from "react-icons/fa";

import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";
import { fetchCart, updateCart, fetchWishlist, updateWishlist } from "../utils/api";

export default function ProductCard({
  product,
  inCart,
  inWishlist,
  onAddToCart,
  onRemoveFromCart,
  onAddToWishlist,
  onRemoveFromWishlist,
  showActions = true,
  pageType,
  style,
  detailsPath = "productdetails",
  cart = [],
  wishlist = [],
}) {
  // Helper to get correct image src
  const getImageSrc = (imgPath) => {
    if (!imgPath) return defaultAvatar;
    if (imgPath.startsWith('http')) return imgPath;
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}${imgPath}`;
  };
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("");
  const { user } = useAuth();
  // Robustly determine inCart/inWishlist for both Product and Accessory
  let isInCart = !!inCart;
  let isInWishlist = !!inWishlist;
  const productId = product._id || product.id;
  const model = (product.model && product.model.toLowerCase()) || (product.type && product.type.toLowerCase()) || (product.category && product.category.toLowerCase().includes('accessor') ? 'accessory' : 'product');
  if (cart && cart.length > 0 && typeof inCart === 'undefined') {
    isInCart = cart.some(c => {
      const cid = c.product?._id || c.product?.id || c._id || c.id;
      const cmodel = (c.model && c.model.toLowerCase()) || (c.category && c.category.toLowerCase().includes('accessor') ? 'accessory' : 'product');
      return String(cid) === String(productId) && cmodel === model;
    });
  }
  if (wishlist && wishlist.length > 0 && typeof inWishlist === 'undefined') {
    isInWishlist = wishlist.some(w => {
      const wid = w._id || w.id;
      const wmodel = (w.model && w.model.toLowerCase()) || (w.category && w.category.toLowerCase().includes('accessor') ? 'accessory' : 'product');
      return String(wid) === String(productId) && wmodel === model;
    });
  }

  const handleCartClick = (e) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalReason("cart");
      setShowAuthModal(true);
      return;
    }
    if (isInCart) {
      onRemoveFromCart && onRemoveFromCart();
    } else {
      onAddToCart && onAddToCart();
    }
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalReason("wishlist");
      setShowAuthModal(true);
      return;
    }
    if (isInWishlist) {
      onRemoveFromWishlist && onRemoveFromWishlist();
    } else {
      onAddToWishlist && onAddToWishlist();
    }
  };


  const handleOrderNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setAuthModalReason("order");
      setShowAuthModal(true);
      return;
    }
    navigate("/ordernow", { state: { product, amount: 1 } });
  };

  const handleCardClick = (e) => {
    if (
      e.target.tagName === "BUTTON" ||
      e.target.closest("button") ||
      e.target.classList.contains("order-now-btn")
    ) {
      return;
    }
    const productId = product._id ? product._id : product.id;
    // Always use detailsPath prop for routing, but force accessory detection for robustness
    const isAccessory = [
      product.model,
      product.type,
      product.category
    ].some(
      v => typeof v === 'string' && v.toLowerCase().includes('accessor')
    );
    if (isAccessory || detailsPath === 'accessory') {
      navigate(`/accessory/${productId}`);
      return;
    }
    navigate(`/productdetails/${productId}`);
  };

  // Use first image from images array if available, else fallback to product.image, else defaultAvatar
  const cardImage = (product.images && product.images.length > 0 && product.images[0])
    || (product.image && product.image !== '' ? product.image : defaultAvatar);

  return (
    <div
      className="relative bg-white rounded-lg shadow-md group w-full max-w-[220px] min-w-[180px] mx-auto cursor-pointer border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-blue-400 animate-fade-in-long"
      style={style}
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative w-full flex items-center justify-center bg-gray-100 rounded-t-lg overflow-hidden" style={{ height: 180 }}>
        <div className="flex items-center justify-center" style={{ width: 150, height: 150 }}>
          <img
            alt={product.name}
            src={getImageSrc(cardImage)}
            className="object-contain rounded-md"
            style={{ width: 150, height: 150, display: 'block', margin: 'auto' }}
            onError={e => { e.target.onerror = null; e.target.src = defaultAvatar; }}
          />
        </div>
        {/* Rating & Review Badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full shadow text-xs font-semibold">
          <span className="text-green-600">{Number.isFinite(Number(product.avgRating)) ? Number(product.avgRating).toFixed(1) : '0'}</span>
          <span className="text-yellow-500">★</span>
          <span className="text-gray-600">{product.ratingCount || product.reviews?.length || 0}</span>
        </div>
        {/* Wishlist Icon */}
        {showActions && !pageType && (
          <button
            onClick={handleWishlistClick}
            className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-pink-100 transition"
            style={{ zIndex: 10 }}
          >
            {isInWishlist ? (
              <FaHeart className="text-pink-500" size={18} />
            ) : (
              <FaRegHeart className="text-gray-400 hover:text-pink-500" size={18} />
            )}
          </button>
        )}
        {/* AD badge example (optional) */}
        {product.isAd && (
          <span className="absolute top-2 left-2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded font-bold">AD</span>
        )}
      </div>
      {/* Info Section */}
      <div className="px-4 py-3 flex flex-col gap-1">
        <div className="font-bold text-base text-gray-900 leading-tight">{product.brand}</div>
        <div className="font-semibold text-sm text-gray-800 mb-1">{product.name}</div>
        {product.description && (
          <div className="text-xs text-gray-500 mb-1">{product.description}</div>
        )}
        {product.size && (
          <div className="text-xs text-gray-500 mb-1">Sizes: {product.size}</div>
        )}
        {/* Price Section */}
        <div className="flex items-end gap-2 mb-1">
          <span className="text-lg font-bold text-green-700">Rs. {product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">Rs. {product.originalPrice}</span>
          )}
          {product.discountPercent && (
            <span className="text-xs text-pink-600 font-semibold">({product.discountPercent}% OFF)</span>
          )}
        </div>
        {/* Action buttons for product listing */}
        {showActions && !pageType && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCartClick}
              className={`flex-1 py-1 rounded text-xs font-semibold border ${isInCart ? 'bg-red-500 text-white border-red-500' : 'bg-white text-blue-700 border-blue-700 hover:bg-blue-700 hover:text-white'} transition`}
            >
              {isInCart ? (<><FaTrash /> <span>Remove</span></>) : 'Add to Cart'}
            </button>
            <button
              onClick={handleOrderNow}
              className="flex-1 bg-blue-700 text-white py-1 rounded text-xs font-semibold hover:bg-blue-800 transition order-now-btn"
            >
              Order Now
            </button>
          </div>
        )}
      </div>
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} reason={authModalReason} />
      )}
    </div>
  );
}
