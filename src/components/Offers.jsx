import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import ProductCard from './ProductCard';
import { fetchLatestOffers, updateWishlist, fetchCart, fetchWishlist } from '../utils/api';
import { useAuth } from '../context/AuthContext';




const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [offersData, cartData, wishlistData] = await Promise.all([
          fetchLatestOffers(),
          user && user._id ? fetchCart(user._id) : Promise.resolve({ data: [] }),
          user && user._id ? fetchWishlist(user._id) : Promise.resolve({ data: [] })
        ]);
        setOffers((offersData && Array.isArray(offersData.data)) ? offersData.data : []);
        setCart((cartData && cartData.data) || []);
        setWishlist((wishlistData && wishlistData.data) || []);
      } catch (err) {
        setOffers([]);
        setCart([]);
        setWishlist([]);
      }
      setLoading(false);
    };
    loadAll();
    const handler = () => loadAll();
    window.addEventListener('cartWishlistUpdated', handler);
    return () => window.removeEventListener('cartWishlistUpdated', handler);
  }, [user]);

  return (
    <section className="py-10 px-4 md:px-10 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Latest Offers
      </h2>

      {/* Responsive & Centered Cards */}
      <div className="max-w-screen-xl mx-auto">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {offers
              .filter((product) => !product.model || product.model.toLowerCase() === 'product')
              .slice(0, 5)
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
                  <div key={product._id || product.id} className="w-full">
                    <ProductCard
                      product={product}
                      showActions={true}
                      pageType={null}
                      inCart={inCart}
                      inWishlist={inWishlist}
                      onAddToCart={async () => {
                        if (!user || !user.token) return;
                        const { updateCart } = await import('../utils/api');
                        await updateCart(product._id || product.id, user.token, 'Product');
                        window.dispatchEvent(new Event('cartWishlistUpdated'));
                      }}
                      onRemoveFromCart={async () => {
                        if (!user || !user.token) return;
                        const { removeFromCart } = await import('../utils/api');
                        await removeFromCart(product._id || product.id, user.token, 'Product');
                        window.dispatchEvent(new Event('cartWishlistUpdated'));
                      }}
                      onAddToWishlist={async () => {
                        if (!user || !user.token) return;
                        await updateWishlist(product._id || product.id, 'add', user.token, 'Product');
                        window.dispatchEvent(new Event('cartWishlistUpdated'));
                      }}
                      onRemoveFromWishlist={async () => {
                        if (!user || !user.token) return;
                        await updateWishlist(product._id || product.id, 'remove', user.token, 'Product');
                        window.dispatchEvent(new Event('cartWishlistUpdated'));
                      }}
                    />
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* See More Button */}
      <div className="text-center mt-12">
        <button 
        onClick={() => navigate('/products')}
        className="bg-black text-white py-2 px-8 rounded-full hover:bg-gray-800 transition-all duration-300 text-sm font-semibold shadow-md">
          See More Offers
        </button>
      </div>
    </section>
  );
};

export default Offers;
