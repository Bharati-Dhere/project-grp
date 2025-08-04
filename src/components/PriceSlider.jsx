import React from "react";

export default function PriceSlider({ min, max, value, onChange }) {
  // Calculate percent for range bar
  const left = ((value[0] - min) / (max - min)) * 100;
  const right = ((value[1] - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2 w-full max-w-full overflow-x-hidden">
      <div className="mb-1">
        <label className="font-semibold text-gray-700">Price Range</label>
      </div>
      <div className="relative flex flex-col w-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">₹{min}</span>
          <span className="text-xs text-gray-500">₹{max}</span>
        </div>
        <div className="relative h-3 flex items-center w-full max-w-full overflow-x-hidden">
          <div className="absolute left-0 right-0 h-1 bg-gray-200 rounded-full max-w-full overflow-x-hidden" />
          <div
            className="absolute h-1 bg-blue-400 rounded-full max-w-full overflow-x-hidden"
            style={{ left: `${left}%`, right: `${100 - right}%` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            value={value[0]}
            onChange={e => {
              const val = Math.min(Number(e.target.value), value[1] - 1);
              onChange([val, value[1]]);
            }}
            className="absolute w-full h-3 bg-transparent appearance-none pointer-events-auto accent-blue-500"
            style={{ zIndex: 2 }}
          />
          <input
            type="range"
            min={min}
            max={max}
            value={value[1]}
            onChange={e => {
              const val = Math.max(Number(e.target.value), value[0] + 1);
              onChange([value[0], val]);
            }}
            className="absolute w-full h-3 bg-transparent appearance-none pointer-events-auto accent-blue-500"
            style={{ zIndex: 3 }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">₹{value[0]}</span>
          <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">₹{value[1]}</span>
        </div>
      </div>
    </div>
  );
}
