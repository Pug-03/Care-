"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { Robot } from "./Logo";
import { TrendChart } from "./TrendChart";
import { LEVERS, PERSONAS } from "@/lib/personas";
import { simulate } from "@/lib/simulate";
import type { Behavior } from "@/lib/health";

const YEARS = 10;
const DEFAULT_ON = ["sleep", "food"];

/**
 * The landing's product object: one person's ten-year risk, keep-habits line in ink, change-habits line in blue.
 * Switching habits on and off redraws the blue line, so the visitor feels the mechanism before reading about it.
 */
export function HeroLab() {
  const [pid, setPid] = useState(PERSONAS[0].id);
  const [on, setOn] = useState<string[]>(DEFAULT_ON);
  const persona = PERSONAS.find((p) => p.id === pid)!;
  const p = persona.profile;
  const changes = LEVERS.filter((l) => on.includes(l.id)).reduce<Partial<Behavior>>((acc, l) => ({ ...acc, ...l.apply(p) }), {});
  const sim = simulate(p, changes, YEARS);
  const cur = sim.current[YEARS].overall;
  const imp = sim.improved[YEARS].overall;
  const drop = cur - imp;
  const toggle = (id: string) => setOn((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));

  return (
    <div className="relative isolate">
      <div className="grid-paper pointer-events-none absolute -inset-x-4 -inset-y-10 -z-10 sm:-inset-10" aria-hidden="true" />

      <div data-tilt className="relative mt-10 rounded-[1.75rem] border border-hairline bg-bg p-5 pt-6 shadow-[0_24px_60px_rgb(11_11_15/0.10)] sm:mt-0 sm:p-7">
        <div className="absolute -top-14 right-3 sm:-right-6 sm:-top-12">
          <div className="flex items-end gap-2">
            <p
              key={`${pid}-${on.join()}`}
              className="rise mb-4 max-w-44 rounded-2xl rounded-br-md border border-hairline bg-bg px-3 py-2 text-xs leading-snug shadow-soft sm:max-w-52 sm:px-3.5 sm:py-2.5 sm:text-sm"
            >
              {on.length === 0 ? (
                "ลองกดเลือกนิสัยด้านล่างดูนะครับ"
              ) : (
                <>
                  ปรับ {on.length} อย่าง อีก 10 ปีความเสี่ยงลด <strong className="text-accent-text">{drop} จุด</strong>
                </>
              )}
            </p>
            <Robot className="size-16 shadow-soft ring-4 ring-white sm:size-20" priority />
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="คนตัวอย่าง">
          {PERSONAS.map((x) => (
            <button
              key={x.id}
              type="button"
              role="radio"
              aria-checked={pid === x.id}
              onClick={() => setPid(x.id)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${pid === x.id ? "border-ink bg-ink text-white" : "border-hairline hover:border-ink/40"}`}
            >
              {x.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">ตัวอย่าง: {persona.line}</p>

        {/* Dimension line over the chart, like a ruler on a drawing. */}
        <div className="mt-6 flex items-center gap-2 pl-8 pr-3 text-[11px] text-muted" aria-hidden="true">
          <span className="h-2.5 w-px bg-muted/60" />
          <span className="h-px flex-1 bg-muted/40" />
          <span>10 ปี</span>
          <span className="h-px flex-1 bg-muted/40" />
          <span className="h-2.5 w-px bg-muted/60" />
        </div>
        <TrendChart current={sim.current} improved={sim.improved} className="mt-1" />

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-hairline pt-5">
          <div>
            <p className="text-xs text-muted">ใช้ชีวิตแบบเดิม · ปีที่ 10</p>
            <p className="text-4xl font-bold tabular-nums tracking-tight">{cur}%</p>
          </div>
          <div>
            <p className="text-xs text-muted">ถ้าเริ่มปรับวันนี้ · ปีที่ 10</p>
            <p className="text-4xl font-bold tabular-nums tracking-tight text-accent">{imp}%</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">ถ้าฉันเริ่ม…</p>
            <button type="button" onClick={() => setOn(DEFAULT_ON)} className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink">
              <RotateCcw className="size-3" /> เริ่มใหม่
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {LEVERS.map((l) => {
              const active = on.includes(l.id);
              return (
                <button
                  key={l.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(l.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition ${active ? "border-accent bg-accent-soft font-medium text-accent-text" : "border-hairline text-muted hover:border-ink/40 hover:text-ink"}`}
                >
                  <span
                    className={`grid size-4 place-items-center rounded-full border transition ${active ? "border-accent bg-accent text-white" : "border-muted/50"}`}
                  >
                    {active && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
