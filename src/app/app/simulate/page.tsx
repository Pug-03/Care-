"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Leaf, RotateCcw, TrendingUp } from "lucide-react";
import { NeedProfile } from "@/components/NeedProfile";
import { TrendChart } from "@/components/TrendChart";
import { btn, Card, LEVEL_TONE, PageHead } from "@/components/ui";
import { FREQ_LABEL, levelOfScore, OVERALL_LABEL, type Behavior, type Freq, type Profile } from "@/lib/health";
import { simulate, suggestedChanges } from "@/lib/simulate";
import { useCare } from "@/lib/store";

const HORIZONS = [1, 3, 5, 10];

function Lever({ label, now, children }: { label: string; now: string; children: React.ReactNode }) {
  return (
    <div className="py-3.5">
      <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted">ตอนนี้: {now}</span>
      </div>
      {children}
    </div>
  );
}

function Range({
  value,
  onChange,
  min,
  max,
  step = 1,
  fmt,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  fmt: (v: number) => string;
}) {
  return (
    <div className="flex items-center gap-3">
      <input type="range" className="w-full" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <output className="w-24 shrink-0 text-right text-sm tabular-nums">{fmt(value)}</output>
    </div>
  );
}

function Freqs({ value, onChange }: { value: Freq; onChange: (v: Freq) => void }) {
  return (
    <div className="grid grid-cols-4 gap-1 rounded-xl bg-surface p-1">
      {([0, 1, 2, 3] as Freq[]).map((f) => (
        <button
          key={f}
          type="button"
          aria-pressed={value === f}
          onClick={() => onChange(f)}
          className={`rounded-lg py-1.5 text-xs transition ${value === f ? "bg-white font-medium text-emerald-700 shadow-soft" : "text-muted hover:text-ink"}`}
        >
          {FREQ_LABEL[f]}
        </button>
      ))}
    </div>
  );
}

function Simulator({ p }: { p: Profile }) {
  const saved = useCare((s) => s.changes);
  const setChanges = useCare((s) => s.setChanges);
  const [years, setYears] = useState(5);
  const changes = saved ?? suggestedChanges(p);
  const b: Behavior = { ...p, ...changes };
  const set = (patch: Partial<Behavior>) => setChanges({ ...changes, ...patch });
  const sim = simulate(p, changes, years);
  const cur = sim.current.at(-1)!;
  const imp = sim.improved.at(-1)!;

  return (
    <div className="stagger grid gap-6 lg:grid-cols-[1.25fr_1fr]">
      <div className="space-y-6">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">แนวโน้มความเสี่ยงโดยรวม</h2>
            <div className="flex rounded-full bg-surface p-1 text-sm" role="radiogroup" aria-label="ช่วงเวลาที่จำลอง">
              {HORIZONS.map((y) => (
                <button
                  key={y}
                  role="radio"
                  aria-checked={years === y}
                  onClick={() => setYears(y)}
                  className={`rounded-full px-3 py-1 transition ${years === y ? "bg-bg font-medium shadow-soft" : "text-muted hover:text-ink"}`}
                >
                  {y} ปี
                </button>
              ))}
            </div>
          </div>
          <TrendChart current={sim.current} improved={sim.improved} className="mt-4" />
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["ชีวิตแบบเดิม", "ถ้ายังใช้พฤติกรรมเดิมต่อไป", cur, sim.currentEnd, sim.currentEndProfile, "high"],
              ["ปรับเปลี่ยนพฤติกรรม", "ถ้าเริ่มปรับตามที่เลือก", imp, sim.improvedEnd, sim.improvedEndProfile, "good"],
            ] as const
          ).map(([title, sub, pt, end, prof, tone]) => (
            <section
              key={title}
              className={`rounded-card border p-4 shadow-soft sm:p-5 ${tone === "high" ? "border-rose-200/70 bg-gradient-to-b from-rose-50 to-white" : "border-emerald-200/70 bg-gradient-to-b from-emerald-50 to-white"}`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-full text-white ${tone === "high" ? "bg-gradient-to-br from-rose-400 to-pink-600" : "bg-gradient-to-br from-emerald-400 to-teal-600"}`}
                >
                  {tone === "high" ? <TrendingUp className="size-5" /> : <Leaf className="size-5" />}
                </span>
                <h3 className="font-bold text-[#123a73]">{title}</h3>
              </div>
              <p className="text-xs text-muted">{sub}</p>
              <p className={`mt-3 text-3xl font-semibold tabular-nums ${tone === "high" ? "text-rose-600" : "text-emerald-600"}`}>{pt.overall}%</p>
              <p className="text-xs text-muted">
                {OVERALL_LABEL[end.overallLevel]} ในอีก {years} ปี
              </p>
              <dl className="mt-4 space-y-2 text-sm">
                {end.conditions.map((c) => (
                  <div key={c.id} className="flex justify-between gap-2">
                    <dt className="min-w-0 truncate text-muted">{c.label}</dt>
                    <dd className={`tabular-nums ${LEVEL_TONE[levelOfScore(c.score)].text}`}>{c.score}%</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-2 border-t border-hairline/70 pt-2">
                  <dt className="text-muted">น้ำหนัก</dt>
                  <dd className="tabular-nums">{prof.weightKg} กก.</dd>
                </div>
                {prof.systolic && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">ความดัน</dt>
                    <dd className="tabular-nums">
                      {prof.systolic}/{prof.diastolic}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          ))}
        </div>

        <p className="text-xs leading-relaxed text-muted">
          การจำลองใช้สมมติฐานว่าน้ำหนักและความดันเปลี่ยนตามพฤติกรรมในแต่ละปี และพฤติกรรมใหม่เริ่มเห็นผลภายในปีแรก ผลลัพธ์แสดงทิศทางเพื่อสร้างแรงจูงใจ
          ไม่ใช่การพยากรณ์ทางการแพทย์
        </p>
      </div>

      <Card className="h-fit lg:sticky lg:top-10">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[#123a73]">ถ้าฉันปรับ…</h2>
          <button type="button" onClick={() => setChanges(null)} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
            <RotateCcw className="size-3.5" /> ค่าแนะนำ
          </button>
        </div>
        <div className="mt-2 divide-y divide-hairline">
          <Lever label="นอนหลับ" now={`${p.sleepHours} ชม.`}>
            <Range value={b.sleepHours} onChange={(sleepHours) => set({ sleepHours })} min={4} max={10} step={0.5} fmt={(v) => `${v} ชม.`} />
          </Lever>
          <Lever label="ออกกำลังกาย" now={`${p.exerciseDays} วัน`}>
            <Range value={b.exerciseDays} onChange={(exerciseDays) => set({ exerciseDays })} min={0} max={7} fmt={(v) => `${v} วัน/สัปดาห์`} />
          </Lever>
          <Lever label="กินหวาน" now={FREQ_LABEL[p.sweet]}>
            <Freqs value={b.sweet} onChange={(sweet) => set({ sweet })} />
          </Lever>
          <Lever label="กินเค็ม" now={FREQ_LABEL[p.salty]}>
            <Freqs value={b.salty} onChange={(salty) => set({ salty })} />
          </Lever>
          <Lever label="กินมัน" now={FREQ_LABEL[p.fatty]}>
            <Freqs value={b.fatty} onChange={(fatty) => set({ fatty })} />
          </Lever>
          <Lever label="ผักและผลไม้" now={`${p.veggies} ส่วน`}>
            <Range value={b.veggies} onChange={(veggies) => set({ veggies })} min={0} max={8} fmt={(v) => `${v} ส่วน/วัน`} />
          </Lever>
          <Lever label="ความเครียด" now={`${p.stress}/10`}>
            <Range value={b.stress} onChange={(stress) => set({ stress })} min={1} max={10} fmt={(v) => `${v}/10`} />
          </Lever>
          {p.alcohol > 0 && (
            <Lever label="แอลกอฮอล์" now={`${p.alcohol} ดื่ม`}>
              <Range value={b.alcohol} onChange={(alcohol) => set({ alcohol })} min={0} max={30} fmt={(v) => (v ? `${v} ดื่ม/สัปดาห์` : "งดดื่ม")} />
            </Lever>
          )}
          {p.smoking === "current" && (
            <Lever label="บุหรี่" now="สูบอยู่">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={b.smoking === "former"}
                  onChange={(e) => set({ smoking: e.target.checked ? "former" : "current" })}
                />
                เลิกสูบบุหรี่
              </label>
            </Lever>
          )}
        </div>
        <Link href="/app/plan" className={`${btn.primary} mt-4 w-full`}>
          สร้างแผนจากการจำลองนี้ <ArrowRight className="size-4" />
        </Link>
      </Card>
    </div>
  );
}

export default function Simulate() {
  return (
    <div className="lg:max-w-none">
      <PageHead
        feature="simulate"
        says={
          <>
            เลือกพฤติกรรมวันนี้
            <br />
            เปลี่ยนอนาคตได้นะครับ
          </>
        }
        eyebrow="Future Health Simulation"
        title="จำลองอนาคต"
        sub="เปรียบเทียบสุขภาพในอนาคต ระหว่างการใช้ชีวิตแบบเดิม กับการเริ่มปรับพฤติกรรมตั้งแต่วันนี้"
      />
      <NeedProfile what="จำลองอนาคต">{(p) => <Simulator p={p} />}</NeedProfile>
    </div>
  );
}
