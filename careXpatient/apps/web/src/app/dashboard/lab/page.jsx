'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import {
  getLabPatients,
  getPendingUploads } from

'@/services/lab.service';

export default function LabDashboard() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  const [stats, setStats] = useState({ totalPatients: 0, pendingUploads: 0 });
  const [recentPending, setRecentPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const [patientsRes, pendingRes] = await Promise.all([
      getLabPatients(token, 1, '', 1),
      getPendingUploads(token, 1, 3)]
      );
      setStats({
        totalPatients: patientsRes.total,
        pendingUploads: pendingRes.total
      });
      setRecentPending(pendingRes.data.slice(0, 3));
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (name) => {
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="max-w-[1280px] mx-auto p-6 space-y-8 animate-fade-in bg-[#F8FAFC]">
      {/* ── Welcome Banner ── */}
      <div className="bg-gradient-to-r from-[#006b5f] to-[#14b8a6] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
        <div>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Diagnostic Lab Portal 🧪</p>
          <h1 className="text-2xl font-bold">
            {greeting()}, {user?.fullName || 'Lab Staff'}
          </h1>
          <p className="text-white/80 text-sm mt-1">
            Accuracy, integrity, and speed in healthcare delivery.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all active:scale-95 shrink-0">
          
          <span className="material-symbols-outlined text-[18px]">sync</span>
          Refresh Stats
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error &&
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-2 text-sm">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
        </div>
      }

      {/* ── Stats Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Total Patients */}
        <Link
          href="/dashboard/lab/patients"
          className="bg-white p-6 rounded-xl shadow-sm border border-[#bbcac6]/25 hover:border-[#006b5f]/30 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer">
          
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#006b5f]/10 text-[#006b5f] rounded-xl group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[24px]">groups</span>
            </div>
            <span className="text-xs text-[#006b5f] font-semibold flex items-center gap-0.5">
              View Database
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </span>
          </div>
          <div>
            <p className="text-xs text-[#3c4947] font-semibold uppercase tracking-wider">Total Patients</p>
            <h3 className="text-4xl font-extrabold text-[#111c2d] mt-1">
              {loading ?
              <span className="inline-block w-16 h-8 bg-slate-100 animate-pulse rounded" /> :

              stats.totalPatients
              }
            </h3>
          </div>
        </Link>

        {/* Metric 2: Pending Uploads */}
        <Link
          href="/dashboard/lab/upload-reports"
          className="bg-white p-6 rounded-xl shadow-sm border border-[#bbcac6]/25 hover:border-[#14b8a6]/30 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer">
          
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[24px]">pending_actions</span>
            </div>
            <span className="text-xs text-amber-600 font-semibold flex items-center gap-0.5">
              Upload Portal
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </span>
          </div>
          <div>
            <p className="text-xs text-[#3c4947] font-semibold uppercase tracking-wider">Pending Uploads</p>
            <h3 className="text-4xl font-extrabold text-[#006b5f] mt-1">
              {loading ?
              <span className="inline-block w-16 h-8 bg-slate-100 animate-pulse rounded" /> :

              stats.pendingUploads
              }
            </h3>
          </div>
        </Link>

        {/* Metric 3: Completed Reports */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#bbcac6]/25 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#e7eeff] text-[#006b5f] rounded-xl">
              <span className="material-symbols-outlined text-[24px]">check_circle</span>
            </div>
            <span className="text-xs text-[#3c4947] font-medium">Daily Goal</span>
          </div>
          <div>
            <p className="text-xs text-[#3c4947] font-semibold uppercase tracking-wider">Completed Today</p>
            <h3 className="text-4xl font-extrabold text-[#111c2d] mt-1">
              {loading ?
              <span className="inline-block w-16 h-8 bg-slate-100 animate-pulse rounded" /> :

              45
              }
            </h3>
          </div>
        </div>
      </div>

      {/* ── Main Dashboard Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Pending Reports Queue */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#bbcac6]/25 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#111c2d]">Recent Pending Reports</h3>
              <Link
                href="/dashboard/lab/upload-reports"
                className="text-xs font-semibold text-[#006b5f] hover:underline">
                
                View Full Queue ({stats.pendingUploads})
              </Link>
            </div>

            <div className="space-y-4">
              {loading ?
              [...Array(3)].map((_, i) =>
              <div key={i} className="animate-pulse flex items-center justify-between p-4 border border-[#bbcac6]/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100" />
                      <div className="space-y-1">
                        <div className="h-4 bg-slate-100 rounded w-24" />
                        <div className="h-3 bg-slate-100 rounded w-32" />
                      </div>
                    </div>
                    <div className="h-8 bg-slate-100 rounded w-16" />
                  </div>
              ) :
              recentPending.length === 0 ?
              <div className="text-center py-10 text-[#3c4947]">
                  <span className="material-symbols-outlined text-4xl text-[#bbcac6]">task_alt</span>
                  <p className="mt-2 text-sm font-semibold">All caught up!</p>
                  <p className="text-xs text-[#94A3B8] mt-1">There are no pending lab orders awaiting report uploads.</p>
                </div> :

              recentPending.map((order) => {
                const testName = order.tests.map((t) => t.name).join(', ');
                const testCategory = order.tests[0]?.category || 'General';
                const initials = getInitials(order.patient.fullName);

                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-[#bbcac6]/20 hover:border-[#14b8a6]/30 hover:bg-[#F8FAFC]/50 rounded-xl transition-all">
                    
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#6ef9e2]/30 flex items-center justify-center text-[#007164] font-bold text-sm shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#111c2d] text-sm truncate">{order.patient.fullName}</p>
                          <p className="text-xs text-[#3c4947] mt-0.5 truncate">
                            {testName} &bull; <span className="font-semibold text-[#006b5f]">{testCategory}</span>
                          </p>
                        </div>
                      </div>
                      <button
                      onClick={() => router.push('/dashboard/lab/upload-reports')}
                      className="bg-[#14b8a6] hover:bg-[#0d9488] text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1 shrink-0 active:scale-95">
                      
                        <span className="material-symbols-outlined text-[14px]">cloud_upload</span>
                        Upload
                      </button>
                    </div>);

              })
              }
            </div>
          </div>

          {!loading && recentPending.length > 0 &&
          <div className="mt-6 pt-4 border-t border-[#bbcac6]/10 text-center">
              <Link
              href="/dashboard/lab/upload-reports"
              className="text-xs text-[#006b5f] hover:text-[#006b5f]/80 font-bold flex items-center justify-center gap-1 transition-colors">
              
                Go to Upload Reports Queue
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
            </div>
          }
        </div>

        {/* Right Column: Quick Navigation & DGHS Guidelines */}
        <div className="space-y-6">
          {/* Quick Actions Shortcuts */}
          <div className="bg-white rounded-xl shadow-sm border border-[#bbcac6]/25 p-6">
            <h3 className="text-sm font-bold text-[#111c2d] uppercase tracking-wider mb-4">Quick Navigation</h3>
            <div className="space-y-3">
              <Link
                href="/dashboard/lab/patients"
                className="flex items-center gap-3 p-3 border border-[#bbcac6]/20 rounded-xl hover:bg-[#006b5f]/5 hover:border-[#006b5f]/30 transition-all group cursor-pointer">
                
                <div className="w-10 h-10 rounded-lg bg-[#006b5f]/10 text-[#006b5f] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-[#111c2d] text-sm group-hover:text-[#006b5f] transition-colors">Patients List</h4>
                  <p className="text-xs text-[#3c4947]">View patient diagnostic histories</p>
                </div>
              </Link>

              <Link
                href="/dashboard/lab/upload-reports"
                className="flex items-center gap-3 p-3 border border-[#bbcac6]/20 rounded-xl hover:bg-[#14b8a6]/5 hover:border-[#14b8a6]/30 transition-all group cursor-pointer">
                
                <div className="w-10 h-10 rounded-lg bg-[#14b8a6]/10 text-[#14b8a6] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">cloud_upload</span>
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-[#111c2d] text-sm group-hover:text-[#14b8a6] transition-colors">Upload Results</h4>
                  <p className="text-xs text-[#3c4947]">Submit new medical reports</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Compliance & Safety Checklist */}
          <div className="bg-white rounded-xl shadow-sm border border-[#bbcac6]/25 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-amber-500">verified_user</span>
              <h3 className="text-sm font-bold text-[#111c2d] uppercase tracking-wider">DGHS Compliance Guidelines</h3>
            </div>
            <ul className="space-y-3 text-xs text-[#3c4947]">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[16px] mt-0.5">check_circle</span>
                <span>Verify Patient Name and ID on all sample collection vials prior to laboratory ingestion.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[16px] mt-0.5">check_circle</span>
                <span>Upload official pathology report PDF results containing registered pathologist signature.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[16px] mt-0.5">check_circle</span>
                <span>Notify clinical authorities immediately regarding any panic/critical lab result values.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[16px] mt-0.5">check_circle</span>
                <span>Strictly ensure uploaded result files do not exceed the max limit of 15MB.</span>
              </li>
            </ul>
          </div>
        </div>
        
      </div>
    </div>);

}