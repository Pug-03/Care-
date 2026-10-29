import { describe, expect, it } from "vitest";
import { analyze, bmiLevel, bmiOf, bpLevel, SAMPLE_PROFILE, type Profile } from "./health";
import { CHOICES } from "./choices";
import { dailyMissions, dateKey, idleDaysOf, levelOf, MAX_RECOMMENDED, MISSION_BY_ID, recommendMissions, streakOf } from "./missions";
import { canPat, catNow, formOf, giveItem, ITEMS, newPet, pat, petAt } from "./pet";
import { distanceKm, FACILITIES, isOpen } from "./clinics";

const healthy: Profile = {
  ...SAMPLE_PROFILE,
  weightKg: 52,
  systolic: 112,
  diastolic: 72,
  sleepHours: 7.5,
  exerciseDays: 5,
  sweet: 0,
  salty: 0,
  fatty: 0,
  veggies: 5,
  stress: 3,
  alcohol: 0,
  water: 8,
  family: { diabetes: false, hypertension: false, heart: false },
};

describe("health model", () => {
  it("computes BMI with Asian cut-offs", () => {
    expect(bmiOf(160, 64)).toBe(25);
    expect(bmiLevel(22.9)).toBe("good");
    expect(bmiLevel(23)).toBe("watch");
    expect(bmiLevel(25)).toBe("high");
  });

  it("grades blood pressure", () => {
    expect(bpLevel(118, 76)).toBe("good");
    expect(bpLevel(128, 79)).toBe("watch");
    expect(bpLevel(142, 85)).toBe("high");
    expect(bpLevel()).toBeNull();
  });

  it("scores risky habits above healthy ones", () => {
    const risky = analyze(SAMPLE_PROFILE);
    const good = analyze(healthy);
    expect(risky.overall).toBeGreaterThan(good.overall);
    expect(good.overallLevel).toBe("good");
    for (const c of risky.conditions) expect(c.score).toBeGreaterThanOrEqual(3);
  });

  it("flags a doctor visit for high blood pressure", () => {
    const a = analyze({ ...healthy, systolic: 150, diastolic: 95 });
    expect(a.seeDoctor).toBe(true);
    expect(analyze(healthy).seeDoctor).toBe(false);
  });

  it("smoking raises heart risk", () => {
    const heart = (p: Profile) => analyze(p).conditions.find((c) => c.id === "heart")!.score;
    const older = { ...healthy, age: 55 };
    expect(heart({ ...older, smoking: "current" })).toBeGreaterThan(heart(older));
  });
});

describe("missions", () => {
  it("recommends missions for high factors first, without duplicates", () => {
    const rec = recommendMissions(SAMPLE_PROFILE, analyze(SAMPLE_PROFILE));
    expect(rec.length).toBeGreaterThan(3);
    expect(rec.length).toBeLessThanOrEqual(MAX_RECOMMENDED);
    expect(rec[0].priority).toBe("high");
    expect(new Set(rec.map((r) => r.mission.id)).size).toBe(rec.length);
  });

  it("falls back to keep-going missions when everything is fine", () => {
    const rec = recommendMissions(healthy, analyze(healthy));
    expect(rec.map((r) => r.mission.id)).toEqual(["move-walk", "food-veg", "water"]);
  });

  it("skips the smoking mission for people who already quit", () => {
    const ids = recommendMissions({ ...healthy, smoking: "former" }, analyze({ ...healthy, smoking: "former" })).map((r) => r.mission.id);
    expect(ids).not.toContain("habit-smoke");
  });

  it("adds picked missions after the recommended ones, ignoring unknown ids and duplicates", () => {
    const a = analyze(healthy);
    const list = dailyMissions(healthy, a, ["check-bp", "water", "nope"]);
    expect(list.map((m) => m.mission.id)).toEqual(["move-walk", "food-veg", "water", "check-bp"]);
    expect(dailyMissions(null, null, ["water"]).map((m) => m.mission.id)).toEqual(["water"]);
  });

  it("every Health Choice points at a real mission", () => {
    for (const c of CHOICES) expect(MISSION_BY_ID[c.mission]).toBeDefined();
  });

  it("levels up every 100 lifetime XP", () => {
    expect(levelOf(0)).toEqual({ level: 1, into: 0 });
    expect(levelOf(250)).toEqual({ level: 3, into: 50 });
  });

  it("counts streaks across days and forgives an unfinished today", () => {
    const today = new Date(2026, 9, 29, 12);
    const day = (n: number) => dateKey(new Date(2026, 9, 29 - n));
    expect(streakOf({}, today)).toBe(0);
    expect(streakOf({ [day(1)]: ["water"], [day(2)]: ["water"] }, today)).toBe(2);
    expect(streakOf({ [day(0)]: ["water"], [day(1)]: ["water"], [day(3)]: ["water"] }, today)).toBe(2);
    expect(idleDaysOf({ [day(3)]: ["water"], [day(5)]: ["water"] }, today)).toBe(3);
    expect(idleDaysOf({}, today)).toBeNull();
  });
});

describe("pet", () => {
  const t0 = new Date(2026, 9, 29, 8);
  const hours = (h: number) => new Date(t0.getTime() + h * 3_600_000);

  it("stats wear down over time and never go below zero", () => {
    const p = newPet(t0);
    const later = petAt(p, hours(10));
    expect(later.full).toBe(40);
    expect(later.joy).toBe(50);
    expect(petAt(p, hours(1000)).full).toBe(0);
    expect(petAt(p, hours(-5)).full).toBe(70);
  });

  it("items apply their effect on top of decay and cap at 100", () => {
    const fish = ITEMS.find((i) => i.id === "fish")!;
    expect(giveItem(newPet(t0), fish, hours(10)).full).toBe(80);
    expect(giveItem({ ...newPet(t0), full: 90 }, fish, t0).full).toBe(100);
  });

  it("free pats cool down for an hour", () => {
    const p = pat(newPet(t0), t0);
    expect(p.joy).toBe(75);
    expect(canPat(p, hours(0.5))).toBe(false);
    expect(canPat(p, hours(1))).toBe(true);
  });

  it("picks the cat character from how the user is doing", () => {
    const pet = newPet(t0);
    expect(formOf({ pet, streak: 0, areasToday: [], idleDays: null })).toBe("sprout");
    expect(formOf({ pet, streak: 1, areasToday: ["sleep"], idleDays: 0 })).toBe("cozy");
    expect(formOf({ pet, streak: 3, areasToday: ["sleep"], idleDays: 0 })).toBe("glow");
    expect(formOf({ pet, streak: 0, areasToday: [], idleDays: 2 })).toBe("cloud");
    expect(formOf({ pet: { ...pet, full: 10 }, streak: 5, areasToday: [], idleDays: 0 })).toBe("cloud");
  });

  it("reads the whole cat state from saved data", () => {
    const cat = catNow(newPet(t0), { [dateKey(t0)]: ["mind-breathe"] }, t0);
    expect(cat.form).toBe("cozy");
    expect(cat.mood).toBe("happy");
  });
});

describe("clinics", () => {
  it("measures distance", () => {
    expect(distanceKm({ lat: 13.7466, lng: 100.5347 }, { lat: 13.7466, lng: 100.5347 })).toBe(0);
    expect(distanceKm({ lat: 13.75, lng: 100.5 }, { lat: 13.85, lng: 100.5 })).toBeCloseTo(11.1, 0);
  });

  it("knows weekday-only hours", () => {
    const weekdayOnly = FACILITIES.find((f) => f.days === "จ.–ศ.")!;
    expect(isOpen(weekdayOnly, new Date(2026, 9, 25, 10))).toBe(false); // Sunday
    expect(isOpen(weekdayOnly, new Date(2026, 9, 26, 10))).toBe(true); // Monday
  });
});
