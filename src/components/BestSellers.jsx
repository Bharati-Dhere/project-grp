
import React from 'react';
import ProductCard from './ProductCard';

import { fetchLatestBestSellers } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchCart, updateCart, fetchWishlist, updateWishlist } from '../utils/api';




const BestSellers = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bestSellers, setBestSellers] = useState([]);

  // Load best sellers from backend
  useEffect(() => {
    const loadBestSellers = async () => {
      setLoading(true);
      try {
  const data = await fetchLatestBestSellers();
  setBestSellers((data && Array.isArray(data.data)) ? data.data : []);
      } catch (err) {
        setBestSellers([]);
      }
      setLoading(false);
    };
    loadBestSellers();
  }, []);

  // Load cart and wishlist from backend
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [cartData, wishlistData] = await Promise.all([
          fetchCart(),
          fetchWishlist(),
        ]);
        setCart(cartData || []);
        setWishlist(wishlistData || []);
      } catch (err) {
        setCart([]);
        setWishlist([]);
      }
      setLoading(false);
    };
    loadData();
    // Listen for updates from other components
    const handler = () => loadData();
    window.addEventListener('cartWishlistUpdated', handler);
    return () => window.removeEventListener('cartWishlistUpdated', handler);
  }, []);

  // Add/remove handlers (same as before)
  const handleAddToCart = async (product) => {
    if (cart.some((c) => (c.product ? c.product._id : c._id || c.id) === (product._id || product.id))) return;
    const updated = [...cart, { product: product._id || product.id, quantity: 1 }];
    setCart(updated);
    await updateCart(updated.map(item => ({ product: item.product || item._id || item.id, quantity: item.quantity || 1 })));
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleRemoveFromCart = async (product) => {
    const updated = cart.filter((c) => (c.product ? c.product._id : c._id || c.id) !== (product._id || product.id));
    setCart(updated);
    await updateCart(updated.map(item => ({ product: item.product || item._id || item.id, quantity: item.quantity || 1 })));
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleAddToWishlist = async (product) => {
    if (wishlist.some((w) => (w._id || w.id) === (product._id || product.id))) return;
    const updated = [...wishlist, product];
    setWishlist(updated);
    await updateWishlist(updated.map(p => p._id || p.id));
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleRemoveFromWishlist = async (product) => {
    const updated = wishlist.filter((w) => (w._id || w.id) !== (product._id || product.id));
    setWishlist(updated);
    await updateWishlist(updated.map(p => p._id || p.id));
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-center">Best Sellers</h2>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {bestSellers.slice(0, 4).map((product) => {
            const inCart = cart.some((c) => c.id === product.id || c._id === product._id);
            const inWishlist = wishlist.some((w) => w.id === product.id || w._id === product._id);
            return (
              <ProductCard
                key={product.id || product._id}
                product={product}
                inCart={inCart}
                inWishlist={inWishlist}
                onAddToCart={() => handleAddToCart(product)}
                onRemoveFromCart={() => handleRemoveFromCart(product)}
                onAddToWishlist={() => handleAddToWishlist(product)}
                onRemoveFromWishlist={() => handleRemoveFromWishlist(product)}
                showActions={true}
                pageType={null}
              />
            );
          })}
        </div>
      )}
      {/* See More Button */}
      <div className="text-center mt-12">
        <button 
        onClick={() => navigate('/products')}
        className="bg-black text-white py-2 px-8 rounded-full hover:bg-gray-800 transition-all duration-300 text-sm font-semibold shadow-md">
          See More Products
        </button>
      </div>
    </section>
  );
};

export default BestSellers;
