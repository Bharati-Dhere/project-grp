import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchAccessories, fetchCart, fetchWishlist, updateCart, updateWishlist } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import AuthModal from '../components/AuthModal';
import ProductCard from '../components/ProductCard';

export default function AccessoriesDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accessory, setAccessory] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [amount, setAmount] = useState(1);
  const [userRating, setUserRating] = useState(5);
  const [userReview, setUserReview] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [ratingCount, setRatingCount] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [related, setRelated] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch(`http://localhost:5000/api/accessories/${id}`);
        const data = await res.json();
        setAccessory(data);
        setMainImage(data?.images ? data.images[0] : data?.image);
        setRatingCount(data.ratingCount || 0);
        setAvgRating(data.avgRating || null);
        setReviews(data.reviews || []);
        // Fetch related products and accessories from backend (same category or brand, exclude self)
        const [allProducts, allAccessories] = await Promise.all([
          fetchProducts(),
          fetchAccessories()
        ]);
        const relatedProducts = allProducts.filter(
          (p) =>
            (p._id !== id && p.id !== id) &&
            (p.category === data.category || p.brand === data.brand)
        );
        const relatedAccessories = allAccessories.filter(
          (a) =>
            (a._id !== id && a.id !== id) &&
            (a.category === data.category || a.brand === data.brand)
        );
        setRelated([...relatedProducts, ...relatedAccessories].slice(0, 4));
      } catch (err) {
        setAccessory(null);
      }
      // Cart & Wishlist from backend
      try {
        const cartData = await fetchCart();
        setCart(cartData || []);
        setIsInCart((cartData || []).some((c) => (c.product?._id || c.product?.id || c._id || c.id) === id));
      } catch {}
      try {
        const wishlistData = await fetchWishlist();
        setWishlist(wishlistData || []);
        setIsInWishlist((wishlistData || []).some((w) => (w._id || w.id) === id));
      } catch {}
    }
    fetchAll();
  }, [id]);

  const handleAddReview = async () => {
    if (!user || !user.email) {
      setAuthModalReason("review");
      setShowAuthModal(true);
      return;
    }
    try {
      await fetch(`http://localhost:5000/api/accessories/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: user.email, value: userRating, review: userReview })
      });
      setShowToast(true);
      setUserReview("");
      setTimeout(() => setShowToast(false), 3000);
      // Refetch accessory to update rating and reviews
      const res = await fetch(`http://localhost:5000/api/accessories/${id}`);
      const data = await res.json();
      setAccessory(data);
      setRatingCount(data.ratingCount || 0);
      setAvgRating(data.avgRating || null);
      setReviews(data.reviews || []);
      // Dispatch event to trigger refresh in other components
      window.dispatchEvent(new Event('reviewSubmitted'));
    } catch (err) {
      alert("Error submitting review");
    }
  };

  // Cart/Wishlist handlers using backend
  const handleAddToCart = async () => {
    if (!user || !user.email) {
      setAuthModalReason("cart");
      setShowAuthModal(true);
      return;
    }
    const updated = [...cart, { product: accessory._id || accessory.id, quantity: amount }];
    await updateCart(updated.map(item => ({ product: item.product || item._id || item.id, quantity: item.quantity || 1 })));
    // Always reload cart from backend for true state
    const cartData = await fetchCart();
    setCart(cartData || []);
    setIsInCart((cartData || []).some((c) => (c.product?._id || c.product?.id || c._id || c.id) === (accessory._id || accessory.id)));
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleRemoveFromCart = async () => {
    if (!user || !user.email) {
      setAuthModalReason("cart");
      setShowAuthModal(true);
      return;
    }
    const updated = cart.filter((c) => (c.product?._id || c.product?.id || c._id || c.id) !== (accessory._id || accessory.id));
    await updateCart(updated.map(item => ({ product: item.product || item._id || item.id, quantity: item.quantity || 1 })));
    const cartData = await fetchCart();
    setCart(cartData || []);
    setIsInCart((cartData || []).some((c) => (c.product?._id || c.product?.id || c._id || c.id) === (accessory._id || accessory.id)));
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleAddToWishlist = async () => {
    if (!user || !user.email) {
      setAuthModalReason("wishlist");
      setShowAuthModal(true);
      return;
    }
    await updateWishlist(accessory._id || accessory.id, "add");
    // Always reload wishlist from backend for true state
    const wishlistData = await fetchWishlist();
    setWishlist(wishlistData || []);
    setIsInWishlist((wishlistData || []).some((w) => (w._id || w.id) === (accessory._id || accessory.id)));
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleRemoveFromWishlist = async () => {
    if (!user || !user.email) {
      setAuthModalReason("wishlist");
      setShowAuthModal(true);
      return;
    }
    await updateWishlist(accessory._id || accessory.id, "remove");
    const wishlistData = await fetchWishlist();
    setWishlist(wishlistData || []);
    setIsInWishlist((wishlistData || []).some((w) => (w._id || w.id) === (accessory._id || accessory.id)));
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  // Restrict guests from ordering
  const handleOrder = () => {
    if (!user || !user.email) {
      setAuthModalReason("order");
      setShowAuthModal(true);
      return;
    }
    navigate("/ordernow", { state: { product: accessory, amount } });
  };



  if (!accessory) {
    return (
      <div className="p-8 text-center">Accessory not found.</div>
    );
  }

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
          <p className="text-gray-700 mb-1 text-lg font-semibold">{accessory.brand}</p>
          {accessory.freeDelivery && (
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">Free Delivery</span>
          )}
          <p className="text-gray-700 mb-3 text-lg">{accessory.description}</p>
          <div className="flex flex-wrap gap-4 items-center mb-3">
            <span className="text-green-600 font-bold text-2xl">₹{accessory.price}</span>
            <span className="text-yellow-500 text-lg flex items-center">
              <FaStar className="mr-1" />
              {Number.isFinite(Number(avgRating))
                ? Number(avgRating).toFixed(1)
                : (Number.isFinite(Number(accessory.avgRating))
                  ? Number(accessory.avgRating).toFixed(1)
                  : (accessory.rating?.toFixed
                    ? accessory.rating.toFixed(1)
                    : (Number.isFinite(Number(accessory.rating)) ? Number(accessory.rating).toFixed(1) : '0')))}
              / 5
            </span>
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

      {/* Reviews Section */}
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-3">
          Reviews ({reviews.length})
          <span className="flex items-center gap-1 text-yellow-500 text-xl">
            {[1,2,3,4,5].map(star => (
              <FaStar key={star} className={avgRating && avgRating >= star ? 'text-yellow-400' : 'text-gray-300'} />
            ))}
            <span className="ml-2 text-base text-gray-700 font-semibold">{avgRating ? avgRating : 0}/5</span>
          </span>
        </h3>
        {/* Star Distribution Progress Bars */}
        <div className="mb-6 max-w-md">
          {[5,4,3,2,1].map(star => {
            const count = reviews.filter(r => r.value === star).length;
            const percent = reviews.length ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 mb-1">
                <span className="w-10 flex items-center gap-1">
                  <FaStar className="text-yellow-400" size={16} />
                  <span className="text-sm font-medium">{star}</span>
                </span>
                <div className="flex-1 bg-gray-200 rounded h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded ${percent > 0 ? 'bg-yellow-400' : 'bg-gray-300'}`}
                    style={{ width: `${percent}%`, transition: 'width 0.4s' }}
                  ></div>
                </div>
                <span className="w-8 text-right text-xs text-gray-600">{count}</span>
              </div>
            );
          })}
        </div>
        {user && user.email ? (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">Your Rating:</span>
              <span className="flex items-center gap-1">
                {[1,2,3,4,5].map(star => (
                  <FaStar
                    key={star}
                    className={userRating >= star ? 'text-yellow-400 cursor-pointer' : 'text-gray-300 cursor-pointer'}
                    size={24}
                    onClick={() => setUserRating(star)}
                  />
                ))}
              </span>
            </div>
            <textarea
              value={userReview}
              onChange={e => setUserReview(e.target.value)}
              placeholder="Write your review..."
              className="w-full border rounded p-2 mb-2"
              rows={2}
            />
            <button onClick={handleAddReview} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 font-semibold">Submit Review</button>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">Log in to add a review.</div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.length === 0 && <div className="text-gray-500 col-span-2">No reviews yet.</div>}
          {(showAllReviews ? reviews : reviews.slice(0,5)).map((r, idx) => (
            <div key={idx} className="bg-white border rounded-xl p-4 shadow flex flex-col h-full">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || r.user || r.email || 'U')}&background=random&size=64`}
                  alt={r.name || r.user || r.email || 'User'}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-semibold text-gray-800 text-sm break-all">{r.name || r.user || r.email || 'User'}</span>
                  <span className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map(star => (
                      <FaStar key={star} className={r.value >= star ? 'text-yellow-400' : 'text-gray-300'} size={15} />
                    ))}
                    <span className="text-xs text-gray-600 font-semibold ml-1">{r.value}/5</span>
                  </span>
                </div>
              </div>
              <div className="text-gray-800 text-sm whitespace-pre-line break-words mt-2">
                {r.review}
              </div>
            </div>
          ))}
        </div>
        {reviews.length > 5 && (
          <div className="text-center mt-4">
            <button
              className="text-blue-600 underline font-semibold"
              onClick={() => setShowAllReviews(v => !v)}
            >
              {showAllReviews ? 'Hide extra reviews' : 'View All Reviews'}
            </button>
          </div>
        )}
      </div>

      {/* Related Products & Accessories Section */}
      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4">Related Products & Accessories</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {related.map((item) => {
            const cat = item.category ? item.category.toLowerCase() : '';
            const isAccessory = cat.includes('accessory') || cat.includes('accessories');
            return (
              <ProductCard
                key={item._id || item.id}
                product={item}
                detailsPath={isAccessory ? 'accessories' : 'productdetails'}
                showActions={!!user}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}