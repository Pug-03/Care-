"use client";

import Link from "next/link";
import { Brain, Check, ClipboardCheck, Cigarette, Footprints, Moon, RefreshCw, Salad, type LucideIcon } from "lucide-react";
import { NeedProfile } from "@/components/NeedProfile";
import { Badge, btn, Card, PageHead } from "@/components/ui";
import { AREA_LABEL, buildPlan, type Action } from "@/lib/actions";
import { analyze, FREQ_LABEL, LEVEL_LABEL, type Behavior, type Profile } from "@/lib/health";
import { todayKey, useCare } from "@/lib/store";

const GOAL_LABEL: Partial<Record<keyof Behavior, (v: number | string) => string>> = {
  sleepHours: (v) => `นอน ${v} ชม./คืน`,
  exerciseDays: (v) => `ออกกำลังกาย ${v} วัน/สัปดาห์`,
  sweet: (v) => `กินหวาน: ${FREQ_LABEL[v as 0]}`,
  salty: (v) => `กินเค็ม: ${FREQ_LABEL[v as 0]}`,
  fatty: (v) => `กินมัน: ${FREQ_LABEL[v as 0]}`,
  veggies: (v) => `ผักผลไม้ ${v} ส่วน/วัน`,
  stress: (v) => `ความเครียดไม่เกิน ${v}/10`,
  alcohol: (v) => (v ? `แอลกอฮอล์ไม่เกิน ${v} ดื่ม/สัปดาห์` : "งดแอลกอฮอล์"),
  water: (v) => `ดื่มน้ำ ${v} แก้ว/วัน`,
  smoking: (v) => (v === "former" ? "เลิกบุหรี่" : ""),
};

const AREA_STYLE: Record<Action["area"], [LucideIcon, string]> = {
  sleep: [Moon, "from-indigo-400 to-violet-600"],
  move: [Footprints, "from-amber-400 to-orange-500"],
  food: [Salad, "from-emerald-400 to-teal-600"],
  mind: [Brain, "from-sky-400 to-blue-600"],
  habit: [Cigarette, "from-rose-400 to-pink-600"],
  check: [ClipboardCheck, "from-cyan-400 to-sky-600"],
};

function lastDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d;
  });
}

function Plan({ p }: { p: Profile }) {
  const done = useCare((s) => s.done);
  const toggle = useCare((s) => s.toggleDone);
  const changes = useCare((s) => s.changes);
  const a = analyze(p);
  const plan = buildPlan(p, a);
  const today = todayKey();
  const todayDone = new Set(done[today] ?? []);
  const count = plan.filter((x) => todayDone.has(x.id)).length;
  const week = lastDays(7).map((d) => {
    const ids = new Set(done[todayKey(d)] ?? []);
    return { d, ratio: plan.length ? plan.filter((x) => ids.has(x.id)).length / plan.length : 0 };
  });
  const goals = changes
    ? (Object.entries(changes) as [keyof Behavior, number | string][])
        .filter(([k, v]) => p[k] !== v && GOAL_LABEL[k])
        .map(([k, v]) => GOAL_LABEL[k]!(v))
        .filter(Boolean)
    : [];
  // Habits first, monitoring last, in the order of AREA_LABEL.
  const groups = (Object.keys(AREA_LABEL) as Action["area"][])
    .map((area) => [area, plan.filter((x) => x.area === area)] as const)
    .filter(([, items]) => items.length > 0);

  return (
    <div className="stagger space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_1.2fr]">
        <Card>
          <p className="text-sm text-muted">วันนี้</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {count}
            <span className="text-lg text-muted">/{plan.length}</span>
          </p>
          <p className="text-sm text-muted">เป้าหมายที่ทำแล้ว</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-[width] duration-500"
              style={{ width: `${(count / plan.length) * 100}%` }}
            />
          </div>
        </Card>
        <Card>
          <p className="text-sm text-muted">7 วันที่ผ่านมา</p>
          <ol className="mt-3 flex justify-between gap-2">
            {week.map(({ d, ratio }) => (
              <li key={d.toISOString()} className="flex flex-1 flex-col items-center gap-1.5">
                <span
                  className="relative h-16 w-full max-w-8 overflow-hidden rounded-lg bg-surface-2"
                  aria-label={`${d.toLocaleDateString("th-TH", { weekday: "long" })} ${Math.round(ratio * 100)}%`}
                >
                  <span
                    className="absolute inset-x-0 bottom-0 rounded-lg bg-gradient-to-t from-orange-500 to-amber-300 transition-[height]"
                    style={{ height: `${ratio * 100}%` }}
                  />
                </span>
                <span className="text-[11px] text-muted">{d.toLocaleDateString("th-TH", { weekday: "narrow" })}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {goals.length > 0 && (
        <Card className="border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-teal-50">
          <h2 className="font-semibold">เป้าหมายจากการจำลองอนาคต</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {goals.map((g) => (
              <li key={g} className="rounded-full bg-bg px-3 py-1.5 text-sm">
                {g}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {groups.map(([area, items]) => (
        <section key={area}>
          <h2 className="mb-2 text-sm font-medium text-muted">{AREA_LABEL[area]}</h2>
          <ul className="space-y-2">
            {items.map((x) => {
              const on = todayDone.has(x.id);
              return (
                <li key={x.id} className="reveal">
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(today, x.id)}
                    className={`flex w-full items-center gap-4 rounded-card border p-4 text-left shadow-soft transition ${on ? "border-emerald-200 bg-emerald-50/70" : "border-hairline bg-white lift"}`}
                  >
                    {(() => {
                      const [Icon, grad] = AREA_STYLE[x.area];
                      return (
                        <span className={`grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br text-white ${grad}`}>
                          <Icon className="size-6" />
                        </span>
                      );
                    })()}
                    <span className="min-w-0 flex-1">
                      <span className={`block font-medium ${on ? "text-muted line-through" : ""}`}>{x.title}</span>
                      <span className="mt-0.5 block text-sm text-muted">{x.detail}</span>
                      <span className="mt-2 block text-xs text-muted">เพราะ {x.because}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-2">
                      <Badge level={x.priority}>{x.priority === "good" ? "รักษาไว้" : LEVEL_LABEL[x.priority]}</Badge>
                      <span
                        className={`grid size-7 place-items-center rounded-full border-2 transition ${on ? "border-emerald-500 bg-emerald-500 text-white" : "border-hairline bg-white"}`}
                      >
                        {on && <Check className="size-4" strokeWidth={3} />}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white">
          <RefreshCw className="size-6" />
        </span>
        <div className="flex-1">
          <p className="font-semibold">วิเคราะห์ซ้ำทุก 2–4 สัปดาห์</p>
          <p className="text-sm text-muted">Analyze → Recommend → Act → Collect Data → Analyze Again อัปเดตข้อมูลเพื่อดูว่าความเสี่ยงเปลี่ยนไปอย่างไร</p>
        </div>
        <Link href="/app/check" className={btn.ghost}>
          อัปเดตข้อมูล
        </Link>
      </Card>
    </div>
  );
}

export default function PlanPage() {
  return (
    <>
      <PageHead
        feature="plan"
        says={
          <>
            เปลี่ยนวันนี้ เพื่ออนาคตที่ดีขึ้น
            <br />
            ไปด้วยกันนะ 💙
          </>
        }
        eyebrow="Action Recommendation"
        title="แนะนำสิ่งที่ทำได้จริง"
        sub="เป้าหมายเล็ก ๆ ที่เลือกมาจากผลวิเคราะห์ของคุณ ติ๊กเมื่อทำเสร็จในแต่ละวัน"
      />
      <NeedProfile what="สร้างแผนของคุณ">{(p) => <Plan p={p} />}</NeedProfile>
    </>
  );
}
