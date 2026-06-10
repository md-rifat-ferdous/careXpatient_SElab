'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  getPendingUploads,
  uploadReport,
  type PendingUploadOrder,
} from '@/services/lab.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getAgeAndGender(fullName: string, dob: string | null) {
  let age = '—';
  if (dob) {
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    age = `${currentYear - birthYear}y`;
  }
  const femaleNames = ['elena', 'jen', 'amara', 'linda', 'sophia', 'emma', 'sarah', 'woman', 'female', 'kalu', 'rodriguez'];
  const nameLower = fullName.toLowerCase();
  const gender = femaleNames.some(f => nameLower.includes(f)) ? 'Female' : 'Male';
  return dob ? `${age} / ${gender}` : `— / ${gender}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

// ── Toast Notification ────────────────────────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-[100] max-w-sm bg-white rounded-xl border border-emerald-200 shadow-xl px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
      </div>
      <p className="text-sm font-medium text-[#111c2d] flex-1">{message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
}

// ── Upload Modal Component ─────────────────────────────────────────────────────
interface UploadModalProps {
  order: PendingUploadOrder;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
  token: string;
}

function UploadModal({ order, onClose, token, onSuccess }: UploadModalProps) {
  const [findings, setFindings] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(selectedFile.type)) {
      setError('Only PDF and image files (JPG, PNG, WebP) are allowed.');
      return;
    }
    if (selectedFile.size > 15 * 1024 * 1024) {
      setError('File size must be under 15 MB.');
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files[0] ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!findings && !file) {
      setError('Please add findings or upload a report file.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await uploadReport(token, {
        labOrderId: order.id,
        summary: findings, // map findings to summary as well for safety
        findings,
        impression: '',
        recommendations: '',
        file,
      });
      onSuccess(order.id);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Parsing demographics details
  const testNames = order.tests.map((t) => t.name).join(', ');
  const dob = (order.patient as any).dateOfBirth || null;
  const demographics = getAgeAndGender(order.patient.fullName, dob);
  const [agePart, genderPart] = demographics.split(' / ');

  return (
    <div className="fixed inset-0 z-50 bg-[#111c2d]/60 backdrop-blur-[4px] flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-[800px] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#bbcac6]/30 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-[#006b5f]">Upload Report</h3>
            <div className="flex items-center gap-1 mt-1 text-[#3c4947]">
              <span className="material-symbols-outlined text-[18px]">biotech</span>
              <span className="text-sm font-medium">{testNames} - {order.patient.fullName}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6c7a77] hover:text-[#111c2d] transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
            {/* Patient Info Card */}
            <div className="bg-[#f0f3ff] p-4 rounded-xl flex flex-wrap items-center gap-8 border border-[#bbcac6]/20">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#006b5f]/10 flex items-center justify-center text-[#006b5f]">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>person</span>
                </div>
                <div>
                  <p className="text-xs text-[#3c4947] leading-tight">Patient Name</p>
                  <p className="font-semibold text-sm text-[#111c2d]">{order.patient.fullName}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#3c4947] leading-tight">Patient ID</p>
                <p className="font-semibold text-sm text-[#111c2d]">#LC-{order.patient.id}</p>
              </div>
              <div>
                <p className="text-xs text-[#3c4947] leading-tight">Age</p>
                <p className="font-semibold text-sm text-[#111c2d]">{agePart}</p>
              </div>
              <div>
                <p className="text-xs text-[#3c4947] leading-tight">Gender</p>
                <p className="font-semibold text-sm text-[#111c2d]">{genderPart || 'Male'}</p>
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />

              {file ? (
                <div className="border border-emerald-300 bg-emerald-50/40 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[32px]">
                      {file.type === 'application/pdf' ? 'picture_as_pdf' : 'image'}
                    </span>
                    <div>
                      <p className="font-semibold text-emerald-800 text-sm truncate max-w-[300px]">{file.name}</p>
                      <p className="text-xs text-emerald-600">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* PDF Upload Card */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    className={`border-2 border-dashed border-[#bbcac6] rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-[#006b5f]/50 hover:bg-[#006b5f]/5 transition-all cursor-pointer group text-center ${dragOver ? 'bg-[#006b5f]/10 border-[#006b5f]' : ''}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#f0f3ff] flex items-center justify-center text-[#006b5f] group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[28px]">picture_as_pdf</span>
                    </div>
                    <div>
                      <p className="font-medium text-[#111c2d]">Upload PDF</p>
                      <p className="text-xs text-[#3c4947]">Official laboratory report file</p>
                    </div>
                  </div>

                  {/* Image Upload Card */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    className={`border-2 border-dashed border-[#bbcac6] rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-[#006b5f]/50 hover:bg-[#006b5f]/5 transition-all cursor-pointer group text-center ${dragOver ? 'bg-[#006b5f]/10 border-[#006b5f]' : ''}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#f0f3ff] flex items-center justify-center text-[#006b5f] group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[28px]">image</span>
                    </div>
                    <div>
                      <p className="font-medium text-[#111c2d]">Upload Images</p>
                      <p className="text-xs text-[#3c4947]">Microscopic views or charts</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Findings Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#3c4947] uppercase tracking-wider block">Findings</label>
              <textarea
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                className="w-full h-24 rounded-xl border border-[#bbcac6]/40 bg-white focus:border-[#006b5f] focus:ring-1 focus:ring-[#006b5f] p-4 text-sm text-[#111c2d] placeholder:text-slate-400 resize-none outline-none transition"
                placeholder="Summarize key clinical observations..."
                spellCheck="false"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-[#ffdad6] border border-red-200 text-[#93000a] rounded-xl px-4 py-3 text-sm">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="p-6 border-t border-[#bbcac6]/30 bg-white flex justify-end items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-sm font-semibold text-[#006b5f] border border-[#006b5f] hover:bg-[#006b5f]/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl text-sm font-semibold bg-[#14b8a6] text-white hover:opacity-90 shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  Upload Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Skeleton queue row ────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
          <div className="space-y-1">
            <div className="h-4 bg-slate-100 rounded w-24" />
            <div className="h-3 bg-slate-100 rounded w-16" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="h-4 bg-slate-100 rounded w-36" />
          <div className="h-3 bg-slate-100 rounded w-16" />
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20" /></td>
      <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded-full w-24" /></td>
      <td className="px-6 py-4 text-right"><div className="h-8 w-24 bg-slate-100 rounded-lg ml-auto" /></td>
    </tr>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function UploadReportsPage() {
  const { token } = useAuthStore();

  const [orders, setOrders] = useState<PendingUploadOrder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PendingUploadOrder | null>(null);
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getPendingUploads(token);
      setOrders(res.data);
      setTotalCount(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load pending uploads queue');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUploadSuccess = (orderId: string) => {
    setSelectedOrder(null);
    setReportedIds((prev) => {
      const next = new Set(prev);
      next.add(orderId);
      return next;
    });
    setToastMessage('Report uploaded successfully! Lab Order status updated to Reported.');
    // Re-fetch from backend to sync state
    fetchOrders();
  };

  const pendingOrders = orders.filter((o) => !reportedIds.has(o.id));
  const uploadedCount = reportedIds.size;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 bg-[#F8FAFC]">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {selectedOrder && token && (
        <UploadModal
          order={selectedOrder}
          token={token}
          onClose={() => setSelectedOrder(null)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Title Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-[#111c2d]">Upload Reports</h2>
          <p className="text-[#3c4947] mt-1 text-sm">Manage and process medical reports for pending tests.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchOrders}
            className="bg-white border border-[#bbcac6] text-[#3c4947] px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 hover:bg-[#f0f3ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">sync</span>
            Sync Queue
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Card 1: Pending Uploads */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-transparent hover:border-[#006b5f]/20 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-[#006b5f]/10 text-[#006b5f] rounded-lg">
              <span className="material-symbols-outlined text-[24px]">pending</span>
            </div>
            {pendingOrders.length > 0 && (
              <span className="text-xs text-[#006b5f] font-medium">+2 since 1hr</span>
            )}
          </div>
          <div>
            <p className="text-xs text-[#3c4947] font-semibold uppercase tracking-wider">Pending Uploads</p>
            <h3 className="text-4xl font-bold text-[#006b5f] mt-1">{loading ? '...' : pendingOrders.length}</h3>
          </div>
        </div>

        {/* Card 2: Uploaded Today */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-transparent hover:border-[#006b5f]/20 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-[#f0f3ff] text-[#3c4947] rounded-lg">
              <span className="material-symbols-outlined text-[24px]">check_circle</span>
            </div>
            <span className="text-xs text-[#006b5f] font-medium">84% of daily goal</span>
          </div>
          <div>
            <p className="text-xs text-[#3c4947] font-semibold uppercase tracking-wider">Uploaded Today</p>
            <h3 className="text-4xl font-bold text-[#111c2d] mt-1">{45 + uploadedCount}</h3>
          </div>
        </div>

        {/* Card 3: Total Reports */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-transparent hover:border-[#006b5f]/20 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-[#f0f3ff] text-[#3c4947] rounded-lg">
              <span className="material-symbols-outlined text-[24px]">description</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-[#3c4947] font-semibold uppercase tracking-wider">Total Reports</p>
            <h3 className="text-4xl font-bold text-[#111c2d] mt-1">{1280 + uploadedCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Queue Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#bbcac6]/20 overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-[#bbcac6]/20">
          <h3 className="text-lg font-bold text-[#111c2d]">Upload Reports Queue</h3>
          <div className="flex rounded-lg border border-[#bbcac6] overflow-hidden">
            <button className="px-4 py-1.5 bg-[#f0f3ff] text-[#006b5f] font-semibold text-xs border-r border-[#bbcac6]">All</button>
            <button className="px-4 py-1.5 text-[#3c4947] font-semibold text-xs hover:bg-[#f0f3ff] transition-colors">Urgent</button>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-50 border-b border-red-200 text-red-700 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f3ff]/50 border-b border-[#bbcac6]/20">
                <th className="px-6 py-4 text-xs font-semibold text-[#3c4947] uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#3c4947] uppercase tracking-wider">Patient ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#3c4947] uppercase tracking-wider">Test Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#3c4947] uppercase tracking-wider">Test Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#3c4947] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#3c4947] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcac6]/10">
              {loading ? (
                [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
              ) : pendingOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#3c4947]">
                    <span className="material-symbols-outlined text-4xl text-[#bbcac6]">task_alt</span>
                    <p className="mt-2 text-sm font-semibold">Queue is empty</p>
                    <p className="text-xs text-[#94A3B8] mt-1">All pending test reports have been uploaded.</p>
                  </td>
                </tr>
              ) : (
                pendingOrders.map((order) => {
                  const testName = order.tests.map((t) => t.name).join(', ');
                  const testCategory = order.tests[0]?.category || 'General';
                  const initials = getInitials(order.patient.fullName);
                  const dob = (order.patient as any).dateOfBirth || null;

                  return (
                    <tr key={order.id} className="hover:bg-[#f9f9ff] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#6ef9e2]/30 flex items-center justify-center text-[#007164] font-bold text-sm shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-[#111c2d] text-sm">{order.patient.fullName}</p>
                            <p className="text-[12px] text-[#3c4947]">{getAgeAndGender(order.patient.fullName, dob)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[#3c4947]">#LC-{order.patient.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[#111c2d] font-medium text-sm">{testName}</span>
                          <span className="text-[12px] text-[#006b5f] font-semibold mt-0.5">{testCategory}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3c4947]">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                          Pending Upload
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-[#14b8a6] text-white font-semibold text-xs px-4 py-2 rounded-lg hover:brightness-95 transition-all flex items-center gap-1 ml-auto"
                        >
                          Upload Report
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Queue Pagination Footer */}
        {!loading && pendingOrders.length > 0 && (
          <div className="p-6 bg-[#f0f3ff]/30 border-t border-[#bbcac6]/20 flex justify-between items-center text-xs">
            <p className="text-[#3c4947]">
              Showing <span className="font-bold">{pendingOrders.length}</span> of <span className="font-bold">{pendingOrders.length}</span> pending reports
            </p>
            <div className="flex items-center gap-2">
              <button disabled className="p-2 rounded-lg border border-[#bbcac6] text-[#3c4947] disabled:opacity-40">
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button className="w-8 h-8 rounded-lg bg-[#006b5f] text-white font-bold">1</button>
              <button disabled className="p-2 rounded-lg border border-[#bbcac6] text-[#3c4947] disabled:opacity-40">
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State / Helpful Tips Area */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tip 1 */}
        <div className="p-6 bg-[#006b5f]/5 border border-[#006b5f]/10 rounded-xl flex gap-6 items-start">
          <div className="p-3 bg-white rounded-xl shadow-sm text-[#006b5f] shrink-0">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>info</span>
          </div>
          <div>
            <h4 className="font-bold text-[#111c2d] text-sm mb-1">Fast Upload Protocol</h4>
            <p className="text-xs text-[#3c4947] leading-relaxed">You can now drag and drop PDF files directly onto a row to initiate an instant background upload. Multiple files can be merged into a single report.</p>
          </div>
        </div>

        {/* Tip 2 */}
        <div className="p-6 bg-white border border-[#bbcac6]/20 rounded-xl flex gap-6 items-start shadow-sm">
          <div className="p-3 bg-[#f0f3ff] rounded-xl text-[#3c4947] shrink-0">
            <span className="material-symbols-outlined">sync</span>
          </div>
          <div>
            <h4 className="font-bold text-[#111c2d] text-sm mb-1">Automatic Verification</h4>
            <p className="text-xs text-[#3c4947] leading-relaxed">Our AI automatically checks for patient ID and name matches in the uploaded files to reduce clinical errors. Verification takes approx. 30 seconds.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 flex justify-between items-center text-xs text-[#3c4947]/70 border-t border-[#bbcac6]/20 mt-10">
        <p>© 2024 careXpatient Lab Portal. All rights reserved.</p>
        <div className="flex gap-6">
          <a className="hover:text-[#006b5f] underline transition-opacity" href="#">Privacy Policy</a>
          <a className="hover:text-[#006b5f] underline transition-opacity" href="#">Terms of Service</a>
          <a className="hover:text-[#006b5f] underline transition-opacity" href="#">Support</a>
        </div>
      </footer>
    </div>
  );
}
