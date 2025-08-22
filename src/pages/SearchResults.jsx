import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import productsData from "../utils/productsData";
import ProductCard from "../components/ProductCard";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const query = useQuery();
  const navigate = useNavigate();
  const q = query.get("q")?.trim() || "";
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError("");
    Promise.all([
      fetch(`/api/products?q=${encodeURIComponent(q)}`).then(res => res.json()),
      fetch(`/api/accessories?q=${encodeURIComponent(q)}`).then(res => res.json())
    ])
      .then(([productsData, accessoriesData]) => {
        const products = (productsData.success && Array.isArray(productsData.data)) ? productsData.data : [];
        const accessories = (accessoriesData.success && Array.isArray(accessoriesData.data)) ? accessoriesData.data : [];
        const allResults = [...products, ...accessories];
        if (allResults.length > 0) {
          setResults(allResults);
        } else {
          setResults([]);
          setError("No products or accessories found.");
        }
      })
      .catch(() => {
        setResults([]);
        setError("Error fetching products or accessories.");
      })
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-6">Search Results for "{q}"</h1>
      {q === "" && (
        <div className="text-gray-500">Please enter a search term.</div>
      )}
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500 font-semibold">{error}</div>}
      {!loading && !error && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {results.map((item) => (
            <ProductCard key={item._id || item.id} product={item} showActions={false} />
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
