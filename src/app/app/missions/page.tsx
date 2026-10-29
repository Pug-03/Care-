"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Brain, Check, ClipboardCheck, Cigarette, Flame, Footprints, Moon, Plus, Salad, X, type LucideIcon } from "lucide-react";
import { CatFace } from "@/components/Logo";
import { NeedProfile } from "@/components/NeedProfile";
import { Badge, Card, PageHead } from "@/components/ui";
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

function AreaIcon({ area }: { area: Area }) {
  const [Icon, tint] = AREA_STYLE[area];
  return (
    <span className={`grid size-12 shrink-0 place-items-center rounded-xl text-ink ${tint}`} aria-hidden="true">
      <Icon className="size-6" />
    </span>
  );
}

function Missions({ p }: { p: Profile }) {
  const done = useCare((s) => s.done);
  const picked = useCare((s) => s.picked);
  const xpTotal = useCare((s) => s.xpTotal);
  const complete = useCare((s) => s.complete);
  const togglePicked = useCare((s) => s.togglePicked);
  const [earned, setEarned] = useState<{ id: string; xp: number } | null>(null);
  const now = useNow();

  const list = dailyMissions(p, analyze(p), picked);
  const todayDone = new Set(done[dateKey(now)] ?? []);
  const count = list.filter((x) => todayDone.has(x.mission.id)).length;
  const xpToday = list.filter((x) => todayDone.has(x.mission.id)).reduce((s, x) => s + x.mission.xp, 0);
  const streak = streakOf(done, now);
  const { level, into } = levelOf(xpTotal);
  const inList = new Set(list.map((x) => x.mission.id));
  const more = MISSIONS.filter((m) => !inList.has(m.id) && m.when?.(p) !== false);
  const groups = (Object.keys(AREA_LABEL) as Area[]).map((area) => [area, list.filter((x) => x.mission.area === area)] as const).filter(([, items]) => items.length > 0);

  const finish = (id: string, xp: number) => {
    if (complete(id)) setEarned({ id, xp });
  };

  return (
    <div className="stagger space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr]">
        <Card>
          <h2 className="text-2xl font-bold tracking-tight">
            สำเร็จ <span className="tabular-nums">{count}</span>
            <span className="text-muted"> จาก {list.length} ภารกิจ</span>
          </h2>
          <p className="mt-1 text-sm text-muted">วันนี้ได้ไปแล้ว {xpToday} XP</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-ink transition-[width] duration-500" style={{ width: `${list.length ? (count / list.length) * 100 : 0}%` }} />
          </div>
        </Card>
        <Card className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted">ทำต่อเนื่อง</p>
            <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold tabular-nums">
              <Flame className={`size-6 ${streak > 0 ? "text-orange-500" : "text-muted"}`} aria-hidden="true" />
              {streak} <span className="text-base font-medium text-muted">วัน</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">เลเวล {level}</p>
            <p className="mt-1 text-sm tabular-nums">
              {into}/{XP_PER_LEVEL} XP
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-accent" style={{ width: `${(into / XP_PER_LEVEL) * 100}%` }} />
            </div>
          </div>
        </Card>
      </div>

      {earned && (
        <div role="status" className="flex items-center gap-4 rounded-card border border-accent/30 bg-accent-soft p-4">
          <CatFace mood="happy" className="size-14 shrink-0" />
          <p className="flex-1">
            <span className="font-semibold text-accent-text">+{earned.xp} XP</span> เก่งมาก! เอา XP ไปแลกของให้น้องแมวได้เลย
          </p>
          <Link href="/app/pet" className="pill shrink-0 px-4 py-2 text-sm">
            ไปหาน้อง
          </Link>
        </div>
      )}

      {groups.map(([area, items]) => (
        <section key={area}>
          <h2 className="mb-2 text-sm font-medium text-muted">{AREA_LABEL[area]}</h2>
          <ul className="space-y-2">
            {items.map(({ mission: m, because, priority }) => {
              const on = todayDone.has(m.id);
              const own = because === "คุณเลือกเอง";
              return (
                <li key={m.id} className={`flex items-center gap-4 rounded-card border p-4 ${on ? "border-ink/10 bg-surface" : "border-hairline bg-bg"}`}>
                  <AreaIcon area={m.area} />
                  <span className="min-w-0 flex-1">
                    <span className={`block font-medium ${on ? "text-muted line-through" : ""}`}>{m.title}</span>
                    <span className="mt-0.5 block text-sm text-muted">{m.detail}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                      {priority !== "good" && <Badge level={priority}>{LEVEL_LABEL[priority]}</Badge>}
                      {own ? because : `เพราะ ${because}`}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-2">
                    {on ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-white">
                        <Check className="size-4" strokeWidth={3} /> +{m.xp}
                      </span>
                    ) : (
                      <button type="button" onClick={() => finish(m.id, m.xp)} aria-label={`ทำ "${m.title}" สำเร็จ รับ ${m.xp} XP`} className="pill px-3.5 py-1.5 text-sm">
                        สำเร็จ +{m.xp} XP
                      </button>
                    )}
                    {own && !on && (
                      <button type="button" onClick={() => togglePicked(m.id)} aria-label={`เอา "${m.title}" ออกจากภารกิจวันนี้`} className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink">
                        <X className="size-3.5" /> เอาออก
                      </button>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {more.length > 0 && (
        <Card>
          <h2 className="font-semibold">เพิ่มภารกิจอื่น</h2>
          <p className="text-sm text-muted">อยากท้าทายตัวเองเพิ่ม เลือกได้ตามใจ หรือดูข้อมูลประกอบที่หน้าเปรียบเทียบทางเลือก</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {more.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => togglePicked(m.id)}
                  aria-label={`เพิ่ม "${m.title}" เป็นภารกิจวันนี้ ${m.xp} XP`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3.5 py-2 text-sm transition hover:border-ink/40"
                >
                  <Plus className="size-3.5" /> {m.title} <span className="text-muted">+{m.xp}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="text-center text-xs text-muted">ภารกิจรีเซ็ตทุกวันตอนเที่ยงคืน กดสำเร็จเมื่อทำจริงแล้วเท่านั้นนะ ทำแล้วจะยกเลิกไม่ได้</p>

      <Link href="/app/pet" className="lift group flex items-center justify-between gap-4 rounded-card bg-ink p-5 text-white">
        <span>
          <span className="block font-semibold">ใช้ XP ดูแลน้องแมว</span>
          <span className="block text-sm text-white/70">แลกอาหาร ของเล่น และที่นอนให้น้อง</span>
        </span>
        <ArrowRight className="size-5 shrink-0 transition group-hover:translate-x-0.5" />
      </Link>
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
