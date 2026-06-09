'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  getPendingUploads,
  uploadReport,
  type PendingUploadOrder,
} from '@/services/lab.service';

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Requested:       'bg-amber-50 text-amber-700 border-amber-200',
    AcceptedByLab:   'bg-sky-50 text-sky-700 border-sky-200',
    SampleCollected: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Processing:      'bg-violet-50 text-violet-700 border-violet-200',
    Reported:        'bg-emerald-50 text-emerald-700 border-emerald-200',
    Cancelled:       'bg-red-50 text-red-600 border-red-200',
  };
  const label: Record<string, string> = {
    Requested:       'Requested',
    AcceptedByLab:   'Accepted',
    SampleCollected: 'Sample Collected',
    Processing:      'Processing',
    Reported:        'Reported',
    Cancelled:       'Cancelled',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {label[status] ?? status}
    </span>
  );
}

function SmallAvatar({ name, url }: { name: string; url: string | null }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  if (url) return <img src={url} alt={name} className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0" />;
  const colors = ['bg-teal-500', 'bg-violet-500', 'bg-sky-500', 'bg-rose-500', 'bg-amber-500'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shrink-0`}>
      <span className="text-white text-sm font-bold">{initials}</span>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
interface UploadModalProps {
  order: PendingUploadOrder;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
  token: string;
}

function UploadModal({ order, onClose, token, onSuccess }: UploadModalProps) {
  const [summary,         setSummary]         = useState('');
  const [findings,        setFindings]        = useState('');
  const [impression,      setImpression]      = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [file,            setFile]            = useState<File | null>(null);
  const [dragOver,        setDragOver]        = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleFileChange = (f: File | null) => {
    if (!f) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(f.type)) {
      setError('Only PDF and image files (JPG, PNG, WebP) are allowed.');
      return;
    }
    if (f.size > 15 * 1024 * 1024) {
      setError('File size must be under 15 MB.');
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files[0] ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary && !findings && !impression && !recommendations && !file) {
      setError('Please fill at least one field or upload a file.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await uploadReport(token, {
        labOrderId: order.id,
        summary,
        findings,
        impression,
        recommendations,
        file,
      });
      onSuccess(order.id);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fileSizeStr = file
    ? file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 id="upload-modal-title" className="text-lg font-bold text-slate-800">Upload Report</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Patient: <span className="font-semibold text-slate-700">{order.patient.fullName}</span>
            </p>
          </div>
          <button
            id="close-upload-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Patient + Tests summary */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-start gap-3">
            <SmallAvatar name={order.patient.fullName} url={order.patient.profilePhotoUrl} />
            <div>
              <p className="font-semibold text-slate-800 text-sm">{order.patient.fullName}</p>
              <p className="text-xs text-slate-500">{order.patient.phone}</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {order.tests.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 border border-teal-100 rounded-md text-xs text-teal-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                    {t.name}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1">Order date: {formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* File upload zone */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Upload Report File <span className="text-slate-400 font-normal">(PDF or Image)</span>
            </label>
            <div
              id="file-drop-zone"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`relative border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-teal-400 bg-teal-50/60'
                  : file
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                id="report-file-input"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-emerald-800 truncate max-w-[280px]">{file.name}</p>
                    <p className="text-xs text-emerald-600">{fileSizeStr}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-600">
                    Drop file here or <span className="text-teal-600">browse</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG or WebP · Max 15 MB</p>
                </>
              )}
            </div>
          </div>

          {/* Text fields */}
          {[
            { id: 'summary',         label: 'Report Summary', value: summary,         setter: setSummary,         placeholder: 'Brief summary of the overall test results…', rows: 3 },
            { id: 'findings',        label: 'Findings',        value: findings,        setter: setFindings,        placeholder: 'Detailed findings from each test parameter…', rows: 3 },
            { id: 'impression',      label: 'Impression',      value: impression,      setter: setImpression,      placeholder: 'Clinical impression based on the results…', rows: 2 },
            { id: 'recommendations', label: 'Recommendations', value: recommendations, setter: setRecommendations, placeholder: 'Suggested next steps, follow-up tests, or lifestyle advice…', rows: 2 },
          ].map(({ id, label, value, setter, placeholder, rows }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">
                {label}
              </label>
              <textarea
                id={id}
                rows={rows}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none transition"
              />
            </div>
          ))}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
            <button
              type="button"
              id="cancel-upload"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-upload"
              disabled={submitting}
              className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Save Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Order card in queue ───────────────────────────────────────────────────────
function PendingOrderCard({
  order,
  onUpload,
  justReported,
}: {
  order: PendingUploadOrder;
  onUpload: (order: PendingUploadOrder) => void;
  justReported: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${justReported ? 'border-emerald-200' : 'border-slate-100'}`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <SmallAvatar name={order.patient.fullName} url={order.patient.profilePhotoUrl} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-slate-800 text-sm">{order.patient.fullName}</p>
              <StatusBadge status={justReported ? 'Reported' : order.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{order.patient.phone}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {order.tests.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-xs text-slate-600">
                  {t.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Order placed {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="shrink-0">
            {justReported ? (
              <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Uploaded
              </div>
            ) : (
              <button
                id={`upload-btn-${order.id}`}
                onClick={() => onUpload(order)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Report
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed top-4 right-4 z-[100] max-w-sm bg-white rounded-xl border border-emerald-200 shadow-xl px-4 py-3 flex items-center gap-3 animate-slide-right">
      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-700 flex-1">{message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-100 rounded w-1/3" />
          <div className="h-3 bg-slate-100 rounded w-1/4" />
          <div className="flex gap-2 mt-2">
            <div className="h-5 bg-slate-100 rounded-md w-24" />
            <div className="h-5 bg-slate-100 rounded-md w-20" />
          </div>
        </div>
        <div className="h-9 w-32 bg-slate-100 rounded-xl shrink-0" />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UploadReportsPage() {
  const { token } = useAuthStore();

  const [orders,         setOrders]         = useState<PendingUploadOrder[]>([]);
  const [total,          setTotal]          = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [selectedOrder,  setSelectedOrder]  = useState<PendingUploadOrder | null>(null);
  const [reportedIds,    setReportedIds]    = useState<Set<string>>(new Set());
  const [toast,          setToast]          = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getPendingUploads(token);
      setOrders(res.data);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load pending uploads');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleUploadSuccess = (orderId: string) => {
    setSelectedOrder(null);
    setReportedIds((prev) => new Set(prev).add(orderId));
    setToast('Report uploaded successfully! Order marked as Reported.');
  };

  const pendingOrders  = orders.filter((o) => !reportedIds.has(o.id));
  const uploadedCount  = reportedIds.size;

  return (
    <div className="min-h-full bg-slate-50">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {selectedOrder && token && (
        <UploadModal
          order={selectedOrder}
          token={token}
          onClose={() => setSelectedOrder(null)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-violet-100 text-sm font-medium mb-0.5">Lab Portal</p>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              Upload Reports
              {!loading && (
                <span className="bg-white/20 text-white text-sm font-semibold px-3 py-0.5 rounded-full">
                  {total - uploadedCount} pending
                </span>
              )}
            </h1>
          </div>
          <button
            id="refresh-pending"
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Total in Queue', value: total,          icon: '📋', cls: 'bg-white border-slate-100' },
              { label: 'Pending Upload', value: total - uploadedCount, icon: '⏳', cls: 'bg-amber-50 border-amber-100' },
              { label: 'Uploaded Today', value: uploadedCount,  icon: '✅', cls: 'bg-emerald-50 border-emerald-100' },
            ].map((s) => (
              <div key={s.label} className={`${s.cls} rounded-xl border shadow-sm px-4 py-3 flex items-center gap-3`}>
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-xl font-bold text-slate-800">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
            <button onClick={fetchOrders} className="ml-auto text-red-600 hover:text-red-800 font-medium text-sm">Retry</button>
          </div>
        )}

        {/* Queue label */}
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          {loading ? 'Loading queue…' : `Pending Upload Queue (${pendingOrders.length})`}
        </h2>

        {/* Cards */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-14 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-700">All caught up!</p>
            <p className="text-slate-400 text-sm mt-1">No pending reports to upload.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <PendingOrderCard
                key={order.id}
                order={order}
                onUpload={setSelectedOrder}
                justReported={reportedIds.has(order.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
