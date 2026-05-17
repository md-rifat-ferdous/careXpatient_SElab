"use client";

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';

export function PriceSlider({ maxPrice, onChange }: { maxPrice?: number; onChange?: (val: number) => void }) {
  const [value, setValue] = useState(maxPrice ?? 5000);
  const MAX = 5000;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setValue(v);
    onChange?.(v);
  };

  const pct = Math.round((value / MAX) * 100);

  return (
    <div className="flex flex-col gap-2 min-w-[240px]">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price Range:</span>
        <span className="text-xs font-bold text-primary">৳0 – ৳{value.toLocaleString()}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute w-full h-1.5 bg-slate-100 rounded-full" />
        <div
          className="absolute h-1.5 bg-primary rounded-full"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={0}
          max={MAX}
          step={50}
          value={value}
          onChange={handleChange}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className="absolute w-4 h-4 bg-white border-2 border-primary rounded-full shadow-md pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
    </div>
  );
}
