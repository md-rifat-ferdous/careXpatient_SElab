'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Report {
  id: number;
  title: string;
  labName: string;
  date: string;
  status: string;
  fileUrl: string | null;
}

export default function ReportsPage() {
  const [state, setState] = useState({
    searchTerm: '',
    selectedLab: 'All Laboratories',
    selectedDate: 'Last 30 Days',
    selectedType: 'All Types',
    reports: [] as Report[],
    totalCount: 0,
    currentPage: 1,
    loading: false,
    error: null as string | null
  });

  const limit = 5;

  useEffect(() => {
    fetchReports();
  }, [state.searchTerm, state.selectedLab, state.selectedDate, state.selectedType, state.currentPage]);

  const fetchReports = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const params = new URLSearchParams({
        search: state.searchTerm,
        lab: state.selectedLab,
        date: state.selectedDate,
        type: state.selectedType,
        page: state.currentPage.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`/api/reports?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch reports (Status: ${response.status})`);
      }

      const result = await response.json();
      // Handle both old flat-array response and new paginated response shapes
      const isNewFormat = result && typeof result === 'object' && !Array.isArray(result) && Array.isArray(result.data);
      const data = isNewFormat ? result.data : (Array.isArray(result) ? result : []);
      const total = isNewFormat ? (result.total || 0) : data.length;
      setState(prev => ({ 
        ...prev, 
        reports: data, 
        totalCount: total,
        error: null, 
        loading: false 
      }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, loading: false }));
      console.error('Fetch Error:', err);
    }
  };

  const getIconForTest = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('kidney') || lower.includes('kft')) return 'lab_research';
    if (lower.includes('heart') || lower.includes('lipid') || lower.includes('cardiac')) return 'monitor_heart';
    if (lower.includes('blood') || lower.includes('cbc') || lower.includes('sugar')) return 'bloodtype';
    if (lower.includes('urine')) return 'science';
    if (lower.includes('imaging') || lower.includes('x-ray') || lower.includes('mri')) return 'biotech';
    return 'description';
  };

  const renderReportCard = (report: Report, isRecent: boolean) => {
    const icon = getIconForTest(report.title);
    const accentClass = isRecent ? 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-teal-600 group-hover:text-white';
    const reportId = `#${report.id.toString().padStart(6, '0')}`;

    return (
      <div key={report.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl ${accentClass} flex items-center justify-center transition-colors`}>
            <span className="material-symbols-outlined text-3xl">{icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">{report.title}</h3>
            <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-0.5">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {report.labName}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:flex items-center gap-8 md:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Date</p>
            <p className="text-sm font-semibold text-slate-700">{report.date}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Report ID</p>
            <p className="text-sm font-semibold text-slate-700">{reportId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/reports/${report.id}`} className="flex-1 md:flex-none px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium text-base hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200 text-center">
            View Report
          </Link>
          {report.fileUrl && (
            <a href={report.fileUrl} download className="p-2.5 rounded-lg border border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-200 transition-all">
              <span className="material-symbols-outlined">download</span>
            </a>
          )}
        </div>
      </div>
    );
  };

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const reports = Array.isArray(state.reports) ? state.reports : [];
  const recent = reports.filter(r => new Date(r.date) >= sevenDaysAgo);
  const older = reports.filter(r => new Date(r.date) < sevenDaysAgo);

  return (
    <div className="bg-[#f9f9ff] text-[#111c2d] min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100 antialiased">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-teal-600">careXpatient</Link>
          <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-1.5 w-64 lg:w-96">
            <span className="material-symbols-outlined text-slate-400 text-lg mr-2">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400"
              placeholder="Search records..." 
              type="text" 
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-slate-50 hover:text-teal-700 transition-all text-slate-500">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-slate-50 hover:text-teal-700 transition-all text-slate-500">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-slate-900 leading-tight">Mr. Rahim Ali</p>
              <p className="text-[11px] text-slate-500">Premium Member</p>
            </div>
            <img 
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-teal-50"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaKgWhmQnqnkwEN7C7GeNq-nlV26y6-W4qGvSV_7IAaKhmeJpCO4gvoMD1wAnzDH-Lfr5afF45uGNzb0-VfH6ktyr7mgv9gZ34I522wHi7NAZBgQCzKUTnMSCCvIn-jEoKt3z6xQ1_vWS3_fLRVL_QNjajN-xvxt-_KBZ5XhlGH7mD8IU9AjtL3AwXpImusXqxKgcKJC-MuYu3uNbgX0NkFB6FhR4phYlTeiJuFKn-qfTDbooRy2K8wBBPdxbU21KPcPYANULM00M" 
            />
          </div>
        </div>
      </nav>

      <div className="flex pt-16 min-h-screen">
        {/* SideNavBar */}
        <aside className="fixed left-0 top-16 bottom-0 flex flex-col py-6 w-64 hidden md:flex bg-white border-r border-slate-100 z-40">
          <div className="mb-8 px-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-teal-600">careXpatient</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Patient Portal</p>
          </div>
          <nav className="space-y-1">
            <Link className="text-slate-500 mx-2 px-4 py-3 flex items-center gap-3 hover:bg-slate-50 hover:text-teal-600 transition-colors" href="/">
              <span className="material-symbols-outlined">dashboard</span> Dashboard
            </Link>
            <Link className="text-slate-500 mx-2 px-4 py-3 flex items-center gap-3 hover:bg-slate-50 hover:text-teal-600 transition-colors" href="#">
              <span className="material-symbols-outlined">calendar_today</span> Appointments
            </Link>
            <Link className="text-slate-500 mx-2 px-4 py-3 flex items-center gap-3 hover:bg-slate-50 hover:text-teal-600 transition-colors" href="#">
              <span className="material-symbols-outlined">biotech</span> Lab Tests
            </Link>
            <Link className="bg-teal-50 text-teal-600 rounded-lg mx-2 px-4 py-3 flex items-center gap-3" href="/reports">
              <span className="material-symbols-outlined">description</span> Reports
            </Link>
            <Link className="text-slate-500 mx-2 px-4 py-3 flex items-center gap-3 hover:bg-slate-50 hover:text-teal-600 transition-colors" href="#">
              <span className="material-symbols-outlined">medication</span> Prescriptions
            </Link>
            <Link className="text-slate-500 mx-2 px-4 py-3 flex items-center gap-3 hover:bg-slate-50 hover:text-teal-600 transition-colors" href="#">
              <span className="material-symbols-outlined">group</span> Family Profile
            </Link>
          </nav>
          <div className="mt-auto px-6">
            <div className="bg-teal-600 rounded-xl p-4 text-white">
              <p className="font-bold text-sm mb-1">Need help?</p>
              <p className="text-xs text-white/80 mb-3 leading-relaxed">Our support team is available 24/7 for you.</p>
              <button className="bg-white text-teal-600 w-full py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">Contact Support</button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-6 lg:p-10 max-w-[1280px] mx-auto w-full">
          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-semibold text-[#111c2d] mb-2">Medical Reports</h1>
            <p className="text-lg text-slate-500">All your lab reports from different laboratories in one place</p>
          </header>

          {/* Search & Filters */}
          <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-6 mb-10 border border-slate-100">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
              <div className="lg:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Search Reports</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                  <input 
                    id="searchInput" 
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border-slate-200 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    placeholder="Test name or ID..." 
                    type="text" 
                    value={state.searchTerm}
                    onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value, currentPage: 1 }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">By Lab</label>
                <select 
                  id="labSelect"
                  className="w-full px-4 py-2.5 rounded-lg border-slate-200 focus:ring-teal-500 focus:border-teal-500 text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_0.5rem_center] bg-no-repeat"
                  value={state.selectedLab}
                  onChange={(e) => setState(prev => ({ ...prev, selectedLab: e.target.value, currentPage: 1 }))}
                >
                  <option>All Laboratories</option>
                  <option>careX Lab</option>
                  <option>Metro Diagnostics</option>
                  <option>Labaid Diagnostics</option>
                  <option>Popular Diagnostic Center</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">By Date</label>
                <select 
                  id="dateSelect"
                  className="w-full px-4 py-2.5 rounded-lg border-slate-200 focus:ring-teal-500 focus:border-teal-500 text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_0.5rem_center] bg-no-repeat"
                  value={state.selectedDate}
                  onChange={(e) => setState(prev => ({ ...prev, selectedDate: e.target.value, currentPage: 1 }))}
                >
                  <option>Last 30 Days</option>
                  <option>All Time</option>
                  <option>Last 6 Months</option>
                  <option>2025 Reports</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">By Test Type</label>
                <select 
                  id="typeSelect"
                  className="w-full px-4 py-2.5 rounded-lg border-slate-200 focus:ring-teal-500 focus:border-teal-500 text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_0.5rem_center] bg-no-repeat"
                  value={state.selectedType}
                  onChange={(e) => setState(prev => ({ ...prev, selectedType: e.target.value, currentPage: 1 }))}
                >
                  <option>All Types</option>
                  <option>Blood Work</option>
                  <option>Imaging</option>
                  <option>Cardiac</option>
                  <option>Full Body Checkup</option>
                </select>
              </div>
            </div>
          </section>

          {/* Reports Content */}
          {state.loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <span className="ml-3 text-slate-500 font-medium">Loading reports...</span>
            </div>
          ) : state.error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              <p>Error: {state.error}</p>
            </div>
          ) : state.reports.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">description</span>
              <p className="text-slate-500 font-medium">No reports found matching your criteria</p>
              <button 
                onClick={() => setState(prev => ({ ...prev, searchTerm: '', selectedLab: 'All Laboratories', selectedDate: 'Last 30 Days', selectedType: 'All Types' }))}
                className="mt-4 text-teal-600 font-bold hover:underline"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <>
              {/* Recent Reports Section */}
              <section className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 bg-teal-600 rounded-full"></div>
                  <h2 className="text-2xl font-semibold text-[#111c2d]">Recent Reports</h2>
                </div>
                <div id="recentReportsList" className="space-y-4">
                  {recent.length > 0 ? recent.map(r => renderReportCard(r, true)) : <p className="text-slate-400 text-sm italic">No recent reports found</p>}
                </div>
              </section>

              {/* Older Reports Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 bg-slate-200 rounded-full"></div>
                  <h2 className="text-2xl font-semibold text-[#111c2d]">Older Reports</h2>
                </div>
                <div id="olderReportsList" className="space-y-4">
                  {older.length > 0 ? older.map(r => renderReportCard(r, false)) : <p className="text-slate-400 text-sm italic">No older reports found</p>}
                </div>
              </section>
            </>
          )}

          {/* Pagination Controls */}
          {state.totalCount > 0 && (
            <div className="mt-12 flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-100">
              <p className="text-sm text-slate-500">
                Showing <span className="font-bold text-slate-900">{((state.currentPage - 1) * limit) + 1}</span> to <span className="font-bold text-slate-900">{Math.min(state.currentPage * limit, state.totalCount)}</span> of <span className="font-bold text-slate-900">{state.totalCount}</span> reports
              </p>
              <div className="flex gap-2">
                <button 
                  disabled={state.currentPage === 1}
                  onClick={() => setState(prev => ({ ...prev, currentPage: Math.max(prev.currentPage - 1, 1) }))}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 transition-colors ${state.currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                
                {Array.from({ length: Math.ceil(state.totalCount / limit) }).map((_, i) => {
                  const pageNum = i + 1;
                  // Simple logic to show only a few page numbers if there are many (optional, but requested to keep design)
                  if (Math.ceil(state.totalCount / limit) > 5) {
                    if (pageNum !== 1 && pageNum !== Math.ceil(state.totalCount / limit) && Math.abs(pageNum - state.currentPage) > 1) {
                      if (Math.abs(pageNum - state.currentPage) === 2) return <span key={pageNum} className="w-10 h-10 flex items-center justify-center text-slate-400">...</span>;
                      return null;
                    }
                  }

                  return (
                    <button 
                      key={pageNum}
                      onClick={() => setState(prev => ({ ...prev, currentPage: pageNum }))}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors font-bold ${state.currentPage === pageNum ? 'bg-teal-600 text-white shadow-sm' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button 
                  disabled={state.currentPage === Math.ceil(state.totalCount / limit)}
                  onClick={() => setState(prev => ({ ...prev, currentPage: Math.min(prev.currentPage + 1, Math.ceil(state.totalCount / limit)) }))}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 transition-colors ${state.currentPage === Math.ceil(state.totalCount / limit) ? 'opacity-30 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Nav Bar (Visible only on mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around z-50">
        <button className="flex flex-col items-center text-slate-400 gap-1">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold uppercase">Home</span>
        </button>
        <button className="flex flex-col items-center text-slate-400 gap-1">
          <span className="material-symbols-outlined">calendar_today</span>
          <span className="text-[10px] font-bold uppercase">Appt</span>
        </button>
        <button className="flex flex-col items-center text-teal-600 gap-1">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
          <span className="text-[10px] font-bold uppercase">Reports</span>
        </button>
        <button className="flex flex-col items-center text-slate-400 gap-1">
          <span className="material-symbols-outlined">group</span>
          <span className="text-[10px] font-bold uppercase">Family</span>
        </button>
      </div>

      {/* Material Symbols Font Loading */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
}
