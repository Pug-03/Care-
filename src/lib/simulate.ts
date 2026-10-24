import { analyze, type Analysis, type Behavior, type Profile } from "./health";

/**
 * Future Health Simulation: scenario A keeps today's habits, scenario B applies the changes the user picks.
 * Each year the projected profile ages by one year and drifts in weight and blood pressure according to its
 * habits, then goes back through the same risk model. Directional, not a forecast.
 */

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** kg per year the habits push weight up (+) or down (-). */
export function weightDrift(b: Behavior) {
  const shortSleep = Math.max(0, 7 - b.sleepHours);
  const drink = Math.max(0, b.alcohol - 7) / 7;
  const x = 0.2 + 0.25 * (b.sweet + b.fatty) - 0.32 * b.exerciseDays + 0.25 * shortSleep + 0.3 * drink - 0.08 * b.veggies + 0.05 * Math.max(0, b.stress - 5);
  return clamp(x, -2.5, 3);
}

/** mmHg per year systolic pressure moves. */
export function systolicDrift(b: Behavior) {
  const shortSleep = Math.max(0, 7 - b.sleepHours);
  const drink = Math.max(0, b.alcohol - 7) / 7;
  const x = 0.4 + 0.45 * b.salty + 0.6 * drink + 0.25 * shortSleep + 0.12 * Math.max(0, b.stress - 5) - 0.35 * b.exerciseDays;
  return clamp(x, -3, 3);
}

export function projectProfile(p: Profile, b: Behavior, years: number): Profile {
  const m = p.heightCm / 100;
  const drift = weightDrift(b);
  let weight = p.weightKg + drift * years;
  // Losing weight levels off around a healthy BMI instead of continuing forever.
  if (drift < 0) weight = Math.max(weight, Math.min(p.weightKg, 21.5 * m * m));
  const sysDrift = systolicDrift(b);
  const systolic = p.systolic ? Math.round(clamp(p.systolic + sysDrift * years, Math.min(p.systolic, 112), 185)) : undefined;
  const diastolic = p.diastolic ? Math.round(clamp(p.diastolic + sysDrift * 0.55 * years, Math.min(p.diastolic, 72), 115)) : undefined;
  return { ...p, ...b, age: p.age + years, weightKg: Math.round(weight * 10) / 10, systolic, diastolic };
}

export interface ScenarioPoint {
  year: number;
  overall: number;
  weightKg: number;
}

export interface Simulation {
  years: number;
  current: ScenarioPoint[];
  improved: ScenarioPoint[];
  currentEnd: Analysis;
  improvedEnd: Analysis;
  currentEndProfile: Profile;
  improvedEndProfile: Profile;
}

/** New habits phase in over the first year, so both scenarios start from the same point today. */
function adopt(from: Behavior, to: Behavior, year: number): Behavior {
  const k = Math.min(1, year);
  if (k === 1) return to;
  const mix = (a: number, b: number) => a + (b - a) * k;
  const freq = (a: number, b: number) => Math.round(mix(a, b)) as Behavior["sweet"];
  return {
    sleepHours: mix(from.sleepHours, to.sleepHours),
    exerciseDays: mix(from.exerciseDays, to.exerciseDays),
    sweet: freq(from.sweet, to.sweet),
    salty: freq(from.salty, to.salty),
    fatty: freq(from.fatty, to.fatty),
    veggies: mix(from.veggies, to.veggies),
    stress: mix(from.stress, to.stress),
    smoking: k > 0 ? to.smoking : from.smoking,
    alcohol: mix(from.alcohol, to.alcohol),
    water: mix(from.water, to.water),
  };
}

export function simulate(p: Profile, changes: Partial<Behavior>, years: number): Simulation {
  const base: Behavior = p;
  const better: Behavior = { ...base, ...changes };
  const run = (b: Behavior) =>
    Array.from({ length: years + 1 }, (_, year) => {
      const proj = projectProfile(p, adopt(base, b, year), year);
      return { year, overall: analyze(proj).overall, weightKg: proj.weightKg };
    });
  const currentEndProfile = projectProfile(p, base, years);
  const improvedEndProfile = projectProfile(p, better, years);
  return {
    years,
    current: run(base),
    improved: run(better),
    currentEnd: analyze(currentEndProfile),
    improvedEnd: analyze(improvedEndProfile),
    currentEndProfile,
    improvedEndProfile,
  };
}

/** A sensible "what if" starting point: move each habit one realistic step toward the guideline. */
export function suggestedChanges(p: Profile): Partial<Behavior> {
  return {
    sleepHours: Math.max(p.sleepHours, 7),
    exerciseDays: Math.max(p.exerciseDays, Math.min(5, p.exerciseDays + 3)),
    sweet: Math.min(p.sweet, 1) as Behavior["sweet"],
    salty: Math.min(p.salty, 1) as Behavior["salty"],
    fatty: Math.min(p.fatty, 1) as Behavior["fatty"],
    veggies: Math.max(p.veggies, 5),
    stress: Math.min(p.stress, 4),
    smoking: p.smoking === "current" ? "former" : p.smoking,
    alcohol: Math.min(p.alcohol, 3),
    water: Math.max(p.water, 8),
  };
}
