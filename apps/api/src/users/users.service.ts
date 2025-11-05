import { Injectable } from '@nestjs/common';
import type { User } from '@chordline/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateUser(params: {
    id: string;
    email?: string | null;
    displayName?: string | null;
  }): Promise<User> {
    const user = await this.prisma.user.upsert({
      where: { id: params.id },
      update: {
        email: params.email ?? undefined,
        displayName: params.displayName ?? undefined,
      },
      create: {
        id: params.id,
        email: params.email ?? `${params.id}@chordline.local`,
        displayName: params.displayName ?? null,
      },
    });

    return mapUser(user);
  }
}

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

const mapUser = (user: UserRecord): User => ({
  id: user.id,
  clerkUserId: user.clerkUserId ?? null,
  email: user.email,
  displayName: user.displayName ?? null,
  avatarUrl: user.avatarUrl ?? null,
  instrument: user.instrument ?? null,
  primaryGenre: user.primaryGenre ?? null,
  city: user.city ?? null,
  country: user.country ?? null,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});
