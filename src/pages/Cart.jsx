import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchCart, updateCart, fetchWishlist, updateWishlist, removeFromCart } from "../utils/api";
import ProductCard from "../components/ProductCard";
import AuthModal from "../components/AuthModal";


export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to reload cart from backend
  // Only show loading on first mount, not on every reload
  const reloadCart = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    if (!user || !user._id) {
      setCart([]);
      setWishlist([]);
      if (showLoading) setLoading(false);
      return;
    }
    try {
      const [cartData, wishlistData] = await Promise.all([
        fetchCart(user._id),
        fetchWishlist(user._id)
      ]);
      setCart((cartData && cartData.data) || []);
      setWishlist((wishlistData && wishlistData.data) || []);
    } catch {
      setCart([]);
      setWishlist([]);
    }
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    if (!user || !user._id) {
      setCart([]);
      setWishlist([]);
      setShowAuthModal(true);
      setLoading(false);
      return;
    }
    setShowAuthModal(false);
    reloadCart(true); // only show loading on first mount
    // Always reload on cart/wishlist update event
    const handler = () => reloadCart(false); // don't show loading on event
    window.addEventListener('cartWishlistUpdated', handler);
    return () => window.removeEventListener('cartWishlistUpdated', handler);
  }, [user]);

  const handleRemoveFromCart = async (id, model) => {
    if (!user || !user._id) return;
    try {
      await removeFromCart(id, user.token, model);
      await reloadCart();
    } catch {}
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };


  // Add/remove to wishlist from cart (robust for both products and accessories)
  const handleAddToWishlist = async (product, model) => {
    if (!user || !user._id) return;
    try {
      await updateWishlist(product._id || product.id, "add", user.token, model);
      await reloadCart();
    } catch {}
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleRemoveFromWishlist = async (product, model) => {
    if (!user || !user._id) return;
    try {
      await updateWishlist(product._id || product.id, "remove", user.token, model);
      await reloadCart();
    } catch {}
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };

  // Update to send all cart products to OrderNow
  const handleGoToOrderNow = () => {
    if (cart.length === 0) return;
    navigate("/ordernow", { state: { products: cart } });
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
          Loading cart...
        </div>
      ) : cart.length === 0 ? (
        <div className="text-gray-500 text-center py-16 text-lg font-semibold flex flex-col items-center justify-center">
          <span className="text-5xl mb-2">6d2</span>
          No products in cart.
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
          {cart.map((item) => {
            const id = item._id || item.id;
            const model = item._cartModel || item.model || (item.category && item.category.toLowerCase().includes('accessor') ? 'Accessory' : 'Product');
            const inWishlist = !!wishlist.find((w) => {
              const wid = w._id || w.id;
              const wmodel = w._wishlistModel || w.model || (w.category && w.category.toLowerCase().includes('accessor') ? 'Accessory' : 'Product');
              return wid === id && wmodel === model;
            });
            const detailsPath = (model && model.toLowerCase() === 'accessory') ? 'accessory' : 'productdetails';
            return (
              <ProductCard
                key={id + '-' + model}
                product={item}
                inCart={true}
                inWishlist={inWishlist}
                onRemoveFromCart={() => handleRemoveFromCart(id, model)}
                onAddToWishlist={() => handleAddToWishlist(item, model)}
                onRemoveFromWishlist={() => handleRemoveFromWishlist(item, model)}
                showActions={true}
                pageType="cart"
                detailsPath={detailsPath}
              />
            );
          })}
        </div>
          {/* Total Price & Place Order Button */}
          <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg font-semibold text-blue-700">
              Total Price: <span className="font-bold">9{cart.reduce((sum, p) => sum + (p.price || 0), 0)}</span>
            </div>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition font-bold text-lg disabled:opacity-50"
              onClick={handleGoToOrderNow}
              disabled={cart.length === 0}
            >
              Place Order
            </button>
          </div>
        </>
      )}
    </div>
  );
}