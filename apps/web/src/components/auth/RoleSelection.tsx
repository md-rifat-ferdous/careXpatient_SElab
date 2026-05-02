"use client";

import React from 'react';
import Link from 'next/link';
import { useSignupStore } from '@/store/auth.store';

const ROLES = [
  {
    id: 'Patient' as const,
    label: 'Patient',
    subtitle: 'Book doctors & lab tests easily',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    features: ['Book appointments', 'Lab test orders', 'Medical records'],
    color: 'from-teal-500 to-cyan-500',
    bg: 'bg-teal-50',
    iconBg: 'bg-teal-100 text-teal-600',
  },
  {
    id: 'Doctor' as const,
    label: 'Doctor',
    subtitle: 'Provide care and manage appointments',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    features: ['Manage appointments', 'Write prescriptions', 'Patient history'],
    color: 'from-sky-500 to-blue-500',
    bg: 'bg-sky-50',
    iconBg: 'bg-sky-100 text-sky-600',
  },
  {
    id: 'Lab' as const,
    label: 'Diagnostic Lab',
    subtitle: 'Offer lab services & manage reports',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    features: ['Process lab orders', 'Upload results', 'Generate reports'],
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
];

export default function RoleSelection() {
  const { setRole } = useSignupStore();

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Join careXpatient as</h1>
        <p className="text-subtle-gray text-sm mt-2 leading-relaxed">
          Select your profile type to get started with our integrated healthcare platform.
        </p>
      </div>

      {/* Role Cards */}
      <div className="space-y-3">
        {ROLES.map((role, i) => (
          <button
            key={role.id}
            id={`role-${role.id.toLowerCase()}`}
            onClick={() => setRole(role.id)}
            className={`role-card w-full text-left group animate-slide-up`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${role.iconBg}`}>
                {role.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-base">{role.label}</span>
                  <svg className="w-5 h-5 text-subtle-gray group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-sm text-subtle-gray mt-0.5">{role.subtitle}</p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {role.features.map((f) => (
                    <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-muted text-subtle-gray font-medium">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-subtle-gray mt-8">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Log in here
        </Link>
      </p>
    </div>
  );
}
