"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { SONG_IDEA_STATUSES, type SongIdea } from "@chordline/types";
import { useBandContext } from "@/providers/BandProvider";
import { useApi } from "@/lib/useApi";
import { songIdeasApi, type CreateSongIdeaInput } from "@/lib/apiClient";
import { Card } from "../common/Card";
import { DataState } from "../common/DataState";
import { Button } from "../common/Button";

const STATUSES = SONG_IDEA_STATUSES;

export function SongIdeasSection() {
  const { activeBandId } = useBandContext();
  const { apiAuthed } = useApi();

  const [ideas, setIdeas] = useState<SongIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeBandId) {
      setIdeas([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
  const response = await songIdeasApi.listForBand(apiAuthed, activeBandId);
        if (!cancelled) {
          setIdeas(response ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load song ideas");
          setIdeas([]);
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

  const grouped = useMemo(() => {
    return STATUSES.map((status) => ({
      status,
      ideas: ideas.filter((idea) => idea.status === status),
    }));
  }, [ideas]);

  const handleCreate = async (payload: CreateSongIdeaInput) => {
    if (!activeBandId) return false;

    try {
      const response = await songIdeasApi.createForBand(apiAuthed, activeBandId, payload);
      if (!response) return false;
      setIdeas((prev) => [response, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create song idea");
      return false;
    }
  };

  const handleStatusChange = async (id: string, status: SongIdea["status"]) => {
    try {
      const response = await songIdeasApi.updateStatus(apiAuthed, id, status);
      if (!response) return;
      setIdeas((prev) => prev.map((idea) => (idea.id === id ? response : idea)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update song idea");
    }
  };

  return (
    <section id="song-ideas" className="space-y-6 md:space-y-8">
      <Card title="Song ideas" action={<NewSongIdeaForm disabled={!activeBandId} onCreate={handleCreate} />}>
        <DataState
          loading={loading}
          error={error}
          isEmpty={!ideas.length}
          empty={activeBandId ? "Capture a melody, lyric, or riff to share with the band." : "Select a band to view song ideas."}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {grouped.map(({ status, ideas: bucket }) => (
              <div key={status} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <header className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">{statusLabel(status)}</span>
                  <span className="text-xs text-slate-500">{bucket.length}</span>
                </header>
                <ul className="mt-3 flex flex-col gap-2 text-xs text-slate-600">
                  {bucket.length ? (
                    bucket.map((idea) => (
                      <li key={idea.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="font-semibold text-slate-900">{idea.title}</p>
                        <p className="mt-1 line-clamp-3 text-slate-600">{idea.body}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {STATUSES.filter((option) => option !== idea.status).map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => void handleStatusChange(idea.id, option)}
                              className="rounded-full border border-slate-300 px-2 py-1 text-[11px] text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                            >
                              Mark {statusLabel(option)}
                            </button>
                          ))}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center text-slate-400">
                      Nothing here yet.
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </DataState>
      </Card>
    </section>
  );
}

type NewSongIdeaFormProps = {
  onCreate: (payload: CreateSongIdeaInput) => Promise<boolean>;
  disabled: boolean;
};

function NewSongIdeaForm({ onCreate, disabled }: NewSongIdeaFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<SongIdea["status"]>("DRAFT");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Title and description are required");
      return;
    }

    setSubmitting(true);
    const ok = await onCreate({
      title: title.trim(),
      body: body.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      status,
    });
    setSubmitting(false);

    if (!ok) {
      setError("Unable to save song idea");
      return;
    }

    setTitle("");
    setBody("");
    setTags("");
    setStatus("DRAFT");
    setError(null);
    setOpen(false);
  };

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)} disabled={disabled}>
        New idea
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Capture idea</span>
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
          placeholder="Late Night Echoes"
        />
      </label>
      <label className="text-xs text-slate-500">
        Notes
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="mt-1 h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Verse groove, chorus chords, arrangement thoughts"
        />
      </label>
      <label className="text-xs text-slate-500">
        Tags (comma separated)
        <input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="ballad, 6/8"
        />
      </label>
      <label className="text-xs text-slate-500">
        Status
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as SongIdea["status"])}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          {STATUSES.map((option) => (
            <option key={option} value={option}>
              {statusLabel(option)}
            </option>
          ))}
        </select>
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

function statusLabel(status: SongIdea["status"]) {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "SHARED":
      return "Shared";
    case "ARCHIVED":
      return "Archived";
    default:
      return status;
  }
}
