import React from 'react';
import { Report } from './types';
import { ReportCard } from './ReportCard';

interface ReportListProps {
  reports: Report[];
}

export const ReportList: React.FC<ReportListProps> = ({ reports }) => {
  return (
    <div className="space-y-10">
      {/* Search & Filters */}
      <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-6 mb-10 border border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
          <div className="lg:col-span-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Search Reports</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input 
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border-slate-200 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="Test name or ID..." 
                type="text" 
              />
            </div>
          </div>
          {['By Lab', 'By Date', 'By Test Type'].map((label, i) => (
            <div key={i}>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">{label}</label>
              <select className="w-full px-4 py-2.5 rounded-lg border-slate-200 focus:ring-teal-500 focus:border-teal-500 text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_0.5rem_center] bg-no-repeat">
                <option>All</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      {/* Reports Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-teal-600 rounded-full"></div>
          <h2 className="text-xl font-bold text-slate-900">Recent Reports</h2>
        </div>
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </section>

      {/* Pagination Placeholder */}
      <div className="mt-12 flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-100 no-print">
        <p className="text-sm text-slate-500">Showing {reports.length} of 48 reports</p>
        <div className="flex gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-teal-600 text-white font-bold">1</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
