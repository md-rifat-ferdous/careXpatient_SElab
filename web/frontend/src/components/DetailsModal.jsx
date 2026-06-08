import { useState } from 'react';
import StatusBadge from './StatusBadge';

const STAFF_LIST = ['Kamal Hossain', 'Rashedul Islam', 'Farhana Yasmin', 'Dr. S. Rahman'];

const REJECTION_REASONS = [
  'Duplicate request',
  'Incomplete documentation',
  'Doctor prescription invalid',
  'Patient not eligible',
  'Test not available',
  'Insurance / payment issue',
  'Other',
];

/**
 * DetailsModal
 * Props:
 *   order         – full order object
 *   module        – 'testqueue' | 'samplecollection' | 'uploadreports'
 *   onClose       – close handler
 *   onAdvance     – (id, currentStep) => void
 *   onAssignStaff – (id, staffName) => void
 *   onReject      – (id, reason, note) => void  (TestQueue only)
 */
export default function DetailsModal({ order, module = 'testqueue', onClose, onAdvance, onAssignStaff, onReject, onRestore }) {
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  // Inline rejection state (inside modal)
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [rejectErr, setRejectErr] = useState('');

  if (!order) return null;

  const currentStep = order.demo_step ?? 1;

  // ── Timeline (full 9-step view for reference) ─────────────────────────────
  const timelineSteps = [
    { step: 1, label: 'New Request',      icon: 'notifications_active', desc: 'Patient submitted booking request',           module: 'testqueue' },
    { step: 2, label: 'Accepted',          icon: 'check_circle',         desc: 'Lab validated and accepted request',           module: 'testqueue' },
    { step: 3, label: 'Assigned Staff',    icon: 'person_add',           desc: `Collector assigned: ${order.assigned_staff || 'TBD'}`, module: 'samplecollection' },
    { step: 4, label: 'Collector Arrived', icon: 'location_on',          desc: 'Collector checked-in at location',             module: 'samplecollection' },
    { step: 5, label: 'Sample Collected',  icon: 'science',              desc: 'Phlebotomist acquired samples',                module: 'samplecollection' },
    { step: 6, label: 'Delivered to Lab',  icon: 'local_shipping',       desc: 'Vials transported to analysis queue',          module: 'samplecollection' },
    { step: 7, label: 'Processing',        icon: 'hourglass_top',        desc: 'Pathologist running diagnostics',              module: 'uploadreports' },
    { step: 8, label: 'Ready for Report',  icon: 'description',          desc: 'Results compiled, awaiting sign-off',          module: 'uploadreports' },
    { step: 9, label: 'Completed',         icon: 'task_alt',             desc: 'Report signed, PDF issued and dispatched',     module: 'uploadreports' },
  ];

  // ── Action logic per module ──────────────────────────────────────────────
  const getNextLabel = () => {
    if (module === 'testqueue') {
      if (currentStep === 1) return 'Accept Request';
      return null; // step 2 is end of testqueue (readonly), step 0 is rejected
    }
    if (module === 'samplecollection') {
      switch (currentStep) {
        case 3: return 'Mark Collector Arrived';
        case 4: return 'Collect Sample';
        case 5: return 'Deliver to Lab';
        default: return null; // step 6 is end of samplecollection
      }
    }
    if (module === 'uploadreports') {
      if (currentStep === 7) return 'Mark Ready for Report';
      return null; // steps 8, 9 handled by upload UI
    }
    return null;
  };

  const getNextIcon = () => {
    if (module === 'testqueue' && currentStep === 1) return 'check_circle';
    if (module === 'samplecollection') {
      switch (currentStep) {
        case 3: return 'location_on';
        case 4: return 'science';
        case 5: return 'local_shipping';
      }
    }
    if (module === 'uploadreports' && currentStep === 7) return 'description';
    return 'arrow_forward';
  };

  const nextLabel = getNextLabel();
  const isCompleted = currentStep >= 9;
  const isRejected = currentStep === 0;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!selectedStaff) return;
    setAssigning(true);
    try { await onAssignStaff(order.id, selectedStaff); } catch (e) { /* handled upstream */ }
    setAssigning(false);
    setSelectedStaff('');
  };

  const handleAdvance = async () => {
    setAdvancing(true);
    try { await onAdvance(order.id, currentStep); } catch (e) { /* handled upstream */ }
    setAdvancing(false);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason) { setRejectErr('Please select a rejection reason.'); return; }
    setRejectErr('');
    setRejecting(true);
    try { await onReject(order.id, rejectReason, rejectNote); } catch (e) { /* handled upstream */ }
    setRejecting(false);
    setShowRejectForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant bg-background-off-white/50">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg text-on-surface">Order Details #{String(order.id).padStart(4, '0')}</h3>
            <StatusBadge demoStep={currentStep} />
            {/* Module owner badge */}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              module === 'testqueue' ? 'bg-amber-100 text-amber-700' :
              module === 'samplecollection' ? 'bg-blue-100 text-blue-700' :
              'bg-violet-100 text-violet-700'
            }`}>
              {module === 'testqueue' ? 'Test Queue' : module === 'samplecollection' ? 'Sample Collection' : 'Upload Reports'}
            </span>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-outline-variant/20 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Col 1 & 2: Info & Billing */}
          <div className="lg:col-span-2 space-y-6">

            {/* Rejection Banner */}
            {isRejected && (
              <div className="border border-red-200 bg-red-50 rounded-xl p-4 space-y-1">
                <p className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  Request Rejected
                </p>
                <p className="text-sm font-semibold text-red-800">{order.rejection_reason}</p>
                {order.rejection_note && <p className="text-xs text-red-600 mt-1">{order.rejection_note}</p>}
                {order.rejected_at && (
                  <p className="text-[10px] text-red-400 mt-1">
                    Rejected at: {new Date(order.rejected_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Patient Card */}
            <div className="border border-outline-variant rounded-xl p-4 flex gap-4 bg-background-off-white/20">
              <img
                src={order.patient_photo || '/assets/4bd37d2d183662ae6e8134b5c5dd7463.png'}
                alt="Patient Avatar"
                className="w-16 h-16 rounded-full object-cover border border-outline-variant shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-primary-container uppercase tracking-wider">Patient Profile</p>
                <h4 className="font-bold text-lg text-on-surface truncate">{order.patient_name}</h4>
                <p className="text-sm text-on-surface-variant">{order.patient_phone} · {order.patient_email || 'No email provided'}</p>
                {order.home_collection && (
                  <div className="flex items-start gap-1.5 mt-3 text-xs text-on-surface-variant bg-blue-50 border border-blue-100 p-2.5 rounded-lg">
                    <span className="material-symbols-outlined text-[16px] text-blue-600 shrink-0">location_on</span>
                    <div>
                      <p className="font-bold text-blue-800">Home Collection Address</p>
                      <p className="text-[11px] text-blue-700 mt-0.5">{order.collection_address}</p>
                      <p className="text-[10px] text-blue-500 font-semibold mt-1">Slot: {order.collection_slot}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Staff info (if assigned) */}
            {order.assigned_staff && (
              <div className="flex items-center gap-3 border border-outline-variant rounded-xl p-4 bg-teal-50/30">
                <div className="h-10 w-10 rounded-full bg-primary-container/20 flex items-center justify-center border border-primary-container/30">
                  <span className="text-[10px] font-bold text-primary-container">
                    {order.assigned_staff.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Assigned Staff</p>
                  <p className="text-sm font-bold text-on-surface">{order.assigned_staff}</p>
                </div>
                <span className="ml-auto text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full">Active</span>
              </div>
            )}

            {/* Test Details */}
            <div className="space-y-3">
              <h5 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary-container text-[20px]">science</span>
                Prescribed Diagnostics
              </h5>
              <div className="border border-outline-variant rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-background-off-white font-bold text-on-surface-variant border-b border-outline-variant">
                    <tr>
                      <th className="px-4 py-2">Test Name</th>
                      <th className="px-4 py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {(order.test_names || []).map((name, idx) => (
                      <tr key={idx} className="hover:bg-primary-container/5 transition-colors">
                        <td className="px-4 py-3 font-semibold text-on-surface">{name}</td>
                        <td className="px-4 py-3 text-right font-semibold text-on-surface-variant">
                          ৳{(parseFloat(order.total_amount) / (order.test_names.length || 1) * 0.9).toFixed(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Billing */}
            <div className="space-y-3">
              <h5 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary-container text-[20px]">payments</span>
                Billing Breakdown
              </h5>
              <div className="border border-outline-variant rounded-xl p-4 bg-background-off-white/10 space-y-2.5 text-sm">
                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>Subtotal</span><span>৳{parseFloat(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>Home Collection Fee</span><span>৳{parseFloat(order.home_collection_fee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>VAT (5%)</span><span>৳{parseFloat(order.vat || 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-outline-variant pt-2.5 flex justify-between font-bold text-base text-on-surface">
                  <span>Total Bill (Paid)</span>
                  <span className="text-primary-container">৳{parseFloat(order.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Report Summary */}
            {order.result_summary && (
              <div className="space-y-3">
                <h5 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">description</span>
                  Report Summary
                </h5>
                <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/30 text-sm text-on-surface leading-relaxed">
                  {order.result_summary}
                </div>
              </div>
            )}
          </div>

          {/* Col 3: Timeline & Action */}
          <div className="border-l border-outline-variant/60 pl-6 flex flex-col h-full">
            <h5 className="font-bold text-sm text-on-surface flex items-center gap-1.5 mb-4 shrink-0">
              <span className="material-symbols-outlined text-primary-container text-[20px]">timeline</span>
              Workflow Tracking
            </h5>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {timelineSteps.map((s, idx) => {
                const isPassed = currentStep > s.step;
                const isCurrent = currentStep === s.step;
                const isOwner = s.module === module;

                return (
                  <div key={idx} className="flex gap-3 relative">
                    {idx < timelineSteps.length - 1 && (
                      <div className={`absolute left-2.5 top-5 bottom-[-20px] w-[2px] ${isPassed ? 'bg-primary-container' : 'bg-outline-variant/40'}`} />
                    )}
                    <div className={`
                      w-5 h-5 rounded-full z-10 flex items-center justify-center shrink-0 mt-0.5 border transition-all
                      ${isPassed ? 'bg-primary-container border-primary-container text-white' : ''}
                      ${isCurrent ? 'bg-surface-white border-primary-container ring-4 ring-primary-container/20 text-primary-container' : ''}
                      ${!isPassed && !isCurrent ? 'bg-surface-white border-outline-variant text-on-surface-variant' : ''}
                    `}>
                      {isPassed ? (
                        <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                      ) : (
                        <span className="text-[10px] font-bold">{s.step}</span>
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isCurrent ? 'text-primary-container' : isPassed ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {s.label}
                        {isOwner && !isPassed && !isCurrent && (
                          <span className="ml-1 text-[9px] text-on-surface-variant/60 font-normal">(this module)</span>
                        )}
                      </p>
                      <p className="text-[10px] text-on-surface-variant leading-tight mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Footer */}
            <div className="pt-6 border-t border-outline-variant mt-6 shrink-0 space-y-3">

              {/* Completed */}
              {isCompleted && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">task_alt</span>
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Workflow Complete</p>
                    <p className="text-[10px] text-emerald-600">All steps finalized. Report issued.</p>
                  </div>
                </div>
              )}

              {/* Rejected */}
              {isRejected && !showRejectForm && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <span className="material-symbols-outlined text-red-600 text-[20px]">cancel</span>
                    <div>
                      <p className="text-xs font-bold text-red-800">Request Rejected</p>
                      <p className="text-[10px] text-red-600">This order has been rejected and logged.</p>
                    </div>
                  </div>
                  {module === 'testqueue' && onRestore && (
                    <button
                      onClick={async () => {
                        setAdvancing(true);
                        try {
                          await onRestore(order.id);
                        } catch (e) {}
                        setAdvancing(false);
                      }}
                      disabled={advancing}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">restore</span>
                      {advancing ? 'Restoring...' : 'Restore Request'}
                    </button>
                  )}
                </div>
              )}

              {/* Inline rejection form (TestQueue, step 1) */}
              {module === 'testqueue' && currentStep === 1 && !showRejectForm && (
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 border border-red-200 text-red-600 bg-red-50 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">cancel</span>
                  Reject Request
                </button>
              )}

              {/* Rejection form */}
              {showRejectForm && (
                <div className="space-y-3 border border-red-200 rounded-xl p-3 bg-red-50/50">
                  <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Rejection Reason *</p>
                  {rejectErr && <p className="text-[11px] text-red-600">{rejectErr}</p>}
                  <select
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="w-full text-xs border border-red-200 rounded-lg px-2 py-2 outline-none bg-white"
                  >
                    <option value="">Select reason...</option>
                    {REJECTION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <textarea
                    value={rejectNote}
                    onChange={e => setRejectNote(e.target.value)}
                    placeholder="Additional note (optional)"
                    rows={2}
                    className="w-full text-xs border border-red-200 rounded-lg px-2 py-2 outline-none resize-none bg-white"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowRejectForm(false)} className="flex-1 py-2 text-xs font-bold border border-outline-variant rounded-lg text-on-surface-variant hover:bg-background-off-white">
                      Cancel
                    </button>
                    <button onClick={handleRejectSubmit} disabled={rejecting} className="flex-1 py-2 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60">
                      {rejecting ? 'Rejecting...' : 'Confirm Reject'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 (TestQueue Accepted) — Staff assignment for SampleCollection handed off */}
              {module === 'testqueue' && currentStep === 2 && (
                <div className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-200 rounded-xl">
                  <span className="material-symbols-outlined text-teal-600 text-[20px]">check_circle</span>
                  <div>
                    <p className="text-xs font-bold text-teal-800">Accepted — Moved to Sample Collection</p>
                    <p className="text-[10px] text-teal-600">Staff assignment happens in the Sample Collection module.</p>
                  </div>
                </div>
              )}

              {/* SampleCollection — Assign Staff at step 3 */}
              {module === 'samplecollection' && currentStep === 3 && !order.assigned_staff && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Assign Collector</p>
                  <select
                    value={selectedStaff}
                    onChange={e => setSelectedStaff(e.target.value)}
                    className="w-full text-xs font-medium border border-outline-variant rounded-xl px-3 py-2 outline-none bg-surface-white focus:ring-2 focus:ring-primary-container"
                  >
                    <option value="">Select Phlebotomist/Staff</option>
                    {STAFF_LIST.map(staff => <option key={staff} value={staff}>{staff}</option>)}
                  </select>
                  <button
                    onClick={handleAssign}
                    disabled={!selectedStaff || assigning}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-primary-container text-white text-xs font-bold rounded-xl hover:bg-primary transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    {assigning ? 'Assigning...' : 'Assign Staff'}
                  </button>
                </div>
              )}

              {/* Primary action button (advance step) */}
              {!isCompleted && !isRejected && nextLabel && !showRejectForm &&
               !(module === 'testqueue' && currentStep === 2) &&
               !(module === 'samplecollection' && currentStep === 3 && !order.assigned_staff) && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Next Step Action</p>
                  <button
                    onClick={handleAdvance}
                    disabled={advancing}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-primary-container text-white text-xs font-bold rounded-xl hover:bg-primary transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">{getNextIcon()}</span>
                    {advancing ? 'Processing...' : nextLabel}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
