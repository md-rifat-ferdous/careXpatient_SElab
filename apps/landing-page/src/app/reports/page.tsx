import React from 'react';
import { ReportList } from '@/components/reports/ReportList';
import { TopNavBar, SideNavBar } from '@/components/reports/Navigation';

async function getReports() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/reports`, { 
    cache: 'no-store' 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch reports');
  }
  
  return res.json();
}

export default async function ReportsPage() {
  let reports = [];
  let error = null;

  try {
    reports = await getReports();
  } catch (e) {
    console.error(e);
    error = "Could not load reports. Please try again later.";
  }

  return (
    <div className="bg-[#f9f9ff] min-h-screen text-slate-900 font-sans selection:bg-teal-100 antialiased">
      <TopNavBar />
      
      <div className="flex pt-16 min-h-screen">
        <SideNavBar />
        
        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 p-6 lg:p-10 max-w-[1280px] mx-auto w-full">
          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Medical Reports</h1>
            <p className="text-slate-500">All your lab reports from different laboratories in one place</p>
          </header>

          {error ? (
            <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl font-bold text-center">
              {error}
            </div>
          ) : (
            <ReportList reports={reports} />
          )}
        </main>
      </div>

      {/* Mobile Nav Bar - Mockup */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around z-50 no-print">
        <button className="flex flex-col items-center text-slate-400 gap-1">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold uppercase">Home</span>
        </button>
        <button className="flex flex-col items-center text-teal-600 gap-1">
          <span className="material-symbols-outlined">description</span>
          <span className="text-[10px] font-bold uppercase">Reports</span>
        </button>
        <button className="flex flex-col items-center text-slate-400 gap-1">
          <span className="material-symbols-outlined">group</span>
          <span className="text-[10px] font-bold uppercase">Family</span>
        </button>
      </div>
    </div>
  );
}
