'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import {
  getPatientHistory } from


'@/services/lab.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDemographics(fullName, dob) {
  let age = '—';
  if (dob) {
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    age = `${currentYear - birthYear} Yrs`;
  }
  const femaleNames = ['elena', 'jen', 'amara', 'linda', 'sophia', 'emma', 'sarah', 'woman', 'female', 'kalu', 'rodriguez'];
  const nameLower = fullName.toLowerCase();
  const gender = femaleNames.some((f) => nameLower.includes(f)) ? 'Female' : 'Male';
  return dob ? `${age}, ${gender}` : `—, ${gender}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function getTestIcon(testName) {
  const lower = testName.toLowerCase();
  if (lower.includes('blood') || lower.includes('cbc') || lower.includes('lipid') || lower.includes('metabolic') || lower.includes('panel')) {
    return 'bloodtype';
  }
  if (lower.includes('x-ray') || lower.includes('xray') || lower.includes('imaging') || lower.includes('radiology') || lower.includes('mri') || lower.includes('scan')) {
    return 'radiology';
  }
  if (lower.includes('neuro') || lower.includes('brain')) {
    return 'neurology';
  }
  return 'biotech';
}

function getTestDescription(testName) {
  const lower = testName.toLowerCase();
  if (lower.includes('cbc') || lower.includes('complete blood count')) {
    return 'Comprehensive analysis of red and white blood cells, platelets, and hemoglobin levels.';
  }
  if (lower.includes('metabolic') || lower.includes('cmp') || lower.includes('panel')) {
    return 'Assessment of kidney function, liver function, and electrolyte balance.';
  }
  if (lower.includes('x-ray') || lower.includes('xray')) {
    return 'Imaging of the thoracic cavity including heart size and lung clarity.';
  }
  if (lower.includes('lipid')) {
    return 'Measurement of cholesterol and triglycerides levels in the blood.';
  }
  if (lower.includes('thyroid')) {
    return 'Evaluation of thyroid hormone levels to check thyroid gland activity.';
  }
  return 'Comprehensive diagnostic laboratory test for clinical assessment and evaluations.';
}

function BigAvatar({ name, url }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  if (url) {
    return (
      <img
        src={url}
        alt={`Patient ${name}`}
        className="w-24 h-24 rounded-full border-4 border-[#e7eeff] object-cover" />);


  }
  const colors = [
  'bg-[#006b5f]/10 text-[#006b5f]',
  'bg-[#14b8a6]/10 text-[#14b8a6]',
  'bg-[#50616b]/10 text-[#50616b]'];

  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-24 h-24 rounded-full border-4 border-[#e7eeff] ${color} flex items-center justify-center font-bold text-2xl`}>
      {initials}
    </div>);

}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function PatientHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!token || !params.id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPatientHistory(token, params.id);
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load patient history');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, params.id]);

  const [viewingReport, setViewingReport] = useState(null);

  const handleViewReport = (order) => {
    const result = order.labResults[0];
    if (result?.fileUrl) {
      setViewingReport(order);
    } else if (result?.resultSummary) {
      alert("Report details:\n\n" + result.resultSummary);
    } else {
      alert("No report file or summary available.");
    }
  };

  const handleCloseReport = () => setViewingReport(null);

  // ── Skeleton Loader ──
  if (loading) {
    return (
      <div className="max-w-[1280px] w-full mx-auto px-6 py-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded mb-4" />
        <div className="bg-white rounded-xl h-44 border border-slate-100 p-6 mb-10" />
        <div className="h-10 w-64 bg-slate-200 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl h-52 border border-slate-100" />
          <div className="bg-white rounded-xl h-52 border border-slate-100" />
        </div>
      </div>);

  }

  if (error || !data) {
    return (
      <div className="max-w-[1280px] w-full mx-auto px-6 py-10">
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-md mx-auto shadow-sm">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
          <p className="text-[#111c2d] font-semibold mb-2">Error loading patient history</p>
          <p className="text-[#3c4947] text-sm mb-4">{error || 'Patient data not found'}</p>
          <button
            onClick={() => router.push('/dashboard/lab/patients')}
            className="text-[#006b5f] text-sm font-semibold hover:underline flex items-center gap-1 mx-auto">
            
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Patients
          </button>
        </div>
      </div>);

  }

  const { patient, orders } = data;

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    return order.tests.some((t) => t.name.toLowerCase().includes(query)) ||
    order.id.toLowerCase().includes(query);
  });

  const lastUpdated = orders[0] ?
  formatDate(orders[0].createdAt) :
  patient.dateOfBirth ?
  formatDate(patient.dateOfBirth) :
  '—';

  const viewingResult = viewingReport?.labResults[0];
  const isPdf = viewingResult?.fileUrl?.startsWith('data:application/pdf');

  return (
    <div className="max-w-[1280px] w-full mx-auto px-6 py-6 bg-[#F8FAFC]">
      {/* Report Viewer Overlay */}
      {viewingReport && viewingResult?.fileUrl &&
      <div className="fixed inset-0 z-50 bg-[#111c2d]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#bbcac6]/20">
              <div>
                <h3 className="text-lg font-bold text-[#111c2d]">Report</h3>
                <p className="text-sm text-[#3c4947]">
                  {viewingReport.tests.map((t) => t.name).join(', ')}
                </p>
              </div>
              <button
              onClick={handleCloseReport}
              className="p-2 text-[#3c4947] hover:text-[#111c2d] hover:bg-[#f0f3ff] rounded-lg transition-colors">
              
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-[#F8FAFC]">
              {viewingResult.resultSummary &&
            <div className="mb-6 p-4 bg-white rounded-xl border border-[#bbcac6]/20">
                  <h4 className="text-xs font-semibold text-[#3c4947] uppercase tracking-wider mb-2">Clinical Summary</h4>
                  <p className="text-sm text-[#111c2d] whitespace-pre-wrap">{viewingResult.resultSummary}</p>
                </div>
            }
              {isPdf ?
            <iframe
              src={viewingResult.fileUrl}
              className="w-full h-[70vh] rounded-xl border border-[#bbcac6]/20"
              title="Report PDF" /> :


            <img
              src={viewingResult.fileUrl}
              alt="Report"
              className="max-w-full h-auto rounded-xl border border-[#bbcac6]/20 mx-auto" />

            }
            </div>
            <div className="px-6 py-3 border-t border-[#bbcac6]/20 flex justify-between items-center bg-white">
              <span className="text-xs text-[#94A3B8]">
                Uploaded on {viewingResult.uploadedAt ? formatDate(viewingResult.uploadedAt) : '—'}
              </span>
              <a
              href={viewingResult.fileUrl}
              download={`report-${viewingReport.id}`}
              className="text-[#006b5f] text-sm font-semibold flex items-center gap-1 hover:underline">
              
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download
              </a>
            </div>
          </div>
        </div>
      }

      {/* Back Button */}
      <div className="mb-4">
        <button
          id="back-btn"
          onClick={() => router.push('/dashboard/lab/patients')}
          className="inline-flex items-center gap-1.5 text-[#006b5f] hover:text-[#006b5f]/80 text-sm font-semibold transition-colors">
          
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Patients
        </button>
      </div>

      {/* Patient Profile Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-10 flex items-center gap-6 border border-[#bbcac6]/20">
        <BigAvatar name={patient.fullName} url={patient.profilePhotoUrl} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
          <div>
            <p className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">Patient Name</p>
            <p className="text-xl font-bold text-[#111c2d] mt-1">{patient.fullName}</p>
          </div>
          <div>
            <p className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">Patient ID</p>
            <p className="text-sm text-[#111c2d] font-semibold mt-1">#LC-{patient.id}</p>
          </div>
          <div>
            <p className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">Demographics</p>
            <p className="text-sm text-[#111c2d] mt-1">{getDemographics(patient.fullName, patient.dateOfBirth)}</p>
          </div>
          <div>
            <p className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">Last Updated</p>
            <p className="text-sm text-[#111c2d] mt-1">{lastUpdated}</p>
          </div>
          <div>
            <p className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">Blood Group</p>
            <p className="text-sm text-[#111c2d] font-semibold mt-1">{patient.bloodGroup || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">Phone</p>
            <p className="text-sm text-[#111c2d] font-semibold mt-1">{patient.phone}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">Address</p>
            <p className="text-sm text-[#111c2d] mt-1">{patient.address || '—'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">Email</p>
            <p className="text-sm text-[#111c2d] font-semibold mt-1">{patient.email || '—'}</p>
          </div>
        </div>
      </div>

      {/* Test History Search */}
      <div className="mb-6 max-w-md">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[#94A3B8] pointer-events-none">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Search laboratory tests..."
            className="w-full bg-white border border-[#bbcac6]/50 rounded-xl py-3 pl-10 pr-4 text-sm text-[#111c2d] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#14b8a6] transition-colors shadow-sm" />
          
        </div>
      </div>

      {/* Test History Grid */}
      {filteredOrders.length === 0 ?
      <div className="bg-white rounded-xl shadow-sm border border-[#bbcac6]/20 p-10 text-center text-[#3c4947] max-w-md mx-auto">
          <span className="material-symbols-outlined text-4xl text-[#bbcac6]">science_off</span>
          <p className="mt-2 text-sm">No laboratory tests found matching your search.</p>
        </div> :

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map((order) => {
          const isCompleted = order.status === 'Reported' && order.labResults.length > 0;
          const testName = order.tests.map((t) => t.name).join(', ');
          const category = order.tests[0]?.category || 'General';
          return (
            <div key={order.id} className={`bg-white rounded-xl shadow-sm p-6 flex flex-col border ${!isCompleted ? 'border-[#ffdad6]/50' : 'border-transparent'}`}>
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#14b8a6]/20 rounded-xl flex items-center justify-center text-[#006b5f]">
                      <span className="material-symbols-outlined text-[24px]">{getTestIcon(testName)}</span>
                    </div>
                    <div>
                      <h3 className="text-md font-bold text-[#111c2d] leading-none">{testName}</h3>
                      <p className="text-xs text-[#3c4947] mt-1">Requested • {formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  {isCompleted ?
                <span className="bg-[#6ef9e2]/30 text-[#007164] text-xs font-semibold px-4 py-1 rounded-full">Completed</span> :
                order.status === 'Cancelled' ?
                <span className="bg-red-50 text-red-600 text-xs font-semibold px-4 py-1 rounded-full">Cancelled</span> :

                <span className="bg-[#ffdad6] text-[#93000a] text-xs font-semibold px-4 py-1 rounded-full">Pending</span>
                }
                </div>

                {/* Card Body */}
                <div className="flex-1">
                  <p className="text-sm text-[#3c4947] mb-6">{getTestDescription(testName)}</p>
                </div>

                {/* Card Footer Actions */}
                {isCompleted ?
              <div className="flex justify-end gap-4 pt-4 border-t border-[#bbcac6]/10">
                    <button
                  onClick={() => handleViewReport(order)}
                  className="text-[#006b5f] font-semibold text-sm px-4 py-2 hover:bg-[#f0f3ff] rounded-lg transition-colors flex items-center gap-1">
                  
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                      View Report
                    </button>
                  </div> :

              <div className="pt-4 border-t border-[#bbcac6]/10">
                    <div className="bg-[#e7eeff] flex items-center gap-2 px-4 py-2 rounded-lg text-[#D97706] font-semibold text-xs border border-[#FCD34D]/50">
                      <span className="material-symbols-outlined text-[20px]">warning</span>
                      Report not uploaded yet
                    </div>
                  </div>
              }
              </div>);

        })}
        </div>
      }

      {/* Footer */}
      <footer className="w-full flex justify-between items-center px-6 py-4 border-t border-[#bbcac6] mt-10 text-xs text-[#94A3B8]">
        <p>© 2024 careXpatient Systems. All rights reserved.</p>
        <div className="flex gap-6">
          <a className="hover:text-[#006b5f] transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-[#006b5f] transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-[#006b5f] transition-colors" href="#">HIPAA Compliance</a>
        </div>
      </footer>
    </div>);

}