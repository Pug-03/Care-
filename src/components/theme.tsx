import { Cat, ClipboardCheck, Scale, Target, type LucideIcon } from "lucide-react";

/** The four CARE+ components, in the order the user goes through them. Colour stays in the small icon square, as in PeelPlan; everything else is ink on white. */
export type FeatureKey = "quiz" | "choice" | "missions" | "pet";

export const FEATURE: Record<FeatureKey, { title: string; en: string; body: string; href: string; icon: LucideIcon; tile: string }> = {
  quiz: {
    title: "แบบประเมินความเสี่ยง",
    en: "Health Risk Quiz",
    body: "ตอบคำถามพฤติกรรมสุขภาพ แล้วดูปัจจัยเสี่ยงเบื้องต้นของตัวเอง",
    href: "/app/quiz",
    icon: ClipboardCheck,
    tile: "bg-violet-100",
  },
  choice: {
    title: "เปรียบเทียบทางเลือก",
    en: "Health Choice",
    body: "เทียบทางเลือกในการใช้ชีวิต ด้วยข้อมูลที่มีแหล่งอ้างอิง",
    href: "/app/choice",
    icon: Scale,
    tile: "bg-emerald-100",
  },
  missions: {
    title: "ภารกิจสุขภาพ",
    en: "Health Missions",
    body: "ภารกิจเล็ก ๆ ประจำวัน ทำสำเร็จแล้วได้ XP",
    href: "/app/missions",
    icon: Target,
    tile: "bg-amber-100",
  },
  pet: {
    title: "น้องแมว",
    en: "Virtual Pet",
    body: "ใช้ XP แลกอาหารและไอเทม ดูแลแมวของคุณ",
    href: "/app/pet",
    icon: Cat,
    tile: "bg-sky-100",
  },
};

export function Tile({ feature, size = "md" }: { feature: FeatureKey; size?: "sm" | "md" | "lg" }) {
  const f = FEATURE[feature];
  const box = size === "lg" ? "size-14 rounded-2xl" : size === "sm" ? "size-9 rounded-xl" : "size-11 rounded-xl";
  const icon = size === "lg" ? "size-6" : size === "sm" ? "size-4" : "size-5";
  return (
    <span className={`grid shrink-0 place-items-center text-ink ${box} ${f.tile}`}>
      <f.icon className={icon} strokeWidth={1.8} />
    </span>
  );
}
