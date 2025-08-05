import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import accessoriesData from '../utils/accessoriesData';
import { getLoggedInUser } from '../utils/authUtils';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import AuthModal from '../components/AuthModal';
import ProductCard from '../components/ProductCard';

export default function AccessoriesDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accessory, setAccessory] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [amount, setAmount] = useState(1);
  const [userRating, setUserRating] = useState(5);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [ratingCount, setRatingCount] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const user = getLoggedInUser();

  useEffect(() => {
    async function fetchAccessory() {
      try {
        const res = await fetch(`http://localhost:5000/api/accessories/${id}`);
        const data = await res.json();
        setAccessory(data);
        setMainImage(data?.images ? data.images[0] : data?.image);
        setRatingCount(data.ratingCount || 0);
        setAvgRating(data.avgRating || null);
      } catch (err) {
        setAccessory(null);
      }
    }
    fetchAccessory();
    setIsInCart(false);
    setIsInWishlist(false);
  }, [id]);

  const handleAddRating = async () => {
    if (!user || !user.email) {
      setAuthModalReason("review");
      setShowAuthModal(true);
      return;
    }
    try {
      await fetch(`http://localhost:5000/api/accessories/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: user.email, value: userRating })
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      // Refetch accessory to update rating
      const res = await fetch(`http://localhost:5000/api/accessories/${id}`);
      const data = await res.json();
      setAccessory(data);
      setRatingCount(data.ratingCount || 0);
      setAvgRating(data.avgRating || null);
    } catch (err) {
      alert("Error submitting rating");
    }
  };

  // Guest restriction for Add to Cart
  const handleAddToCart = () => {
    if (!user || !user.email) {
      setAuthModalReason("cart");
      setShowAuthModal(true);
      return;
    }
    const cartKey = user?.email ? `cart_${user.email}` : 'cart_guest';
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    if (!cart.some((c) => String(c.id) === String(id))) {
      localStorage.setItem(cartKey, JSON.stringify([...cart, accessory]));
      setIsInCart(true);
      window.dispatchEvent(new Event('cartWishlistUpdated'));
    }
  };
  // Guest restriction for Remove from Cart
  const handleRemoveFromCart = () => {
    if (!user || !user.email) {
      setAuthModalReason("cart");
      setShowAuthModal(true);
      return;
    }
    const cartKey = user?.email ? `cart_${user.email}` : 'cart_guest';
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    cart = cart.filter((c) => String(c.id) !== String(id));
    localStorage.setItem(cartKey, JSON.stringify(cart));
    setIsInCart(false);
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  // Guest restriction for Add to Wishlist
  const handleAddToWishlist = () => {
    if (!user || !user.email) {
      setAuthModalReason("wishlist");
      setShowAuthModal(true);
      return;
    }
    const wishlistKey = user?.email ? `wishlist_${user.email}` : 'wishlist_guest';
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    if (!wishlist.some((w) => String(w.id) === String(id))) {
      localStorage.setItem(wishlistKey, JSON.stringify([...wishlist, accessory]));
      setIsInWishlist(true);
      window.dispatchEvent(new Event('cartWishlistUpdated'));
    }
  };
  // Guest restriction for Remove from Wishlist
  const handleRemoveFromWishlist = () => {
    if (!user || !user.email) {
      setAuthModalReason("wishlist");
      setShowAuthModal(true);
      return;
    }
    const wishlistKey = user?.email ? `wishlist_${user.email}` : 'wishlist_guest';
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    const updated = wishlist.filter((w) => String(w.id) !== String(id));
    localStorage.setItem(wishlistKey, JSON.stringify(updated));
    setIsInWishlist(false);
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };

  // Guest restriction for Order
  const handleOrder = () => {
    if (!user || !user.email) {
      setAuthModalReason("order");
      setShowAuthModal(true);
      return;
    }
    navigate("/ordernow", { state: { product: accessory, amount } });
  };

  // Use backend rating summary if available
  const ratingSummary = accessory?.ratingSummary || {};

  if (!accessory) {
    return (
      <div className="p-8 text-center">Accessory not found.</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-2xl shadow-2xl mt-8 relative transition-all duration-500">
      {/* Accessory Section */}
      <div className="flex flex-col md:flex-row gap-10 items-center md:items-center justify-center">
        {/* Accessory Image & Thumbnails */}
        <div className="flex flex-col items-center gap-4 justify-center">
          <div className="relative group flex justify-center">
            <img
              src={mainImage}
              alt={accessory.name}
              className="w-80 h-80 md:w-[28rem] md:h-[28rem] object-contain border-4 border-blue-300 rounded-2xl shadow-xl transform transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl hover:rotate-1 hover:scale-110 cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100"
              style={{ transition: 'box-shadow 0.4s, transform 0.4s' }}
            />
            <div className="absolute inset-0 rounded-2xl pointer-events-none group-hover:ring-4 group-hover:ring-blue-400 transition-all duration-500"></div>
          </div>
          {accessory.images?.length > 1 && (
            <div className="flex gap-3 mt-3 justify-center">
              {accessory.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${accessory.name} ${idx + 1}`}
                  className={`w-16 h-16 object-contain rounded-lg cursor-pointer border-2 transition-all duration-300 ${
                    mainImage === img ? "border-blue-500 scale-110 shadow-lg" : "border-gray-200 hover:border-blue-400 hover:scale-105"
                  }`}
                  onClick={() => setMainImage(img)}
                  style={{ transition: 'box-shadow 0.3s, transform 0.3s' }}
                />
              ))}
            </div>
          )}
        </div>
        {/* Accessory Details Context */}
        <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left px-2 md:px-8">
          <h2 className="text-3xl font-extrabold text-blue-700 mb-3 tracking-tight">{accessory.name}</h2>
          <p className="text-gray-700 mb-3 text-lg">{accessory.description}</p>
          <div className="flex flex-wrap gap-4 items-center mb-3">
            <span className="text-green-600 font-bold text-2xl">₹{accessory.price}</span>
            <span className="text-yellow-500 text-lg flex items-center">{accessory.rating}★</span>
            {accessory.offer && (
              <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-semibold shadow-sm animate-pulse">{accessory.offer}</span>
            )}
          </div>
          <div className="mb-3 flex flex-col items-center md:items-start">
            {accessory.stock > 0 && (
              <span className="flex items-center gap-3 font-extrabold text-lg px-5 py-2 rounded-full mb-2 bg-green-600 text-white shadow-xl animate-pulse border-2 border-green-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                In Stock
                <span className="ml-2 text-white text-base font-bold">({accessory.stock})</span>
              </span>
            )}
            {accessory.stock <= 0 && (
              <span className="flex items-center gap-2 font-semibold text-sm px-3 py-1 rounded-full mb-2 bg-red-100 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Out of Stock
              </span>
            )}
            <label className="mr-2 font-semibold">Amount:</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="border px-2 py-1 rounded w-24 text-center mt-1"
            />
          </div>
          <div className="flex gap-2 items-center justify-center md:justify-start mt-2">
            <button
              onClick={isInCart ? handleRemoveFromCart : handleAddToCart}
              className={`px-5 py-2 rounded-lg transition font-semibold shadow-md ${isInCart ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
            >
              {isInCart ? 'Remove from Cart' : 'Add to Cart'}
            </button>
            <button
              onClick={handleOrder}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
            >
              Order Now
            </button>
            <button
              onClick={isInWishlist ? handleRemoveFromWishlist : handleAddToWishlist}
              className="ml-2 p-2 rounded-full border border-pink-500 bg-white hover:bg-pink-100 transition shadow-md"
              title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              {isInWishlist ? (
                <FaHeart className="text-pink-500" size={22} />
              ) : (
                <FaRegHeart className="text-pink-500" size={22} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Rating Summary */}
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-3">Overall Rating Breakdown</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2">
              <span className="w-10 text-right text-sm font-medium">{star}★</span>
              <div className="w-full bg-gray-200 rounded h-3">
                <div
                  style={{ width: `${ratingSummary[star] || 0}%` }}
                  className="h-full bg-yellow-400 rounded"
                ></div>
              </div>
              <span className="w-12 text-sm text-gray-600">{ratingSummary[star] || 0}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Related Accessories Section */}
      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4">Related Accessories</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {accessoriesData
            .filter(
              (a) =>
                a.id !== accessory?.id &&
                (a.category === accessory?.category || a.brand === accessory?.brand)
            )
            .slice(0, 4)
            .map((a) => (
              (() => {
                const current = getLoggedInUser();
                const isLoggedIn = !!(current && current.email);
                const cartKey = current?.email ? `cart_${current.email}` : 'cart_guest';
                const wishlistKey = current?.email ? `wishlist_${current.email}` : 'wishlist_guest';
                const cartArr = isLoggedIn ? (JSON.parse(localStorage.getItem(cartKey)) || []) : [];
                const wishlistArr = isLoggedIn ? (JSON.parse(localStorage.getItem(wishlistKey)) || []) : [];
                const inCart = isLoggedIn ? cartArr.some((c) => c.id === a.id) : false;
                const inWishlist = isLoggedIn ? wishlistArr.some((w) => w.id === a.id) : false;
                return (
                  <ProductCard
                    key={a.id}
                    product={a}
                    detailsPath="accessories"
                    inCart={inCart}
                    inWishlist={inWishlist}
                    onAddToCart={isLoggedIn ? () => {/* add to cart logic here */} : undefined}
                    onRemoveFromCart={isLoggedIn ? () => {/* remove from cart logic here */} : undefined}
                    onAddToWishlist={isLoggedIn ? () => {/* add to wishlist logic here */} : undefined}
                    onRemoveFromWishlist={isLoggedIn ? () => {/* remove from wishlist logic here */} : undefined}
                    showActions={isLoggedIn}
                  />
                );
              })()
            ))}
        </div>
      </div>
    </div>
  );
}