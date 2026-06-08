import { useState, useEffect, useRef } from 'react';

const API = 'http://localhost:5000';

// UploadReports owns steps 7 (Processing), 8 (Ready for Report), 9 (Completed)
const REPORT_TABS = ['All', 'Processing', 'Ready for Report', 'Completed'];

const STEP_LABELS = {
  7: { label: 'Processing',       dot: 'bg-blue-500 animate-pulse', text: 'text-blue-600',    bg: 'bg-blue-50' },
  8: { label: 'Ready for Report', dot: 'bg-violet-500',             text: 'text-violet-600',  bg: 'bg-violet-50' },
  9: { label: 'Completed',        dot: 'bg-emerald-500',            text: 'text-emerald-600', bg: 'bg-emerald-50' },
};

export default function UploadReports() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [summary, setSummary] = useState('');
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchLogs, setDispatchLogs] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const fileRef = useRef();

  const fetchOrders = () => {
    const params = new URLSearchParams({ module: 'uploadreports' });
    if (activeTab !== 'All') params.set('status', activeTab);
    if (search) params.set('search', search);
    fetch(`${API}/api/orders?${params}`)
      .then(r => r.json())
      .then(res => { if (res.success) setOrders(res.data); })
      .catch(() => {});
  };

  useEffect(() => { fetchOrders(); }, [activeTab, search]);

  useEffect(() => {
    if (selectedOrder) {
      setFile(null); setPreview(null); setUploadedUrl(''); setSuccessMsg(''); setError(''); setSummary('');
      fetch(`${API}/api/reports/dispatch-logs/${selectedOrder.id}`)
        .then(r => r.json())
        .then(res => { if (res.success) setDispatchLogs(res.data); })
        .catch(() => setDispatchLogs([]));
    }
  }, [selectedOrder]);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f); setUploadedUrl(''); setSuccessMsg('');
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true); setError('');
    const fd = new FormData();
    fd.append('reportFile', file);
    const res = await fetch(`${API}/api/reports/upload`, { method: 'POST', body: fd })
      .then(r => r.json()).catch(() => null);
    setUploading(false);
    if (res?.success) {
      setUploadedUrl(res.data.fileUrl);
      setSuccessMsg('File uploaded. Please verify and sign the report.');
    } else {
      setError(res?.error || 'Upload failed.');
    }
  };

  const verifyReport = async () => {
    if (!selectedOrder || !uploadedUrl) return;
    setVerifying(true); setError('');
    const res = await fetch(`${API}/api/reports/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lab_order_id: selectedOrder.id, result_summary: summary, file_url: uploadedUrl })
    }).then(r => r.json()).catch(() => null);
    setVerifying(false);
    if (res?.success) {
      setSuccessMsg('✓ Report verified and signed. Order marked as Completed.');
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, demo_step: 9, status: 'Reported' } : o));
      setSelectedOrder(prev => ({ ...prev, demo_step: 9, status: 'Reported' }));
    } else {
      setError(res?.error || 'Verification failed.');
    }
  };

  // Advance from step 7 → 8 (mark Ready for Report)
  const handleAdvanceStep = async () => {
    if (!selectedOrder || selectedOrder.demo_step !== 7) return;
    setAdvancing(true);
    const res = await fetch(`${API}/api/orders/${selectedOrder.id}/advance`, { method: 'PATCH' })
      .then(r => r.json()).catch(() => null);
    setAdvancing(false);
    if (res?.success) {
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, demo_step: 8 } : o));
      setSelectedOrder(prev => ({ ...prev, demo_step: 8 }));
      setSuccessMsg('Order marked as Ready for Report.');
    }
  };

  const sendReport = async (channel) => {
    if (!selectedOrder) return;
    const recipient = channel === 'SMS' ? selectedOrder.patient_phone : (selectedOrder.patient_email || selectedOrder.patient_phone);
    setDispatching(true);
    const res = await fetch(`${API}/api/reports/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lab_order_id: selectedOrder.id, channel, recipient })
    }).then(r => r.json()).catch(() => null);
    setDispatching(false);
    if (res?.success) {
      setDispatchLogs(prev => [res.data, ...prev]);
      setSuccessMsg(`Report dispatched to patient via ${channel}.`);
    }
  };

  const filtered = orders.filter(o => {
    const matchesSearch = !search || o.patient_name.toLowerCase().includes(search.toLowerCase()) || o.id.toString().includes(search);
    return matchesSearch;
  });

  const stats = {
    processing: orders.filter(o => o.demo_step === 7).length,
    ready: orders.filter(o => o.demo_step === 8).length,
    completed: orders.filter(o => o.demo_step === 9).length,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Upload Reports</h2>
        <p className="text-on-surface-variant font-medium mt-1">Upload, verify, and dispatch diagnostic reports to patients (Steps 7–9)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {[
          { icon: 'hourglass_top', bg: 'bg-blue-50',    color: 'text-blue-600',    label: 'Processing',       val: stats.processing },
          { icon: 'description',   bg: 'bg-violet-50',  color: 'text-violet-600',  label: 'Ready for Report', val: stats.ready },
          { icon: 'task_alt',      bg: 'bg-emerald-50', color: 'text-emerald-600', label: 'Completed',        val: stats.completed },
        ].map(s => (
          <div key={s.label} className="bg-surface-white p-5 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className={`p-3 ${s.bg} ${s.color} rounded-xl shrink-0`}>
              <span className="material-symbols-outlined text-2xl">{s.icon}</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-sm font-semibold">{s.label}</p>
              <p className="text-3xl font-bold text-on-surface mt-0.5">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 bg-background-off-white p-1 rounded-xl overflow-x-auto">
          {REPORT_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-lg font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'bg-surface-white text-primary-container shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient or ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-white border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-container/30" />
          </div>
          <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2.5 bg-surface-white border border-outline-variant rounded-xl text-sm font-bold text-on-surface-variant hover:bg-background-off-white">
            <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Order list */}
        <div className="space-y-4">
          <div className="bg-surface-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">list_alt</span>
              <h3 className="font-bold text-on-surface">Select Order</h3>
              <span className="ml-auto text-xs text-on-surface-variant">{filtered.length} orders</span>
            </div>
            <div className="divide-y divide-outline-variant max-h-[400px] overflow-y-auto">
              {filtered.length === 0 && (
                <div className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl block mb-3 opacity-25">inbox</span>
                  <p className="text-sm">No orders in this stage.</p>
                </div>
              )}
              {filtered.map(o => {
                const s = STEP_LABELS[o.demo_step] || STEP_LABELS[7];
                const isSelected = selectedOrder?.id === o.id;
                return (
                  <button key={o.id} onClick={() => setSelectedOrder(o)}
                    className={`w-full text-left px-6 py-4 hover:bg-background-off-white transition-colors ${isSelected ? 'bg-primary-container/5 border-l-4 border-primary-container' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-on-surface">#{String(o.id).padStart(4, '0')} — {o.patient_name}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{(o.test_names || []).join(', ') || '—'}</p>
                      </div>
                      <span className={`flex items-center gap-1 text-[10px] font-bold ${s.text} ${s.bg} px-2 py-0.5 rounded-full`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>
                    {o.assigned_staff && (
                      <p className="text-[11px] text-on-surface-variant mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">person</span>
                        Assigned: {o.assigned_staff}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dispatch Log */}
          {selectedOrder && (
            <div className="bg-surface-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">send</span>
                <h3 className="font-bold text-on-surface">Dispatch Log</h3>
              </div>
              <div className="divide-y divide-outline-variant max-h-36 overflow-y-auto">
                {dispatchLogs.length === 0 && <p className="px-6 py-4 text-sm text-on-surface-variant">No dispatches yet.</p>}
                {dispatchLogs.map(log => (
                  <div key={log.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-on-surface">Via {log.channel} → {log.sent_to}</p>
                      <p className="text-[10px] text-on-surface-variant">{new Date(log.sent_at).toLocaleString()}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{log.status}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 flex gap-3 border-t border-outline-variant">
                <button onClick={() => sendReport('SMS')} disabled={dispatching}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-primary-container text-primary-container font-bold text-sm rounded-xl hover:bg-primary-container hover:text-white transition-all disabled:opacity-60">
                  <span className="material-symbols-outlined text-[18px]">sms</span> Send SMS
                </button>
                <button onClick={() => sendReport('Email')} disabled={dispatching}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-container text-white font-bold text-sm rounded-xl hover:bg-primary transition-all disabled:opacity-60">
                  <span className="material-symbols-outlined text-[18px]">email</span> Send Email
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Upload Panel */}
        <div className="space-y-4">
          {!selectedOrder ? (
            <div className="bg-surface-white rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center h-72 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-3 opacity-30">upload_file</span>
              <p className="font-semibold">Select an order to upload a report</p>
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                selectedOrder.demo_step === 7 ? 'bg-blue-50 border-blue-200' :
                selectedOrder.demo_step === 8 ? 'bg-violet-50 border-violet-200' :
                'bg-emerald-50 border-emerald-200'
              }`}>
                <span className={`material-symbols-outlined ${
                  selectedOrder.demo_step === 7 ? 'text-blue-600' :
                  selectedOrder.demo_step === 8 ? 'text-violet-600' : 'text-emerald-600'
                }`}>
                  {selectedOrder.demo_step === 7 ? 'hourglass_top' : selectedOrder.demo_step === 8 ? 'description' : 'task_alt'}
                </span>
                <div className="flex-1">
                  <p className={`text-xs font-bold ${
                    selectedOrder.demo_step === 7 ? 'text-blue-800' :
                    selectedOrder.demo_step === 8 ? 'text-violet-800' : 'text-emerald-800'
                  }`}>
                    {STEP_LABELS[selectedOrder.demo_step]?.label} — Step {selectedOrder.demo_step}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">Order #{String(selectedOrder.id).padStart(4,'0')} · {selectedOrder.patient_name}</p>
                </div>

                {/* Mark Ready for Report button (step 7 only) */}
                {selectedOrder.demo_step === 7 && (
                  <button onClick={handleAdvanceStep} disabled={advancing}
                    className="text-xs font-bold bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60">
                    {advancing ? '...' : 'Mark Ready'}
                  </button>
                )}
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
                className={`bg-surface-white rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center py-12 px-6 text-center ${dragOver ? 'border-primary-container bg-primary-container/5' : 'border-outline-variant hover:border-primary-container hover:bg-background-off-white'}`}
              >
                <input type="file" ref={fileRef} className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={e => handleFile(e.target.files[0])} />
                {file ? (
                  <>
                    <span className="material-symbols-outlined text-5xl text-primary-container mb-3">description</span>
                    <p className="font-bold text-on-surface">{file.name}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{(file.size / 1024).toFixed(1)} KB — Click to replace</p>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-5xl text-primary-container/40 mb-3">upload_file</span>
                    <p className="font-bold text-on-surface">Drop PDF or Image here</p>
                    <p className="text-xs text-on-surface-variant mt-1">or click to browse · Max 10MB</p>
                  </>
                )}
              </div>

              {/* Preview */}
              {preview && (
                <div className="bg-surface-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
                  <div className="px-6 py-3 border-b border-outline-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-[18px]">preview</span>
                    <h3 className="font-bold text-sm text-on-surface">Report Preview</h3>
                  </div>
                  <div className="p-4">
                    <img src={preview} alt="Report Preview" className="w-full rounded-xl max-h-60 object-contain bg-background-off-white" />
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-surface-white rounded-2xl border border-outline-variant shadow-sm p-6">
                <label className="block text-sm font-bold text-on-surface mb-2">
                  Result Summary <span className="text-subtle-gray font-normal">(optional)</span>
                </label>
                <textarea
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="e.g., CBC — All values within normal range. HbA1c: 5.4% (Normal)"
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container outline-none resize-none h-28"
                />
              </div>

              {/* Messages */}
              {error && <p className="text-xs text-error bg-error-container/30 px-4 py-3 rounded-xl">{error}</p>}
              {successMsg && <p className="text-xs text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl font-semibold">{successMsg}</p>}

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={uploadFile} disabled={!file || uploading || !!uploadedUrl}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface-white border border-primary-container text-primary-container font-bold text-sm rounded-xl hover:bg-primary-container/10 transition-all disabled:opacity-50">
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  {uploading ? 'Uploading...' : uploadedUrl ? 'Uploaded ✓' : 'Upload File'}
                </button>
                <button onClick={verifyReport} disabled={!uploadedUrl || verifying || selectedOrder?.demo_step === 9}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-container text-white font-bold text-sm rounded-xl hover:bg-primary transition-all disabled:opacity-50 shadow-md hover:shadow-lg">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  {verifying ? 'Signing...' : selectedOrder?.demo_step === 9 ? 'Signed ✓' : 'Verify & Sign'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
