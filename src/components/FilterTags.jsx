import React from "react";

export default function FilterTags({ filters, onRemove, onClearAll }) {
  if (!filters) return null;

  const generateTags = () => {
    const tags = [];
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length) {
        value.forEach((val) => {
          tags.push({ key, value: val });
        });
      } else if (key === "price" && value && typeof value === "object") {
        const min = value.min || 0;
        const max = value.max || 0;
        if (min || max) {
          tags.push({
            key,
            value: `₹${min} - ₹${max}`,
          });
        }
      } else if (key === "rating" && value) {
        tags.push({ key, value: `${value}★ & up` });
      } else if ((key === "inStock" || key === "available") && value) {
        tags.push({ key, value: "In Stock" });
      }
    });
    return tags;
  };

  const tags = generateTags();

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 items-center">
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center shadow-sm animate-fadeIn"
        >
          {tag.value}
          <button
            className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
            onClick={() => onRemove(tag.key, tag.value)}
            aria-label={`Remove ${tag.value}`}
          >
            ✕
          </button>
        </span>
      ))}
      <button
        className="ml-4 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full text-xs font-semibold transition hidden sm:inline"
        onClick={onClearAll}
        aria-label="Clear all filters"
      >
        Clear All
      </button>
    </div>
  );
}
