import React from 'react';

export default function SearchBar({ 
  value = '', 
  onChange, 
  placeholder = 'Search...', 
  onFilterClick 
}) {
  return (
    <div className="flex items-center gap-3 w-full md:w-auto">
      <div className="relative flex-1 md:w-72">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
          search
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-white border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container outline-none transition-all placeholder:text-subtle-gray text-on-surface font-medium"
        />
      </div>
      {onFilterClick && (
        <button 
          onClick={onFilterClick}
          className="p-2.5 border border-outline-variant bg-surface-white text-on-surface-variant hover:text-primary-container hover:bg-primary-container/5 rounded-xl transition-all flex items-center justify-center shrink-0 shadow-sm"
        >
          <span className="material-symbols-outlined">filter_list</span>
        </button>
      )}
    </div>
  );
}
