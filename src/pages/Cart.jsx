import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchCart, updateCart } from "../utils/api";
import ProductCard from "../components/ProductCard";
import AuthModal from "../components/AuthModal";

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);


  // Helper to reload cart from backend
  const reloadCart = async () => {
    try {
      const data = await fetchCart();
      setCart(data || []);
    } catch {
      setCart([]);
    }
  };

  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    reloadCart();
    // Listen for cart updates from other components
    const handler = () => reloadCart();
    window.addEventListener('cartWishlistUpdated', handler);
    return () => window.removeEventListener('cartWishlistUpdated', handler);
  }, [user]);

  const handleRemoveFromCart = async (id) => {
    // Remove product by ID, update backend with array of IDs (as objects with product+quantity)
    const updated = cart.filter((c) => (c._id || c.id) !== id);
    setCart(updated);
    try {
      // Only send array of { product: id, quantity } to backend
      await updateCart(updated.map((item) => ({ product: item._id || item.id, quantity: item.quantity || 1 })));
    } catch {}
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };

  // Wishlist handled by backend; implement if needed
  const handleAddToWishlist = () => {};

  // Wishlist handled by backend; implement if needed
  const handleRemoveFromWishlist = () => {};

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
      {cart.length === 0 ? (
        <div className="text-gray-500 text-center py-16 text-lg font-semibold flex flex-col items-center justify-center">
          <span className="text-5xl mb-2">🛒</span>
          No products in cart.
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
          {cart.map((product) => (
            <ProductCard
              key={product.id || product._id}
              product={product}
              inCart={true}
              inWishlist={false}
              onRemoveFromCart={() => handleRemoveFromCart(product.id || product._id)}
              showActions={true}
              pageType="cart"
            />
          ))}
        </div>
          {/* Total Price & Place Order Button */}
          <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg font-semibold text-blue-700">
              Total Price: <span className="font-bold">₹{cart.reduce((sum, p) => sum + (p.price || 0), 0)}</span>
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