import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Notification } from '@chordline/types';
import { JwtGuard } from '../auth/jwt.guard';
import { NotificationsService } from './notifications.service';
import { assertRequestWithUser } from '../shared/request.utils';

@Controller('v1/notifications')
@UseGuards(JwtGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  async list(@Req() req: unknown): Promise<Notification[]> {
    const userId = assertRequestWithUser(req);
    return this.notifications.listForUser(userId);
  }

  @Post(':notificationId/read')
  async markRead(
    @Param('notificationId') notificationId: string,
    @Req() req: unknown,
  ): Promise<Notification> {
    const userId = assertRequestWithUser(req);
    return this.notifications.markRead(notificationId, userId);
  }
}
