import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/auth';

let io: Server | null = null;

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    const payload = verifyToken(token as string);
    if (!payload) {
      return next(new Error('Invalid token'));
    }
    (socket as any).user = payload;
    next();
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`Socket connected: user ${user.userId} (${user.role})`);

    socket.on('appointment:join', (data: { appointmentId: string }) => {
      const room = `appointment:${data.appointmentId}`;
      socket.join(room);
      console.log(`User ${user.userId} joined room ${room}`);
    });

    socket.on('appointment:leave', (data: { appointmentId: string }) => {
      const room = `appointment:${data.appointmentId}`;
      socket.leave(room);
    });

    socket.on('order:join', (data: { orderId: string }) => {
      const room = `order:${data.orderId}`;
      socket.join(room);
      console.log(`User ${user.userId} joined room ${room}`);
    });

    socket.on('order:leave', (data: { orderId: string }) => {
      const room = `order:${data.orderId}`;
      socket.leave(room);
    });

    socket.on('waiting:join', (data: { appointmentId: string; patientName: string }) => {
      const room = `appointment:${data.appointmentId}`;
      socket.join(room);
      io?.to(room).emit('waiting:patient_joined', {
        appointmentId: data.appointmentId,
        patientName: data.patientName,
      });
    });

    socket.on('waiting:leave', (data: { appointmentId: string }) => {
      const room = `appointment:${data.appointmentId}`;
      socket.leave(room);
      io?.to(room).emit('waiting:patient_left', {
        appointmentId: data.appointmentId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: user ${user.userId}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function emitStatusChange(appointmentId: string, status: string, data?: Record<string, any>) {
  if (!io) return;
  io.to(`appointment:${appointmentId}`).emit('appointment:status', {
    appointmentId,
    status,
    ...data,
  });
}

export function emitConsultationStarted(appointmentId: string, data: {
  channelName: string;
  token: string;
  rtcToken: string;
  rtmToken: string;
  agorAppId: string;
}) {
  if (!io) return;
  io.to(`appointment:${appointmentId}`).emit('consultation:started', {
    appointmentId,
    ...data,
  });
}

export function emitConsultationEnded(appointmentId: string, duration: number) {
  if (!io) return;
  io.to(`appointment:${appointmentId}`).emit('consultation:ended', {
    appointmentId,
    duration,
  });
}

export function emitLabOrderStatusChange(orderId: string, status: string, data?: Record<string, any>) {
  if (!io) return;
  io.to(`order:${orderId}`).emit('laborder:status', {
    orderId,
    status,
    ...data,
  });
}
