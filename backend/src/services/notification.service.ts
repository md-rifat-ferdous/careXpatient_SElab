import { PrismaClient } from '@prisma/client';
import { messagingService } from '../integrations/messaging/messaging.service';
import { SocketManager } from '../lib/socket';

const prisma = new PrismaClient();

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export class NotificationService {
  static async notify(userId: bigint, title: string, message: string, type: string, priority: NotificationPriority = NotificationPriority.MEDIUM) {
    // 1. Create In-App Notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        isRead: false
      },
      include: { user: true }
    });

    // 2. Real-time emit via Socket
    SocketManager.emitToUser(userId.toString(), 'new_notification', notification);

    // 3. Escalation Logic
    if (priority === NotificationPriority.HIGH || priority === NotificationPriority.CRITICAL) {
      const user = notification.user;
      
      // If critical, send SMS immediately
      if (priority === NotificationPriority.CRITICAL && user.phone) {
        await messagingService.sendSms(user.phone, `CRITICAL: ${title} - ${message}`);
      }

      // If high, send Email
      if (user.email) {
        await messagingService.sendEmail(user.email, `High Priority: ${title}`, message);
      }
    }

    // 4. Delayed Escalation (Future: if not read in 5 mins, send SMS)
    // This would use a job queue like BullMQ
    
    return notification;
  }
}
