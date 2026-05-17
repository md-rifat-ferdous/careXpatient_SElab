"use client";

import { useCartStore } from '@/store/cartStore';
import { useState, useEffect } from 'react';
import { CheckoutModal } from './CheckoutModal';

export function OrderSummary() {
  const { 
    items, homeCollection, discount, couponCode,
    removeItem, toggleHomeCollection, 
    getSubtotal, getHomeCollectionFee, getVat, getTotal 
  } = useCartStore();
  
  const [removing, setRemoving] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <aside className="w-80 shrink-0 h-full flex flex-col border-l border-slate-100 animate-pulse">
        <div className="bg-white h-full flex flex-col p-7">
          <div className="h-6 w-32 bg-slate-100 rounded-lg mb-2" />
          <div className="h-4 w-20 bg-slate-100 rounded" />
        </div>
      </aside>
    );
  }

  const handleRemove = (id: string) => {
    setRemoving(id);
    setTimeout(() => {
      removeItem(id);
      setRemoving(null);
    }, 300);
  };

  const subtotal = getSubtotal();
  const fee = getHomeCollectionFee();
  const vat = getVat();
  const total = getTotal();
  const labs = new Set(items.map(i => i.labName)).size;

  return (
    <aside className="w-80 shrink-0 h-full flex flex-col border-l border-slate-100">
      <div className="bg-white h-full flex flex-col p-7">
        {/* Header */}
        <div className="shrink-0 mb-6">
          <h3 className="text-xl font-black text-on-surface">Order Summary</h3>
          <p className="text-sm text-slate-400 font-medium mt-0.5">
            {items.length === 0 ? 'No tests selected' : `${items.length} test${items.length > 1 ? 's' : ''} selected`}
          </p>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 mb-6 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-slate-300">shopping_cart</span>
              </div>
              <p className="text-sm font-semibold text-slate-400">Your cart is empty</p>
              <p className="text-xs text-slate-300 mt-1">Add tests to get started</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`flex justify-between items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 transition-all duration-300 ${
                  removing === item.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-on-surface truncate">{item.name}</h4>
                  <p className="text-[11px] text-primary font-black uppercase tracking-wider mt-0.5">{item.labName}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm font-black text-on-surface">৳{item.price.toLocaleString()}</span>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-400 hover:bg-red-50 p-1 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="shrink-0 mt-auto">
          {/* Home Collection Toggle */}
          <div className={`p-4 rounded-2xl mb-5 border transition-all ${homeCollection ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm shrink-0 ${homeCollection ? 'bg-amber-500 text-white' : 'bg-white text-slate-400'}`}>
                  <span className="material-symbols-outlined text-[18px]">home</span>
                </div>
                <div>
                  <span className="text-sm font-bold text-on-surface">Home Collection</span>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    {homeCollection ? `৳150 × ${labs} Lab${labs > 1 ? 's' : ''}` : 'Sample Pickup'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleHomeCollection}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  homeCollection ? 'bg-primary' : 'bg-slate-200'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${homeCollection ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3 mb-6 pt-5 border-t border-slate-100">
            <div className="flex justify-between text-sm text-slate-500">
              <span className="font-bold">Subtotal</span>
              <span className="font-black text-on-surface">৳{subtotal.toLocaleString()}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-xl">
                <span className="font-bold">Discount</span>
                <span className="font-black">-৳{discount.toLocaleString()}</span>
              </div>
            )}

            {homeCollection && (
              <div className="flex justify-between text-sm text-slate-500">
                <span className="font-bold">Home Collection</span>
                <span className="font-black text-on-surface">৳{fee.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-sm text-slate-500">
              <span className="font-bold">VAT (5%)</span>
              <span className="font-black text-on-surface">৳{vat.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <span className="font-black text-on-surface">Total</span>
              <span className="font-black text-primary text-2xl">৳{total.toLocaleString()}</span>
            </div>
          </div>

          {/* CTA */}
          <button
            disabled={items.length === 0}
            onClick={() => setCheckoutOpen(true)}
            className="w-full py-4.5 bg-primary text-white rounded-2xl font-black text-base hover:bg-teal-700 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Check Out
            <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
          
          <p className="text-[10px] text-center text-slate-300 mt-5 uppercase tracking-[0.2em] font-black">
            Secure · careXpatient
          </p>

          <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
        </div>
      </div>
    </aside>
  );
}
