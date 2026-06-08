"use client";

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, Typography, Skeleton } from '@carexpatient/ui';

const mockData = [
  { date: '2026-01-01', bpSystolic: 120, bpDiastolic: 80, sugar: 95 },
  { date: '2026-02-01', bpSystolic: 125, bpDiastolic: 82, sugar: 98 },
  { date: '2026-03-01', bpSystolic: 118, bpDiastolic: 78, sugar: 92 },
  { date: '2026-04-01', bpSystolic: 122, bpDiastolic: 81, sugar: 105 },
  { date: '2026-05-01', bpSystolic: 121, bpDiastolic: 80, sugar: 97 },
];

export function VitalTrends() {
  return (
    <Card className="col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography variant="h3">Health Trends</Typography>
          <Typography variant="small" className="text-text-muted">Blood Pressure & Glucose levels over time</Typography>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <Typography variant="small" className="text-[10px]">Systolic</Typography>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <Typography variant="small" className="text-[10px]">Glucose</Typography>
          </div>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData}>
            <defs>
              <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00A99D" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#00A99D" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#6B7280' }}
              tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short' })}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#6B7280' }} 
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
              }}
            />
            <Area 
              type="monotone" 
              dataKey="bpSystolic" 
              stroke="#00A99D" 
              fillOpacity={1} 
              fill="url(#colorBp)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="sugar" 
              stroke="#3B82F6" 
              fill="transparent"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function VitalTrendsSkeleton() {
  return (
    <Card className="col-span-2 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-[250px] w-full rounded-lg" />
    </Card>
  );
}
