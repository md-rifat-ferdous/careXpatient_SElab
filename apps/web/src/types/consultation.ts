export interface AgoraConfig {
  agoraAppId: string;
  channelName: string;
  rtcToken: string;
  rtmToken: string;
}

export interface ConsultationData {
  appointment: any;
  consultation: any;
  agoraAppId: string;
  channelName: string;
  rtcToken: string;
  rtmToken: string;
}

export interface ChatMessage {
  id: string;
  senderRole: 'Patient' | 'Doctor';
  message: string;
  createdAt: string;
}

export interface ConsultationFile {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  uploadedByRole: string;
  createdAt: string;
}

export type AppointmentStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Rescheduled'
  | 'Confirmed'
  | 'Waiting_for_call'
  | 'In_consultation'
  | 'Completed'
  | 'Cancelled'
  | 'NoShow';
