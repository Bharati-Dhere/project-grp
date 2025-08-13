
import React from 'react';
import ProductCard from './ProductCard';

import { fetchLatestBestSellers } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchCart, updateCart, fetchWishlist, updateWishlist } from '../utils/api';
import { useAuth } from '../context/AuthContext';




const BestSellers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
          user && user._id ? fetchCart(user._id) : Promise.resolve({ data: [] }),
          user && user._id ? fetchWishlist(user._id) : Promise.resolve({ data: [] }),
        ]);
        setCart((cartData && cartData.data) || []);
        setWishlist((wishlistData && wishlistData.data) || []);
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
  }, [user]);

  // Add/remove handlers: always update backend, then fetch latest state
  const reloadData = async () => {
    setLoading(true);
    try {
      const [cartData, wishlistData] = await Promise.all([
        user && user._id ? fetchCart(user._id) : Promise.resolve({ data: [] }),
        user && user._id ? fetchWishlist(user._id) : Promise.resolve({ data: [] }),
      ]);
      setCart((cartData && cartData.data) || []);
      setWishlist((wishlistData && wishlistData.data) || []);
    } catch (err) {
      setCart([]);
      setWishlist([]);
    }
    setLoading(false);
  };

  const handleAddToCart = async (product) => {
    if (!user || !user.token) return;
    await updateCart(product._id || product.id, user.token, 'Product');
    await reloadData();
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleRemoveFromCart = async (product) => {
    if (!user || !user.token) return;
    const { removeFromCart } = await import('../utils/api');
    await removeFromCart(product._id || product.id, user.token, 'Product');
    await reloadData();
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleAddToWishlist = async (product) => {
    if (!user || !user.token) return;
    await updateWishlist(product._id || product.id, 'add', user.token, 'Product');
    await reloadData();
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleRemoveFromWishlist = async (product) => {
    if (!user || !user.token) return;
    await updateWishlist(product._id || product.id, 'remove', user.token, 'Product');
    await reloadData();
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-center">Best Sellers</h2>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {bestSellers
            .filter((product) => !product.model || product.model.toLowerCase() === 'product')
            .slice(0, 4)
            .map((product) => {
              const productId = product._id || product.id;
              const inCart = cart.some((c) => {
                const cid = c.product?._id || c.product?.id || c._id || c.id;
                return String(cid) === String(productId);
              });
              const inWishlist = wishlist.some((w) => {
                const wid = w.product?._id || w.product?.id || w._id || w.id;
                return String(wid) === String(productId);
              });
              return (
                <ProductCard
                  key={product.id || product._id}
                  product={product}
                  inCart={inCart}
                  inWishlist={inWishlist}
                  onAddToCart={() => handleAddToCart(product)}
                  onRemoveFromCart={() => handleRemoveFromCart(product)}
                  onAddToWishlist={() => handleAddToWishlist(product, 'Product')}
                  onRemoveFromWishlist={() => handleRemoveFromWishlist(product, 'Product')}
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
