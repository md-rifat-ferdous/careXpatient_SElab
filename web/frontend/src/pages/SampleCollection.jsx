import { useState, useEffect, useCallback } from 'react';
import DetailsModal from '../components/DetailsModal';
import SampleCollectionRow from '../components/SampleCollectionRow';

const API = 'http://localhost:5000';

// SampleCollection owns steps 3 (Assigned), 4 (Arrived), 5 (Collected), 6 (Delivered)
const COLLECTION_TABS = ['All', 'Home Collection', 'In-Lab', 'Pending', 'Collected', 'Urgent', 'Overdue'];

const STAFF_LIST = ['Kamal Hossain', 'Rashedul Islam', 'Farhana Yasmin', 'Dr. S. Rahman'];

const PATIENT_AVATARS = [
  '/assets/4bd37d2d183662ae6e8134b5c5dd7463.png',
  '/assets/e7b2f880878a62318682e68ff12cea28.png',
  '/assets/a524dd9f1541c95195021849ce900b27.png',
  '/assets/8b050976103bda6b4905d66fb1351961.png',
];

// ─── Quick-assign modal (inline) ─────────────────────────────────────────────
function AssignModal({ order, onClose, onConfirm }) {
  const [staff, setStaff] = useState('');
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!staff) return;
    setSaving(true);
    await onConfirm(order.id, staff);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-surface-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
          <div>
            <h3 className="font-bold text-on-surface">Assign Collector</h3>
            <p className="text-xs text-on-surface-variant">{order.patient_name} · #{String(order.id).padStart(4, '0')}</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="px-6 py-5 space-y-3">
          {STAFF_LIST.map(s => (
            <label key={s} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${staff === s ? 'border-primary-container bg-primary-container/5' : 'border-outline-variant hover:bg-background-off-white'}`}>
              <input type="radio" name="staff" value={s} checked={staff === s} onChange={() => setStaff(s)} className="accent-primary-container" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary-container/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary-container">{s.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                </div>
                <span className="text-sm font-semibold text-on-surface">{s}</span>
              </div>
            </label>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border border-outline-variant rounded-xl text-on-surface-variant hover:bg-background-off-white">Cancel</button>
          <button onClick={handleConfirm} disabled={!staff || saving} className="px-5 py-2 text-sm font-bold bg-primary-container text-white rounded-xl hover:bg-primary disabled:opacity-60 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            {saving ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SampleCollection Page ────────────────────────────────────────────────────
export default function SampleCollection() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ module: 'samplecollection' });
    if (activeTab !== 'All') params.set('status', activeTab);
    if (search) params.set('search', search);
    fetch(`${API}/api/orders?${params}`)
      .then(r => r.json())
      .then(res => { if (res.success) setOrders(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const refreshSelectedOrder = async (id) => {
    const params = new URLSearchParams({ module: 'samplecollection', search: id });
    const res = await fetch(`${API}/api/orders?${params}`).then(r => r.json()).catch(() => null);
    if (res?.success) {
      const found = res.data.find(o => o.id === id);
      if (found) setSelectedOrder(found);
    }
  };

  // Advance from table row quick actions (steps 3→4, 4→5, 5→6)
  const advanceStep = async (id, currentStep) => {
    setUpdatingId(id);
    await fetch(`${API}/api/orders/${id}/advance`, { method: 'PATCH' });
    setUpdatingId(null);
    fetchOrders();
    const labels = { 3: 'Collector marked as arrived', 4: 'Sample collected', 5: 'Delivered to lab — moved to Upload Reports' };
    showToast(labels[currentStep] || 'Collection status updated');
  };

  // Assign staff from inline AssignModal
  const handleAssignConfirm = async (id, staffName) => {
    await fetch(`${API}/api/orders/${id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staff_name: staffName }),
    });
    fetchOrders();
    showToast(`${staffName} assigned as collector`);
  };

  // Called from inside DetailsModal
  const handleModalAdvance = async (id) => {
    await fetch(`${API}/api/orders/${id}/advance`, { method: 'PATCH' });
    await refreshSelectedOrder(id);
    fetchOrders();
    showToast('Workflow advanced to next step');
  };

  const handleModalAssign = async (id, staffName) => {
    await fetch(`${API}/api/orders/${id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staff_name: staffName }),
    });
    await refreshSelectedOrder(id);
    fetchOrders();
    showToast(`${staffName} has been assigned`);
  };

  // Client-side filter for tabs not handled by backend
  const filtered = orders.filter(o => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Home Collection') return o.home_collection;
    if (activeTab === 'In-Lab') return !o.home_collection;
    if (activeTab === 'Pending') return [3, 4].includes(o.demo_step);
    if (activeTab === 'Collected') return [5, 6].includes(o.demo_step);
    if (activeTab === 'Urgent') return o.home_collection && [3, 4].includes(o.demo_step);
    if (activeTab === 'Overdue') {
      const ageHrs = (Date.now() - new Date(o.created_at).getTime()) / 3600000;
      return ageHrs > 24;
    }
    return true;
  });

  const stats = {
    pending:   orders.filter(o => [3, 4].includes(o.demo_step)).length,
    home:      orders.filter(o => o.home_collection).length,
    collected: orders.filter(o => [5, 6].includes(o.demo_step)).length,
    overdue:   orders.filter(o => {
      const ageHrs = (Date.now() - new Date(o.created_at).getTime()) / 3600000;
      return ageHrs > 24;
    }).length,
  };

  const openDetails = (order) => setSelectedOrder(order);
  const closeDetails = () => setSelectedOrder(null);

  return (
    <div className="min-h-screen bg-background-off-white">

      {/* Modals */}
      {selectedOrder && (
        <DetailsModal
          order={selectedOrder}
          module="samplecollection"
          onClose={closeDetails}
          onAdvance={handleModalAdvance}
          onAssignStaff={handleModalAssign}
        />
      )}
      {assignTarget && (
        <AssignModal
          order={assignTarget}
          onClose={() => setAssignTarget(null)}
          onConfirm={handleAssignConfirm}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold transition-all ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
          <span className="material-symbols-outlined text-[18px]">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-surface-white border-b border-outline-variant px-8 py-6 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Sample Collection</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">Manage collector assignments and sample logistics (Steps 3–6)</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:bg-background-off-white rounded-full transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            {stats.overdue > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white" />
            )}
          </button>
          <div className="h-10 w-10 rounded-full bg-primary-container/20 flex items-center justify-center border border-primary-container/30">
            <span className="text-primary font-bold text-sm">DR</span>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: 'pending_actions', bg: 'bg-amber-50',   color: 'text-amber-600',   badge: 'Action Needed', label: 'Pending Assignment', val: stats.pending },
            { icon: 'home_health',     bg: 'bg-blue-50',    color: 'text-blue-600',    badge: 'Today',         label: 'Home Requests',      val: stats.home },
            { icon: 'check_circle',    bg: 'bg-emerald-50', color: 'text-emerald-600', badge: 'Goal: 50',       label: 'Samples Collected',  val: stats.collected },
            { icon: 'schedule',        bg: 'bg-red-50',     color: 'text-red-600',     badge: stats.overdue > 0 ? 'Attention!' : 'All Good', label: 'Overdue (>24h)', val: stats.overdue },
          ].map(s => (
            <div key={s.label} className="bg-surface-white p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 ${s.bg} rounded-lg ${s.color}`}>
                  <span className="material-symbols-outlined">{s.icon}</span>
                </div>
                <span className={`text-xs font-bold ${s.color}`}>{s.badge}</span>
              </div>
              <p className="text-on-surface-variant text-sm font-medium">{s.label}</p>
              <p className="text-3xl font-bold text-on-surface mt-1">{s.val}</p>
            </div>
          ))}
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-background-off-white p-1 rounded-xl w-fit overflow-x-auto gap-1">
            {COLLECTION_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm rounded-lg font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'bg-surface-white text-primary-container shadow-sm font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {tab}
                {tab === 'Overdue' && stats.overdue > 0 && (
                  <span className="ml-1.5 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">{stats.overdue}</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative min-w-[280px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patient, phone..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container outline-none text-sm"
              />
            </div>
            <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant bg-surface-white text-on-surface-variant rounded-xl text-sm font-bold hover:bg-background-off-white transition-colors">
              <span className="material-symbols-outlined">refresh</span> Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <span className="material-symbols-outlined animate-spin text-primary-container text-4xl">refresh</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background-off-white border-b border-outline-variant">
                    {['Patient Details', 'Test & Type', 'Schedule', 'Assigned Staff', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filtered.map((o, idx) => (
                    <SampleCollectionRow
                      key={o.id}
                      order={o}
                      onDetails={openDetails}
                      onAdvance={advanceStep}
                      onAssign={(order) => setAssignTarget(order)}
                      updatingId={updatingId}
                      avatar={o.patient_photo || PATIENT_AVATARS[idx % PATIENT_AVATARS.length]}
                    />
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-14 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">science</span>
                      No collection tasks found for this filter.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between bg-background-off-white/30">
            <p className="text-xs text-on-surface-variant font-medium">
              Showing <span className="text-on-surface font-bold">{filtered.length}</span> of <span className="text-on-surface font-bold">{orders.length}</span> collections
            </p>
            <p className="text-xs text-on-surface-variant">
              Click <span className="material-symbols-outlined text-[14px] align-text-bottom">visibility</span> to open workflow view
            </p>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => showToast('New collection requests arrive via Test Queue → Accept', 'success')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary-container text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
      >
        <span className="material-symbols-outlined text-2xl">info</span>
        <span className="absolute right-full mr-4 bg-on-surface text-surface-white px-3 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Accepted orders from Test Queue appear here
        </span>
      </button>
    </div>
  );
}
