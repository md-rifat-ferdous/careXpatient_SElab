import React from 'react';
import { ReportDetails } from '@/components/reports/ReportDetails';
import { TopNavBar, SideNavBar } from '@/components/reports/Navigation';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getReport(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/reports/${id}`, { 
    cache: 'no-store' 
  });
  
  if (res.status === 404) {
    return null;
  }
  
  if (!res.ok) {
    throw new Error('Failed to fetch report');
  }
  
  return res.json();
}

export default async function ReportDetailsPage({ params }: PageProps) {
  const { id } = await params;
  let report = null;
  let error = null;

  try {
    report = await getReport(id);
  } catch (e) {
    console.error(e);
    error = "Could not load report details. Please try again later.";
  }

  if (!report && !error) {
    notFound();
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-900 font-sans selection:bg-teal-100 antialiased">
      <TopNavBar />
      
      <div className="flex pt-16 min-h-screen">
        <SideNavBar />
        
        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 p-6 lg:p-10 max-w-[1400px] mx-auto w-full">
          {error ? (
            <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl font-bold text-center">
              {error}
            </div>
          ) : (
            <ReportDetails report={report} />
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
