"use client";

import React from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Badge,
  cn 
} from '@carexpatient/ui';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Clock, 
  Plus,
  ArrowRight,
  Activity,
  Building2,
  Stethoscope
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClinicDashboard() {
  const stats = [
    { label: 'Patient Inflow', value: '142', icon: <Users className="w-5 h-5" />, trend: '+8%', color: 'text-primary bg-primary/10' },
    { label: 'Active Appointments', value: '28', icon: <Calendar className="w-5 h-5" />, trend: 'Today', color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Occupancy Rate', value: '82%', icon: <Activity className="w-5 h-5" />, trend: 'Stable', color: 'text-amber-600 bg-amber-50' },
    { label: 'Staff on Duty', value: '12', icon: <Stethoscope className="w-5 h-5" />, trend: 'Full', color: 'text-blue-600 bg-blue-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <Typography variant="h1">My Clinic</Typography>
            <Typography variant="body" className="text-text-muted mt-1">Operational Overview · Banani Central Branch</Typography>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-12 px-6 border-border-soft hover:bg-surface-muted transition-all">Clinic Settings</Button>
          <Button className="rounded-xl h-12 px-6 shadow-lg shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Add Appointment
          </Button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="group hover:border-primary/30 hover:shadow-soft transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.color)}>
                {stat.icon}
              </div>
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-border-soft bg-surface-muted/50">
                {stat.trend}
              </Badge>
            </div>
            <div>
              <Typography variant="small" className="uppercase tracking-[0.2em] text-[10px] font-black text-text-muted mb-1">
                {stat.label}
              </Typography>
              <Typography variant="h3" className="text-3xl font-black">
                {stat.value}
              </Typography>
            </div>
          </Card>
        ))}
      </section>

      {/* Operational Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Patient Activity Card */}
        <Card className="lg:col-span-2 p-8 overflow-hidden relative group">
          <div className="relative z-10">
            <Typography variant="h2" className="mb-6">Patient Traffic Activity</Typography>
            <div className="h-64 flex items-end gap-2 mb-6">
              {[40, 70, 45, 90, 65, 80, 55, 75, 40, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-primary/10 rounded-t-lg relative group/bar hover:bg-primary transition-colors cursor-pointer" style={{ height: `${h}%` }}>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary-dark text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                    {h}%
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-border-soft/50">
              <Typography variant="small" className="text-text-muted font-bold">Real-time occupancy monitoring</Typography>
              <Button variant="ghost" className="text-primary gap-2 font-black text-xs uppercase tracking-widest">
                Full Report <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <TrendingUp className="absolute top-[-10%] right-[-5%] w-64 h-64 text-primary/5 -rotate-12" />
        </Card>

        {/* Quick Actions & Staff Status */}
        <div className="space-y-8">
          <Card className="p-8">
            <Typography variant="h3" className="mb-6">Staff Performance</Typography>
            <div className="space-y-6">
              {[
                { name: 'Dr. Sarah Johnson', role: 'Cardiologist', status: 'In Consultation', color: 'bg-primary' },
                { name: 'Dr. Michael Chen', role: 'Dermatologist', status: 'Available', color: 'bg-emerald-500' },
                { name: 'Nurse Emily Davis', role: 'Head Nurse', status: 'On Break', color: 'bg-amber-500' },
              ].map((staff, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      {staff.name[4]}
                    </div>
                    <div>
                      <Typography variant="body" className="font-bold text-sm leading-tight">{staff.name}</Typography>
                      <Typography variant="small" className="text-[11px] text-text-muted">{staff.role}</Typography>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] uppercase tracking-tighter flex items-center gap-1.5 px-2 py-0.5 border-border-soft">
                    <div className={cn("w-1.5 h-1.5 rounded-full", staff.color)} />
                    {staff.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-8 rounded-xl h-11 text-xs font-bold uppercase tracking-widest text-text-muted">
              Manage Staff
            </Button>
          </Card>

          <Card className="bg-primary-dark text-white p-8 relative overflow-hidden">
            <div className="relative z-10">
              <Typography variant="h3" className="text-white mb-2">New Clinic Promo</Typography>
              <Typography variant="body" className="text-white/70 text-sm mb-6">Promote your dental health packages this month and reach 500+ new patients.</Typography>
              <Button className="bg-white text-primary hover:bg-surface-muted rounded-xl px-6 h-11 font-bold text-xs uppercase tracking-widest">
                Start Campaign
              </Button>
            </div>
            <Plus className="absolute bottom-[-10%] right-[-10%] w-32 h-32 text-white/5 rotate-45" />
          </Card>
        </div>
      </div>
    </div>
  );
}
