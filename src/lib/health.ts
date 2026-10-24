/**
 * CARE+ risk model.
 *
 * A transparent, rule-based screening heuristic built from the risk factors WHO lists for NCDs
 * (diet, physical activity, tobacco, alcohol, weight, blood pressure). It ranks what to work on and
 * shows direction of change; it is not a validated clinical score and never a diagnosis.
 */

export type Sex = "male" | "female";
export type Smoking = "never" | "former" | "current";
/** 0 rarely · 1 sometimes · 2 often · 3 almost every day */
export type Freq = 0 | 1 | 2 | 3;

export interface Behavior {
  sleepHours: number;
  /** Days per week with 30+ minutes of moderate activity. */
  exerciseDays: number;
  sweet: Freq;
  salty: Freq;
  fatty: Freq;
  /** Servings of vegetables and fruit per day. */
  veggies: number;
  /** 1 (calm) to 10 (very stressed). */
  stress: number;
  smoking: Smoking;
  /** Standard drinks per week. */
  alcohol: number;
  /** Glasses of water per day. */
  water: number;
}

export interface Profile extends Behavior {
  name: string;
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  /** Optional home blood-pressure reading. */
  systolic?: number;
  diastolic?: number;
  family: { diabetes: boolean; hypertension: boolean; heart: boolean };
}

export type Level = "good" | "watch" | "high";

export interface Factor {
  id: keyof Behavior | "bmi" | "bp";
  label: string;
  value: string;
  level: Level;
  note: string;
}

export type ConditionId = "diabetes" | "hypertension" | "heart" | "obesity";

export interface ConditionRisk {
  id: ConditionId;
  label: string;
  /** Indicative 0-100 score. */
  score: number;
}

export interface Analysis {
  bmi: number;
  bmiLevel: Level;
  bpLevel: Level | null;
  factors: Factor[];
  conditions: ConditionRisk[];
  /** 0-100, higher is riskier. */
  overall: number;
  overallLevel: Level;
  /** True when something should be checked by a clinician. */
  seeDoctor: boolean;
  seeDoctorReasons: string[];
}

export const CONDITION_LABEL: Record<ConditionId, string> = {
  diabetes: "เบาหวานชนิดที่ 2",
  hypertension: "ความดันโลหิตสูง",
  heart: "โรคหัวใจและหลอดเลือด",
  obesity: "ภาวะน้ำหนักเกิน/อ้วน",
};

export const FREQ_LABEL: Record<Freq, string> = { 0: "แทบไม่", 1: "บางครั้ง", 2: "บ่อย", 3: "แทบทุกวัน" };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

export function bmiOf(heightCm: number, weightKg: number) {
  const m = heightCm / 100;
  return m > 0 ? round1(weightKg / (m * m)) : 0;
}

/** Asian cut-offs (WHO Western Pacific): 23 overweight, 25 obese. */
export function bmiLevel(bmi: number): Level {
  if (bmi < 18.5) return "watch";
  if (bmi < 23) return "good";
  if (bmi < 25) return "watch";
  return "high";
}

export function bpLevel(sys?: number, dia?: number): Level | null {
  if (!sys || !dia) return null;
  if (sys >= 140 || dia >= 90) return "high";
  if (sys >= 120 || dia >= 80) return "watch";
  return "good";
}

function factorsOf(p: Profile, bmi: number): Factor[] {
  const f: Factor[] = [];
  const add = (x: Factor) => f.push(x);

  add({
    id: "bmi",
    label: "ดัชนีมวลกาย (BMI)",
    value: bmi.toFixed(1),
    level: bmiLevel(bmi),
    note: bmi >= 25 ? "อยู่ในเกณฑ์อ้วนสำหรับคนเอเชีย" : bmi >= 23 ? "เริ่มเกินเกณฑ์ ควรคุมไม่ให้เพิ่ม" : bmi < 18.5 ? "ต่ำกว่าเกณฑ์" : "อยู่ในเกณฑ์ดี",
  });
  const bp = bpLevel(p.systolic, p.diastolic);
  if (bp)
    add({
      id: "bp",
      label: "ความดันโลหิต",
      value: `${p.systolic}/${p.diastolic}`,
      level: bp,
      note: bp === "high" ? "สูงกว่าเกณฑ์ ควรวัดซ้ำและปรึกษาแพทย์" : bp === "watch" ? "เริ่มสูง ควรลดเค็มและวัดซ้ำ" : "อยู่ในเกณฑ์ดี",
    });
  add({
    id: "sleepHours",
    label: "การนอนหลับ",
    value: `${p.sleepHours} ชม./คืน`,
    level: p.sleepHours < 6 ? "high" : p.sleepHours < 7 || p.sleepHours > 9 ? "watch" : "good",
    note: p.sleepHours < 7 ? "นอนน้อยกว่า 7 ชม. เพิ่มความเสี่ยงความดันและน้ำหนักขึ้น" : "นอนเพียงพอ",
  });
  add({
    id: "exerciseDays",
    label: "การออกกำลังกาย",
    value: `${p.exerciseDays} วัน/สัปดาห์`,
    level: p.exerciseDays <= 1 ? "high" : p.exerciseDays < 5 ? "watch" : "good",
    note: p.exerciseDays < 5 ? "ยังไม่ถึง 150 นาที/สัปดาห์ ตามคำแนะนำ WHO" : "ถึงเป้า 150 นาที/สัปดาห์",
  });
  const diet = p.sweet + p.salty + p.fatty;
  add({
    id: "sweet",
    label: "อาหารหวาน มัน เค็ม",
    value: `หวาน${FREQ_LABEL[p.sweet]} · เค็ม${FREQ_LABEL[p.salty]} · มัน${FREQ_LABEL[p.fatty]}`,
    level: diet >= 6 ? "high" : diet >= 3 ? "watch" : "good",
    note: diet >= 3 ? "กินหวาน มัน เค็มบ่อย สัมพันธ์กับเบาหวาน ความดัน และไขมันสูง" : "ควบคุมได้ดี",
  });
  add({
    id: "veggies",
    label: "ผักและผลไม้",
    value: `${p.veggies} ส่วน/วัน`,
    level: p.veggies < 2 ? "high" : p.veggies < 5 ? "watch" : "good",
    note: p.veggies < 5 ? "น้อยกว่า 5 ส่วนต่อวัน" : "ถึงเป้า 5 ส่วนต่อวัน",
  });
  add({
    id: "water",
    label: "การดื่มน้ำ",
    value: `${p.water} แก้ว/วัน`,
    level: p.water < 5 ? "high" : p.water < 8 ? "watch" : "good",
    note: p.water < 8 ? "ดื่มน้ำน้อยกว่า 8 แก้วต่อวัน" : "ดื่มน้ำเพียงพอ",
  });
  add({
    id: "stress",
    label: "ความเครียด",
    value: `${p.stress}/10`,
    level: p.stress >= 7 ? "high" : p.stress >= 5 ? "watch" : "good",
    note: p.stress >= 5 ? "ความเครียดสะสมกระทบการนอนและการกิน" : "จัดการได้ดี",
  });
  if (p.smoking !== "never")
    add({
      id: "smoking",
      label: "การสูบบุหรี่",
      value: p.smoking === "current" ? "สูบอยู่" : "เลิกแล้ว",
      level: p.smoking === "current" ? "high" : "watch",
      note: p.smoking === "current" ? "ปัจจัยเสี่ยงหลักของโรคหัวใจและหลอดเลือด" : "ดีมากที่เลิกได้ ความเสี่ยงลดลงต่อเนื่อง",
    });
  if (p.alcohol > 0)
    add({
      id: "alcohol",
      label: "เครื่องดื่มแอลกอฮอล์",
      value: `${p.alcohol} ดื่มมาตรฐาน/สัปดาห์`,
      level: p.alcohol > 14 ? "high" : p.alcohol > 7 ? "watch" : "good",
      note: p.alcohol > 7 ? "ดื่มเกินระดับที่แนะนำ เพิ่มความดันและไขมันพอกตับ" : "ดื่มในระดับต่ำ",
    });
  return f;
}

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
/** Map a linear risk index to a 3-90 score. */
const toScore = (x: number) => Math.round(clamp(sigmoid(x) * 100, 3, 90));

function conditionsOf(p: Profile, bmi: number): ConditionRisk[] {
  const age = (p.age - 40) / 10;
  const overBmi = Math.max(0, bmi - 23);
  const sys = p.systolic ?? 118 + Math.max(0, p.age - 30) * 0.4 + overBmi * 1.2 + p.salty * 2;
  const overSys = Math.max(0, sys - 120) / 10;
  const lowEx = (5 - clamp(p.exerciseDays, 0, 5)) / 5;
  const shortSleep = Math.max(0, 7 - p.sleepHours);
  const stress = Math.max(0, p.stress - 4) / 6;
  const smoke = p.smoking === "current" ? 1 : p.smoking === "former" ? 0.35 : 0;
  const drink = Math.max(0, p.alcohol - 7) / 7;
  const lowVeg = Math.max(0, 5 - p.veggies) / 5;

  const diabetes =
    -3.2 + age * 0.55 + overBmi * 0.22 + p.sweet * 0.38 + p.fatty * 0.12 + lowEx * 0.7 + shortSleep * 0.18 + stress * 0.25 + (p.family.diabetes ? 0.8 : 0);
  const hypertension =
    -3 +
    age * 0.5 +
    overBmi * 0.16 +
    p.salty * 0.4 +
    overSys * 0.55 +
    drink * 0.4 +
    lowEx * 0.45 +
    shortSleep * 0.2 +
    stress * 0.35 +
    (p.family.hypertension ? 0.7 : 0);
  const heart =
    -3.9 +
    age * 0.65 +
    (p.sex === "male" ? 0.35 : 0) +
    overSys * 0.45 +
    overBmi * 0.1 +
    p.fatty * 0.25 +
    smoke * 1.1 +
    lowEx * 0.5 +
    lowVeg * 0.3 +
    stress * 0.25 +
    drink * 0.25 +
    (p.family.heart ? 0.7 : 0);
  const obesity = -2.6 + (bmi - 23) * 0.55 + (p.sweet + p.fatty) * 0.22 + lowEx * 0.6 + shortSleep * 0.2;

  return (
    [
      ["diabetes", diabetes],
      ["hypertension", hypertension],
      ["heart", heart],
      ["obesity", obesity],
    ] as const
  ).map(([id, x]) => ({ id, label: CONDITION_LABEL[id], score: toScore(x) }));
}

export function levelOfScore(score: number): Level {
  return score >= 50 ? "high" : score >= 25 ? "watch" : "good";
}

export function analyze(p: Profile): Analysis {
  const bmi = bmiOf(p.heightCm, p.weightKg);
  const factors = factorsOf(p, bmi);
  const conditions = conditionsOf(p, bmi);
  const top = Math.max(...conditions.map((c) => c.score));
  const mean = conditions.reduce((s, c) => s + c.score, 0) / conditions.length;
  const overall = Math.round(top * 0.6 + mean * 0.4);

  const reasons: string[] = [];
  const bp = bpLevel(p.systolic, p.diastolic);
  if (bp === "high") reasons.push("ความดันโลหิตสูงกว่า 140/90");
  if (bmi >= 30) reasons.push("BMI ตั้งแต่ 30 ขึ้นไป");
  if (conditions.some((c) => c.score >= 60)) reasons.push("ผลประเมินพบปัจจัยเสี่ยงหลายข้อสะสมกัน");
  if (p.age >= 35 && (p.family.diabetes || p.family.hypertension || p.family.heart)) reasons.push("อายุ 35+ และมีประวัติครอบครัว ควรตรวจคัดกรองประจำปี");

  return {
    bmi,
    bmiLevel: bmiLevel(bmi),
    bpLevel: bp,
    factors,
    conditions,
    overall,
    overallLevel: levelOfScore(overall),
    seeDoctor: reasons.length > 0,
    seeDoctorReasons: reasons,
  };
}

export const LEVEL_LABEL: Record<Level, string> = { good: "ดี", watch: "ควรระวัง", high: "เสี่ยงสูง" };
export const OVERALL_LABEL: Record<Level, string> = { good: "เสี่ยงต่ำ", watch: "เสี่ยงปานกลาง", high: "เสี่ยงสูง" };

export const SAMPLE_PROFILE: Profile = {
  name: "มายด์",
  age: 27,
  sex: "female",
  heightCm: 160,
  weightKg: 64,
  systolic: 128,
  diastolic: 82,
  sleepHours: 5.5,
  exerciseDays: 1,
  sweet: 3,
  salty: 2,
  fatty: 2,
  veggies: 2,
  stress: 7,
  smoking: "never",
  alcohol: 4,
  water: 5,
  family: { diabetes: true, hypertension: false, heart: false },
};
