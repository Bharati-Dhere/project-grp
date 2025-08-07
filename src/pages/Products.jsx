import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLoggedInUser } from "../utils/authUtils";
import { fetchCart, updateCart, fetchWishlist, updateWishlist } from "../utils/api";
import ProductCard from "../components/ProductCard";
import AuthModal from "../components/AuthModal";
import FilterSidebar from "../components/FilterSidebar";
import SortBar from "../components/SortBar";
import FilterTags from "../components/FilterTags";
import PriceSlider from "../components/PriceSlider";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: [],
    brand: [],
    price: { min: 0, max: 150000 },
    rating: null,
    offer: [],
    bestSeller: [],
    color: [],
    size: [],
    inStock: false,
  });
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [sortOption, setSortOption] = useState("");
  const [gridView, setGridView] = useState(true);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("");

  useEffect(() => {
    async function fetchProductsAndUserData() {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setProducts([]);
      }
      // Load cart and wishlist from backend if logged in
      if (user) {
        try {
          const [cartData, wishlistData] = await Promise.all([
            fetchCart(),
            fetchWishlist(),
          ]);
          setCart(cartData || []);
          setWishlist(wishlistData || []);
        } catch {
          setCart([]);
          setWishlist([]);
        }
      } else {
        setCart([]);
        setWishlist([]);
      }
    }
    fetchProductsAndUserData();
    // Listen for updates from other components
    const handler = () => fetchProductsAndUserData();
    window.addEventListener('cartWishlistUpdated', handler);
    return () => window.removeEventListener('cartWishlistUpdated', handler);
  }, [user]);

  useEffect(() => {
    let result = [...products];
    if (filters.category.length)
      result = result.filter(p => filters.category.includes(p.category));
    if (filters.brand.length)
      result = result.filter(p => filters.brand.includes(p.brand));
    if (filters.rating)
      result = result.filter(p => p.rating >= filters.rating);
    if (filters.price)
      result = result.filter(p => p.price >= filters.price.min && p.price <= filters.price.max);
    if (filters.offer.length)
      result = result.filter(p => p.isOffer === true || p.isOffer === 'Yes');
    if (filters.bestSeller.length)
      result = result.filter(p => p.isBestSeller === true || p.isBestSeller === 'Yes');
    if (filters.color && filters.color.length)
      result = result.filter(p => filters.color.includes(p.color));
    if (filters.size && filters.size.length)
      result = result.filter(p => filters.size.includes(p.size));
    if (filters.inStock)
      result = result.filter(p => p.inStock !== false);
    if (sortOption === "priceLowToHigh") result.sort((a, b) => a.price - b.price);
    else if (sortOption === "priceHighToLow") result.sort((a, b) => b.price - a.price);
    else if (sortOption === "rating") result.sort((a, b) => b.rating - a.rating);
    setFilteredProducts(result);
  }, [filters, sortOption, products]);

  const handleAddToCart = async (product) => {
    if (!user) {
      setAuthModalReason("cart");
      setShowAuthModal(true);
      return;
    }
    if (!cart.some((c) => (c.product ? c.product._id : c._id || c.id) === (product._id || product.id))) {
      const updated = [...cart, { product: product._id || product.id, quantity: 1 }];
      setCart(updated);
      await updateCart(updated.map(item => ({ product: item.product || item._id || item.id, quantity: item.quantity || 1 })));
      window.dispatchEvent(new Event('cartWishlistUpdated'));
    }
  };

  const handleRemoveFromCart = async (id) => {
    const updated = cart.filter((c) => (c.product ? c.product._id : c._id || c.id) !== id);
    setCart(updated);
    await updateCart(updated.map(item => ({ product: item.product || item._id || item.id, quantity: item.quantity || 1 })));
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };

  const handleAddToWishlist = async (product) => {
    if (!user) {
      setAuthModalReason("wishlist");
      setShowAuthModal(true);
      return;
    }
    if (!wishlist.some((w) => (w._id || w.id) === (product._id || product.id))) {
      const updated = [...wishlist, product];
      setWishlist(updated);
      await updateWishlist(updated.map(p => p._id || p.id));
      window.dispatchEvent(new Event('cartWishlistUpdated'));
    }
  };

  const handleRemoveFromWishlist = async (id) => {
    const updated = wishlist.filter((w) => (w._id || w.id) !== id);
    setWishlist(updated);
    await updateWishlist(updated.map(p => p._id || p.id));
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };

  const handleGoToOrderNow = (product) => {
    const current = getLoggedInUser();
    if (!current) {
      setAuthModalReason("order");
      setShowAuthModal(true);
      return;
    }
    navigate("/ordernow", { state: { product, amount: 1 } });
  };

  const handleCardClick = (id) => {
    navigate(`/productdetails/${id}`);
  };

  // Clear all filters
  const handleClearAll = () => {
    setFilters({
      category: [],
      brand: [],
      price: { min: 0, max: 150000 },
      rating: null,
      offer: [],
      bestSeller: [],
      color: [],
      size: [],
      inStock: false,
    });
    setPriceRange([0, 150000]);
  };

  return (
    <div className="min-h-screen p-2 md:p-4 flex flex-col md:flex-row gap-6 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <aside className="w-full md:w-64 mb-4 md:mb-0 animate-fade-in-up transition-all duration-300 ease-in-out">
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          onClearAll={handleClearAll}
        />
      </aside>
      <main className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-center flex-wrap mb-4 gap-2 animate-fade-in-up transition-all duration-300 ease-in-out">
          <FilterTags filters={filters} onRemove={(key, value) => {
            if (key === "price") {
              setFilters(f => ({ ...f, price: { min: 0, max: 50000 } }));
              setPriceRange([0, 50000]);
            } else if (Array.isArray(filters[key])) {
              setFilters(f => ({ ...f, [key]: f[key].filter(v => v !== value) }));
            } else {
              setFilters(f => ({ ...f, [key]: null }));
            }
          }} onClearAll={handleClearAll} />
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
        <div className={gridView ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
          {filteredProducts
            .filter(product => product.category !== "Mobile Accessories")
            .map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                detailsPath="productdetails"
                onClick={() => handleCardClick(product._id)}
                showBadges={true}
                inCart={!!cart.find((c) => (c._id || c.id) === (product._id || product.id))}
                inWishlist={!!wishlist.find((w) => (w._id || w.id) === (product._id || product.id))}
                onAddToCart={() => handleAddToCart(product)}
                onRemoveFromCart={() => handleRemoveFromCart(product._id || product.id)}
                onAddToWishlist={() => handleAddToWishlist(product)}
                onRemoveFromWishlist={() => handleRemoveFromWishlist(product._id || product.id)}
                onOrderNow={() => handleGoToOrderNow(product)}
                showActions={true}
                gridView={gridView}
              />
            ))}
        </div>
      </main>
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          setUser={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

export default Products;
