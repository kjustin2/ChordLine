import type { Page, Route } from "@playwright/test";

export type DashboardState = Awaited<ReturnType<typeof setupDashboardMocks>>;

type Method = "GET" | "POST" | "PATCH";

type RouteHandler = (route: Route) => Promise<void>;

type BandState = {
  id: string;
  name: string;
  description: string | null;
  genre: string | null;
  createdById: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
};

type SongIdeaRecord = {
  id: string;
  bandId: string;
  authorId: string;
  title: string;
  body: string;
  tags: string[];
  status: "DRAFT" | "SHARED" | "ARCHIVED";
  sharedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function nowIso() {
  return new Date().toISOString();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function fulfill(route: Route, data: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(data),
  });
}

let idCounter = 1000;
function nextId(prefix: string) {
  return `${prefix}-${idCounter++}`;
}

export async function setupDashboardMocks(page: Page) {
  const bandId = "band-1";
  const setlistId = "setlist-1";
  const userId = "user-1";

  const state = {
    user: {
      id: userId,
      email: "bandleader@example.com",
      displayName: "Band Leader",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    bands: [
      {
        id: bandId,
        name: "The Skylines",
        description: "Indie pop quartet",
        genre: "Indie Pop",
        createdById: userId,
        status: "ACTIVE" as BandState["status"],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ] satisfies BandState[],
    events: {
      [bandId]: [
        {
          id: "event-1",
          bandId,
          createdById: userId,
          title: "Neighborhood Festival",
          description: null,
          type: "SHOW",
          status: "PUBLISHED",
          venueId: null,
          locationName: "Riverfront Park",
          addressLine1: null,
          addressLine2: null,
          city: "Brooklyn",
          state: "NY",
          postalCode: null,
          country: "USA",
          latitude: null,
          longitude: null,
          startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          endsAt: null,
          doorTime: null,
          rsvpDeadline: null,
          notes: "Load-in at 5pm",
          cancelledAt: null,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ],
    } as Record<string, any[]>,
    songIdeas: {
      [bandId]: [
        {
          id: "idea-1",
          bandId,
          authorId: userId,
          title: "Mountain Echo",
          body: "Dreamy chorus progression",
          tags: ["dream", "chorus"],
          status: "DRAFT" as SongIdeaRecord["status"],
          sharedAt: null,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ],
    } as Record<string, SongIdeaRecord[]>,
    earnings: {
      [bandId]: [
        {
          id: "earning-1",
          bandId,
          eventId: null,
          recordedById: userId,
          totalAmount: "1500",
          currency: "USD",
          description: "Festival guarantee",
          paidAt: null,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ],
    } as Record<string, any[]>,
    venues: {
      [bandId]: [
        {
          id: "venue-1",
          bandId,
          name: "Sunset Lounge",
          description: "Cozy 200-cap room",
          addressLine1: null,
          addressLine2: null,
          city: "New York",
          state: "NY",
          postalCode: null,
          country: "USA",
          latitude: null,
          longitude: null,
          placeId: null,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ],
    } as Record<string, any[]>,
    setlists: {
      [bandId]: [
        {
          id: setlistId,
          bandId,
          createdById: userId,
          title: "Festival Set",
          description: "45 minute showcase",
          visibility: "BAND",
          archivedAt: null,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ],
    } as Record<string, any[]>,
    setlistSongs: {
      [setlistId]: [
        {
          id: "song-1",
          setlistId,
          title: "Skyline Intro",
          artist: null,
          keySignature: null,
          tempo: null,
          position: 1,
          durationSec: null,
          notes: null,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ],
    } as Record<string, any[]>,
  };

  const handlers: Record<string, RouteHandler> = {
    "GET /v1/users/me": async (route) => fulfill(route, state.user),
    "GET /v1/bands": async (route) => fulfill(route, state.bands),
    "POST /v1/bands": async (route) => {
      const body = await route.request().postDataJSON();
      const band = {
        id: nextId("band"),
        name: body.name,
        description: body.description ?? null,
        genre: body.genre ?? null,
        createdById: userId,
        status: "ACTIVE" as BandState["status"],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      } satisfies BandState;
      state.bands.push(band);
      state.bands.sort((a, b) => a.name.localeCompare(b.name));
      return fulfill(route, band, 201);
    },
  };

  function getBandPath(method: Method, path: string, action: (bandId: string, route: Route) => Promise<void>) {
    handlers[`${method} ${path}`] = async (route) => {
      const url = new URL(route.request().url());
      const bandIdParam = url.pathname.split("/")[3];
      await action(bandIdParam, route);
    };
  }

  getBandPath("GET", "/v1/bands/:bandId/events", async (bandId, route) => {
    const events = state.events[bandId] ?? [];
    return fulfill(route, events);
  });

  getBandPath("POST", "/v1/bands/:bandId/events", async (bandId, route) => {
    const body = await route.request().postDataJSON();
    const event = {
      id: nextId("event"),
      bandId,
      createdById: userId,
      title: body.title,
      description: body.notes ?? null,
      type: "SHOW",
      status: "PUBLISHED",
      venueId: null,
      locationName: null,
      addressLine1: null,
      addressLine2: null,
      city: null,
      state: null,
      postalCode: null,
      country: null,
      latitude: null,
      longitude: null,
      startsAt: body.startsAt,
      endsAt: null,
      doorTime: null,
      rsvpDeadline: null,
      notes: body.notes ?? null,
      cancelledAt: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.events[bandId] = [event, ...(state.events[bandId] ?? [])].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
    return fulfill(route, event, 201);
  });

  getBandPath("GET", "/v1/bands/:bandId/song-ideas", async (bandId, route) => {
    return fulfill(route, state.songIdeas[bandId] ?? []);
  });

  getBandPath("POST", "/v1/bands/:bandId/song-ideas", async (bandId, route) => {
    const body = await route.request().postDataJSON();
    const idea: SongIdeaRecord = {
      id: nextId("idea"),
      bandId,
      authorId: userId,
      title: body.title,
      body: body.body,
      tags: body.tags ?? [],
      status: body.status ?? "DRAFT",
      sharedAt: body.status === "SHARED" ? nowIso() : null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.songIdeas[bandId] = [idea, ...(state.songIdeas[bandId] ?? [])];
    return fulfill(route, idea, 201);
  });

  handlers["PATCH /v1/song-ideas/:ideaId/status"] = async (route) => {
    const url = new URL(route.request().url());
    const ideaId = url.pathname.split("/")[3];
    const body = await route.request().postDataJSON();
    let updated: SongIdeaRecord | undefined;

    for (const ideas of Object.values(state.songIdeas)) {
      const index = ideas.findIndex((idea) => idea.id === ideaId);
      if (index >= 0) {
        ideas[index] = {
          ...ideas[index],
          status: body.status,
          sharedAt: body.status === "SHARED" ? nowIso() : ideas[index].sharedAt,
          updatedAt: nowIso(),
        };
        updated = ideas[index];
        break;
      }
    }

    if (!updated) {
      return fulfill(route, { message: "Not found" }, 404);
    }

    return fulfill(route, updated);
  };

  getBandPath("GET", "/v1/bands/:bandId/earnings", async (bandId, route) => {
    return fulfill(route, state.earnings[bandId] ?? []);
  });

  getBandPath("POST", "/v1/bands/:bandId/earnings", async (bandId, route) => {
    const body = await route.request().postDataJSON();
    const earning = {
      id: nextId("earning"),
      bandId,
      eventId: null,
      recordedById: userId,
      totalAmount: body.totalAmount,
      currency: body.currency ?? "USD",
      description: body.description ?? null,
      paidAt: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.earnings[bandId] = [earning, ...(state.earnings[bandId] ?? [])];
    return fulfill(route, earning, 201);
  });

  getBandPath("GET", "/v1/bands/:bandId/venues", async (bandId, route) => {
    return fulfill(route, state.venues[bandId] ?? []);
  });

  getBandPath("POST", "/v1/bands/:bandId/venues", async (bandId, route) => {
    const body = await route.request().postDataJSON();
    const venue = {
      id: nextId("venue"),
      bandId,
      name: body.name,
      description: body.description ?? null,
      addressLine1: null,
      addressLine2: null,
      city: body.city ?? null,
      state: body.state ?? null,
      postalCode: null,
      country: body.country ?? null,
      latitude: null,
      longitude: null,
      placeId: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.venues[bandId] = [venue, ...(state.venues[bandId] ?? [])];
    return fulfill(route, venue, 201);
  });

  getBandPath("GET", "/v1/bands/:bandId/setlists", async (bandId, route) => {
    return fulfill(route, state.setlists[bandId] ?? []);
  });

  getBandPath("POST", "/v1/bands/:bandId/setlists", async (bandId, route) => {
    const body = await route.request().postDataJSON();
    const setlist = {
      id: nextId("setlist"),
      bandId,
      createdById: userId,
      title: body.title,
      description: body.description ?? null,
      visibility: "BAND",
      archivedAt: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.setlists[bandId] = [setlist, ...(state.setlists[bandId] ?? [])];
    return fulfill(route, setlist, 201);
  });

  handlers["GET /v1/setlists/:setlistId/songs"] = async (route) => {
    const url = new URL(route.request().url());
    const id = url.pathname.split("/")[3];
    return fulfill(route, state.setlistSongs[id] ?? []);
  };

  handlers["POST /v1/setlists/:setlistId/songs"] = async (route) => {
    const url = new URL(route.request().url());
    const id = url.pathname.split("/")[3];
    const body = await route.request().postDataJSON();
    const song = {
      id: nextId("setlist-song"),
      setlistId: id,
      title: body.title,
      artist: body.artist ?? null,
      keySignature: null,
      tempo: null,
      position: (state.setlistSongs[id]?.length ?? 0) + 1,
      durationSec: null,
      notes: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.setlistSongs[id] = [...(state.setlistSongs[id] ?? []), song];
    return fulfill(route, song, 201);
  };

  await page.route("**/v1/**", async (route: Route) => {
    const url = new URL(route.request().url());
    const key = `${route.request().method()} ${url.pathname}`;

    if (handlers[key]) {
      console.log(`[mock] handling ${key}`);
      return handlers[key](route);
    }

    if (url.pathname.startsWith("/v1/bands/") && url.pathname.endsWith("/events")) {
      console.log(`[mock] handling dynamic events route for ${key}`);
      return handlers[`${route.request().method()} /v1/bands/:bandId/events`](route);
    }

    if (url.pathname.startsWith("/v1/bands/") && url.pathname.endsWith("/song-ideas")) {
      console.log(`[mock] handling dynamic song ideas route for ${key}`);
      return handlers[`${route.request().method()} /v1/bands/:bandId/song-ideas`](route);
    }

    if (url.pathname.startsWith("/v1/bands/") && url.pathname.endsWith("/earnings")) {
      console.log(`[mock] handling dynamic earnings route for ${key}`);
      return handlers[`${route.request().method()} /v1/bands/:bandId/earnings`](route);
    }

    if (url.pathname.startsWith("/v1/bands/") && url.pathname.endsWith("/venues")) {
      console.log(`[mock] handling dynamic venues route for ${key}`);
      return handlers[`${route.request().method()} /v1/bands/:bandId/venues`](route);
    }

    if (url.pathname.startsWith("/v1/bands/") && url.pathname.endsWith("/setlists")) {
      console.log(`[mock] handling dynamic setlists route for ${key}`);
      return handlers[`${route.request().method()} /v1/bands/:bandId/setlists`](route);
    }

    if (url.pathname.startsWith("/v1/song-ideas/") && url.pathname.endsWith("/status")) {
      console.log(`[mock] handling idea status route for ${key}`);
      return handlers["PATCH /v1/song-ideas/:ideaId/status"](route);
    }

    if (url.pathname.startsWith("/v1/setlists/") && url.pathname.endsWith("/songs")) {
      console.log(`[mock] handling setlist songs route for ${key}`);
      return handlers[`${route.request().method()} /v1/setlists/:setlistId/songs`](route);
    }

    console.warn(`Unhandled mock route: ${key}`);
    return fulfill(route, { message: "Not mocked" }, 404);
  });

  return state;
}
