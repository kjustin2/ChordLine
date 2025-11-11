import type {
  Band,
  Earning,
  Event,
  Setlist,
  SetlistSong,
  SongIdea,
  SongIdeaStatus,
  User,
  Venue,
} from "@chordline/types";

export type AuthedFetcher = <T>(path: string, init?: RequestInit) => Promise<T | null>;

export type CreateBandInput = {
  name: string;
  description?: string;
  genre?: string;
};

export type CreateEventInput = {
  title: string;
  startsAt: string;
  notes?: string;
};

export type CreateSetlistInput = {
  title: string;
  description?: string;
};

export type CreateSetlistSongInput = {
  setlistId: string;
  title: string;
  artist?: string;
};

export type CreateSongIdeaInput = {
  title: string;
  body: string;
  tags: string[];
  status: SongIdeaStatus;
};

export type CreateVenueInput = {
  name: string;
  city?: string;
  state?: string;
  country?: string;
  description?: string;
};

export type CreateEarningInput = {
  totalAmount: string;
  currency?: string;
  description?: string;
};

export const usersApi = {
  me: (fetcher: AuthedFetcher) => fetcher<User>("/v1/users/me"),
};

export const bandsApi = {
  list: (fetcher: AuthedFetcher) => fetcher<Band[]>("/v1/bands"),
  create: (fetcher: AuthedFetcher, payload: CreateBandInput) =>
    fetcher<Band>("/v1/bands", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const eventsApi = {
  listForBand: (fetcher: AuthedFetcher, bandId: string) =>
    fetcher<Event[]>(`/v1/bands/${bandId}/events`),
  createForBand: (fetcher: AuthedFetcher, bandId: string, payload: CreateEventInput) =>
    fetcher<Event>(`/v1/bands/${bandId}/events`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const setlistsApi = {
  listForBand: (fetcher: AuthedFetcher, bandId: string) =>
    fetcher<Setlist[]>(`/v1/bands/${bandId}/setlists`),
  createForBand: (fetcher: AuthedFetcher, bandId: string, payload: CreateSetlistInput) =>
    fetcher<Setlist>(`/v1/bands/${bandId}/setlists`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const setlistSongsApi = {
  listForSetlist: (fetcher: AuthedFetcher, setlistId: string) =>
    fetcher<SetlistSong[]>(`/v1/setlists/${setlistId}/songs`),
  createForSetlist: (fetcher: AuthedFetcher, payload: CreateSetlistSongInput) =>
    fetcher<SetlistSong>(`/v1/setlists/${payload.setlistId}/songs`, {
      method: "POST",
      body: JSON.stringify({
        title: payload.title,
        artist: payload.artist,
      }),
    }),
};

export const songIdeasApi = {
  listForBand: (fetcher: AuthedFetcher, bandId: string) =>
    fetcher<SongIdea[]>(`/v1/bands/${bandId}/song-ideas`),
  createForBand: (fetcher: AuthedFetcher, bandId: string, payload: CreateSongIdeaInput) =>
    fetcher<SongIdea>(`/v1/bands/${bandId}/song-ideas`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateStatus: (fetcher: AuthedFetcher, id: string, status: SongIdeaStatus) =>
    fetcher<SongIdea>(`/v1/song-ideas/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

export const venuesApi = {
  listForBand: (fetcher: AuthedFetcher, bandId: string) =>
    fetcher<Venue[]>(`/v1/bands/${bandId}/venues`),
  createForBand: (fetcher: AuthedFetcher, bandId: string, payload: CreateVenueInput) =>
    fetcher<Venue>(`/v1/bands/${bandId}/venues`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const earningsApi = {
  listForBand: (fetcher: AuthedFetcher, bandId: string) =>
    fetcher<Earning[]>(`/v1/bands/${bandId}/earnings`),
  createForBand: (fetcher: AuthedFetcher, bandId: string, payload: CreateEarningInput) =>
    fetcher<Earning>(`/v1/bands/${bandId}/earnings`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
