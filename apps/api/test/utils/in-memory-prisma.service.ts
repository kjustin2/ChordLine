import { randomUUID } from 'node:crypto';
import { Prisma } from '../../generated/prisma';

type UserRecord = {
  id: string;
  clerkUserId: string | null;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  instrument: string | null;
  primaryGenre: string | null;
  city: string | null;
  country: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type BandRecord = {
  id: string;
  name: string;
  description: string | null;
  genre: string | null;
  createdById: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
};

type BandMemberRecord = {
  id: string;
  bandId: string;
  userId: string;
  role: 'LEADER' | 'MEMBER';
  status: 'INVITED' | 'ACTIVE' | 'INACTIVE';
  joinedAt: Date;
  leftAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

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

type EventRecord = {
  id: string;
  bandId: string;
  createdById: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
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

type SetlistRecord = {
  id: string;
  bandId: string;
  createdById: string;
  title: string;
  description: string | null;
  visibility: 'PRIVATE' | 'BAND' | 'PUBLIC';
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

type SongIdeaRecord = {
  id: string;
  bandId: string;
  authorId: string;
  title: string;
  body: string;
  tags: string[];
  status: 'DRAFT' | 'SHARED' | 'ARCHIVED';
  sharedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type EarningRecord = {
  id: string;
  bandId: string;
  eventId: string | null;
  recordedById: string;
  totalAmount: Prisma.Decimal;
  currency: string;
  description: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type EarningSplitRecord = {
  id: string;
  earningId: string;
  memberId: string;
  amount: Prisma.Decimal;
  status: 'PENDING' | 'PAID' | 'CANCELED';
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const clone = <T>(value: T): T => {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }
  if (value instanceof Prisma.Decimal) {
    return new Prisma.Decimal(value.toString()) as T;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => clone(entry)) as unknown as T;
  }
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    result[key] = clone(val);
  }
  return result as T;
};

export class InMemoryPrismaService {
  private users: UserRecord[] = [];
  private bands: BandRecord[] = [];
  private bandMembers: BandMemberRecord[] = [];
  private venues: VenueRecord[] = [];
  private events: EventRecord[] = [];
  private setlists: SetlistRecord[] = [];
  private setlistSongs: SetlistSongRecord[] = [];
  private eventSetlists: EventSetlistRecord[] = [];
  private songIdeas: SongIdeaRecord[] = [];
  private earnings: EarningRecord[] = [];
  private earningSplits: EarningSplitRecord[] = [];

  async reset(): Promise<void> {
    this.users = [];
    this.bands = [];
    this.bandMembers = [];
    this.venues = [];
    this.events = [];
    this.setlists = [];
    this.setlistSongs = [];
    this.eventSetlists = [];
    this.songIdeas = [];
    this.earnings = [];
    this.earningSplits = [];
  }

  user = {
    upsert: async ({ where, create, update }: { where: { id: string }; create: Partial<UserRecord>; update: Partial<UserRecord>; }): Promise<UserRecord> => {
      const existing = this.users.find((user) => user.id === where.id);
      if (existing) {
        existing.email = (update.email as string | undefined) ?? existing.email;
        existing.displayName = (update.displayName as string | null | undefined) ?? existing.displayName;
        existing.updatedAt = new Date();
        return clone(existing);
      }

      const now = new Date();
      const created: UserRecord = {
        id: where.id,
        clerkUserId: null,
        email: (create.email as string | undefined) ?? `${where.id}@chordline.local`,
        displayName: (create.displayName as string | null | undefined) ?? null,
        avatarUrl: null,
        instrument: null,
        primaryGenre: null,
        city: null,
        country: null,
        createdAt: now,
        updatedAt: now,
      };
      this.users.push(created);
      return clone(created);
    },
  };

  band = {
    create: async ({ data }: { data: any }): Promise<BandRecord> => {
      const now = new Date();
      const band: BandRecord = {
        id: randomUUID(),
        name: data.name,
        description: data.description ?? null,
        genre: data.genre ?? null,
        createdById: data.createdById,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      };
      this.bands.push(band);

      const membersToCreate = data.members?.create
        ? Array.isArray(data.members.create)
          ? data.members.create
          : [data.members.create]
        : [];

      membersToCreate.forEach((member: any) => {
        const membership: BandMemberRecord = {
          id: randomUUID(),
          bandId: band.id,
          userId: member.userId,
          role: (member.role as BandMemberRecord['role']) ?? 'MEMBER',
          status: (member.status as BandMemberRecord['status']) ?? 'ACTIVE',
          joinedAt: now,
          leftAt: null,
          createdAt: now,
          updatedAt: now,
        };
        this.bandMembers.push(membership);
      });

      return clone(band);
    },
  };

  bandMember = {
    findMany: async ({ where, include, orderBy }: { where?: any; include?: any; orderBy?: any }): Promise<any[]> => {
      let results = [...this.bandMembers];

      if (where?.userId) {
        results = results.filter((member) => member.userId === where.userId);
      }

      if (where?.bandId) {
        results = results.filter((member) => member.bandId === where.bandId);
      }

      if (where?.status?.in) {
        const statuses: BandMemberRecord['status'][] = where.status.in;
        results = results.filter((member) => statuses.includes(member.status));
      }

      if (orderBy?.band?.name === 'asc') {
        results.sort((a, b) => {
          const bandA = this.bands.find((band) => band.id === a.bandId);
          const bandB = this.bands.find((band) => band.id === b.bandId);
          return (bandA?.name ?? '').localeCompare(bandB?.name ?? '');
        });
      }

      return results.map((member) => {
        const base: any = clone(member);
        if (include?.band) {
          base.band = clone(this.bands.find((band) => band.id === member.bandId));
        }
        return base;
      });
    },
    findFirst: async ({ where }: { where?: any }): Promise<BandMemberRecord | null> => {
      const [first] = await this.bandMember.findMany({ where });
      return first ?? null;
    },
    findFirstOrThrow: async ({ where }: { where?: any }): Promise<BandMemberRecord> => {
      const found = await this.bandMember.findFirst({ where });
      if (!found) {
        throw new Error('Band member not found');
      }
      return clone(found);
    },
  };

  venue = {
    create: async ({ data }: { data: any }): Promise<VenueRecord> => {
      const now = new Date();
      const venue: VenueRecord = {
        id: randomUUID(),
        bandId: data.bandId,
        name: data.name,
        description: data.description ?? null,
        addressLine1: data.addressLine1 ?? null,
        addressLine2: data.addressLine2 ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        postalCode: data.postalCode ?? null,
        country: data.country ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        placeId: data.placeId ?? null,
        createdAt: now,
        updatedAt: now,
      };
      this.venues.push(venue);
      return clone(venue);
    },
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any }): Promise<VenueRecord[]> => {
      let results = [...this.venues];
      if (where?.bandId) {
        results = results.filter((venue) => venue.bandId === where.bandId);
      }
      if (orderBy?.name === 'asc') {
        results.sort((a, b) => a.name.localeCompare(b.name));
      }
      return results.map((venue) => clone(venue));
    },
  };

  event = {
    create: async ({ data }: { data: any }): Promise<EventRecord> => {
      const now = new Date();
      const event: EventRecord = {
        id: randomUUID(),
        bandId: data.bandId,
        createdById: data.createdById,
        title: data.title,
        description: data.description ?? null,
        type: data.type ?? 'SHOW',
        status: data.status ?? 'DRAFT',
        venueId: data.venueId ?? null,
        locationName: data.locationName ?? null,
        addressLine1: data.addressLine1 ?? null,
        addressLine2: data.addressLine2 ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        postalCode: data.postalCode ?? null,
        country: data.country ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        startsAt: new Date(data.startsAt),
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        doorTime: data.doorTime ? new Date(data.doorTime) : null,
        rsvpDeadline: data.rsvpDeadline ? new Date(data.rsvpDeadline) : null,
        notes: data.notes ?? null,
        cancelledAt: null,
        createdAt: now,
        updatedAt: now,
      };
      this.events.push(event);
      return clone(event);
    },
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any }): Promise<EventRecord[]> => {
      let results = [...this.events];
      if (where?.bandId) {
        results = results.filter((event) => event.bandId === where.bandId);
      }
      if (orderBy?.startsAt === 'asc') {
        results.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
      }
      return results.map((event) => clone(event));
    },
  };

  setlist = {
    create: async ({ data }: { data: any }): Promise<SetlistRecord> => {
      const now = new Date();
      const setlist: SetlistRecord = {
        id: randomUUID(),
        bandId: data.bandId,
        createdById: data.createdById,
        title: data.title,
        description: data.description ?? null,
        visibility: data.visibility ?? 'BAND',
        archivedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      this.setlists.push(setlist);
      return clone(setlist);
    },
    findUnique: async ({ where }: { where: { id: string } }): Promise<SetlistRecord | null> => {
      const found = this.setlists.find((setlist) => setlist.id === where.id);
      return found ? clone(found) : null;
    },
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any }): Promise<SetlistRecord[]> => {
      let results = [...this.setlists];
      if (where?.bandId) {
        results = results.filter((setlist) => setlist.bandId === where.bandId);
      }
      if (orderBy?.updatedAt === 'desc') {
        results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      }
      return results.map((setlist) => clone(setlist));
    },
  };

  setlistSong = {
    create: async ({ data }: { data: any }): Promise<SetlistSongRecord> => {
      const now = new Date();
      const song: SetlistSongRecord = {
        id: randomUUID(),
        setlistId: data.setlistId,
        title: data.title,
        artist: data.artist ?? null,
        keySignature: data.keySignature ?? null,
        tempo: data.tempo ?? null,
        position: data.position ?? 0,
        durationSec: data.durationSec ?? null,
        notes: data.notes ?? null,
        createdAt: now,
        updatedAt: now,
      };
      this.setlistSongs.push(song);
      return clone(song);
    },
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any }): Promise<SetlistSongRecord[]> => {
      let results = [...this.setlistSongs];
      if (where?.setlistId) {
        results = results.filter((song) => song.setlistId === where.setlistId);
      }
      if (orderBy?.position === 'asc') {
        results.sort((a, b) => a.position - b.position);
      }
      return results.map((song) => clone(song));
    },
    count: async ({ where }: { where?: any }): Promise<number> => {
      if (!where?.setlistId) {
        return this.setlistSongs.length;
      }
      return this.setlistSongs.filter((song) => song.setlistId === where.setlistId).length;
    },
  };

  eventSetlist = {
    upsert: async ({ where, update, create }: { where: { eventId_setlistId: { eventId: string; setlistId: string } }; update: { position?: number }; create: { eventId: string; setlistId: string; position?: number } }): Promise<EventSetlistRecord> => {
      const existing = this.eventSetlists.find(
        (link) => link.eventId === where.eventId_setlistId.eventId && link.setlistId === where.eventId_setlistId.setlistId,
      );
      if (existing) {
        existing.position = update.position ?? existing.position;
        return clone(existing);
      }
      const link: EventSetlistRecord = {
        id: randomUUID(),
        eventId: create.eventId,
        setlistId: create.setlistId,
        position: create.position ?? 0,
      };
      this.eventSetlists.push(link);
      return clone(link);
    },
  };

  songIdea = {
    create: async ({ data }: { data: any }): Promise<SongIdeaRecord> => {
      const now = new Date();
      const idea: SongIdeaRecord = {
        id: randomUUID(),
        bandId: data.bandId,
        authorId: data.authorId,
        title: data.title,
        body: data.body,
        tags: data.tags ?? [],
        status: data.status ?? 'DRAFT',
        sharedAt: data.status === 'SHARED' ? now : null,
        createdAt: now,
        updatedAt: now,
      };
      this.songIdeas.push(idea);
      return clone(idea);
    },
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any }): Promise<SongIdeaRecord[]> => {
      let results = [...this.songIdeas];
      if (where?.bandId) {
        results = results.filter((idea) => idea.bandId === where.bandId);
      }
      if (orderBy?.updatedAt === 'desc') {
        results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      }
      return results.map((idea) => clone(idea));
    },
    findUnique: async ({ where }: { where: { id: string } }): Promise<SongIdeaRecord | null> => {
      const found = this.songIdeas.find((idea) => idea.id === where.id);
      return found ? clone(found) : null;
    },
    update: async ({ where, data }: { where: { id: string }; data: any }): Promise<SongIdeaRecord> => {
      const existing = this.songIdeas.find((idea) => idea.id === where.id);
      if (!existing) {
        throw new Error('Song idea not found');
      }
      existing.status = data.status ?? existing.status;
      if (data.sharedAt !== undefined) {
        existing.sharedAt = data.sharedAt ?? null;
      }
      existing.updatedAt = new Date();
      return clone(existing);
    },
  };

  earning = {
    create: async ({ data }: { data: any }): Promise<EarningRecord> => {
      const now = new Date();
      const earning: EarningRecord = {
        id: randomUUID(),
        bandId: data.bandId,
        eventId: data.eventId ?? null,
        recordedById: data.recordedById,
        totalAmount: new Prisma.Decimal(data.totalAmount),
        currency: data.currency ?? 'USD',
        description: data.description ?? null,
        paidAt: data.paidAt ? new Date(data.paidAt) : null,
        createdAt: now,
        updatedAt: now,
      };
      this.earnings.push(earning);

      const splits = data.splits?.create ?? [];
      (Array.isArray(splits) ? splits : [splits]).forEach((split: any) => {
        const splitRecord: EarningSplitRecord = {
          id: randomUUID(),
          earningId: earning.id,
          memberId: split.memberId,
          amount: new Prisma.Decimal(split.amount),
          status: split.status ?? 'PENDING',
          paidAt: split.paidAt ? new Date(split.paidAt) : null,
          createdAt: now,
          updatedAt: now,
        };
        this.earningSplits.push(splitRecord);
      });

      return clone(earning);
    },
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any }): Promise<EarningRecord[]> => {
      let results = [...this.earnings];
      if (where?.bandId) {
        results = results.filter((earning) => earning.bandId === where.bandId);
      }
      if (orderBy?.createdAt === 'desc') {
        results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      return results.map((earning) => clone(earning));
    },
    findUnique: async ({ where }: { where: { id: string } }): Promise<EarningRecord | null> => {
      const found = this.earnings.find((earning) => earning.id === where.id);
      return found ? clone(found) : null;
    },
  };

  earningSplit = {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any }): Promise<EarningSplitRecord[]> => {
      let results = [...this.earningSplits];
      if (where?.earningId) {
        results = results.filter((split) => split.earningId === where.earningId);
      }
      if (orderBy?.createdAt === 'asc') {
        results.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      }
      return results.map((split) => clone(split));
    },
    create: async ({ data }: { data: any }): Promise<EarningSplitRecord> => {
      const existingEarning = this.earnings.find((earning) => earning.id === data.earningId);
      if (!existingEarning) {
        throw new Error('Earning not found');
      }
      const now = new Date();
      const split: EarningSplitRecord = {
        id: randomUUID(),
        earningId: data.earningId,
        memberId: data.memberId,
        amount: new Prisma.Decimal(data.amount),
        status: data.status ?? 'PENDING',
        paidAt: data.paidAt ? new Date(data.paidAt) : null,
        createdAt: now,
        updatedAt: now,
      };
      this.earningSplits.push(split);
      return clone(split);
    },
  };
}
