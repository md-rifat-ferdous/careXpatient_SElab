'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { fetchDoctorAppointments, DoctorAppointment } from '@/services/doctor.service';
import {
  startConsultationApi,
  endConsultationApi,
} from '@/services/consultation.service';
import { getSocket, joinAppointmentRoom } from '@/lib/socket';
import WaitingRoom from '@/components/consultation/WaitingRoom';
import VideoCall from '@/components/consultation/VideoCall';
import InCallChat from '@/components/consultation/InCallChat';
import FileShare from '@/components/consultation/FileShare';
import DoctorVideoPanel from '@/components/consultation/DoctorVideoPanel';
import { AgoraConfig } from '@/types/consultation';

type Phase = 'loading' | 'waiting' | 'in_call' | 'completed';

export default function DoctorConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<DoctorAppointment | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [agoraConfig, setAgoraConfig] = useState<AgoraConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [hasPatientJoined, setHasPatientJoined] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const socket = token ? getSocket(token) : null;

  useEffect(() => {
    if (!socket) return;
    socket.on('waiting:patient_joined', (data: any) => {
      if (data.appointmentId === appointmentId) {
        setHasPatientJoined(true);
      }
    });
    socket.on('waiting:patient_left', (data: any) => {
      if (data.appointmentId === appointmentId) {
        setHasPatientJoined(false);
      }
    });
    return () => {
      socket.off('waiting:patient_joined');
      socket.off('waiting:patient_left');
    };
  }, [socket, appointmentId]);

  useEffect(() => {
    if (!user || !token) return;
    loadAppointment();
  }, [user, token, appointmentId]);

  const loadAppointment = async () => {
    try {
      const data = await fetchDoctorAppointments(user!.id, token!);
      const appt = data.find((a) => a.id === appointmentId);
      if (!appt) {
        setError('Appointment not found.');
        return;
      }
      setAppointment(appt);

      joinAppointmentRoom(appointmentId, token!);

      if (appt.status === 'In_consultation') {
        try {
          const { joinConsultationApi } = await import('@/services/consultation.service');
          const res = await joinConsultationApi(appointmentId, token!);
          setAgoraConfig(res.data);
          setPhase('in_call');
        } catch {
          setPhase('waiting');
        }
        return;
      }

      if (appt.status === 'Completed') {
        setPhase('completed');
        return;
      }

      setPhase('waiting');
    } catch (err: any) {
      setError(err.message || 'Failed to load appointment.');
    }
  };

  const handleStartCall = useCallback(async () => {
    if (!token) return;
    try {
      const res = await startConsultationApi(appointmentId, token);
      setAgoraConfig(res.data);
      setPhase('in_call');
    } catch (err: any) {
      setError(err.message);
    }
  }, [token, appointmentId]);

  const handleEndCall = useCallback(async () => {
    if (!token) return;
    setIsEnding(true);
    try {
      await endConsultationApi(appointmentId, token);
      setPhase('completed');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsEnding(false);
    }
  }, [token, appointmentId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === 'in_call') {
      const start = Date.now();
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  const formatDate = (dateStr: string) => dateStr;
  const formatTime = (timeStr: string) => timeStr;

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
      {phase === 'waiting' && (
        <div className="flex-1 flex">
          <div className="flex-1 flex items-center justify-center">
            <WaitingRoom
              appointmentDate={appointment?.date || ''}
              appointmentTime={appointment?.timeSlot || ''}
              doctorName={user?.fullName || 'Doctor'}
              doctorAvatar=""
              patientName={appointment?.patientName || 'Patient'}
              isDoctorView={true}
              hasPatientJoined={hasPatientJoined}
              onJoinCall={handleStartCall}
              canJoin={hasPatientJoined}
            />
          </div>
          <div className="w-80 p-4 space-y-4">
            <DoctorVideoPanel
              patientName={appointment?.patientName || 'Patient'}
              patientAvatar={appointment?.patientAvatarUrl || ''}
              appointmentDate={appointment?.date || ''}
              appointmentTime={appointment?.timeSlot || ''}
              consultationDuration={callDuration}
              onEndConsultation={handleEndCall}
              isEnding={isEnding}
            />
            <FileShare
              appointmentId={appointmentId}
              token={token || ''}
              userRole="Doctor"
            />
          </div>
        </div>
      )}

      {phase === 'in_call' && agoraConfig && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <VideoCall
              appId={agoraConfig.agoraAppId}
              channelName={agoraConfig.channelName}
              token={agoraConfig.rtcToken}
              onCallEnded={handleEndCall}
              localUserName={user?.fullName || 'Doctor'}
              remoteUserName={appointment?.patientName || 'Patient'}
            />
          </div>
          <div className="h-80 bg-white border-t border-gray-200 flex">
            <div className="flex-1 border-r border-gray-200">
              <InCallChat
                appointmentId={appointmentId}
                token={token || ''}
                userRole="Doctor"
                socket={socket}
              />
            </div>
            <div className="w-80 space-y-4 p-4 overflow-y-auto">
              <DoctorVideoPanel
                patientName={appointment?.patientName || 'Patient'}
                patientAvatar={appointment?.patientAvatarUrl || ''}
                appointmentDate={appointment?.date || ''}
                appointmentTime={appointment?.timeSlot || ''}
                consultationDuration={callDuration}
                onEndConsultation={handleEndCall}
                isEnding={isEnding}
              />
              <FileShare
                appointmentId={appointmentId}
                token={token || ''}
                userRole="Doctor"
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
            <p className="text-gray-500 mb-6">The consultation has been ended successfully.</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard/doctor/appointments')}
                className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
              >
                Back to Appointments
              </button>
              <button
                onClick={() => router.push(`/dashboard/doctor/appointments?filter=Pending`)}
                className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Next Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
