import { Activity, Hospital, MessageCircle, Sparkles, Target, type LucideIcon } from "lucide-react";

/** Each CARE+ feature has its own colour, as in the prototype screens. Class strings are literal so Tailwind sees them. */
export type FeatureKey = "chat" | "analysis" | "simulate" | "plan" | "care";

export const FEATURE: Record<
  FeatureKey,
  { title: string; body: string; href: string; icon: LucideIcon; solid: string; soft: string; border: string; text: string }
> = {
  chat: {
    title: "คุยกับ AI",
    body: "บอกอาการและพฤติกรรมสุขภาพของคุณได้เลย",
    href: "/app/chat",
    icon: MessageCircle,
    solid: "bg-gradient-to-br from-sky-400 to-blue-600",
    soft: "bg-gradient-to-br from-sky-50 to-blue-100/70",
    border: "border-blue-200/70",
    text: "text-blue-600",
  },
  analysis: {
    title: "AI วิเคราะห์",
    body: "ดูปัจจัยเสี่ยงและแนวโน้มสุขภาพเบื้องต้น",
    href: "/app/analysis",
    icon: Activity,
    solid: "bg-gradient-to-br from-violet-400 to-purple-600",
    soft: "bg-gradient-to-br from-violet-50 to-purple-100/70",
    border: "border-violet-200/70",
    text: "text-violet-600",
  },
  simulate: {
    title: "จำลองอนาคต",
    body: "เปรียบเทียบ “ถ้าใช้ชีวิตแบบเดิม” กับ “ถ้าปรับพฤติกรรม”",
    href: "/app/simulate",
    icon: Sparkles,
    solid: "bg-gradient-to-br from-emerald-400 to-teal-600",
    soft: "bg-gradient-to-br from-emerald-50 to-teal-100/60",
    border: "border-emerald-200/70",
    text: "text-emerald-600",
  },
  plan: {
    title: "แนะนำสิ่งที่ทำได้จริง",
    body: "ช่วยวางแผนปรับพฤติกรรม",
    href: "/app/plan",
    icon: Target,
    solid: "bg-gradient-to-br from-amber-400 to-orange-500",
    soft: "bg-gradient-to-br from-orange-50 to-amber-100/70",
    border: "border-orange-200/70",
    text: "text-orange-600",
  },
  care: {
    title: "ถ้าควรพบแพทย์",
    body: "ช่วยค้นหาสถานพยาบาลและตรวจสอบสิทธิการรักษา",
    href: "/app/care",
    icon: Hospital,
    solid: "bg-gradient-to-br from-rose-400 to-pink-600",
    soft: "bg-gradient-to-br from-rose-50 to-pink-100/70",
    border: "border-rose-200/70",
    text: "text-rose-600",
  },
};

/** Health metric colours on the home overview: stress green, sleep blue, BP pink, BMI orange. */
export const METRIC = {
  stress: { solid: "bg-emerald-500", soft: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500" },
  sleep: { solid: "bg-blue-500", soft: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-500" },
  bp: { solid: "bg-rose-500", soft: "bg-rose-50", text: "text-rose-700", bar: "bg-rose-500" },
  bmi: { solid: "bg-orange-500", soft: "bg-orange-50", text: "text-orange-700", bar: "bg-orange-400" },
};
