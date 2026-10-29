import { dateKey, idleDaysOf, MISSION_BY_ID, streakOf } from "./missions";

/**
 * Virtual Pet: a cat the user looks after with XP earned from Health Missions.
 * Stats wear down with time and are recomputed from the last saved timestamp, so nothing runs in the background.
 */

export type Stat = "full" | "joy" | "energy";

export interface PetState {
  full: number;
  joy: number;
  energy: number;
  /** When the stats above were last brought up to date (ISO). */
  at: string;
  /** Last time the cat was patted for free (ISO). */
  pattedAt: string | null;
}

export const STAT_LABEL: Record<Stat, string> = { full: "อิ่มท้อง", joy: "ความสุข", energy: "พลังงาน" };

/** Points lost per hour. A full cat gets hungry in about a day and a half. */
const DECAY: Record<Stat, number> = { full: 3, joy: 2, energy: 1.5 };

const clamp = (v: number) => Math.round(Math.min(100, Math.max(0, v)));

export function newPet(now = new Date()): PetState {
  return { full: 70, joy: 70, energy: 70, at: now.toISOString(), pattedAt: null };
}

/** The pet as it is at `now`, after time has worn the stats down. */
export function petAt(pet: PetState, now = new Date()): PetState {
  const hours = Math.max(0, (now.getTime() - new Date(pet.at).getTime()) / 3_600_000);
  return {
    ...pet,
    full: clamp(pet.full - DECAY.full * hours),
    joy: clamp(pet.joy - DECAY.joy * hours),
    energy: clamp(pet.energy - DECAY.energy * hours),
    at: now.toISOString(),
  };
}

export type ItemKind = "food" | "toy" | "rest";

export interface Item {
  id: string;
  kind: ItemKind;
  name: string;
  detail: string;
  cost: number;
  effect: Partial<Record<Stat, number>>;
}

export const ITEMS: Item[] = [
  { id: "kibble", kind: "food", name: "อาหารเม็ดสูตรสุขภาพ", detail: "มื้อเบา ๆ ประจำวัน", cost: 10, effect: { full: 20 } },
  { id: "fish", kind: "food", name: "ปลานึ่ง", detail: "มื้อใหญ่ อิ่มนาน", cost: 20, effect: { full: 40, joy: 5 } },
  { id: "water", kind: "food", name: "น้ำสะอาดชามใหม่", detail: "สดชื่นขึ้นนิดหน่อย", cost: 5, effect: { full: 5, energy: 5 } },
  { id: "yarn", kind: "toy", name: "ลูกไหมพรม", detail: "เล่นแล้วสนุก แต่เหนื่อยนิดหน่อย", cost: 20, effect: { joy: 30, energy: -10 } },
  { id: "feather", kind: "toy", name: "ไม้ตกแมว", detail: "ของเล่นสุดโปรด", cost: 30, effect: { joy: 45, energy: -15 } },
  { id: "cushion", kind: "rest", name: "เบาะเมฆนุ่ม", detail: "งีบสั้น ๆ เติมพลัง", cost: 25, effect: { energy: 40 } },
  { id: "blanket", kind: "rest", name: "ผ้าห่มอุ่น", detail: "นอนยาวสบาย ๆ", cost: 35, effect: { energy: 60, joy: 5 } },
];

export const KIND_LABEL: Record<ItemKind, string> = { food: "อาหาร", toy: "ของเล่น", rest: "พักผ่อน" };

export function giveItem(pet: PetState, item: Item, now = new Date()): PetState {
  const p = petAt(pet, now);
  return {
    ...p,
    full: clamp(p.full + (item.effect.full ?? 0)),
    joy: clamp(p.joy + (item.effect.joy ?? 0)),
    energy: clamp(p.energy + (item.effect.energy ?? 0)),
  };
}

/** Free pat: a little joy, once an hour. */
export const PAT_EVERY_MS = 3_600_000;

export function canPat(pet: PetState, now = new Date()) {
  return !pet.pattedAt || now.getTime() - new Date(pet.pattedAt).getTime() >= PAT_EVERY_MS;
}

export function pat(pet: PetState, now = new Date()): PetState {
  const p = petAt(pet, now);
  return { ...p, joy: clamp(p.joy + 5), pattedAt: now.toISOString() };
}

/** The four cat characters. Which one shows depends on how the user is looking after themselves. */
export type Form = "sprout" | "cloud" | "cozy" | "glow";

export const FORMS: Record<Form, { name: string; nick: string; quote: string; traits: string[]; when: string }> = {
  sprout: {
    name: "Sprout Cat",
    nick: "น้องใบอ่อน",
    quote: "ทุกการเริ่มต้นเล็ก ๆ กำลังสร้างอนาคตที่ดีให้เธอ",
    traits: ["กระตือรือร้น", "ชอบเรียนรู้", "เป็นแรงบันดาลใจ"],
    when: "ช่วงเริ่มต้น ทำภารกิจไปเรื่อย ๆ",
  },
  cloud: {
    name: "Cloud Cat",
    nick: "น้องเมฆ",
    quote: "ร่างกายกำลังส่งสัญญาณเบา ๆ ถึงเวลาใส่ใจตัวเองอีกนิดแล้วนะ",
    traits: ["อ่อนโยน", "ชอบพักผ่อน", "เตือนให้ดูแลตัวเอง"],
    when: "น้องหิว เหนื่อย หรือคุณไม่ได้ทำภารกิจมาหลายวัน",
  },
  cozy: {
    name: "Cozy Cat",
    nick: "น้องโคซี่",
    quote: "พักให้พอ ขยับอีกนิด แล้วค่อย ๆ เติมพลังให้ตัวเอง",
    traits: ["สบาย ๆ", "ชอบความอบอุ่น", "ดูแลตัวเองเก่ง"],
    when: "วันนี้คุณทำภารกิจด้านการนอนหรือความเครียด",
  },
  glow: {
    name: "Glow Cat",
    nick: "น้องโกลว์",
    quote: "ความสม่ำเสมอของเธอกำลังเปล่งประกายเป็นสุขภาพที่ดี",
    traits: ["สดใส", "มีพลังบวก", "ชอบดูแลตัวเอง"],
    when: "ทำภารกิจต่อเนื่อง 3 วันขึ้นไป และน้องอารมณ์ดี",
  },
};

export interface FormInput {
  pet: PetState;
  streak: number;
  /** Areas of the missions finished today. */
  areasToday: string[];
  /** Days since the last finished mission; null if the user has never finished one. */
  idleDays: number | null;
}

export function formOf({ pet, streak, areasToday, idleDays }: FormInput): Form {
  const low = Math.min(pet.full, pet.joy, pet.energy);
  const avg = (pet.full + pet.joy + pet.energy) / 3;
  if (low < 25 || (idleDays !== null && idleDays >= 2)) return "cloud";
  if (streak >= 3 && avg >= 60) return "glow";
  if (areasToday.includes("sleep") || areasToday.includes("mind")) return "cozy";
  return "sprout";
}

export type Mood = "happy" | "smile" | "sleep" | "confused";

export function moodOf(pet: PetState): { mood: Mood; text: string } {
  if (pet.energy < 30) return { mood: "sleep", text: "ง่วงจัง อยากนอนบนเบาะนุ่ม ๆ" };
  if (pet.full < 30) return { mood: "confused", text: "หิวแล้ว มีอะไรกินบ้างนะ" };
  if (pet.joy < 30) return { mood: "confused", text: "เหงาจัง มาเล่นด้วยกันหน่อย" };
  if ((pet.full + pet.joy + pet.energy) / 3 >= 70) return { mood: "happy", text: "มีความสุขมาก ขอบคุณที่ดูแลกันนะ" };
  return { mood: "smile", text: "สบายดี วันนี้ไปทำภารกิจกันเถอะ" };
}

/** The cat as it is right now: stats after decay, its character from the user's mission history, and its mood. */
export function catNow(saved: PetState, done: Record<string, string[]>, now = new Date()) {
  const pet = petAt(saved, now);
  const areasToday = (done[dateKey(now)] ?? []).map((id) => MISSION_BY_ID[id]?.area).filter((a): a is NonNullable<typeof a> => !!a);
  const form = formOf({ pet, streak: streakOf(done, now), areasToday, idleDays: idleDaysOf(done, now) });
  return { pet, form, ...moodOf(pet) };
}
