import React, { useState, useEffect } from "react";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAccessories, fetchCart, updateCart, fetchWishlist, updateWishlist } from '../utils/api';
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import ProductCard from '../components/ProductCard';

function AccessoriesDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accessory, setAccessory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [amount, setAmount] = useState(1);
  const [userRating, setUserRating] = useState(5);
  const [userReview, setUserReview] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("");
  const [ratingCount, setRatingCount] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/accessories/${id}`);
        const result = await res.json();
        console.log('Accessory API response:', result);
        setAccessory(result);
        // Always use first image if available, else fallback to image, else placeholder
        if (result?.images && Array.isArray(result.images) && result.images.length > 0) {
          setMainImage(result.images[0]);
        } else if (result?.image) {
          setMainImage(result.image);
        } else {
          setMainImage("/assets/default-avatar.png"); // fallback placeholder
        }
        setRatingCount(result.ratingCount || 0);
        setAvgRating(result.avgRating || null);
        setReviews(result.reviews || []);
        // Fetch related accessories and products from backend (same category or brand, exclude self)
        const allAccessories = await fetchAccessories();
        const { fetchProducts } = await import('../utils/api');
        const allProducts = await fetchProducts();
        const relatedItems = [
          ...allAccessories.filter(
            (a) =>
              (a._id !== result._id && a.id !== result._id && a._id !== id && a.id !== id) &&
              ((a.category && result.category && a.category === result.category) || (a.brand && result.brand && a.brand === result.brand))
          ),
          ...allProducts.filter(
            (p) =>
              (p._id !== result._id && p.id !== result._id && p._id !== id && p.id !== id) &&
              ((p.category && result.category && p.category === result.category) || (p.brand && result.brand && p.brand === result.brand))
          )
        ];
        setRelated(relatedItems.slice(0, 4));
      } catch (err) {
        setAccessory(null);
      }
      // Cart & Wishlist from backend
      try {
        const cartData = user && user._id ? await fetchCart(user._id) : [];
        setCart(cartData || []);
        setIsInCart((cartData || []).some((c) => (c.product?._id || c.product?.id || c._id || c.id) === id));
      } catch {}
      try {
        const wishlistData = user && user._id ? await fetchWishlist(user._id) : [];
        setWishlist(wishlistData || []);
        setIsInWishlist((wishlistData || []).some((w) => (w._id || w.id) === id));
      } catch {}
      setLoading(false);
    }
    fetchAll();
  }, [id, user]);

  // Add review (rating + text)
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
    } catch (err) {
      alert("Error submitting review");
    }
  };

  // Cart/Wishlist handlers using backend
  const handleAddToCart = async () => {
    // Always use useAuth()'s user, not localStorage
    if (!user || !user.email) {
      setAuthModalReason("cart");
      setShowAuthModal(true);
      return;
    }
    const updated = [...cart, { product: accessory._id || accessory.id, quantity: amount }];
    setCart(updated);
    await updateCart(updated.map(item => ({ product: item.product || item._id || item.id, quantity: item.quantity || 1 })));
    setIsInCart(true);
    window.dispatchEvuent(new Event('cartWishlistUpdated'));
  };
  const handleRemoveFromCart = async () => {
    if (!user || !user.email) {
      setAuthModalReason("cart");
      setShowAuthModal(true);
      return;
    }
    const updated = cart.filter((c) => (c.product?._id || c.product?.id || c._id || c.id) !== (accessory._id || accessory.id));
    setCart(updated);
    await updateCart(updated.map(item => ({ product: item.product || item._id || item.id, quantity: item.quantity || 1 })));
    setIsInCart(false);
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleAddToWishlist = async () => {
    if (!user || !user.email) {
      setAuthModalReason("wishlist");
      setShowAuthModal(true);
      return;
    }
    await updateWishlist(accessory._id || accessory.id, "add");
    setIsInWishlist(true);
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleRemoveFromWishlist = async () => {
    if (!user || !user.email) {
      setAuthModalReason("wishlist");
      setShowAuthModal(true);
      return;
    }
    await updateWishlist(accessory._id || accessory.id, "remove");
    setIsInWishlist(false);
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



  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!accessory) return <div className="p-8 text-center">Accessory not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-2xl shadow-2xl mt-8 relative transition-all duration-500">
      {/* Accessory Section */}
      <div className="flex flex-col md:flex-row gap-10 items-center md:items-center justify-center">
        {/* Accessory Image & Thumbnails */}
        <div className="flex flex-col items-center gap-4 justify-center">
          <div className="relative group flex justify-center">
            <img
              src={mainImage || "/assets/default-avatar.png"}
              alt={accessory.name || "Accessory"}
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
          <h2 className="text-3xl font-extrabold text-blue-700 mb-3 tracking-tight">{accessory.name || "No Name"}</h2>
          <p className="text-gray-700 mb-1 text-lg font-semibold">{accessory.brand || "No Brand"}</p>
          {accessory.freeDelivery && (
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">Free Delivery</span>
          )}
          <p className="text-gray-700 mb-3 text-lg">{accessory.description}</p>
          <div className="flex flex-wrap gap-4 items-center mb-3">
            <span className="text-green-600 font-bold text-2xl">₹{accessory.price}</span>
            <span className="text-yellow-500 text-lg flex items-center">
              <FaStar className="mr-1" />
              {avgRating ? avgRating : '0'} / 5
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

        {/* Modern UI: Star Distribution Progress Bars */}
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
        <div className="space-y-4">
          {reviews.length === 0 && <div className="text-gray-500">No reviews yet.</div>}
          {(showAllReviews ? reviews : reviews.slice(0,5)).map((r, idx) => (
            <div key={idx} className="bg-white border rounded-lg p-3 shadow flex flex-col md:flex-row md:items-center gap-2">
              <div className="flex items-center gap-2 mb-1 md:mb-0">
                <span className="font-bold text-blue-700">{r.user}</span>
                <span className="text-yellow-500 flex items-center">
                  {[1,2,3,4,5].map(star => (
                    <FaStar key={star} className={r.value >= star ? 'text-yellow-400' : 'text-gray-300'} size={18} />
                  ))}
                  <span className="ml-1 text-sm">{r.value}</span>
                </span>
              </div>
              <div className="flex-1 text-gray-700">{r.review}</div>
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

      {/* Related Accessories Section */}
      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4">Related Accessories</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {related.map((a) => (
            <ProductCard
              key={a._id || a.id}
              product={a}
              detailsPath="accessories"
              showActions={!!user}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AccessoriesDetailsPage;