"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';










const STATUS_COLORS = {
  Reported: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-700'
};

const DATE_FILTERS = ['All Time', 'Last 30 Days', 'Last 6 Months'];
const TEST_TYPES = ['All Types', 'Blood Work', 'Urine Work', 'Imaging', 'Microbiology', 'Cardiac'];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [page, setPage] = useState(1);
  const limit = 9;

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });
      if (search) params.set('search', search);
      if (dateFilter !== 'All Time') params.set('date', dateFilter);
      if (typeFilter !== 'All Types') params.set('type', typeFilter);

      const res = await fetch(`${API_BASE}/reports?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch reports');
      const json = await res.json();
      setReports(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch (err) {
      setError(err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [search, dateFilter, typeFilter, page]);

  useEffect(() => {fetchReports();}, [fetchReports]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass h-20 flex items-center border-b border-foreground/5">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M5 12h14" /></svg>
            </div>
            <span className="text-2xl font-bold tracking-tight">care<span className="text-primary">X</span>patient</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/reports" className="text-primary font-bold">My Reports</Link>
            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="pt-28 pb-16">
        <div className="container mx-auto px-6">

          {/* Hero banner */}
          <div className="relative rounded-[2rem] overflow-hidden mb-12 bg-gradient-to-br from-primary via-primary/80 to-teal-500 p-10 shadow-2xl shadow-primary/20">
            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <div className="relative z-10">
              <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-2">Health Records</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">My Medical Reports</h1>
              <p className="text-white/70 text-lg max-w-xl">All your completed lab orders and test results in one secure place.</p>
            </div>
            <div className="absolute right-10 bottom-0 opacity-10">
              <svg width="220" height="180" viewBox="0 0 220 180" fill="white">
                <rect x="20" y="10" width="140" height="160" rx="12" />
                <rect x="40" y="40" width="100" height="10" rx="5" fill="rgba(0,0,0,0.3)" />
                <rect x="40" y="65" width="80" height="10" rx="5" fill="rgba(0,0,0,0.3)" />
                <rect x="40" y="90" width="100" height="10" rx="5" fill="rgba(0,0,0,0.3)" />
                <rect x="40" y="115" width="60" height="10" rx="5" fill="rgba(0,0,0,0.3)" />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-foreground/5 p-6 mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                id="report-search"
                placeholder="Search by test name or report ID..."
                value={search}
                onChange={(e) => {setSearch(e.target.value);setPage(1);}}
                className="w-full pl-12 pr-4 py-3 bg-background border border-foreground/8 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium text-sm" />
              
            </div>

            <select
              id="date-filter"
              value={dateFilter}
              onChange={(e) => {setDateFilter(e.target.value);setPage(1);}}
              className="px-4 py-3 rounded-xl border border-foreground/8 bg-background text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20">
              
              {DATE_FILTERS.map((d) => <option key={d}>{d}</option>)}
            </select>

            <select
              id="type-filter"
              value={typeFilter}
              onChange={(e) => {setTypeFilter(e.target.value);setPage(1);}}
              className="px-4 py-3 rounded-xl border border-foreground/8 bg-background text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20">
              
              {TEST_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Summary line */}
          <p className="text-sm text-subtle-gray mb-6 font-medium">
            {loading ? 'Loading...' : `Showing ${reports.length} of ${total} report${total !== 1 ? 's' : ''}`}
          </p>

          {/* Error state */}
          {error &&
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 mb-8 flex items-center gap-4">
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold">Could not load reports</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
              <button onClick={fetchReports} className="ml-auto px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
                Retry
              </button>
            </div>
          }

          {/* Skeleton loader */}
          {loading &&
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) =>
            <div key={i} className="bg-white rounded-2xl border border-foreground/5 p-6 animate-pulse space-y-4">
                  <div className="h-5 bg-foreground/8 rounded-full w-3/4" />
                  <div className="h-4 bg-foreground/5 rounded-full w-1/2" />
                  <div className="h-4 bg-foreground/5 rounded-full w-2/3" />
                  <div className="flex justify-between items-center mt-2">
                    <div className="h-7 bg-foreground/5 rounded-full w-24" />
                    <div className="h-9 bg-primary/10 rounded-xl w-24" />
                  </div>
                </div>
            )}
            </div>
          }

          {/* Empty state */}
          {!loading && !error && reports.length === 0 &&
          <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">No Reports Found</h2>
                <p className="text-subtle-gray">No completed lab reports match your current filters.</p>
              </div>
            </div>
          }

          {/* Report cards */}
          {!loading && !error && reports.length > 0 &&
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) =>
            <div
              key={report.id}
              className="group bg-white rounded-2xl border border-foreground/5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col overflow-hidden">
              
                  {/* Card top accent */}
                  <div className="h-1 bg-gradient-to-r from-primary to-teal-400 w-full" />
                  <div className="p-6 flex flex-col gap-3 flex-1">
                    {/* Icon + title */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <svg className="w-6 h-6 text-primary group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base leading-snug truncate">{report.title}</h3>
                        <p className="text-sm text-subtle-gray mt-1 truncate">{report.labName}</p>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-xs text-subtle-gray font-medium mt-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {report.date}
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex self-start items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[report.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {report.status}
                    </span>

                    <div className="flex-1" />

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-foreground/5">
                      <Link
                    href={`/reports/${report.id}`}
                    className="flex-1 bg-primary/10 hover:bg-primary text-primary hover:text-white text-center py-2.5 rounded-xl font-semibold text-sm transition-all">
                    
                        View Details
                      </Link>
                      {report.fileUrl &&
                  <a
                    href={report.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Download PDF"
                    className="w-10 h-10 bg-green-50 hover:bg-green-500 text-green-600 hover:text-white rounded-xl flex items-center justify-center transition-all shrink-0">
                    
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                  }
                    </div>
                  </div>
                </div>
            )}
            </div>
          }

          {/* Pagination */}
          {totalPages > 1 &&
          <div className="flex justify-center items-center gap-2 mt-10">
              <button
              id="prev-page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-xl border border-foreground/10 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
            <button
              key={p}
              id={`page-${p}`}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
              p === page ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'border border-foreground/10 hover:bg-primary/10 hover:border-primary/30'}`
              }>
              
                  {p}
                </button>
            )}

              <button
              id="next-page"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-xl border border-foreground/10 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          }
        </div>
      </main>
    </div>);

}