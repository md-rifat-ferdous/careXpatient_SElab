"use client";

import React from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  DataTable,
  Badge,
  cn 
} from '@carexpatient/ui';
import { 
  Search, 
  Plus, 
  User, 
  MoreVertical, 
  ExternalLink,
  History,
  FileText
} from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";

interface PatientRecord {
  id: string;
  name: string;
  gender: 'M' | 'F';
  age: number;
  lastVisit: string;
  condition: string;
  status: 'Active' | 'Under Observation' | 'Discharged';
}

const patients: PatientRecord[] = [
  { id: 'PAT-4401', name: 'Rahim Ali', gender: 'M', age: 45, lastVisit: '2 days ago', condition: 'Hypertension', status: 'Under Observation' },
  { id: 'PAT-4402', name: 'Nusrat Jahan', gender: 'F', age: 32, lastVisit: '1 week ago', condition: 'Type 2 Diabetes', status: 'Active' },
  { id: 'PAT-4403', name: 'Karim Ahmed', gender: 'M', age: 28, lastVisit: '3 days ago', condition: 'Annual Checkup', status: 'Discharged' },
  { id: 'PAT-4404', name: 'Fatima Begum', gender: 'F', age: 52, lastVisit: 'Yesterday', condition: 'Post-Surgery', status: 'Active' },
];

export default function PatientManagement() {
  const columns: ColumnDef<PatientRecord>[] = [
    { 
      accessorKey: "name", 
      header: "Patient Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center font-black text-primary text-xs">
            {row.original.name[0]}
          </div>
          <div>
            <Typography variant="body" className="font-bold text-sm leading-tight">{row.original.name}</Typography>
            <Typography variant="small" className="text-[10px] text-text-muted">{row.original.id}</Typography>
          </div>
        </div>
      )
    },
    { 
      accessorKey: "age", 
      header: "Profile",
      cell: ({ row }) => (
        <Typography variant="small" className="text-xs font-bold text-text-muted">
          {row.original.gender === 'M' ? 'Male' : 'Female'} · {row.original.age} yrs
        </Typography>
      )
    },
    { 
      accessorKey: "condition", 
      header: "Condition",
      cell: ({ row }) => (
        <Typography variant="small" className="text-xs font-bold">{row.original.condition}</Typography>
      )
    },
    { accessorKey: "lastVisit", header: "Last Visit" },
    { 
      accessorKey: "status", 
      header: "Status",
      cell: ({ row }) => (
        <Badge 
          variant={row.original.status === 'Active' ? 'primary' : 'outline'}
          className={cn(
            "text-[9px] uppercase font-black tracking-widest px-2 py-0.5 border-border-soft",
            row.original.status === 'Discharged' && "bg-surface-muted text-text-muted"
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
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" className="h-9 px-3 gap-2 rounded-lg text-xs font-bold text-primary hover:bg-primary/5">
            <FileText className="w-3 h-3" /> Records
          </Button>
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
          <Typography variant="h1">Patient Directory</Typography>
          <Typography variant="body" className="text-text-muted mt-1">Access and manage comprehensive medical histories.</Typography>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-xl border-border-soft gap-2">
            <History className="w-4 h-4" /> Recent Updates
          </Button>
          <Button className="h-12 px-8 rounded-xl shadow-lg shadow-primary/20 gap-2 font-black">
            <Plus className="w-4 h-4" /> Register Patient
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-8 border-b border-border-soft/50 flex justify-between items-center bg-surface-muted/5">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              placeholder="Search patients by name, ID or mobile..." 
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-border-soft focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-sm outline-none"
            />
          </div>
          <div className="flex gap-4">
             <div className="text-right">
               <Typography variant="small" className="text-[10px] font-black text-text-muted uppercase tracking-widest">Total Registered</Typography>
               <Typography variant="h4" className="text-xl font-black">1,420</Typography>
             </div>
             <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
               <User className="w-6 h-6" />
             </div>
          </div>
        </div>
        <div className="p-8">
          <DataTable columns={columns} data={patients} />
        </div>
      </Card>
    </div>
  );
}
