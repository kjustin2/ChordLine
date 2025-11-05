import { Injectable } from '@nestjs/common';
import type { EventSetlist, Setlist, SetlistSong } from '@chordline/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSetlistDto } from './dto/create-setlist.dto';
import { CreateSetlistSongDto } from './dto/create-setlist-song.dto';
import { AttachSetlistDto } from './dto/attach-setlist.dto';

@Injectable()
export class SetlistsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForBand(bandId: string): Promise<Setlist[]> {
    const setlists = await this.prisma.setlist.findMany({
      where: { bandId },
      orderBy: { updatedAt: 'desc' },
    });

    return setlists.map(mapSetlist);
  }

  async getSetlist(setlistId: string): Promise<Setlist | null> {
    const setlist = await this.prisma.setlist.findUnique({ where: { id: setlistId } });
    return setlist ? mapSetlist(setlist) : null;
  }

  async create(
    bandId: string,
    userId: string,
    dto: CreateSetlistDto,
  ): Promise<Setlist> {
    const created = await this.prisma.setlist.create({
      data: {
        bandId,
        createdById: userId,
        title: dto.title,
        description: dto.description,
        visibility: dto.visibility ?? 'BAND',
      },
    });

    return mapSetlist(created);
  }

  async addSong(setlistId: string, dto: CreateSetlistSongDto): Promise<SetlistSong> {
    const existingCount = await this.prisma.setlistSong.count({ where: { setlistId } });
    const created = await this.prisma.setlistSong.create({
      data: {
        setlistId,
        title: dto.title,
        artist: dto.artist,
        keySignature: dto.keySignature,
        tempo: dto.tempo,
        position: dto.position ?? existingCount,
        durationSec: dto.durationSec,
        notes: dto.notes,
      },
    });

    return mapSetlistSong(created);
  }

  async listSongs(setlistId: string): Promise<SetlistSong[]> {
    const songs = await this.prisma.setlistSong.findMany({
      where: { setlistId },
      orderBy: { position: 'asc' },
    });

    return songs.map(mapSetlistSong);
  }

  async attachToEvent(
    eventId: string,
    dto: AttachSetlistDto,
  ): Promise<EventSetlist> {
    const created = await this.prisma.eventSetlist.upsert({
      where: {
        eventId_setlistId: {
          eventId,
          setlistId: dto.setlistId,
        },
      },
      update: {
        position: dto.position ?? 0,
      },
      create: {
        eventId,
        setlistId: dto.setlistId,
        position: dto.position ?? 0,
      },
    });

    return mapEventSetlist(created);
  }
}

type SetlistRecord = {
  id: string;
  bandId: string;
  createdById: string;
  title: string;
  description: string | null;
  visibility: Setlist['visibility'];
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type SetlistSongRecord = {
  id: string;
  setlistId: string;
  title: string;
  artist: string | null;
  keySignature: string | null;
  tempo: number | null;
  position: number;
  durationSec: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type EventSetlistRecord = {
  id: string;
  eventId: string;
  setlistId: string;
  position: number;
};

const mapSetlist = (setlist: SetlistRecord): Setlist => ({
  id: setlist.id,
  bandId: setlist.bandId,
  createdById: setlist.createdById,
  title: setlist.title,
  description: setlist.description ?? null,
  visibility: setlist.visibility,
  archivedAt: setlist.archivedAt ? setlist.archivedAt.toISOString() : null,
  createdAt: setlist.createdAt.toISOString(),
  updatedAt: setlist.updatedAt.toISOString(),
});

const mapSetlistSong = (song: SetlistSongRecord): SetlistSong => ({
  id: song.id,
  setlistId: song.setlistId,
  title: song.title,
  artist: song.artist ?? null,
  keySignature: song.keySignature ?? null,
  tempo: song.tempo ?? null,
  position: song.position,
  durationSec: song.durationSec ?? null,
  notes: song.notes ?? null,
  createdAt: song.createdAt.toISOString(),
  updatedAt: song.updatedAt.toISOString(),
});

const mapEventSetlist = (eventSetlist: EventSetlistRecord): EventSetlist => ({
  id: eventSetlist.id,
  eventId: eventSetlist.eventId,
  setlistId: eventSetlist.setlistId,
  position: eventSetlist.position,
});
