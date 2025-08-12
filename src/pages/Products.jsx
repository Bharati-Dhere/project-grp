import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchCart, updateCart, fetchWishlist, updateWishlist, removeFromCart } from "../utils/api";
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
    inStock: false
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
        const res = await import('../utils/api');
        const productsArr = await res.fetchProducts();
        setProducts(Array.isArray(productsArr) ? productsArr : []);
      } catch (err) {
        setProducts([]);
      }
      // Load cart and wishlist from backend if logged in
      if (user) {
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
    fetchProductsAndUserData();
    // Listen for updates from other components
    const handler = () => fetchProductsAndUserData();
    window.addEventListener('cartWishlistUpdated', handler);
    // Listen for review submissions to auto-refresh products
    window.addEventListener('reviewSubmitted', handler);
    return () => {
      window.removeEventListener('cartWishlistUpdated', handler);
      window.removeEventListener('reviewSubmitted', handler);
    };
  }, [user]);

  useEffect(() => {
    let result = [...products];
    if (filters.category.length)
      result = result.filter(p => filters.category.includes(p.category));
    if (filters.brand.length)
      result = result.filter(p => filters.brand.includes(p.brand));
    if (filters.rating)
      result = result.filter(p => {
        const rating = (p.avgRating !== undefined && p.avgRating !== null)
          ? Number(p.avgRating)
          : (p.rating !== undefined && p.rating !== null)
            ? Number(p.rating)
            : 0;
        return rating >= filters.rating;
      });
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
    setFilteredProducts(result);
  }, [filters, sortOption, products]);

  const handleAddToCart = async (product) => {
    if (!user) {
      setAuthModalReason("cart");
      setShowAuthModal(true);
      return;
    }
    const model = 'Product';
    if (!cart.some((c) => {
      const cid = c._id || c.id || (c.product && (c.product._id || c.product.id));
      const cmodel = c._cartModel || c.model || (c.category ? 'Product' : 'Accessory');
      return cid === (product._id || product.id) && cmodel === model;
    })) {
      await updateCart(product._id || product.id, user.token, model);
      // Always reload cart from backend for true state
      const cartData = await fetchCart(user._id);
      setCart((cartData && cartData.data) || []);
      window.dispatchEvent(new Event('cartWishlistUpdated'));
    }
  };

  const handleRemoveFromCart = async (id) => {
    if (!user) return;
    const model = 'Product';
    await removeFromCart(id, user.token, model);
    // Always reload cart from backend for true state
    const cartData = await fetchCart(user._id);
    setCart((cartData && cartData.data) || []);
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };

  const handleAddToWishlist = async (product) => {
    if (!user) {
      setAuthModalReason("wishlist");
      setShowAuthModal(true);
      return;
    }
    if (!wishlist.some((w) => (w._id || w.id) === (product._id || product.id))) {
  await updateWishlist(product._id || product.id, "add", user.token, "Product");
      // Always reload wishlist from backend for true state
      const wishlistData = await fetchWishlist(user._id);
      setWishlist((wishlistData && wishlistData.data) || []);
      window.dispatchEvent(new Event('cartWishlistUpdated'));
    }
  };

  const handleRemoveFromWishlist = async (id) => {
  await updateWishlist(id, "remove", user.token, "Product");
    // Always reload wishlist from backend for true state
    const wishlistData = await fetchWishlist(user._id);
    setWishlist((wishlistData && wishlistData.data) || []);
    window.dispatchEvent(new Event('cartWishlistUpdated'));
  };

  const handleGoToOrderNow = (product) => {
    if (!user) {
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
            .map((product) => {
              const inCart = !!cart.find((c) => {
                const cid = c._id || c.id || (c.product && (c.product._id || c.product.id));
                const cmodel = c._cartModel || c.model || (c.category ? 'Product' : 'Accessory');
                return cid === (product._id || product.id) && cmodel === 'Product';
              });
              const inWishlist = !!wishlist.find((w) => {
                const wid = w._id || w.id;
                const wmodel = w._wishlistModel || (w.category ? 'Product' : 'Accessory');
                return wid === (product._id || product.id) && wmodel === 'Product';
              });
              return (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  detailsPath="productdetails"
                  onClick={() => handleCardClick(product._id)}
                  showBadges={true}
                  inCart={inCart}
                  inWishlist={inWishlist}
                  onAddToCart={() => handleAddToCart(product)}
                  onRemoveFromCart={() => handleRemoveFromCart(product._id || product.id)}
                  onAddToWishlist={() => handleAddToWishlist(product)}
                  onRemoveFromWishlist={() => handleRemoveFromWishlist(product._id || product.id, 'Product')}
                  onOrderNow={() => handleGoToOrderNow(product)}
                  showActions={true}
                  gridView={gridView}
                />
              );
            })}
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
