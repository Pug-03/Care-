import { useId, type CSSProperties } from "react";
import type { ScenarioPoint } from "@/lib/simulate";

/** Two-line chart of overall risk over time: keep habits (ink) vs change habits (CARE+ blue). */
/** `progress` (0-1) reveals the lines up to that point in time, for scroll-driven scenes; omit it to draw once on mount. */
export function TrendChart({
  current,
  improved,
  className = "",
  progress,
}: {
  current: ScenarioPoint[];
  improved: ScenarioPoint[];
  className?: string;
  progress?: number;
}) {
  const W = 320;
  const H = 168;
  const pad = { l: 30, r: 14, t: 14, b: 26 };
  const n = Math.max(1, current.length - 1);
  const x = (i: number) => pad.l + (i / n) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / 100) * (H - pad.t - pad.b);
  const last = current.length - 1;
  const t = progress === undefined ? last : Math.max(0, Math.min(1, progress)) * last;
  /** Points up to time t, ending on an interpolated point. */
  const upTo = (pts: ScenarioPoint[]) => {
    const whole = Math.floor(t);
    const out = pts.slice(0, whole + 1).map((p, i) => [x(i), y(p.overall)] as const);
    if (t > whole && pts[whole + 1]) {
      const v = pts[whole].overall + (pts[whole + 1].overall - pts[whole].overall) * (t - whole);
      out.push([x(t), y(v)]);
    }
    return out;
  };
  const path = (pts: ScenarioPoint[]) =>
    upTo(pts)
      .map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`)
      .join(" ");
  const area = (pts: ScenarioPoint[]) => `${path(pts)} L${x(t)},${y(0)} L${x(0)},${y(0)} Z`;
  const tip = (pts: ScenarioPoint[]) => upTo(pts).at(-1)!;
  const animate = progress === undefined;
  // Morph between datasets where the browser supports animating `d` (Chromium); elsewhere it just updates.
  const morph = (d: string) => (animate ? ({ d: `path("${d}")`, transition: "d 650ms cubic-bezier(0.22, 1, 0.36, 1)" } as CSSProperties) : undefined);
  /** End dot rides on a transform with the same timing as the line morph, so it never leaves the line's tip. */
  const dot = ([px, py]: readonly [number, number]) =>
    ({ transform: `translate(${px}px, ${py}px)`, transition: animate ? "transform 650ms cubic-bezier(0.22, 1, 0.36, 1)" : undefined }) as CSSProperties;
  const step = n > 6 ? 2 : 1;
  const id = useId();

  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`แนวโน้มความเสี่ยงโดยรวม ${n} ปี: ถ้าใช้ชีวิตแบบเดิม ${current[last].overall}% ถ้าปรับพฤติกรรม ${improved[last].overall}%`}
      >
        <defs>
          <linearGradient id={`${id}c`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--text)" stopOpacity="0.08" />
            <stop offset="1" stopColor="var(--text)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}i`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.08" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="var(--hairline)" strokeDasharray={v ? "3 4" : undefined} />
            <text x={pad.l - 6} y={y(v) + 3.5} textAnchor="end" fontSize="9" fill="var(--muted)">
              {v}
            </text>
          </g>
        ))}
        {current.map((p, i) =>
          i % step === 0 || i === last ? (
            <text key={p.year} x={x(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="var(--muted)">
              {p.year === 0 ? "วันนี้" : `ปีที่ ${p.year}`}
            </text>
          ) : null,
        )}
        <path d={area(current)} style={morph(area(current))} fill={`url(#${id}c)`} />
        <path d={area(improved)} style={morph(area(improved))} fill={`url(#${id}i)`} />
        <path
          d={path(current)}
          style={morph(path(current))}
          fill="none"
          stroke="var(--text)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={animate ? 1000 : undefined}
          className={animate ? "draw" : undefined}
        />
        <path
          d={path(improved)}
          style={morph(path(improved))}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={animate ? 1000 : undefined}
          className={animate ? "draw" : undefined}
        />
        <circle r="5" style={dot(tip(current))} className={animate ? "dot-in" : undefined} fill="var(--text)" stroke="var(--bg)" strokeWidth="2" />
        <circle r="5" style={dot(tip(improved))} className={animate ? "dot-in" : undefined} fill="var(--accent)" stroke="var(--bg)" strokeWidth="2" />
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-5 rounded bg-ink" /> ถ้ายังใช้ชีวิตแบบเดิม
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-5 rounded bg-accent" /> ถ้าเริ่มปรับพฤติกรรม
        </span>
      </figcaption>
    </figure>
  );
}
