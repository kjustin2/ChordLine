import { Injectable } from '@nestjs/common';
import type { Band } from '@chordline/types';
import type { Band as PrismaBand } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBandDto } from './dto/create-band.dto';

@Injectable()
export class BandsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string): Promise<Band[]> {
    if (!userId) {
      return [];
    }

    const memberships = await this.prisma.bandMember.findMany({
      where: { userId, status: { in: ['ACTIVE', 'INVITED'] } },
      include: { band: true },
      orderBy: { band: { name: 'asc' } },
    });

    return memberships.map((membership) => mapBand(membership.band));
  }

  async create(userId: string, dto: CreateBandDto): Promise<Band> {
    const created = await this.prisma.band.create({
      data: {
        name: dto.name,
        description: dto.description,
        genre: dto.genre,
        createdById: userId,
        members: {
          create: {
            userId,
            role: 'LEADER',
            status: 'ACTIVE',
          },
        },
      },
    });

    return mapBand(created);
  }
}

const mapBand = (band: PrismaBand): Band => ({
  id: band.id,
  name: band.name,
  description: band.description ?? null,
  genre: band.genre ?? null,
  createdById: band.createdById,
  status: band.status,
  createdAt: band.createdAt.toISOString(),
  updatedAt: band.updatedAt.toISOString(),
});
