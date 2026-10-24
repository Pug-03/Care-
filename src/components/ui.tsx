import type { CSSProperties, ReactNode } from "react";
import type { Level } from "@/lib/health";
import { RobotSays } from "./Logo";
import { Tile, type FeatureKey } from "./theme";

export const LEVEL_TONE: Record<Level, { text: string; bg: string; stroke: string }> = {
  good: { text: "text-good", bg: "bg-good-soft", stroke: "var(--good)" },
  watch: { text: "text-watch", bg: "bg-watch-soft", stroke: "var(--watch)" },
  high: { text: "text-high", bg: "bg-high-soft", stroke: "var(--high)" },
};

export function Badge({ level, children }: { level: Level; children: ReactNode }) {
  const t = LEVEL_TONE[level];
  return <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${t.bg} ${t.text}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-card border border-hairline bg-bg p-5 sm:p-6 ${className}`}>{children}</section>;
}

/** Screen title: big ink headline, grey line under it, the feature's tile, and the robot chiming in. */
export function PageHead({ title, sub, feature, says }: { title: string; sub?: string; feature?: FeatureKey; says?: ReactNode }) {
  return (
    <header className="mb-8 flex items-end justify-between gap-6">
      <div className="flex items-start gap-4">
        {feature && <Tile feature={feature} size="lg" />}
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {sub && <p className="mt-2 max-w-2xl text-muted">{sub}</p>}
        </div>
      </div>
      {says && <RobotSays className="hidden shrink-0 md:flex">{says}</RobotSays>}
    </header>
  );
}

/** Circular score gauge, 0-100, filling from empty on mount. */
export function Ring({ value, level, size = 88, label }: { value: number; level: Level; size?: number; label?: string }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label ?? "คะแนน"} ${value} จาก 100`}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={LEVEL_TONE[level].stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          style={{ "--c": c } as CSSProperties}
          className="ring-in transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className={`absolute inset-0 grid place-items-center text-xl font-bold tabular-nums ${LEVEL_TONE[level].text}`}>{value}%</span>
    </div>
  );
}

export function Bar({ value, level }: { value: number; level: Level }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
      <div className="grow-x h-full rounded-full" style={{ width: `${value}%`, background: LEVEL_TONE[level].stroke }} />
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
  primary: "pill px-5 py-2.5 text-sm",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-ink bg-bg px-5 py-2.5 text-sm font-semibold transition hover:bg-ink hover:text-white active:scale-[0.98]",
  quiet: "inline-flex items-center justify-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-medium transition hover:bg-surface-2",
};

/** Chip in PeelPlan's segmented style: outlined, ink-filled when on. */
export function chip(on: boolean) {
  return `rounded-full border px-4 py-2 text-sm transition ${on ? "border-ink bg-ink font-medium text-white" : "border-hairline bg-bg hover:border-ink/40"}`;
}
