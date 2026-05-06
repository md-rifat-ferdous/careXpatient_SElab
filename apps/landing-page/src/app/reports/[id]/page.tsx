'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface TestDetail {
  name: string;
  category: string;
  sampleType: string;
  description: string;
  prerequisites: string;
  deliveryTime: string;
  price: number | null;
}

interface ReportDetail {
  id: number;
  status: string;
  createdAt: string;
  labName: string;
  labAddress: string;
  labPhone: string;
  patientName: string;
  tests: TestDetail[];
  results: { summary: string; fileUrl: string | null; uploadedBy: string }[];
  parameters: { parameter_name: string; value: string; unit: string; reference_range: string }[];
  fileUrl: string | null;
}

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports/${id}`);
        if (!res.ok) throw new Error('Report not found');
        const data = await res.json();
        setReport(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const reportId = `#${String(id).padStart(6, '0')}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-subtle-gray font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-slate-300 block mb-4">description_off</span>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">Report Not Found</h2>
          <p className="text-slate-400 mb-6">{error || 'This report does not exist.'}</p>
          <Link href="/reports" className="px-6 py-2.5 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-colors font-medium">
            ← Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="bg-white/90 backdrop-blur-md text-teal-600 font-['Inter'] antialiased tracking-tight docked full-width top-0 z-50 border-b border-slate-100 shadow-sm shadow-slate-200/50 flex justify-between items-center h-16 px-6 w-full no-print sticky">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-extrabold text-teal-600">careXpatient</Link>
          <div className="hidden md:flex gap-6 ml-8">
            <Link href="/reports" className="text-slate-500 hover:bg-slate-50 transition-all duration-200 active:scale-95 cursor-pointer font-medium">Dashboard</Link>
            <span className="text-slate-500 hover:bg-slate-50 transition-all duration-200 active:scale-95 cursor-pointer font-medium">Appointments</span>
            <Link href="/reports" className="text-teal-600 font-semibold active:scale-95 cursor-pointer">Reports</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-slate-500 cursor-pointer">notifications</span>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-teal-100">
            <img 
              alt={report.patientName} 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWlmivM6VX7NCauCgL_cj4JFMeUMMqIDOqSVAZeZTfuVzzpXVVn42yc0Bv6vsxwjTDK0xwT6yUaNzZMXFOZzPDXScyEVgLSzFFxUKC-ncJeoLUOFUdVvLJ3w2pNo1BgYvy1X1vPwXUMUTLR7w_nFvSctVzzrtXz2QE--qouqquszBO5bJ8T08PSvSpNcRTNDqqIzHtNItOtqbbK1d-XRzh4gZlPbxkuxxBwemWDy12yHLrYsGMubilTscmrj7Jb7GxWJRBg8TGB58"
            />
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] w-full mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8 flex-1">
        {/* SideNavBar (Hidden on small screens, shown as sticky on desktop) */}
        <aside className="hidden lg:flex flex-col p-4 gap-2 h-[calc(100vh-120px)] w-64 bg-white border-r border-slate-100 sticky top-24 no-print rounded-xl shrink-0">
          <div className="mb-6 px-4">
            <p className="text-lg font-bold text-teal-600">{report.patientName}</p>
            <p className="text-xs text-slate-500 font-medium">Patient ID: #9821</p>
          </div>
          <nav className="flex flex-col gap-1">
            <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-teal-600 transition-colors rounded-lg font-medium text-sm" href="#">
              <span className="material-symbols-outlined">dashboard</span> Dashboard
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-teal-600 transition-colors rounded-lg font-medium text-sm" href="#">
              <span className="material-symbols-outlined">calendar_today</span> Appointments
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-teal-600 transition-colors rounded-lg font-medium text-sm" href="#">
              <span className="material-symbols-outlined">biotech</span> Lab Tests
            </a>
            <Link className="flex items-center gap-3 px-4 py-3 bg-teal-50 text-teal-600 rounded-lg border-r-4 border-teal-600 font-medium text-sm" href="/reports">
              <span className="material-symbols-outlined">description</span> Reports
            </Link>
          </nav>
          <div className="mt-auto px-4 py-6">
            <button className="w-full py-3 px-4 bg-primary-container text-on-primary rounded-xl font-button text-button hover:opacity-90 transition-all shadow-sm">Get Started</button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-8 w-full">
          {/* LEFT SIDE: Lab Report */}
          <section className="flex-[1.5] bg-white shadow-sm border border-slate-100 rounded-xl overflow-hidden min-h-[1000px] flex flex-col">
            {/* Report Header */}
            <div className="p-10 border-b border-slate-100 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-teal-50 flex items-center justify-center rounded-lg shrink-0">
                  <span className="material-symbols-outlined text-teal-600 text-4xl">biotech</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-on-surface">{report.labName}</h1>
                  <p className="text-sm text-subtle-gray">{report.labAddress || 'Advanced Clinical Laboratory Services'}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] uppercase tracking-widest text-subtle-gray font-bold">Report Serial</p>
                <p className="text-base font-medium">PD-{new Date().getFullYear()}-{report.id}</p>
              </div>
            </div>

            {/* Patient Meta */}
            <div className="grid grid-cols-3 gap-6 p-10 bg-slate-50/50">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-subtle-gray font-bold mb-1">Patient Name</p>
                <p className="text-base font-semibold">{report.patientName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-subtle-gray font-bold mb-1">Age / Gender</p>
                <p className="text-base font-medium">Adult / Not specified</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-subtle-gray font-bold mb-1">Referrer</p>
                <p className="text-base font-medium">Self / Walk-in</p>
              </div>
            </div>

            {/* Results Table */}
            <div className="p-10 flex-1 overflow-x-auto">
              <h2 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b-2 border-teal-600 w-fit">
                {report.tests.map(t => t.name).join(', ') || 'Diagnostic Tests'}
              </h2>
              
              {report.parameters && report.parameters.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left border-b border-slate-200">
                      <th className="py-4 text-xs font-bold text-subtle-gray uppercase tracking-wider">Parameter</th>
                      <th className="py-4 text-xs font-bold text-subtle-gray uppercase tracking-wider">Result</th>
                      <th className="py-4 text-xs font-bold text-subtle-gray uppercase tracking-wider">Unit</th>
                      <th className="py-4 text-xs font-bold text-subtle-gray uppercase tracking-wider">Reference Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.parameters.map((p, idx) => (
                      <tr key={idx}>
                        <td className="py-4 font-medium text-slate-700">{p.parameter_name}</td>
                        <td className="py-4 font-bold text-slate-900">{p.value}</td>
                        <td className="py-4 text-slate-500">{p.unit}</td>
                        <td className="py-4 text-slate-500">{p.reference_range}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="bg-slate-50 rounded-lg p-8 text-center border border-dashed border-slate-200">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">science</span>
                  <p className="text-slate-500">No detailed parameters available.</p>
                </div>
              )}
            </div>

            {/* Report Footer */}
            <div className="p-10 border-t border-slate-100 mt-auto">
              <div className="flex justify-between items-end flex-wrap gap-4">
                <div className="text-[12px] text-subtle-gray italic">
                  <p>*** End of Report ***</p>
                  <p className="mt-2 uppercase font-semibold">Machine generated report</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-12 mb-2 flex items-center justify-center opacity-70 grayscale">
                    <img alt="Signature" className="h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAu_F7JsxqwQM5yQcFbRDZur6DD4GQ4V7zFKcaM2o1oxVoomsJFxzQxdV2gU_yOYuTjdKu13aw5qYZiqeDo1mbzDBCkfGHAYmGYp73axldrSzCm0CMJ1Lim85hXrh03oIb2AVBPCKp-V4jDQyCwuSxqShrEmB2cC5cmOcf5bcNQCwH-ohFUD5-2UuCVLcXwEY-_aSVfV_ocxnoYgwdkMnKTMhraugFtLWrAA2RgelTCpdjexd3SRz1kr9XQuBGM_tACKhGg1MgC4UQ" />
                  </div>
                  <div className="border-t border-slate-300 pt-2 px-4">
                    <p className="text-sm font-bold text-slate-800">Dr. Sarah Johnson</p>
                    <p className="text-[10px] text-subtle-gray uppercase">Consultant Pathologist</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT SIDE: Support Panel */}
          <section className="flex-1 flex flex-col gap-6 no-print min-w-0 md:min-w-[300px]">
            {/* Actions Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-4 text-on-surface">Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => window.open(`http://localhost:5000/api/reports/${id}/pdf`, '_blank')} 
                  className="flex items-center justify-center gap-2 py-3 bg-primary-container text-on-primary rounded-xl font-medium hover:opacity-90 transition-all shadow-md">
                  <span className="material-symbols-outlined">download</span> Download PDF
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => window.print()} className="flex items-center justify-center gap-2 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all">
                    <span className="material-symbols-outlined">print</span> Print
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all">
                    <span className="material-symbols-outlined">share</span> Share
                  </button>
                </div>
              </div>
            </div>

            {/* Report Info Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-xs font-bold text-subtle-gray uppercase tracking-widest mb-4">Report Info</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-subtle-gray">Lab Name</span>
                  <span className="text-sm font-semibold text-slate-700">{report.labName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-subtle-gray">Test Type</span>
                  <span className="text-sm font-semibold text-slate-700">{report.tests[0]?.category || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-subtle-gray">Collection Date</span>
                  <span className="text-sm font-semibold text-slate-700">{report.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-subtle-gray">Status</span>
                  <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{report.status}</span>
                </div>
              </div>
            </div>

            {/* Doctor's Note */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-teal-600">comment</span>
                <h3 className="text-xs font-bold text-subtle-gray uppercase tracking-widest">Doctor's Note</h3>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-sm italic text-subtle-gray text-center">
                  {report.results?.[0]?.summary || 'No comment added yet'}
                </p>
              </div>
            </div>

            {/* Consult Doctor */}
            <div className="bg-secondary-container/10 p-6 rounded-xl border border-secondary-container/30">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-secondary">medical_services</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-on-secondary-container">Need interpretation?</h4>
                  <p className="text-sm text-on-secondary-container/70 mb-4">Talk to a certified specialist about your laboratory results today.</p>
                  <button className="w-full py-3 bg-secondary text-on-secondary rounded-xl font-medium hover:opacity-90 transition-all shadow-md">Consult Doctor</button>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-6 bg-slate-100/50 rounded-xl border border-slate-100">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-subtle-gray scale-75 mt-0.5">info</span>
                <p className="text-[12px] text-subtle-gray leading-relaxed">
                  <strong>Medical Disclaimer:</strong> This report is intended for informational purposes only. It should not be used to self-diagnose or as a substitute for professional medical advice. Please consult with your physician for a full clinical evaluation and interpretation of these results.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FAB for quick help (mobile) */}
      <button className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary-container text-on-primary rounded-full shadow-lg flex items-center justify-center z-50">
        <span className="material-symbols-outlined">help</span>
      </button>

      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    </div>
  );
}
