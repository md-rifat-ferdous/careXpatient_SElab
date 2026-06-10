'use client';

import React, { useState, useEffect, use } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import PatientAppointmentHistory from '@/components/doctor/PatientAppointmentHistory';
import { fetchPatientDetail } from '@/services/doctor.service';

export default function PatientDetailPage({
  params


}) {
  const { id: patientId } = use(params);
  const { user, token } = useAuthStore();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id || !token) return;
    fetchPatientDetail(user.id, patientId, token).
    then((data) => setAppointments(data.appointments)).
    catch(() => setError('Could not load appointment history.')).
    finally(() => setLoading(false));
  }, [user?.id, token, patientId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={28} className="animate-spin text-teal-500" />
      </div>);

  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm">
        ⚠️ {error}
      </div>);

  }

  return <PatientAppointmentHistory appointments={appointments} />;
}