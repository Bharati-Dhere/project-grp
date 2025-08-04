import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import productsData from "../utils/productsData";
import ProductCard from "../components/ProductCard";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const query = useQuery();
  const navigate = useNavigate();
  const q = query.get("q")?.trim().toLowerCase() || "";
  const results = q
    ? productsData.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-6">Search Results for "{q}"</h1>
      {q === "" && (
        <div className="text-gray-500">Please enter a search term.</div>
      )}
      {q && results.length === 0 && (
        <div className="text-red-500 font-semibold">No products found.</div>
      )}
      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} showActions={false} />
          ))}
        </div>
      )}
      <button
        className="mt-8 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
        onClick={() => navigate(-1)}
      >
        Back
      </button>
    </div>
  );
}
