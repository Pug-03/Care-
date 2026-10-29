"use client";

import Link from "next/link";
import { ArrowRight, Beer, Brain, Cigarette, Droplet, Dumbbell, HeartPulse, Hospital, Info, Moon, Salad, Scale, Utensils, type LucideIcon } from "lucide-react";
import type { Factor } from "@/lib/health";
import { NeedProfile } from "@/components/NeedProfile";
import { FEATURE, Tile } from "@/components/theme";
import { Badge, Bar, btn, Card, Disclaimer, LEVEL_TONE, PageHead, Ring } from "@/components/ui";
import { analyze, LEVEL_LABEL, levelOfScore, OVERALL_LABEL, type Level } from "@/lib/health";
import { recommendMissions } from "@/lib/missions";

const RANK: Record<Level, number> = { high: 0, watch: 1, good: 2 };

const FACTOR_ICON: Record<Factor["id"], [LucideIcon, string]> = {
  bmi: [Scale, "bg-amber-100"],
  bp: [HeartPulse, "bg-rose-100"],
  sleepHours: [Moon, "bg-indigo-100"],
  exerciseDays: [Dumbbell, "bg-orange-100"],
  sweet: [Utensils, "bg-emerald-100"],
  salty: [Utensils, "bg-emerald-100"],
  fatty: [Utensils, "bg-emerald-100"],
  veggies: [Salad, "bg-lime-100"],
  water: [Droplet, "bg-sky-100"],
  stress: [Brain, "bg-yellow-100"],
  smoking: [Cigarette, "bg-slate-100"],
  alcohol: [Beer, "bg-fuchsia-100"],
};

export default function Result() {
  return (
    <>
      <PageHead
        feature="quiz"
        says={
          <>
            รู้จุดที่ควรใส่ใจแล้ว
            <br />
            ไปเริ่มทีละนิดด้วยกันนะ
          </>
        }
        title="ผลการประเมินเบื้องต้น"
        sub="ประมวลผลจากคำตอบของคุณด้วยเกณฑ์ที่กำหนดไว้ล่วงหน้า เพื่อให้เห็นปัจจัยเสี่ยงจากพฤติกรรมของตัวเอง"
      />
      <NeedProfile what="ดูผลประเมิน">
        {(p) => {
          const a = analyze(p);
          const factors = [...a.factors].sort((x, y) => RANK[x.level] - RANK[y.level]);
          const watch = factors.filter((f) => f.level !== "good").length;
          return (
            <div className="stagger space-y-6">
              <Card>
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
                      ตอนนี้คุณ<span className={LEVEL_TONE[a.overallLevel].text}>{OVERALL_LABEL[a.overallLevel]}</span>
                    </h2>
                    <p className="mt-2 text-muted">
                      พบ {watch} เรื่องที่ควรใส่ใจ จากข้อมูลทั้งหมด {factors.length} ด้าน
                    </p>
                  </div>
                  <Ring value={a.overall} level={a.overallLevel} size={88} label="ความเสี่ยงโดยรวม" />
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
                <h2 className="font-semibold">ระดับปัจจัยเสี่ยงต่อโรค NCDs</h2>
                <p className="text-sm text-muted">คะแนนเชิงสัมพัทธ์จากปัจจัยเสี่ยงที่คุณมี ไม่ใช่โอกาสเป็นโรคจริง ยิ่งสูงยิ่งควรใส่ใจ</p>
                <ul className="mt-5 space-y-4">
                  {a.conditions.map((c) => {
                    const lv = levelOfScore(c.score);
                    return (
                      <li key={c.id}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="font-medium">{c.label}</span>
                          <span className={`tabular-nums ${LEVEL_TONE[lv].text}`}>{c.score}/100</span>
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
                          <span className={`grid size-11 shrink-0 place-items-center rounded-xl text-ink ${grad}`} aria-hidden="true">
                            <Icon className="size-5" strokeWidth={1.8} />
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

              <section>
                <h2 className="mb-3 font-semibold">ขั้นต่อไป</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["choice", "missions"] as const).map((k) => (
                    <Link key={k} href={FEATURE[k].href} className="lift group flex items-center gap-4 rounded-card border border-hairline bg-bg p-5">
                      <Tile feature={k} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{FEATURE[k].title}</span>
                        <span className="block text-sm text-muted">{k === "choice" ? "ดูว่าแต่ละทางเลือกต่างกันอย่างไร" : `${recommendMissions(p, a).length} ภารกิจที่แนะนำจากผลประเมินนี้`}</span>
                      </span>
                      <ArrowRight className="size-5 text-accent-text transition group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </section>

              {!a.seeDoctor && (
                <p className="text-sm text-muted">
                  อยากตรวจสุขภาพประจำปี?{" "}
                  <Link href="/app/care" className="font-medium text-ink underline underline-offset-4">
                    ค้นหาสถานพยาบาลใกล้คุณ
                  </Link>
                </p>
              )}

              <div className="flex gap-3 rounded-2xl bg-surface p-4">
                <Info className="mt-0.5 size-4 shrink-0 text-muted" />
                <div className="space-y-2 text-xs leading-relaxed text-muted">
                  <p>
                    คะแนนคำนวณด้วยเกณฑ์ที่กำหนดไว้ล่วงหน้า จากปัจจัยเสี่ยงที่ WHO ระบุสำหรับ NCDs (อาหาร กิจกรรมทางกาย บุหรี่ แอลกอฮอล์ น้ำหนัก ความดัน) ร่วมกับการนอนและความเครียด ใช้เกณฑ์
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
