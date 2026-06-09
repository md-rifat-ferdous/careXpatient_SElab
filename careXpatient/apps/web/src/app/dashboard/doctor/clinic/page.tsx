import { getDoctorClinics } from '@/server/doctorSchedule/queries/scheduleQueries';
import { ClinicClient } from './ClinicClient';

export const metadata = {
  title: 'My Clinics | careXpatient Doctor Portal',
  description: 'Manage and view your registered clinics and shift schedules.',
};

export default async function DoctorClinicPage() {
  const result = await getDoctorClinics();

  return (
    <ClinicClient
      initialClinics={result.data ?? []}
    />
  );
}
