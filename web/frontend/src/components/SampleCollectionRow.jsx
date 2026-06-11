import React from 'react';
import StatusBadge from './StatusBadge';

/**
 * SampleCollectionRow — handles steps 3, 4, 5, 6 only.
 *
 * Step 3 (Assigned Staff)   → "Mark Arrived" button
 * Step 4 (Collector Arrived)→ "Collect Sample" button
 * Step 5 (Sample Collected) → "Deliver to Lab" button
 * Step 6 (Delivered to Lab) → read-only "Delivered" chip
 */
const NEXT_LABEL = {
  3: { label: 'Mark Arrived',   icon: 'location_on',     cls: 'bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100' },
  4: { label: 'Collect Sample', icon: 'science',         cls: 'bg-teal-600 text-white hover:bg-teal-700' },
  5: { label: 'Deliver to Lab', icon: 'local_shipping',  cls: 'bg-primary-container text-white hover:bg-primary' },
};

export default function SampleCollectionRow({ order, onDetails, onAdvance, onAssign, updatingId, avatar }) {
  const currentStep = order.demo_step ?? 3;
  const isUpdating = updatingId === order.id;
  const next = NEXT_LABEL[currentStep];

  return (
    <tr className="hover:bg-background-off-white/50 transition-colors">

      {/* Patient details */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-background-off-white shrink-0">
            <img src={avatar || order.patient_photo} alt="Patient Avatar" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">{order.patient_name}</p>
            <p className="text-xs text-on-surface-variant">{order.patient_phone}</p>
            {order.home_collection && order.collection_address && (
              <div className="flex items-center gap-1 mt-1 text-[10px] text-on-surface-variant italic">
                <span className="material-symbols-outlined text-[12px]">location_on</span>
                <span className="truncate max-w-[160px]">{order.collection_address}</span>
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Test & Type */}
      <td className="px-6 py-4">
        <p className="text-sm font-medium text-on-surface">{(order.test_names || []).join(', ') || '—'}</p>
        <div className={`flex items-center gap-1 text-[11px] font-bold uppercase mt-1 ${order.home_collection ? 'text-blue-600' : 'text-primary-container'}`}>
          <span className="material-symbols-outlined text-[14px]">
            {order.home_collection ? 'home' : 'medical_services'}
          </span>
          {order.home_collection ? 'Home Collection' : 'In-Lab Collection'}
        </div>
      </td>

      {/* Schedule */}
      <td className="px-6 py-4">
        <p className="text-sm font-medium text-on-surface">
          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <p className="text-xs text-on-surface-variant">
          {order.collection_slot || new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </td>

      {/* Assigned Staff */}
      <td className="px-6 py-4">
        {order.assigned_staff ? (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary-container/20 flex items-center justify-center border border-primary-container/20">
              <span className="text-[10px] font-bold text-primary-container">
                {order.assigned_staff.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <span className="text-sm text-on-surface font-semibold">{order.assigned_staff}</span>
          </div>
        ) : (
          <button
            onClick={() => onAssign && onAssign(order)}
            className="text-xs font-bold text-primary-container border border-primary-container/30 bg-primary-container/5 px-2.5 py-1.5 rounded-lg hover:bg-primary-container/10 transition-colors"
          >
            + Assign Staff
          </button>
        )}
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <StatusBadge demoStep={currentStep} />
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">

          {/* Steps 3-5: advance button */}
          {next && (
            <button
              onClick={() => onAdvance && onAdvance(order.id, currentStep)}
              disabled={isUpdating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-60 ${next.cls}`}
            >
              <span className="material-symbols-outlined text-[14px]">{next.icon}</span>
              {isUpdating ? '...' : next.label}
            </button>
          )}

          {/* Step 6: delivered chip (no more actions in this module) */}
          {currentStep === 6 && (
            <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
              ✓ Delivered
            </span>
          )}

          {/* Details button */}
          <button
            onClick={() => onDetails && onDetails(order)}
            className="p-2 text-on-surface-variant hover:text-primary-container hover:bg-background-off-white rounded-lg transition-colors"
            title="View Details"
          >
            <span className="material-symbols-outlined">visibility</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
