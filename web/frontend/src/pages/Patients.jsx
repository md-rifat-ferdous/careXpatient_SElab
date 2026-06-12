import { useState, useEffect, useCallback } from 'react';
import { fetchPatientsList, fetchPatientProfile, getAvatar } from '../store/demoData';

const STATUS_STYLES = {
  Requested:       { dot: 'bg-amber-500', text: 'text-amber-600 bg-amber-50', label: 'New Request' },
  AcceptedByLab:   { dot: 'bg-teal-500',  text: 'text-teal-600 bg-teal-50',  label: 'Accepted' },
  SampleCollected: { dot: 'bg-blue-500',  text: 'text-blue-600 bg-blue-50',  label: 'Collected' },
  Processing:      { dot: 'bg-blue-500',  text: 'text-blue-600 bg-blue-50',  label: 'Processing' },
  Reported:        { dot: 'bg-emerald-500', text: 'text-emerald-600 bg-emerald-50', label: 'Completed' },
};

function PatientDrawer({ patient, onClose }) {
  if (!patient) return null;
  const profile = patient.profile;
  const history = patient.history || [];
  const reports = patient.reports || [];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-surface-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-background-off-white">
              <img src={getAvatar(0)} alt="Patient" className="h-full w-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-on-surface">{profile?.full_name}</h3>
              <p className="text-xs text-subtle-gray">{profile?.phone} · {profile?.email || '—'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-background-off-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Blood Group', value: profile?.blood_group || '—', icon: 'bloodtype' },
              { label: 'Date of Birth', value: profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : '—', icon: 'cake' },
              { label: 'Address', value: profile?.address || '—', icon: 'location_on' },
            ].map(item => (
              <div key={item.label} className="bg-background-off-white rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[18px] text-primary-container">{item.icon}</span>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{item.label}</p>
                </div>
                <p className="text-sm font-semibold text-on-surface truncate">{item.value}</p>
              </div>
            ))}
          </div>

          <div>
            <h4 className="font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary-container">history</span>
              Test History ({history.length})
            </h4>
            <div className="space-y-2">
              {history.map(h => {
                const s = STATUS_STYLES[h.status] || STATUS_STYLES.Processing;
                return (
                  <div key={h.id} className="flex items-center justify-between p-3 border border-outline-variant rounded-xl hover:bg-background-off-white/50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">#{String(h.id).padStart(4,'0')} — {(h.test_names || []).join(', ') || '—'}</p>
                      <p className="text-xs text-on-surface-variant">{new Date(h.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary-container">৳{parseFloat(h.total_amount || 0).toFixed(0)}</span>
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
              {history.length === 0 && <p className="text-sm text-on-surface-variant text-center py-4">No test history found.</p>}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary-container">description</span>
              Previous Reports ({reports.length})
            </h4>
            <div className="space-y-2">
              {reports.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 border border-outline-variant rounded-xl hover:bg-background-off-white/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-container/10 rounded-lg">
                      <span className="material-symbols-outlined text-primary-container text-[20px]">picture_as_pdf</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{(r.test_names || []).join(', ') || 'Lab Report'}</p>
                      <p className="text-xs text-on-surface-variant">{new Date(r.uploaded_at).toLocaleDateString()} · By {r.uploaded_by || '—'}</p>
                      {r.summary && <p className="text-[11px] text-on-surface-variant mt-0.5 italic">{r.summary}</p>}
                    </div>
                  </div>
                  <span className="flex items-center gap-1 px-3 py-1.5 bg-primary-container/10 text-primary-container text-xs font-bold rounded-lg">
                    <span className="material-symbols-outlined text-[16px]">description</span> Report
                  </span>
                </div>
              ))}
              {reports.length === 0 && <p className="text-sm text-on-surface-variant text-center py-4">No reports available.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsModal({ patient, onClose }) {
  if (!patient) return null;
  const profile = patient.profile;
  const reports = patient.reports || [];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-surface-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[75vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-container/10 rounded-xl">
              <span className="material-symbols-outlined text-primary-container">description</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-on-surface">{profile?.full_name}</h3>
              <p className="text-xs text-subtle-gray">{reports.length} Report{reports.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-background-off-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl block mb-3 opacity-25">description</span>
              <p className="font-semibold">No reports available.</p>
            </div>
          ) : (
            reports.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-xl hover:bg-background-off-white/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-50 rounded-xl">
                    <span className="material-symbols-outlined text-red-500 text-[22px]">picture_as_pdf</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{(r.test_names || []).join(', ')}</p>
                    <p className="text-xs text-on-surface-variant">{new Date(r.uploaded_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                    {r.summary && <p className="text-[11px] text-primary-container mt-1">{r.summary}</p>}
                  </div>
                </div>
                <span className="flex items-center gap-1 px-3 py-1.5 bg-primary-container/10 text-primary-container text-[11px] font-bold rounded-lg whitespace-nowrap">
                  <span className="material-symbols-outlined text-[14px]">download</span> View
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FilterDropdown({ filters, onChange }) {
  const [open, setOpen] = useState(false);

  const toggle = (key, value) => {
    if (key === 'gender') {
      onChange({ ...filters, gender: filters.gender === value ? '' : value });
    } else if (key === 'sort') {
      onChange({ ...filters, sort: filters.sort === value ? '' : value });
    } else if (key === 'hasReports') {
      onChange({ ...filters, hasReports: !filters.hasReports });
    }
  };

  const activeCount = [filters.gender, filters.sort, filters.hasReports ? 'Has Reports' : ''].filter(Boolean).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-5 py-3 bg-surface-white border rounded-xl text-sm font-semibold transition-colors shadow-sm ${activeCount > 0 ? 'border-primary-container text-primary-container' : 'border-outline-variant text-on-surface-variant hover:bg-background-off-white'}`}>
        <span className="material-symbols-outlined">filter_list</span>
        Filter{activeCount > 0 && <span className="ml-1 text-[10px] bg-primary-container text-white rounded-full px-1.5 py-0.5">{activeCount}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 bg-surface-white rounded-2xl shadow-xl border border-outline-variant w-64 p-4 space-y-4">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Gender</p>
              <div className="flex gap-2">
                {['Male', 'Female'].map(g => (
                  <button key={g} onClick={() => toggle('gender', g)}
                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${filters.gender === g ? 'bg-primary-container/10 border-primary-container text-primary-container' : 'border-outline-variant text-on-surface-variant hover:bg-background-off-white'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Sort</p>
              <button onClick={() => toggle('sort', 'recent')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${filters.sort === 'recent' ? 'bg-primary-container/10 border-primary-container text-primary-container' : 'border-outline-variant text-on-surface-variant hover:bg-background-off-white'}`}>
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                Most Recent First
              </button>
            </div>
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={filters.hasReports} onChange={() => toggle('hasReports')}
                  className="accent-primary-container w-4 h-4 rounded" />
                <span className="text-xs font-bold text-on-surface">Has Reports</span>
              </label>
            </div>
            {activeCount > 0 && (
              <button onClick={() => onChange({ gender: '', sort: '', hasReports: false })}
                className="w-full text-xs font-semibold text-error hover:text-error/80 text-center pt-2 border-t border-outline-variant">
                Clear All Filters
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ gender: '', sort: '', hasReports: false });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reportsView, setReportsView] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchPatients = useCallback(() => {
    setLoading(true);
    fetchPatientsList(search, filters)
      .then(res => { if (res.success) setPatients(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, filters]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const openProfile = async (id) => {
    setLoadingProfile(true);
    const res = await fetchPatientProfile(id);
    setLoadingProfile(false);
    if (res?.success) setSelected(res.data);
  };

  const openReports = async (id) => {
    const res = await fetchPatientProfile(id);
    if (res?.success) setReportsView(res.data);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {selected && <PatientDrawer patient={selected} onClose={() => setSelected(null)} />}
      {reportsView && <ReportsModal patient={reportsView} onClose={() => setReportsView(null)} />}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Patients</h2>
          <p className="text-on-surface-variant font-medium mt-1">View patient profiles, test histories, and previous reports</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-lg">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container outline-none text-sm bg-surface-white" />
        </div>
        <FilterDropdown filters={filters} onChange={setFilters} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-primary-container text-5xl">refresh</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {patients.map((p, idx) => (
            <div key={p.id} className="bg-surface-white rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
              <div className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-background-off-white shrink-0 border-2 border-outline-variant">
                    <img src={getAvatar(idx)} alt="Patient" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-on-surface truncate">{p.full_name}</h3>
                    <p className="text-xs text-subtle-gray">{p.phone}</p>
                    {p.blood_group && (
                      <span className="inline-block mt-1 text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">
                        {p.blood_group}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-on-surface-variant">
                  {p.email && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">email</span>
                      <span className="truncate">{p.email}</span>
                    </div>
                  )}
                  {p.date_of_birth && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">cake</span>
                      <span>{new Date(p.date_of_birth).toLocaleDateString()}</span>
                    </div>
                  )}
                  {p.address && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      <span className="truncate">{p.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 pb-5 flex gap-2">
                <button onClick={() => openProfile(p.id)} disabled={loadingProfile}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary-container/10 text-primary-container font-bold text-sm rounded-xl hover:bg-primary-container hover:text-white transition-all duration-200 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  View Details
                </button>
                <button onClick={() => openReports(p.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-surface-white border border-outline-variant text-on-surface-variant font-bold text-sm rounded-xl hover:bg-primary-container/5 hover:text-primary-container hover:border-primary-container transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[18px]">description</span>
                  View Reports
                </button>
              </div>
            </div>
          ))}

          {patients.length === 0 && (
            <div className="col-span-3 text-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl block mb-4 opacity-25">group_off</span>
              <p className="font-semibold">No patients found.</p>
              {search && <p className="text-sm mt-1">Try a different search term.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
