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
  Plus, 
  Calendar, 
  Clock, 
  Search, 
  MoreVertical,
  Stethoscope,
  Mail,
  Phone
} from 'lucide-react';

const doctors = [
  { id: 'DOC-001', name: 'Dr. Sarah Johnson', specialty: 'Cardiology', shifts: '09:00 AM - 02:00 PM', status: 'On-Duty', avatar: 'S' },
  { id: 'DOC-002', name: 'Dr. Michael Chen', specialty: 'Dermatology', shifts: '10:00 AM - 06:00 PM', status: 'Available', avatar: 'M' },
  { id: 'DOC-003', name: 'Dr. Emily Davis', specialty: 'Pediatrics', shifts: '02:00 PM - 08:00 PM', status: 'Off-Duty', avatar: 'E' },
  { id: 'DOC-004', name: 'Dr. James Wilson', specialty: 'Orthopedics', shifts: '08:00 AM - 12:00 PM', status: 'On-Duty', avatar: 'J' },
];

export default function DoctorManagement() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h1">Medical Staff</Typography>
          <Typography variant="body" className="text-text-muted mt-1">Manage physicians, schedules, and clinical availability.</Typography>
        </div>
        <Button className="h-12 px-8 rounded-xl shadow-lg shadow-primary/20 gap-2 font-black">
          <Plus className="w-4 h-4" /> Add New Staff
        </Button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input 
          placeholder="Filter staff by name or specialty..." 
          className="w-full h-12 pl-12 pr-4 rounded-xl border border-border-soft focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-sm outline-none bg-surface"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => (
          <Card key={doc.id} className="p-0 overflow-hidden group hover:shadow-soft transition-all duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-black shadow-inner shadow-primary/5 group-hover:scale-110 transition-transform">
                  {doc.avatar}
                </div>
                <div className="flex gap-2">
                   <button className="p-2 hover:bg-surface-muted rounded-xl transition-colors">
                    <Mail className="w-4 h-4 text-text-muted" />
                  </button>
                  <button className="p-2 hover:bg-surface-muted rounded-xl transition-colors">
                    <MoreVertical className="w-4 h-4 text-text-muted" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <Typography variant="h3" className="text-lg leading-tight mb-1">{doc.name}</Typography>
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                  <Stethoscope className="w-3 h-3" /> {doc.specialty}
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-border-soft/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Clock className="w-3.5 h-3.5" />
                    <Typography variant="small" className="text-xs font-bold">Shift Hours</Typography>
                  </div>
                  <Typography variant="small" className="text-xs font-medium">{doc.shifts}</Typography>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Calendar className="w-3.5 h-3.5" />
                    <Typography variant="small" className="text-xs font-bold">Availability</Typography>
                  </div>
                  <Badge 
                    variant={doc.status === 'On-Duty' ? 'primary' : 'outline'} 
                    className={cn(
                      "text-[9px] uppercase font-black px-2 py-0.5 border-border-soft",
                      doc.status === 'Available' && "bg-emerald-50 text-emerald-600 border-emerald-100",
                      doc.status === 'Off-Duty' && "bg-surface-muted text-text-muted"
                    )}
                  >
                    {doc.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="p-4 bg-surface-muted/30 border-t border-border-soft/50 flex gap-2">
              <Button variant="ghost" className="flex-1 h-10 rounded-lg text-xs font-bold hover:bg-white transition-colors">View Profile</Button>
              <Button variant="ghost" className="flex-1 h-10 rounded-lg text-xs font-bold text-primary hover:bg-primary/5 transition-colors">Manage Schedule</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
