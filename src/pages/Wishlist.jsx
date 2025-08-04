import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLoggedInUser } from "../utils/authUtils";
import ProductCard from "../components/ProductCard";
import AuthModal from "../components/AuthModal";

export default function Wishlist() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);

  // Helper to reload wishlist from storage
  const reloadWishlist = () => {
    const current = getLoggedInUser();
    const wishlistKey = current?.email ? `wishlist_${current.email}` : 'wishlist_guest';
    setWishlist(JSON.parse(localStorage.getItem(wishlistKey)) || []);
  };

  useEffect(() => {
    const current = getLoggedInUser();
    if (!current) {
      setShowAuthModal(true);
      return;
    }
    reloadWishlist();

    // Listen for cart/wishlist updates from other components
    const handler = () => reloadWishlist();
    window.addEventListener('cartWishlistUpdated', handler);
    return () => window.removeEventListener('cartWishlistUpdated', handler);
  }, []);

  const handleRemoveFromWishlist = (id) => {
    const current = getLoggedInUser();
    const wishlistKey = current?.email ? `wishlist_${current.email}` : 'wishlist_guest';
    const updated = wishlist.filter((w) => w.id !== id);
    setWishlist(updated);
    localStorage.setItem(wishlistKey, JSON.stringify(updated));
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };

  const handleAddToCart = (product) => {
    const current = getLoggedInUser();
    const cartKey = current?.email ? `cart_${current.email}` : 'cart_guest';
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    if (!cart.some((c) => c.id === product.id)) {
      const updated = [...cart, product];
      localStorage.setItem(cartKey, JSON.stringify(updated));
      window.dispatchEvent(new Event('cartWishlistUpdated'));
    }
  };

  const handleRemoveFromCart = (product) => {
    const current = getLoggedInUser();
    const cartKey = current?.email ? `cart_${current.email}` : 'cart_guest';
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const updated = cart.filter((c) => c.id !== product.id);
    localStorage.setItem(cartKey, JSON.stringify(updated));
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
      {wishlist.length === 0 ? (
        <p className="text-gray-500 text-center">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fadeIn">
          {wishlist.map((product) => {
            const current = getLoggedInUser();
            const isLoggedIn = !!(current && current.email);
            const cartKey = current?.email ? `cart_${current.email}` : 'cart_guest';
            const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
            const inCart = isLoggedIn ? cart.some((c) => c.id === product.id) : false;
            const wishlistKey = current?.email ? `wishlist_${current.email}` : 'wishlist_guest';
            const wishlistArr = JSON.parse(localStorage.getItem(wishlistKey)) || [];
            const inWishlist = isLoggedIn ? wishlistArr.some((w) => w.id === product.id) : false;
            return (
              <ProductCard
                key={product.id}
                product={product}
                inWishlist={inWishlist}
                inCart={inCart}
                onRemoveFromWishlist={isLoggedIn ? () => handleRemoveFromWishlist(product.id) : undefined}
                onAddToCart={isLoggedIn ? () => handleAddToCart(product) : undefined}
                onRemoveFromCart={isLoggedIn ? () => handleRemoveFromCart(product) : undefined}
                showActions={isLoggedIn}
                pageType="wishlist"
              />
            );
          })}
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