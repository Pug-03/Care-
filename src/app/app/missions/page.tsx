"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Brain, Check, ClipboardCheck, Cigarette, Flame, Footprints, Moon, Plus, Salad, X, type LucideIcon } from "lucide-react";
import { CatFace } from "@/components/Logo";
import { NeedProfile } from "@/components/NeedProfile";
import { Badge, PageHead } from "@/components/ui";
import { analyze, LEVEL_LABEL, type Profile } from "@/lib/health";
import { AREA_LABEL, dailyMissions, dateKey, levelOf, MISSIONS, streakOf, XP_PER_LEVEL, type Area } from "@/lib/missions";
import { useCare } from "@/lib/store";
import { useNow } from "@/components/useNow";

const AREA_STYLE: Record<Area, [LucideIcon, string]> = {
  sleep: [Moon, "bg-indigo-100"],
  move: [Footprints, "bg-amber-100"],
  food: [Salad, "bg-emerald-100"],
  mind: [Brain, "bg-sky-100"],
  habit: [Cigarette, "bg-rose-100"],
  check: [ClipboardCheck, "bg-cyan-100"],
};

/** Done rows settle in once, so the tap visibly lands. Off under reduced motion. */
const SETTLE = "motion-safe:animate-[rise_520ms_cubic-bezier(0.16,1,0.3,1)_both]";

function AreaIcon({ area, small = false }: { area: Area; small?: boolean }) {
  const [Icon, tint] = AREA_STYLE[area];
  return (
    <span className={`grid shrink-0 place-items-center text-ink ${tint} ${small ? "size-6 rounded-md" : "size-11 rounded-xl sm:size-12"}`} aria-hidden="true">
      <Icon className={small ? "size-3.5" : "size-5 sm:size-6"} />
    </span>
  );
}

type Earned = { key: number; xp: number; allDone: boolean; xpToday: number };

function Missions({ p }: { p: Profile }) {
  const done = useCare((s) => s.done);
  const picked = useCare((s) => s.picked);
  const xpTotal = useCare((s) => s.xpTotal);
  const complete = useCare((s) => s.complete);
  const togglePicked = useCare((s) => s.togglePicked);
  const [earned, setEarned] = useState<Earned | null>(null);
  const [justDone, setJustDone] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const now = useNow();

  // The reward note steps aside on its own after a few seconds.
  useEffect(() => {
    if (!earned) return;
    const t = setTimeout(() => setEarned(null), 6000);
    return () => clearTimeout(t);
  }, [earned]);

  const list = dailyMissions(p, analyze(p), picked);
  const todayDone = new Set(done[dateKey(now)] ?? []);
  const finished = list.filter((x) => todayDone.has(x.mission.id));
  const count = finished.length;
  const xpToday = finished.reduce((s, x) => s + x.mission.xp, 0);
  const xpLeft = list.reduce((s, x) => s + x.mission.xp, 0) - xpToday;
  const allDone = list.length > 0 && count === list.length;
  const streak = streakOf(done, now);
  const { level, into } = levelOf(xpTotal);
  const inList = new Set(list.map((x) => x.mission.id));
  const more = MISSIONS.filter((m) => !inList.has(m.id) && m.when?.(p) !== false);
  const groups = (Object.keys(AREA_LABEL) as Area[]).map((area) => [area, list.filter((x) => x.mission.area === area)] as const).filter(([, items]) => items.length > 0);

  const finish = (id: string, xp: number) => {
    if (!complete(id)) return;
    // Read the store fresh: several taps can land before this render catches up.
    const doneNow = new Set(useCare.getState().done[dateKey()] ?? []);
    const finishedNow = list.filter((x) => doneNow.has(x.mission.id));
    setJustDone(id);
    const allNow = finishedNow.length === list.length;
    const xpNow = finishedNow.reduce((s, x) => s + x.mission.xp, 0);
    // A fresh key replays the entrance when a second mission lands while the note is still up.
    setEarned((prev) => ({ key: (prev?.key ?? 0) + 1, xp, allDone: allNow, xpToday: xpNow }));
  };

  const add = (id: string, title: string) => {
    togglePicked(id);
    setAdded(title);
  };

  return (
    <div className="stagger space-y-8">
      {/* Today at a glance: progress first, then streak and level. */}
      <section aria-labelledby="today-title" className="rounded-card border border-hairline bg-bg">
        <div className="grid sm:grid-cols-[1fr_auto]">
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="today-title" className="text-2xl font-bold tracking-tight">
                  {allDone ? (
                    "ครบทุกภารกิจวันนี้แล้ว"
                  ) : (
                    <>
                      สำเร็จ <span className="tabular-nums">{count}</span>
                      <span className="text-muted"> จาก {list.length} ภารกิจ</span>
                    </>
                  )}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  วันนี้ได้แล้ว <span className="font-semibold tabular-nums text-ink">{xpToday} XP</span>
                  {xpLeft > 0 && <> · เหลือให้เก็บอีก {xpLeft} XP</>}
                </p>
              </div>
              {allDone && <CatFace mood="happy" className="size-14 shrink-0" />}
            </div>
            <ol className="mt-5 flex gap-1.5" aria-label={`ความคืบหน้าวันนี้ ${count} จาก ${list.length} ภารกิจ`}>
              {list.map(({ mission: m }, i) => (
                <li key={m.id} className={`h-2 flex-1 rounded-full transition-colors duration-500 ${i < count ? "bg-accent" : "bg-surface-2"}`} />
              ))}
            </ol>
          </div>

          <dl className="grid grid-cols-2 border-t border-hairline sm:w-72 sm:border-l sm:border-t-0">
            <div className="p-5 sm:p-6">
              <dt className="text-sm text-muted">ทำต่อเนื่อง</dt>
              <dd className="mt-1 flex items-center gap-1.5 text-2xl font-bold tabular-nums">
                <Flame className={`size-6 ${streak > 0 ? "text-orange-500" : "text-muted"}`} aria-hidden="true" />
                {streak} <span className="text-base font-medium text-muted">วัน</span>
              </dd>
            </div>
            <div className="border-l border-hairline p-5 sm:p-6">
              <dt className="text-sm text-muted">เลเวล</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{level}</dd>
              <dd className="mt-2">
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-surface-2"
                  role="img"
                  aria-label={`${into} จาก ${XP_PER_LEVEL} XP สู่เลเวลถัดไป`}
                >
                  <div className="h-full rounded-full bg-ink transition-[width] duration-500" style={{ width: `${(into / XP_PER_LEVEL) * 100}%` }} />
                </div>
                <p className="mt-1.5 text-xs tabular-nums text-muted" aria-hidden="true">
                  {into}/{XP_PER_LEVEL} XP
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="space-y-6">
        <p className="text-sm text-muted">ทำจริงแล้วค่อยกดสำเร็จนะ กดแล้วยกเลิกไม่ได้ และภารกิจจะเริ่มใหม่ทุกวันตอนเที่ยงคืน</p>
        {groups.map(([area, items]) => {
          const doneHere = items.filter((x) => todayDone.has(x.mission.id)).length;
          return (
            <section key={area} aria-labelledby={`area-${area}`}>
              <div className="mb-2.5 flex items-baseline justify-between gap-3 px-1">
                <h2 id={`area-${area}`} className="text-sm font-semibold">
                  {AREA_LABEL[area]}
                </h2>
                <span className="text-xs tabular-nums text-muted">
                  {doneHere}/{items.length}
                </span>
              </div>
              <ul className="space-y-2">
                {items.map(({ mission: m, because, priority }) => {
                  const on = todayDone.has(m.id);
                  const own = because === "คุณเลือกเอง";
                  return (
                    <li
                      key={m.id}
                      className={`flex items-center gap-3 rounded-card border p-4 transition-colors duration-300 sm:gap-4 ${on ? "border-transparent bg-surface" : "border-hairline bg-bg"} ${
                        on && justDone === m.id ? SETTLE : ""
                      }`}
                    >
                      <AreaIcon area={m.area} />
                      <span className="min-w-0 flex-1">
                        <span className={`block font-semibold leading-snug ${on ? "text-muted line-through decoration-muted/60" : ""}`}>{m.title}</span>
                        {!on && <span className="mt-0.5 block text-sm leading-relaxed text-muted">{m.detail}</span>}
                        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                          {priority !== "good" && !on && <Badge level={priority}>{LEVEL_LABEL[priority]}</Badge>}
                          <span>{own ? because : `เพราะ ${because}`}</span>
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        {on ? (
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent-text">
                            <span className="grid size-8 place-items-center rounded-full bg-accent text-white">
                              <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                            </span>
                            <span>
                              +{m.xp} XP<span className="sr-only"> ทำสำเร็จแล้ว</span>
                            </span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => finish(m.id, m.xp)}
                            aria-label={`ทำ "${m.title}" สำเร็จ รับ ${m.xp} XP`}
                            className="pill min-h-11 whitespace-nowrap px-4 text-sm"
                          >
                            สำเร็จ +{m.xp} XP
                          </button>
                        )}
                        {own && !on && (
                          <button
                            type="button"
                            onClick={() => togglePicked(m.id)}
                            aria-label={`เอา "${m.title}" ออกจากภารกิจวันนี้`}
                            className="-mr-1 inline-flex min-h-9 items-center gap-1 rounded-full px-2 text-xs text-muted transition hover:text-ink"
                          >
                            <X className="size-3.5" aria-hidden="true" /> เอาออก
                          </button>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more-title" className="rounded-card border border-hairline bg-bg p-5 sm:p-6">
          <h2 id="more-title" className="font-semibold">
            เพิ่มภารกิจอื่น
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            อยากท้าทายตัวเองเพิ่ม เลือกได้ตามใจ หรือดูข้อมูลประกอบที่
            <Link href="/app/choice" className="text-ink underline decoration-hairline underline-offset-4 hover:decoration-ink/40">
              หน้าเปรียบเทียบทางเลือก
            </Link>
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {more.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => add(m.id, m.title)}
                  aria-label={`เพิ่ม "${m.title}" เป็นภารกิจวันนี้ ${m.xp} XP`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-bg py-1.5 pl-1.5 pr-3.5 text-left text-sm transition hover:border-ink/40 active:scale-[0.98]"
                >
                  <AreaIcon area={m.area} small />
                  <span>{m.title}</span>
                  <span className="whitespace-nowrap text-muted">+{m.xp}</span>
                  <Plus className="size-4 shrink-0 text-muted" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <p className={`text-sm text-accent-text ${added ? "mt-3" : ""}`} role="status">
            {added && (
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4" strokeWidth={2.5} aria-hidden="true" /> เพิ่ม &ldquo;{added}&rdquo; ในภารกิจวันนี้แล้ว
              </span>
            )}
          </p>
        </section>
      )}

      <Link href="/app/pet" className="lift group flex items-center justify-between gap-4 rounded-card bg-ink p-5 text-white">
        <span>
          <span className="block font-semibold">ใช้ XP ดูแลน้องแมว</span>
          <span className="block text-sm text-white/70">แลกอาหาร ของเล่น และที่นอนให้น้อง</span>
        </span>
        <ArrowRight className="size-5 shrink-0 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>

      {/* Reward note: floats above the bottom bar so it is seen wherever the mission was on the page. */}
      <div role="status" className="pointer-events-none fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom,0px)+5.25rem)] z-40 flex justify-center lg:inset-x-auto lg:bottom-8 lg:right-8">
        {earned && (
          <div
            key={earned.key}
            className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-card border border-hairline bg-bg p-3 pr-2 shadow-[0_2px_4px_rgb(11_11_15/0.05),0_18px_40px_rgb(11_11_15/0.14)] motion-safe:animate-[rise_420ms_cubic-bezier(0.16,1,0.3,1)_both]"
          >
            <CatFace mood="happy" className="size-12 shrink-0" />
            <p className="min-w-0 flex-1 text-sm leading-snug">
              <span className="block text-base font-bold text-accent-text">+{earned.xp} XP</span>
              {earned.allDone ? (
                <>
                  ครบทุกภารกิจแล้ว วันนี้ได้ {earned.xpToday} XP <span className="whitespace-nowrap">เก่งมาก!</span>
                </>
              ) : (
                "เก่งมาก! เอา XP ไปแลกของให้น้องแมวได้เลย"
              )}
            </p>
            <Link href="/app/pet" className="pill shrink-0 px-4 py-2 text-sm">
              ไปหาน้อง
            </Link>
            <button type="button" onClick={() => setEarned(null)} aria-label="ปิด" className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-ink">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MissionsPage() {
  return (
    <>
      <PageHead
        feature="missions"
        says={
          <>
            ทำทีละภารกิจ
            <br />
            เดี๋ยวเรารอรับ XP นะ
          </>
        }
        title="ภารกิจสุขภาพ"
        sub="Health Missions · ภารกิจประจำวันที่เลือกจากผลประเมินของคุณ ทำสำเร็จแล้วได้ XP ไปดูแลน้องแมว"
      />
      <NeedProfile what="รับภารกิจที่เหมาะกับคุณ">{(p) => <Missions p={p} />}</NeedProfile>
    </>
  );
}
