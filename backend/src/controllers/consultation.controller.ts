import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';
import {
  generateRtcToken,
  generateRtmToken,
  generateChannelName,
  getAgoraAppId,
} from '../services/agora.service';
import {
  emitConsultationStarted,
  emitConsultationEnded,
  emitStatusChange,
} from '../services/socket.service';

const serialize = (data: unknown) =>
  JSON.parse(JSON.stringify(data, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));

// ─── Doctor — Start Consultation ─────────────────────────────────────────────

export const startConsultation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const appointment = await prisma.appointment.findUnique({
      where: { id: BigInt(id) },
      include: {
        doctor: true,
        patient: { include: { user: true } },
        consultation: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment.doctor.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'This appointment does not belong to you.' });
    }

    if (appointment.status !== 'Confirmed' && appointment.status !== 'Waiting_for_call') {
      return res.status(400).json({
        success: false,
        message: `Cannot start consultation for appointment with status '${appointment.status}'.`,
      });
    }

    if (appointment.type !== 'Online') {
      return res.status(400).json({
        success: false,
        message: 'Cannot start video consultation for an in-person appointment.',
      });
    }

    if (appointment.consultation?.startTime && !appointment.consultation?.endTime) {
      return res.status(400).json({ success: false, message: 'Consultation already in progress.' });
    }

    const channelName = appointment.agoraChannelName || generateChannelName(id);
    const rtcToken = generateRtcToken(channelName, userId);
    const rtmToken = generateRtmToken(userId);

    const [updatedAppointment, consultation] = await prisma.$transaction([
      prisma.appointment.update({
        where: { id: BigInt(id) },
        data: {
          status: 'In_consultation',
          agoraChannelName: channelName,
          agoraToken: rtcToken.token,
          tokenExpirationTime: rtcToken.expirationTime,
          consultationStartedAt: new Date(),
        },
      }),
      prisma.consultation.upsert({
        where: { appointmentId: BigInt(id) },
        create: {
          appointmentId: BigInt(id),
          startTime: new Date(),
          videoRoomId: channelName,
        },
        update: {
          startTime: new Date(),
          videoRoomId: channelName,
          endTime: null,
        },
      }),
    ]);

    emitStatusChange(id, 'In_consultation');
    emitConsultationStarted(id, {
      channelName,
      token: rtcToken.token,
      rtcToken: rtcToken.token,
      rtmToken: rtmToken.token,
      agorAppId: getAgoraAppId(),
    });

    res.status(200).json({
      success: true,
      message: 'Consultation started.',
      data: serialize({
        appointment: updatedAppointment,
        consultation,
        agoraAppId: getAgoraAppId(),
        channelName,
        rtcToken: rtcToken.token,
        rtmToken: rtmToken.token,
      }),
    });
  } catch (error) {
    console.error('Error starting consultation:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── Patient — Join Consultation ─────────────────────────────────────────────

export const joinConsultation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const appointment = await prisma.appointment.findUnique({
      where: { id: BigInt(id) },
      include: { patient: true, doctor: true },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment.patient.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'This appointment does not belong to you.' });
    }

    if (appointment.status !== 'Confirmed' && appointment.status !== 'Waiting_for_call' && appointment.status !== 'In_consultation') {
      return res.status(400).json({
        success: false,
        message: `Cannot join consultation for appointment with status '${appointment.status}'.`,
      });
    }

    if (appointment.type !== 'Online') {
      return res.status(400).json({ success: false, message: 'Not an online appointment.' });
    }

    const now = new Date();
    const appointmentTime = new Date(appointment.date);
    const [hours, minutes] = appointment.timeSlot.toString().split(':');
    appointmentTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const tenMinutesBefore = new Date(appointmentTime.getTime() - 10 * 60 * 1000);
    if (now < tenMinutesBefore) {
      return res.status(400).json({
        success: false,
        message: 'You can only join the consultation 10 minutes before the scheduled time.',
        canJoinAt: tenMinutesBefore.toISOString(),
      });
    }

    const channelName = appointment.agoraChannelName || generateChannelName(id);
    const rtcToken = generateRtcToken(channelName, userId);
    const rtmToken = generateRtmToken(userId);

    if (appointment.status === 'Confirmed') {
      await prisma.appointment.update({
        where: { id: BigInt(id) },
        data: { status: 'Waiting_for_call' },
      });
      emitStatusChange(id, 'Waiting_for_call');
    }

    res.status(200).json({
      success: true,
      message: 'You can join the consultation.',
      data: {
        agoraAppId: getAgoraAppId(),
        channelName,
        rtcToken: rtcToken.token,
        rtmToken: rtmToken.token,
        appointment: serialize(appointment),
      },
    });
  } catch (error) {
    console.error('Error joining consultation:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── Doctor — End Consultation ───────────────────────────────────────────────

export const endConsultation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const appointment = await prisma.appointment.findUnique({
      where: { id: BigInt(id) },
      include: { consultation: true },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment.doctorId.toString() !== userId) {
      const doctor = await prisma.doctor.findUnique({ where: { userId: BigInt(userId) } });
      if (!doctor || doctor.id.toString() !== appointment.doctorId.toString()) {
        return res.status(403).json({ success: false, message: 'This appointment does not belong to you.' });
      }
    }

    if (appointment.status !== 'In_consultation') {
      return res.status(400).json({
        success: false,
        message: `Cannot end consultation with status '${appointment.status}'.`,
      });
    }

    const now = new Date();
    const consultationStart = appointment.consultationStartedAt || appointment.consultation?.startTime || now;
    const durationMs = now.getTime() - new Date(consultationStart).getTime();
    const durationMinutes = Math.round(durationMs / 60000);

    const [updated] = await prisma.$transaction([
      prisma.appointment.update({
        where: { id: BigInt(id) },
        data: {
          status: 'Completed',
          consultationEndedAt: now,
          consultationDuration: durationMinutes,
        },
      }),
      prisma.consultation.update({
        where: { appointmentId: BigInt(id) },
        data: { endTime: now },
      }),
    ]);

    emitStatusChange(id, 'Completed');
    emitConsultationEnded(id, durationMinutes);

    res.status(200).json({
      success: true,
      message: 'Consultation ended.',
      data: serialize({
        ...updated,
        consultationDuration: durationMinutes,
      }),
    });
  } catch (error) {
    console.error('Error ending consultation:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── Chat — Send Message ─────────────────────────────────────────────────────

export const sendChatMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: BigInt(id) },
      include: { consultation: true },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const msg = await prisma.consultationMessage.create({
      data: {
        appointmentId: BigInt(id),
        consultationId: appointment.consultation?.id,
        senderId: BigInt(userId),
        senderRole: role,
        message: message.trim(),
      },
    });

    const { getIO } = await import('../services/socket.service');
    const io = getIO();
    io.to(`appointment:${id}`).emit('chat:message', {
      id: msg.id.toString(),
      senderRole: role,
      message: message.trim(),
      createdAt: msg.createdAt.toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Message sent.',
      data: serialize(msg),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── Chat — Get Messages ─────────────────────────────────────────────────────

export const getChatMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const messages = await prisma.consultationMessage.findMany({
      where: { appointmentId: BigInt(id) },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      data: serialize(messages),
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── File — Upload ───────────────────────────────────────────────────────────

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: BigInt(id) },
      include: { consultation: true },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (!appointment.consultation) {
      return res.status(400).json({ success: false, message: 'Consultation not started yet.' });
    }

    const file = await prisma.consultationFile.create({
      data: {
        appointmentId: BigInt(id),
        consultationId: appointment.consultation.id,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileUrl: `/uploads/consultations/${req.file.filename}`,
        uploadedBy: BigInt(userId),
        uploadedByRole: role,
      },
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded.',
      data: serialize(file),
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── File — List ─────────────────────────────────────────────────────────────

export const getFiles = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const files = await prisma.consultationFile.findMany({
      where: { appointmentId: BigInt(id) },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: serialize(files),
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── Refresh Token ──────────────────────────────────────────────────────────

export const refreshToken = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const appointment = await prisma.appointment.findUnique({
      where: { id: BigInt(id) },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const channelName = appointment.agoraChannelName || generateChannelName(id);
    const rtcToken = generateRtcToken(channelName, userId);
    const rtmToken = generateRtmToken(userId);

    await prisma.appointment.update({
      where: { id: BigInt(id) },
      data: {
        agoraToken: rtcToken.token,
        tokenExpirationTime: rtcToken.expirationTime,
      },
    });

    res.json({
      success: true,
      data: {
        rtcToken: rtcToken.token,
        rtmToken: rtmToken.token,
        expirationTime: rtcToken.expirationTime,
      },
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
