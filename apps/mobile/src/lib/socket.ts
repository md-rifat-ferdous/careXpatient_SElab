import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket: Socket | null = null;

export function getSocket(token?: string): Socket {
  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinAppointmentRoom(appointmentId: string, token: string): void {
  const s = getSocket(token);
  s.emit('appointment:join', { appointmentId });
}

export function leaveAppointmentRoom(appointmentId: string, token: string): void {
  const s = getSocket(token);
  s.emit('appointment:leave', { appointmentId });
}
