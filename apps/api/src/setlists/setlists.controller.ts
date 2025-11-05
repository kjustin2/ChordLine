import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { EventSetlist, Setlist, SetlistSong } from '@chordline/types';
import { JwtGuard } from '../auth/jwt.guard';
import { SetlistsService } from './setlists.service';
import { CreateSetlistDto } from './dto/create-setlist.dto';
import { CreateSetlistSongDto } from './dto/create-setlist-song.dto';
import { AttachSetlistDto } from './dto/attach-setlist.dto';
import { assertRequestWithUser } from '../shared/request.utils';

@Controller()
@UseGuards(JwtGuard)
export class SetlistsController {
  constructor(private readonly setlists: SetlistsService) {}

  @Get('v1/bands/:bandId/setlists')
  async list(@Param('bandId') bandId: string): Promise<Setlist[]> {
    return this.setlists.listForBand(bandId);
  }

  @Post('v1/bands/:bandId/setlists')
  async create(
    @Param('bandId') bandId: string,
    @Req() req: unknown,
    @Body() dto: CreateSetlistDto,
  ): Promise<Setlist> {
    const userId = assertRequestWithUser(req);
    return this.setlists.create(bandId, userId, dto);
  }

  @Get('v1/setlists/:setlistId')
  async get(@Param('setlistId') setlistId: string): Promise<Setlist | null> {
    return this.setlists.getSetlist(setlistId);
  }

  @Get('v1/setlists/:setlistId/songs')
  async listSongs(@Param('setlistId') setlistId: string): Promise<SetlistSong[]> {
    return this.setlists.listSongs(setlistId);
  }

  @Post('v1/setlists/:setlistId/songs')
  async addSong(
    @Param('setlistId') setlistId: string,
    @Body() dto: CreateSetlistSongDto,
  ): Promise<SetlistSong> {
    return this.setlists.addSong(setlistId, dto);
  }

  @Post('v1/events/:eventId/setlists')
  async attachToEvent(
    @Param('eventId') eventId: string,
    @Body() dto: AttachSetlistDto,
  ): Promise<EventSetlist> {
    return this.setlists.attachToEvent(eventId, dto);
  }
}
