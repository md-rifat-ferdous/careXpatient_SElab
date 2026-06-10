'use client';

import React, { useState, useTransition } from 'react';
import { format, addWeeks, subWeeks, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Building2, Plane, Coffee } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { WeeklyScheduleViewer } from '@/components/schedule/WeeklyScheduleViewer';
import { OverrideTimeline } from '@/components/schedule/OverrideTimeline';

import {
  registerClinic,
  createSlot,

  applyHoliday,
  applyLeave } from
'@/server/doctorSchedule/actions/scheduleActions';








export function ScheduleClient({ initialClinics, initialModifications }) {
  const clinics = initialClinics;
  const modifications = initialModifications;
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [activeTab, setActiveTab] = useState('weekly');
  const [isPending, startTransition] = useTransition();

  // ── Modal states ──────────────────────────────────────────────────────────
  const [showRegisterClinic, setShowRegisterClinic] = useState(false);
  const [showCreateSlot, setShowCreateSlot] = useState(false);
  const [showHoliday, setShowHoliday] = useState(false);
  const [showLeave, setShowLeave] = useState(false);

  // ── Register Clinic ───────────────────────────────────────────────────────
  const [clinicForm, setClinicForm] = useState({ name: '', address: '', shiftDays: '', shiftTime: '' });

  const handleRegisterClinic = () => {
    startTransition(async () => {
      const shift = `${clinicForm.shiftDays} | ${clinicForm.shiftTime}`;
      const res = await registerClinic({ name: clinicForm.name, address: clinicForm.address, shift });
      if (res.success) {
        toast.success('Clinic registered successfully!');
        setShowRegisterClinic(false);
        setClinicForm({ name: '', address: '', shiftDays: '', shiftTime: '' });
      } else {
        toast.error(res.error ?? 'Failed to register clinic.');
      }
    });
  };

  // ── Create Slot ───────────────────────────────────────────────────────────
  const [slotForm, setSlotForm] = useState({ clinicId: '', date: '', startTime: '', endTime: '', consultationType: 'In-person', notes: '' });

  const handleCreateSlot = () => {
    if (!slotForm.clinicId) return toast.error('Please select a clinic.');
    startTransition(async () => {
      const res = await createSlot({
        clinicId: BigInt(slotForm.clinicId),
        date: slotForm.date,
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        consultationType: slotForm.consultationType,
        notes: slotForm.notes || undefined
      });
      if (res.success) {
        toast.success('Custom slot created!');
        setShowCreateSlot(false);
      } else {
        toast.error(res.error ?? 'Failed to create slot.');
      }
    });
  };

  // ── Holiday ───────────────────────────────────────────────────────────────
  const [holidayForm, setHolidayForm] = useState({ startDate: '', endDate: '', reason: '' });

  const handleApplyHoliday = () => {
    startTransition(async () => {
      const res = await applyHoliday({ startDate: holidayForm.startDate, endDate: holidayForm.endDate, reason: holidayForm.reason });
      if (res.success) {
        toast.success('Holiday applied across all clinics!');
        setShowHoliday(false);
      } else {
        toast.error(res.error ?? 'Failed to apply holiday.');
      }
    });
  };

  // ── Leave ─────────────────────────────────────────────────────────────────
  const [leaveForm, setLeaveForm] = useState({ clinicId: '', startDate: '', endDate: '', reason: '' });

  const handleApplyLeave = () => {
    if (!leaveForm.clinicId) return toast.error('Please select a clinic.');
    startTransition(async () => {
      const res = await applyLeave({
        clinicId: BigInt(leaveForm.clinicId),
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason
      });
      if (res.success) {
        toast.success('Leave applied!');
        setShowLeave(false);
      } else {
        toast.error(res.error ?? 'Failed to apply leave.');
      }
    });
  };

  const overrideItems = modifications.map((mod) => ({
    id: mod.id,
    type: mod.type,
    date: new Date(mod.dateISO),
    clinicName: mod.clinic.name,
    description: mod.description ?? undefined
  }));

  // ── Clinics for selects (extract unique clinics from ClinicData) ───────────
  const uniqueClinics = clinics.map((dc) => dc.clinic);

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="min-h-screen bg-gray-50/50">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Schedule</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage clinics, slots, holidays and leave</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowRegisterClinic(true)}
                className="flex items-center gap-1.5 text-xs font-bold bg-gray-900 text-white px-3 py-2 rounded-xl hover:bg-gray-800 transition-colors">
                
                <Building2 size={14} /> Register Clinic
              </button>
              <button
                onClick={() => setShowCreateSlot(true)}
                className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                
                <Plus size={14} /> Add Slot
              </button>
              <button
                onClick={() => setShowHoliday(true)}
                className="flex items-center gap-1.5 text-xs font-bold bg-amber-500 text-white px-3 py-2 rounded-xl hover:bg-amber-600 transition-colors">
                
                <Plane size={14} /> Holiday
              </button>
              <button
                onClick={() => setShowLeave(true)}
                className="flex items-center gap-1.5 text-xs font-bold bg-purple-600 text-white px-3 py-2 rounded-xl hover:bg-purple-700 transition-colors">
                
                <Coffee size={14} /> Leave
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
            {['weekly', 'overrides'].map((tab) =>
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`
              }>
              
                {tab === 'weekly' ? '📅 Weekly View' : '🔄 Overrides'}
              </button>
            )}
          </div>

          {activeTab === 'weekly' &&
          <>
              {/* Week Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                onClick={() => setWeekStart((w) => subWeeks(w, 1))}
                className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 hover:text-gray-700 transition-all">
                
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-bold text-gray-700">
                  {format(weekStart, 'MMM d')} – {format(addWeeks(weekStart, 1), 'MMM d, yyyy')}
                </span>
                <button
                onClick={() => setWeekStart((w) => addWeeks(w, 1))}
                className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 hover:text-gray-700 transition-all">
                
                  <ChevronRight size={18} />
                </button>
              </div>

              {clinics.length === 0 ?
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                  <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
                  <h3 className="text-sm font-black text-gray-500">No Clinics Registered</h3>
                  <p className="text-xs text-gray-400 mt-1">Register your first clinic to start managing your schedule.</p>
                  <button
                onClick={() => setShowRegisterClinic(true)}
                className="mt-4 text-xs font-bold bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors">
                
                    Register Clinic
                  </button>
                </div> :

            <WeeklyScheduleViewer clinics={clinics} modifications={modifications} weekStart={weekStart} />
            }
            </>
          }

          {activeTab === 'overrides' &&
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Active Overrides</h2>
              <OverrideTimeline items={overrideItems} />
            </div>
          }
        </div>

        {/* ── Modals ───────────────────────────────────────────────────────── */}
        {/* Register Clinic Modal */}
        {showRegisterClinic &&
        <Modal title="Register Clinic" onClose={() => setShowRegisterClinic(false)}>
            <div className="space-y-3">
              <Field label="Clinic Name">
                <input value={clinicForm.name} onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })}
              placeholder="City Heart Hospital" className={inputClass} />
              </Field>
              <Field label="Address">
                <input value={clinicForm.address} onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
              placeholder="123 Main St, Dhaka" className={inputClass} />
              </Field>
              <Field label="Shift Days (e.g. MON,WED,FRI)">
                <input value={clinicForm.shiftDays} onChange={(e) => setClinicForm({ ...clinicForm, shiftDays: e.target.value })}
              placeholder="MON,WED,FRI" className={inputClass} />
              </Field>
              <Field label="Shift Time (e.g. 09:00-17:00)">
                <input value={clinicForm.shiftTime} onChange={(e) => setClinicForm({ ...clinicForm, shiftTime: e.target.value })}
              placeholder="09:00-17:00" className={inputClass} />
              </Field>
              <SubmitBtn onClick={handleRegisterClinic} loading={isPending} label="Register" />
            </div>
          </Modal>
        }

        {/* Create Slot Modal */}
        {showCreateSlot &&
        <Modal title="Add Custom Slot" onClose={() => setShowCreateSlot(false)}>
            <div className="space-y-3">
              <Field label="Clinic">
                <select value={slotForm.clinicId} onChange={(e) => setSlotForm({ ...slotForm, clinicId: e.target.value })} className={inputClass}>
                  <option value="">Select clinic…</option>
                  {uniqueClinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Date">
                <input type="date" value={slotForm.date} onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })} className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Time">
                  <input type="time" value={slotForm.startTime} onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })} className={inputClass} />
                </Field>
                <Field label="End Time">
                  <input type="time" value={slotForm.endTime} onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })} className={inputClass} />
                </Field>
              </div>
              <Field label="Consultation Type">
                <select value={slotForm.consultationType} onChange={(e) => setSlotForm({ ...slotForm, consultationType: e.target.value })} className={inputClass}>
                  <option>In-person</option>
                  <option>Online</option>
                  <option>Emergency</option>
                </select>
              </Field>
              <Field label="Notes (optional)">
                <input value={slotForm.notes} onChange={(e) => setSlotForm({ ...slotForm, notes: e.target.value })}
              placeholder="Any special notes…" className={inputClass} />
              </Field>
              <SubmitBtn onClick={handleCreateSlot} loading={isPending} label="Create Slot" />
            </div>
          </Modal>
        }

        {/* Holiday Modal */}
        {showHoliday &&
        <Modal title="Apply Global Holiday" onClose={() => setShowHoliday(false)}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Date">
                  <input type="date" value={holidayForm.startDate} onChange={(e) => setHolidayForm({ ...holidayForm, startDate: e.target.value })} className={inputClass} />
                </Field>
                <Field label="End Date">
                  <input type="date" value={holidayForm.endDate} onChange={(e) => setHolidayForm({ ...holidayForm, endDate: e.target.value })} className={inputClass} />
                </Field>
              </div>
              <Field label="Reason">
                <input value={holidayForm.reason} onChange={(e) => setHolidayForm({ ...holidayForm, reason: e.target.value })}
              placeholder="Eid, National Holiday…" className={inputClass} />
              </Field>
              <SubmitBtn onClick={handleApplyHoliday} loading={isPending} label="Apply Holiday" color="bg-amber-500 hover:bg-amber-600" />
            </div>
          </Modal>
        }

        {/* Leave Modal */}
        {showLeave &&
        <Modal title="Apply Leave" onClose={() => setShowLeave(false)}>
            <div className="space-y-3">
              <Field label="Clinic">
                <select value={leaveForm.clinicId} onChange={(e) => setLeaveForm({ ...leaveForm, clinicId: e.target.value })} className={inputClass}>
                  <option value="">Select clinic…</option>
                  {uniqueClinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Date">
                  <input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} className={inputClass} />
                </Field>
                <Field label="End Date">
                  <input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} className={inputClass} />
                </Field>
              </div>
              <Field label="Reason">
                <input value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              placeholder="Medical leave…" className={inputClass} />
              </Field>
              <SubmitBtn onClick={handleApplyLeave} loading={isPending} label="Apply Leave" color="bg-purple-600 hover:bg-purple-700" />
            </div>
          </Modal>
        }
      </div>
    </>);

}

// ── Shared primitives ──────────────────────────────────────────────────────────
const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>);

}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-black text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>);

}

function SubmitBtn({ onClick, loading, label, color = 'bg-blue-600 hover:bg-blue-700' }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full mt-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${color} disabled:opacity-60 disabled:cursor-not-allowed`}>
      
      {loading ? 'Saving…' : label}
    </button>);

}