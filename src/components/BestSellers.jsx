
import React from 'react';
import ProductCard from './ProductCard';
import productsData from '../utils/productsData';
import { getLoggedInUser } from '../utils/authUtils';
import { useNavigate } from 'react-router-dom';

const bestSellersData = productsData.filter(product => product.isBestSeller).slice(0, 4);

const BestSellers = () => {
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-center">Best Sellers</h2>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        {bestSellersData.map((product) => {
          const user = getLoggedInUser();
          const cartKey = user?.email ? `cart_${user.email}` : 'cart_guest';
          const wishlistKey = user?.email ? `wishlist_${user.email}` : 'wishlist_guest';
          const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
          const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
          const inCart = cart.some((c) => c.id === product.id);
          const inWishlist = wishlist.some((w) => w.id === product.id);
          return (
            <ProductCard
              key={product.id}
              product={product}
              inCart={inCart}
              inWishlist={inWishlist}
              onAddToCart={() => {
                if (!inCart) {
                  const updated = [...cart, product];
                  localStorage.setItem(cartKey, JSON.stringify(updated));
                  window.dispatchEvent(new Event('cartWishlistUpdated'));
                }
              }}
              onRemoveFromCart={() => {
                const updated = cart.filter((c) => c.id !== product.id);
                localStorage.setItem(cartKey, JSON.stringify(updated));
                window.dispatchEvent(new Event('cartWishlistUpdated'));
              }}
              onAddToWishlist={() => {
                if (!inWishlist) {
                  const updated = [...wishlist, product];
                  localStorage.setItem(wishlistKey, JSON.stringify(updated));
                  window.dispatchEvent(new Event('cartWishlistUpdated'));
                }
              }}
              onRemoveFromWishlist={() => {
                const updated = wishlist.filter((w) => w.id !== product.id);
                localStorage.setItem(wishlistKey, JSON.stringify(updated));
                window.dispatchEvent(new Event('cartWishlistUpdated'));
              }}
              showActions={true}
              pageType={null}
            />
          );
        })}
      </div>
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
