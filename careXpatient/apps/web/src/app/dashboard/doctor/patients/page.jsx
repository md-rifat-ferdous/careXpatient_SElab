'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Search, Users } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import PatientListTable from '@/components/doctor/PatientListTable';
import { fetchDoctorPatients } from '@/services/doctor.service';

// ─── Inner Content (needs Suspense due to useSearchParams pattern avoidance) ───

function MyPatientsContent() {
  const { user, token } = useAuthStore();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // ── Debounced Data Fetch ──────────────────────────────────────────────────────

  const loadPatients = useCallback(async (searchQuery) => {
    if (!user?.id || !token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDoctorPatients(user.id, token, searchQuery);
      setPatients(data);
    } catch {
      setError('Could not load patients. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [user?.id, token]);

  // Initial load
  useEffect(() => {
    loadPatients('');
  }, [loadPatients]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => loadPatients(search), 300);
    return () => clearTimeout(timer);
  }, [search, loadPatients]);

  return (
    <div className="max-w-6xl mx-auto py-6 animate-fade-in space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Patients</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            All patients who have had appointments with you.
          </p>
        </div>
        {!loading && !error &&
        <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-xl text-sm font-semibold">
            <Users size={16} />
            {patients.length} {patients.length === 1 ? 'Patient' : 'Patients'}
          </div>
        }
      </div>

      {/* ── Search Bar ── */}
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        
        <input
          id="patient-search"
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all shadow-sm" />
        
      </div>

      {/* ── Error Banner ── */}
      {error &&
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-rose-500 flex-shrink-0">⚠️</span>
          <p className="text-rose-800 text-sm">{error}</p>
          <button
          onClick={() => setError(null)}
          className="ml-auto text-rose-400 hover:text-rose-600 transition-colors"
          aria-label="Dismiss">
          
            ✕
          </button>
        </div>
      }

      {/* ── Patient Table ── */}
      <PatientListTable patients={patients} loading={loading} />
    </div>);

}

// ─── Default Export (wrapped in Suspense) ─────────────────────────────────────

export default function MyPatientsPage() {
  return (
    <Suspense
      fallback={
      <div className="max-w-6xl mx-auto py-6">
          <h1 className="text-xl font-bold text-slate-900">My Patients</h1>
          <p className="text-sm text-slate-400 mt-1">Loading...</p>
        </div>
      }>
      
      <MyPatientsContent />
    </Suspense>);

}