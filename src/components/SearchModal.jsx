import React, { useState } from "react";
import productsData from "../utils/productsData";
import ProductCard from "./ProductCard";

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setResults([]);
      setSearched(true);
      return;
    }
    const q = query.trim().toLowerCase();
    const found = productsData.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
    setResults(found);
    setSearched(true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
          onClick={onClose}
        >
          ×
        </button>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name, brand, or category..."
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus
          />
          <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition">Search</button>
        </form>
        {searched && results.length === 0 && (
          <div className="text-center text-red-500 font-semibold">No products found.</div>
        )}
        {results.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} showActions={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
