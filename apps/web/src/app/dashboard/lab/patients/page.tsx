'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import SearchBar from '@/components/lab/SearchBar';
import { toast } from '@/components/ui/Toast';
import { fetchLabPatients, fetchPatientProfile } from '@/services/lab.service';

export default function PatientsPage() {
  const { user, token } = useAuthStore();
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const labId = user?.id;

  const loadPatients = useCallback(async () => {
    if (!labId || !token) return;
    setLoading(true);
    try {
      const data = await fetchLabPatients(labId, token, search);
      setPatients(data);
    } catch {
      toast('Failed to load patients', 'error');
    } finally {
      setLoading(false);
    }
  }, [labId, token, search]);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  const openProfile = async (userId: string) => {
    if (!labId || !token) return;
    setLoadingProfile(true);
    try {
      const data = await fetchPatientProfile(userId, labId, token);
      setSelected(data);
    } catch {
      toast('Failed to load profile', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Patients</h1>
      </div>

      <div className="sm:w-80">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or phone..." />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-500">No patients found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p: any) => (
            <button key={p.id} onClick={() => openProfile(p.id)} className="bg-white rounded-2xl border border-slate-200 p-5 text-left hover:border-teal-200 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={p.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullName)}&background=14B8A6&color=fff`}
                  alt={p.fullName} className="w-10 h-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{p.fullName}</p>
                  <p className="text-xs text-slate-500">{p.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                {p.bloodGroup && <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">{p.bloodGroup}</span>}
                <span>{p.totalOrders} order{p.totalOrders !== 1 ? 's' : ''}</span>
                {p.lastOrder && <span>Last: {new Date(p.lastOrder.createdAt).toLocaleDateString()}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{selected.fullName}</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-xs text-slate-500">Phone</span><p className="text-sm font-medium">{selected.phone}</p></div>
                <div><span className="text-xs text-slate-500">Email</span><p className="text-sm font-medium">{selected.email || '—'}</p></div>
                <div><span className="text-xs text-slate-500">Blood Group</span><p className="text-sm font-medium">{selected.bloodGroup || '—'}</p></div>
                <div><span className="text-xs text-slate-500">DOB</span><p className="text-sm font-medium">{selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString() : '—'}</p></div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Order History</h3>
                {selected.orders?.length > 0 ? (
                  <div className="space-y-2">
                    {selected.orders.slice(0, 5).map((o: any) => (
                      <div key={o.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                        <div><p className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</p><p className="text-sm text-slate-700">{o.tests?.join(', ')}</p></div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${o.hasResult ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-500">No orders yet</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
