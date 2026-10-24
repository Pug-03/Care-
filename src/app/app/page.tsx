"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, HeartPulse, Lightbulb, Moon, Scale, Smile } from "lucide-react";
import { Robot } from "@/components/Logo";
import { FEATURE, METRIC } from "@/components/theme";
import { Badge, btn, LEVEL_TONE } from "@/components/ui";
import { buildPlan, tipOfDay } from "@/lib/actions";
import { analyze, LEVEL_LABEL, OVERALL_LABEL, type Level } from "@/lib/health";
import { todayKey, useCare, useHydrated } from "@/lib/store";

type Metric = keyof typeof METRIC;

function Stat({
  metric,
  icon: Icon,
  label,
  value,
  level,
  fill,
}: {
  metric: Metric;
  icon: typeof Moon;
  label: string;
  value: string;
  level: Level | null;
  fill: number;
}) {
  const m = METRIC[metric];
  return (
    <div className={`rounded-2xl p-4 ${m.soft}`}>
      <span className={`grid size-9 place-items-center rounded-full text-white ${m.solid}`}>
        <Icon className="size-[18px]" />
      </span>
      <p className="mt-3 text-sm font-medium">{label}</p>
      <p className={`text-lg font-semibold tabular-nums ${m.text}`}>{value}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/80">
        <div className={`grow-x h-full rounded-full ${m.bar}`} style={{ width: `${Math.max(6, Math.min(100, fill))}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-muted">{level ? LEVEL_LABEL[level] : "ยังไม่มีข้อมูล"}</p>
    </div>
  );
}

export default function Home() {
  const ready = useHydrated();
  const profile = useCare((s) => s.profile);
  const updatedAt = useCare((s) => s.updatedAt);
  const done = useCare((s) => s.done);

  if (!ready) return <div className="h-96 animate-pulse rounded-card bg-surface-2" />;

  const a = profile ? analyze(profile) : null;
  const plan = profile && a ? buildPlan(profile, a) : [];
  const doneToday = (done[todayKey()] ?? []).filter((id) => plan.some((p) => p.id === id)).length;
  const lvl = (id: string) => a?.factors.find((f) => f.id === id)?.level ?? null;
  const chat = FEATURE.chat;

  return (
    <div className="stagger space-y-5">
      {/* Banner */}
      <section className="rise relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-sky-100 via-blue-50 to-emerald-50 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted">สวัสดี{profile?.name ? ` ${profile.name}` : ""} 👋</p>
            <p className="mt-2 text-2xl font-bold leading-snug text-[#123a73] sm:text-3xl">
              “ทำให้คนเห็นผล
              <br />
              ของ<span className="text-blue-600">สุขภาพวันนี้</span>
              <br />
              เพื่อ<span className="text-blue-600">เริ่มเปลี่ยนแปลง</span>
              <br className="sm:hidden" /> ก่อนที่จะสายเกินไป”
            </p>
          </div>
          <div className="relative shrink-0">
            <p className="absolute -left-20 -top-2 hidden rotate-[-6deg] rounded-2xl border border-blue-200 bg-white px-3 py-1.5 text-xs text-blue-700 shadow-soft sm:block">
              สวัสดีครับ ผม CARE+
            </p>
            <Robot className="size-24 ring-8 ring-white/70 sm:size-32" priority />
          </div>
        </div>
      </section>

      {/* Risk summary or onboarding */}
      {!profile || !a ? (
        <section className="flex flex-col gap-4 rounded-card border border-blue-200/70 bg-bg p-5 shadow-soft sm:flex-row sm:items-center">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">เริ่มจากการประเมินสุขภาพ 3 นาที</h2>
            <p className="mt-1 text-sm text-muted">ตอบคำถามเรื่องการนอน อาหาร การออกกำลังกาย และความเครียด แล้ว CARE+ จะวิเคราะห์และจำลองแนวโน้มสุขภาพให้คุณ</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/app/check" className={btn.primary}>
              ประเมินสุขภาพ <ArrowRight className="size-4" />
            </Link>
            <Link href="/app/demo" className={btn.ghost}>
              ใช้ข้อมูลตัวอย่าง
            </Link>
          </div>
        </section>
      ) : (
        <Link
          href="/app/analysis"
          className={`flex items-center gap-4 rounded-card border p-5 shadow-soft lift ${LEVEL_TONE[a.overallLevel].bg} border-transparent`}
        >
          <span className={`grid size-12 shrink-0 place-items-center rounded-full bg-white ${LEVEL_TONE[a.overallLevel].text}`}>
            <HeartPulse className="size-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-muted">ความเสี่ยงโดยรวม</span>
            <span className={`block text-xl font-bold ${LEVEL_TONE[a.overallLevel].text}`}>
              {OVERALL_LABEL[a.overallLevel]} <span className="tabular-nums">({a.overall}%)</span>
            </span>
            <span className="block truncate text-sm text-muted">
              ควรใส่ใจ:{" "}
              {a.factors
                .filter((f) => f.level === "high")
                .map((f) => f.label)
                .join(", ") || "ไม่มีปัจจัยเสี่ยงสูง"}
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-muted" />
        </Link>
      )}

      {/* Chat */}
      <Link href={chat.href} className={`group flex items-center gap-4 rounded-card border p-5 shadow-soft lift ${chat.soft} ${chat.border}`}>
        <span className={`grid size-14 shrink-0 place-items-center rounded-full text-white shadow-soft ${chat.solid}`}>
          <chat.icon className="size-7" />
        </span>
        <span className="flex-1">
          <span className="block text-xl font-bold text-[#123a73]">{chat.title}</span>
          <span className="block text-sm text-muted">{chat.body}</span>
        </span>
        <ChevronRight className="size-5 text-blue-500 transition group-hover:translate-x-0.5" />
      </Link>

      {/* Feature tiles */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {(["analysis", "simulate", "plan", "care"] as const).map((k) => {
          const f = FEATURE[k];
          return (
            <Link
              key={k}
              href={f.href}
              className={`group flex flex-col gap-3 rounded-card border p-4 shadow-soft lift sm:flex-row sm:items-center sm:p-5 ${f.soft} ${f.border}`}
            >
              <span className={`grid size-12 shrink-0 place-items-center rounded-full text-white shadow-soft ${f.solid}`}>
                <f.icon className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2 font-bold text-[#123a73]">
                  {f.title} <ChevronRight className={`size-4 shrink-0 transition group-hover:translate-x-0.5 ${f.text}`} />
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted sm:text-sm">{f.body}</span>
              </span>
            </Link>
          );
        })}
      </div>

      {/* Overview */}
      <section className="rounded-card border border-hairline bg-bg p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold text-[#123a73]">ภาพรวมสุขภาพของคุณ</h2>
            <p className="text-xs text-muted">
              {updatedAt
                ? `อัปเดตล่าสุด ${new Date(updatedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}`
                : "ยังไม่ได้บันทึกข้อมูล"}
            </p>
          </div>
          <Link href="/app/analysis" className="inline-flex items-center gap-1 rounded-full border border-hairline px-3 py-1 text-xs text-muted hover:text-ink">
            ดูรายละเอียด <ChevronRight className="size-3.5" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat
            metric="stress"
            icon={Smile}
            label="ความเครียด"
            value={profile ? `${profile.stress}/10` : "–"}
            level={lvl("stress")}
            fill={profile ? 100 - profile.stress * 10 : 0}
          />
          <Stat
            metric="sleep"
            icon={Moon}
            label="การนอนหลับ"
            value={profile ? `${profile.sleepHours} ชม.` : "–"}
            level={lvl("sleepHours")}
            fill={profile ? (profile.sleepHours / 8) * 100 : 0}
          />
          <Stat
            metric="bp"
            icon={HeartPulse}
            label="ความดัน"
            value={profile?.systolic ? `${profile.systolic}/${profile.diastolic}` : "–"}
            level={a?.bpLevel ?? null}
            fill={profile?.systolic ? (profile.systolic / 160) * 100 : 0}
          />
          <Stat metric="bmi" icon={Scale} label="BMI" value={a ? a.bmi.toFixed(1) : "–"} level={a?.bmiLevel ?? null} fill={a ? (a.bmi / 35) * 100 : 0} />
        </div>
      </section>

      {plan.length > 0 && (
        <Link href="/app/plan" className="block rounded-card border border-orange-200/70 bg-gradient-to-br from-orange-50 to-amber-50 p-5 shadow-soft lift">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-[#123a73]">เป้าหมายวันนี้</h2>
              <p className="text-sm text-muted">
                ทำแล้ว {doneToday} จาก {plan.length} ข้อ
              </p>
            </div>
            <Badge level={doneToday === plan.length ? "good" : "watch"}>{Math.round((doneToday / plan.length) * 100)}%</Badge>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-[width]"
              style={{ width: `${(doneToday / plan.length) * 100}%` }}
            />
          </div>
        </Link>
      )}

      <section className="flex items-center gap-4 rounded-card border border-sky-200/70 bg-gradient-to-r from-sky-50 to-blue-50 p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white">
          <Lightbulb className="size-5" />
        </span>
        <div>
          <p className="font-bold text-[#123a73]">เคล็ดลับวันนี้</p>
          <p className="mt-0.5 text-sm text-muted">{tipOfDay()}</p>
        </div>
      </section>
    </div>
  );
}
