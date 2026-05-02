"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function DashboardOverview() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ totalOrders: 0, pending: 0, completed: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/orders?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setRecentOrders(data.slice(0, 3));
          setStats({
            totalOrders: data.length,
            pending: data.filter((o: any) => o.status === 'Pending').length,
            completed: data.filter((o: any) => o.status === 'Completed').length,
          });
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <h2 className="text-2xl font-bold text-on-surface mb-2">Welcome to careXpatient</h2>
        <p className="text-subtle-gray mb-8">Please sign in to view your personalized dashboard.</p>
        <Link href="/auth" className="px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20">
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-on-surface">Hello, {user.fullName}! 👋</h1>
        <p className="text-subtle-gray mt-1 font-medium">Here's what's happening with your health profile today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Bookings', value: stats.totalOrders, icon: 'receipt_long', color: 'bg-blue-50 text-blue-600' },
          { label: 'Pending Tests', value: stats.pending, icon: 'hourglass_empty', color: 'bg-amber-50 text-amber-600' },
          { label: 'Completed Reports', value: stats.completed, icon: 'task_alt', color: 'bg-green-50 text-green-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color}`}>
              <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-subtle-gray uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-on-surface">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-on-surface">Recent Bookings</h2>
            <Link href="/dashboard/reports" className="text-sm font-bold text-primary hover:underline">View All</Link>
          </div>

          {loading ? (
            <div className="h-48 bg-slate-50 border border-slate-100 rounded-[2rem] animate-pulse" />
          ) : recentOrders.length === 0 ? (
            <div className="bg-white p-10 rounded-[2rem] border border-slate-100 text-center">
              <p className="text-subtle-gray font-medium">No recent bookings found.</p>
              <Link href="/dashboard/lab-tests" className="text-primary font-bold mt-2 inline-block">Book your first test →</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-xl">biotech</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface leading-tight">
                        {order.items[0]?.labTest.name} {order.items.length > 1 && `+ ${order.items.length - 1} more`}
                      </p>
                      <p className="text-xs text-subtle-gray mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()} · {order.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-on-surface">৳{order.totalAmount.toLocaleString()}</p>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Paid</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions / Recommendations */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-on-surface">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link href="/dashboard/lab-tests" className="bg-primary p-6 rounded-[2rem] text-white shadow-lg shadow-primary/20 group hover:-translate-y-1 transition-all">
              <span className="material-symbols-outlined text-3xl mb-4 group-hover:scale-110 transition-transform">add_circle</span>
              <p className="font-bold text-lg leading-tight">Book New Lab Test</p>
              <p className="text-white/70 text-xs mt-1">Get home collection today</p>
            </Link>
            
            <div className="bg-teal-50 p-6 rounded-[2rem] border border-teal-100">
              <span className="material-symbols-outlined text-3xl text-teal-600 mb-4">health_and_safety</span>
              <p className="font-bold text-lg text-teal-900 leading-tight">Complete Health Checkup</p>
              <p className="text-teal-700/70 text-xs mt-1">Recommended every 6 months</p>
              <button className="mt-4 text-sm font-bold text-teal-600 underline">Learn More</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
