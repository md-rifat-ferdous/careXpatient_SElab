import React from 'react';
import { Report } from './types';

interface ReportDetailsProps {
  report: Report;
}

export const ReportDetails: React.FC<ReportDetailsProps> = ({ report }) => {
  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-10">
      {/* LEFT SIDE: Lab Report */}
      <section className="flex-[2.5] bg-white shadow-[0_4px_30px_rgb(0,0,0,0.02)] border border-slate-100 rounded-[2.5rem] overflow-hidden flex flex-col min-h-[1200px]">
        
        {/* Report Header */}
        <div className="p-16 border-b border-slate-50 bg-gradient-to-br from-slate-50/20 to-white">
          <div className="flex justify-between items-start mb-20">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-teal-50 flex items-center justify-center rounded-3xl border border-teal-100/30 shadow-inner">
                <span className="material-symbols-outlined text-teal-600 text-5xl">biotech</span>
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase">{report.labName}</h1>
                <p className="text-slate-300 font-bold text-[11px] tracking-[0.3em] uppercase mt-1">Authorized Clinical Laboratory Services</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.5em] mb-2">Reference ID</p>
              <p className="text-xl font-bold text-slate-800 font-mono tracking-tighter">{report.sampleId}</p>
            </div>
          </div>

          {/* Patient Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 p-12 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.4em]">Patient Name</p>
              <p className="text-lg font-black text-slate-800 tracking-tight leading-none">{report.patientName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.4em]">Age / Gender</p>
              <p className="text-lg font-black text-slate-800 tracking-tight leading-none">{report.age} / {report.gender}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.4em]">Sample ID</p>
              <p className="text-lg font-black text-slate-800 tracking-tight leading-none">{report.sampleId}</p>
            </div>
          </div>
        </div>

        {/* Results Body */}
        <div className="p-16 md:p-20 flex-1 space-y-24">
          <div className="space-y-12">
            <div className="flex items-center gap-5">
              <div className="h-9 w-2 bg-teal-500 rounded-full"></div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{report.testName}</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left border-b-2 border-slate-100">
                  <th className="pb-8 text-[11px] font-black text-slate-200 uppercase tracking-[0.3em]">Parameter</th>
                  <th className="pb-8 text-[11px] font-black text-slate-200 uppercase tracking-[0.3em]">Result Value</th>
                  <th className="pb-8 text-[11px] font-black text-slate-200 uppercase tracking-[0.3em] text-right">Reference Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {report.parameters.map((param, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-8 font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{param.name}</td>
                    <td className="py-8 text-xl font-black text-slate-900 tracking-tighter">
                      {param.result} <span className="text-sm text-slate-300 font-bold ml-1">{param.unit}</span>
                    </td>
                    <td className="py-8 text-sm font-bold text-slate-400 font-mono text-right">{param.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-24 h-[2px] bg-slate-100 rounded-full"></div>
            <div className="text-center space-y-1">
              <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.6em]">End of Report</p>
              <p className="text-[9px] font-black text-slate-200 uppercase tracking-[0.3em]">Electronically Verified</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-16 pb-16 pt-0 border-t border-slate-50 bg-slate-50/5 mt-auto">
          <div className="flex justify-between items-end mt-12">
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.5em] mb-4">Laboratory Stamp</p>
              <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center italic text-[10px] text-slate-300 font-bold uppercase tracking-tighter opacity-50">Verified</div>
            </div>
            <div className="text-center group">
              <div className="w-48 h-20 mb-4 flex items-center justify-center opacity-40 grayscale group-hover:opacity-70 transition-all">
                <img alt="Signature" className="h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAu_F7JsxqwQM5yQcFbRDZur6DD4GQ4V7zFKcaM2o1oxVoomsJFxzQxdV2gU_yOYuTjdKu13aw5qYZiqeDo1mbzDBCkfGHAYmGYp73axldrSzCm0CMJ1Lim85hXrh03oIb2AVBPCKp-V4jDQyCwuSxqShrEmB2cC5cmOcf5bcNQCwH-ohFUD5-2UuCVLcXwEY-_aSVfV_ocxnoYgwdkMnKTMhraugFtLWrAA2RgelTCpdjexd3SRz1kr9XQuBGM_tACKhGg1MgC4UQ"/>
              </div>
              <div className="border-t border-slate-200 pt-4 px-10">
                <p className="text-base font-black text-slate-800 tracking-tighter uppercase">Dr. Sarah Johnson</p>
                <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em] mt-1">Consultant Pathologist</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT SIDEBAR: Actions & Info */}
      <aside className="flex-1 flex flex-col gap-8 no-print lg:sticky lg:top-28 h-fit min-w-[360px]">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col gap-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Report Management</h3>
          <div className="flex flex-col gap-4">
            <button className="flex items-center justify-center gap-3 py-5 bg-teal-600 text-white rounded-2xl font-black text-[15px] shadow-xl shadow-teal-500/20 hover:bg-teal-700 transition-all">
              <span className="material-symbols-outlined">download</span> Download PDF
            </button>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-4 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl font-bold text-sm">
                <span className="material-symbols-outlined">print</span> Print
              </button>
              <button className="flex items-center justify-center gap-2 py-4 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl font-bold text-sm">
                <span className="material-symbols-outlined">share</span> Share
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-12 rounded-[2.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100">
          <h3 className="text-[10px] font-black text-slate-200 uppercase tracking-[0.4em] mb-10">Verification Info</h3>
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-300">Lab</span>
              <span className="text-sm font-black text-slate-700 tracking-tight">{report.labName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-300">Date</span>
              <span className="text-sm font-black text-slate-700 tracking-tight">{report.date}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-12 rounded-[2.5rem] border border-teal-50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-teal-50/30 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex gap-5 items-center mb-8">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center border border-teal-100/30">
                <span className="material-symbols-outlined text-teal-600 text-2xl font-bold">medical_services</span>
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none">Consultation</h4>
                <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em] mt-2 underline decoration-teal-200 underline-offset-4">Get Expert Opinion</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-10">
              Discuss these laboratory results with a certified medical specialist today.
            </p>
            <button className="w-full py-5 bg-teal-50/50 text-teal-600 rounded-2xl font-black text-sm hover:bg-teal-600 hover:text-white transition-all border border-teal-100/50">
              Connect Now
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
