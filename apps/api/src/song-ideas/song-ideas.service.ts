import { Injectable, NotFoundException } from '@nestjs/common';
import type { SongIdea } from '@chordline/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSongIdeaDto } from './dto/create-song-idea.dto';
import { UpdateSongIdeaStatusDto } from './dto/update-song-idea-status.dto';

@Injectable()
export class SongIdeasService {
  constructor(private readonly prisma: PrismaService) {}

  async listForBand(bandId: string): Promise<SongIdea[]> {
    const ideas = await this.prisma.songIdea.findMany({
      where: { bandId },
      orderBy: { updatedAt: 'desc' },
    });

    return ideas.map(mapSongIdea);
  }

  async create(
    bandId: string,
    userId: string,
    dto: CreateSongIdeaDto,
  ): Promise<SongIdea> {
    const created = await this.prisma.songIdea.create({
      data: {
        bandId,
        authorId: userId,
        title: dto.title,
        body: dto.body,
        tags: dto.tags ?? [],
        status: dto.status ?? 'DRAFT',
        sharedAt: dto.status === 'SHARED' ? new Date() : undefined,
      },
    });

    return mapSongIdea(created);
  }

  async updateStatus(
    songIdeaId: string,
    dto: UpdateSongIdeaStatusDto,
  ): Promise<SongIdea> {
    const existing = await this.prisma.songIdea.findUnique({ where: { id: songIdeaId } });
    if (!existing) {
      throw new NotFoundException('Song idea not found');
    }

    const updated = await this.prisma.songIdea.update({
      where: { id: songIdeaId },
      data: {
        status: dto.status,
        sharedAt: dto.status === 'SHARED' ? new Date() : existing.sharedAt,
      },
    });

    return mapSongIdea(updated);
  }
}

type SongIdeaRecord = {
  id: string;
  bandId: string;
  authorId: string;
  title: string;
  body: string;
  tags: string[];
  status: SongIdea['status'];
  sharedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const mapSongIdea = (idea: SongIdeaRecord): SongIdea => ({
  id: idea.id,
  bandId: idea.bandId,
  authorId: idea.authorId,
  title: idea.title,
  body: idea.body,
  tags: idea.tags,
  status: idea.status,
  sharedAt: idea.sharedAt ? idea.sharedAt.toISOString() : null,
  createdAt: idea.createdAt.toISOString(),
  updatedAt: idea.updatedAt.toISOString(),
});
