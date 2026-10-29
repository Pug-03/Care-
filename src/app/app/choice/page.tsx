"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Check, Info, Plus } from "lucide-react";
import { PageHead } from "@/components/ui";
import { CHOICES, type HealthChoice } from "@/lib/choices";
import { analyze } from "@/lib/health";
import { MISSION_BY_ID, recommendMissions } from "@/lib/missions";
import { useCare, useHydrated } from "@/lib/store";

/** The mission that puts option B into practice, and whether it is already on today's list. */
function PickMission({ c, picked, recommended, onPick }: { c: HealthChoice; picked: boolean; recommended: boolean; onPick: () => void }) {
  const mission = MISSION_BY_ID[c.mission];
  if (!mission) return null;
  return (
    <div className="mt-5 rounded-2xl border border-accent/15 bg-bg p-3.5 sm:p-4">
      <p className="text-xs text-muted">ภารกิจที่ช่วยให้ทำทาง ข ได้จริง</p>
      <p className="mt-0.5 font-semibold leading-snug">
        {mission.title} <span className="whitespace-nowrap text-sm font-medium text-accent-text">+{mission.xp} XP</span>
      </p>
      {recommended ? (
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-accent-text">
            <Check className="size-4" strokeWidth={2.5} aria-hidden="true" /> อยู่ในภารกิจแนะนำของคุณแล้ว
          </span>
          <Link href="/app/missions" className="text-muted underline decoration-hairline underline-offset-4 hover:text-ink">
            ไปที่ภารกิจ
          </Link>
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={onPick}
            aria-pressed={picked}
            className={`mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition active:scale-[0.98] sm:w-auto ${
              picked ? "bg-ink text-white hover:bg-ink/85" : "border-[1.5px] border-ink bg-bg hover:bg-ink hover:text-white"
            }`}
          >
            {picked ? <Check className="size-4" strokeWidth={2.5} aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
            {picked ? "เพิ่มเป็นภารกิจแล้ว" : "เลือกทาง ข เป็นภารกิจ"}
          </button>
          {picked && <p className="mt-2 text-xs text-muted">แตะอีกครั้งเพื่อเอาออกจากภารกิจวันนี้</p>}
        </>
      )}
    </div>
  );
}

function ChoiceCard({ c, mine, picked, recommended, onPick }: { c: HealthChoice; mine: boolean; picked: boolean; recommended: boolean; onPick: () => void }) {
  return (
    <article id={`choice-${c.id}`} aria-labelledby={`choice-${c.id}-title`} className="reveal scroll-mt-6 overflow-hidden rounded-card border border-hairline bg-bg">
      <header className="px-5 pb-5 pt-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h2 id={`choice-${c.id}-title`} className="text-xl font-bold tracking-tight">
            {c.topic}
          </h2>
          {mine && <span className="rounded-full bg-watch-soft px-2.5 py-0.5 text-xs font-medium text-watch">ตรงกับผลประเมินของคุณ</span>}
        </div>
        <p className="mt-1 max-w-[62ch] text-pretty leading-relaxed">{c.takeaway}</p>
      </header>

      <div className="grid border-t border-hairline sm:grid-cols-2">
        <section className="px-5 pb-7 pt-5 sm:px-6 sm:pb-6" aria-label={`ทางเลือก ก: ${c.a.label}`}>
          <p className="text-xs font-semibold text-muted">ทางเลือก ก</p>
          <h3 className="mt-1 text-lg font-semibold leading-snug text-muted">{c.a.label}</h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
            {c.a.points.map((x) => (
              <li key={x} className="flex gap-2.5">
                <span className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-muted/50" aria-hidden="true" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="relative border-t border-hairline bg-accent-soft/60 px-5 pb-5 pt-7 sm:border-l sm:border-t-0 sm:px-6 sm:pt-5" aria-label={`ทางเลือก ข: ${c.b.label}`}>
          <span
            className="absolute left-1/2 top-0 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-hairline bg-bg text-xs font-medium text-muted sm:left-0 sm:top-9"
            aria-hidden="true"
          >
            หรือ
          </span>
          <p className="text-xs font-semibold text-accent-text">ทางเลือก ข</p>
          <h3 className="mt-1 text-lg font-bold leading-snug">{c.b.label}</h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed">
            {c.b.points.map((x) => (
              <li key={x} className="flex gap-2.5">
                <Check className="mt-[0.2rem] size-4 shrink-0 text-accent" strokeWidth={2.5} aria-hidden="true" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
          <PickMission c={c} picked={picked} recommended={recommended} onPick={onPick} />
        </section>
      </div>

      <footer className="border-t border-hairline px-5 py-3.5 sm:px-6">
        <h3 className="flex items-center gap-1.5 text-xs font-medium text-muted">
          <BookOpen className="size-3.5" aria-hidden="true" /> ที่มา
        </h3>
        <ul className="mt-1 space-y-1">
          {c.sources.map((src) => (
            <li key={src.url} className="text-xs leading-relaxed">
              <a href={src.url} target="_blank" rel="noreferrer" className="text-muted underline decoration-hairline underline-offset-4 transition hover:text-ink hover:decoration-ink/40">
                {src.name}
                <span className="sr-only"> (เปิดในแท็บใหม่)</span>
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
}

export default function ChoicePage() {
  const ready = useHydrated();
  const profile = useCare((s) => s.profile);
  const picked = useCare((s) => s.picked);
  const togglePicked = useCare((s) => s.togglePicked);

  const a = profile ? analyze(profile) : null;
  const watch = new Set(a ? a.factors.filter((f) => f.level !== "good").map((f) => f.id) : []);
  const recIds = new Set(profile && a ? recommendMissions(profile, a).map((r) => r.mission.id) : []);
  const isMine = (c: HealthChoice) => ready && c.factors.some((f) => watch.has(f));
  // Choices that match the quiz result come first; the rest keep their order.
  const list = [...CHOICES].sort((x, y) => Number(isMine(y)) - Number(isMine(x)));
  const mineCount = list.filter(isMine).length;
  const pickedCount = ready ? picked.length : 0;

  return (
    <>
      <PageHead
        feature="choice"
        title="เปรียบเทียบทางเลือก"
        sub="Health Choice · เทียบทางเลือกในการใช้ชีวิตแบบเห็นภาพ ด้วยข้อมูลสุขภาพที่มีแหล่งอ้างอิง แล้วเลือกทางที่อยากลองเป็นภารกิจ"
        says={
          <>
            ไม่ต้องเปลี่ยนทุกอย่าง
            <br />
            เลือกทีละเรื่องก็พอนะ
          </>
        }
      />

      <div className="stagger space-y-6">
        <div className="space-y-4">
          <nav aria-label="หัวข้อที่เปรียบเทียบ">
            <p className="text-sm text-muted">
              {list.length} หัวข้อ{mineCount > 0 && <> · {mineCount} หัวข้อตรงกับผลประเมินของคุณ อยู่ด้านบนสุด</>}
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {list.map((c) => (
                <li key={c.id}>
                  <a
                    href={`#choice-${c.id}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-hairline bg-bg px-3.5 text-sm transition hover:border-ink/40"
                  >
                    {isMine(c) && <span className="size-2 rounded-full bg-watch" aria-hidden="true" />}
                    {c.topic}
                    {isMine(c) && <span className="sr-only">(ตรงกับผลประเมินของคุณ)</span>}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex gap-3 rounded-2xl bg-surface p-4 text-sm leading-relaxed text-muted">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>
              ข้อมูลในหน้านี้เป็นคำแนะนำและผลการศึกษาในระดับประชากรจากแหล่งอ้างอิง ใช้ประกอบการตัดสินใจ ไม่ใช่การทำนายผลสุขภาพของคุณเป็นรายบุคคล
              {ready && !profile && (
                <>
                  {" "}
                  <Link href="/app/quiz" className="font-medium text-ink underline underline-offset-4">
                    ทำแบบประเมิน
                  </Link>{" "}
                  เพื่อดูว่าเรื่องไหนตรงกับคุณที่สุด
                </>
              )}
            </p>
          </div>
        </div>

        {list.map((c) => (
          <ChoiceCard key={c.id} c={c} mine={isMine(c)} picked={ready && picked.includes(c.mission)} recommended={ready && recIds.has(c.mission)} onPick={() => togglePicked(c.mission)} />
        ))}

        <Link href="/app/missions" className="lift group flex items-center justify-between gap-4 rounded-card bg-ink p-5 text-white">
          <span>
            <span className="block font-semibold">ไปทำภารกิจวันนี้</span>
            <span className="block text-sm text-white/70">{pickedCount > 0 ? `คุณเลือกเพิ่มไว้ ${pickedCount} ภารกิจ` : "มีภารกิจที่แนะนำจากผลประเมินรออยู่"}</span>
          </span>
          <ArrowRight className="size-5 shrink-0 transition group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </>
  );
}
