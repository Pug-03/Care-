"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Behavior, Profile } from "./health";
import type { Right } from "./clinics";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface CareState {
  profile: Profile | null;
  /** When the profile was last saved (ISO). */
  updatedAt: string | null;
  /** Habit changes picked on the simulation screen. */
  changes: Partial<Behavior> | null;
  /** Completed actions keyed by local date (YYYY-MM-DD). */
  done: Record<string, string[]>;
  rights: Right[];
  chat: ChatMessage[];
  consent: boolean;
  setProfile: (p: Profile) => void;
  setChanges: (c: Partial<Behavior> | null) => void;
  toggleDone: (date: string, id: string) => void;
  setRights: (r: Right[]) => void;
  setChat: (c: ChatMessage[]) => void;
  setConsent: (v: boolean) => void;
  reset: () => void;
}

const initial = { profile: null, updatedAt: null, changes: null, done: {}, rights: [] as Right[], chat: [] as ChatMessage[], consent: false };

export const useCare = create<CareState>()(
  persist(
    (set) => ({
      ...initial,
      setProfile: (profile) => set({ profile, updatedAt: new Date().toISOString(), changes: null }),
      setChanges: (changes) => set({ changes }),
      toggleDone: (date, id) =>
        set((s) => {
          const day = s.done[date] ?? [];
          const next = day.includes(id) ? day.filter((x) => x !== id) : [...day, id];
          return { done: { ...s.done, [date]: next } };
        }),
      setRights: (rights) => set({ rights }),
      setChat: (chat) => set({ chat }),
      setConsent: (consent) => set({ consent }),
      reset: () => set(initial),
    }),
    { name: "careplus", version: 1 },
  ),
);

/** Persisted state only exists in the browser; render placeholders until it has loaded to avoid hydration mismatches. */
export function useHydrated() {
  return useSyncExternalStore(
    (cb) => useCare.persist.onFinishHydration(cb),
    () => useCare.persist.hasHydrated(),
    () => false,
  );
}

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
