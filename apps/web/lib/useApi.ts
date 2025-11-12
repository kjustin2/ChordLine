"use client";
import { useCallback } from "react";
import { api } from "@/lib/api";
import type { AuthedFetcher } from "@/lib/apiClient";
import { useAppAuth } from "@/lib/auth";

export function useApi() {
  const { isLoaded, isSignedIn, getToken } = useAppAuth();

  // Memoize apiAuthed so components can safely include it in effect deps
  // without causing repeated calls due to function identity changes.
  const apiAuthed: AuthedFetcher = useCallback(async function apiAuthed<T>(path: string, init?: RequestInit) {
    if (!isLoaded || !isSignedIn) {
      console.warn("User not signed in or Clerk not loaded");
      return null;
    }

    const token = await getToken({ template: "default" }).catch(() => null);
    if (!token) {
      console.warn("No token returned from Clerk");
      return null;
    }

    return api<T>(path, token, init);
  }, [isLoaded, isSignedIn, getToken]);

  return { apiAuthed };
}
