import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLoggedInUser } from "../utils/authUtils";
import ProductCard from "../components/ProductCard";
import AuthModal from "../components/AuthModal";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Helper to reload cart from storage
  const reloadCart = () => {
    const current = getLoggedInUser();
    const cartKey = current?.email ? `cart_${current.email}` : 'cart_guest';
    setCart(JSON.parse(localStorage.getItem(cartKey)) || []);
  };

  useEffect(() => {
    const current = getLoggedInUser();
    if (!current) {
      setShowAuthModal(true);
      return;
    }
    reloadCart();

    // Listen for cart/wishlist updates from other components
    const handler = () => reloadCart();
    window.addEventListener('cartWishlistUpdated', handler);
    return () => window.removeEventListener('cartWishlistUpdated', handler);
  }, []);

  const handleRemoveFromCart = (id) => {
    const current = getLoggedInUser();
    const cartKey = current?.email ? `cart_${current.email}` : 'cart_guest';
    const updated = cart.filter((c) => c.id !== id);
    setCart(updated);
    localStorage.setItem(cartKey, JSON.stringify(updated));
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };

  const handleAddToWishlist = (product) => {
    const current = getLoggedInUser();
    const wishlistKey = current?.email ? `wishlist_${current.email}` : 'wishlist_guest';
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    if (!wishlist.some((w) => w.id === product.id)) {
      const updated = [...wishlist, product];
      localStorage.setItem(wishlistKey, JSON.stringify(updated));
      window.dispatchEvent(new Event('cartWishlistUpdated'));
    }
  };

  const handleRemoveFromWishlist = (product) => {
    const current = getLoggedInUser();
    const wishlistKey = current?.email ? `wishlist_${current.email}` : 'wishlist_guest';
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    const updated = wishlist.filter((w) => w.id !== product.id);
    localStorage.setItem(wishlistKey, JSON.stringify(updated));
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
      {cart.length === 0 ? (
        <div className="text-gray-500 text-center py-16 text-lg font-semibold flex flex-col items-center justify-center">
          <span className="text-5xl mb-2">🛒</span>
          No products in cart.
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
          {cart.map((product) => {
            const current = getLoggedInUser();
            const isLoggedIn = !!(current && current.email);
            const wishlistKey = current?.email ? `wishlist_${current.email}` : 'wishlist_guest';
            const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
            const inWishlist = isLoggedIn ? wishlist.some((w) => w.id === product.id) : false;
            const inCart = isLoggedIn ? true : false;
            return (
              <ProductCard
                key={product.id}
                product={product}
                inCart={inCart}
                inWishlist={inWishlist}
                onRemoveFromCart={() => handleRemoveFromCart(product.id)}
                onAddToWishlist={isLoggedIn ? () => handleAddToWishlist(product) : undefined}
                onRemoveFromWishlist={isLoggedIn ? () => handleRemoveFromWishlist(product) : undefined}
                showActions={true}
                pageType="cart"
              />
            );
          })}
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