import React, { useState, useEffect } from 'react';
import { getLoggedInUser } from '../utils/authUtils';
import ProductCard from './ProductCard';
import { fetchLatestOffers } from '../utils/api';




const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOffers = async () => {
      setLoading(true);
      try {
        const data = await fetchLatestOffers();
        setOffers(data || []);
      } catch (err) {
        setOffers([]);
      }
      setLoading(false);
    };
    loadOffers();
  }, []);

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
            {offers.map((product) => (
              <div key={product._id || product.id} className="w-full">
                <ProductCard
                  product={product}
                  showActions={true}
                  pageType={null}
                />
              </div>
            ))}
          </div>
        )}
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
