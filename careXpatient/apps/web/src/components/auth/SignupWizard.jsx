"use client";

import React from 'react';
import { useSignupStore } from '@/store/auth.store';
import RoleSelection from './RoleSelection';
import PatientSignupForm from './PatientSignupForm';
import DoctorSignupForm from './DoctorSignupForm';
import LabSignupForm from './LabSignupForm';

export default function SignupWizard() {
  const { step, role } = useSignupStore();

  if (step === 0) return <RoleSelection />;

  if (role === 'Patient') return <PatientSignupForm />;
  if (role === 'Doctor') return <DoctorSignupForm />;
  if (role === 'Lab') return <LabSignupForm />;

  return null;
}