import { useState, useEffect, useRef } from 'react';
import { fetchUploadOrders, advanceOrderStep, completeReport } from '../store/demoData';

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
  const [dragOver, setDragOver] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const fileRef = useRef();

  const fetchOrders = () => {
    fetchUploadOrders(activeTab, search)
      .then(res => { if (res.success) setOrders(res.data); })
      .catch(() => {});
  };

  useEffect(() => { fetchOrders(); }, [activeTab, search]);

  useEffect(() => {
    if (selectedOrder) {
      setFile(null); setPreview(null); setUploadedUrl(''); setSuccessMsg(''); setError(''); setSummary('');
    }
  }, [selectedOrder]);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f); setUploadedUrl(''); setSuccessMsg(''); setError('');
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
    await new Promise(r => setTimeout(r, 500));
    setUploading(false);
    setUploadedUrl(`/reports/report_${selectedOrder.id}.pdf`);
    setSuccessMsg('File uploaded. Please verify and sign the report.');
  };

  const verifyReport = async () => {
    if (!selectedOrder || !uploadedUrl) return;
    setVerifying(true); setError('');
    const res = await completeReport(selectedOrder.id, summary);
    setVerifying(false);
    if (res?.success) {
      setSuccessMsg('✓ Report verified and signed. Order marked as Completed.');
      const updatedOrder = { ...selectedOrder, demo_step: 9, status: 'Completed' };
      setSelectedOrder(updatedOrder);
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updatedOrder : o));
    } else {
      setError(res?.error || 'Verification failed.');
    }
  };

  const handleAdvanceStep = async () => {
    if (!selectedOrder || selectedOrder.demo_step !== 7) return;
    setAdvancing(true);
    const res = await advanceOrderStep(selectedOrder.id);
    setAdvancing(false);
    if (res?.success) {
      const updatedOrder = { ...selectedOrder, demo_step: 8, status: 'Ready for Report' };
      setSelectedOrder(updatedOrder);
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updatedOrder : o));
      setSuccessMsg('Order marked as Ready for Report.');
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

      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Upload Reports</h2>
        <p className="text-on-surface-variant font-medium mt-1">Upload, verify, and dispatch diagnostic reports to patients (Steps 7–9)</p>
      </div>

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
        </div>

        <div className="space-y-4">
          {!selectedOrder ? (
            <div className="bg-surface-white rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center h-72 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-3 opacity-30">upload_file</span>
              <p className="font-semibold">Select an order to upload a report</p>
            </div>
          ) : (
            <>
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

                {selectedOrder.demo_step === 7 && (
                  <button onClick={handleAdvanceStep} disabled={advancing}
                    className="text-xs font-bold bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60">
                    {advancing ? '...' : 'Mark Ready'}
                  </button>
                )}
              </div>

              {(selectedOrder.demo_step === 8 || selectedOrder.demo_step === 7) && (
                <>
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
                    ) : uploadedUrl ? (
                      <>
                        <span className="material-symbols-outlined text-5xl text-emerald-500 mb-3">check_circle</span>
                        <p className="font-bold text-on-surface">Report uploaded successfully</p>
                        <p className="text-xs text-on-surface-variant mt-1">Proceed to Verify & Sign</p>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-5xl text-primary-container/40 mb-3">upload_file</span>
                        <p className="font-bold text-on-surface">Drop PDF or Image here</p>
                        <p className="text-xs text-on-surface-variant mt-1">or click to browse · Max 10MB</p>
                      </>
                    )}
                  </div>

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

                  {error && <p className="text-xs text-error bg-error-container/30 px-4 py-3 rounded-xl">{error}</p>}
                  {successMsg && <p className="text-xs text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl font-semibold">{successMsg}</p>}

                  {selectedOrder.demo_step !== 9 && (
                    <div className="flex gap-3">
                      <button onClick={uploadFile} disabled={!file || uploading || !!uploadedUrl}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface-white border border-primary-container text-primary-container font-bold text-sm rounded-xl hover:bg-primary-container/10 transition-all disabled:opacity-50">
                        <span className="material-symbols-outlined text-[18px]">upload</span>
                        {uploading ? 'Uploading...' : uploadedUrl ? 'Uploaded ✓' : 'Upload File'}
                      </button>
                      <button onClick={verifyReport} disabled={!uploadedUrl || verifying}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-container text-white font-bold text-sm rounded-xl hover:bg-primary transition-all disabled:opacity-50 shadow-md hover:shadow-lg">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        {verifying ? 'Signing...' : 'Verify & Sign'}
                      </button>
                    </div>
                  )}
                </>
              )}

              {selectedOrder.demo_step === 9 && (
                <div className="bg-surface-white rounded-2xl border border-emerald-200 bg-emerald-50/30 flex flex-col items-center justify-center py-16 text-center">
                  <span className="material-symbols-outlined text-6xl text-emerald-500 mb-4">task_alt</span>
                  <h3 className="text-xl font-bold text-emerald-800 mb-1">Report Completed</h3>
                  <p className="text-sm text-emerald-600">This report has been verified and dispatched.</p>
                  <p className="text-xs text-on-surface-variant mt-3">Order #{String(selectedOrder.id).padStart(4, '0')} · {selectedOrder.patient_name}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
