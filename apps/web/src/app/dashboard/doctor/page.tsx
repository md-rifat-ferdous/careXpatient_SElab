"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Typography, 
  Card, 
  Button, 
  Badge,
  cn 
} from '@carexpatient/ui';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  Plus,
  Activity,
  Award
} from 'lucide-react';
import { ClinicQueue } from '@/components/doctor/ClinicQueue';

export default function DoctorDashboard() {
  const stats = [
    { label: 'Total Patients', value: '1.2K', icon: <Users className="w-5 h-5" />, color: 'text-primary bg-primary/10', trend: '+12%' },
    { label: 'Appointments', value: '42', icon: <Calendar className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50', trend: 'Today' },
    { label: 'Avg. Rating', value: '4.9', icon: <Award className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50', trend: 'Top 5%' },
    { label: 'Clinical Hours', value: '160', icon: <Clock className="w-5 h-5" />, color: 'text-rose-600 bg-rose-50', trend: 'This Month' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Typography variant="h1">Doctor Workspace</Typography>
          <Typography variant="body" className="text-text-muted mt-1">Welcome back, Dr. Sarah Johnson. You have 12 patients in the queue.</Typography>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-12 px-6">Manage Schedule</Button>
          <Button className="rounded-xl h-12 px-6 shadow-lg shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> New Consultation
          </Button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="group hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.color)}>
                {stat.icon}
              </div>
              <Typography variant="small" className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-full uppercase tracking-widest">
                {stat.trend}
              </Typography>
            </div>
            <div>
              <Typography variant="small" className="uppercase tracking-[0.2em] text-[10px] font-bold text-text-muted">
                {stat.label}
              </Typography>
              <Typography variant="h3" className="text-2xl mt-1">
                {stat.value}
              </Typography>
            </div>
          </Card>
        ))}
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Queue & Performance */}
        <div className="lg:col-span-2 space-y-8">
          <ClinicQueue />
          
          <Card className="p-8 bg-gradient-to-br from-primary-dark to-primary text-white overflow-hidden relative">
            <div className="relative z-10">
              <Typography variant="h2" className="text-white mb-2">Practice Performance</Typography>
              <Typography variant="body" className="text-white/70 mb-6 max-w-md">Your clinic has seen a 15% increase in online consultations this week. Keep up the great work!</Typography>
              <Button className="bg-white text-primary hover:bg-surface-muted rounded-xl px-8 font-bold">
                Detailed Analytics <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <Activity className="absolute bottom-[-20%] right-[-10%] w-64 h-64 text-white/5" />
          </Card>
        </div>

        {/* Right: Notifications & Quick Access */}
        <div className="space-y-8">
           <Card className="h-fit">
              <Typography variant="h3" className="mb-6">Clinical Updates</Typography>
              <div className="space-y-6">
                {[
                  { title: 'New Lab Results', desc: 'Patient: Nusrat Jahan', time: '10 mins ago', color: 'bg-blue-100 text-blue-600' },
                  { title: 'Appointment Request', desc: 'Patient: Rahim Ali', time: '1 hour ago', color: 'bg-primary/10 text-primary' },
                  { title: 'System Maintenance', desc: 'Scheduled for midnight', time: '2 hours ago', color: 'bg-amber-100 text-amber-600' },
                ].map((update, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", update.color)}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <Typography variant="body" className="font-bold text-sm leading-none mb-1">{update.title}</Typography>
                      <Typography variant="small" className="text-[11px] text-text-muted">{update.desc}</Typography>
                      <Typography variant="small" className="text-[9px] text-text-muted uppercase tracking-widest mt-1 block">{update.time}</Typography>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-8 text-xs font-bold uppercase tracking-widest text-text-muted hover:text-primary">
                Clear All
              </Button>
           </Card>

           <Card className="bg-surface-muted/50 border-dashed">
              <Typography variant="h3" className="mb-4">Quick Tools</Typography>
              <div className="grid grid-cols-2 gap-3">
                {['E-Prescription', 'Lab Referral', 'Medical Certificate', 'Report Viewer'].map((tool) => (
                  <button key={tool} className="p-3 bg-white border border-border-soft rounded-xl text-[10px] font-bold text-text-muted hover:border-primary/30 hover:text-primary transition-all text-center">
                    {tool}
                  </button>
                ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
