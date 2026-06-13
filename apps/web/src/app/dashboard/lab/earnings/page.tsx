'use client';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import StatCard from '@/components/lab/StatCard';
import { fetchEarnings } from '@/services/lab.service';

export default function EarningsPage() {
  const { user, token } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !token) return;
    fetchEarnings(user.id, token)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id, token]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-slate-900">Earnings</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          iconBg="bg-blue-100" iconColor="text-blue-600"
          label="Today" value={data ? `৳${data.daily.toLocaleString()}` : '—'} loading={loading}
          badge="Daily" badgeColor="bg-blue-100 text-blue-700"
        />
        <StatCard
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          iconBg="bg-indigo-100" iconColor="text-indigo-600"
          label="This Week" value={data ? `৳${data.weekly.toLocaleString()}` : '—'} loading={loading}
          badge="Weekly" badgeColor="bg-indigo-100 text-indigo-700"
        />
        <StatCard
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          iconBg="bg-teal-100" iconColor="text-teal-600"
          label="This Month" value={data ? `৳${data.monthly.toLocaleString()}` : '—'} loading={loading}
          badge="Monthly" badgeColor="bg-teal-100 text-teal-700"
        />
        <StatCard
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          iconBg="bg-emerald-100" iconColor="text-emerald-600"
          label="Total Revenue" value={data ? `৳${data.total.toLocaleString()}` : '—'} loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">7-Day Revenue Trend</h2>
          {loading ? (
            <div className="h-48 bg-slate-100 rounded-xl animate-pulse" />
          ) : data?.dailyAnalytics ? (
            <div className="flex items-end gap-3 h-48">
              {data.dailyAnalytics.map((day: any, i: number) => {
                const maxRevenue = Math.max(...data.dailyAnalytics.map((d: any) => d.revenue), 1);
                const height = (day.revenue / maxRevenue) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-500">৳{day.revenue}</span>
                    <div className="w-full bg-teal-100 rounded-t-lg relative" style={{ height: `${Math.max(height, 4)}%` }}>
                      <div className="absolute bottom-0 left-0 right-0 bg-teal-500 rounded-t-lg transition-all" style={{ height: '100%' }} />
                    </div>
                    <span className="text-[10px] text-slate-400 text-center leading-tight">{day.date.split(',')[0]}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Test Revenue</h2>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse" />)}</div>
          ) : data?.testRevenue ? (
            <div className="space-y-3">
              {data.testRevenue.slice(0, 8).map((t: any, i: number) => {
                const maxRev = Math.max(...data.testRevenue.map((r: any) => r.revenue), 1);
                const pct = (t.revenue / maxRev) * 100;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-700">{t.name}</span><span className="text-slate-500 font-medium">৳{t.revenue}</span></div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-6">No data</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Recent Transactions</h2>
        {loading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}</div>
        ) : data?.transactions?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-100"><th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">ID</th><th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Tests</th><th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">Amount</th><th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">Date</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
                {data.transactions.map((t: any) => (
                  <tr key={t.id}><td className="px-4 py-2 text-sm text-slate-500">#{t.id}</td><td className="px-4 py-2 text-sm text-slate-700">{t.tests}</td><td className="px-4 py-2 text-sm text-slate-900 text-right font-medium">৳{t.amount}</td><td className="px-4 py-2 text-sm text-slate-500 text-right">{new Date(t.date).toLocaleDateString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-slate-500 text-center py-6">No transactions</p>}
      </div>
    </div>
  );
}
