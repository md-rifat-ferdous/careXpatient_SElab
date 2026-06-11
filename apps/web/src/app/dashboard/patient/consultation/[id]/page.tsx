'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { fetchPatientAppointments, PatientAppointment } from '@/services/doctor.service';
import { joinConsultationApi } from '@/services/consultation.service';
import { getSocket, joinAppointmentRoom, joinWaitingRoom } from '@/lib/socket';
import WaitingRoom from '@/components/consultation/WaitingRoom';
import VideoCall from '@/components/consultation/VideoCall';
import InCallChat from '@/components/consultation/InCallChat';
import FileShare from '@/components/consultation/FileShare';
import { AgoraConfig } from '@/types/consultation';

type Phase = 'loading' | 'waiting' | 'in_call' | 'completed';

export default function PatientConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<PatientAppointment | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [agoraConfig, setAgoraConfig] = useState<AgoraConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const socket = token ? getSocket(token) : null;

  useEffect(() => {
    if (!socket) return;
    socket.on('connect', () => setSocketConnected(true));
    socket.on('consultation:started', (data: any) => {
      if (data.appointmentId === appointmentId && data.agorAppId) {
        setAgoraConfig({
          agoraAppId: data.agorAppId,
          channelName: data.channelName,
          rtcToken: data.rtcToken || data.token,
          rtmToken: data.rtmToken,
        });
        setPhase('in_call');
      }
    });
    socket.on('consultation:ended', () => {
      setPhase('completed');
    });
    return () => {
      socket.off('connect');
      socket.off('consultation:started');
      socket.off('consultation:ended');
    };
  }, [socket, appointmentId]);

  useEffect(() => {
    if (!user || !token) return;
    loadAppointment();
  }, [user, token, appointmentId]);

  const loadAppointment = async () => {
    try {
      const data = await fetchPatientAppointments(user!.id);
      const appt = data.find((a) => a.id === appointmentId);
      if (!appt) {
        setError('Appointment not found.');
        return;
      }
      setAppointment(appt);

      if (appt.status === 'Completed') {
        setPhase('completed');
        return;
      }

      joinAppointmentRoom(appointmentId, token!);

      if (appt.status === 'In_consultation') {
        try {
          const res = await joinConsultationApi(appointmentId, token!);
          setAgoraConfig(res.data);
          setPhase('in_call');
        } catch (err: any) {
          setError(err.message);
        }
        return;
      }

      setPhase('waiting');
    } catch (err: any) {
      setError(err.message || 'Failed to load appointment.');
    }
  };

  const handleJoinCall = useCallback(async () => {
    if (!token || !appointment) return;
    try {
      joinWaitingRoom(appointmentId, user?.fullName || 'Patient', token);
      const res = await joinConsultationApi(appointmentId, token);
      setAgoraConfig(res.data);
      setPhase('in_call');
    } catch (err: any) {
      setError(err.message);
    }
  }, [token, appointment, appointmentId, user]);

  const handleCallEnded = useCallback(() => {
    setPhase('completed');
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    const d = new Date(timeStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button onClick={() => router.back()} className="px-6 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {phase === 'waiting' && appointment && (
        <WaitingRoom
          appointmentDate={formatDate(appointment.date)}
          appointmentTime={formatTime(appointment.timeSlot)}
          doctorName={appointment.doctor.user.fullName}
          doctorAvatar={appointment.doctor.user.profilePhotoUrl || ''}
          patientName={user?.fullName || 'Patient'}
          onJoinCall={handleJoinCall}
          canJoin={true}
        />
      )}

      {phase === 'in_call' && agoraConfig && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <VideoCall
              appId={agoraConfig.agoraAppId}
              channelName={agoraConfig.channelName}
              token={agoraConfig.rtcToken}
              onCallEnded={handleCallEnded}
              localUserName={user?.fullName || 'Patient'}
              remoteUserName={appointment?.doctor.user.fullName || 'Doctor'}
            />
          </div>
          <div className="h-80 bg-white border-t border-gray-200 flex">
            <div className="flex-1 border-r border-gray-200">
              <InCallChat
                appointmentId={appointmentId}
                token={token || ''}
                userRole="Patient"
                socket={socket}
              />
            </div>
            <div className="w-80">
              <FileShare
                appointmentId={appointmentId}
                token={token || ''}
                userRole="Patient"
              />
            </div>
          </div>
        </div>
      )}

      {phase === 'completed' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Consultation Complete</h2>
            <p className="text-gray-500 mb-2">Your consultation has ended.</p>
            {appointment?.consultationDuration && (
              <p className="text-sm text-gray-400 mb-6">
                Duration: {Math.floor(appointment.consultationDuration / 60)}m {appointment.consultationDuration % 60}s
              </p>
            )}
            <div className="space-y-3">
              {appointment?.consultation?.prescription && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-left">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Prescription</p>
                  {appointment.consultation.prescription.diagnosis && (
                    <p className="text-xs text-gray-600 mb-1"><strong>Diagnosis:</strong> {appointment.consultation.prescription.diagnosis}</p>
                  )}
                  {appointment.consultation.prescription.medicinesText && (
                    <p className="text-xs text-gray-600 mb-1"><strong>Medicines:</strong> {appointment.consultation.prescription.medicinesText}</p>
                  )}
                  {appointment.consultation.prescription.adviceText && (
                    <p className="text-xs text-gray-600"><strong>Advice:</strong> {appointment.consultation.prescription.adviceText}</p>
                  )}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/dashboard/patient/appointments')}
                  className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
                >
                  Back to Appointments
                </button>
                <button
                  onClick={() => router.push('/dashboard/patient/prescription')}
                  className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  View Prescriptions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
