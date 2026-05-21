"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

interface Report {
  id: number;
  title: string;
  labName: string;
  date: string;
  status: string;
  fileUrl: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  Reported: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
  Pending:  'bg-amber-50 text-amber-700 border border-amber-200/50',
  Processing: 'bg-sky-50 text-sky-700 border border-sky-200/50',
  Cancelled: 'bg-rose-50 text-rose-700 border border-rose-200/50',
};

const DATE_FILTERS = ['All Time', 'Last 30 Days', 'Last 6 Months'];
const TEST_TYPES   = ['All Types', 'Blood Work', 'Urine Work', 'Imaging', 'Microbiology', 'Cardiac'];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PatientReportsPage() {
  const { user } = useAuthStore();
  const [reports, setReports]       = useState<Report[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const [search, setSearch]         = useState('');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [page, setPage]             = useState(1);
  const limit = 6;

  const fetchReports = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        userId: user.id,
      });
      if (search)                     params.set('search', search);
      if (dateFilter !== 'All Time')  params.set('date', dateFilter);
      if (typeFilter !== 'All Types') params.set('type', typeFilter);

      const res = await fetch(`${API_BASE}/reports?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch reports');
      const json = await res.json();
      setReports(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch (err: any) {
      setError(err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user?.id, search, dateFilter, typeFilter, page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const totalPages = Math.ceil(total / limit);

  // Derive stats
  const reportedCount = reports.filter(r => r.status === 'Reported').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
      {/* Page Title & Desc */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Medical Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Access, filter, and download your diagnostic lab results.</p>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reports</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{total}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ready / Released</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{reportedCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Labs Visited</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">
              {reports.length > 0 ? Array.from(new Set(reports.map(r => r.labName))).length : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            id="report-search"
            placeholder="Search by test name, order ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-sm transition-all"
          />
        </div>

        <div className="flex gap-2">
          <select
            id="date-filter"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
          >
            {DATE_FILTERS.map(d => <option key={d}>{d}</option>)}
          </select>

          <select
            id="type-filter"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
          >
            {TEST_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-6 flex items-center gap-4">
          <svg className="w-6 h-6 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold text-slate-800">Could not load reports</p>
            <p className="text-sm opacity-80 mt-0.5">{error}</p>
          </div>
          <button onClick={fetchReports} className="ml-auto px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors shadow-sm shadow-rose-200">
            Retry
          </button>
        </div>
      )}

      {/* Skeleton loader */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse space-y-4 shadow-sm">
              <div className="h-5 bg-slate-100 rounded-full w-3/4" />
              <div className="h-4 bg-slate-100 rounded-full w-1/2" />
              <div className="h-4 bg-slate-100 rounded-full w-2/3" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-7 bg-slate-100 rounded-full w-20" />
                <div className="h-9 bg-slate-100 rounded-xl w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && reports.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">No Reports Available</h2>
          <p className="text-slate-500 mt-2 max-w-sm">
            We couldn't find any completed lab reports matching your current filter selections.
          </p>
        </div>
      )}

      {/* Report Cards Grid */}
      {!loading && !error && reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="group bg-white rounded-2xl border border-slate-100 hover:border-teal-500/20 shadow-sm hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Colored top bar */}
              <div className="h-1 bg-gradient-to-r from-teal-500 to-indigo-500 w-full" />
              
              <div className="p-6 flex flex-col gap-3 flex-1">
                {/* Icon & Title */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                    <svg className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 leading-snug truncate group-hover:text-teal-600 transition-colors" title={report.title}>
                      {report.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 mt-1 truncate">{report.labName}</p>
                  </div>
                </div>

                {/* Date Meta */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mt-1">
                  <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {report.date}
                </div>

                {/* Status badge */}
                <span className={`inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[report.status] ?? 'bg-slate-100 text-slate-700'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {report.status}
                </span>

                <div className="flex-1" />

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Link
                    href={`/dashboard/patient/reports/${report.id}`}
                    className="flex-1 bg-slate-50 hover:bg-teal-600 text-slate-700 hover:text-white text-center py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
                  >
                    View Details
                  </Link>
                  {report.fileUrl && (
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Download PDF Report"
                      className="w-10 h-10 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-100/50 rounded-xl flex items-center justify-center transition-all shrink-0 shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 pt-4">
          <button
            id="prev-page"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-teal-600 hover:text-white hover:border-teal-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              id={`page-${p}`}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                p === page ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20' : 'border border-slate-200 text-slate-600 hover:bg-teal-50/50 hover:border-teal-500/20'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            id="next-page"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-teal-600 hover:text-white hover:border-teal-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
