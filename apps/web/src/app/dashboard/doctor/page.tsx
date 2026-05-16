import React from 'react';
import { Users, Calendar, FileText, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function DoctorDashboardPage() {
  const stats = [
    { name: 'Total Patients', value: '128', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Appointments Today', value: '12', icon: Calendar, color: 'text-primary', bg: 'bg-secondary' },
    { name: 'Reports Pending', value: '8', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
    { name: 'Revenue', value: '$12,450', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Welcome back, Dr. Sarah</h1>
        <p className="text-text-muted">Here's what's happening with your practice today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm text-text-muted font-medium">{stat.name}</p>
            <p className="text-2xl font-bold text-text mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text">Upcoming Appointments</h2>
            <button className="text-sm text-primary font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full" />
                  <div>
                    <p className="font-semibold text-text text-sm">Patient Name</p>
                    <p className="text-xs text-text-muted">General Consultation</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text">10:30 AM</p>
                  <p className="text-xs text-text-muted">Today</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text">Recent Patient Activity</h2>
            <button className="text-sm text-primary font-medium">View All</button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="relative">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gray-50" />
                </div>
                <div>
                  <p className="text-sm text-text"><span className="font-bold">John Doe</span> completed a <span className="text-primary font-medium">Blood Test</span></p>
                  <p className="text-xs text-text-muted mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
