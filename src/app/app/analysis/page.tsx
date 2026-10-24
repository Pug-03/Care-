"use client";

import Link from "next/link";
import { ArrowRight, Beer, Brain, Cigarette, Droplet, Dumbbell, HeartPulse, Hospital, Info, Moon, Salad, Scale, Utensils, type LucideIcon } from "lucide-react";
import type { Factor } from "@/lib/health";
import { NeedProfile } from "@/components/NeedProfile";
import { Badge, Bar, btn, Card, Disclaimer, LEVEL_TONE, PageHead, Ring } from "@/components/ui";
import { analyze, LEVEL_LABEL, levelOfScore, OVERALL_LABEL, type Level } from "@/lib/health";

const RANK: Record<Level, number> = { high: 0, watch: 1, good: 2 };

const FACTOR_ICON: Record<Factor["id"], [LucideIcon, string]> = {
  bmi: [Scale, "from-amber-400 to-orange-500"],
  bp: [HeartPulse, "from-rose-400 to-pink-600"],
  sleepHours: [Moon, "from-indigo-400 to-violet-600"],
  exerciseDays: [Dumbbell, "from-orange-400 to-red-500"],
  sweet: [Utensils, "from-emerald-400 to-teal-600"],
  salty: [Utensils, "from-emerald-400 to-teal-600"],
  fatty: [Utensils, "from-emerald-400 to-teal-600"],
  veggies: [Salad, "from-lime-400 to-green-600"],
  water: [Droplet, "from-sky-400 to-blue-600"],
  stress: [Brain, "from-yellow-400 to-amber-500"],
  smoking: [Cigarette, "from-slate-400 to-slate-600"],
  alcohol: [Beer, "from-fuchsia-400 to-purple-600"],
};

export default function Analysis() {
  return (
    <>
      <PageHead
        feature="analysis"
        says={
          <>
            ดูแลตัวเองตั้งแต่วันนี้
            <br />
            เพื่ออนาคตที่ดีกว่านะครับ
          </>
        }
        eyebrow="Health Risk Analysis"
        title="AI วิเคราะห์"
        sub="วิเคราะห์ความเสี่ยงสุขภาพจากข้อมูลและพฤติกรรมของคุณ เพื่อให้เห็นว่าตอนนี้มีจุดใดที่ควรใส่ใจ"
      />
      <NeedProfile what="ดูผลวิเคราะห์">
        {(p) => {
          const a = analyze(p);
          const factors = [...a.factors].sort((x, y) => RANK[x.level] - RANK[y.level]);
          const watch = factors.filter((f) => f.level !== "good").length;
          return (
            <div className="stagger space-y-6">
              <Card className={`${LEVEL_TONE[a.overallLevel].bg} border-transparent`}>
                <div className="flex items-center gap-5">
                  <Ring value={a.overall} level={a.overallLevel} size={96} label="ความเสี่ยงโดยรวม" />
                  <div>
                    <p className="text-sm text-muted">ความเสี่ยงโดยรวม</p>
                    <p className={`text-2xl font-semibold ${LEVEL_TONE[a.overallLevel].text}`}>{OVERALL_LABEL[a.overallLevel]}</p>
                    <p className="mt-1 text-sm text-muted">
                      พบ {watch} ปัจจัยที่ควรใส่ใจ จากข้อมูลทั้งหมด {factors.length} ด้าน
                    </p>
                  </div>
                </div>
              </Card>

              {a.seeDoctor && (
                <div className="flex flex-col gap-4 rounded-card border border-high/30 bg-high-soft p-5 sm:flex-row sm:items-center">
                  <Hospital className="size-6 shrink-0 text-high" />
                  <div className="flex-1">
                    <p className="font-semibold">แนะนำให้พิจารณาพบแพทย์เพื่อตรวจเพิ่มเติม</p>
                    <ul className="mt-1 text-sm text-muted">
                      {a.seeDoctorReasons.map((r) => (
                        <li key={r}>• {r}</li>
                      ))}
                    </ul>
                  </div>
                  <Link href="/app/care" className={btn.primary}>
                    ค้นหาสถานพยาบาล
                  </Link>
                </div>
              )}

              <Card>
                <h2 className="font-semibold">แนวโน้มความเสี่ยงโรค NCDs</h2>
                <p className="text-sm text-muted">คะแนนเชิงสัมพัทธ์จากปัจจัยเสี่ยงที่คุณมี ยิ่งสูงยิ่งควรใส่ใจ</p>
                <ul className="mt-5 space-y-4">
                  {a.conditions.map((c) => {
                    const lv = levelOfScore(c.score);
                    return (
                      <li key={c.id}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="font-medium">{c.label}</span>
                          <span className={`tabular-nums ${LEVEL_TONE[lv].text}`}>{c.score}%</span>
                        </div>
                        <Bar value={c.score} level={lv} />
                      </li>
                    );
                  })}
                </ul>
              </Card>

              <Card>
                <h2 className="font-semibold">ปัจจัยที่พบและความเสี่ยง</h2>
                <p className="text-sm text-muted">เรียงจากสิ่งที่ควรใส่ใจมากที่สุด</p>
                <ul className="mt-4 divide-y divide-hairline">
                  {factors.map((f) => (
                    <li key={f.id} className="reveal flex items-center gap-4 py-3.5">
                      {(() => {
                        const [Icon, grad] = FACTOR_ICON[f.id];
                        return (
                          <span className={`grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br text-white ${grad}`} aria-hidden="true">
                            <Icon className="size-5" />
                          </span>
                        );
                      })()}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-medium">{f.label}</span>
                          <span className="text-sm tabular-nums text-muted">{f.value}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted">{f.note}</p>
                      </div>
                      <Badge level={f.level}>{LEVEL_LABEL[f.level]}</Badge>
                    </li>
                  ))}
                </ul>
              </Card>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/app/simulate"
                  className="group flex items-center justify-between rounded-card border border-hairline p-5 transition hover:border-accent/40 hover:shadow-soft"
                >
                  <span>
                    <span className="block font-medium">จำลองอนาคต</span>
                    <span className="block text-sm text-muted">ดูว่าถ้าไม่เปลี่ยน จะเป็นอย่างไร</span>
                  </span>
                  <ArrowRight className="size-5 text-accent-text transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/app/plan"
                  className="group flex items-center justify-between rounded-card border border-hairline p-5 transition hover:border-accent/40 hover:shadow-soft"
                >
                  <span>
                    <span className="block font-medium">แผนปรับพฤติกรรม</span>
                    <span className="block text-sm text-muted">เปลี่ยนผลวิเคราะห์เป็นสิ่งที่ทำได้จริง</span>
                  </span>
                  <ArrowRight className="size-5 text-accent-text transition group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="flex gap-3 rounded-2xl bg-surface p-4">
                <Info className="mt-0.5 size-4 shrink-0 text-muted" />
                <div className="space-y-2 text-xs leading-relaxed text-muted">
                  <p>
                    คะแนนคำนวณจากปัจจัยเสี่ยงที่ WHO ระบุสำหรับ NCDs (อาหาร กิจกรรมทางกาย บุหรี่ แอลกอฮอล์ น้ำหนัก ความดัน) ร่วมกับการนอนและความเครียด ใช้เกณฑ์
                    BMI สำหรับคนเอเชีย เป็นแบบจำลองเชิงสาธิตสำหรับต้นแบบ ยังไม่ผ่านการตรวจสอบทางคลินิก
                  </p>
                  <Disclaimer />
                </div>
              </div>
            </div>
          );
        }}
      </NeedProfile>
    </>
  );
}
