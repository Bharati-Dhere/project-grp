
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchWishlist, updateWishlist, fetchCart, updateCart, removeFromCart } from "../utils/api";
import ProductCard from "../components/ProductCard";
import AuthModal from "../components/AuthModal";


export default function Wishlist() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to reload wishlist from backend
  // Only show loading on first mount, not on every reload
  const reloadWishlist = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    if (!user || !user._id) {
      setWishlist([]);
      setCart([]);
      if (showLoading) setLoading(false);
      return;
    }
    try {
      const [wishlistData, cartData] = await Promise.all([
        fetchWishlist(user._id),
        fetchCart(user._id)
      ]);
      setWishlist((wishlistData && wishlistData.data) || []);
      setCart((cartData && cartData.data) || []);
    } catch (error) {
      setWishlist([]);
      setCart([]);
    }
    if (showLoading) setLoading(false);
  };
  useEffect(() => {
    if (!user || !user._id) {
      setWishlist([]);
      setCart([]);
      setShowAuthModal(true);
      setLoading(false);
      return;
    }
    setShowAuthModal(false);
    reloadWishlist(true); // only show loading on first mount
    // Always reload on cart/wishlist update event
    const handler = () => reloadWishlist(false); // don't show loading on event
    window.addEventListener('cartWishlistUpdated', handler);
    return () => window.removeEventListener('cartWishlistUpdated', handler);
  }, [user]);

  const handleRemoveFromWishlist = async (id, model) => {
    if (!user || !user._id) return;
    try {
      // Try to find the model type from the wishlist item
      const item = wishlist.find(w => (w._id || w.id) === id);
      const modelType = (item && item._wishlistModel) || model || 'Product';
      await updateWishlist(id, "remove", user.token, modelType);
      await reloadWishlist();
    } catch {}
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };


  // Add/remove to cart from wishlist (robust for both products and accessories)
  const handleAddToCart = async (item, model) => {
    if (!user || !user._id) return;
    try {
      const cartRes = await fetchCart(user._id);
      const cartArr = (cartRes && cartRes.data) || [];
      // If already in cart, do nothing
      if ((cartArr || []).some((c) => {
        const cid = c._id || c.id || (c.product && (c.product._id || c.product.id));
        const cmodel = c._cartModel || c.model || (c.category ? 'Product' : 'Accessory');
        return cid === (item._id || item.id) && cmodel === model;
      })) return;
      await updateCart(item._id || item.id, user.token, model);
      await reloadWishlist();
    } catch {}
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleRemoveFromCart = async (item, model) => {
    if (!user || !user._id) return;
    try {
      await removeFromCart(item._id || item.id, user.token, model);
      await reloadWishlist();
    } catch {}
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };

  // Update to send all wishlist products to OrderNow
  const handleGoToOrderNow = () => {
    if (wishlist.length === 0) return;
    navigate("/ordernow", { state: { products: wishlist } });
  };

  if (showAuthModal) {
    return (
      <AuthModal
        onClose={() => {
          setShowAuthModal(false);
          navigate(-1);
        }}
        setUser={() => {
          setShowAuthModal(false);
        }}
      />
    );
  }
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
      {loading ? (
        <div className="text-center py-16 text-lg font-semibold flex flex-col items-center justify-center text-blue-600 animate-pulse">
          Loading wishlist...
        </div>
      ) : wishlist.length === 0 ? (
        <p className="text-gray-500 text-center">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fadeIn">
          {wishlist.map((item) => {
            const id = item._id || item.id;
            const model = item._wishlistModel
              || (item.model && item.model.toLowerCase() === 'accessory' ? 'Accessory'
              : (item.category && item.category.toLowerCase().includes('accessor') ? 'Accessory' : 'Product'));
            const inCart = !!cart.find((c) => {
              const cid = c._id || c.id || (c.product && (c.product._id || c.product.id));
              const cmodel = c._cartModel || c.model || (c.category && c.category.toLowerCase().includes('accessor') ? 'Accessory' : 'Product');
              return cid === id && cmodel === model;
            });
            const detailsPath = (model && model.toLowerCase() === 'accessory') ? 'accessory' : 'productdetails';
            return (
              <ProductCard
                key={id + '-' + model}
                product={item}
                inWishlist={true}
                inCart={inCart}
                onRemoveFromWishlist={() => handleRemoveFromWishlist(id, model)}
                onAddToCart={() => handleAddToCart(item, model)}
                onRemoveFromCart={() => handleRemoveFromCart(item, model)}
                showActions={true}
                pageType="wishlist"
                detailsPath={detailsPath}
              />
            );
          })}
        </div>
      )}
      {wishlist.length > 0 && !loading && (
        <div className="mt-4">
          <button
            onClick={handleGoToOrderNow}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Place All as Order
          </button>
        </div>
      )}
    </div>
  );
}