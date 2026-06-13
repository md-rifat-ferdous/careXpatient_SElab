'use client';
import React, { useState, useRef } from 'react';

interface UploadReportModalProps {
  orderId: string;
  patientName: string;
  onClose: () => void;
  onUpload: (orderId: string, fileUrl: string, resultSummary: string) => Promise<void>;
  onSend: (orderId: string, sentTo: string, channel: string) => Promise<void>;
}

export default function UploadReportModal({ orderId, patientName, onClose, onUpload, onSend }: UploadReportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [resultSummary, setResultSummary] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [channel, setChannel] = useState('Email');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [success, setSuccess] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file && !fileUrl) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('reportFile', file!);
      const res = await fetch('/api/lab/reports/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.fileUrl) {
        setFileUrl(data.fileUrl);
        await onUpload(orderId, data.fileUrl, resultSummary);
        setSuccess('Report uploaded and verified successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if (!sentTo) return;
    setSending(true);
    try {
      await onSend(orderId, sentTo, channel);
      setSuccess('Report dispatched successfully!');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Upload Report — {patientName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div className="p-6 space-y-5">
          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-800 font-semibold">{success}</p>
            </div>
          ) : (
            <>
              <div
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragOver ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-300'
                }`}
              >
                <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
                <svg className="w-8 h-8 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-slate-600">{file ? file.name : 'Drop file here or click to browse'}</p>
                <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG up to 20MB</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Result Summary</label>
                <textarea value={resultSummary} onChange={e => setResultSummary(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" placeholder="Enter result summary..." />
              </div>

              <button onClick={handleUpload} disabled={!file && !fileUrl || uploading} className="w-full py-2.5 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 disabled:opacity-50 transition-colors">
                {uploading ? 'Uploading...' : 'Upload & Verify Report'}
              </button>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Dispatch Report</h3>
                <div className="space-y-3">
                  <input value={sentTo} onChange={e => setSentTo(e.target.value)} placeholder="Email or Phone" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                  <select value={channel} onChange={e => setChannel(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                  <button onClick={handleSend} disabled={!sentTo || sending} className="w-full py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 disabled:opacity-50 transition-colors">
                    {sending ? 'Sending...' : 'Send Report'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
