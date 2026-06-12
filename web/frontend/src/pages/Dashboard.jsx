import { useState, useEffect } from 'react';
import { fetchDashboard as demoFetchDashboard } from '../store/demoData';

function StatCard({ icon, iconBg, iconColor, label, value, badge, badgeColor }) {
  return (
    <div className="bg-surface-white p-5 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 ${iconBg} ${iconColor} rounded-xl`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-on-surface-variant text-sm font-semibold">{label}</p>
      <p className="text-3xl font-bold mt-1 text-on-surface">{value}</p>
    </div>
  );
}

const STATUS_STYLES = {
  Requested:       { dot: 'bg-amber-500 animate-pulse', text: 'text-amber-600', label: 'New Request' },
  AcceptedByLab:   { dot: 'bg-teal-500',                text: 'text-teal-600',  label: 'Accepted' },
  SampleCollected: { dot: 'bg-blue-500',                text: 'text-blue-600',  label: 'Sample Collected' },
  Processing:      { dot: 'bg-blue-500',                text: 'text-blue-600',  label: 'Processing' },
  Reported:        { dot: 'bg-emerald-500',             text: 'text-emerald-600', label: 'Completed' },
  Cancelled:       { dot: 'bg-red-400',                 text: 'text-red-500',   label: 'Cancelled' },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    demoFetchDashboard()
      .then(res => { if (res.success) setData(res.data); })
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(n);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <span className="material-symbols-outlined animate-spin text-primary-container text-5xl">refresh</span>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Dashboard</h2>
          <p className="text-on-surface-variant font-medium mt-1">Welcome back, Dr. S. Rahman — here's today's overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-white border border-outline-variant rounded-2xl text-sm font-semibold shadow-sm hover:shadow transition-all">
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary-container text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon="today" iconBg="bg-violet-50" iconColor="text-violet-600" label="Today's Tests" value={data?.todaysTests ?? 0} badge="Today" badgeColor="bg-violet-50 text-violet-600" />
        <StatCard icon="pending_actions" iconBg="bg-amber-50" iconColor="text-amber-600" label="Pending Tests" value={data?.pendingTests ?? 0} badge="Active" badgeColor="bg-amber-50 text-amber-600" />
        <StatCard icon="task_alt" iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Completed Tests" value={data?.completedTests ?? 0} badge="+15%" badgeColor="bg-emerald-50 text-emerald-600" />
        <StatCard icon="payments" iconBg="bg-teal-50" iconColor="text-teal-600" label="Total Revenue" value={fmt(data?.totalRevenue ?? 0)} badge="All Time" badgeColor="bg-teal-50 text-teal-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-surface-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-bold text-on-surface text-lg">Recent Activities</h3>
            <a href="/test-queue" className="text-sm text-primary-container font-semibold hover:underline">View All →</a>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-background-off-white text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {(data?.recentActivities ?? []).map(a => {
                const s = STATUS_STYLES[a.status] || STATUS_STYLES.Processing;
                return (
                  <tr key={a.id} className="hover:bg-primary-container/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-on-surface">#{String(a.id).padStart(4, '0')}</td>
                    <td className="px-6 py-4 font-semibold text-sm text-on-surface">{a.patient_name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">{a.home_collection ? 'home' : 'medical_services'}</span>
                        {a.home_collection ? 'Home' : 'In-Lab'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-on-surface">৳{parseFloat(a.total_amount || 0).toFixed(0)}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-bold ${s.text}`}>
                        <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {(data?.recentActivities ?? []).length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant text-sm">No recent activities found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Overview */}
        <div className="bg-surface-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant">
            <h3 className="font-bold text-on-surface text-lg">Order Status Breakdown</h3>
          </div>
          <div className="p-6 space-y-4">
            {(data?.statusStats ?? []).map(s => {
              const style = STATUS_STYLES[s.status] || STATUS_STYLES.Processing;
              const total = (data?.statusStats ?? []).reduce((a, b) => a + parseInt(b.count), 0) || 1;
              const pct = Math.round((parseInt(s.count) / total) * 100);
              return (
                <div key={s.status}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-xs font-bold ${style.text}`}>{style.label}</span>
                    <span className="text-xs font-bold text-on-surface">{s.count}</span>
                  </div>
                  <div className="h-2 bg-outline-variant rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${style.dot.replace('animate-pulse', '').replace('bg-', 'bg-')}`}
                      style={{ width: `${pct}%`, backgroundColor: undefined }}
                    />
                  </div>
                </div>
              );
            })}
            {(data?.statusStats ?? []).length === 0 && (
              <p className="text-on-surface-variant text-sm text-center py-6">No orders yet.</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="px-6 pb-6 space-y-2">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Quick Actions</p>
            <a href="/test-queue" className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant hover:border-primary-container hover:bg-primary-container/5 transition-all group">
              <span className="material-symbols-outlined text-primary-container">queue</span>
              <span className="text-sm font-semibold text-on-surface group-hover:text-primary-container">Open Test Queue</span>
            </a>
            <a href="/upload-reports" className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant hover:border-primary-container hover:bg-primary-container/5 transition-all group">
              <span className="material-symbols-outlined text-primary-container">upload_file</span>
              <span className="text-sm font-semibold text-on-surface group-hover:text-primary-container">Upload Report</span>
            </a>
            <a href="/patients" className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant hover:border-primary-container hover:bg-primary-container/5 transition-all group">
              <span className="material-symbols-outlined text-primary-container">person_search</span>
              <span className="text-sm font-semibold text-on-surface group-hover:text-primary-container">Search Patient</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
