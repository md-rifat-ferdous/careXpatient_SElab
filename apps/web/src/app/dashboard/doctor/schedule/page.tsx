import { getDoctorClinics, getRecentModifications } from '@/server/doctorSchedule/queries/scheduleQueries';
import { ScheduleClient } from './ScheduleClient';

export const metadata = {
  title: 'My Schedule | careXpatient Doctor Portal',
  description: 'Manage your clinic schedule, slots, holidays, and leave.',
};

export default async function DoctorSchedulePage() {
  const [clinicsResult, modsResult] = await Promise.all([
    getDoctorClinics(),
    getRecentModifications(),
  ]);

  return (
    <ScheduleClient
      initialClinics={clinicsResult.data ?? []}
      initialModifications={modsResult.data ?? []}
    />
  );
}
