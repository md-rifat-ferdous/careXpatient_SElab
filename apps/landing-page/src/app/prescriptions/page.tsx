'use client';

import React, { useState, useEffect } from 'react';
import { TopNavBar, SideNavBar } from '@/components/reports/Navigation';
import PrescriptionFilters from '@/components/prescriptions/PrescriptionFilters';
import PrescriptionList from '@/components/prescriptions/PrescriptionList';
import PrescriptionDetailView from '@/components/prescriptions/PrescriptionDetailView';

export default function PrescriptionManagementPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        doctorName: doctorId,
        status,
        date,
        page: String(page)
      }).toString();
      
      const res = await fetch(`http://localhost:5000/api/prescriptions?${query}`);
      const result = await res.json();
      if (result.success) {
        setPrescriptions(result.data);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptionDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/prescriptions/${id}`);
      const result = await res.json();
      if (result.success) {
        setSelectedPrescription(result.data);
      }
    } catch (err) {
      console.error('Error fetching detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [search, doctorId, status, date, page]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SideNavBar />
      <main className="flex-1 md:ml-64 flex flex-col min-w-0 bg-slate-50 relative">
        <TopNavBar />
        
        <div className="px-6 pb-6 pt-24 lg:px-8 lg:pb-8 flex-1 overflow-y-auto relative z-10">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Prescriptions</h1>
              <p className="text-base text-slate-500 font-medium">
                Access and manage your digital healthcare records in one secure place.
              </p>
            </header>

            {/* Filters Section */}
            {!selectedId && (
              <section className="mb-8">
                <PrescriptionFilters 
                  searchQuery={search}
                  doctor={doctorId}
                  date={date}
                  onSearch={(val) => { setSearch(val); setPage(1); }}
                  onFilterDoctor={(val) => { setDoctorId(val); setPage(1); }}
                  onFilterDate={(val) => { setDate(val); setPage(1); }}
                />
              </section>
            )}

            {/* Main Content */}
            <div className="w-full">
                {/* Back Button when viewing detail */}
                {selectedId && (
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="mb-6 flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors font-medium bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm inline-flex"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Prescriptions
                  </button>
                )}

                {!selectedId ? (
                  <div className="space-y-6">
                    <PrescriptionList 
                      prescriptions={prescriptions} 
                      loading={loading}
                      selectedId={selectedId}
                      onSelect={(id) => {
                        setSelectedId(id);
                        fetchPrescriptionDetail(id);
                      }}
                    />
                    
                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-100 mt-8">
                        <p className="text-sm text-slate-500">
                           Page <span className="font-bold text-slate-900">{page}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                          <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 transition-colors ${page === 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}
                          >
                            <span className="material-symbols-outlined">chevron_left</span>
                          </button>
                          <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 transition-colors ${page === totalPages ? 'opacity-30 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}
                          >
                            <span className="material-symbols-outlined">chevron_right</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {detailLoading ? (
                      <div className="bg-white rounded-[32px] border border-[#F1F5F9] p-20 flex flex-col items-center justify-center min-h-[600px] shadow-sm">
                        <div className="w-12 h-12 border-4 border-[#0D9488]/20 border-t-[#0D9488] rounded-full animate-spin"></div>
                        <p className="mt-4 text-[#64748B] font-medium">Fetching secure record...</p>
                      </div>
                    ) : selectedPrescription && (
                      <PrescriptionDetailView 
                        data={selectedPrescription} 
                        onClose={() => setSelectedId(null)}
                      />
                    )}
                  </div>
                )}
              </div>
          </div>
        </div>

        <footer className="p-8 border-t border-slate-100 text-center text-slate-400 text-xs font-medium">
          © 2024 careXpatient. All rights reserved.
        </footer>
      </main>


      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
}
