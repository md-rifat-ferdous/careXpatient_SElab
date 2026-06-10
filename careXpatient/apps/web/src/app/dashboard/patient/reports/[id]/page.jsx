"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
































const STATUS_COLORS = {
  Reported: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200/50',
  Processing: 'bg-sky-50 text-sky-700 border border-sky-200/50',
  Cancelled: 'bg-rose-50 text-rose-700 border border-rose-200/50'
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PatientReportDetailPage() {
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
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded-full w-48" />
        <div className="bg-white border border-slate-100 rounded-2xl p-8 space-y-4 shadow-sm">
          <div className="h-6 bg-slate-200 rounded-full w-1/3" />
          <div className="h-4 bg-slate-150 rounded-full w-1/2" />
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <div className="h-48 bg-slate-100 rounded-xl" />
        </div>
      </div>);

  }

  /* ── Error ── */
  if (error || !report) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-10 text-center space-y-4">
          <svg className="w-14 h-14 mx-auto text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-slate-800">{error ?? 'Report not found'}</h2>
          <Link href="/dashboard/patient/reports" className="inline-block mt-4 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-sm shadow-rose-200">
            ← Back to Reports
          </Link>
        </div>
      </div>);

  }

  const hasParams = report.parameters.length > 0;
  const hasResults = report.results.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up print:bg-white print:p-0">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 font-semibold print:hidden">
        <Link href="/dashboard/patient" className="hover:text-teal-600 transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/dashboard/patient/reports" className="hover:text-teal-600 transition-colors">Reports</Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">Report #{report.id}</span>
      </nav>

      {/* Report Header Card */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 to-teal-500 w-full" />
        
        <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Diagnostic Report</p>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 mt-1">
                {report.tests.length > 0 ? report.tests.map((t) => t.name).join(', ') : 'Lab Report'}
              </h1>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400 mt-3">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  {report.labName}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {report.createdAt}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {report.patientName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${STATUS_COLORS[report.status] ?? 'bg-slate-100 text-slate-700'}`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              {report.status}
            </span>

            <div className="flex gap-2 print:hidden">
              <button
                id="print-report"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all">
                
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-500/10">
                
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

      {/* Lab & Patient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Laboratory</h2>
          <p className="font-bold text-slate-800 text-lg mb-1">{report.labName}</p>
          <p className="text-sm text-slate-500 flex items-center gap-2 mb-1.5">
            <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {report.labAddress}
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            {report.labPhone}
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Patient</h2>
          <p className="font-bold text-slate-800 text-lg mb-1">{report.patientName}</p>
          <p className="text-sm text-slate-500 font-medium">Report Date: <span className="text-slate-800 font-bold">{report.createdAt}</span></p>
          <p className="text-sm text-slate-500 font-medium mt-1">Order ID: <span className="text-slate-800 font-bold">#{report.id}</span></p>
        </div>
      </div>

      {/* Tabs System */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 print:hidden">
          {['parameters', 'tests', 'results'].map((tab) =>
          <button
            key={tab}
            id={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-xs md:text-sm font-bold capitalize transition-all ${
            activeTab === tab ?
            'text-teal-600 border-b-2 border-teal-500' :
            'text-slate-400 hover:text-slate-700'}`
            }>
            
              {tab === 'parameters' ? 'Test Parameters' : tab === 'tests' ? 'Ordered Tests' : 'Results Summary'}
              {tab === 'parameters' && hasParams &&
            <span className="ml-2 px-2 py-0.5 bg-teal-50 text-teal-600 border border-teal-100 rounded-full text-xs font-extrabold">
                  {report.parameters.length}
                </span>
            }
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Parameters Tab */}
          {activeTab === 'parameters' &&
          <div>
              {hasParams ?
            <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-400">Parameter</th>
                        <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-400">Value</th>
                        <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-400">Unit</th>
                        <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-400">Reference Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.parameters.map((p, i) =>
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-700">{p.parameter_name}</td>
                          <td className="px-5 py-3.5 font-extrabold text-teal-600">{p.value}</td>
                          <td className="px-5 py-3.5 text-slate-500 font-medium">{p.unit}</td>
                          <td className="px-5 py-3.5 text-slate-400 font-semibold">{p.reference_range}</td>
                        </tr>
                  )}
                    </tbody>
                  </table>
                </div> :

            <EmptyTab message="No parameter data available for this report." />
            }
            </div>
          }

          {/* Tests Tab */}
          {activeTab === 'tests' &&
          <div className="space-y-4">
              {report.tests.length > 0 ? report.tests.map((test, i) =>
            <div key={i} className="rounded-2xl border border-slate-100 p-5 hover:border-teal-500/20 transition-all bg-white shadow-sm shadow-slate-100/30">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base mb-1">{test.name}</h3>
                      <div className="flex flex-wrap gap-2 text-xs mb-3">
                        <span className="px-2.5 py-1 bg-teal-50 border border-teal-100 text-teal-600 rounded-lg font-bold">{test.category}</span>
                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-150 text-slate-500 rounded-lg font-bold">Sample: {test.sampleType}</span>
                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-150 text-slate-500 rounded-lg font-bold">TAT: {test.deliveryTime}</span>
                      </div>
                      {test.description && <p className="text-sm text-slate-500 leading-relaxed font-medium">{test.description}</p>}
                      {test.prerequisites &&
                  <p className="text-xs text-amber-600 font-bold mt-3 flex items-center gap-1 bg-amber-50/50 border border-amber-100/50 px-3 py-1.5 rounded-lg w-fit">
                          <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {test.prerequisites}
                        </p>
                  }
                    </div>
                    {test.price != null &&
                <span className="font-extrabold text-lg text-slate-800 whitespace-nowrap bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-150">
                        ৳ {test.price.toLocaleString()}
                      </span>
                }
                  </div>
                </div>
            ) :
            <EmptyTab message="No test details found." />
            }
            </div>
          }

          {/* Results Tab */}
          {activeTab === 'results' &&
          <div className="space-y-4">
              {hasResults ? report.results.map((r, i) =>
            <div key={i} className="rounded-2xl border border-slate-100 p-5 hover:border-teal-500/20 transition-all bg-white shadow-sm shadow-slate-100/30">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-700 text-sm leading-relaxed mb-1">{r.summary}</p>
                      <p className="text-xs font-semibold text-slate-400">Uploaded by: {r.uploadedBy}</p>
                      {r.fileUrl &&
                  <a href={r.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-teal-600 hover:underline">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Attached File
                        </a>
                  }
                    </div>
                  </div>
                </div>
            ) :
            <EmptyTab message="No result files uploaded yet." />
            }
            </div>
          }
        </div>
      </div>

      {/* Back Button */}
      <div className="pt-2 print:hidden">
        <Link href="/dashboard/patient/reports"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-teal-600 transition-colors">
          
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to My Reports
        </Link>
      </div>

    </div>);

}

function EmptyTab({ message }) {
  return (
    <div className="flex flex-col items-center py-12 gap-3 text-center text-slate-400">
      <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
        <svg className="w-7 h-7 opacity-40 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-sm font-bold">{message}</p>
    </div>);

}