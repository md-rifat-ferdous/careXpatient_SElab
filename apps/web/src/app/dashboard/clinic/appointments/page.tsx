"use client";

import React from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Badge, 
  DataTable,
  cn 
} from '@carexpatient/ui';
import { 
  Calendar, 
  Filter, 
  Plus, 
  Search, 
  Clock, 
  User,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  time: string;
  date: string;
  type: 'Online' | 'In-Person';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'In-Progress';
}

const appointments: Appointment[] = [
  { id: 'APT-1024', patientName: 'Rahim Ali', doctorName: 'Dr. Sarah Johnson', time: '10:30 AM', date: 'Oct 24, 2026', type: 'In-Person', status: 'In-Progress' },
  { id: 'APT-1025', patientName: 'Nusrat Jahan', doctorName: 'Dr. Michael Chen', time: '11:15 AM', date: 'Oct 24, 2026', type: 'Online', status: 'Scheduled' },
  { id: 'APT-1026', patientName: 'Karim Ahmed', doctorName: 'Dr. Sarah Johnson', time: '02:00 PM', date: 'Oct 24, 2026', type: 'In-Person', status: 'Scheduled' },
  { id: 'APT-1027', patientName: 'Fatima Begum', doctorName: 'Dr. Sarah Johnson', time: '03:30 PM', date: 'Oct 24, 2026', type: 'Online', status: 'Cancelled' },
];

export default function AppointmentManagement() {
  const columns: ColumnDef<Appointment>[] = [
    { 
      accessorKey: "patientName", 
      header: "Patient",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-[10px] font-bold text-primary">
            {row.original.patientName[0]}
          </div>
          <Typography variant="body" className="font-bold text-sm">{row.original.patientName}</Typography>
        </div>
      )
    },
    { accessorKey: "doctorName", header: "Doctor" },
    { 
      accessorKey: "time", 
      header: "Schedule",
      cell: ({ row }) => (
        <div>
          <Typography variant="body" className="text-sm font-bold">{row.original.time}</Typography>
          <Typography variant="small" className="text-[10px] text-text-muted">{row.original.date}</Typography>
        </div>
      )
    },
    { 
      accessorKey: "type", 
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest border-border-soft">
          {row.original.type}
        </Badge>
      )
    },
    { 
      accessorKey: "status", 
      header: "Status",
      cell: ({ row }) => (
        <Badge 
          variant={row.original.status === 'In-Progress' ? 'primary' : 'outline'} 
          className={cn(
            "text-[10px] uppercase font-black tracking-widest",
            row.original.status === 'Scheduled' && "bg-blue-50 text-blue-600 border-blue-100",
            row.original.status === 'Cancelled' && "bg-rose-50 text-rose-600 border-rose-100",
            row.original.status === 'Completed' && "bg-emerald-50 text-emerald-600 border-emerald-100"
          )}
        >
          {row.original.status}
        </Badge>
      )
    },
    {
      id: "actions",
      header: "",
      cell: () => (
        <div className="flex justify-end">
          <button className="p-2 hover:bg-surface-muted rounded-lg transition-colors text-text-muted">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h1">Appointment Center</Typography>
          <Typography variant="body" className="text-text-muted mt-1">Manage all clinic consultations and bookings.</Typography>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-xl border-border-soft gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
          <Button className="h-12 px-8 rounded-xl shadow-lg shadow-primary/20 gap-2 font-black">
            <Plus className="w-4 h-4" /> Book Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 p-6 bg-surface-muted/30">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <Typography variant="h4" className="text-2xl font-black">12</Typography>
            <Typography variant="small" className="text-text-muted uppercase tracking-widest text-[9px] font-black">Pending Approval</Typography>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-6 bg-surface-muted/30">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <Typography variant="h4" className="text-2xl font-black">28</Typography>
            <Typography variant="small" className="text-text-muted uppercase tracking-widest text-[9px] font-black">Confirmed Today</Typography>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-6 bg-surface-muted/30">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <Typography variant="h4" className="text-2xl font-black">04</Typography>
            <Typography variant="small" className="text-text-muted uppercase tracking-widest text-[9px] font-black">Emergency/Stat</Typography>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-8 border-b border-border-soft/50 flex justify-between items-center bg-surface-muted/10">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              placeholder="Search by patient name, ID or doctor..." 
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-border-soft focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-sm outline-none"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="h-10 px-4 rounded-lg bg-primary text-white font-bold text-xs">List View</Button>
            <Button variant="ghost" className="h-10 px-4 rounded-lg text-text-muted font-bold text-xs hover:bg-surface-muted">Calendar View</Button>
          </div>
        </div>
        <div className="p-8">
          <DataTable columns={columns} data={appointments} />
        </div>
      </Card>
    </div>
  );
}
