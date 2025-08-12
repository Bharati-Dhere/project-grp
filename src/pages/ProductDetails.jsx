import React, { useState, useEffect } from "react";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProducts, fetchCart, updateCart, fetchWishlist, updateWishlist } from '../utils/api';
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import ProductCard from '../components/ProductCard';



function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
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

  // Helper to get model type
  const getModel = (prod) => {
    if (!prod) return 'Product';
    // Robust: check for explicit model, type, or category
    if (prod.model) return prod.model;
    if (prod.type && prod.type.toLowerCase() === 'accessory') return 'Accessory';
    if (prod.category && prod.category.toLowerCase().includes('accessor')) return 'Accessory';
    return 'Product';
  };

  // Fetch product, reviews, related, cart, wishlist
  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
        setMainImage(data?.images ? data.images[0] : data?.image);
        setRatingCount(data.ratingCount || 0);
        setAvgRating(data.avgRating || null);
        setReviews(data.reviews || []);
        // Fetch related products and accessories from backend (same category or brand, exclude self)
        const api = await import('../utils/api');
        const [allProducts, allAccessories] = await Promise.all([
          api.fetchProducts(),
          api.fetchAccessories()
        ]);
        const relatedProducts = allProducts.filter(
          (p) =>
            (p._id !== id && p.id !== id) &&
            (p.category === data.category || p.brand === data.brand)
        );
        let relatedAccessories = allAccessories.filter(
          (a) =>
            (a._id !== id && a.id !== id) &&
            (a.category === data.category || a.brand === data.brand)
        );
        // Ensure all accessories have model: 'Accessory' for robust routing
        relatedAccessories = relatedAccessories.map(a => ({ ...a, model: 'Accessory' }));
        setRelated([...relatedProducts, ...relatedAccessories].slice(0, 4));
      } catch (err) {
        setProduct(null);
      }
      // Cart & Wishlist from backend
      if (user && user._id) {
        try {
          const cartData = await fetchCart(user._id);
          setCart((cartData && cartData.data) || []);
          setIsInCart(((cartData && cartData.data) || []).some((c) => {
            const cid = c.product?._id || c.product?.id || c._id || c.id;
            const cmodel = c.model || (c.category ? 'Product' : 'Accessory');
            return cid === id && cmodel === getModel(product);
          }));
        } catch { setCart([]); setIsInCart(false); }
        try {
          const wishlistData = await fetchWishlist(user._id);
          setWishlist((wishlistData && wishlistData.data) || []);
          setIsInWishlist(((wishlistData && wishlistData.data) || []).some((w) => {
            const wid = w._id || w.id;
            const wmodel = w.model || (w.category ? 'Product' : 'Accessory');
            return wid === id && wmodel === getModel(product);
          }));
        } catch { setWishlist([]); setIsInWishlist(false); }
      } else {
        setCart([]); setIsInCart(false);
        setWishlist([]); setIsInWishlist(false);
      }
    }
    fetchAll();
    // eslint-disable-next-line
  }, [id]);

  // Add review (rating + text)
  const handleAddReview = async () => {
    if (!user || !user.email) {
      setAuthModalReason("review");
      setShowAuthModal(true);
      return;
    }
    try {
      // Attach user avatar if available (prefer user.profile.avatar, fallback to user.avatar)
      let avatar = undefined;
      if (user?.profile && user.profile.avatar && user.profile.avatar.trim() !== '') {
        avatar = user.profile.avatar;
      } else if (user?.avatar && user.avatar.trim() !== '') {
        avatar = user.avatar;
      }
      await fetch(`http://localhost:5000/api/products/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: user.email, value: userRating, review: userReview, avatar })
      });
      setShowToast(true);
      setUserReview("");
      setTimeout(() => setShowToast(false), 3000);
      // Refetch product to update rating and reviews
      const res = await fetch(`http://localhost:5000/api/products/${id}`);
      const data = await res.json();
      setProduct(data);
      setRatingCount(data.ratingCount || 0);
      setAvgRating(data.avgRating || null);
      setReviews(data.reviews || []);
      // Dispatch event to auto-refresh product/admin lists
      window.dispatchEvent(new Event('reviewSubmitted'));
    } catch (err) {
      alert("Error submitting review");
    }
  };

  // Restrict guests from ordering
  const handleOrder = () => {
    if (!user || !user.email) {
      setAuthModalReason("order");
      setShowAuthModal(true);
      return;
    }
    navigate("/ordernow", { state: { product, amount } });
  };


  // Cart/Wishlist handlers using backend (robust for both models)
  const handleAddToCart = async () => {
    if (!user || !user.email) {
      setAuthModalReason("cart");
      setShowAuthModal(true);
      return;
    }
    const model = getModel(product);
    const prodId = product._id || product.id;
    console.log('[AddToCart] Sending:', { prodId, model, user: user?.email });
    await updateCart(prodId, user?.token, model);
    // Always reload cart from backend for true state
    if (!user || !user._id) { setCart([]); setIsInCart(false); return; }
    const cartData = await fetchCart(user._id);
    setCart((cartData && cartData.data) || []);
    setIsInCart(((cartData && cartData.data) || []).some((c) => {
      const cid = c.product?._id || c.product?.id || c._id || c.id;
      const cmodel = c._cartModel || c.model || (c.category ? 'Product' : 'Accessory');
      return String(cid) === String(prodId) && cmodel === model;
    }));
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleRemoveFromCart = async () => {
    if (!user || !user.email) {
      setAuthModalReason("cart");
      setShowAuthModal(true);
      return;
    }
    const model = getModel(product);
    const prodId = product._id || product.id;
    // Log cart contents and outgoing values
    console.log('[RemoveFromCart] Cart contents:', cart);
    console.log('[RemoveFromCart] Attempting to remove:', { prodId, model, user: user?.email });
    // Remove from cart robustly
    try {
      const api = await import('../utils/api');
      await api.removeFromCart(prodId, user?.token, model);
    } catch (err) {
      console.error('[RemoveFromCart] Error:', err);
    }
    if (!user || !user._id) { setCart([]); setIsInCart(false); return; }
    const cartData = await fetchCart(user._id);
    setCart((cartData && cartData.data) || []);
    // Robust id/model comparison
    const found = ((cartData && cartData.data) || []).some((c) => {
      const cid = c.product?._id || c.product?.id || c._id || c.id;
      const cmodel = c._cartModel || c.model || (c.category ? 'Product' : 'Accessory');
      const match = String(cid) === String(prodId) && cmodel === model;
      if (match) console.log('[RemoveFromCart] Still found in cart:', { cid, cmodel });
      return match;
    });
    setIsInCart(found);
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleAddToWishlist = async () => {
    if (!user || !user.email) {
      setAuthModalReason("wishlist");
      setShowAuthModal(true);
      return;
    }
    const model = getModel(product);
    const prodId = product._id || product.id;
    console.log('[AddToWishlist] Sending:', { prodId, model, user: user?.email });
    await updateWishlist(prodId, "add", user?.token, model);
    // Always reload wishlist from backend for true state
    if (!user || !user._id) { setWishlist([]); setIsInWishlist(false); return; }
    const wishlistData = await fetchWishlist(user._id);
    setWishlist((wishlistData && wishlistData.data) || []);
    setIsInWishlist(((wishlistData && wishlistData.data) || []).some((w) => {
      const wid = w._id || w.id;
      const wmodel = w._wishlistModel || w.model || (w.category ? 'Product' : 'Accessory');
      return String(wid) === String(prodId) && wmodel === model;
    }));
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleRemoveFromWishlist = async () => {
    if (!user || !user.email) {
      setAuthModalReason("wishlist");
      setShowAuthModal(true);
      return;
    }
    const model = getModel(product);
    const prodId = product._id || product.id;
    try {
      console.log('[RemoveFromWishlist] Attempting to remove:', { prodId, model, user: user?.email });
      await updateWishlist(prodId, "remove", user?.token, model);
    } catch (err) {
      console.error('[RemoveFromWishlist] Error:', err);
    }
    if (!user || !user._id) { setWishlist([]); setIsInWishlist(false); return; }
    const wishlistData = await fetchWishlist(user._id);
    setWishlist((wishlistData && wishlistData.data) || []);
    // Robust id/model comparison
    const found = ((wishlistData && wishlistData.data) || []).some((w) => {
      const wid = w._id || w.id;
      const wmodel = w._wishlistModel || w.model || (w.category ? 'Product' : 'Accessory');
      const match = String(wid) === String(prodId) && wmodel === model;
      if (match) console.log('[RemoveFromWishlist] Still found in wishlist:', { wid, wmodel });
      return match;
    });
    setIsInWishlist(found);
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };


  if (!product) return <div className="p-8 text-center">Product not found.</div>;

  return (
    <React.Fragment>
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} reason={authModalReason} />
      )}
      <div className="max-w-5xl mx-auto p-8 bg-white rounded-2xl shadow-2xl mt-8 relative transition-all duration-500">
      {/* Product Section */}
      <div className="flex flex-col md:flex-row gap-10 items-center md:items-center justify-center">
        {/* Product Image & Thumbnails */}
        <div className="flex flex-col items-center gap-4 justify-center">
          <div className="relative group flex justify-center">
            <img
              src={mainImage}
              alt={product.name}
              className="w-80 h-80 md:w-[28rem] md:h-[28rem] object-contain border-4 border-blue-300 rounded-2xl shadow-xl transform transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl hover:rotate-1 hover:scale-110 cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100"
              style={{ transition: 'box-shadow 0.4s, transform 0.4s' }}
            />
            <div className="absolute inset-0 rounded-2xl pointer-events-none group-hover:ring-4 group-hover:ring-blue-400 transition-all duration-500"></div>
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3 mt-3 justify-center">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
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
        {/* Product Details Context */}
        <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left px-2 md:px-8">
          <h2 className="text-3xl font-extrabold text-blue-700 mb-3 tracking-tight">{product.name}</h2>
          <p className="text-gray-700 mb-1 text-lg font-semibold">{product.brand}</p>
          {product.freeDelivery && (
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">Free Delivery</span>
          )}
          <p className="text-gray-700 mb-3 text-lg">{product.description}</p>
          <div className="flex flex-wrap gap-4 items-center mb-3">
            <span className="text-green-600 font-bold text-2xl">₹{product.price}</span>
            <span className="text-yellow-500 text-lg flex items-center">
              <FaStar className="mr-1" />
              {Number.isFinite(Number(avgRating))
                ? Number(avgRating).toFixed(1)
                : (Number.isFinite(Number(product.avgRating))
                  ? Number(product.avgRating).toFixed(1)
                  : (product.rating?.toFixed
                    ? product.rating.toFixed(1)
                    : (Number.isFinite(Number(product.rating)) ? Number(product.rating).toFixed(1) : '0')))}
              / 5
            </span>
            {product.offer && (
              <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-semibold shadow-sm animate-pulse">{product.offer}</span>
            )}
          </div>
          <div className="mb-3 flex flex-col items-center md:items-start">
            {/* Stock display removed as per request */}
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
              onClick={() => {
                if (!user ) { setAuthModalReason("cart"); setShowAuthModal(true); return; }
                if (isInCart) {
                  handleRemoveFromCart();
                } else {
                  handleAddToCart();
                }
              }}
              className={`px-5 py-2 rounded-lg transition font-semibold shadow-md ${isInCart ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
            >
              {isInCart ? 'Remove from Cart' : 'Add to Cart'}
            </button>
            <button
              onClick={() => {
                if (!user) { setAuthModalReason("order"); setShowAuthModal(true); return; }
                else{
                handleOrder();
                }
              }}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
            >
              Order Now
            </button>
            <button
              onClick={() => {
                if (!user ) { 
                  setAuthModalReason("wishlist"); setShowAuthModal(true);
                   return; }
                if (isInWishlist) {
                  handleRemoveFromWishlist();
                } else {
                  handleAddToWishlist();
                }
              }}
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
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.length === 0 && <div className="text-gray-500 col-span-2">No reviews yet.</div>}
          {(showAllReviews ? reviews : reviews.slice(0,5)).map((r, idx) => (
            <div key={idx} className="bg-white border rounded-xl p-4 shadow flex flex-col h-full">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={r.avatar && r.avatar.trim() !== '' ? r.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || r.user || r.email || 'U')}&background=random&size=64`}
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
            // Always use detailsPath='accessory' for accessories
            const isAccessory = (item.model && item.model.toLowerCase() === 'accessory')
              || (item.type && item.type.toLowerCase() === 'accessory')
              || (item._id && item._id.toString().length === 24 && item.price && item.stock !== undefined && item.brand && item.description && !item.hasOwnProperty('warranty')) // likely accessory
              || (item.category && item.category.toLowerCase().includes('accessor'));
            return (
              <ProductCard
                key={item._id || item.id}
                product={item}
                detailsPath={isAccessory ? 'accessory' : 'productdetails'}
                showActions={!!user}
              />
            );
          })}
        </div>
      </div>
       {showAuthModal && (
              <AuthModal onClose={() => setShowAuthModal(false)} reason={authModalReason} />
            )}
    </div>
    </React.Fragment>
  );
}

export default ProductDetails;