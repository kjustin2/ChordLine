"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Band } from "@chordline/types";
import { useApi } from "@/lib/useApi";
import { bandsApi, type CreateBandInput } from "@/lib/apiClient";

export type BandContextValue = {
  bands: Band[];
  activeBandId: string | null;
  setActiveBandId: (bandId: string) => void;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createBand: (payload: CreateBandInput) => Promise<Band | null>;
};

const BandContext = createContext<BandContextValue | undefined>(undefined);

export function BandProvider({ children }: { children: React.ReactNode }) {
  const { apiAuthed } = useApi();
  const [bands, setBands] = useState<Band[]>([]);
  const [activeBandId, setActiveBandId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await bandsApi.list(apiAuthed);
      if (!response) {
        setBands([]);
        setActiveBandId(null);
        return;
      }

      setBands(response);
      if (!activeBandId && response.length > 0) {
        setActiveBandId(response[0].id);
      } else if (activeBandId && !response.some((band) => band.id === activeBandId)) {
        setActiveBandId(response[0]?.id ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bands");
      setBands([]);
      setActiveBandId(null);
    } finally {
      setLoading(false);
    }
  }, [apiAuthed, activeBandId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createBand = useCallback(
  async (payload: CreateBandInput) => {
      try {
        const response = await bandsApi.create(apiAuthed, payload);

        if (!response) return null;

        setBands((prev) => {
          const next = [response, ...prev];
          return next.sort((a, b) => a.name.localeCompare(b.name));
        });
        setActiveBandId(response.id);
        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create band");
        return null;
      }
    },
    [apiAuthed],
  );

  const value = useMemo(
    () => ({
      bands,
      activeBandId,
      setActiveBandId,
      loading,
      error,
      refresh,
      createBand,
    }),
    [bands, activeBandId, loading, error, refresh, createBand],
  );

  return <BandContext.Provider value={value}>{children}</BandContext.Provider>;
}

export function useBandContext() {
  const context = useContext(BandContext);
  if (!context) {
    throw new Error("useBandContext must be used within a BandProvider");
  }
  return context;
}
