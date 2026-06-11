import { useState, useEffect } from 'react';

const API = 'http://localhost:5000';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const GATEWAY_ICONS = { bKash: '📱', Nagad: '💚', SSLCommerz: '💳' };
const GATEWAY_COLORS = { bKash: 'bg-pink-50 text-pink-700', Nagad: 'bg-orange-50 text-orange-700', SSLCommerz: 'bg-blue-50 text-blue-700' };
const PAY_STATUS = { Paid: 'bg-emerald-50 text-emerald-700', Pending: 'bg-amber-50 text-amber-700', Failed: 'bg-red-50 text-red-600', Refunded: 'bg-slate-100 text-slate-600' };

function MiniBar({ pct, color }) {
  return (
    <div className="h-2 bg-outline-variant rounded-full overflow-hidden mt-1.5">
      <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

export default function Earnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/earnings`)
      .then(r => r.json())
      .then(res => { if (res.success) setData(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmt = n => `৳${parseFloat(n || 0).toLocaleString('en-BD', { maximumFractionDigits: 0 })}`;

  const analytics = data?.analytics || [];
  const maxDay = Math.max(...analytics.map(d => parseFloat(d.total)), 1);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <span className="material-symbols-outlined animate-spin text-primary-container text-5xl">refresh</span>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Earnings</h2>
        <p className="text-on-surface-variant font-medium mt-1">Track your lab's revenue and financial performance</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Daily Earnings',   val: fmt(data?.daily),   icon: 'today',        bg: 'bg-teal-50',   color: 'text-teal-600',   badge: 'Today' },
          { label: 'Weekly Earnings',  val: fmt(data?.weekly),  icon: 'date_range',   bg: 'bg-violet-50', color: 'text-violet-600', badge: 'This Week' },
          { label: 'Monthly Earnings', val: fmt(data?.monthly), icon: 'calendar_month', bg: 'bg-amber-50', color: 'text-amber-600', badge: 'This Month' },
        ].map(s => (
          <div key={s.label} className="bg-surface-white p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 ${s.bg} ${s.color} rounded-xl`}><span className="material-symbols-outlined">{s.icon}</span></div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>{s.badge}</span>
            </div>
            <p className="text-on-surface-variant text-sm font-semibold">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart (7-day bar) */}
        <div className="lg:col-span-2 bg-surface-white rounded-2xl border border-outline-variant shadow-sm p-6">
          <h3 className="font-bold text-on-surface text-lg mb-5">7-Day Revenue</h3>
          <div className="flex items-end gap-3 h-48">
            {analytics.map((d, i) => {
              const pct = (parseFloat(d.total) / maxDay) * 100;
              const day = new Date(d.day);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-primary-container">{pct > 0 ? fmt(d.total) : ''}</span>
                  <div className="w-full flex items-end" style={{ height: '140px' }}>
                    <div
                      className="w-full bg-primary-container/80 rounded-t-lg hover:bg-primary-container transition-all duration-700"
                      style={{ height: `${Math.max(pct, 4)}%`, minHeight: '4px' }}
                    />
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
            {analytics.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">
                No analytics data available.
              </div>
            )}
          </div>
        </div>

        {/* Test-wise Revenue */}
        <div className="bg-surface-white rounded-2xl border border-outline-variant shadow-sm p-6">
          <h3 className="font-bold text-on-surface text-lg mb-5">Test Revenue Share</h3>
          <div className="space-y-4">
            {(data?.testBreakdown || []).slice(0, 6).map((t, i) => {
              const maxRev = Math.max(...(data?.testBreakdown || []).map(x => parseFloat(x.total_revenue)), 1);
              const pct = (parseFloat(t.total_revenue) / maxRev) * 100;
              const colors = ['bg-primary-container', 'bg-violet-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500'];
              return (
                <div key={i}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-on-surface truncate pr-2">{t.name}</span>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-primary-container">{fmt(t.total_revenue)}</span>
                      <span className="text-[10px] text-on-surface-variant ml-1">×{t.test_count}</span>
                    </div>
                  </div>
                  <MiniBar pct={pct} color={colors[i % colors.length]} />
                </div>
              );
            })}
            {(data?.testBreakdown || []).length === 0 && (
              <p className="text-sm text-on-surface-variant text-center py-6">No revenue data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-surface-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant">
          <h3 className="font-bold text-on-surface text-lg">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-off-white text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                {['Transaction ID', 'Patient', 'Order', 'Amount', 'Gateway', 'Date', 'Status'].map(h => (
                  <th key={h} className="px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {(data?.transactions || []).map(t => (
                <tr key={t.id} className="hover:bg-primary-container/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">{t.transaction_id || `TXN-${t.id}`}</td>
                  <td className="px-6 py-4 font-semibold text-sm text-on-surface">{t.patient_name}</td>
                  <td className="px-6 py-4 text-sm text-primary-container font-bold">#{String(t.order_id).padStart(4,'0')}</td>
                  <td className="px-6 py-4 font-bold text-sm">৳{parseFloat(t.amount || 0).toFixed(0)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${GATEWAY_COLORS[t.gateway] || 'bg-slate-100 text-slate-600'}`}>
                      {GATEWAY_ICONS[t.gateway] || '💰'} {t.gateway || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {t.paid_at ? new Date(t.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PAY_STATUS[t.status] || 'bg-slate-100 text-slate-600'}`}>
                      {t.status || '—'}
                    </span>
                  </td>
                </tr>
              ))}
              {(data?.transactions || []).length === 0 && (
                <tr><td colSpan={7} className="px-6 py-14 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl block mb-3 opacity-25">receipt_long</span>
                  No transactions recorded yet.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
