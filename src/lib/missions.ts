import type { Analysis, Factor, Level, Profile } from "./health";

/**
 * Health Missions: small, checkable daily habits. The quiz recommends the ones that match the user's risk factors,
 * Health Choice lets them pick more, and each finished mission pays XP for the virtual pet.
 */

export type Area = "sleep" | "move" | "food" | "mind" | "habit" | "check";

export interface Mission {
  id: string;
  area: Area;
  title: string;
  detail: string;
  xp: number;
  /** Quiz factors this mission works on; it is recommended when one of them needs attention. */
  factors: Factor["id"][];
  /** Extra condition for recommending it, beyond the factor level. */
  when?: (p: Profile) => boolean;
}

export const AREA_LABEL: Record<Area, string> = {
  sleep: "การนอน",
  move: "กิจกรรมทางกาย",
  food: "อาหารและน้ำ",
  mind: "ความเครียด",
  habit: "พฤติกรรมเสี่ยง",
  check: "ติดตามสุขภาพ",
};

export const MISSIONS: Mission[] = [
  { id: "sleep-time", area: "sleep", title: "เข้านอนก่อน 23:00", detail: "ตั้งเวลาเข้านอนเดิมทุกวัน รวมวันหยุด", xp: 20, factors: ["sleepHours"] },
  { id: "sleep-screen", area: "sleep", title: "วางมือถือ 30 นาทีก่อนนอน", detail: "การใช้จอก่อนนอนอาจทำให้หลับยากขึ้น ลองอ่านหนังสือหรือยืดเส้นแทน", xp: 15, factors: ["sleepHours"] },
  { id: "move-walk", area: "move", title: "เดินเร็ว 15 นาที", detail: "เดินหลังอาหารก็ได้ สะสมให้ถึง 150 นาทีต่อสัปดาห์", xp: 20, factors: ["exerciseDays", "bmi"] },
  { id: "move-stairs", area: "move", title: "ใช้บันไดแทนลิฟต์ 2–3 ชั้น", detail: "แทรกการขยับในชีวิตประจำวันโดยไม่ต้องหาเวลาเพิ่ม", xp: 10, factors: ["exerciseDays"] },
  { id: "food-sweet", area: "food", title: "สั่งหวานน้อย หรือเปลี่ยนเป็นน้ำเปล่า", detail: "ลดน้ำตาลจากเครื่องดื่มได้ทันทีในแก้วเดียว", xp: 15, factors: ["sweet"], when: (p) => p.sweet >= 1 },
  { id: "food-salty", area: "food", title: "ชิมก่อนปรุง ไม่เติมน้ำปลาหรือซอสเพิ่ม", detail: "ซดน้ำซุปให้น้อยลง ลดโซเดียมได้อีก", xp: 15, factors: ["sweet", "bp"], when: (p) => p.salty >= 2 },
  { id: "food-fatty", area: "food", title: "เลือกต้ม นึ่ง ย่าง แทนทอด 1 มื้อ", detail: "ลดของทอดและกะทิอย่างน้อยวันละ 1 มื้อ", xp: 15, factors: ["sweet", "bmi"], when: (p) => p.fatty >= 2 },
  { id: "food-veg", area: "food", title: "ผักครึ่งจานในมื้อหลัก", detail: "เพิ่มใยอาหาร ช่วยให้อิ่มนานขึ้น", xp: 20, factors: ["veggies"] },
  { id: "water", area: "food", title: "ดื่มน้ำเปล่า 8 แก้ว", detail: "พกขวดน้ำติดตัว ดื่มหนึ่งแก้วหลังตื่นนอน", xp: 15, factors: ["water"] },
  { id: "mind-breathe", area: "mind", title: "หายใจช้า ๆ 5 นาที", detail: "หายใจเข้า 4 วินาที กลั้น 7 ออก 8 ทำ 4 รอบ", xp: 10, factors: ["stress"] },
  { id: "mind-break", area: "mind", title: "พักสายตาและยืดตัวทุก 1 ชั่วโมง", detail: "ตัดวงจรความเครียดระหว่างเรียนหรือทำงาน", xp: 10, factors: ["stress"] },
  { id: "habit-smoke", area: "habit", title: "ลดบุหรี่ลงวันละ 1 มวน", detail: "ปรึกษาสายเลิกบุหรี่ 1600 ได้ฟรี", xp: 30, factors: ["smoking"], when: (p) => p.smoking === "current" },
  { id: "habit-alcohol", area: "habit", title: "วันนี้งดเครื่องดื่มแอลกอฮอล์", detail: "ตั้งเป้างดอย่างน้อย 3 วันต่อสัปดาห์", xp: 20, factors: ["alcohol"] },
  { id: "check-weight", area: "check", title: "ชั่งน้ำหนักและจดไว้", detail: "ชั่งเวลาเดิม หลังตื่นนอน เพื่อดูแนวโน้ม", xp: 10, factors: ["bmi"] },
  { id: "check-bp", area: "check", title: "วัดความดันเช้าและเย็น", detail: "นั่งพัก 5 นาทีก่อนวัด แล้วจดค่าไว้", xp: 15, factors: ["bp"] },
];

export const MISSION_BY_ID: Record<string, Mission> = Object.fromEntries(MISSIONS.map((m) => [m.id, m]));

/** Missions everyone can keep doing when the quiz finds nothing to work on. */
const MAINTAIN = ["move-walk", "food-veg", "water"];

export interface Recommended {
  mission: Mission;
  /** The quiz finding that led to it. */
  because: string;
  priority: Level;
}

const RANK: Record<Level, number> = { high: 0, watch: 1, good: 2 };

/** Most missions recommended per day; the rest stay in the "add more" list so a day stays doable. */
export const MAX_RECOMMENDED = 6;

/** Turns the quiz result into missions, most urgent factor first. */
export function recommendMissions(p: Profile, a: Analysis): Recommended[] {
  const out: Recommended[] = [];
  const seen = new Set<string>();
  const factors = [...a.factors].sort((x, y) => RANK[x.level] - RANK[y.level]);
  for (const f of factors) {
    if (f.level === "good") continue;
    for (const m of MISSIONS) {
      if (seen.has(m.id) || !m.factors.includes(f.id) || (m.when && !m.when(p))) continue;
      seen.add(m.id);
      out.push({ mission: m, because: `${f.label}: ${f.value}`, priority: f.level });
    }
  }
  if (out.length > MAX_RECOMMENDED) out.length = MAX_RECOMMENDED;
  if (out.length === 0)
    for (const id of MAINTAIN) out.push({ mission: MISSION_BY_ID[id], because: "รักษาพฤติกรรมที่ดีไว้", priority: "good" });
  return out;
}

/** Today's list: recommended missions, then the ones the user picked themselves. */
export function dailyMissions(p: Profile | null, a: Analysis | null, picked: string[]): Recommended[] {
  const rec = p && a ? recommendMissions(p, a) : [];
  const ids = new Set(rec.map((r) => r.mission.id));
  const extra = picked
    .filter((id) => MISSION_BY_ID[id] && !ids.has(id))
    .map((id) => ({ mission: MISSION_BY_ID[id], because: "คุณเลือกเอง", priority: "good" as Level }));
  return [...rec, ...extra];
}

/** XP needed per level. Level is shown from lifetime XP, so spending on the cat never lowers it. */
export const XP_PER_LEVEL = 100;

export function levelOf(totalXp: number) {
  return { level: Math.floor(totalXp / XP_PER_LEVEL) + 1, into: totalXp % XP_PER_LEVEL };
}

export function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Days in a row with at least one finished mission, ending today (or yesterday, if today has none yet). */
export function streakOf(done: Record<string, string[]>, today = new Date()) {
  const d = new Date(today);
  if (!done[dateKey(d)]?.length) d.setDate(d.getDate() - 1);
  let n = 0;
  while (done[dateKey(d)]?.length) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** Whole days since the most recent day with a finished mission, or null if there is none. */
export function idleDaysOf(done: Record<string, string[]>, now = new Date()) {
  const last = Object.keys(done)
    .filter((k) => done[k].length > 0)
    .sort()
    .at(-1);
  if (!last) return null;
  const [y, m, d] = last.split("-").map(Number);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today.getTime() - new Date(y, m - 1, d).getTime()) / 86_400_000);
}

export const DAILY_TIPS = [
  "ดื่มน้ำหนึ่งแก้วทันทีหลังตื่นนอน ช่วยให้ร่างกายสดชื่นขึ้น",
  "เดินหลังอาหาร 10–15 นาที เป็นวิธีง่าย ๆ ในการเพิ่มกิจกรรมทางกาย",
  "รับแสงแดดตอนเช้า ช่วยปรับนาฬิกาชีวิต",
  "สั่งเครื่องดื่ม 'หวานน้อย' ลดน้ำตาลได้ทันที",
  "ผักครึ่งจาน โปรตีนหนึ่งในสี่ ข้าวหนึ่งในสี่ คือสูตรจานสุขภาพ",
  "ลุกขึ้นขยับทุกชั่วโมง ลดการนั่งนาน ๆ",
  "รู้สึกเครียด ลองหยุดพักแล้วหายใจช้า ๆ สักครู่",
];

export function tipOfDay(date = new Date()) {
  // Local calendar day, so the tip changes at local midnight.
  const day = Math.round(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86_400_000);
  return DAILY_TIPS[day % DAILY_TIPS.length];
}
