import React from 'react';

export function PriceSlider() {
  return (
    <div className="flex flex-col gap-2 min-w-[280px]">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price Range:</span>
        <span className="text-xs font-bold text-primary">৳0 – ৳3000</span>
      </div>
      <div className="relative h-6 flex items-center px-2">
        <div className="absolute w-full h-1.5 bg-slate-100 rounded-full"></div>
        <div className="absolute w-full h-1.5 bg-primary rounded-full"></div>
        <div className="absolute left-0 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform z-10"></div>
        <div className="absolute right-0 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform z-10"></div>
      </div>
    </div>
  );
}
