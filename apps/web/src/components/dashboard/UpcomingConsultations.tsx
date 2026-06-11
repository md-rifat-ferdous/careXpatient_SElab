import React from 'react';
import { Card, Typography, Skeleton, Avatar, Badge, Button } from '@carexpatient/ui';
import { Video, MapPin, Clock, ArrowRight } from 'lucide-react';

const consultations = [
  {
    id: 1,
    doctor: {
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=200&h=200&auto=format&fit=crop'
    },
    date: 'Today, 2:30 PM',
    type: 'Video Call',
    status: 'In 45 mins'
  },
  {
    id: 2,
    doctor: {
      name: 'Dr. Michael Chen',
      specialty: 'General Physician',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&auto=format&fit=crop'
    },
    date: 'Tomorrow, 10:00 AM',
    type: 'In-Clinic',
    status: 'Scheduled'
  }
];

export function UpcomingConsultations() {
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h3">Upcoming Consultations</Typography>
        <Button variant="ghost" size="sm" className="text-primary gap-1">
          View All <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {consultations.map((c) => (
          <div key={c.id} className="p-4 rounded-xl border border-border-soft bg-surface-muted/50 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-3">
                <Avatar src={c.doctor.avatar} fallback={c.doctor.name[0]} size="md" />
                <div>
                  <Typography variant="body" className="font-bold">{c.doctor.name}</Typography>
                  <Typography variant="small" className="text-xs text-text-muted">{c.doctor.specialty}</Typography>
                </div>
              </div>
              <Badge variant={c.status.includes('mins') ? 'primary' : 'outline'}>
                {c.status}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-text-muted mb-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <Typography variant="small" className="text-[10px]">{c.date}</Typography>
              </div>
              <div className="flex items-center gap-1.5">
                {c.type === 'Video Call' ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                <Typography variant="small" className="text-[10px]">{c.type}</Typography>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 text-xs py-2" size="sm">
                {c.type === 'Video Call' ? 'Join Call' : 'Check In'}
              </Button>
              <Button variant="outline" className="flex-1 text-xs py-2" size="sm">
                Reschedule
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function UpcomingConsultationsSkeleton() {
  return (
    <Card className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-border-soft space-y-4">
            <div className="flex justify-between">
              <div className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
