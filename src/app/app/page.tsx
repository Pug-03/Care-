"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Lightbulb } from "lucide-react";
import { Robot, RobotSays } from "@/components/Logo";
import { TrendChart } from "@/components/TrendChart";
import { FEATURE, Tile } from "@/components/theme";
import { Badge, btn, LEVEL_TONE, Ring } from "@/components/ui";
import { buildPlan, tipOfDay } from "@/lib/actions";
import { analyze, LEVEL_LABEL, OVERALL_LABEL, type Level } from "@/lib/health";
import { simulate, suggestedChanges } from "@/lib/simulate";
import { todayKey, useCare, useHydrated } from "@/lib/store";

function Stat({ label, value, level }: { label: string; value: string; level: Level | null }) {
  return (
    <div className="p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
      <p className={`mt-1 text-xs font-medium ${level ? LEVEL_TONE[level].text : "text-muted"}`}>{level ? LEVEL_LABEL[level] : "ยังไม่มีข้อมูล"}</p>
    </div>
  );
}

export default function Home() {
  const ready = useHydrated();
  const profile = useCare((s) => s.profile);
  const updatedAt = useCare((s) => s.updatedAt);
  const changes = useCare((s) => s.changes);
  const done = useCare((s) => s.done);

  if (!ready) return <div className="h-96 animate-pulse rounded-card bg-surface" />;

  const a = profile ? analyze(profile) : null;
  const sim = profile ? simulate(profile, changes ?? suggestedChanges(profile), 5) : null;
  const plan = profile && a ? buildPlan(profile, a) : [];
  const doneToday = (done[todayKey()] ?? []).filter((id) => plan.some((p) => p.id === id)).length;
  const lvl = (id: string) => a?.factors.find((f) => f.id === id)?.level ?? null;
  const date = new Date().toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" });
  const top = a?.factors.find((f) => f.level === "high");

  return (
    <div className="stagger space-y-6">
      <header className="flex items-end justify-between gap-6">
        <div>
          <p className="text-sm text-muted">{date}</p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.15] tracking-tight">
            สวัสดี{profile?.name ? ` ${profile.name}` : ""}
            <br />
            <span className="text-muted">วันนี้ดูแลตัวเองแล้วหรือยัง</span>
          </h1>
        </div>
        <RobotSays className="hidden md:flex" size="size-24">
          {!a ? "เริ่มจากประเมินสุขภาพ 3 นาทีกันครับ" : top ? `วันนี้ลองดูเรื่อง${top.label}กันนะครับ` : "ทุกอย่างดูดีมากครับ รักษาไว้นะ"}
        </RobotSays>
      </header>

      {/* Chat entry, styled as the input it leads to. */}
      <Link href={FEATURE.chat.href} className="lift group flex items-center gap-3 rounded-full border border-hairline bg-bg py-2 pl-2 pr-2.5 shadow-soft">
        <Robot className="size-11" />
        <span className="flex-1 truncate text-muted">เล่าอาการหรือพฤติกรรมให้น้อง CARE+ ฟังได้เลย…</span>
        <span className="pill size-11 shrink-0 p-0">
          <ArrowRight className="size-5" />
        </span>
      </Link>

      {!profile || !a || !sim ? (
        <section className="relative overflow-hidden rounded-card border border-hairline p-8 sm:p-10">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            ยังไม่รู้ว่าอนาคตเป็นอย่างไร
            <br />
            <span className="text-muted">ลองประเมินดูก่อน</span>
          </h2>
          <p className="mt-3 max-w-lg text-muted">
            ตอบคำถามเรื่องการนอน อาหาร การออกกำลังกาย และความเครียด แล้ว CARE+ จะวิเคราะห์และจำลองแนวโน้มสุขภาพ 10 ปีให้คุณ
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <Link href="/app/check" className="pill px-6 py-3">
              ประเมินสุขภาพ <ArrowRight className="size-4" />
            </Link>
            <Link href="/app/demo" className="text-sm font-semibold underline decoration-hairline decoration-2 underline-offset-8 hover:decoration-ink">
              ใช้ข้อมูลตัวอย่าง
            </Link>
          </div>
        </section>
      ) : (
        <section className="grid overflow-hidden rounded-card border border-hairline md:grid-cols-[0.8fr_1.2fr]">
          <Link href="/app/analysis" className="group flex flex-col gap-6 border-b border-hairline p-6 transition hover:bg-surface md:border-b-0 md:border-r">
            <div className="flex items-center justify-between">
              <p className="font-semibold">ความเสี่ยงโดยรวม</p>
              <ArrowUpRight className="size-5 text-muted transition group-hover:text-ink" />
            </div>
            <div className="flex items-center gap-5">
              <Ring value={a.overall} level={a.overallLevel} size={96} label="ความเสี่ยงโดยรวม" />
              <div>
                <p className={`text-2xl font-bold ${LEVEL_TONE[a.overallLevel].text}`}>{OVERALL_LABEL[a.overallLevel]}</p>
                <p className="mt-1 text-sm text-muted">{a.factors.filter((f) => f.level !== "good").length} เรื่องที่ควรใส่ใจ</p>
              </div>
            </div>
            <ul className="space-y-2 border-t border-hairline pt-4 text-sm">
              {a.factors
                .filter((f) => f.level === "high")
                .slice(0, 3)
                .map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-3">
                    <span className="truncate">{f.label}</span>
                    <span className="shrink-0 tabular-nums text-muted">{f.value}</span>
                  </li>
                ))}
            </ul>
          </Link>
          <Link href="/app/simulate" className="group p-6 transition hover:bg-surface">
            <div className="flex items-center justify-between">
              <p className="font-semibold">อีก 5 ปีข้างหน้า</p>
              <ArrowUpRight className="size-5 text-muted transition group-hover:text-ink" />
            </div>
            <TrendChart current={sim.current} improved={sim.improved} className="mt-2" />
          </Link>
        </section>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {(["analysis", "simulate", "plan", "care"] as const).map((k) => {
          const f = FEATURE[k];
          return (
            <Link key={k} href={f.href} className="lift group flex items-center gap-4 rounded-card border border-hairline bg-bg p-5">
              <Tile feature={k} />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{f.title}</span>
                <span className="block truncate text-sm text-muted">{f.body}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
            </Link>
          );
        })}
      </div>

      <section className="rounded-card border border-hairline">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <h2 className="font-semibold">ภาพรวมสุขภาพของคุณ</h2>
          <p className="text-xs text-muted">
            {updatedAt ? `อัปเดต ${new Date(updatedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}` : "ยังไม่ได้บันทึก"}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 [&>*]:border-hairline [&>*:nth-child(-n+2)]:border-b md:[&>*:nth-child(-n+2)]:border-b-0 [&>*:nth-child(odd)]:border-r md:[&>*:not(:last-child)]:border-r">
          <Stat label="ความเครียด" value={profile ? `${profile.stress}/10` : "–"} level={lvl("stress")} />
          <Stat label="การนอนหลับ" value={profile ? `${profile.sleepHours} ชม.` : "–"} level={lvl("sleepHours")} />
          <Stat label="ความดัน" value={profile?.systolic ? `${profile.systolic}/${profile.diastolic}` : "–"} level={a?.bpLevel ?? null} />
          <Stat label="BMI" value={a ? a.bmi.toFixed(1) : "–"} level={a?.bmiLevel ?? null} />
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-[1.1fr_1fr]">
        {plan.length > 0 ? (
          <Link href="/app/plan" className="lift block rounded-card border border-hairline bg-bg p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold">เป้าหมายวันนี้</h2>
                <p className="text-sm text-muted">
                  ทำแล้ว {doneToday} จาก {plan.length} ข้อ
                </p>
              </div>
              <Badge level={doneToday === plan.length ? "good" : "watch"}>{Math.round((doneToday / plan.length) * 100)}%</Badge>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="grow-x h-full rounded-full bg-ink" style={{ width: `${(doneToday / plan.length) * 100}%` }} />
            </div>
          </Link>
        ) : (
          <Link href="/app/check" className={`${btn.ghost} h-full rounded-card`}>
            กรอกข้อมูลเพื่อรับแผนรายวัน
          </Link>
        )}
        <section className="flex items-start gap-4 rounded-card bg-surface p-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100">
            <Lightbulb className="size-5" strokeWidth={1.8} />
          </span>
          <div>
            <p className="font-semibold">เคล็ดลับวันนี้</p>
            <p className="mt-0.5 text-sm leading-relaxed text-muted">{tipOfDay()}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
