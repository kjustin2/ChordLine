import { Injectable } from '@nestjs/common';
import type { Event } from '@chordline/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForBand(bandId: string): Promise<Event[]> {
    const events = await this.prisma.event.findMany({
      where: { bandId },
      orderBy: { startsAt: 'asc' },
    });

    return events.map(mapEvent);
  }

  async create(
    bandId: string,
    userId: string,
    dto: CreateEventDto,
  ): Promise<Event> {
    const created = await this.prisma.event.create({
      data: {
        bandId,
        createdById: userId,
        title: dto.title,
        description: dto.description,
        type: dto.type ?? 'SHOW',
        status: dto.status ?? 'DRAFT',
        venueId: dto.venueId,
        locationName: dto.locationName,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country,
        latitude: dto.latitude,
        longitude: dto.longitude,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        doorTime: dto.doorTime ? new Date(dto.doorTime) : undefined,
        rsvpDeadline: dto.rsvpDeadline ? new Date(dto.rsvpDeadline) : undefined,
        notes: dto.notes,
      },
    });

    return mapEvent(created);
  }
}

type EventRecord = {
  id: string;
  bandId: string;
  createdById: string;
  title: string;
  description: string | null;
  type: Event['type'];
  status: Event['status'];
  venueId: string | null;
  locationName: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  startsAt: Date;
  endsAt: Date | null;
  doorTime: Date | null;
  rsvpDeadline: Date | null;
  notes: string | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const mapEvent = (event: EventRecord): Event => ({
  id: event.id,
  bandId: event.bandId,
  createdById: event.createdById,
  title: event.title,
  description: event.description ?? null,
  type: event.type,
  status: event.status,
  venueId: event.venueId ?? null,
  locationName: event.locationName ?? null,
  addressLine1: event.addressLine1 ?? null,
  addressLine2: event.addressLine2 ?? null,
  city: event.city ?? null,
  state: event.state ?? null,
  postalCode: event.postalCode ?? null,
  country: event.country ?? null,
  latitude: event.latitude ?? null,
  longitude: event.longitude ?? null,
  startsAt: event.startsAt.toISOString(),
  endsAt: event.endsAt ? event.endsAt.toISOString() : null,
  doorTime: event.doorTime ? event.doorTime.toISOString() : null,
  rsvpDeadline: event.rsvpDeadline ? event.rsvpDeadline.toISOString() : null,
  notes: event.notes ?? null,
  cancelledAt: event.cancelledAt ? event.cancelledAt.toISOString() : null,
  createdAt: event.createdAt.toISOString(),
  updatedAt: event.updatedAt.toISOString(),
});
