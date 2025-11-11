"use client";

import { type FormEvent, useEffect, useState } from "react";
import type { Venue } from "@chordline/types";
import { useBandContext } from "@/providers/BandProvider";
import { useApi } from "@/lib/useApi";
import { venuesApi, type CreateVenueInput } from "@/lib/apiClient";
import { Card } from "../common/Card";
import { DataState } from "../common/DataState";
import { Button } from "../common/Button";

export function VenuesSection() {
  const { activeBandId } = useBandContext();
  const { apiAuthed } = useApi();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeBandId) {
      setVenues([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
  const response = await venuesApi.listForBand(apiAuthed, activeBandId);
        if (!cancelled) {
          setVenues(response ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load venues");
          setVenues([]);
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

  const handleCreate = async (payload: CreateVenueInput) => {
    if (!activeBandId) return false;

    try {
      const response = await venuesApi.createForBand(apiAuthed, activeBandId, payload);
      if (!response) return false;
      setVenues((prev) => [response, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create venue");
      return false;
    }
  };

  return (
    <section id="venues" className="space-y-6 md:space-y-8">
      <Card title="Venues" action={<NewVenueForm disabled={!activeBandId} onCreate={handleCreate} />}>
        <DataState
          loading={loading}
          error={error}
          isEmpty={!venues.length}
          empty={activeBandId ? "Log the rooms you play to track opportunities." : "Select a band to view venues."}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {venues.map((venue) => (
              <article key={venue.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">{venue.name}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {[venue.city, venue.state, venue.country].filter(Boolean).join(", ") || "Location TBD"}
                </p>
                {venue.description ? <p className="mt-2 text-xs text-slate-600">{venue.description}</p> : null}
              </article>
            ))}
          </div>
        </DataState>
      </Card>
    </section>
  );
}

type NewVenueFormProps = {
  onCreate: (payload: CreateVenueInput) => Promise<boolean>;
  disabled: boolean;
};

function NewVenueForm({ onCreate, disabled }: NewVenueFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Venue name is required");
      return;
    }

    setSubmitting(true);
    const ok = await onCreate({
      name: name.trim(),
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      country: country.trim() || undefined,
    });
    setSubmitting(false);

    if (!ok) {
      setError("Unable to save venue");
      return;
    }

    setName("");
    setCity("");
    setState("");
    setCountry("");
    setError(null);
    setOpen(false);
  };

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)} disabled={disabled}>
        New venue
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Add venue</span>
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
          placeholder="Riverfront Hall"
        />
      </label>
      <label className="text-xs text-slate-500">
        City
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-slate-500">
          State/Province
          <input
            value={state}
            onChange={(event) => setState(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </label>
        <label className="text-xs text-slate-500">
          Country
          <input
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </label>
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      <div className="flex justify-end">
        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
