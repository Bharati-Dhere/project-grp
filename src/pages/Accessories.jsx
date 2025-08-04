import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fetchAccessories } from "../utils/api";
import { getLoggedInUser } from "../utils/authUtils";
import FilterSidebar from "../components/FilterSidebar";

// Extract unique categories and brands from productsData for sidebar
const getUnique = (arr, key) => [...new Set(arr.map(item => item[key]).filter(Boolean))];

export default function Accessories() {
  const [accessories, setAccessories] = useState([]);
  const [filteredAccessories, setFilteredAccessories] = useState([]);
  // Add color, offer, bestSeller to filters
  const [filters, setFilters] = useState({
    category: [],
    brand: [],
    color: [],
    offer: [],
    bestSeller: [],
    price: { min: 0, max: 5000 },
    rating: null,
    inStock: false,
  });
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortOption, setSortOption] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccessories().then((data) => {
      setAccessories(data);
    });
  }, []);

  useEffect(() => {
    let result = [...accessories];
    if (filters.category.length)
      result = result.filter(a => filters.category.includes(a.category));
    if (filters.brand.length)
      result = result.filter(a => filters.brand.includes(a.brand));
    if (filters.color && filters.color.length)
      result = result.filter(a => a.color && filters.color.includes(a.color));
    if (filters.offer && filters.offer.length)
      result = result.filter(a => a.isOffer && filters.offer.some(val => a.isOffer === val || (val === 'Yes' && a.isOffer === true)));
    if (filters.bestSeller && filters.bestSeller.length)
      result = result.filter(a => a.isBestSeller && filters.bestSeller.some(val => a.isBestSeller === val || (val === 'Yes' && a.isBestSeller === true)));
    if (filters.rating)
      result = result.filter(a => a.rating >= filters.rating);
    if (filters.price)
      result = result.filter(a => a.price >= filters.price.min && a.price <= filters.price.max);
    if (filters.inStock)
      result = result.filter(a => a.inStock !== false);
    if (sortOption === "priceLowToHigh") result.sort((a, b) => a.price - b.price);
    else if (sortOption === "priceHighToLow") result.sort((a, b) => b.price - a.price);
    else if (sortOption === "rating") result.sort((a, b) => b.rating - a.rating);
    setFilteredAccessories(result);
  }, [filters, sortOption, accessories]);

  const handleClearAll = () => {
    setFilters({
      category: [],
      brand: [],
      color: [],
      offer: [],
      bestSeller: [],
      price: { min: 0, max: 5000 },
      rating: null,
      inStock: false,
    });
    setPriceRange([0, 5000]);
  };

  // Cart and wishlist logic for grid
  const user = getLoggedInUser();
  const cartKey = user?.email ? `cart_${user.email}` : 'cart_guest';
  const wishlistKey = user?.email ? `wishlist_${user.email}` : 'wishlist_guest';
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem(cartKey)) || []);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem(wishlistKey)) || []);

  useEffect(() => {
    const handleUpdate = () => {
      setCart(JSON.parse(localStorage.getItem(cartKey)) || []);
      setWishlist(JSON.parse(localStorage.getItem(wishlistKey)) || []);
    };
    window.addEventListener('cartWishlistUpdated', handleUpdate);
    return () => window.removeEventListener('cartWishlistUpdated', handleUpdate);
    // eslint-disable-next-line
  }, [cartKey, wishlistKey]);

  const handleAddToCart = (item) => {
    const updated = [...cart, item];
    localStorage.setItem(cartKey, JSON.stringify(updated));
    setCart(updated);
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleRemoveFromCart = (item) => {
    const updated = cart.filter((c) => String(c.id) !== String(item.id));
    localStorage.setItem(cartKey, JSON.stringify(updated));
    setCart(updated);
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleAddToWishlist = (item) => {
    const updated = [...wishlist, item];
    localStorage.setItem(wishlistKey, JSON.stringify(updated));
    setWishlist(updated);
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleRemoveFromWishlist = (item) => {
    const updated = wishlist.filter((w) => String(w.id) !== String(item.id));
    localStorage.setItem(wishlistKey, JSON.stringify(updated));
    setWishlist(updated);
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };

  const handleCardClick = (id) => {
    navigate(`/accessoriesdetails/${id}`);
  };

  // Dynamically compute sidebar options from fetched accessories
  const ACCESSORY_CATEGORIES = getUnique(accessories, "category");
  const ACCESSORY_BRANDS = getUnique(accessories, "brand");
  const ACCESSORY_COLORS = getUnique(accessories, "color");
  const ACCESSORY_OFFERS = getUnique(accessories, "isOffer");
  const ACCESSORY_BESTSELLER = getUnique(accessories, "isBestSeller");

  return (
    <div className="min-h-screen p-2 md:p-4 flex flex-col md:flex-row gap-6 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <aside className="w-full md:w-64 mb-4 md:mb-0 animate-fade-in-up transition-all duration-300 ease-in-out">
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          onClearAll={handleClearAll}
          categories={ACCESSORY_CATEGORIES}
          brands={ACCESSORY_BRANDS}
          showColor={true}
          showOffer={true}
          showBestSeller={true}
          showSize={false}
        />
      </aside>
      <main className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-center flex-wrap mb-4 gap-2 animate-fade-in-up transition-all duration-300 ease-in-out">
          <h2 className="text-2xl font-bold mb-2 text-center w-full sm:w-auto">Accessories</h2>
          <div className="w-full sm:w-auto flex justify-end">
            <label htmlFor="sort" className="mr-2 text-sm font-semibold text-gray-700">Sort by:</label>
            <select
              id="sort"
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
              className="border p-1 rounded text-sm"
            >
              <option value="">Default</option>
              <option value="priceLowToHigh">Price: Low to High</option>
              <option value="priceHighToLow">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredAccessories
            .map((accessory) => {
              const inCart = cart.some((c) => String(c.id) === String(accessory.id));
              const inWishlist = wishlist.some((w) => String(w.id) === String(accessory.id));
              const detailsPath = "accessories";
              return (
                <ProductCard
                  key={accessory.id}
                  product={accessory}
                  inCart={inCart}
                  inWishlist={inWishlist}
                  onAddToCart={() => handleAddToCart(accessory)}
                  onRemoveFromCart={() => handleRemoveFromCart(accessory)}
                  onAddToWishlist={() => handleAddToWishlist(accessory)}
                  onRemoveFromWishlist={() => handleRemoveFromWishlist(accessory)}
                  showActions={true}
                  detailsPath={detailsPath}
                  onClick={() => handleCardClick(accessory.id)}
                  showBadges={true}
                />
              );
            })}
        </div>
      </main>
    </div>
  );
}
