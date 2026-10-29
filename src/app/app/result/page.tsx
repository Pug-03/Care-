"use client";

import Link from "next/link";
import { ArrowRight, Beer, Brain, Cigarette, Droplet, Dumbbell, HeartPulse, Hospital, Info, Moon, Salad, Scale, Utensils, type LucideIcon } from "lucide-react";
import type { Factor } from "@/lib/health";
import { NeedProfile } from "@/components/NeedProfile";
import { FEATURE, Tile } from "@/components/theme";
import { Bar, btn, Card, Disclaimer, LEVEL_TONE, PageHead, Ring } from "@/components/ui";
import { analyze, levelOfScore, type Level } from "@/lib/health";
import { recommendMissions } from "@/lib/missions";

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

/** Risk-factor level words: "found risk factors at a level", never "you have / you are". */
const DEGREE: Record<Level, string> = { high: "สูง", watch: "ปานกลาง", good: "ต่ำ" };

const GROUPS: { level: Level; title: string; sub: string }[] = [
  { level: "high", title: "ควรใส่ใจก่อน", sub: "พฤติกรรมที่เพิ่มความเสี่ยงชัดเจน เริ่มปรับจากกลุ่มนี้ได้ผลที่สุด" },
  { level: "watch", title: "ควรระวัง", sub: "ยังไม่ถึงเกณฑ์เสี่ยงสูง แต่ปรับอีกนิดจะดีขึ้น" },
  { level: "good", title: "ทำได้ดีแล้ว", sub: "รักษาไว้แบบนี้" },
];

function FactorIcon({ id }: { id: Factor["id"] }) {
  const [Icon, tile] = FACTOR_ICON[id];
  return (
    <span className={`grid size-11 shrink-0 place-items-center rounded-xl text-ink ${tile}`} aria-hidden="true">
      <Icon className="size-5" strokeWidth={1.8} />
    </span>
  );
}

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
          const by = (lv: Level) => a.factors.filter((f) => f.level === lv);
          const focus = [...by("high"), ...by("watch")].slice(0, 3);
          const missions = recommendMissions(p, a).length;
          return (
            <div className="stagger space-y-6">
              <Card>
                <div className="flex items-start justify-between gap-4 sm:gap-6">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold leading-snug tracking-tight text-balance sm:text-3xl">
                      {/* Thai has no spaces, so mark the only places a line may break. */}
                      <span className="whitespace-nowrap">พบปัจจัยเสี่ยง</span>
                      <wbr />
                      <span className="whitespace-nowrap">โดยรวม</span>
                      <wbr />
                      <span className={`whitespace-nowrap ${LEVEL_TONE[a.overallLevel].text}`}>ระดับ{DEGREE[a.overallLevel]}</span>
                    </h2>
                    <ul className="mt-3 flex flex-wrap gap-2 text-sm" aria-label="จำนวนปัจจัยแยกตามระดับ">
                      {GROUPS.map((g) => (
                        <li key={g.level} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium ${LEVEL_TONE[g.level].bg} ${LEVEL_TONE[g.level].text}`}>
                          {g.title} <span className="font-bold tabular-nums">{by(g.level).length}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex shrink-0 flex-col items-center gap-1.5">
                    <Ring value={a.overall} level={a.overallLevel} size={80} label="คะแนนปัจจัยเสี่ยงรวม" />
                    <p className="text-center text-xs leading-snug text-muted">
                      คะแนนรวม 0–100
                      <br />
                      ยิ่งน้อยยิ่งดี
                    </p>
                  </div>
                </div>

                {focus.length > 0 && (
                  <div className="mt-6 border-t border-hairline pt-5">
                    <h3 className="text-sm font-semibold">เริ่มจาก {focus.length} เรื่องนี้ก่อน</h3>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-3">
                      {focus.map((f) => (
                        <li key={f.id} className="flex items-center gap-3 rounded-2xl bg-surface p-2.5 sm:p-3">
                          <FactorIcon id={f.id} />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold leading-snug">{f.label}</span>
                            <span className="block text-xs tabular-nums text-muted">{f.value}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link href={FEATURE.choice.href} className={`${btn.primary} min-h-12 px-6`}>
                    ดูว่าเปลี่ยนแล้วต่างกันแค่ไหน <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                  <Link href={FEATURE.missions.href} className={`${btn.ghost} min-h-12`}>
                    เริ่ม {missions} ภารกิจที่แนะนำ
                  </Link>
                </div>
              </Card>

              {a.seeDoctor && (
                <section className="flex flex-col gap-4 rounded-card border border-high/30 bg-high-soft p-5 sm:flex-row sm:items-center sm:p-6" aria-labelledby="see-doctor">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-bg text-high" aria-hidden="true">
                    <Hospital className="size-5" />
                  </span>
                  <div className="flex-1">
                    <h2 id="see-doctor" className="font-semibold">
                      ควรตรวจเพิ่มเติมกับแพทย์
                    </h2>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-ink/75 marker:text-high">
                      {a.seeDoctorReasons.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <Link href="/app/care" className={`${btn.ghost} min-h-12 shrink-0`}>
                    ค้นหาสถานพยาบาล
                  </Link>
                </section>
              )}

              <Card>
                <h2 className="font-semibold">ปัจจัยที่พบ</h2>
                <p className="text-sm text-muted">จากคำตอบทั้งหมด {a.factors.length} ด้าน เรียงจากสิ่งที่ควรใส่ใจมากที่สุด</p>
                <div className="mt-2 space-y-2">
                  {GROUPS.filter((g) => by(g.level).length).map((g) => (
                    <section key={g.level} aria-labelledby={`grp-${g.level}`} className="pt-4">
                      <h3 id={`grp-${g.level}`} className="flex items-center gap-2 text-sm font-semibold">
                        <span className="size-2.5 rounded-full" style={{ background: LEVEL_TONE[g.level].stroke }} aria-hidden="true" />
                        <span className={LEVEL_TONE[g.level].text}>{g.title}</span>
                        <span className="font-normal text-muted">· {by(g.level).length} เรื่อง</span>
                      </h3>
                      <p className="mt-0.5 text-xs text-muted">{g.sub}</p>
                      <ul className="mt-1 divide-y divide-hairline">
                        {by(g.level).map((f) => (
                          <li key={f.id} className="flex items-start gap-4 py-3.5">
                            <FactorIcon id={f.id} />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                                <span className="font-medium">{f.label}</span>
                                <span className="text-sm tabular-nums text-muted">{f.value}</span>
                              </div>
                              <p className="mt-0.5 text-sm text-muted">{f.note}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="font-semibold">ปัจจัยเสี่ยงต่อโรค NCDs</h2>
                <p className="text-sm text-muted">คะแนนเชิงสัมพัทธ์จากปัจจัยเสี่ยงที่คุณมี ไม่ใช่โอกาสเป็นโรคจริง ยิ่งสูงยิ่งควรใส่ใจ</p>
                <ul className="mt-5 space-y-4">
                  {a.conditions.map((c) => {
                    const lv = levelOfScore(c.score);
                    return (
                      <li key={c.id}>
                        <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                          <span className="font-medium">{c.label}</span>
                          <span className={`shrink-0 tabular-nums ${LEVEL_TONE[lv].text}`}>
                            <span className="font-semibold">{c.score}</span>/100 · {DEGREE[lv]}
                          </span>
                        </div>
                        <Bar value={c.score} level={lv} />
                      </li>
                    );
                  })}
                </ul>
              </Card>

              <section aria-labelledby="next-steps">
                <h2 id="next-steps" className="font-semibold">
                  ขั้นต่อไป
                </h2>
                <p className="mb-3 text-sm text-muted">ดูข้อมูลเปรียบเทียบที่มีแหล่งอ้างอิง แล้วเลือกภารกิจเล็ก ๆ ไปทำ ได้ XP ไปดูแลน้องแมว</p>
                <ol className="grid gap-3 sm:grid-cols-2">
                  {(["choice", "missions"] as const).map((k) => (
                    <li key={k}>
                      <Link href={FEATURE[k].href} className="lift group flex h-full items-center gap-4 rounded-card border border-hairline bg-bg p-5">
                        <Tile feature={k} />
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold">{FEATURE[k].title}</span>
                          <span className="block text-sm text-muted">{k === "choice" ? "ดูว่าแต่ละทางเลือกต่างกันอย่างไร" : `${missions} ภารกิจที่แนะนำจากผลประเมินนี้`}</span>
                        </span>
                        <ArrowRight className="size-5 shrink-0 text-accent-text transition group-hover:translate-x-0.5" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ol>
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
                <Info className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
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
