"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "./health";
import type { Right } from "./clinics";
import { dateKey, MISSION_BY_ID } from "./missions";
import { canPat, giveItem, ITEMS, newPet, pat, type PetState } from "./pet";

/** XP given once, after the first quiz, so the cat can be fed from day one. */
export const WELCOME_XP = 30;

interface CareState {
  profile: Profile | null;
  /** When the profile was last saved (ISO). */
  updatedAt: string | null;
  /** Missions the user added themselves, from Health Choice or the mission list. */
  picked: string[];
  /** Finished missions keyed by local date (YYYY-MM-DD). Finishing is final, so XP cannot be farmed. */
  done: Record<string, string[]>;
  /** Spendable XP. */
  xp: number;
  /** Lifetime XP, for the level. */
  xpTotal: number;
  welcomed: boolean;
  pet: PetState;
  rights: Right[];
  consent: boolean;
  setProfile: (p: Profile) => void;
  togglePicked: (id: string) => void;
  /** Marks a mission done for today and pays its XP. Returns false if it was already done. */
  complete: (id: string) => boolean;
  /** Spends XP on an item and gives it to the cat. Returns false if there is not enough XP. */
  buy: (itemId: string) => boolean;
  /** Free pat, once an hour. Returns false while it is cooling down. */
  patPet: () => boolean;
  setRights: (r: Right[]) => void;
  setConsent: (v: boolean) => void;
  reset: () => void;
}

const fresh = () => ({
  profile: null,
  updatedAt: null,
  picked: [] as string[],
  done: {} as Record<string, string[]>,
  xp: 0,
  xpTotal: 0,
  welcomed: false,
  pet: newPet(),
  rights: [] as Right[],
  consent: false,
});

export const useCare = create<CareState>()(
  persist(
    (set, get) => ({
      ...fresh(),
      setProfile: (profile) =>
        set((s) => ({
          profile,
          updatedAt: new Date().toISOString(),
          // First quiz: welcome XP, and the cat's clock starts now (it is not saved before the first change).
          ...(s.welcomed ? {} : { welcomed: true, xp: s.xp + WELCOME_XP, xpTotal: s.xpTotal + WELCOME_XP, pet: newPet() }),
        })),
      togglePicked: (id) => set((s) => ({ picked: s.picked.includes(id) ? s.picked.filter((x) => x !== id) : [...s.picked, id] })),
      complete: (id) => {
        const s = get();
        const mission = MISSION_BY_ID[id];
        const today = dateKey();
        const day = s.done[today] ?? [];
        if (!mission || day.includes(id)) return false;
        set({ done: { ...s.done, [today]: [...day, id] }, xp: s.xp + mission.xp, xpTotal: s.xpTotal + mission.xp });
        return true;
      },
      buy: (itemId) => {
        const s = get();
        const item = ITEMS.find((i) => i.id === itemId);
        if (!item || s.xp < item.cost) return false;
        set({ xp: s.xp - item.cost, pet: giveItem(s.pet, item) });
        return true;
      },
      patPet: () => {
        const s = get();
        if (!canPat(s.pet)) return false;
        set({ pet: pat(s.pet) });
        return true;
      },
      setRights: (rights) => set({ rights }),
      setConsent: (consent) => set({ consent }),
      reset: () => set(fresh()),
    }),
    {
      name: "careplus",
      version: 2,
      // v1 had the AI chat and the future simulation; keep the profile, settings and mission history, start the game fresh.
      migrate: (old, version) => {
        const base = fresh();
        if (version >= 2) return { ...base, ...(old as object) };
        const o = (old ?? {}) as Partial<CareState>;
        // Ticks from v1 paid no XP; drop today's so those missions can still be finished for XP today.
        const done = Object.fromEntries(Object.entries(o.done ?? {}).filter(([day]) => day !== dateKey()));
        const bonus = o.profile ? { welcomed: true, xp: WELCOME_XP, xpTotal: WELCOME_XP } : {};
        return { ...base, ...bonus, profile: o.profile ?? null, updatedAt: o.updatedAt ?? null, done, rights: o.rights ?? [], consent: o.consent ?? false };
      },
      partialize: ({ profile, updatedAt, picked, done, xp, xpTotal, welcomed, pet, rights, consent }) => ({
        profile,
        updatedAt,
        picked,
        done,
        xp,
        xpTotal,
        welcomed,
        pet,
        rights,
        consent,
      }),
    },
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
