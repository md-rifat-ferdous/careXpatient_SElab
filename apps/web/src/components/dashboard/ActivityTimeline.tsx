import React from 'react';
import { Card, Typography, Skeleton } from '@carexpatient/ui';
import { Clock, Calendar, FileText, CheckCircle } from 'lucide-react';

const activities = [
  { 
    id: 1, 
    type: 'Consultation', 
    title: 'Visit with Dr. Sarah Johnson', 
    date: 'Yesterday, 10:30 AM', 
    icon: <Calendar className="w-4 h-4 text-primary" />,
    status: 'Completed'
  },
  { 
    id: 2, 
    type: 'Prescription', 
    title: 'New Prescription Issued: Amoxicillin', 
    date: 'May 14, 2026', 
    icon: <FileText className="w-4 h-4 text-blue-500" />,
    status: 'Active'
  },
  { 
    id: 3, 
    type: 'Lab Result', 
    title: 'Blood Test Results Uploaded', 
    date: 'May 12, 2026', 
    icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    status: 'Ready'
  },
];

export function ActivityTimeline() {
  return (
    <Card>
      <Typography variant="h3" className="mb-6">Patient Journey</Typography>
      <div className="space-y-6 relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border-soft" />
        
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4 relative z-10">
            <div className="w-8 h-8 rounded-full bg-surface border border-border-soft flex items-center justify-center shadow-sm">
              {activity.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Typography variant="body" className="font-semibold text-sm">{activity.title}</Typography>
                <Typography variant="small" className="text-[10px] text-text-muted">{activity.date}</Typography>
              </div>
              <Typography variant="small" className="text-xs text-text-muted mt-0.5">{activity.type} • {activity.status}</Typography>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ActivityTimelineSkeleton() {
  return (
    <Card className="space-y-6">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
