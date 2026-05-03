import React from 'react';
import Link from 'next/link';
import { Report } from './types';

interface ReportCardProps {
  report: Report;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
          <span className="material-symbols-outlined text-3xl">biotech</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-900">{report.testName}</h3>
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
          <p className="text-sm font-semibold text-slate-700">#{report.id}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link 
          href={`/reports/${report.id}`} 
          className="flex-1 md:flex-none px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200 text-center"
        >
          View Report
        </Link>
        <button className="p-2.5 rounded-lg border border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-200 transition-all">
          <span className="material-symbols-outlined">download</span>
        </button>
      </div>
    </div>
  );
};
