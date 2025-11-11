"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import type { Band, Earning, Event, SongIdea, User } from "@chordline/types";
import { useApi } from "@/lib/useApi";
import { useBandContext } from "@/providers/BandProvider";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { usersApi, eventsApi, songIdeasApi, earningsApi } from "@/lib/apiClient";
import { Card } from "../common/Card";
import { DataState } from "../common/DataState";
import { Button } from "../common/Button";

export function OverviewSection() {
  const { apiAuthed } = useApi();
  const { bands, activeBandId, setActiveBandId, createBand, loading: bandsLoading } = useBandContext();

  const [userState, setUserState] = useState<{ data: User | null; loading: boolean; error: string | null }>({
    data: null,
    loading: true,
    error: null,
  });

  const [eventsState, setEventsState] = useState<{ data: Event[]; loading: boolean; error: string | null }>({
    data: [],
    loading: false,
    error: null,
  });

  const [ideasState, setIdeasState] = useState<{ data: SongIdea[]; loading: boolean; error: string | null }>({
    data: [],
    loading: false,
    error: null,
  });

  const [earningsState, setEarningsState] = useState<{ data: Earning[]; loading: boolean; error: string | null }>({
    data: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setUserState((prev) => ({ ...prev, loading: true, error: null }));

    (async () => {
      try {
  const response = await usersApi.me(apiAuthed);
        if (!cancelled) {
          setUserState({ data: response ?? null, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setUserState({ data: null, loading: false, error: err instanceof Error ? err.message : "Failed to load profile" });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiAuthed]);

  useEffect(() => {
    if (!activeBandId) {
      setEventsState({ data: [], loading: false, error: null });
      setIdeasState({ data: [], loading: false, error: null });
      setEarningsState({ data: [], loading: false, error: null });
      return;
    }

    let cancelled = false;

    const fetchEvents = async () => {
      setEventsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
  const response = await eventsApi.listForBand(apiAuthed, activeBandId);
        if (!cancelled) {
          setEventsState({ data: response ? response.slice(0, 3) : [], loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setEventsState({ data: [], loading: false, error: err instanceof Error ? err.message : "Failed to load events" });
        }
      }
    };

    const fetchIdeas = async () => {
      setIdeasState((prev) => ({ ...prev, loading: true, error: null }));
      try {
  const response = await songIdeasApi.listForBand(apiAuthed, activeBandId);
        if (!cancelled) {
          setIdeasState({ data: response ?? [], loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setIdeasState({ data: [], loading: false, error: err instanceof Error ? err.message : "Failed to load song ideas" });
        }
      }
    };

    const fetchEarnings = async () => {
      setEarningsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
  const response = await earningsApi.listForBand(apiAuthed, activeBandId);
        if (!cancelled) {
          setEarningsState({ data: response ?? [], loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setEarningsState({ data: [], loading: false, error: err instanceof Error ? err.message : "Failed to load earnings" });
        }
      }
    };

    void fetchEvents();
    void fetchIdeas();
    void fetchEarnings();

    return () => {
      cancelled = true;
    };
  }, [apiAuthed, activeBandId]);

  const ideaSummary = useMemo(() => {
    return ideasState.data.reduce(
      (acc, idea) => {
        acc.total += 1;
        acc[idea.status] += 1;
        return acc;
      },
      { total: 0, DRAFT: 0, SHARED: 0, ARCHIVED: 0 } as Record<string, number>,
    );
  }, [ideasState.data]);

  const totalEarnings = useMemo(() => {
    if (!earningsState.data.length) return "0";
    const sum = earningsState.data.reduce((acc, earning) => acc + Number.parseFloat(earning.totalAmount), 0);
    return sum.toFixed(2);
  }, [earningsState.data]);

  return (
    <section id="overview" className="space-y-6 md:space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Your profile">
          <DataState
            loading={userState.loading}
            error={userState.error}
            isEmpty={!userState.data}
            empty="We could not load your profile yet."
          >
            {userState.data ? (
              <div className="flex flex-col gap-2 text-sm text-slate-600">
                <div>
                  <span className="text-xs uppercase text-slate-500">Display name</span>
                  <p className="font-medium text-slate-900">{userState.data.displayName ?? "Unnamed user"}</p>
                </div>
                <div>
                  <span className="text-xs uppercase text-slate-500">Email</span>
                  <p className="font-medium text-slate-900">{userState.data.email}</p>
                </div>
              </div>
            ) : null}
          </DataState>
        </Card>

        <Card
          title="Bands"
          action={<NewBandForm createBand={createBand} pending={bandsLoading} />}
        >
          <DataState
            loading={bandsLoading}
            error={null}
            isEmpty={!bands.length}
            empty="Create your first band to unlock the rest of the dashboard."
          >
            <ul className="flex flex-col gap-2">
              {bands.map((band) => {
                const isActive = band.id === activeBandId;
                return (
                  <li key={band.id}>
                    <button
                      type="button"
                      onClick={() => setActiveBandId(band.id)}
                      className={`${
                        isActive
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"
                      } flex w-full flex-col gap-1 rounded-xl border px-4 py-3 text-left transition`}
                    >
                      <span className="text-sm font-semibold">{band.name}</span>
                      {band.genre ? (
                        <span className="text-xs uppercase tracking-wide text-slate-500">{band.genre}</span>
                      ) : null}
                      {band.description ? <p className="text-xs text-slate-500">{band.description}</p> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </DataState>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Upcoming events">
          <DataState
            loading={eventsState.loading}
            error={eventsState.error}
            isEmpty={!eventsState.data.length}
            empty={activeBandId ? "No events found yet." : "Select or create a band to view events."}
          >
            <ul className="flex flex-col gap-3">
              {eventsState.data.map((event) => (
                <li key={event.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{event.title}</span>
                    <span>{formatDateTime(event.startsAt)}</span>
                  </div>
                  {event.venueId && event.locationName ? (
                    <p className="mt-1 text-xs text-slate-500">{event.locationName}</p>
                  ) : null}
                  {event.notes ? <p className="mt-2 text-xs text-slate-500">{event.notes}</p> : null}
                </li>
              ))}
            </ul>
          </DataState>
        </Card>

        <Card title="Momentum">
          <div className="grid gap-4 sm:grid-cols-2">
            <DataState
              loading={ideasState.loading}
              error={ideasState.error}
              isEmpty={!ideaSummary.total}
              empty="Capture a song idea to kick things off."
            >
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">Song ideas</h3>
                <dl className="mt-2 space-y-1 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <dt>Total</dt>
                    <dd className="font-semibold text-slate-900">{ideaSummary.total}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Draft</dt>
                    <dd>{ideaSummary.DRAFT}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Shared</dt>
                    <dd>{ideaSummary.SHARED}</dd>
                  </div>
                </dl>
              </div>
            </DataState>

            <DataState
              loading={earningsState.loading}
              error={earningsState.error}
              isEmpty={!earningsState.data.length}
              empty="Log your first earning to track cashflow."
            >
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">Earnings</h3>
                <p className="mt-2 text-2xl font-semibold text-indigo-600">{formatCurrency(totalEarnings)}</p>
                <p className="mt-1 text-xs text-slate-500">Lifetime recorded</p>
              </div>
            </DataState>
          </div>
        </Card>
      </div>
    </section>
  );
}

type NewBandFormProps = {
  createBand: (payload: { name: string; description?: string; genre?: string }) => Promise<Band | null>;
  pending: boolean;
};

function NewBandForm({ createBand, pending }: NewBandFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setDescription("");
    setGenre("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Band name is required");
      return;
    }

    setSubmitting(true);
    setError(null);
    const result = await createBand({ name: name.trim(), description: description.trim() || undefined, genre: genre.trim() || undefined });
    setSubmitting(false);

    if (!result) {
      setError("Unable to create band. Try again.");
      return;
    }

    reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <Button
        variant="primary"
        onClick={() => setOpen(true)}
        disabled={pending}
      >
        New band
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Create band</span>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
      <label className="text-xs text-slate-500">
        Name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Downtown Collective"
        />
      </label>
      <label className="text-xs text-slate-500">
        Genre
        <input
          value={genre}
          onChange={(event) => setGenre(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Indie Rock"
        />
      </label>
      <label className="text-xs text-slate-500">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="A short blurb for your band"
        />
      </label>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      <div className="flex justify-end">
        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
