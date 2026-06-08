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
  Clock, 
  User, 
  Video, 
  MapPin, 
  ExternalLink,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";

interface PatientQueueItem {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  time: string;
  type: 'Online' | 'In-person';
  reason: string;
  status: 'Waiting' | 'In-Progress' | 'Completed';
  avatar?: string;
}

const mockQueue: PatientQueueItem[] = [
  { id: '1', patientName: 'Rahim Ali', age: 45, gender: 'Male', time: '10:00 AM', type: 'In-person', reason: 'Follow-up (Hypertension)', status: 'Waiting' },
  { id: '2', patientName: 'Nusrat Jahan', age: 28, gender: 'Female', time: '10:30 AM', type: 'Online', reason: 'Fever & Cold', status: 'In-Progress', avatar: 'https://i.pravatar.cc/150?u=nusrat' },
  { id: '3', patientName: 'Karim Ahmed', age: 52, gender: 'Male', time: '11:00 AM', type: 'In-person', reason: 'Diabetes Checkup', status: 'Waiting' },
];

export function ClinicQueue() {
  const columns: ColumnDef<PatientQueueItem>[] = [
    {
      accessorKey: "patientName",
      header: "Patient",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.original.avatar} fallback={row.original.patientName[0]} size="sm" />
          <div>
            <Typography variant="body" className="font-bold text-sm">{row.original.patientName}</Typography>
            <Typography variant="small" className="text-[10px] text-text-muted">{row.original.age}Y · {row.original.gender}</Typography>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "time",
      header: "Schedule",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-text-muted" />
          <Typography variant="small" className="font-bold">{row.original.time}</Typography>
          <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">
            {row.original.type}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <Typography variant="small" className="text-xs line-clamp-1 max-w-[200px]">{row.original.reason}</Typography>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge 
          variant={row.original.status === 'In-Progress' ? 'primary' : 'outline'}
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-3 py-1",
            row.original.status === 'Waiting' && "bg-amber-50 text-amber-600 border-amber-100"
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
          <Button size="sm" className="h-9 px-4 gap-2 rounded-xl text-xs font-bold">
            {row.original.type === 'Online' ? <Video className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
            {row.original.status === 'In-Progress' ? 'Resume' : 'Start'}
          </Button>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-text-muted">
             <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-6 border-b border-border-soft flex justify-between items-center bg-surface-muted/30">
        <div>
          <Typography variant="h3">Today&apos;s Clinic Queue</Typography>
          <Typography variant="small" className="text-text-muted">Managing 12 appointments today</Typography>
        </div>
        <div className="flex gap-2">
          <Badge variant="primary" className="h-8 px-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live Queue
          </Badge>
        </div>
      </div>
      <div className="p-0">
        <DataTable columns={columns} data={mockQueue} />
      </div>
    </Card>
  );
}
