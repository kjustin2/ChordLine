"use client";

import { type FormEvent, useEffect, useState } from "react";
import type { Event } from "@chordline/types";
import { useBandContext } from "@/providers/BandProvider";
import { useApi } from "@/lib/useApi";
import { eventsApi, type CreateEventInput } from "@/lib/apiClient";
import { formatDateTime } from "@/lib/format";
import { Card } from "../common/Card";
import { DataState } from "../common/DataState";
import { Button } from "../common/Button";

export function EventsSection() {
  const { activeBandId } = useBandContext();
  const { apiAuthed } = useApi();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeBandId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
  const response = await eventsApi.listForBand(apiAuthed, activeBandId);
        if (!cancelled) {
          setEvents(response ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load events");
          setEvents([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiAuthed, activeBandId]);

  const handleCreate = async (payload: CreateEventInput) => {
    if (!activeBandId) return false;

    try {
      const response = await eventsApi.createForBand(apiAuthed, activeBandId, payload);
      if (!response) return false;

      setEvents((prev) => [response, ...prev].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create event");
      return false;
    }
  };

  return (
    <section id="events" className="space-y-6 md:space-y-8">
      <Card title="Events" action={<NewEventForm onCreate={handleCreate} disabled={!activeBandId} />}>
        <DataState
          loading={loading}
          error={error}
          isEmpty={!events.length}
          empty={activeBandId ? "Add your first event to build momentum." : "Select a band to view its schedule."}
        >
          <ul className="flex flex-col gap-3">
            {events.map((event) => (
              <li key={event.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-slate-900">{event.title}</span>
                  <span className="text-slate-500">{formatDateTime(event.startsAt)}</span>
                </div>
                {event.notes ? <p className="mt-2 text-xs text-slate-500">{event.notes}</p> : null}
              </li>
            ))}
          </ul>
        </DataState>
      </Card>
    </section>
  );
}

type NewEventFormProps = {
  onCreate: (payload: CreateEventInput) => Promise<boolean>;
  disabled: boolean;
};

function NewEventForm({ onCreate, disabled }: NewEventFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle("");
    setDateTime("");
    setNotes("");
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !dateTime) {
      setError("Title and start time are required");
      return;
    }

    setSubmitting(true);
    const ok = await onCreate({ title: title.trim(), startsAt: new Date(dateTime).toISOString(), notes: notes.trim() || undefined });
    setSubmitting(false);

    if (!ok) {
      setError("Unable to save event");
      return;
    }

    reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)} disabled={disabled}>
        Schedule event
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">New event</span>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
      <label className="text-xs text-slate-500">
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Spring Showcase"
        />
      </label>
      <label className="text-xs text-slate-500">
        Starts at
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(event) => setDateTime(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </label>
      <label className="text-xs text-slate-500">
        Notes
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="mt-1 h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Add load-in or set time details"
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
