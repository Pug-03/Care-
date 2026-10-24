import { describe, expect, it } from "vitest";
import { buildPlan } from "./actions";
import { analyze, bmiLevel, bmiOf, bpLevel, SAMPLE_PROFILE, type Profile } from "./health";
import { distanceKm, FACILITIES, isOpen } from "./clinics";
import { projectProfile, simulate, suggestedChanges } from "./simulate";

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

describe("simulation", () => {
  it("keeps-habits path ends riskier than improved path", () => {
    const sim = simulate(SAMPLE_PROFILE, suggestedChanges(SAMPLE_PROFILE), 5);
    expect(sim.current).toHaveLength(6);
    expect(sim.current[5].overall).toBeGreaterThan(sim.improved[5].overall);
    expect(sim.currentEndProfile.weightKg).toBeGreaterThan(SAMPLE_PROFILE.weightKg);
  });

  it("weight loss levels off near a healthy BMI", () => {
    const p = projectProfile(SAMPLE_PROFILE, { ...SAMPLE_PROFILE, ...suggestedChanges(SAMPLE_PROFILE) }, 30);
    expect(bmiOf(p.heightCm, p.weightKg)).toBeGreaterThanOrEqual(21.4);
  });
});

describe("plan", () => {
  it("builds concrete actions for high factors first", () => {
    const plan = buildPlan(SAMPLE_PROFILE, analyze(SAMPLE_PROFILE));
    expect(plan.length).toBeGreaterThan(3);
    expect(plan[0].priority).toBe("high");
    expect(new Set(plan.map((a) => a.id)).size).toBe(plan.length);
  });

  it("falls back to a keep-going action when everything is fine", () => {
    expect(buildPlan(healthy, analyze(healthy))[0].id).toBe("keep");
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

describe("simulation start", () => {
  it("both scenarios start from today's score", () => {
    const sim = simulate(SAMPLE_PROFILE, suggestedChanges(SAMPLE_PROFILE), 3);
    expect(sim.improved[0].overall).toBe(sim.current[0].overall);
  });
});

describe("chat safety", () => {
  it("catches emergency symptoms before the model", async () => {
    const { redFlag, offlineReply } = await import("./chat");
    expect(redFlag("เจ็บแน่นหน้าอกมาก")).toBe(true);
    expect(redFlag("แขนซ้ายชา พูดไม่ชัด")).toBe(true);
    expect(redFlag("นอนไม่หลับ")).toBe(false);
    expect(offlineReply("หายใจไม่ออก", null)).toContain("1669");
    expect(offlineReply("อยากตาย", null)).toContain("1323");
  });
});
