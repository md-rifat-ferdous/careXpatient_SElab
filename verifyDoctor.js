// verifyDoctor.js
import { getAuthenticatedDoctorId } from './apps/web/server/doctorSchedule/scheduleService';
import { getDoctorClinics } from './apps/web/server/doctorSchedule/scheduleService';

(async () => {
  const doctorId = await getAuthenticatedDoctorId();
  console.log('Resolved doctorId:', doctorId);
  const result = await getDoctorClinics();
  if (result.success) {
    console.log('Clinic count:', result.data.length);
    console.log('Clinic names:', result.data.map(c => c.clinic.name).join(', '));
  } else {
    console.error('Error fetching clinics:', result.error);
  }
})();
