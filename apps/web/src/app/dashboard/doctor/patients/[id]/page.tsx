"use client";

import React, { use } from 'react';
import Link from 'next/link';
import { FileText, ClipboardList, Lock } from 'lucide-react';

export default function PatientOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = use(params);

  const folders = [
    {
      name: 'Reports',
      description: 'View diagnostic patient reports from labs',
      icon: FileText,
      href: `/dashboard/doctor/patients/${patientId}/reports`,
      color: 'text-teal-600',
      bg: 'bg-teal-50'
    },
    {
      name: 'Prescriptions',
      description: 'Manage medication history and active scripts',
      icon: ClipboardList,
      href: `/dashboard/doctor/patients/${patientId}/prescriptions`,
      color: 'text-teal-600',
      bg: 'bg-teal-50'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {folders.map((folder) => (
          <Link
            key={folder.name}
            href={folder.href}
            className="group bg-white p-8 rounded-3xl shadow-soft border border-gray-50 flex flex-col items-center text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`w-16 h-16 ${folder.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform`}>
              <folder.icon size={28} className={folder.color} />
            </div>
            <h2 className="text-xl font-bold text-text mb-2">{folder.name}</h2>
            <p className="text-text-muted text-sm max-w-[200px] leading-relaxed">
              {folder.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center justify-center opacity-40">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={12} />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text">
            End-to-end encrypted patient data
          </span>
        </div>
        <div className="w-10 h-0.5 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}
