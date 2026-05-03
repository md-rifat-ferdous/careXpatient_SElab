import Link from 'next/link';
import React from 'react';

// Mock data fetching based on ID
const getReportData = (id: string) => {
  const reports: Record<string, any> = {
    "1": {
      title: "Kidney Function Test (KFT)",
      lab: "Labaid Diagnostic",
      date: "Feb 10, 2026",
      sampleId: "SAMP-110492-X",
      patient: "Mr. Rahim Ali",
      age: "45y / Male",
      parameters: [
        { name: "Urea", result: "32", unit: "mg/dL", range: "15 - 45" },
        { name: "Creatinine", result: "0.9", unit: "mg/dL", range: "0.6 - 1.2" },
        { name: "Uric Acid", result: "5.4", unit: "mg/dL", range: "3.5 - 7.2" },
        { name: "Sodium", result: "140", unit: "mEq/L", range: "135 - 145" },
        { name: "Potassium", result: "4.2", unit: "mEq/L", range: "3.5 - 5.1" },
        { name: "Chloride", result: "102", unit: "mEq/L", range: "98 - 107" }
      ]
    },
    "2": {
      title: "Lipid Profile",
      lab: "Square Hospital Lab",
      date: "Feb 02, 2026",
      sampleId: "SAMP-883102-L",
      patient: "Mr. Rahim Ali",
      age: "45y / Male",
      parameters: [
        { name: "Total Cholesterol", result: "185", unit: "mg/dL", range: "< 200" },
        { name: "Triglycerides", result: "145", unit: "mg/dL", range: "< 150" },
        { name: "HDL Cholesterol", result: "48", unit: "mg/dL", range: "> 40" },
        { name: "LDL Cholesterol", result: "115", unit: "mg/dL", range: "< 130" },
        { name: "VLDL Cholesterol", result: "22", unit: "mg/dL", range: "2 - 30" }
      ]
    }
  };
  return reports[id] || reports["1"];
};

const ReportHeader = ({ data }: { data: any }) => (
  <div className="border-b-2 border-slate-900 pb-8 mb-8">
    <div className="flex justify-between items-start mb-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">{data.lab}</h2>
        <p className="text-slate-500 text-sm">Authorized Diagnostic Center</p>
      </div>
      <div className="text-right">
        <div className="w-12 h-12 bg-slate-900 rounded-lg ml-auto mb-2 flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-3xl">medical_services</span>
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lab Report</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-8 text-sm">
      <div className="space-y-2">
        <div className="flex gap-4">
          <span className="text-slate-400 w-24 font-medium">Patient Name:</span>
          <span className="text-slate-900 font-bold">{data.patient}</span>
        </div>
        <div className="flex gap-4">
          <span className="text-slate-400 w-24 font-medium">Age / Gender:</span>
          <span className="text-slate-900 font-bold">{data.age}</span>
        </div>
      </div>
      <div className="space-y-2 text-right md:text-left">
        <div className="flex md:justify-end gap-4">
          <span className="text-slate-400 w-24 font-medium text-right">Report Date:</span>
          <span className="text-slate-900 font-bold">{data.date}</span>
        </div>
        <div className="flex md:justify-end gap-4">
          <span className="text-slate-400 w-24 font-medium text-right">Sample ID:</span>
          <span className="text-slate-900 font-bold font-mono">{data.sampleId}</span>
        </div>
      </div>
    </div>
  </div>
);

const ReportTable = ({ parameters }: { parameters: any[] }) => (
  <div className="mb-12 min-h-[400px]">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-y border-slate-200">
          <th className="py-4 font-bold text-slate-900 text-sm uppercase tracking-wider">Parameter</th>
          <th className="py-4 font-bold text-slate-900 text-sm uppercase tracking-wider">Result</th>
          <th className="py-4 font-bold text-slate-900 text-sm uppercase tracking-wider">Unit</th>
          <th className="py-4 font-bold text-slate-900 text-sm uppercase tracking-wider text-right">Reference Range</th>
        </tr>
      </thead>
      <tbody>
        {parameters.map((param, idx) => (
          <tr key={idx} className="border-b border-slate-100 last:border-b-0">
            <td className="py-4 text-slate-700 font-medium">{param.name}</td>
            <td className="py-4 text-slate-900 font-bold">{param.result}</td>
            <td className="py-4 text-slate-500 text-sm">{param.unit}</td>
            <td className="py-4 text-slate-500 text-sm text-right font-mono">{param.range}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ReportFooter = () => (
  <div className="mt-auto pt-12 border-t border-slate-200 flex justify-between items-end">
    <div>
      <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-4">Verification</p>
      <div className="flex items-center gap-4">
        <div className="w-16 h-8 bg-slate-50 border border-slate-100 rounded flex items-center justify-center italic text-slate-300 text-xs">
          Signature
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm">Dr. S. M. Hossain</p>
          <p className="text-xs text-slate-500">Consultant Pathologist</p>
        </div>
      </div>
    </div>
    <div className="text-right">
      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Machine Generated Report</p>
    </div>
  </div>
);

const ReportSidebar = ({ data }: { data: any }) => (
  <aside className="space-y-6">
    {/* Doctor Note */}
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">edit_note</span> Doctor Note
      </h3>
      <p className="text-slate-500 text-sm italic">"No comment added yet"</p>
    </div>

    {/* Report Info */}
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Report Details</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Lab Name</span>
          <span className="text-slate-700 font-semibold">{data.lab}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Type</span>
          <span className="text-slate-700 font-semibold">Laboratory Report</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Source</span>
          <span className="text-slate-700 font-semibold">Direct Sample</span>
        </div>
      </div>
    </div>

    {/* Actions */}
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Actions</h3>
      <div className="grid grid-cols-1 gap-2">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 transition-all text-sm font-medium border border-transparent hover:border-slate-100">
          <span className="material-symbols-outlined text-[20px]">download</span> Download PDF
        </button>
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 transition-all text-sm font-medium border border-transparent hover:border-slate-100">
          <span className="material-symbols-outlined text-[20px]">print</span> Print Report
        </button>
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 transition-all text-sm font-medium border border-transparent hover:border-slate-100">
          <span className="material-symbols-outlined text-[20px]">share</span> Share Report
        </button>
      </div>
    </div>

    {/* Consult CTA */}
    <button className="w-full bg-teal-600 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all hover:-translate-y-1 active:scale-95">
      Consult Doctor
    </button>

    {/* Disclaimer */}
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex gap-3">
        <span className="material-symbols-outlined text-slate-400 text-[18px]">info</span>
        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
          This report is provided by the laboratory. Please consult a doctor for interpretation. Values are for informational purposes only.
        </p>
      </div>
    </div>
  </aside>
);

export default async function ReportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // In a real app, params is an async object in Next.js 15+
  const { id } = await params;
  const data = getReportData(id);

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-900 antialiased font-sans">
      {/* Mini Breadcrumb/Header */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/report" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-slate-400">arrow_back</span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">{data.title}</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Report ID: {data.reportId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all">Export</button>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6 lg:px-10 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Report View (LEFT) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 p-8 md:p-12 min-h-[900px] flex flex-col">
              <ReportHeader data={data} />
              <div className="mb-6 flex items-center gap-3">
                <span className="h-[1px] flex-1 bg-slate-100"></span>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">Test Observations</p>
                <span className="h-[1px] flex-1 bg-slate-100"></span>
              </div>
              <ReportTable parameters={data.parameters} />
              <ReportFooter />
            </div>
          </div>

          {/* Sidebar (RIGHT) */}
          <div className="lg:col-span-4 sticky top-24">
            <ReportSidebar data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
