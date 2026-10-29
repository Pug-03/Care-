"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Lightbulb } from "lucide-react";
import { CatFace, CatForm } from "@/components/Logo";
import { FEATURE, Tile, type FeatureKey } from "@/components/theme";
import { LEVEL_TONE, Ring } from "@/components/ui";
import { useNow } from "@/components/useNow";
import { CHOICES } from "@/lib/choices";
import { analyze, OVERALL_LABEL } from "@/lib/health";
import { dailyMissions, dateKey, levelOf, streakOf, tipOfDay } from "@/lib/missions";
import { catNow, FORMS } from "@/lib/pet";
import { useCare, useHydrated, WELCOME_XP } from "@/lib/store";

const FLOW: { key: FeatureKey; short: string }[] = [
  { key: "quiz", short: "ประเมิน" },
  { key: "choice", short: "ทางเลือก" },
  { key: "missions", short: "ภารกิจ" },
  { key: "pet", short: "น้องแมว" },
];

const card = "rounded-card border border-hairline bg-bg";

export default function Home() {
  const ready = useHydrated();
  const now = useNow();
  const profile = useCare((s) => s.profile);
  const picked = useCare((s) => s.picked);
  const done = useCare((s) => s.done);
  const xp = useCare((s) => s.xp);
  const xpTotal = useCare((s) => s.xpTotal);
  const saved = useCare((s) => s.pet);
  const complete = useCare((s) => s.complete);
  const [earned, setEarned] = useState<{ title: string; xp: number } | null>(null);

  if (!ready) return <div className="h-96 animate-pulse rounded-card bg-surface" />;

  const a = profile ? analyze(profile) : null;
  const missions = dailyMissions(profile, a, picked);
  const todayDone = new Set(done[dateKey(now)] ?? []);
  const doneCount = missions.filter((m) => todayDone.has(m.mission.id)).length;
  const next = missions.find((m) => !todayDone.has(m.mission.id));
  const streak = streakOf(done, now);
  const { pet, form, mood, text } = catNow(saved, done, now);
  const { level } = levelOf(xpTotal);
  const watch = new Set(a?.factors.filter((f) => f.level !== "good").map((f) => f.id) ?? []);
  const choice = CHOICES.find((c) => c.factors.some((f) => watch.has(f))) ?? CHOICES[0];
  const date = now.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" });
  // Where the user is in the flow: quiz first, then the daily loop of missions and the cat.
  const step: FeatureKey = !profile ? "quiz" : picked.length === 0 && doneCount === 0 && Object.keys(done).length === 0 ? "choice" : next ? "missions" : "pet";
  const stepAt = FLOW.findIndex((f) => f.key === step);
  const pct = missions.length ? (doneCount / missions.length) * 100 : 0;

  const finish = (id: string, title: string, gain: number) => {
    if (complete(id)) setEarned({ title, xp: gain });
  };

  return (
    <div className="stagger space-y-8">
      <header>
        <h1 className="text-[clamp(1.875rem,5vw,3rem)] font-bold leading-[1.25] tracking-tight text-balance">
          สวัสดี{profile?.name ? ` ${profile.name}` : ""}
          <br />
          <span className="text-muted">วันนี้ดูแลตัวเองแล้วหรือยัง</span>
        </h1>
        <p className="mt-2 text-sm text-muted">{date}</p>
      </header>

      {/* The four components as one path. The current step carries the ink outline; finished steps get a check. */}
      <nav aria-label="ขั้นตอนการใช้ CARE+">
        <ol className="grid grid-cols-4 gap-2">
          {FLOW.map(({ key, short }, i) => {
            const f = FEATURE[key];
            const here = i === stepAt;
            const past = i < stepAt;
            return (
              <li key={key} className="min-w-0">
                <Link
                  href={f.href}
                  aria-current={here ? "step" : undefined}
                  className={`flex h-full flex-col items-center gap-2 rounded-2xl border px-1.5 py-3 text-center transition sm:flex-row sm:gap-3 sm:px-3 sm:text-left ${
                    here ? "border-ink shadow-[inset_0_0_0_1px_var(--text)]" : "border-hairline hover:border-ink/40"
                  }`}
                >
                  <span className="relative">
                    <Tile feature={key} size="sm" />
                    {past && (
                      <span className="absolute -right-1.5 -top-1.5 grid size-[18px] place-items-center rounded-full bg-ink text-white ring-2 ring-bg">
                        <Check className="size-2.5" strokeWidth={3.5} aria-hidden="true" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="hidden text-xs text-muted sm:block">
                      {i + 1}. {f.en}
                      {past && <span className="sr-only"> (ทำแล้ว)</span>}
                    </span>
                    <span className="block text-xs font-semibold leading-snug sm:hidden">{short}</span>
                    <span className="hidden truncate text-sm font-semibold sm:block">{f.title}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      {!profile || !a ? (
        <section className={`${card} relative overflow-hidden p-6 sm:p-10`} aria-labelledby="start-title">
          <CatForm form="sprout" className="float pointer-events-none absolute -bottom-6 right-4 hidden h-56 w-auto sm:block" />
          <div className="relative max-w-lg">
            <h2 id="start-title" className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
              เริ่มจากรู้จักตัวเอง
              <br />
              <span className="text-muted">ด้วยแบบประเมินสั้น ๆ 3 นาที</span>
            </h2>
            <p className="mt-3 leading-relaxed text-muted">
              ตอบคำถามเรื่องการนอน อาหาร การออกกำลังกาย และความเครียด แล้วรับผลประเมินปัจจัยเสี่ยงเบื้องต้น พร้อม {WELCOME_XP} XP ต้อนรับไว้เลี้ยงน้องแมว
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href="/app/quiz" className="pill px-6 py-3">
                เริ่มทำแบบประเมิน <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/app/demo" className="py-2 text-sm font-semibold underline decoration-hairline decoration-2 underline-offset-8 hover:decoration-ink">
                ลองใช้ข้อมูลตัวอย่าง
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* The one thing to do next, with its action right here. */}
          <section className={`${card} p-6 sm:p-8`} aria-labelledby="next-title">
            {step === "choice" ? (
              <div className="flex gap-6">
                <span className="hidden sm:block">
                  <Tile feature="choice" size="lg" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 id="next-title" className="text-2xl font-bold leading-snug tracking-tight sm:text-[1.75rem]">
                    ขั้นต่อไป: {choice.topic}
                    <br />
                    <span className="text-muted">
                      {choice.a.label} หรือ {choice.b.label}
                    </span>
                  </h2>
                  <p className="mt-2 leading-relaxed text-muted">ดูข้อมูลเปรียบเทียบที่มีแหล่งอ้างอิง แล้วเลือกภารกิจที่อยากเริ่มทำ</p>
                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                    <Link href="/app/choice" className="pill px-6 py-3">
                      เปรียบเทียบเลย <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                    <Link href="/app/missions" className="py-2 text-sm font-semibold underline decoration-hairline decoration-2 underline-offset-8 hover:decoration-ink">
                      ข้ามไปดูภารกิจวันนี้
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <p className="font-semibold">
                    ภารกิจวันนี้ <span className="tabular-nums">{doneCount}</span>
                    <span className="text-muted"> / {missions.length}</span>
                  </p>
                  <Link href="/app/missions" className="inline-flex items-center gap-1 py-1 font-semibold text-muted transition hover:text-ink">
                    ดูทั้งหมด <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2"
                  role="progressbar"
                  aria-label="ภารกิจที่ทำแล้ววันนี้"
                  aria-valuemin={0}
                  aria-valuemax={missions.length}
                  aria-valuenow={doneCount}
                >
                  <div className="h-full rounded-full bg-ink transition-[width] duration-500" style={{ width: `${pct}%` }} />
                </div>

                {next ? (
                  <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                      <h2 id="next-title" className="text-2xl font-bold leading-snug tracking-tight sm:text-[1.75rem]">
                        {next.mission.title}
                      </h2>
                      <p className="mt-1.5 max-w-prose leading-relaxed text-muted">{next.mission.detail}</p>
                      <p className="mt-3 text-sm text-muted">จากผลประเมิน: {next.because}</p>
                    </div>
                    <button type="button" onClick={() => finish(next.mission.id, next.mission.title, next.mission.xp)} className="pill shrink-0 self-start px-6 py-3 sm:self-auto">
                      <Check className="size-4" strokeWidth={3} aria-hidden="true" /> ทำแล้ว รับ {next.mission.xp} XP
                    </button>
                  </div>
                ) : (
                  <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 id="next-title" className="text-2xl font-bold leading-snug tracking-tight sm:text-[1.75rem]">
                        วันนี้ครบทุกภารกิจแล้ว
                        <br />
                        <span className="text-muted">เอา XP ไปดูแลน้องแมวกัน</span>
                      </h2>
                    </div>
                    <Link href="/app/pet" className="pill shrink-0 self-start px-6 py-3 sm:self-auto">
                      ไปหาน้องแมว <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                )}
                <p className="mt-6 border-t border-hairline pt-4 text-sm text-muted" aria-live="polite">
                  {earned ? (
                    <span className="font-semibold text-accent-text">
                      {earned.title} สำเร็จ ได้ {earned.xp} XP
                    </span>
                  ) : (
                    <>
                      ทำต่อเนื่อง <span className="tabular-nums">{streak}</span> วัน · เลเวล <span className="tabular-nums">{level}</span>
                    </>
                  )}
                </p>
              </>
            )}
          </section>

          <div className="grid gap-4 md:grid-cols-3">
            {/* The cat */}
            <Link href="/app/pet" className={`${card} lift group flex flex-col p-5`}>
              <span className="flex items-center justify-between gap-3">
                <span className="font-semibold">{FORMS[form].nick}</span>
                <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold tabular-nums text-accent-text">{xp} XP</span>
              </span>
              <span className="mt-3 flex flex-1 items-center gap-4">
                <CatForm form={form} className="float h-24 w-auto shrink-0" />
                <span className="min-w-0">
                  <span className="flex items-start gap-1.5 text-sm leading-snug">
                    <CatFace mood={mood} form={form} className="size-6 shrink-0" />
                    {text}
                  </span>
                  <span className="mt-2 block text-xs tabular-nums text-muted">
                    อิ่ม {pet.full} · สุข {pet.joy} · พลัง {pet.energy}
                  </span>
                </span>
              </span>
            </Link>

            <Link href="/app/result" className={`${card} lift group flex items-center gap-4 p-5`}>
              <Ring value={a.overall} level={a.overallLevel} size={72} label="คะแนนความเสี่ยงโดยรวม" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-muted">ผลประเมินล่าสุด</span>
                <span className={`block text-lg font-bold ${LEVEL_TONE[a.overallLevel].text}`}>{OVERALL_LABEL[a.overallLevel]}</span>
                <span className="block text-sm text-muted">{watch.size} เรื่องที่ควรใส่ใจ</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden="true" />
            </Link>

            {step === "choice" ? (
              <Link href="/app/missions" className={`${card} lift group flex items-center gap-4 p-5`}>
                <Tile feature="missions" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-muted">ภารกิจวันนี้</span>
                  <span className="block font-semibold">{missions.length} ภารกิจ จากผลประเมินของคุณ</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden="true" />
              </Link>
            ) : (
              <Link href="/app/choice" className={`${card} lift group flex items-center gap-4 p-5`}>
                <Tile feature="choice" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-muted">ทางเลือกที่น่าลอง</span>
                  <span className="block font-semibold leading-snug">
                    {choice.a.label} <span className="font-normal text-muted">หรือ</span> {choice.b.label}
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden="true" />
              </Link>
            )}
          </div>
        </>
      )}

      <aside className="flex items-start gap-4 rounded-card bg-surface p-5" aria-label="เคล็ดลับวันนี้">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100">
          <Lightbulb className="size-5" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold">เคล็ดลับวันนี้</p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted">{tipOfDay(now)}</p>
        </div>
      </aside>
    </div>
  );
}
