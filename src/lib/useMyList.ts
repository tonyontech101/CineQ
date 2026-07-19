"use client";

import { useCallback, useEffect, useState } from "react";
import type { MovieSummary } from "./types";

const STORAGE_KEY = "cinequeue:my-list";
const SYNC_EVENT = "cinequeue:my-list-changed";

function readList(): MovieSummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(list: MovieSummary[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  // Notify other components/hook instances in this tab.
  window.dispatchEvent(new CustomEvent(SYNC_EVENT));
}

/**
 * Client-side "My List" favorites, persisted to localStorage. No backend or
 * auth — the list is per-browser. Multiple components stay in sync via a
 * custom event (same tab) and the native `storage` event (other tabs).
 */
export function useMyList() {
  const [list, setList] = useState<MovieSummary[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setList(readList());
    setHydrated(true);

    const sync = () => setList(readList());
    window.addEventListener(SYNC_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SYNC_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const has = useCallback((id: number) => list.some((m) => m.id === id), [list]);

  const add = useCallback((movie: MovieSummary) => {
    const current = readList();
    if (current.some((m) => m.id === movie.id)) return;
    writeList([movie, ...current]);
  }, []);

  const remove = useCallback((id: number) => {
    const current = readList();
    writeList(current.filter((m) => m.id !== id));
  }, []);

  const toggle = useCallback(
    (movie: MovieSummary) => {
      if (has(movie.id)) remove(movie.id);
      else add(movie);
    },
    [has, add, remove],
  );

  return { list, hydrated, has, add, remove, toggle };
}
