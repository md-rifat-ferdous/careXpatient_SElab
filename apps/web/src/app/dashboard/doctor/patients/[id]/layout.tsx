"use client";

import React, { use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  ChevronLeft,
  Calendar,
  Clock
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

export default function PatientFolderLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: patientId } = use(params);
  const pathname = usePathname();

  const isBaseFolder = pathname === `/dashboard/doctor/patients/${patientId}`;
  const backHref = isBaseFolder ? '/dashboard/doctor/patients' : `/dashboard/doctor/patients/${patientId}`;
  const backLabel = isBaseFolder ? 'Back to My Patients' : 'Back to Patient Folder';

  const [patient, setPatient] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPatient = async () => {
      try {
        const { fetchApi } = await import('@/lib/api');
        const data = await fetchApi(`/patients/${patientId}`);
        setPatient(data);
      } catch (err) {
        console.error('Failed to fetch patient', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [patientId]);

  if (loading) {
    return <div className="p-20 text-center animate-pulse text-text-muted font-bold">Loading patient profile...</div>;
  }

  if (!patient) {
    return <div className="p-20 text-center text-red-500 font-bold bg-red-50 rounded-xl">Patient not found</div>;
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto px-4">
      <Link href={backHref} className="flex items-center gap-1.5 text-primary font-bold transition-colors mb-1 group w-fit">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs">{backLabel}</span>
      </Link>

      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        {patient.image ? (
          <Avatar src={patient.image} fallback={patient.name[0]} className="w-20 h-20 text-2xl" />
        ) : (
          <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center">
            <User size={32} className="text-teal-600" />
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text mb-1">{patient.name}</h1>
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm font-medium text-text-muted">
              {patient.age} years • {patient.gender}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4">
        {children}
      </div>
    </div>
  );
}
