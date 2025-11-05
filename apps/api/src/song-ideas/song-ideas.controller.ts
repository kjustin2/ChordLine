import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { SongIdea } from '@chordline/types';
import { JwtGuard } from '../auth/jwt.guard';
import { SongIdeasService } from './song-ideas.service';
import { CreateSongIdeaDto } from './dto/create-song-idea.dto';
import { UpdateSongIdeaStatusDto } from './dto/update-song-idea-status.dto';
import { assertRequestWithUser } from '../shared/request.utils';

@Controller()
@UseGuards(JwtGuard)
export class SongIdeasController {
  constructor(private readonly songIdeas: SongIdeasService) {}

  @Get('v1/bands/:bandId/song-ideas')
  async list(@Param('bandId') bandId: string): Promise<SongIdea[]> {
    return this.songIdeas.listForBand(bandId);
  }

  @Post('v1/bands/:bandId/song-ideas')
  async create(
    @Param('bandId') bandId: string,
    @Req() req: unknown,
    @Body() dto: CreateSongIdeaDto,
  ): Promise<SongIdea> {
    const userId = assertRequestWithUser(req);
    return this.songIdeas.create(bandId, userId, dto);
  }

  @Patch('v1/song-ideas/:songIdeaId/status')
  async updateStatus(
    @Param('songIdeaId') songIdeaId: string,
    @Body() dto: UpdateSongIdeaStatusDto,
  ): Promise<SongIdea> {
    return this.songIdeas.updateStatus(songIdeaId, dto);
  }
}
