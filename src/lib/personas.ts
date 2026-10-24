import { SAMPLE_PROFILE, type Behavior, type Profile } from "./health";

/** Synthetic example people for the landing demo. Labelled as examples wherever they appear. */
export interface Persona {
  id: string;
  label: string;
  line: string;
  profile: Profile;
}

export const PERSONAS: Persona[] = [
  { id: "student", label: "นักศึกษา 27", line: "นอนดึก ชานมทุกวัน แทบไม่ออกกำลังกาย", profile: SAMPLE_PROFILE },
  {
    id: "office",
    label: "พนักงานออฟฟิศ 35",
    line: "นั่งทั้งวัน กินเค็ม เครียดงาน ดื่มสุดสัปดาห์",
    profile: {
      ...SAMPLE_PROFILE,
      name: "ต้น",
      age: 35,
      sex: "male",
      heightCm: 172,
      weightKg: 79,
      systolic: 134,
      diastolic: 86,
      sleepHours: 6,
      exerciseDays: 1,
      sweet: 2,
      salty: 3,
      fatty: 2,
      veggies: 2,
      stress: 8,
      alcohol: 10,
      water: 5,
      family: { diabetes: false, hypertension: true, heart: false },
    },
  },
  {
    id: "parent",
    label: "คุณพ่อ 52",
    line: "สูบบุหรี่ ความดันเริ่มสูง เดินบ้างบางวัน",
    profile: {
      ...SAMPLE_PROFILE,
      name: "สมชาย",
      age: 52,
      sex: "male",
      heightCm: 168,
      weightKg: 76,
      systolic: 142,
      diastolic: 90,
      sleepHours: 6.5,
      exerciseDays: 2,
      sweet: 1,
      salty: 2,
      fatty: 2,
      veggies: 3,
      stress: 5,
      smoking: "current",
      alcohol: 6,
      water: 6,
      family: { diabetes: true, hypertension: true, heart: true },
    },
  },
];

/** Habit switches on the landing demo, each a realistic step toward the guideline. */
export const LEVERS: { id: string; label: string; apply: (p: Profile) => Partial<Behavior> }[] = [
  { id: "sleep", label: "นอน 7 ชั่วโมง", apply: (p) => ({ sleepHours: Math.max(p.sleepHours, 7) }) },
  { id: "move", label: "เดินเร็ว 30 นาที 5 วัน", apply: (p) => ({ exerciseDays: Math.max(p.exerciseDays, 5) }) },
  {
    id: "food",
    label: "ลดหวาน มัน เค็ม",
    apply: (p) => ({
      sweet: Math.min(p.sweet, 1) as Behavior["sweet"],
      salty: Math.min(p.salty, 1) as Behavior["salty"],
      fatty: Math.min(p.fatty, 1) as Behavior["fatty"],
    }),
  },
  { id: "veg", label: "ผักผลไม้ 5 ส่วน", apply: (p) => ({ veggies: Math.max(p.veggies, 5) }) },
  {
    id: "habit",
    label: "ลดเหล้า เลิกบุหรี่",
    apply: (p) => ({ alcohol: Math.min(p.alcohol, 3), smoking: p.smoking === "current" ? "former" : p.smoking }),
  },
];
