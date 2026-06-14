const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export interface DashboardActivity {
  id: string;
  type: 'appointment' | 'lab_order';
  title: string;
  description: string;
  status: string;
  date: string;
}

export interface DashboardNextAppointment {
  id: string;
  doctorName: string;
  specialty: string;
  type: 'Online' | 'In_person';
  date: string;
  timeSlot: string;
  status: string;
  profilePhotoUrl: string | null;
}

export interface PatientDashboardData {
  upcomingAppointments: number;
  pendingLabOrders: number;
  completedAppointments: number;
  totalAppointments: number;
  nextAppointment: DashboardNextAppointment | null;
  recentActivity: DashboardActivity[];
}

export async function fetchPatientDashboard(userId: string, token: string): Promise<PatientDashboardData> {
  const res = await fetch(`${API_URL}/patients/${userId}/dashboard`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch patient dashboard data');
  const json = await res.json();
  return json.data as PatientDashboardData;
}
