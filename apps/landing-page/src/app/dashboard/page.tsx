'use client';

import React from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const stats = [
    { name: 'Upcoming Appt', value: '03', icon: 'calendar_today', color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Prescriptions', value: '12', icon: 'medication', color: 'text-teal-600', bg: 'bg-teal-50' },
    { name: 'Total Tests', value: '08', icon: 'biotech', color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Specialists', value: '05', icon: 'group', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <section>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, Rahim Ali! 👋</h1>
        <p className="text-slate-500 font-medium">Your health is looking great. You have 2 appointments today.</p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${stat.bg} rounded-xl group-hover:scale-110 transition-transform flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
              </div>
              <div className="p-1.5 bg-slate-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-lg text-slate-400">arrow_outward</span>
              </div>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.name}</p>
            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
              <button className="text-teal-600 text-sm font-bold hover:underline">View All</button>
           </div>
           
           <div className="space-y-4">
             {[1, 2, 3].map((i) => (
               <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 hover:border-teal-100 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                     <span className="material-symbols-outlined text-2xl">
                       {i === 1 ? 'medication' : i === 2 ? 'calendar_today' : 'biotech'}
                     </span>
                  </div>
                  <div className="flex-1">
                     <p className="text-sm font-bold text-slate-900">
                       {i === 1 ? 'New Prescription issued by Dr. Anisur' : i === 2 ? 'Appointment confirmed with Dr. Sarah' : 'Lab Test results uploaded by careX Lab'}
                     </p>
                     <p className="text-xs text-slate-400 mt-0.5">2 hours ago</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all">arrow_forward</span>
               </div>
             ))}
           </div>
        </div>

        {/* Quick Links / Actions */}
        <div className="space-y-6">
           <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
           <div className="grid grid-cols-1 gap-4">
              <Link href="/dashboard/prescriptions" className="bg-teal-600 p-6 rounded-[24px] text-white shadow-lg shadow-teal-100 group hover:bg-teal-700 transition-all">
                 <span className="material-symbols-outlined text-4xl mb-4 opacity-80 group-hover:scale-110 transition-transform block">medication</span>
                 <h4 className="font-bold text-lg mb-1">View Prescriptions</h4>
                 <p className="text-white/70 text-xs leading-relaxed">Check your latest medication and dosage instructions.</p>
              </Link>
              <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm group hover:border-teal-100 transition-all cursor-pointer">
                 <span className="material-symbols-outlined text-4xl text-teal-600 mb-4 opacity-80 group-hover:scale-110 transition-transform block">calendar_month</span>
                 <h4 className="font-bold text-lg text-slate-900 mb-1">Book Appointment</h4>
                 <p className="text-slate-500 text-xs leading-relaxed">Find a specialist and schedule a visit in minutes.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
