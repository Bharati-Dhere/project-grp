
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import PriceSlider from "./PriceSlider";

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left font-semibold text-gray-800 hover:text-blue-600"
      >
        {title}
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      {isOpen && <div className="mt-2 pl-2 space-y-1">{children}</div>}
    </div>
  );
};

const FIXED_CATEGORIES = [
  "Smartphones",
  "Smartwatches",
  "Tablets",
  "Laptops"
];
const POPULAR_BRANDS = [
  "Apple",
  "Samsung",
  "OnePlus",
  "Xiaomi",
  "Realme",
  "Oppo",
  "Vivo",
  "Lenovo",
  "HP",
  "Dell",
  "Asus",
  "Amazfit",
  "Noise",
  "Boat"
];
const COLOR_OPTIONS = [
  "Black",
  "White",
  "Blue",
  "Red",
  "Green",
  "Silver",
  "Gold",
  "Gray"
];


export default function FilterSidebar({
  filters,
  setFilters,
  priceRange,
  setPriceRange,
  onClearAll,
  categories,
  brands,
  showColor = true,
  showOffer = true,
  showBestSeller = true,
  showSize = true,
}) {
  // Ensure filters.price is always an object with min and max
  const safePrice = typeof filters.price === 'object' && filters.price !== null ? filters.price : { min: '', max: '' };
  const safeCategories = Array.isArray(categories) && categories.length ? categories : FIXED_CATEGORIES;
  const safeBrands = Array.isArray(brands) && brands.length ? brands : POPULAR_BRANDS;
  const safeColors = COLOR_OPTIONS;
  // Ensure filters.offer and filters.bestSeller are arrays
  const safeOffer = Array.isArray(filters.offer) ? filters.offer : [];
  const safeBestSeller = Array.isArray(filters.bestSeller) ? filters.bestSeller : [];
  const handleCheckbox = (type, value) => {
    setFilters((prev) => {
      const current = new Set(prev[type]);
      current.has(value) ? current.delete(value) : current.add(value);
      return { ...prev, [type]: Array.from(current) };
    });
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, price: { ...prev.price, [name]: value } }));
  };

  const handleRadio = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  return (
    <aside className="w-full md:w-64 bg-white p-4 rounded-lg shadow-md flex flex-col min-h-[60vh] relative h-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-blue-700">Filters</h2>
        <button
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full text-xs font-semibold transition"
          onClick={onClearAll}
        >
          Clear All
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pr-2">
        <FilterSection title="Categories">
          {safeCategories.map((cat) => (
            <label key={cat} className="block">
              <input
                type="checkbox"
                checked={filters.category.includes(cat)}
                onChange={() => handleCheckbox("category", cat)}
                className="mr-2"
              />
              {cat}
            </label>
          ))}
        </FilterSection>
        <FilterSection title="Brands">
          {safeBrands.map((brand) => (
            <label key={brand} className="block">
              <input
                type="checkbox"
                checked={filters.brand.includes(brand)}
                onChange={() => handleCheckbox("brand", brand)}
                className="mr-2"
              />
              {brand}
            </label>
          ))}
        </FilterSection>
        {showColor && (
          <FilterSection title="Colors">
            {safeColors.map((color) => (
              <label key={color} className="inline-flex items-center mr-2 mb-1">
                <input
                  type="checkbox"
                  checked={filters.color && filters.color.includes(color)}
                  onChange={() => handleCheckbox("color", color)}
                  className="mr-1"
                />
                <span className="w-4 h-4 rounded-full border mr-1" style={{ background: color.toLowerCase() }}></span>
                <span className="capitalize text-xs">{color}</span>
              </label>
            ))}
          </FilterSection>
        )}
        {showSize && (
          <FilterSection title="Size">
            {/* Add size options here if needed */}
          </FilterSection>
        )}
        <FilterSection title="Rating">
          {[4, 3, 2, 1].map((star) => (
            <label key={star} className="inline-flex items-center mr-2 mb-1">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === star}
                onChange={() => handleRadio("rating", star)}
                className="mr-1"
              />
              <span className="text-yellow-500">{'★'.repeat(star)}</span>
              <span className="ml-1 text-xs">&amp; up</span>
            </label>
          ))}
        </FilterSection>
        <FilterSection title="Availability">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={() => setFilters(prev => ({ ...prev, inStock: !prev.inStock }))}
              className="mr-2"
            />
            In Stock Only
          </label>
        </FilterSection>
        {showOffer && (
          <FilterSection title="Offers">
            {['Yes'].map((offer) => (
              <label key={offer} className="block">
                <input
                  type="checkbox"
                  checked={safeOffer.includes(offer)}
                  onChange={() => handleCheckbox("offer", offer)}
                  className="mr-2"
                />
                {offer === 'Yes' ? 'Show Offers Only' : offer}
              </label>
            ))}
          </FilterSection>
        )}
        {showBestSeller && (
          <FilterSection title="Best Sellers">
            {['Yes'].map((val) => (
              <label key={val} className="block">
                <input
                  type="checkbox"
                  checked={safeBestSeller.includes(val)}
                  onChange={() => handleCheckbox("bestSeller", val)}
                  className="mr-2"
                />
                Best Sellers Only
              </label>
            ))}
          </FilterSection>
        )}
      </div>
      {/* Price Range filter handled by PriceSlider at the bottom, no extra inputs */}
      <div className="mt-auto pt-4 sticky bottom-0 bg-white z-10 overflow-x-hidden w-full max-w-full">
        <PriceSlider
          min={0}
          max={150000}
          value={priceRange}
          onChange={val => {
            setPriceRange(val);
            setFilters(f => ({ ...f, price: { min: val[0], max: val[1] } }));
          }}
        />
      </div>
    </aside>
  );
}