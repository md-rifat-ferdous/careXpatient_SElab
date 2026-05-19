'use client';

import React, { useState, useEffect } from 'react';
import { TopNavBar, SideNavBar } from '@/components/Navigation';
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
    <div className="w-full space-y-6">
      {/* Page Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2">Prescriptions</h1>
        <p className="text-base text-text-muted font-medium">
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
              className="mb-6 flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-medium bg-surface px-4 py-2 rounded-xl border border-border-soft shadow-soft inline-flex"
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
                <div className="flex items-center justify-between bg-surface px-6 py-4 rounded-xl shadow-soft border border-border-soft mt-8">
                  <p className="text-sm text-text-muted">
                      Page <span className="font-bold text-text">{page}</span> of <span className="font-bold text-text">{totalPages}</span>
                  </p>
                  <div className="flex gap-2">
                    <button 
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border border-border-soft transition-colors ${page === 1 ? 'opacity-30 cursor-not-allowed' : 'text-text-muted hover:bg-surface-muted'}`}
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button 
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border border-border-soft transition-colors ${page === totalPages ? 'opacity-30 cursor-not-allowed' : 'text-text-muted hover:bg-surface-muted'}`}
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
                <div className="bg-surface rounded-[32px] border border-border-soft p-20 flex flex-col items-center justify-center min-h-[600px] shadow-soft">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <p className="mt-4 text-text-muted font-medium">Fetching secure record...</p>
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
  );
}
