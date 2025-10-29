"use client";
import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";
import { api } from "@/lib/api";

export function useApi() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  // Memoize apiAuthed so components can safely include it in effect deps
  // without causing repeated calls due to function identity changes.
  const apiAuthed = useCallback(async function apiAuthed<T>(path: string, init?: RequestInit) {
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
