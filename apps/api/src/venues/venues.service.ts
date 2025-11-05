import { Injectable } from '@nestjs/common';
import type { Venue } from '@chordline/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';

@Injectable()
export class VenuesService {
  constructor(private readonly prisma: PrismaService) {}

  async listForBand(bandId: string): Promise<Venue[]> {
    const venues = await this.prisma.venue.findMany({
      where: { bandId },
      orderBy: { name: 'asc' },
    });

    return venues.map(mapVenue);
  }

  async create(bandId: string, dto: CreateVenueDto): Promise<Venue> {
    const created = await this.prisma.venue.create({
      data: {
        bandId,
        name: dto.name,
        description: dto.description,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country,
        latitude: dto.latitude,
        longitude: dto.longitude,
        placeId: dto.placeId,
      },
    });

    return mapVenue(created);
  }
}

type VenueRecord = {
  id: string;
  bandId: string;
  name: string;
  description: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const mapVenue = (venue: VenueRecord): Venue => ({
  id: venue.id,
  bandId: venue.bandId,
  name: venue.name,
  description: venue.description ?? null,
  addressLine1: venue.addressLine1 ?? null,
  addressLine2: venue.addressLine2 ?? null,
  city: venue.city ?? null,
  state: venue.state ?? null,
  postalCode: venue.postalCode ?? null,
  country: venue.country ?? null,
  latitude: venue.latitude ?? null,
  longitude: venue.longitude ?? null,
  placeId: venue.placeId ?? null,
  createdAt: venue.createdAt.toISOString(),
  updatedAt: venue.updatedAt.toISOString(),
});
