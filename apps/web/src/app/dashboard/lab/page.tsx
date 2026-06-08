"use client";

import React from 'react';
import { 
  Typography, 
  Card, 
  Badge, 
  Button, 
  DataTable,
  cn 
} from '@carexpatient/ui';
import { 
  Microscope, 
  ClipboardCheck, 
  Clock, 
  AlertCircle,
  FileUp,
  FlaskConical
} from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";

interface LabOrder {
  id: string;
  patientName: string;
  testType: string;
  priority: 'Routine' | 'Urgent' | 'Stat';
  status: 'Pending' | 'Sample Collected' | 'Processing' | 'Completed';
  receivedAt: string;
}

const orders: LabOrder[] = [
  { id: 'ORD-552', patientName: 'Rahim Ali', testType: 'Full Blood Count', priority: 'Urgent', status: 'Processing', receivedAt: '09:30 AM' },
  { id: 'ORD-553', patientName: 'Nusrat Jahan', testType: 'Glucose Fasting', priority: 'Routine', status: 'Pending', receivedAt: '10:15 AM' },
  { id: 'ORD-554', patientName: 'Karim Ahmed', testType: 'Lipid Profile', priority: 'Stat', status: 'Sample Collected', receivedAt: '10:45 AM' },
];

export default function LabDashboard() {
  const columns: ColumnDef<LabOrder>[] = [
    { accessorKey: "id", header: "Order ID" },
    { accessorKey: "patientName", header: "Patient" },
    { accessorKey: "testType", header: "Test Type" },
    { 
      accessorKey: "priority", 
      header: "Priority",
      cell: ({ row }) => (
        <Badge variant={row.original.priority === 'Stat' ? 'primary' : 'outline'} className={cn(
          row.original.priority === 'Urgent' && "border-amber-500 text-amber-600 bg-amber-50",
          row.original.priority === 'Stat' && "bg-rose-600 text-white border-none"
        )}>
          {row.original.priority}
        </Badge>
      )
    },
    { 
      accessorKey: "status", 
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            row.original.status === 'Processing' ? 'bg-primary animate-pulse' : 'bg-text-muted'
          )} />
          <Typography variant="small" className="text-xs font-bold">{row.original.status}</Typography>
        </div>
      )
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button size="sm" className="h-9 px-4 gap-2 rounded-xl text-xs font-bold">
          <FileUp className="w-3 h-3" /> Upload Results
        </Button>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="h1">Lab Operations</Typography>
          <Typography variant="body" className="text-text-muted mt-1">Diagnostic Portal · Central Lab #04</Typography>
        </div>
        <Button variant="outline" className="rounded-xl h-12 px-6 gap-2">
          <FlaskConical className="w-4 h-4" /> Inventory Management
        </Button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/10">
          <Typography variant="small" className="font-black text-primary uppercase tracking-widest text-[9px] mb-2">Active Orders</Typography>
          <Typography variant="h2" className="text-3xl text-primary-dark">24</Typography>
        </Card>
        <Card>
          <Typography variant="small" className="font-black text-text-muted uppercase tracking-widest text-[9px] mb-2">Pending Collection</Typography>
          <Typography variant="h2" className="text-3xl">08</Typography>
        </Card>
        <Card className="bg-rose-50 border-rose-100">
          <Typography variant="small" className="font-black text-rose-600 uppercase tracking-widest text-[9px] mb-2">Critical Stats</Typography>
          <Typography variant="h2" className="text-3xl text-rose-700">02</Typography>
        </Card>
      </section>

      <Card className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Microscope className="w-5 h-5 text-primary" />
          <Typography variant="h3">Order Queue</Typography>
        </div>
        <DataTable columns={columns} data={orders} />
      </Card>
    </div>
  );
}
