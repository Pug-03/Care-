import type { ReactNode } from "react";
import type { Level } from "@/lib/health";
import { RobotSays } from "./Logo";
import { FEATURE, type FeatureKey } from "./theme";

export const LEVEL_TONE: Record<Level, { text: string; bg: string; stroke: string }> = {
  good: { text: "text-good", bg: "bg-good-soft", stroke: "var(--good)" },
  watch: { text: "text-watch", bg: "bg-watch-soft", stroke: "var(--watch)" },
  high: { text: "text-high", bg: "bg-high-soft", stroke: "var(--high)" },
};

export function Badge({ level, children }: { level: Level; children: ReactNode }) {
  const t = LEVEL_TONE[level];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${t.bg} ${t.text}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-card border border-hairline bg-bg p-5 shadow-soft ${className}`}>{children}</section>;
}

export function PageHead({ title, sub, eyebrow, feature, says }: { title: string; sub?: string; eyebrow?: string; feature?: FeatureKey; says?: ReactNode }) {
  const f = feature ? FEATURE[feature] : null;
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        {f && (
          <span className={`grid size-14 shrink-0 place-items-center rounded-2xl text-white shadow-soft ${f.solid}`}>
            <f.icon className="size-7" />
          </span>
        )}
        <div>
          {eyebrow && <p className={`mb-0.5 text-sm font-medium ${f ? f.text : "text-accent-text"}`}>{eyebrow}</p>}
          <h1 className="text-2xl font-bold tracking-tight text-[#123a73] sm:text-3xl">{title}</h1>
          {sub && <p className="mt-1 max-w-2xl text-muted">{sub}</p>}
        </div>
      </div>
      {says && <RobotSays className="hidden shrink-0 md:flex">{says}</RobotSays>}
    </header>
  );
}

/** Circular score gauge, 0-100. */
export function Ring({ value, level, size = 88, label }: { value: number; level: Level; size?: number; label?: string }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label ?? "คะแนน"} ${value} จาก 100`}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={LEVEL_TONE[level].stroke}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          style={{ "--c": c } as React.CSSProperties}
          className="ring-in transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className={`absolute inset-0 grid place-items-center text-xl font-semibold tabular-nums ${LEVEL_TONE[level].text}`}>{value}%</span>
    </div>
  );
}

export function Bar({ value, level }: { value: number; level: Level }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
      <div className="grow-x h-full rounded-full transition-[width] duration-700" style={{ width: `${value}%`, background: LEVEL_TONE[level].stroke }} />
    </div>
  );
}

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-muted ${className}`}>
      CARE+ เป็นเครื่องมือประเมินปัจจัยเสี่ยงเบื้องต้นเพื่อส่งเสริมการปรับพฤติกรรม ไม่ใช่การวินิจฉัยโรคและไม่สามารถใช้แทนแพทย์ได้
      หากมีอาการผิดปกติควรปรึกษาบุคลากรทางการแพทย์ กรณีฉุกเฉินโทร 1669
    </p>
  );
}

export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-[0_6px_16px_rgb(43_124_243/0.3)] transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full border border-blue-200 bg-bg px-5 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50 active:scale-[0.98]",
};
