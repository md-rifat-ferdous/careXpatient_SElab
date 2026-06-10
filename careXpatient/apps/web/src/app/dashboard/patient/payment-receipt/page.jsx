"use client";

import React from 'react';

export default function PaymentReceiptPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Payment & Receipt</h1>
        <p className="text-slate-500 mt-1">Manage your billing and view receipts.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">💳</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Coming Soon</h2>
        <p className="text-slate-500 mt-2 max-w-sm">
          Payment history and receipts will be available here soon.
        </p>
      </div>
    </div>);

}