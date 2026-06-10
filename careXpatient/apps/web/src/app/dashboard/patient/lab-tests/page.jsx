"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { PriceSlider } from '@/components/lab-tests/PriceSlider';
import { OrderSummary } from '@/components/lab-tests/OrderSummary';
import { LabTestCard } from '@/components/lab-tests/LabTestCard';
import { LabTestModal } from '@/components/lab-tests/LabTestModal';
import { useCartStore } from '@/store/cartStore';

const TABS = ['All', 'Blood', 'Imaging', 'Cardiac', 'Full Body Checkup'];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse flex flex-col gap-4 h-[260px]">
      <div>
        <div className="h-5 bg-slate-100 rounded-lg w-2/3 mb-3" />
        <div className="h-4 bg-slate-100 rounded-full w-1/3" />
      </div>
      <div className="h-4 bg-slate-100 rounded w-full" />
      <div className="h-4 bg-slate-100 rounded w-4/5" />
      <div className="mt-auto flex justify-between items-end">
        <div>
          <div className="h-3 bg-slate-100 rounded w-20 mb-2" />
          <div className="h-6 bg-slate-100 rounded w-16" />
        </div>
        <div className="w-11 h-11 bg-slate-100 rounded-full" />
      </div>
    </div>);

}

export default function LabTestsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedTest, setSelectedTest] = useState(null);
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState(5000);

  const { items, addItem } = useCartStore();
  const cartIds = useMemo(() => new Set(items.map((i) => i.testId)), [items]);

  // Fetch when tab changes
  useEffect(() => {
    fetchTests(activeTab, search);
  }, [activeTab]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchTests(activeTab, search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTests = async (category, q) => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/lab-tests?category=${encodeURIComponent(category)}`;
      if (q.trim()) url += `&search=${encodeURIComponent(q.trim())}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed');
      setTests(await res.json());
    } catch {
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side price filtering
  const displayedTests = useMemo(
    () => tests.filter((t) => t.price <= maxPrice),
    [tests, maxPrice]
  );

  const handleAddToCart = useCallback((test, labName, price) => {
    if (cartIds.has(test.id)) return;
    addItem({
      id: test.id,
      testId: test.id,
      name: test.name,
      labName: labName ?? test.labName,
      price: price ?? test.price
    });
  }, [cartIds, addItem]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Sticky header */}
        <header className="shrink-0 px-8 pt-8 pb-5 border-b border-slate-100 bg-white z-20">
          {/* Title + Search row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-on-surface">Book Lab Tests</h1>
              <p className="text-sm text-subtle-gray mt-0.5">
                Choose from {tests.length} tests across trusted labs
              </p>
            </div>

            <div className="relative w-full md:max-w-sm">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tests, profiles..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm font-medium text-foreground placeholder:text-slate-400" />
              
              {search &&
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              }
            </div>
          </div>

          {/* Filters row */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 xl:pb-0">
              {TABS.map((tab) =>
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab ?
                'bg-primary text-white shadow-md shadow-primary/20' :
                'bg-white text-slate-500 border border-slate-200 hover:border-primary/40 hover:text-primary'}`
                }>
                
                  {tab}
                </button>
              )}
            </div>

            {/* Price slider */}
            <div className="hidden md:block shrink-0">
              <PriceSlider onChange={setMaxPrice} />
            </div>
          </div>
        </header>

        {/* Tests Grid */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
          {loading ?
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div> :
          displayedTests.length === 0 ?
          <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
              </div>
              <p className="text-lg font-bold text-on-surface mb-2">No tests found</p>
              <p className="text-sm text-subtle-gray max-w-xs">
                {search ? `No results for "${search}". Try a different term.` : 'No tests match the selected filters.'}
              </p>
              {(search || activeTab !== 'All') &&
            <button
              onClick={() => {setSearch('');setActiveTab('All');setMaxPrice(5000);}}
              className="mt-5 px-6 py-2.5 bg-primary text-white rounded-full text-sm font-bold hover:bg-teal-700 transition-all">
              
                  Clear filters
                </button>
            }
            </div> :

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {displayedTests.map((test) =>
            <LabTestCard
              key={test.id}
              id={test.id}
              name={test.name}
              tag={test.tag}
              tagColor={test.tagColor}
              description={test.description}
              labName={test.labName}
              price={test.price}
              timeInfo={test.deliveryTime}
              inCart={cartIds.has(test.id)}
              onClick={() => setSelectedTest(test)}
              onAddToCart={() => handleAddToCart(test)} />

            )}
            </div>
          }
        </div>
      </div>

      {/* ── Right: Order Summary ── */}
      <OrderSummary />

      {/* ── Modal ── */}
      <LabTestModal
        isOpen={!!selectedTest}
        onClose={() => setSelectedTest(null)}
        test={selectedTest}
        isInCart={selectedTest ? cartIds.has(selectedTest.id) : false}
        onAddToCart={handleAddToCart} />
      
    </div>);

}