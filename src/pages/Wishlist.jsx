import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchWishlist, updateWishlist } from "../utils/api";
import ProductCard from "../components/ProductCard";
import AuthModal from "../components/AuthModal";

export default function Wishlist() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);


  // Helper to reload wishlist from backend
  const reloadWishlist = async () => {
    try {
      const data = await fetchWishlist();
      setWishlist(data || []);
    } catch {
      setWishlist([]);
    }
  };

  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    reloadWishlist();
    // Listen for wishlist updates from other components
    const handler = () => reloadWishlist();
    window.addEventListener('cartWishlistUpdated', handler);
    return () => window.removeEventListener('cartWishlistUpdated', handler);
  }, [user]);

  const handleRemoveFromWishlist = async (id) => {
    // Remove product by ID, update backend with array of IDs
    const updated = wishlist.filter((w) => (w._id || w.id) !== id);
    setWishlist(updated);
    try {
      await updateWishlist(updated.map((p) => p._id || p.id));
    } catch {}
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };

  // Cart handled by backend; implement if needed
  // (Optional: implement add to cart from wishlist if needed)
  const handleAddToCart = () => {};
  const handleRemoveFromCart = () => {};

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
              inCart={false}
              onRemoveFromWishlist={() => handleRemoveFromWishlist(product.id || product._id)}
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