import React from 'react';

export function OrderSummary() {
  return (
    <aside className="w-80 shrink-0">
      <div className="bg-white rounded-2xl shadow-xl shadow-teal-900/5 p-7 border border-slate-50 h-full flex flex-col">
        <div className="shrink-0 mb-8">
          <h3 className="text-xl font-bold text-on-surface">Order Summary</h3>
          <p className="text-sm text-slate-400 font-medium mt-1">2 tests selected</p>
        </div>
        {/* Selected Items List */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 pr-1 space-y-6 mb-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h4 className="text-sm font-bold text-on-surface">Lipid Profile</h4>
              <p className="text-[11px] text-primary font-semibold">careX Lab</p>
              <button className="text-error mt-2 flex items-center justify-center w-6 h-6 rounded-lg hover:bg-red-50 transition-colors">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
            <span className="text-sm font-bold text-on-surface">৳1,200</span>
          </div>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h4 className="text-sm font-bold text-on-surface">HbA1c</h4>
              <p className="text-[11px] text-primary font-semibold">Metro Diagnostics</p>
              <button className="text-error mt-2 flex items-center justify-center w-6 h-6 rounded-lg hover:bg-red-50 transition-colors">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
            <span className="text-sm font-bold text-on-surface">৳850</span>
          </div>
        </div>
        <div className="shrink-0 mt-auto">
          {/* Home Collection Toggle */}
          <div className="p-4 bg-teal-50/50 rounded-2xl mb-8 border border-teal-100/50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-lg">home</span>
                </div>
                <span className="text-sm font-bold text-on-surface">Home Collection</span>
              </div>
              <button aria-checked="true" className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-primary" role="switch">
                <span aria-hidden="true" className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5"></span>
              </button>
            </div>
            <div className="mt-2 pl-10">
              <span className="text-[11px] text-slate-500 font-medium">+৳100 Collection Fee</span>
            </div>
          </div>
          {/* Price Breakdown */}
          <div className="space-y-3.5 mb-8 pt-6 border-t border-slate-100">
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Subtotal</span>
              <span>৳2,050</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Home Collection Fee</span>
              <span>৳100</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>VAT (5%)</span>
              <span>৳103</span>
            </div>
            <div className="flex justify-between pt-5 border-t border-slate-100">
              <span className="font-bold text-on-surface">Total Amount</span>
              <span className="font-black text-teal-600 text-xl">৳2,253</span>
            </div>
          </div>
          {/* Primary CTA */}
          <button className="w-full py-4 bg-primary text-white rounded-xl font-bold text-base hover:bg-teal-700 transition-all shadow-lg shadow-teal-900/10 flex items-center justify-center gap-2 group">
            Proceed to Checkout
            <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
          <p className="text-[10px] text-center text-slate-400 mt-6 uppercase tracking-[0.2em] font-black">
            SECURE CHECKOUT BY CAREXPATIENT
          </p>
        </div>
      </div>
    </aside>
  );
}