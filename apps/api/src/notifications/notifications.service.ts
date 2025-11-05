import { Injectable, NotFoundException } from '@nestjs/common';
import type { Notification } from '@chordline/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return notifications.map(mapNotification);
  }

  async markRead(notificationId: string, userId: string): Promise<Notification> {
    const existing = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        recipientId: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: existing.readAt ?? new Date() },
    });

    return mapNotification(updated);
  }
}

type NotificationRecord = {
  id: string;
  recipientId: string;
  type: Notification['type'];
  title: string;
  body: string;
  payload: unknown;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const mapNotification = (notification: NotificationRecord): Notification => ({
  id: notification.id,
  recipientId: notification.recipientId,
  type: notification.type,
  title: notification.title,
  body: notification.body,
  payload: notification.payload as Record<string, unknown> | null,
  readAt: notification.readAt ? notification.readAt.toISOString() : null,
  createdAt: notification.createdAt.toISOString(),
  updatedAt: notification.updatedAt.toISOString(),
});
