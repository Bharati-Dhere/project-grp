import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fetchAccessories } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { fetchCart, updateCart, fetchWishlist, updateWishlist, removeFromCart } from "../utils/api";
import FilterSidebar from "../components/FilterSidebar";

// Extract unique categories and brands from productsData for sidebar
const getUnique = (arr, key) => {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.map(item => item[key]).filter(Boolean))];
};

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
    const fetchAll = () => {
      fetchAccessories().then((data) => {
        setAccessories(Array.isArray(data) ? data : []);
      });
    };
    fetchAll();
    // Listen for review submissions to auto-refresh accessories list
    window.addEventListener('reviewSubmitted', fetchAll);
    return () => window.removeEventListener('reviewSubmitted', fetchAll);
  }, []);

  useEffect(() => {
    const safeAccessories = Array.isArray(accessories) ? accessories : [];
    let result = [...safeAccessories];
    if (filters.category.length)
      result = result.filter(a => filters.category.includes(a.category));
    if (filters.brand.length)
      result = result.filter(a => filters.brand.includes(a.brand));
    if (filters.color && filters.color.length)
      result = result.filter(a => a.color && filters.color.includes(a.color));
    if (filters.offer && filters.offer.length)
      result = result.filter(a => a.isOffer === true || a.isOffer === 'Yes');
    if (filters.bestSeller && filters.bestSeller.length)
      result = result.filter(a => a.isBestSeller === true || a.isBestSeller === 'Yes');
    if (filters.rating)
      result = result.filter(a => {
        const rating = (a.avgRating !== undefined && a.avgRating !== null)
          ? Number(a.avgRating)
          : (a.rating !== undefined && a.rating !== null)
            ? Number(a.rating)
            : 0;
        return rating >= filters.rating;
      });
    if (filters.price)
      result = result.filter(a => a.price >= filters.price.min && a.price <= filters.price.max);
    if (filters.inStock)
      result = result.filter(a => a.inStock !== false);
    if (sortOption === "priceLowToHigh") result.sort((a, b) => a.price - b.price);
    else if (sortOption === "priceHighToLow") result.sort((a, b) => b.price - a.price);
    else if (sortOption === "rating") result.sort((a, b) => {
      const ratingA = (a.avgRating !== undefined && a.avgRating !== null)
        ? Number(a.avgRating)
        : (a.rating !== undefined && a.rating !== null)
          ? Number(a.rating)
          : 0;
      const ratingB = (b.avgRating !== undefined && b.avgRating !== null)
        ? Number(b.avgRating)
        : (b.rating !== undefined && b.rating !== null)
          ? Number(b.rating)
          : 0;
      return ratingB - ratingA;
    });
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

  // Cart and wishlist logic using backend and context
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    async function fetchUserCartWishlist() {
      if (user && user._id) {
        try {
          const [cartData, wishlistData] = await Promise.all([
            fetchCart(user._id),
            fetchWishlist(user._id),
          ]);
          setCart((cartData && cartData.data) || []);
          setWishlist((wishlistData && wishlistData.data) || []);
        } catch {
          setCart([]);
          setWishlist([]);
        }
      } else {
        setCart([]);
        setWishlist([]);
      }
    }
    fetchUserCartWishlist();
    const handler = () => fetchUserCartWishlist();
    window.addEventListener('cartWishlistUpdated', handler);
    return () => window.removeEventListener('cartWishlistUpdated', handler);
  }, [user]);

  const handleAddToCart = async (item) => {
    if (!user) return alert('Please log in to use cart.');
    if (!cart.some((c) => (c.product ? c.product._id : c._id || c.id) === (item._id || item.id))) {
      await updateCart(item._id || item.id, user.token);
    }
    // Always reload cart from backend for true state
    const cartData = await fetchCart(user._id);
    setCart((cartData && cartData.data) || []);
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleRemoveFromCart = async (itemId) => {
    if (!user) return;
    await removeFromCart(itemId, user.token);
    // Always reload cart from backend for true state
    const cartData = await fetchCart(user._id);
    setCart((cartData && cartData.data) || []);
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleAddToWishlist = async (item) => {
    if (!user) return alert('Please log in to use wishlist.');
    if (!wishlist.some((w) => (w._id || w.id) === (item._id || item.id))) {
  await updateWishlist(item._id || item.id, "add", user.token, "Accessory");
    }
    // Always reload wishlist from backend for true state
    const wishlistData = await fetchWishlist(user._id);
    setWishlist((wishlistData && wishlistData.data) || []);
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };
  const handleRemoveFromWishlist = async (itemId) => {
    if (!user) return;
  await updateWishlist(itemId, "remove", user.token, "Accessory");
    // Always reload wishlist from backend for true state
    const wishlistData = await fetchWishlist(user._id);
    setWishlist((wishlistData && wishlistData.data) || []);
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };

  const handleCardClick = (id) => {
  navigate(`/accessories/${id}`);
  };

// Only show accessory-related categories and brands
const FIXED_ACCESSORY_CATEGORIES = [
  "Mobile Covers",
  "Headphones",
  "USB",
  "Chargers",
  "Screen Protectors",
  "Power Banks",
  "Bluetooth Speakers",
  "Smart Bands",
  "Car Accessories",
  "Other"
];
const FIXED_ACCESSORY_BRANDS = [
  "Boat",
  "JBL",
  "Realme",
  "Samsung",
  "MI",
  "Portronics",
  "Noise",
  "OnePlus",
  "Sony",
  "Other"
];
const ACCESSORY_CATEGORIES = accessories.length
  ? getUnique(accessories, "category").filter(cat => FIXED_ACCESSORY_CATEGORIES.includes(cat))
  : FIXED_ACCESSORY_CATEGORIES;
const ACCESSORY_BRANDS = accessories.length
  ? getUnique(accessories, "brand").filter(brand => FIXED_ACCESSORY_BRANDS.includes(brand))
  : FIXED_ACCESSORY_BRANDS;
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
              const id = accessory._id || accessory.id;
              const inCart = cart.some((c) => String(c._id || c.id) === String(id));
              const inWishlist = wishlist.some((w) => {
                const wid = w._id || w.id;
                const wmodel = w._wishlistModel || (w.category ? 'Product' : 'Accessory');
                return String(wid) === String(id) && wmodel === 'Accessory';
              });
              return (
                <ProductCard
                  key={id + '-Accessory'}
                  product={accessory}
                  inCart={inCart}
                  inWishlist={inWishlist}
                  onAddToCart={() => handleAddToCart(accessory)}
                  onRemoveFromCart={() => handleRemoveFromCart(id)}
                  onAddToWishlist={() => handleAddToWishlist(accessory)}
                  onRemoveFromWishlist={() => handleRemoveFromWishlist(id, 'Accessory')}
                  showActions={true}
                  detailsPath="accessories"
                  showBadges={true}
                />
              );
            })}
        </div>
      </main>
    </div>
  );
}
