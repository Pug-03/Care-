import type { Analysis, Factor, Level, Profile } from "./health";

/**
 * Action Recommendation: turns each factor that needs attention into small, checkable daily habits,
 * so "sleep more" becomes "screens off 30 minutes before 23:00".
 */

export type Area = "sleep" | "move" | "food" | "mind" | "habit" | "check";

export interface Action {
  id: string;
  area: Area;
  title: string;
  detail: string;
  /** Why this was picked for this user. */
  because: string;
  priority: Level;
}

export const AREA_LABEL: Record<Area, string> = {
  sleep: "การนอน",
  move: "กิจกรรมทางกาย",
  food: "อาหาร",
  mind: "ความเครียด",
  habit: "พฤติกรรมเสี่ยง",
  check: "ติดตามสุขภาพ",
};

type Builder = (f: Factor, p: Profile) => Omit<Action, "because" | "priority">[];

const BUILDERS: Partial<Record<Factor["id"], Builder>> = {
  sleepHours: (_, p) => [
    { id: "sleep-time", area: "sleep", title: `เข้านอนก่อน ${p.sleepHours < 6 ? "23:00" : "23:30"}`, detail: "ตั้งเวลาเข้านอนเดิมทุกวัน รวมวันหยุด" },
    { id: "sleep-screen", area: "sleep", title: "วางมือถือ 30 นาทีก่อนนอน", detail: "แสงจอกดการหลั่งเมลาโทนิน ทำให้หลับยาก" },
  ],
  exerciseDays: (_, p) => [
    {
      id: "move-walk",
      area: "move",
      title: p.exerciseDays <= 1 ? "เดินเร็ว 15 นาทีหลังอาหาร" : "เดินเร็วหรือปั่นจักรยาน 30 นาที",
      detail: "เริ่มจากน้อยแล้วค่อยเพิ่ม เป้าหมายคือ 150 นาทีต่อสัปดาห์",
    },
    { id: "move-stairs", area: "move", title: "ใช้บันไดแทนลิฟต์ 2–3 ชั้น", detail: "แทรกการขยับในชีวิตประจำวันโดยไม่ต้องหาเวลาเพิ่ม" },
  ],
  sweet: (_, p) => [
    ...(p.sweet >= 2
      ? [{ id: "food-sweet", area: "food" as const, title: "สั่งหวานน้อย หรือเปลี่ยนเป็นน้ำเปล่า", detail: "ชานมไข่มุก 1 แก้วมีน้ำตาลราว 8–12 ช้อนชา" }]
      : []),
    ...(p.salty >= 2
      ? [{ id: "food-salty", area: "food" as const, title: "ชิมก่อนปรุง ไม่เติมน้ำปลา/ซอสเพิ่ม", detail: "ลดโซเดียมช่วยลดความดันได้ภายในไม่กี่สัปดาห์" }]
      : []),
    ...(p.fatty >= 2 ? [{ id: "food-fatty", area: "food" as const, title: "เลือกต้ม นึ่ง ย่าง แทนทอด", detail: "ลดของทอดและกะทิอย่างน้อยวันละ 1 มื้อ" }] : []),
  ],
  veggies: () => [{ id: "food-veg", area: "food", title: "ผักครึ่งจานทุกมื้อหลัก", detail: "เพิ่มใยอาหาร ช่วยคุมน้ำตาลและอิ่มนานขึ้น" }],
  water: () => [{ id: "water", area: "food", title: "ดื่มน้ำ 8 แก้วต่อวัน", detail: "พกขวดน้ำติดตัว ดื่มหนึ่งแก้วหลังตื่นนอน" }],
  stress: () => [
    { id: "mind-breathe", area: "mind", title: "หายใจช้า 4-7-8 วันละ 5 นาที", detail: "ช่วยลดความเครียดและทำให้หลับง่ายขึ้น" },
    { id: "mind-break", area: "mind", title: "พักสายตาและยืดตัวทุก 1 ชั่วโมง", detail: "ตัดวงจรความเครียดระหว่างเรียนหรือทำงาน" },
  ],
  smoking: (f) => (f.level === "high" ? [{ id: "habit-smoke", area: "habit", title: "ลดบุหรี่ลงวันละ 1 มวน", detail: "ปรึกษาสายเลิกบุหรี่ 1600 ฟรี" }] : []),
  alcohol: () => [{ id: "habit-alcohol", area: "habit", title: "งดดื่มอย่างน้อย 3 วันต่อสัปดาห์", detail: "ลดความดันและภาระของตับ" }],
  bmi: (f) =>
    f.level === "high" || f.level === "watch"
      ? [{ id: "check-weight", area: "check", title: "ชั่งน้ำหนักสัปดาห์ละครั้ง", detail: "เวลาเดิม หลังตื่นนอน เพื่อดูแนวโน้ม" }]
      : [],
  bp: (f) =>
    f.level !== "good" ? [{ id: "check-bp", area: "check", title: "วัดความดันเช้า–เย็น 7 วัน", detail: "นั่งพัก 5 นาทีก่อนวัด แล้วบันทึกค่าเฉลี่ย" }] : [],
};

const RANK: Record<Level, number> = { high: 0, watch: 1, good: 2 };

export function buildPlan(p: Profile, a: Analysis): Action[] {
  const out: Action[] = [];
  const seen = new Set<string>();
  const factors = [...a.factors].sort((x, y) => RANK[x.level] - RANK[y.level]);
  for (const f of factors) {
    if (f.level === "good") continue;
    const build = BUILDERS[f.id];
    if (!build) continue;
    for (const act of build(f, p)) {
      if (seen.has(act.id)) continue;
      seen.add(act.id);
      out.push({ ...act, because: `${f.label}: ${f.value}`, priority: f.level });
    }
  }
  if (out.length === 0)
    out.push({
      id: "keep",
      area: "check",
      title: "รักษาพฤติกรรมที่ดีไว้ และตรวจสุขภาพประจำปี",
      detail: "ทุกปัจจัยอยู่ในเกณฑ์ดี บันทึกข้อมูลใหม่ทุกเดือนเพื่อติดตาม",
      because: "ปัจจัยทั้งหมดอยู่ในเกณฑ์ดี",
      priority: "good",
    });
  return out;
}

export const DAILY_TIPS = [
  "ดื่มน้ำหนึ่งแก้วทันทีหลังตื่นนอน ช่วยให้ร่างกายสดชื่นขึ้น",
  "เดินหลังอาหาร 10–15 นาที ช่วยลดระดับน้ำตาลหลังมื้อ",
  "แสงแดดตอนเช้า 10 นาที ช่วยปรับนาฬิกาชีวิตให้หลับง่ายขึ้นตอนกลางคืน",
  "สั่งเครื่องดื่ม 'หวานน้อย' ลดน้ำตาลได้เกือบครึ่ง",
  "ผักครึ่งจาน โปรตีนหนึ่งในสี่ ข้าวหนึ่งในสี่ คือสูตรจานสุขภาพ",
  "ลุกขึ้นยืดเส้นทุกชั่วโมง ลดอาการปวดหลังและความเครียด",
  "หายใจเข้า 4 วินาที กลั้น 7 ออก 8 ทำ 4 รอบเมื่อรู้สึกเครียด",
];

export function tipOfDay(date = new Date()) {
  const day = Math.floor(date.getTime() / 86_400_000);
  return DAILY_TIPS[day % DAILY_TIPS.length];
}
