"use client";

import React from 'react';
import { 
  Card, 
  Typography, 
  Badge, 
  Button, 
  Avatar,
  DataTable,
  cn 
} from '@carexpatient/ui';
import { 
  FileText, 
  Search, 
  UserPlus, 
  MoreHorizontal,
  History,
  MessageSquare
} from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";

interface PatientRecord {
  id: string;
  name: string;
  lastVisit: string;
  nextAppointment?: string;
  conditions: string[];
  status: 'Active' | 'Stable' | 'Critical';
  avatar?: string;
}

const patients: PatientRecord[] = [
  { id: '1', name: 'Rahim Ali', lastVisit: '12 May 2026', nextAppointment: 'Tomorrow', conditions: ['Hypertension', 'Type 2 Diabetes'], status: 'Stable' },
  { id: '2', name: 'Nusrat Jahan', lastVisit: '14 May 2026', conditions: ['Common Cold'], status: 'Active', avatar: 'https://i.pravatar.cc/150?u=nusrat' },
  { id: '3', name: 'Karim Ahmed', lastVisit: '01 May 2026', nextAppointment: '20 May', conditions: ['Post-Surgery Recovery'], status: 'Critical' },
];

export default function PatientDirectory() {
  const columns: ColumnDef<PatientRecord>[] = [
    {
      accessorKey: "name",
      header: "Patient Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.original.avatar} fallback={row.original.name[0]} size="sm" />
          <Typography variant="body" className="font-bold text-sm">{row.original.name}</Typography>
        </div>
      ),
    },
    {
      accessorKey: "lastVisit",
      header: "Last Visit",
    },
    {
      accessorKey: "conditions",
      header: "Primary Conditions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.conditions.map((c, i) => (
            <Badge key={i} variant="outline" className="text-[9px] border-primary/10 text-primary bg-primary/5">
              {c}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Clinical Status",
      cell: ({ row }) => (
        <Badge 
          variant={row.original.status === 'Critical' ? 'primary' : 'outline'}
          className={cn(
            "text-[10px] font-black uppercase tracking-widest px-3 py-1",
            row.original.status === 'Stable' && "bg-emerald-50 text-emerald-600 border-emerald-100",
            row.original.status === 'Critical' && "bg-rose-500 text-white border-none shadow-md shadow-rose-500/20"
          )}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl text-text-muted hover:text-primary">
            <History className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl text-text-muted hover:text-primary">
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button size="sm" className="h-9 px-4 gap-2 rounded-xl text-xs font-bold shadow-soft">
            <FileText className="w-3 h-3" /> Records
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Typography variant="h1">Patient Directory</Typography>
          <Typography variant="body" className="text-text-muted mt-1">Accessing 1,248 total patient records.</Typography>
        </div>
        <Button className="rounded-xl h-12 px-6 shadow-lg shadow-primary/20 gap-2">
          <UserPlus className="w-4 h-4" /> Register New Patient
        </Button>
      </div>

      <Card className="p-8">
        <DataTable columns={columns} data={patients} searchKey="name" />
      </Card>
    </div>
  );
}
