"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Lightbulb } from "lucide-react";
import { CatFace, CatForm, CatSays } from "@/components/Logo";
import { FEATURE, Tile, type FeatureKey } from "@/components/theme";
import { LEVEL_TONE, Ring } from "@/components/ui";
import { useNow } from "@/components/useNow";
import { CHOICES } from "@/lib/choices";
import { analyze, OVERALL_LABEL } from "@/lib/health";
import { dailyMissions, dateKey, levelOf, streakOf, tipOfDay } from "@/lib/missions";
import { catNow, FORMS } from "@/lib/pet";
import { useCare, useHydrated, WELCOME_XP } from "@/lib/store";

const FLOW: FeatureKey[] = ["quiz", "choice", "missions", "pet"];

export default function Home() {
  const ready = useHydrated();
  const now = useNow();
  const profile = useCare((s) => s.profile);
  const picked = useCare((s) => s.picked);
  const done = useCare((s) => s.done);
  const xp = useCare((s) => s.xp);
  const xpTotal = useCare((s) => s.xpTotal);
  const saved = useCare((s) => s.pet);

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
  const step: FeatureKey = !profile ? "quiz" : picked.length === 0 && doneCount === 0 && Object.keys(done).length === 0 ? "choice" : "missions";

  return (
    <div className="stagger space-y-6">
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.15] tracking-tight">
            สวัสดี{profile?.name ? ` ${profile.name}` : ""}
            <br />
            <span className="text-muted">วันนี้ดูแลตัวเองแล้วหรือยัง</span>
          </h1>
          <p className="mt-3 text-sm text-muted">{date}</p>
        </div>
        <CatSays className="hidden md:flex" size="size-24">
          {!profile ? "เริ่มจากทำแบบประเมิน 3 นาทีกันนะ" : next ? `ภารกิจต่อไป: ${next.mission.title}` : "วันนี้ทำภารกิจครบแล้ว เก่งมาก!"}
        </CatSays>
      </header>

      {/* The four components as one path; the current step is filled in. */}
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="ขั้นตอนการใช้ CARE+">
        {FLOW.map((k, i) => {
          const f = FEATURE[k];
          const here = k === step;
          const past = FLOW.indexOf(step) > i;
          return (
            <li key={k}>
              <Link
                href={f.href}
                aria-current={here ? "step" : undefined}
                className={`lift flex h-full items-center gap-3 rounded-2xl border p-3 ${here ? "border-ink bg-ink text-white" : "border-hairline bg-bg"}`}
              >
                <span className="relative">
                  <Tile feature={k} size="sm" />
                  {past && (
                    <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-accent text-white">
                      <Check className="size-2.5" strokeWidth={3.5} />
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className={`block text-[11px] ${here ? "text-white/70" : "text-muted"}`}>
                    {i + 1}. {f.en}
                  </span>
                  <span className="block truncate text-sm font-semibold">{f.title}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {!profile || !a ? (
        <section className="relative overflow-hidden rounded-card border border-hairline p-8 sm:p-10">
          <CatForm form="sprout" className="float pointer-events-none absolute -bottom-6 right-4 hidden h-56 w-auto sm:block" />
          <div className="relative max-w-lg">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              เริ่มจากรู้จักตัวเอง
              <br />
              <span className="text-muted">ด้วยแบบประเมินสั้น ๆ</span>
            </h2>
            <p className="mt-3 text-muted">ตอบคำถามเรื่องการนอน อาหาร การออกกำลังกาย และความเครียด แล้วรับผลประเมินปัจจัยเสี่ยงเบื้องต้น พร้อม {WELCOME_XP} XP ต้อนรับไว้เลี้ยงน้องแมว</p>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <Link href="/app/quiz" className="pill px-6 py-3">
                เริ่มทำแบบประเมิน <ArrowRight className="size-4" />
              </Link>
              <Link href="/app/demo" className="text-sm font-semibold underline decoration-hairline decoration-2 underline-offset-8 hover:decoration-ink">
                ใช้ข้อมูลตัวอย่าง
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1.15fr_1fr]">
          {/* Today's missions */}
          <Link href="/app/missions" className="lift group flex flex-col rounded-card border border-hairline bg-bg p-6">
            <div className="flex items-center justify-between">
              <p className="font-semibold">ภารกิจวันนี้</p>
              <ArrowUpRight className="size-5 text-muted transition group-hover:text-ink" />
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight">
              {doneCount}
              <span className="text-lg text-muted"> / {missions.length}</span>
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-ink" style={{ width: `${missions.length ? (doneCount / missions.length) * 100 : 0}%` }} />
            </div>
            {next ? (
              <p className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-sm">
                <span className="truncate">{next.mission.title}</span>
                <span className="shrink-0 font-semibold text-accent-text">+{next.mission.xp} XP</span>
              </p>
            ) : (
              <p className="mt-4 rounded-2xl bg-good-soft px-4 py-3 text-sm font-medium text-good">ครบทุกภารกิจแล้ว พรุ่งนี้มาต่อกันนะ</p>
            )}
            <p className="mt-auto pt-4 text-xs text-muted">
              ทำต่อเนื่อง {streak} วัน · เลเวล {level}
            </p>
          </Link>

          {/* The cat */}
          <Link href="/app/pet" className="lift group relative flex flex-col overflow-hidden rounded-card border border-hairline bg-accent-soft/40 p-6">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{FORMS[form].nick}</p>
              <span className="rounded-full bg-bg px-2.5 py-1 text-xs font-semibold tabular-nums text-accent-text">{xp} XP</span>
            </div>
            <div className="flex flex-1 items-end gap-4">
              <CatForm form={form} className="float h-36 w-auto shrink-0" />
              <div className="pb-2">
                <p className="flex items-center gap-2 text-sm">
                  <CatFace mood={mood} className="size-8" />
                  {text}
                </p>
                <p className="mt-2 text-xs text-muted">
                  อิ่ม {pet.full} · สุข {pet.joy} · พลัง {pet.energy}
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {a && (
        <div className="grid gap-4 md:grid-cols-[1fr_1.15fr]">
          <Link href="/app/result" className="lift group flex items-center gap-5 rounded-card border border-hairline bg-bg p-5">
            <Ring value={a.overall} level={a.overallLevel} size={76} label="คะแนนความเสี่ยงโดยรวม" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-muted">ผลประเมินล่าสุด</span>
              <span className={`block text-xl font-bold ${LEVEL_TONE[a.overallLevel].text}`}>{OVERALL_LABEL[a.overallLevel]}</span>
              <span className="block text-sm text-muted">{a.factors.filter((f) => f.level !== "good").length} เรื่องที่ควรใส่ใจ</span>
            </span>
            <ArrowUpRight className="size-5 shrink-0 text-muted transition group-hover:text-ink" />
          </Link>
          <Link href="/app/choice" className="lift group flex items-center gap-4 rounded-card border border-hairline bg-bg p-5">
            <Tile feature="choice" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-muted">ทางเลือกที่น่าลอง</span>
              <span className="block font-semibold">
                {choice.a.label} <span className="font-normal text-muted">หรือ</span> {choice.b.label}
              </span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
          </Link>
        </div>
      )}

      <section className="flex items-start gap-4 rounded-card bg-surface p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100">
          <Lightbulb className="size-5" strokeWidth={1.8} />
        </span>
        <div>
          <p className="font-semibold">เคล็ดลับวันนี้</p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted">{tipOfDay(now)}</p>
        </div>
      </section>
    </div>
  );
}
