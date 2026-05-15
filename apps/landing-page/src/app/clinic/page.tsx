
'use client';

import React from 'react';
import { TopNavBar, SideNavBar } from '@/components/reports/Navigation';
import ClinicCard from '@/components/clinic/ClinicCard';
import OverrideCard from '@/components/clinic/OverrideCard';

export default function MyClinicPage() {
  const clinics = [
    {
      name: 'Square Hospital',
      address: '18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka 1205',
      schedule: [
        { day: 'Sat, Mon, Wed', time: '04:00 PM - 08:00 PM' },
        { day: 'Sun, Tue', time: '10:00 AM - 01:00 PM' }
      ]
    },
    {
      name: 'Labaid Specialized',
      address: 'House 06, Road 04, Dhanmondi, Dhaka 1205',
      schedule: [
        { day: 'Sat, Mon, Wed', time: '10:00 AM - 02:00 PM' },
        { day: 'Thu', time: '04:00 PM - 09:00 PM' }
      ]
    },
    {
      name: 'Apollo Hospitals',
      address: 'Zakir Hossain Road, Pahartali, Chittagong 4202',
      isClosed: true
    },
    {
      name: 'Private Chamber',
      address: 'Flat 4A, Green Road, Dhanmondi (Beside Labaid), Dhaka',
      schedule: [
        { day: 'Daily (Except Fri)', time: '08:00 PM - 10:00 PM' }
      ]
    }
  ];

  const overrides = [
    {
      title: 'Emergency Seminar',
      clinic: 'Apollo Hospitals',
      location: 'AP-DHAKA',
      dateRange: 'May 15 - May 20, 2026',
      type: 'Emergency' as const
    },
    {
      title: 'Time Change (Ramadan)',
      clinic: 'Square Hospital',
      location: 'SQ-DHAKA',
      dateRange: 'Mar 12 - Apr 12, 2026',
      type: 'Adjustment' as const
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SideNavBar />
      <main className="flex-1 md:ml-64 flex flex-col min-w-0 bg-slate-50 relative">
        <TopNavBar />
        
        <div className="px-6 pb-12 pt-24 lg:px-8 lg:pb-16 flex-1 overflow-y-auto relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">medical_services</span>
                  </div>
                  <h4 className="text-[11px] font-bold text-teal-600 uppercase tracking-widest">Clinic Management</h4>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Doctor Schedule Manager</h1>
                <p className="text-base text-slate-500 font-medium">
                  Manage your weekly presence across multiple clinics and post temporary routine overrides.
                </p>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-md shadow-teal-600/10 active:scale-95">
                <span className="material-symbols-outlined text-[20px]">add</span>
                Add New Clinic
              </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Routine Section */}
              <div className="lg:col-span-2 space-y-8">
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-teal-500 rounded-full"></div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-600 text-[20px]">event_repeat</span>
                      <h2 className="text-xl font-bold text-slate-900">Standard Weekly Routine</h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {clinics.map((clinic, idx) => (
                      <ClinicCard key={idx} {...clinic} />
                    ))}
                  </div>
                </section>
              </div>

              {/* Sidebar/Overrides Section */}
              <div className="space-y-8">
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-[20px]">notification_important</span>
                      <h2 className="text-xl font-bold text-slate-900">Temporary Overrides</h2>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {overrides.map((override, idx) => (
                      <OverrideCard key={idx} {...override} />
                    ))}
                    
                    <button className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-teal-400 hover:text-teal-600 transition-all group">
                      <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">add_circle</span>
                      New Temporary Override
                    </button>
                  </div>
                </section>

                {/* Helper Info */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-[22px]">info</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">System Info</p>
                      <p className="text-sm font-bold text-slate-700">Active Affiliations</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Showing locations for 4 active clinic affiliations. Temporary overrides will reflect on your public profile instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
