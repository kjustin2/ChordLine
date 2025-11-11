"use client";

import { type FormEvent, useEffect, useState } from "react";
import type { Setlist, SetlistSong } from "@chordline/types";
import { useBandContext } from "@/providers/BandProvider";
import { useApi } from "@/lib/useApi";
import {
  setlistsApi,
  setlistSongsApi,
  type CreateSetlistInput,
  type CreateSetlistSongInput,
} from "@/lib/apiClient";
import { Card } from "../common/Card";
import { DataState } from "../common/DataState";
import { Button } from "../common/Button";

export function SetlistsSection() {
  const { activeBandId } = useBandContext();
  const { apiAuthed } = useApi();

  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [songsBySetlist, setSongsBySetlist] = useState<Record<string, SetlistSong[]>>({});
  const [songLoading, setSongLoading] = useState<Record<string, boolean>>({});
  const [songError, setSongError] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!activeBandId) {
      setSetlists([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
  const response = await setlistsApi.listForBand(apiAuthed, activeBandId);
        if (!cancelled) {
          setSetlists(response ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load setlists");
          setSetlists([]);
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

  const handleCreateSetlist = async (payload: CreateSetlistInput) => {
    if (!activeBandId) return false;

    try {
      const response = await setlistsApi.createForBand(apiAuthed, activeBandId, payload);
      if (!response) return false;
      setSetlists((prev) => [response, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create setlist");
      return false;
    }
  };

  const handleToggle = async (setlistId: string) => {
    const nextId = expanded === setlistId ? null : setlistId;
    setExpanded(nextId);

    if (!nextId || songsBySetlist[nextId] || !apiAuthed) {
      return;
    }

    setSongLoading((prev) => ({ ...prev, [nextId]: true }));
    setSongError((prev) => ({ ...prev, [nextId]: null }));

    try {
  const response = await setlistSongsApi.listForSetlist(apiAuthed, nextId);
      setSongsBySetlist((prev) => ({ ...prev, [nextId]: response ?? [] }));
    } catch (err) {
      setSongError((prev) => ({ ...prev, [nextId]: err instanceof Error ? err.message : "Unable to load songs" }));
    } finally {
      setSongLoading((prev) => ({ ...prev, [nextId]: false }));
    }
  };

  return (
    <section id="setlists" className="space-y-6 md:space-y-8">
      <Card title="Setlists" action={<NewSetlistForm disabled={!activeBandId} onCreate={handleCreateSetlist} />}>
        <DataState
          loading={loading}
          error={error}
          isEmpty={!setlists.length}
          empty={activeBandId ? "Create a setlist to start plotting your show flow." : "Select a band to view setlists."}
        >
          <ul className="flex flex-col gap-3">
            {setlists.map((setlist) => {
              const isOpen = expanded === setlist.id;
              const songs = songsBySetlist[setlist.id] ?? [];
              const songsPending = songLoading[setlist.id];
              const songsErr = songError[setlist.id];
              return (
                <li key={setlist.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <button
                    type="button"
                    onClick={() => void handleToggle(setlist.id)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{setlist.title}</p>
                      {setlist.description ? <p className="text-xs text-slate-500">{setlist.description}</p> : null}
                    </div>
                    <span className="text-xs text-indigo-600">{isOpen ? "Hide" : "View"}</span>
                  </button>
                  {isOpen ? (
                    <div className="mt-3 border-t border-slate-200 pt-3 text-sm">
                      {songsPending ? <p className="text-xs text-slate-500">Loading songs…</p> : null}
                      {songsErr ? <p className="text-xs text-red-500">{songsErr}</p> : null}
                      {!songsPending && !songsErr ? (
                        songs.length ? (
                          <ol className="space-y-2">
                            {songs.map((song, index) => (
                              <li key={song.id} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">
                                <span className="font-semibold text-slate-900">{index + 1}. {song.title}</span>
                                {song.artist ? <span className="ml-2 text-slate-500">({song.artist})</span> : null}
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-xs text-slate-500">No songs added yet.</p>
                        )
                      ) : null}
                      <AddSongForm
                        setlistId={setlist.id}
                        disabled={songsPending}
                        onCreated={(song) =>
                          setSongsBySetlist((prev) => ({
                            ...prev,
                            [setlist.id]: [...(prev[setlist.id] ?? []), song],
                          }))
                        }
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </DataState>
      </Card>
    </section>
  );
}

type NewSetlistFormProps = {
  onCreate: (payload: CreateSetlistInput) => Promise<boolean>;
  disabled: boolean;
};

function NewSetlistForm({ onCreate, disabled }: NewSetlistFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSubmitting(true);
    const ok = await onCreate({ title: title.trim(), description: description.trim() || undefined });
    setSubmitting(false);
    if (!ok) {
      setError("Unable to create setlist");
      return;
    }
    setTitle("");
    setDescription("");
    setError(null);
    setOpen(false);
  };

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)} disabled={disabled}>
        New setlist
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Create setlist</span>
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
        />
      </label>
      <label className="text-xs text-slate-500">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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

type AddSongFormProps = {
  setlistId: string;
  disabled: boolean;
  onCreated: (song: SetlistSong) => void;
};

function AddSongForm({ setlistId, disabled, onCreated }: AddSongFormProps) {
  const { apiAuthed } = useApi();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Song title is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateSetlistSongInput = {
        setlistId,
        title: title.trim(),
        artist: artist.trim() || undefined,
      };
      const response = await setlistSongsApi.createForSetlist(apiAuthed, payload);
      if (!response) {
        setError("Unable to add song");
        return;
      }
      onCreated(response);
      setTitle("");
      setArtist("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add song");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs">
      <p className="font-semibold text-slate-700">Add song</p>
      <label className="text-slate-500">
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Skyline Dreams"
          disabled={disabled || submitting}
        />
      </label>
      <label className="text-slate-500">
        Artist
        <input
          value={artist}
          onChange={(event) => setArtist(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Band name"
          disabled={disabled || submitting}
        />
      </label>
      {error ? <p className="text-red-500">{error}</p> : null}
      <div className="flex justify-end">
        <Button variant="primary" type="submit" disabled={disabled || submitting}>
          {submitting ? "Adding…" : "Add"}
        </Button>
      </div>
    </form>
  );
}
