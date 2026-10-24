import { Activity, Hospital, MessageCircle, Sparkles, Target, type LucideIcon } from "lucide-react";

/** The five CARE+ features. Colour stays in the small icon square, as in PeelPlan; everything else is ink on white. */
export type FeatureKey = "chat" | "analysis" | "simulate" | "plan" | "care";

export const FEATURE: Record<FeatureKey, { title: string; body: string; href: string; icon: LucideIcon; tile: string }> = {
  chat: { title: "คุยกับ AI", body: "บอกอาการและพฤติกรรมสุขภาพของคุณได้เลย", href: "/app/chat", icon: MessageCircle, tile: "bg-sky-100" },
  analysis: { title: "AI วิเคราะห์", body: "ปัจจัยเสี่ยงและแนวโน้มสุขภาพเบื้องต้น", href: "/app/analysis", icon: Activity, tile: "bg-violet-100" },
  simulate: { title: "จำลองอนาคต", body: "ถ้าใช้ชีวิตแบบเดิม กับ ถ้าเริ่มปรับวันนี้", href: "/app/simulate", icon: Sparkles, tile: "bg-emerald-100" },
  plan: { title: "แนะนำสิ่งที่ทำได้จริง", body: "เป้าหมายเล็ก ๆ ที่ทำได้ทุกวัน", href: "/app/plan", icon: Target, tile: "bg-amber-100" },
  care: { title: "ถ้าควรพบแพทย์", body: "สถานพยาบาลใกล้คุณและสิทธิการรักษา", href: "/app/care", icon: Hospital, tile: "bg-rose-100" },
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
