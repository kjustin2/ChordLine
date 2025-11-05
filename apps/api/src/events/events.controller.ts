import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Event } from '@chordline/types';
import { JwtGuard } from '../auth/jwt.guard';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { assertRequestWithUser } from '../shared/request.utils';

@Controller('v1/bands/:bandId/events')
@UseGuards(JwtGuard)
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  async list(@Param('bandId') bandId: string): Promise<Event[]> {
    return this.events.listForBand(bandId);
  }

  @Post()
  async create(
    @Param('bandId') bandId: string,
    @Req() req: unknown,
    @Body() dto: CreateEventDto,
  ): Promise<Event> {
    const userId = assertRequestWithUser(req);
    return this.events.create(bandId, userId, dto);
  }
}
