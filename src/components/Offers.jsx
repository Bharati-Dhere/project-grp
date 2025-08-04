import React from 'react';
import { getLoggedInUser } from '../utils/authUtils';
import ProductCard from './ProductCard';
import productsData from '../utils/productsData';

const offers = productsData.filter(product => product.isOffer).slice(0, 5);

const Offers = () => {
  return (
    <section className="py-10 px-4 md:px-10 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Latest Offers
      </h2>

      {/* Responsive & Centered Cards */}
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {offers.map((product) => {
            const user = getLoggedInUser();
            const cartKey = user?.email ? `cart_${user.email}` : 'cart_guest';
            const wishlistKey = user?.email ? `wishlist_${user.email}` : 'wishlist_guest';
            const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
            const wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
            const inCart = cart.some((c) => c.id === product.id);
            const inWishlist = wishlist.some((w) => w.id === product.id);

            return (
              <div key={product.id} className="w-full">
                <ProductCard
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
              </div>
            );
          })}
        </div>
      </div>

      {/* See More Button */}
      <div className="text-center mt-12">
        <button className="bg-black text-white py-2 px-8 rounded-full hover:bg-gray-800 transition-all duration-300 text-sm font-semibold shadow-md">
          See More Offers
        </button>
      </div>
    </section>
  );
};

export default Offers;
