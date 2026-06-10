"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
































const STATUS_COLORS = {
  Reported: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-700'
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ReportDetailPage() {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('parameters');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/reports/${id}`).
    then((res) => {
      if (!res.ok) throw new Error(`Report not found (${res.status})`);
      return res.json();
    }).
    then((data) => {setReport(data);setLoading(false);}).
    catch((err) => {setError(err.message);setLoading(false);});
  }, [id]);

  const handlePrint = () => window.print();

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Header />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-6 max-w-4xl space-y-6 animate-pulse">
            <div className="h-8 bg-foreground/8 rounded-full w-48" />
            <div className="bg-white rounded-2xl p-8 space-y-4 border border-foreground/5">
              <div className="h-6 bg-foreground/8 rounded-full w-1/3" />
              <div className="h-4 bg-foreground/5 rounded-full w-1/2" />
              <div className="h-4 bg-foreground/5 rounded-full w-2/3" />
            </div>
            <div className="bg-white rounded-2xl p-8 border border-foreground/5">
              <div className="h-48 bg-foreground/5 rounded-xl" />
            </div>
          </div>
        </main>
      </div>);

  }

  /* ── Error ── */
  if (error || !report) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Header />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-10 text-center space-y-4">
              <svg className="w-14 h-14 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold">{error ?? 'Report not found'}</h2>
              <Link href="/reports" className="inline-block mt-4 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
                ← Back to Reports
              </Link>
            </div>
          </div>
        </main>
      </div>);

  }

  const hasParams = report.parameters.length > 0;
  const hasResults = report.results.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="pt-28 pb-16 print:pt-8">
        <div className="container mx-auto px-6 max-w-4xl">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-subtle-gray mb-6 print:hidden">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/reports" className="hover:text-primary transition-colors">Reports</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Report #{report.id}</span>
          </nav>

          {/* ── Report Header Card ── */}
          <div className="bg-white rounded-[1.75rem] border border-foreground/5 shadow-lg overflow-hidden mb-6">
            {/* Gradient top bar */}
            <div className="h-2 bg-gradient-to-r from-primary via-teal-400 to-primary" />

            <div className="p-8 flex flex-col md:flex-row justify-between gap-6">
              {/* Left: info */}
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-subtle-gray uppercase tracking-widest mb-1">Medical Report</p>
                  <h1 className="text-2xl font-bold mb-2">
                    {report.tests.length > 0 ? report.tests.map((t) => t.name).join(', ') : 'Lab Report'} — #{report.id}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-subtle-gray mt-2">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      {report.labName}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {report.createdAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {report.patientName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: status + actions */}
              <div className="flex flex-col items-end gap-3 shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${STATUS_COLORS[report.status] ?? 'bg-gray-100 text-gray-700'}`}>
                  <span className="w-2 h-2 rounded-full bg-current" />
                  {report.status}
                </span>

                <div className="flex gap-2 print:hidden">
                  <button
                    id="print-report"
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-foreground/10 text-sm font-semibold hover:bg-foreground/5 transition-all">
                    
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>

                  {report.fileUrl &&
                  <a
                    id="download-report"
                    href={report.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
                    
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PDF
                    </a>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* ── Lab Info Card ── */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl border border-foreground/5 shadow-sm p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-subtle-gray mb-4">Laboratory</h2>
              <p className="font-bold text-lg mb-1">{report.labName}</p>
              <p className="text-sm text-subtle-gray flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {report.labAddress}
              </p>
              <p className="text-sm text-subtle-gray flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {report.labPhone}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-foreground/5 shadow-sm p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-subtle-gray mb-4">Patient</h2>
              <p className="font-bold text-lg mb-1">{report.patientName}</p>
              <p className="text-sm text-subtle-gray">Report Date: <span className="text-foreground font-medium">{report.createdAt}</span></p>
              <p className="text-sm text-subtle-gray mt-1">Order ID: <span className="text-foreground font-medium">#{report.id}</span></p>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="bg-white rounded-2xl border border-foreground/5 shadow-sm overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-foreground/5 print:hidden">
              {['parameters', 'tests', 'results'].map((tab) =>
              <button
                key={tab}
                id={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-all ${
                activeTab === tab ?
                'text-primary border-b-2 border-primary' :
                'text-subtle-gray hover:text-foreground'}`
                }>
                
                  {tab === 'parameters' ? 'Test Parameters' : tab === 'tests' ? 'Ordered Tests' : 'Results Summary'}
                  {tab === 'parameters' && hasParams &&
                <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
                      {report.parameters.length}
                    </span>
                }
                </button>
              )}
            </div>

            <div className="p-6">

              {/* Parameters tab */}
              {activeTab === 'parameters' &&
              <div>
                  {hasParams ?
                <div className="overflow-x-auto rounded-xl border border-foreground/5">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-foreground/3">
                            <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-widest text-subtle-gray">Parameter</th>
                            <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-widest text-subtle-gray">Value</th>
                            <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-widest text-subtle-gray">Unit</th>
                            <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-widest text-subtle-gray">Reference Range</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/5">
                          {report.parameters.map((p, i) =>
                      <tr key={i} className="hover:bg-primary/3 transition-colors">
                              <td className="px-5 py-4 font-semibold">{p.parameter_name}</td>
                              <td className="px-5 py-4 font-bold text-primary">{p.value}</td>
                              <td className="px-5 py-4 text-subtle-gray">{p.unit}</td>
                              <td className="px-5 py-4 text-subtle-gray">{p.reference_range}</td>
                            </tr>
                      )}
                        </tbody>
                      </table>
                    </div> :

                <EmptyTab icon="parameters" message="No parameter data available for this report." />
                }
                </div>
              }

              {/* Tests tab */}
              {activeTab === 'tests' &&
              <div className="space-y-4">
                  {report.tests.length > 0 ? report.tests.map((test, i) =>
                <div key={i} className="rounded-xl border border-foreground/8 p-5 hover:border-primary/20 transition-all">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <h3 className="font-bold text-base mb-1">{test.name}</h3>
                          <div className="flex flex-wrap gap-2 text-xs mb-2">
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg font-semibold">{test.category}</span>
                            <span className="px-2 py-1 bg-foreground/5 rounded-lg font-semibold">Sample: {test.sampleType}</span>
                            <span className="px-2 py-1 bg-foreground/5 rounded-lg font-semibold">TAT: {test.deliveryTime}</span>
                          </div>
                          {test.description && <p className="text-sm text-subtle-gray">{test.description}</p>}
                          {test.prerequisites &&
                      <p className="text-xs text-amber-600 font-medium mt-2 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {test.prerequisites}
                            </p>
                      }
                        </div>
                        {test.price != null &&
                    <span className="font-bold text-lg text-foreground whitespace-nowrap">৳ {test.price.toLocaleString()}</span>
                    }
                      </div>
                    </div>
                ) :
                <EmptyTab icon="tests" message="No test details found." />
                }
                </div>
              }

              {/* Results tab */}
              {activeTab === 'results' &&
              <div className="space-y-4">
                  {hasResults ? report.results.map((r, i) =>
                <div key={i} className="rounded-xl border border-foreground/8 p-5 hover:border-primary/20 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm mb-1">{r.summary}</p>
                          <p className="text-xs text-subtle-gray">Uploaded by: {r.uploadedBy}</p>
                          {r.fileUrl &&
                      <a href={r.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-primary hover:underline">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download File
                            </a>
                      }
                        </div>
                      </div>
                    </div>
                ) :
                <EmptyTab icon="results" message="No result files uploaded yet." />
                }
                </div>
              }
            </div>
          </div>

          {/* Back button */}
          <div className="mt-8 print:hidden">
            <Link href="/reports"
            className="inline-flex items-center gap-2 text-sm font-semibold text-subtle-gray hover:text-primary transition-colors">
              
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to My Reports
            </Link>
          </div>

        </div>
      </main>
    </div>);

}

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass h-20 flex items-center border-b border-foreground/5 print:hidden">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M5 12h14" /></svg>
          </div>
          <span className="text-2xl font-bold tracking-tight">care<span className="text-primary">X</span>patient</span>
        </Link>
        <Link href="/reports" className="flex items-center gap-2 text-sm font-semibold text-subtle-gray hover:text-primary transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          All Reports
        </Link>
      </div>
    </header>);

}

function EmptyTab({ icon, message }) {
  return (
    <div className="flex flex-col items-center py-16 gap-4 text-center text-subtle-gray">
      <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-sm font-medium">{message}</p>
    </div>);

}