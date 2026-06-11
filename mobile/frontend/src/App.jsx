import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './api';
import './index.css';

// ── Constants ────────────────────────────────────────────────────────────────
const STAFF_LIST = ['Kamal Hossain', 'Rashedul Islam', 'Farhana Yasmin', 'Dr. S. Rahman'];
const REJECT_REASONS = [
  'Incomplete documentation',
  'Duplicate request',
  'Invalid prescription',
  'Patient not reachable',
  'Test not available',
];

const WORKFLOW_STEPS = [
  { step: 1, label: 'New Request',       icon: 'inbox'             },
  { step: 2, label: 'Accepted by Lab',   icon: 'check_circle'      },
  { step: 3, label: 'Collector Assigned',icon: 'person_pin'        },
  { step: 4, label: 'Collector Arrived', icon: 'location_on'       },
  { step: 5, label: 'Sample Collected',  icon: 'science'           },
  { step: 6, label: 'Delivered to Lab',  icon: 'local_shipping'    },
  { step: 7, label: 'Processing',        icon: 'biotech'           },
  { step: 8, label: 'Report Ready',      icon: 'description'       },
  { step: 9, label: 'Completed',         icon: 'task_alt'          },
];

const STEP_LABEL = {
  0: { label: 'Rejected',    color: '#dc2626', bg: '#fef2f2', icon: 'cancel'       },
  1: { label: 'New Request', color: '#d97706', bg: '#fffbeb', icon: 'inbox'        },
  2: { label: 'Accepted',    color: '#0284c7', bg: '#f0f9ff', icon: 'check_circle' },
  3: { label: 'Assigned',    color: '#7c3aed', bg: '#f5f3ff', icon: 'person_pin'   },
  4: { label: 'Arrived',     color: '#0891b2', bg: '#ecfeff', icon: 'location_on'  },
  5: { label: 'Collected',   color: '#16a34a', bg: '#f0fdf4', icon: 'science'      },
  6: { label: 'Delivered',   color: '#15803d', bg: '#dcfce7', icon: 'local_shipping'},
  7: { label: 'Processing',  color: '#2563eb', bg: '#eff6ff', icon: 'biotech'      },
  8: { label: 'Ready',       color: '#7c3aed', bg: '#f5f3ff', icon: 'description'  },
  9: { label: 'Completed',   color: '#16a34a', bg: '#f0fdf4', icon: 'task_alt'     },
};

const ACCENT_COLOR = {
  0: '#dc2626', 1: '#d97706', 2: '#0284c7', 3: '#7c3aed',
  4: '#0891b2', 5: '#16a34a', 6: '#15803d', 7: '#2563eb',
  8: '#7c3aed', 9: '#16a34a',
};

// ── Helper: format time ago ──────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isOverdue(dateStr) {
  return (Date.now() - new Date(dateStr).getTime()) > 24 * 3600 * 1000;
}

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ step }) {
  const s = STEP_LABEL[step] || STEP_LABEL[1];
  return (
    <span className="status-badge" style={{ color: s.color, background: s.bg }}>
      <span className="material-symbols-outlined">{s.icon}</span>
      {s.label}
    </span>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const cls = toast.type === 'error' ? 'toast toast--error' : toast.type === 'info' ? 'toast toast--info' : 'toast toast--success';
  const icon = toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'check_circle';
  return (
    <div className={cls}>
      <span className="material-symbols-outlined">{icon}</span>
      {toast.msg}
    </div>
  );
}

// ── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, onTap, module }) {
  const step = order.demo_step ?? 1;
  const overdue = isOverdue(order.created_at) && step !== 0 && step !== 9;
  const tests = order.test_names || [];
  const showTests = tests.slice(0, 2);
  const extra = tests.length - 2;

  return (
    <div
      className={`order-card${step === 0 ? ' rejected' : ''}`}
      onClick={() => onTap(order)}
    >
      {/* Accent strip */}
      <div className="order-card__accent" style={{ background: ACCENT_COLOR[step] }} />

      {/* Header */}
      <div className="order-card__header" style={{ paddingLeft: 10 }}>
        <div>
          <div className="order-card__id-row">
            <span className="order-card__id">#{String(order.id).padStart(4, '0')}</span>
            {order.home_collection && <span className="order-card__home-tag">🏠 Home</span>}
            {overdue && <span className="overdue-pill"><span className="material-symbols-outlined">schedule</span>Overdue</span>}
          </div>
          <p className="order-card__name">{order.patient_name}</p>
          <p className="order-card__phone">{order.patient_phone}</p>
        </div>
        <StatusBadge step={step} />
      </div>

      {/* Tests */}
      {showTests.length > 0 && (
        <div className="order-card__tests" style={{ paddingLeft: 10 }}>
          {showTests.map((t, i) => <span key={i} className="test-chip">{t}</span>)}
          {extra > 0 && <span className="test-chip-more">+{extra} more</span>}
        </div>
      )}

      {/* Rejection note */}
      {step === 0 && order.rejection_reason && (
        <div className="rejection-info" style={{ marginLeft: 10, marginRight: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle' }}>info</span>{' '}
          {order.rejection_reason}
        </div>
      )}

      {/* Footer */}
      <div className="order-card__footer" style={{ paddingLeft: 10 }}>
        <div className="order-card__meta">
          <span className="order-card__meta-item">
            <span className="material-symbols-outlined">schedule</span>
            {timeAgo(order.created_at)}
          </span>
          {order.assigned_staff && (
            <span className="order-card__meta-item">
              <span className="material-symbols-outlined">person</span>
              {order.assigned_staff.split(' ')[0]}
            </span>
          )}
        </div>
        <span className="order-card__amount">৳ {parseFloat(order.total_amount).toFixed(0)}</span>
      </div>
    </div>
  );
}

// ── Details Modal ─────────────────────────────────────────────────────────────
function DetailsModal({ order, module, onClose, onRefresh, showToast }) {
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('details'); // 'details' | 'assign' | 'reject'
  const [selectedStaff, setSelectedStaff] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const step = order.demo_step ?? 1;

  const handleAdvance = async () => {
    setSaving(true);
    try {
      const res = await api.advance(order.id);
      if (res.success) {
        onRefresh();
        showToast('Status advanced successfully');
        onClose();
      } else {
        showToast(res.error || 'Failed to advance', 'error');
      }
    } finally { setSaving(false); }
  };

  const handleAssign = async () => {
    if (!selectedStaff) return;
    setSaving(true);
    try {
      const res = await api.assign(order.id, selectedStaff);
      if (res.success) {
        onRefresh();
        showToast(`${selectedStaff} assigned`);
        onClose();
      } else {
        showToast(res.error || 'Assignment failed', 'error');
      }
    } finally { setSaving(false); }
  };

  const handleReject = async () => {
    if (!rejectReason) return;
    setSaving(true);
    try {
      const res = await api.reject(order.id, rejectReason, rejectNote);
      if (res.success) {
        onRefresh();
        showToast('Order rejected');
        onClose();
      } else {
        showToast(res.error || 'Rejection failed', 'error');
      }
    } finally { setSaving(false); }
  };

  const handleRestore = async () => {
    setSaving(true);
    try {
      const res = await api.restore(order.id);
      if (res.success) {
        onRefresh();
        showToast('Order restored to New Request');
        onClose();
      } else {
        showToast(res.error || 'Restore failed', 'error');
      }
    } finally { setSaving(false); }
  };

  // Advance label by context
  const advanceLabel = {
    1: 'Accept Order',
    2: 'Advance to Step 3',
    3: 'Mark Arrived',
    4: 'Mark Collected',
    5: 'Mark Delivered',
    6: 'Mark Processing',
    7: 'Mark Ready',
    8: 'Mark Completed',
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />

        {/* Header */}
        <div className="modal-header">
          <div>
            <p className="modal-title">{order.patient_name}</p>
            <p className="modal-subtitle">
              Order #{String(order.id).padStart(4, '0')} · <StatusBadge step={step} />
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ border: 'none', background: 'var(--surface-2)' }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tab switcher (only on details view) */}
        {view === 'details' && (
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {['Order Info', 'Workflow'].map(tab => (
              <button
                key={tab}
                onClick={() => {}}
                style={{
                  flex: 1, padding: '10px 0', fontSize: '0.8rem', fontWeight: 700,
                  color: tab === 'Order Info' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: tab === 'Order Info' ? '2px solid var(--primary)' : '2px solid transparent',
                  background: 'none',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="modal-body">

          {/* ── Details view ── */}
          {view === 'details' && (
            <>
              <div className="detail-section">
                <p className="detail-section__title">Patient</p>
                <div className="detail-row">
                  <span className="detail-row__key">Name</span>
                  <span className="detail-row__val">{order.patient_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-row__key">Phone</span>
                  <span className="detail-row__val">{order.patient_phone}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-row__key">Type</span>
                  <span className="detail-row__val">{order.home_collection ? '🏠 Home Collection' : '🏥 Lab Visit'}</span>
                </div>
                {order.collection_address && (
                  <div className="detail-row">
                    <span className="detail-row__key">Address</span>
                    <span className="detail-row__val">{order.collection_address}</span>
                  </div>
                )}
                {order.collection_slot && (
                  <div className="detail-row">
                    <span className="detail-row__key">Slot</span>
                    <span className="detail-row__val">{String(order.collection_slot).slice(0, 5)}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <p className="detail-section__title">Tests</p>
                <div className="chip-row">
                  {(order.test_names || []).map((t, i) => (
                    <span key={i} className="chip" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{t}</span>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <p className="detail-section__title">Billing</p>
                <div className="detail-row">
                  <span className="detail-row__key">Subtotal</span>
                  <span className="detail-row__val">৳ {parseFloat(order.subtotal || 0).toFixed(2)}</span>
                </div>
                {parseFloat(order.home_collection_fee) > 0 && (
                  <div className="detail-row">
                    <span className="detail-row__key">Home Fee</span>
                    <span className="detail-row__val">৳ {parseFloat(order.home_collection_fee).toFixed(2)}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-row__key">VAT</span>
                  <span className="detail-row__val">৳ {parseFloat(order.vat || 0).toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-row__key" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
                  <span className="detail-row__val" style={{ color: 'var(--primary)', fontSize: '1rem' }}>
                    ৳ {parseFloat(order.total_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {order.assigned_staff && (
                <div className="detail-section">
                  <p className="detail-section__title">Assigned Collector</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="staff-avatar">{initials(order.assigned_staff)}</div>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{order.assigned_staff}</span>
                  </div>
                </div>
              )}

              {step === 0 && order.rejection_reason && (
                <div className="detail-section">
                  <p className="detail-section__title">Rejection Details</p>
                  <div className="rejection-info">
                    <strong>{order.rejection_reason}</strong>
                    {order.rejection_note && <p style={{ marginTop: 6, fontWeight: 500 }}>{order.rejection_note}</p>}
                  </div>
                </div>
              )}

              {/* Workflow timeline */}
              <div className="detail-section">
                <p className="detail-section__title">Workflow Progress</p>
                <div className="workflow-steps">
                  {WORKFLOW_STEPS.map(ws => {
                    const isDone = step > ws.step || (step === 9 && ws.step === 9);
                    const isCurrent = step === ws.step;
                    return (
                      <div key={ws.step} className="workflow-step">
                        <div className={`workflow-step__dot${isDone ? ' done' : isCurrent ? ' current' : ''}`}>
                          <span className="material-symbols-outlined">{ws.icon}</span>
                        </div>
                        <div className="workflow-step__label">
                          <p className={`workflow-step__name${!isDone && !isCurrent ? ' muted' : ''}`}>{ws.label}</p>
                          {isCurrent && <p className="workflow-step__sub">Current step</p>}
                          {isDone && <p className="workflow-step__sub" style={{ color: 'var(--success)' }}>✓ Done</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── Assign view ── */}
          {view === 'assign' && (
            <div>
              <p style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.9rem' }}>Choose a collector for #{String(order.id).padStart(4, '0')}</p>
              <div className="radio-list">
                {STAFF_LIST.map(s => (
                  <label key={s} className={`radio-option${selectedStaff === s ? ' selected' : ''}`}>
                    <input type="radio" name="staff" value={s} checked={selectedStaff === s} onChange={() => setSelectedStaff(s)} />
                    <div className="staff-avatar">{initials(s)}</div>
                    <span className="radio-option__label">{s}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Reject view ── */}
          {view === 'reject' && (
            <div>
              <p style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.9rem' }}>Reason for rejection</p>
              <div className="radio-list" style={{ marginBottom: 16 }}>
                {REJECT_REASONS.map(r => (
                  <label key={r} className={`radio-option${rejectReason === r ? ' selected' : ''}`}>
                    <input type="radio" name="reason" value={r} checked={rejectReason === r} onChange={() => setRejectReason(r)} />
                    <span className="radio-option__label">{r}</span>
                  </label>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Additional Note (Optional)</label>
                <textarea
                  className="form-input"
                  placeholder="Provide more details..."
                  value={rejectNote}
                  onChange={e => setRejectNote(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="modal-footer">
          {view === 'details' && (
            <>
              {/* Rejected → Restore */}
              {step === 0 && (
                <button className="btn btn-success" onClick={handleRestore} disabled={saving}>
                  <span className="material-symbols-outlined">restore</span>
                  {saving ? 'Restoring...' : 'Restore'}
                </button>
              )}
              {/* Step 1 → Reject */}
              {step === 1 && module === 'testqueue' && (
                <button className="btn btn-danger" onClick={() => setView('reject')}>
                  <span className="material-symbols-outlined">cancel</span>
                  Reject
                </button>
              )}
              {/* Assign collector (step 2, testqueue or samplecollection step 3) */}
              {(step === 2 || (step === 3 && !order.assigned_staff)) && (
                <button className="btn btn-outline" onClick={() => setView('assign')}>
                  <span className="material-symbols-outlined">person_add</span>
                  Assign
                </button>
              )}
              {/* Advance */}
              {step >= 1 && step <= 8 && step !== 0 && (
                <button className="btn btn-primary" onClick={handleAdvance} disabled={saving} style={{ flex: 2 }}>
                  <span className="material-symbols-outlined">arrow_forward</span>
                  {saving ? 'Saving...' : (advanceLabel[step] || 'Advance')}
                </button>
              )}
              {step === 9 && (
                <span className="btn" style={{ flex: 1, background: 'var(--success-bg)', color: 'var(--success)', cursor: 'default' }}>
                  <span className="material-symbols-outlined">task_alt</span>
                  Completed
                </span>
              )}
            </>
          )}
          {view === 'assign' && (
            <>
              <button className="btn btn-outline" onClick={() => setView('details')}>Back</button>
              <button className="btn btn-primary" onClick={handleAssign} disabled={!selectedStaff || saving}>
                {saving ? 'Assigning...' : 'Confirm'}
              </button>
            </>
          )}
          {view === 'reject' && (
            <>
              <button className="btn btn-outline" onClick={() => setView('details')}>Back</button>
              <button className="btn btn-danger" onClick={handleReject} disabled={!rejectReason || saving}>
                {saving ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Manual Entry Modal ────────────────────────────────────────────────────────
function ManualEntryModal({ tests, onClose, onSuccess, showToast }) {
  const [form, setForm] = useState({
    patient_name: '',
    patient_phone: '',
    patient_email: '',
    home_collection: false,
    collection_address: '',
    collection_slot: '',
  });
  const [selectedTests, setSelectedTests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const toggleTest = id => {
    setSelectedTests(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const subtotal = tests.filter(t => selectedTests.includes(t.id)).reduce((s, t) => s + parseFloat(t.price || 0), 0);
  const homeCollectionFee = form.home_collection ? 150 : 0;
  const vat = parseFloat(((subtotal + homeCollectionFee) * 0.05).toFixed(2));
  const total = subtotal + homeCollectionFee + vat;

  const handleSubmit = async () => {
    if (!form.patient_name.trim()) return setErr('Patient name is required.');
    if (!form.patient_phone.trim()) return setErr('Phone number is required.');
    if (selectedTests.length === 0) return setErr('Select at least one test.');
    setErr('');
    setSaving(true);
    try {
      const res = await api.manualEntry({
        ...form,
        test_ids: selectedTests,
      });
      if (res.success) {
        onSuccess();
        showToast('Order created successfully!');
        onClose();
      } else {
        setErr(res.error || 'Failed to create order.');
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div className="modal-header">
          <div>
            <p className="modal-title">New Order Entry</p>
            <p className="modal-subtitle">Add a walk-in or phone order</p>
          </div>
          <button className="icon-btn" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="modal-body">
          {err && <div className="form-error" style={{ marginBottom: 14 }}>{err}</div>}

          <div className="form-group">
            <label className="form-label">Patient Name *</label>
            <input className="form-input" placeholder="Full name" value={form.patient_name} onChange={e => setForm(f => ({ ...f, patient_name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone *</label>
            <input className="form-input" placeholder="+880..." value={form.patient_phone} onChange={e => setForm(f => ({ ...f, patient_phone: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Email (optional)</label>
            <input className="form-input" placeholder="patient@example.com" value={form.patient_email} onChange={e => setForm(f => ({ ...f, patient_email: e.target.value }))} />
          </div>

          <div className="form-group">
            <label className="form-label">Tests *</label>
            <div className="checkbox-list">
              {tests.map(t => (
                <label key={t.id} className={`checkbox-option${selectedTests.includes(t.id) ? ' selected' : ''}`}>
                  <input type="checkbox" checked={selectedTests.includes(t.id)} onChange={() => toggleTest(t.id)} />
                  <span className="checkbox-option__name">{t.name}</span>
                  <span className="checkbox-option__price">৳{parseFloat(t.price || 0).toFixed(0)}</span>
                </label>
              ))}
            </div>
          </div>

          <label className={`radio-option${form.home_collection ? ' selected' : ''}`} style={{ marginBottom: 14 }}>
            <input type="checkbox" checked={form.home_collection} onChange={e => setForm(f => ({ ...f, home_collection: e.target.checked }))} />
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>home</span>
            <span className="radio-option__label">Home Collection (+৳150)</span>
          </label>

          {form.home_collection && (
            <>
              <div className="form-group">
                <label className="form-label">Collection Address</label>
                <input className="form-input" placeholder="House, Road, Area..." value={form.collection_address} onChange={e => setForm(f => ({ ...f, collection_address: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Slot</label>
                <input className="form-input" type="time" value={form.collection_slot} onChange={e => setForm(f => ({ ...f, collection_slot: e.target.value }))} />
              </div>
            </>
          )}

          {selectedTests.length > 0 && (
            <div style={{ background: 'var(--primary-light)', borderRadius: 12, padding: '12px 14px', marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span><span>৳{subtotal.toFixed(2)}</span>
              </div>
              {form.home_collection && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  <span>Home Fee</span><span>৳150.00</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                <span>VAT (5%)</span><span>৳{vat.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--primary)', marginTop: 8, fontSize: '0.95rem' }}>
                <span>Total</span><span>৳{total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            <span className="material-symbols-outlined">add_circle</span>
            {saving ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Test Queue Tab ────────────────────────────────────────────────────────────
function TestQueueTab({ showToast }) {
  const TABS = ['All', 'New Requests', 'Accepted', 'Rejected'];
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [tests, setTests] = useState([]);
  const [showManual, setShowManual] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getOrders({ module: 'testqueue', status: activeTab !== 'All' ? activeTab : '', search });
      if (res.success) setOrders(res.data);
    } finally { setLoading(false); }
  }, [activeTab, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    api.getTests().then(r => { if (r.success) setTests(r.data); });
  }, []);

  const stats = {
    total: orders.length,
    newReq: orders.filter(o => o.demo_step === 1).length,
    accepted: orders.filter(o => o.demo_step === 2).length,
    rejected: orders.filter(o => o.demo_step === 0).length,
  };

  return (
    <div className="page-scroll">
      {/* Stats */}
      <div className="page-section">
        <p className="page-section__title">Test Queue</p>
        <p className="page-section__sub">Review and accept incoming lab orders</p>
      </div>
      <div className="stats-grid">
        {[
          { icon: 'list_alt', label: 'Total', val: stats.total, color: '#1a73e8', bg: '#e8f0fe' },
          { icon: 'inbox',    label: 'New',   val: stats.newReq, color: '#d97706', bg: '#fffbeb' },
          { icon: 'check',    label: 'Accepted', val: stats.accepted, color: '#16a34a', bg: '#f0fdf4' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card__icon" style={{ background: s.bg }}>
              <span className="material-symbols-outlined" style={{ color: s.color }}>{s.icon}</span>
            </div>
            <p className="stat-card__val">{s.val}</p>
            <p className="stat-card__label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs-wrap">
        <div className="filter-tabs">
          {TABS.map(t => (
            <button key={t} className={`filter-tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
              {t}
              {t === 'New Requests' && stats.newReq > 0 && <span className="filter-tab__badge">{stats.newReq}</span>}
              {t === 'Rejected'     && stats.rejected > 0 && <span className="filter-tab__badge">{stats.rejected}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <div className="search-bar">
          <span className="material-symbols-outlined">search</span>
          <input placeholder="Search patient, phone, ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="refresh-btn" onClick={fetchOrders}>
          <span className={`material-symbols-outlined${loading ? ' spin-icon' : ''}`}>refresh</span>
        </button>
      </div>

      {/* Orders */}
      <div className="orders-list">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined">inbox</span>
            <p className="empty-state__title">No orders found</p>
            <p className="empty-state__sub">Try switching tabs or refreshing the list</p>
          </div>
        ) : (
          orders.map(o => (
            <OrderCard key={o.id} order={o} onTap={setSelected} module="testqueue" />
          ))
        )}
      </div>

      {/* Modals */}
      {selected && (
        <DetailsModal
          order={selected}
          module="testqueue"
          onClose={() => setSelected(null)}
          onRefresh={fetchOrders}
          showToast={showToast}
        />
      )}
      {showManual && (
        <ManualEntryModal
          tests={tests}
          onClose={() => setShowManual(false)}
          onSuccess={fetchOrders}
          showToast={showToast}
        />
      )}

      {/* FAB */}
      <button className="fab" onClick={() => setShowManual(true)} title="Add manual order">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}

// ── Sample Collection Tab ─────────────────────────────────────────────────────
function SampleCollectionTab({ showToast }) {
  const TABS = ['All', 'Pending', 'Collected', 'Home Collection', 'Overdue'];
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getOrders({ module: 'samplecollection', status: activeTab !== 'All' ? activeTab : '', search });
      if (res.success) setOrders(res.data);
    } finally { setLoading(false); }
  }, [activeTab, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const stats = {
    pending:   orders.filter(o => [3, 4].includes(o.demo_step)).length,
    home:      orders.filter(o => o.home_collection).length,
    collected: orders.filter(o => [5, 6].includes(o.demo_step)).length,
    overdue:   orders.filter(o => isOverdue(o.created_at)).length,
  };

  return (
    <div className="page-scroll">
      <div className="page-section">
        <p className="page-section__title">Sample Collection</p>
        <p className="page-section__sub">Manage collector assignments (Steps 3–6)</p>
      </div>

      {/* Stats */}
      <div className="stats-grid stats-grid-2" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {[
          { icon: 'pending_actions', label: 'Pending', val: stats.pending, color: '#d97706', bg: '#fffbeb' },
          { icon: 'home_health',     label: 'Home',    val: stats.home,    color: '#0284c7', bg: '#f0f9ff' },
          { icon: 'science',         label: 'Collected',val: stats.collected, color: '#16a34a', bg: '#f0fdf4' },
          { icon: 'schedule',        label: 'Overdue', val: stats.overdue,  color: '#dc2626', bg: '#fef2f2' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card__icon" style={{ background: s.bg }}>
              <span className="material-symbols-outlined" style={{ color: s.color }}>{s.icon}</span>
            </div>
            <p className="stat-card__val">{s.val}</p>
            <p className="stat-card__label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs-wrap">
        <div className="filter-tabs">
          {TABS.map(t => (
            <button key={t} className={`filter-tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
              {t}
              {t === 'Overdue' && stats.overdue > 0 && <span className="filter-tab__badge">{stats.overdue}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <div className="search-bar">
          <span className="material-symbols-outlined">search</span>
          <input placeholder="Search patient, phone, ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="refresh-btn" onClick={fetchOrders}>
          <span className={`material-symbols-outlined${loading ? ' spin-icon' : ''}`}>refresh</span>
        </button>
      </div>

      {/* Orders */}
      <div className="orders-list">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined">science</span>
            <p className="empty-state__title">No collections found</p>
            <p className="empty-state__sub">Orders accepted in Test Queue appear here</p>
          </div>
        ) : (
          orders.map(o => (
            <OrderCard key={o.id} order={o} onTap={setSelected} module="samplecollection" />
          ))
        )}
      </div>

      {selected && (
        <DetailsModal
          order={selected}
          module="samplecollection"
          onClose={() => setSelected(null)}
          onRefresh={fetchOrders}
          showToast={showToast}
        />
      )}
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('queue');
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (msg, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  const NAV = [
    { id: 'queue',      icon: 'inbox',        label: 'Test Queue'  },
    { id: 'collection', icon: 'science',       label: 'Collection'  },
  ];

  return (
    <div className="app-layout">
      {/* Top header */}
      <header className="top-header">
        <div className="top-header__logo">
          <div className="top-header__logo-icon">
            <span className="material-symbols-outlined">biotech</span>
          </div>
          <div>
            <p className="top-header__title">careXpatient</p>
            <p className="top-header__subtitle">Lab Staff Portal</p>
          </div>
        </div>
        <div className="top-header__actions">
          <button className="icon-btn">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #e8f0fe, #1a73e8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.75rem', color: '#1558b0',
          }}>DR</div>
        </div>
      </header>

      {/* Active tab */}
      {tab === 'queue'      && <TestQueueTab      showToast={showToast} />}
      {tab === 'collection' && <SampleCollectionTab showToast={showToast} />}

      {/* Bottom nav */}
      <nav className="bottom-nav">
        {NAV.map(n => (
          <button key={n.id} className={`bottom-nav__item${tab === n.id ? ' active' : ''}`} onClick={() => setTab(n.id)}>
            <span className="material-symbols-outlined bottom-nav__icon">{n.icon}</span>
            <span className="bottom-nav__label">{n.label}</span>
          </button>
        ))}
      </nav>

      {/* Toast */}
      <Toast toast={toast} />
    </div>
  );
}
