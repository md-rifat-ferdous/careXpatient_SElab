import { useState, useEffect, useCallback } from 'react';
import DetailsModal from '../components/DetailsModal';
import TestQueueRow from '../components/TestQueueRow';
import {
  fetchOrders as demoFetchOrders,
  acceptOrder as demoAcceptOrder,
  rejectOrder as demoRejectOrder,
  restoreOrder as demoRestoreOrder,
  createManualEntry as demoCreateManualEntry,
  getAllTests as demoGetAllTests,
  assignStaff as demoAssignStaff,
} from '../store/demoData';

// TestQueue only shows: 0=Rejected, 1=New Request, 2=Accepted
const TABS = ['All', 'New Requests', 'Accepted', 'Rejected'];

const REJECTION_REASONS = [
  'Duplicate request',
  'Incomplete documentation',
  'Doctor prescription invalid',
  'Patient not eligible',
  'Test not available',
  'Insurance / payment issue',
  'Other',
];

// ─── Rejection Modal ──────────────────────────────────────────────────────────
function RejectionModal({ order, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (!reason) { setErr('Please select a rejection reason.'); return; }
    setErr('');
    setSubmitting(true);
    await onConfirm(order.id, reason, note);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-surface-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-600 text-[20px]">cancel</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-sm">Reject Request</h3>
              <p className="text-xs text-on-surface-variant">#{String(order.id).padStart(4, '0')} · {order.patient_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-on-surface-variant hover:bg-red-100 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {err && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl font-medium">{err}</p>
          )}

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {REJECTION_REASONS.map(r => (
                <label key={r} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${reason === r ? 'border-red-400 bg-red-50' : 'border-outline-variant hover:bg-background-off-white'}`}>
                  <input
                    type="radio"
                    name="rejection_reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-red-500"
                  />
                  <span className="text-sm font-medium text-on-surface">{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Additional Note <span className="text-on-surface-variant font-normal">(Optional)</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Provide additional context for the patient or staff..."
              rows={3}
              className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none resize-none bg-background-off-white/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3 bg-background-off-white/30">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-background-off-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">cancel</span>
            {submitting ? 'Rejecting...' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Manual Entry Modal ───────────────────────────────────────────────────────
function ManualEntryModal({ tests, onClose, onSuccess }) {
  const [form, setForm] = useState({
    patient_name: '', patient_phone: '', patient_email: '',
    test_ids: [], home_collection: false, collection_address: '', collection_slot: ''
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const toggle = (id) => setForm(f => ({
    ...f, test_ids: f.test_ids.includes(id) ? f.test_ids.filter(x => x !== id) : [...f.test_ids, id]
  }));

  const submit = async () => {
    if (!form.patient_name || !form.patient_phone || form.test_ids.length === 0) {
      setErr('Name, phone, and at least one test are required.');
      return;
    }
    setSaving(true); setErr('');
    const res = await demoCreateManualEntry(form);
    setSaving(false);
    if (res?.success) { onSuccess(); onClose(); }
    else setErr(res?.error || 'Failed to create entry.');
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant">
          <h3 className="font-bold text-lg text-on-surface">Manual Entry</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {err && <p className="text-xs text-error bg-error-container/30 p-3 rounded-xl">{err}</p>}
          {[['Patient Name *', 'patient_name', 'text'], ['Phone *', 'patient_phone', 'tel'], ['Email', 'patient_email', 'email']].map(([label, key, type]) => (
            <div key={key}>
              <label className="text-xs font-semibold text-on-surface-variant">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="mt-1 w-full border border-outline-variant rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container focus:border-transparent outline-none" />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-on-surface-variant">Select Tests *</label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border border-outline-variant rounded-xl p-3">
              {tests.map(t => (
                <label key={t.id} className="flex items-center gap-3 cursor-pointer hover:bg-background-off-white rounded-lg px-1 py-0.5">
                  <input type="checkbox" checked={form.test_ids.includes(t.id)} onChange={() => toggle(t.id)} className="accent-primary-container rounded" />
                  <span className="text-sm text-on-surface">{t.name}</span>
                  <span className="ml-auto text-xs text-primary-container font-semibold">৳{t.price}</span>
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.home_collection} onChange={e => setForm(f => ({ ...f, home_collection: e.target.checked }))} className="accent-primary-container rounded" />
            <span className="text-sm font-semibold text-on-surface">Home Collection (+৳150)</span>
          </label>
          {form.home_collection && (
            <div>
              <label className="text-xs font-semibold text-on-surface-variant">Collection Address</label>
              <input type="text" value={form.collection_address} onChange={e => setForm(f => ({ ...f, collection_address: e.target.value }))}
                className="mt-1 w-full border border-outline-variant rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container outline-none" />
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-background-off-white">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-5 py-2 rounded-xl bg-primary-container text-white text-sm font-bold hover:bg-primary transition-colors disabled:opacity-60">
            {saving ? 'Creating...' : 'Create Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TestQueue Page ───────────────────────────────────────────────────────────
export default function TestQueue() {
  const [orders, setOrders] = useState([]);
  const [tests, setTests] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const status = activeTab === 'All' ? null : activeTab;
    demoFetchOrders('testqueue', status, search)
      .then(res => { if (res.success) setOrders(res.data); })
      .finally(() => setLoading(false));
  }, [activeTab, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => {
    demoGetAllTests(null, '').then(res => { if (res.success) setTests(res.data); });
  }, []);

  const refreshSelectedOrder = async (id) => {
    const res = await demoFetchOrders('testqueue', null, String(id));
    if (res?.success) {
      const found = res.data.find(o => o.id === id);
      if (found) setSelectedOrder(found);
    }
  };

  const handleAccept = async (id) => {
    setUpdatingId(id);
    await demoAcceptOrder(id);
    setUpdatingId(null);
    fetchOrders();
    showToast('Request accepted — moved to Sample Collection queue');
  };

  const handleRejectClick = (order) => {
    setRejectTarget(order);
  };

  const handleRejectConfirm = async (id, reason, note) => {
    const res = await demoRejectOrder(id, reason, note);
    if (res?.success) {
      fetchOrders();
      showToast('Request rejected and reason saved', 'error');
    } else {
      showToast(res?.error || 'Rejection failed', 'error');
    }
  };

  const handleModalAdvance = async (id) => {
    await demoAcceptOrder(id);
    await refreshSelectedOrder(id);
    fetchOrders();
    showToast('Workflow advanced to next step');
  };

  const handleModalAssign = async (id, staffName) => {
    await demoAssignStaff(id, staffName);
    await refreshSelectedOrder(id);
    fetchOrders();
    showToast(`${staffName} has been assigned`);
  };

  const handleModalReject = async (id, reason, note) => {
    const res = await demoRejectOrder(id, reason, note);
    if (res?.success) {
      await refreshSelectedOrder(id);
      fetchOrders();
      showToast('Request rejected and reason saved', 'error');
    }
  };

  const handleRestore = async (id) => {
    setUpdatingId(id);
    const res = await demoRestoreOrder(id);
    setUpdatingId(null);
    if (res?.success) {
      if (selectedOrder && selectedOrder.id === id) {
        await refreshSelectedOrder(id);
      }
      fetchOrders();
      showToast('Order restored to New Requests queue successfully');
    } else {
      showToast(res?.error || 'Restore failed', 'error');
    }
  };

  const openDetails = (order) => setSelectedOrder(order);
  const closeDetails = () => setSelectedOrder(null);

  // Stats for this module only
  const newCount = orders.filter(o => o.demo_step === 1).length;
  const acceptedCount = orders.filter(o => o.demo_step === 2).length;
  const rejectedCount = orders.filter(o => o.demo_step === 0).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">

      {/* Modals */}
      {showManualModal && (
        <ManualEntryModal tests={tests} onClose={() => setShowManualModal(false)} onSuccess={fetchOrders} />
      )}
      {selectedOrder && (
        <DetailsModal
          order={selectedOrder}
          module="testqueue"
          onClose={closeDetails}
          onAdvance={handleModalAdvance}
          onAssignStaff={handleModalAssign}
          onReject={handleModalReject}
          onRestore={handleRestore}
        />
      )}
      {rejectTarget && (
        <RejectionModal
          order={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleRejectConfirm}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold transition-all ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
          <span className="material-symbols-outlined text-[18px]">{toast.type === 'error' ? 'cancel' : 'check_circle'}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Test Queue</h2>
          <p className="text-on-surface-variant font-medium mt-1">Review, accept, or reject incoming diagnostic requests</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-white border border-outline-variant rounded-2xl text-sm font-semibold shadow-sm hover:shadow transition-all">
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </button>
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-container text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Manual Entry
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          { icon: 'pending_actions', bg: 'bg-amber-50',   color: 'text-amber-600',   label: 'New Requests', badge: 'Action Required', val: newCount },
          { icon: 'check_circle',   bg: 'bg-teal-50',    color: 'text-teal-600',    label: 'Accepted',     badge: 'Moved to Collection', val: acceptedCount },
          { icon: 'cancel',         bg: 'bg-red-50',     color: 'text-red-600',     label: 'Rejected',     badge: 'This session', val: rejectedCount },
        ].map(s => (
          <div key={s.label} className="bg-surface-white p-5 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 ${s.bg} ${s.color} rounded-xl`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 ${s.bg} ${s.color} rounded-full`}>{s.badge}</span>
            </div>
            <p className="text-on-surface-variant text-sm font-semibold">{s.label}</p>
            <p className="text-3xl font-bold mt-1 text-on-surface">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-white rounded-t-2xl border-x border-t border-outline-variant">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 pt-4 border-b border-outline-variant gap-4">
          <div className="flex gap-6 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab
                  ? 'border-b-2 border-primary-container text-primary-container font-semibold'
                  : 'text-on-surface-variant hover:text-primary-container'}`}
              >
                {tab}
                {tab === 'Rejected' && rejectedCount > 0 && (
                  <span className="ml-1.5 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">{rejectedCount}</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 pb-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search ID or Name"
                className="pl-10 pr-4 py-2 border border-outline-variant rounded-xl text-sm w-56 focus:ring-2 focus:ring-primary-container focus:border-transparent outline-none"
              />
            </div>
            <button onClick={fetchOrders} className="p-2 border border-outline-variant rounded-xl text-on-surface-variant hover:bg-background-off-white">
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface-white border border-outline-variant border-t-0 rounded-b-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">refresh</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-off-white text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Patient & Tests</th>
                <th className="px-6 py-4">Collection</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {orders.map(o => (
                <TestQueueRow
                  key={o.id}
                  order={o}
                  onDetails={openDetails}
                  onAccept={handleAccept}
                  onReject={handleRejectClick}
                  onRestore={handleRestore}
                  updatingId={updatingId}
                />
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-14 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">inbox</span>
                  No orders found for this filter.
                </td></tr>
              )}
            </tbody>
          </table>
        )}
        <div className="flex items-center justify-between px-6 py-4 bg-background-off-white/50 border-t border-outline-variant">
          <p className="text-xs font-medium text-on-surface-variant">
            Showing <span className="font-bold text-on-surface">{orders.length}</span> orders
          </p>
          <p className="text-xs text-on-surface-variant">
            Click <span className="font-bold">Details</span> for full order view · Accept or Reject from the action buttons
          </p>
        </div>
      </div>
    </div>
  );
}
