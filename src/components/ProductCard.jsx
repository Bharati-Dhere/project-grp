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
}) {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("");
  const { user } = useAuth();
  // Always use props for cart/wishlist state so it updates with user/account changes
  const isInCart = !!inCart;
  const isInWishlist = !!inWishlist;

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

  // const handleAddToWishlist = async (e) => {
  //   e.stopPropagation();
  //   if (!user) {
  //     setAuthModalReason("wishlist");
  //     setShowAuthModal(true);
  //     return;
  //   }
  //   if (!isInWishlist && onAddToWishlist) {
  //     onAddToWishlist();
  //     window.dispatchEvent(new Event('cartWishlistUpdated'));
  //   } else if (isInWishlist && onRemoveFromWishlist) {
  //     onRemoveFromWishlist();
  //     window.dispatchEvent(new Event('cartWishlistUpdated'));
  //   } else if (!isInWishlist) {
  //     // Fallback: add to wishlist via backend
  //     try {
  //       const wishlist = await fetchWishlist();
  //       const updated = [...(wishlist || []), product];
  //       await updateWishlist(updated.map(p => p._id || p.id));
  //       await fetchWishlist();
  //       window.dispatchEvent(new Event('cartWishlistUpdated'));
  //     } catch {}
  //   } else if (isInWishlist) {
  //     // Fallback: remove from wishlist via backend
  //     try {
  //       const wishlist = await fetchWishlist();
  //       const updated = (wishlist || []).filter((w) => (w._id || w.id) !== (product._id || product.id));
  //       await updateWishlist(updated.map(p => p._id || p.id));
  //       await fetchWishlist();
  //       window.dispatchEvent(new Event('cartWishlistUpdated'));
  //     } catch {}
  //   }
  // };

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
    const productId = product._id || product.id;
    // Robust detection: always route to /accessory/:id if product is an accessory
    const isAccessory = (product.model && product.model.toLowerCase() === 'accessory')
      || (product.type && product.type.toLowerCase() === 'accessory')
      || (product.category && product.category.toLowerCase().includes('accessor'));
    if (isAccessory) {
      navigate(`/accessory/${productId}`);
      return;
    }
    // Otherwise, use detailsPath
    let path = detailsPath;
    if (!detailsPath || detailsPath === '') {
      path = 'productdetails';
    }
    if (path === 'productdetails') {
      navigate(`/productdetails/${productId}`);
    } else if (path === 'accessory') {
      navigate(`/accessory/${productId}`);
    } else if (path === 'accessorydetails' || path === 'accessories') {
      navigate(`/accessories/${productId}`);
    } else {
      // fallback: try productdetails
      navigate(`/productdetails/${productId}`);
    }
  };

  return (
    <div
      className="relative rounded-2xl shadow-xl group w-full max-w-[340px] min-w-[280px] mx-auto cursor-pointer bg-neutral-900 border border-neutral-800 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-blue-400/40 animate-fade-in-long"
      style={style}
      onClick={handleCardClick}
    >
      <div className="relative rounded-2xl bg-neutral-900 shadow-xl overflow-hidden flex flex-col h-full transition-all duration-400 group-hover:bg-neutral-800">
        {(product.isOffer === true || product.isOffer === 'Yes' || product.isBestSeller === true || product.isBestSeller === 'Yes') && (
          <div className="absolute top-3 left-3 z-30 flex gap-2 animate-fade-in pointer-events-none">
            {(product.isOffer === true || product.isOffer === 'Yes') && (
              <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:shadow-lg">
                Offer
              </span>
            )}
            {(product.isBestSeller === true || product.isBestSeller === 'Yes') && (
              <span className="bg-yellow-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:shadow-lg">
                Best Seller
              </span>
            )}
          </div>
        )}

        {/* Remove buttons for cart/wishlist */}
        {showActions && pageType === "cart" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFromCart && onRemoveFromCart();
              window.dispatchEvent(new Event('cartWishlistUpdated'));
            }}
            className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full z-10 hover:bg-red-700 transition"
          >
            Remove
          </button>
        )}
        {showActions && pageType === "wishlist" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFromWishlist && onRemoveFromWishlist();
              window.dispatchEvent(new Event('cartWishlistUpdated'));
            }}
            className="absolute top-3 right-3 bg-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full z-10 hover:bg-pink-700 transition"
          >
            Remove
          </button>
        )}

        {/* Product Image */}
        <div className="relative bg-gray-100 m-4 rounded-xl p-3 flex justify-center items-center h-52 overflow-hidden transition-all duration-300 ease-in-out">
          <img
            alt={product.name}
            src={product.image && product.image !== '' ? product.image : defaultAvatar}
            className="w-auto h-full object-contain transition-all duration-500 ease-in-out group-hover:scale-110 rounded-xl overflow-hidden"
            onError={e => { e.target.onerror = null; e.target.src = defaultAvatar; }}
          />
          {showActions && !pageType && (
            <div className="absolute bottom-2 right-2 z-20">
              <button
                onClick={handleWishlistClick}
                className="bg-white p-3 rounded-full hover:bg-white shadow-md transition-all duration-300 ease-in-out hover:scale-125 hover:animate-bounce"
              >
                {isInWishlist ? (
                  <FaHeart className="text-red-500" size={20} />
                ) : (
                  <FaRegHeart
                    className="text-blue-600 hover:text-red-500 transition duration-300"
                    size={20}
                  />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm text-gray-600 font-medium">{product.brand}</p>
            <span className="text-sm text-yellow-600 font-semibold">
              {Number.isFinite(Number(product.avgRating))
                ? Number(product.avgRating).toFixed(1)
                : (product.rating?.toFixed
                  ? product.rating.toFixed(1)
                  : (Number.isFinite(Number(product.rating)) ? Number(product.rating).toFixed(1) : '0'))}
              /5
            </span>
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-2">
            {product.name}
          </h3>

          {product.offer && product.originalPrice ? (
            <div className="flex justify-between items-end mb-3">
              <span className="text-lg font-bold text-green-600">
                ₹{product.price}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-bold text-green-600">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
          )}

          {/* Action buttons for product listing */}
          {showActions && !pageType && (
            <div className="flex gap-2 mt-3 items-stretch min-h-[44px]">
              <button
                onClick={handleCartClick}
                className={`w-1/2 py-1.5 px-2 rounded-xl text-xs font-semibold whitespace-nowrap tracking-wide flex items-center justify-center gap-1 transition-all duration-300 ease-in-out ${isInCart ? 'bg-red-500 text-white hover:bg-red-600 hover:bg-opacity-90 hover:shadow-lg active:scale-95' : 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white hover:bg-opacity-90 hover:shadow-lg active:scale-95'}`}
              >
                {isInCart ? (<><FaTrash /> <span>Remove from Cart</span></>) : 'Add to Cart'}
              </button>
              <button
                onClick={handleOrderNow}
                className="w-1/2 bg-blue-600 text-white py-1.5 px-2 rounded-xl text-xs hover:bg-blue-700 hover:bg-opacity-90 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out whitespace-nowrap tracking-wide font-semibold order-now-btn flex items-center justify-center"
              >
                Order Now
              </button>
            </div>
          )}

          {/* Cart page action */}
          {showActions && pageType === "cart" && (
            <div className="flex justify-between items-center mt-3">
              <button
                onClick={handleWishlistClick}
                className={`p-2 rounded-full border ${
                  isInWishlist
                    ? "bg-pink-100 text-pink-600 border-pink-600"
                    : "border-pink-500 text-pink-500 hover:bg-pink-100 hover:text-pink-600"
                } transition duration-200 flex items-center justify-center`}
                title={
                  isInWishlist
                    ? "Remove from Wishlist"
                    : "Add to Wishlist"
                }
              >
                {isInWishlist ? (
                  <FaHeart className="text-pink-600" size={18} />
                ) : (
                  <FaRegHeart className="text-pink-500" size={18} />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate("/ordernow", { state: { product, amount: 1 } });
                }}
                className="bg-blue-600 text-white py-1.5 px-4 rounded-full text-xs hover:bg-blue-700 hover:scale-105 transition duration-200 order-now-btn"
              >
                Order Now
              </button>
            </div>
          )}

          {/* Wishlist page action */}
          {showActions && pageType === "wishlist" && (
            <div className="flex flex-col gap-2 mt-3">
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleCartClick}
                  className={`flex-1 py-2 rounded-full text-sm whitespace-nowrap transition duration-200 flex items-center justify-center gap-1 ${isInCart ? 'bg-red-500 text-white hover:bg-red-700 hover:text-white hover:scale-105' : 'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white hover:scale-105'}`}
                >
                  {isInCart ? (<><FaTrash /> <span>Remove from Cart</span></>) : 'Add to Cart'}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate("/ordernow", { state: { product, amount: 1 } });
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-full text-sm hover:bg-blue-700 hover:scale-105 transition duration-200 whitespace-nowrap order-now-btn"
                >
                  Order Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} reason={authModalReason} />
      )}
    </div>
  );
}
