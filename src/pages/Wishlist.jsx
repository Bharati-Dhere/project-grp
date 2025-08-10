
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchWishlist, updateWishlist, fetchCart, updateCart } from "../utils/api";
import ProductCard from "../components/ProductCard";
import AuthModal from "../components/AuthModal";

export default function Wishlist() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);


  // Helper to reload wishlist from backend
  const reloadWishlist = async () => {
    try {
      const [wishlistData, cartData] = await Promise.all([
        fetchWishlist(),
        fetchCart()
      ]);
      setWishlist(wishlistData || []);
      setCart(cartData || []);
    } catch (error) {
      setWishlist([]);
      setCart([]);
    }
  };
  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    reloadWishlist(); // Ensure this is the correct reloadWishlist function
    // Always reload on cart/wishlist update event
    const handler = () => reloadWishlist();
    window.addEventListener('cartWishlistUpdated', handler);
    return () => window.removeEventListener('cartWishlistUpdated', handler);
  }, [user]);

  const handleRemoveFromWishlist = async (id) => {
    setWishlist((prev) => prev.filter((w) => (w._id || w.id) !== id));
    try {
      await updateWishlist(id, "remove");
    } catch {}
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };


  // Add to cart from wishlist
  const handleAddToCart = async (product) => {
    try {
      const cart = await fetchCart();
      // If already in cart, do nothing
      if ((cart || []).some((c) => (c._id || c.id) === (product._id || product.id))) return;
      const updated = [...(cart || []), { product: product._id || product.id, quantity: 1 }];
      await updateCart(updated.map(item => ({ product: item.product || item._id || item.id, quantity: item.quantity || 1 })));
      window.dispatchEvent(new Event('cartWishlistUpdated'));
    } catch {}
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
      {wishlist.length === 0 ? (
        <p className="text-gray-500 text-center">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fadeIn">
          {wishlist.map((product) => (
            <ProductCard
              key={product.id || product._id}
              product={product}
              inWishlist={true}
              inCart={!!cart.find((c) => ((c.product && (c.product._id || c.product.id)) === (product._id || product.id)) || (c._id || c.id) === (product._id || product.id))}
              onRemoveFromWishlist={() => handleRemoveFromWishlist(product.id || product._id)}
              onAddToCart={() => handleAddToCart(product)}
              showActions={true}
              pageType="wishlist"
            />
          ))}
        </div>
      )}
      {wishlist.length > 0 && (
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