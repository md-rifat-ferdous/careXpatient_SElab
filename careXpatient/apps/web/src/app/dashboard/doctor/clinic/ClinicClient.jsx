'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Building2, MapPin, CalendarDays, Clock, Plus, ArrowRight, ShieldCheck } from 'lucide-react';
import { Toaster, toast } from 'sonner';

import { registerClinic } from '@/server/doctorSchedule/actions/scheduleActions';





export function ClinicClient({ initialClinics }) {
  const [clinics, setClinics] = useState(initialClinics);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: '',
    address: '',
    shiftDays: '',
    shiftTime: ''
  });

  const handleRegister = () => {
    if (!form.name.trim()) return toast.error('Clinic name is required');
    if (!form.address.trim()) return toast.error('Address is required');
    if (!form.shiftDays.trim()) return toast.error('Shift days are required');
    if (!form.shiftTime.trim()) return toast.error('Shift time is required');

    startTransition(async () => {
      const shift = `${form.shiftDays} | ${form.shiftTime}`;
      const res = await registerClinic({
        name: form.name,
        address: form.address,
        shift
      });

      if (res.success) {
        toast.success('Clinic registered successfully!');
        setShowRegisterModal(false);
        setForm({ name: '', address: '', shiftDays: '', shiftTime: '' });

        // Optimistically add to state for immediate rendering (Server Action will also update)
        const newClinic = {
          id: 'temp_' + Date.now(),
          shift,
          status: 'Active',
          clinic: {
            id: 'temp_' + Date.now(),
            name: form.name.trim(),
            address: form.address.trim()
          }
        };
        setClinics((prev) => [newClinic, ...prev]);

        // Wait a small delay and force refresh to sync with DB generated ID
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(res.error ?? 'Failed to register clinic.');
      }
    });
  };

  // ── Stat Calculations ──────────────────────────────────────────────────────
  const totalClinics = clinics.length;
  const activeClinics = clinics.filter((c) => c.status === 'Active').length;

  const totalCommitmentDays = clinics.reduce((acc, c) => {
    const daysPart = c.shift?.split('|')[0]?.trim() ?? '';
    const days = daysPart.split(',').map((d) => d.trim()).filter(Boolean);
    return acc + days.length;
  }, 0);

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="min-h-screen bg-slate-50/50">
        
        {/* Page Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-6">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Clinics</h1>
              <p className="text-sm text-slate-500 mt-0.5">Manage your attached practice locations and shift hours.</p>
            </div>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-sm shrink-0">
              
              <Plus size={15} />
              Register Clinic
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Building2 size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Clinics</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5">{totalClinics}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Status</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5">{activeClinics} Active</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                <CalendarDays size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weekly Shift Days</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5">{totalCommitmentDays} Days</h3>
              </div>
            </div>
          </div>

          {/* Clinics Grid / List */}
          {clinics.length === 0 ?
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center max-w-xl mx-auto shadow-sm">
              <Building2 size={44} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-sm font-black text-slate-700">No Clinics Registered Yet</h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
                Attach practice locations to show up in patients search lists and start booking appointments.
              </p>
              <button
              onClick={() => setShowRegisterModal(true)}
              className="mt-5 text-xs font-bold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors shadow">
              
                Register Your First Clinic
              </button>
            </div> :

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clinics.map((dc) => {
              const shiftParts = dc.shift?.split('|') ?? [];
              const days = shiftParts[0]?.trim() ?? 'N/A';
              const time = shiftParts[1]?.trim() ?? 'Scheduled';

              return (
                <div
                  key={dc.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:border-slate-200/60 transition-all flex flex-col justify-between">
                  
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-extrabold text-slate-900 text-base leading-tight group-hover:text-teal-600">
                          {dc.clinic.name}
                        </h4>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                      dc.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`
                      }>
                          {dc.status}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 text-xs font-semibold text-slate-500 mt-3.5">
                        <MapPin size={15} className="text-teal-500 shrink-0 mt-0.5" />
                        <span>{dc.clinic.address || 'No address provided'}</span>
                      </div>

                      <div className="mt-5 border-t border-slate-100 pt-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <CalendarDays size={14} className="text-slate-400" />
                          <span>Days: {days}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <Clock size={14} className="text-slate-400" />
                          <span>Shift Time: {time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <Link
                      href="/dashboard/doctor/schedule"
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors">
                      
                        Manage Schedule <ArrowRight size={13} />
                      </Link>
                      <span className="text-[10px] text-slate-400 font-medium font-mono">ID: #{dc.clinic.id}</span>
                    </div>
                  </div>);

            })}
            </div>
          }
        </div>

        {/* ── Register Clinic Modal ─────────────────────────────────────────── */}
        {showRegisterModal &&
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Register Clinic</h2>
                <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold transition-colors">
                
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Clinic Name</label>
                  <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Popular Diagnostic Center"
                  className={inputClass}
                  disabled={isPending} />
                
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Address</label>
                  <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Dhanmondi, Dhaka"
                  className={inputClass}
                  disabled={isPending} />
                
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Shift Days (e.g. MON, WED)</label>
                  <input
                  value={form.shiftDays}
                  onChange={(e) => setForm({ ...form, shiftDays: e.target.value })}
                  placeholder="MON, WED, FRI"
                  className={inputClass}
                  disabled={isPending} />
                
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Shift Time (e.g. 09:00-17:00)</label>
                  <input
                  value={form.shiftTime}
                  onChange={(e) => setForm({ ...form, shiftTime: e.target.value })}
                  placeholder="10:00-14:00"
                  className={inputClass}
                  disabled={isPending} />
                
                </div>

                <button
                onClick={handleRegister}
                disabled={isPending}
                className="w-full mt-2 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all disabled:opacity-65 flex items-center justify-center gap-2">
                
                  {isPending ?
                <>
                      <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Registering...
                    </> :

                'Register Clinic'
                }
                </button>
              </div>
            </div>
          </div>
        }

      </div>
    </>);

}

const inputClass =
'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500 transition-all bg-white';