'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import {
  getLabPatients,
  type LabPatient,
} from '@/services/lab.service';

// ── Status badge colour helper ────────────────────────────────────────────────
function BloodGroupBadge({ group }: { group: string | null }) {
  if (!group) return <span className="text-slate-400 text-sm">—</span>;
  const colours: Record<string, string> = {
    'A+': 'bg-red-50 text-red-600 border-red-100',
    'A-': 'bg-red-50 text-red-700 border-red-100',
    'B+': 'bg-blue-50 text-blue-600 border-blue-100',
    'B-': 'bg-blue-50 text-blue-700 border-blue-100',
    'O+': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'O-': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'AB+': 'bg-violet-50 text-violet-600 border-violet-100',
    'AB-': 'bg-violet-50 text-violet-700 border-violet-100',
  };
  const cls = colours[group] ?? 'bg-slate-50 text-slate-600 border-slate-100';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {group}
    </span>
  );
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-9 h-9 rounded-full object-cover border border-slate-100"
      />
    );
  }
  const colors = [
    'bg-teal-500', 'bg-violet-500', 'bg-sky-500', 'bg-rose-500',
    'bg-amber-500', 'bg-indigo-500', 'bg-emerald-500',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center shrink-0`}>
      <span className="text-white text-xs font-bold">{initials}</span>
    </div>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 bg-slate-100 rounded-md" />
        </td>
      ))}
    </tr>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LabPatientsPage() {
  const router   = useRouter();
  const { token } = useAuthStore();

  const [patients,     setPatients]     = useState<LabPatient[]>([]);
  const [totalCount,   setTotalCount]   = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [search,       setSearch]       = useState('');
  const [searchInput,  setSearchInput]  = useState('');
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  const LIMIT = 10;

  const fetchPatients = useCallback(async (page: number, q: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getLabPatients(token, page, q, LIMIT);
      setPatients(res.data);
      setTotalCount(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchPatients(currentPage, search); }, [fetchPatients, currentPage, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setCurrentPage(1);
  };

  const goToPage = (p: number) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  const pageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="min-h-full bg-slate-50">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-teal-100 text-sm font-medium mb-0.5">Lab Portal</p>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              Patients
              {!loading && (
                <span className="bg-white/20 text-white text-sm font-semibold px-3 py-0.5 rounded-full">
                  {totalCount}
                </span>
              )}
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
            <svg className="w-5 h-5 text-teal-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-white text-sm font-medium">All Patients</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ── Search bar ── */}
        <form onSubmit={handleSearch} className="mb-5">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="patient-search"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name or phone…"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent shadow-sm transition"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* ── Error ── */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Blood Group</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Test</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(LIMIT)].map((_, i) => <SkeletonRow key={i} />)
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="font-medium text-slate-500">
                          {search ? `No patients found for "${search}"` : 'No patients yet'}
                        </p>
                        {search && (
                          <button onClick={handleClearSearch} className="text-teal-600 text-sm hover:underline">
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  patients.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/dashboard/lab/patients/${p.id}`)}
                    >
                      {/* Patient */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.fullName} url={p.profilePhotoUrl} />
                          <div>
                            <p className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">
                              {p.fullName}
                            </p>
                            {p.email && (
                              <p className="text-xs text-slate-400 truncate max-w-[160px]">{p.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Phone */}
                      <td className="px-4 py-3.5 text-slate-600 font-mono text-sm">{p.phone}</td>
                      {/* Blood Group */}
                      <td className="px-4 py-3.5">
                        <BloodGroupBadge group={p.bloodGroup} />
                      </td>
                      {/* Orders */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-50 text-teal-700 font-bold text-xs border border-teal-100">
                          {p.ordersCount}
                        </span>
                      </td>
                      {/* Last Test */}
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-slate-700 text-sm">{formatDate(p.lastOrderDate)}</p>
                          {p.lastOrderTests && (
                            <p className="text-xs text-slate-400 truncate max-w-[180px]">{p.lastOrderTests}</p>
                          )}
                        </div>
                      </td>
                      {/* Arrow */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          id={`view-patient-${p.id}`}
                          aria-label={`View history for ${p.fullName}`}
                          onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/lab/patients/${p.id}`); }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-teal-500 text-slate-500 hover:text-white transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <div className="px-4 py-3.5 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Showing {((currentPage - 1) * LIMIT) + 1}–{Math.min(currentPage * LIMIT, totalCount)} of {totalCount} patients
              </p>
              <div className="flex items-center gap-1">
                <button
                  id="prev-page"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {pageNumbers().map((p, i) =>
                  p === '...' ? (
                    <span key={`dot-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      id={`page-${p}`}
                      onClick={() => goToPage(p as number)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === p
                          ? 'bg-teal-500 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  id="next-page"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
