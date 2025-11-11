import { randomUUID } from 'node:crypto';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtGuard } from '../src/auth/jwt.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { InMemoryPrismaService } from './utils/in-memory-prisma.service';

jest.setTimeout(120_000);

describe('ChordLine API (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<INestApplication['getHttpServer']>;
  let prisma: InMemoryPrismaService;

  const testUserId = `user_${randomUUID()}`;

  beforeAll(async () => {
    prisma = new InMemoryPrismaService();
    await prisma.reset();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            sub: testUserId,
            email: 'bandleader@chordline.local',
            name: 'Band Leader',
          };
          return true;
        },
      })
      // Supply an in-memory Prisma replacement so the suite stays headless and repeatable.
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
  });

  beforeEach(async () => {
    await prisma.reset();
  });

  afterAll(async () => {
    await app.close();
  });

  it('executes a representative band workflow end-to-end', async () => {
    const authHeader = { Authorization: 'Bearer stub-token' };

    const meResponse = await request(httpServer)
      .get('/v1/users/me')
      .set(authHeader)
      .expect(200);

    expect(meResponse.body.id).toBe(testUserId);
    expect(meResponse.body.email).toContain('@chordline.local');

    const bandResponse = await request(httpServer)
      .post('/v1/bands')
      .set(authHeader)
      .send({
        name: 'Downtown Collective',
        description: 'Indie band focusing on intimate shows',
        genre: 'Indie Rock',
      })
      .expect(201);

    const bandId = bandResponse.body.id as string;
    expect(bandResponse.body.name).toBe('Downtown Collective');

    const bandsList = await request(httpServer)
      .get('/v1/bands')
      .set(authHeader)
      .expect(200);

    expect(bandsList.body).toHaveLength(1);
    expect(bandsList.body[0].id).toBe(bandId);

    const venueResponse = await request(httpServer)
      .post(`/v1/bands/${bandId}/venues`)
      .set(authHeader)
      .send({
        name: 'Riverfront Hall',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
      })
      .expect(201);

    const venueId = venueResponse.body.id as string;

    const eventResponse = await request(httpServer)
      .post(`/v1/bands/${bandId}/events`)
      .set(authHeader)
      .send({
        title: 'Spring Showcase',
        venueId,
        startsAt: new Date('2025-03-01T20:00:00Z').toISOString(),
        endsAt: new Date('2025-03-01T22:00:00Z').toISOString(),
        notes: 'Doors at 7:30 PM',
      })
      .expect(201);

    const eventId = eventResponse.body.id as string;

    const setlistResponse = await request(httpServer)
      .post(`/v1/bands/${bandId}/setlists`)
      .set(authHeader)
      .send({
        title: 'Showcase Set',
        description: 'Core material for the spring showcase',
      })
      .expect(201);

    const setlistId = setlistResponse.body.id as string;

    const setlistSongResponse = await request(httpServer)
      .post(`/v1/setlists/${setlistId}/songs`)
      .set(authHeader)
      .send({
        title: 'Skyline Dreams',
        artist: 'Downtown Collective',
        position: 0,
      })
      .expect(201);

    expect(setlistSongResponse.body.setlistId).toBe(setlistId);

    const attachResponse = await request(httpServer)
      .post(`/v1/events/${eventId}/setlists`)
      .set(authHeader)
      .send({
        setlistId,
        position: 0,
      })
      .expect(201);

    expect(attachResponse.body.eventId).toBe(eventId);

    const ideaResponse = await request(httpServer)
      .post(`/v1/bands/${bandId}/song-ideas`)
      .set(authHeader)
      .send({
        title: 'Late Night Echoes',
        body: 'Moody groove in 6/8 with layered vocals.',
        tags: ['ballad', '6/8'],
      })
      .expect(201);

    const songIdeaId = ideaResponse.body.id as string;

    const updatedIdeaResponse = await request(httpServer)
      .patch(`/v1/song-ideas/${songIdeaId}/status`)
      .set(authHeader)
      .send({ status: 'SHARED' })
      .expect(200);

    expect(updatedIdeaResponse.body.status).toBe('SHARED');

    const membership = await prisma.bandMember.findFirstOrThrow({
      where: { bandId },
    });

    const earningResponse = await request(httpServer)
      .post(`/v1/bands/${bandId}/earnings`)
      .set(authHeader)
      .send({
        eventId,
        totalAmount: '1200.00',
        currency: 'USD',
        description: 'Guarantee from Spring Showcase',
        splits: [
          {
            memberId: membership.id,
            amount: '1200.00',
            status: 'PENDING',
          },
        ],
      })
      .expect(201);

    const earningId = earningResponse.body.id as string;

    const earningsList = await request(httpServer)
      .get(`/v1/bands/${bandId}/earnings`)
      .set(authHeader)
      .expect(200);

    expect(earningsList.body).toHaveLength(1);
    expect(earningsList.body[0].totalAmount).toBe('1200.00');

    const splitsList = await request(httpServer)
      .get(`/v1/earnings/${earningId}/splits`)
      .set(authHeader)
      .expect(200);

    expect(splitsList.body).toHaveLength(1);
    expect(splitsList.body[0].memberId).toBe(membership.id);

    const venuesList = await request(httpServer)
      .get(`/v1/bands/${bandId}/venues`)
      .set(authHeader)
      .expect(200);

    expect(venuesList.body).toHaveLength(1);
    expect(venuesList.body[0].id).toBe(venueId);

    const eventsList = await request(httpServer)
      .get(`/v1/bands/${bandId}/events`)
      .set(authHeader)
      .expect(200);

    expect(eventsList.body).toHaveLength(1);
    expect(eventsList.body[0].id).toBe(eventId);

    const setlistsList = await request(httpServer)
      .get(`/v1/bands/${bandId}/setlists`)
      .set(authHeader)
      .expect(200);

    expect(setlistsList.body).toHaveLength(1);
    expect(setlistsList.body[0].id).toBe(setlistId);

    const setlistSongs = await request(httpServer)
      .get(`/v1/setlists/${setlistId}/songs`)
      .set(authHeader)
      .expect(200);

    expect(setlistSongs.body).toHaveLength(1);
    expect(setlistSongs.body[0].title).toBe('Skyline Dreams');

    const ideasList = await request(httpServer)
      .get(`/v1/bands/${bandId}/song-ideas`)
      .set(authHeader)
      .expect(200);

    expect(ideasList.body).toHaveLength(1);
    expect(ideasList.body[0].status).toBe('SHARED');
  });
});
