"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Check, Info, Plus } from "lucide-react";
import { PageHead } from "@/components/ui";
import { CHOICES, type HealthChoice } from "@/lib/choices";
import { analyze } from "@/lib/health";
import { MISSION_BY_ID, recommendMissions } from "@/lib/missions";
import { useCare, useHydrated } from "@/lib/store";

function ChoiceCard({ c, mine, picked, recommended, onPick }: { c: HealthChoice; mine: boolean; picked: boolean; recommended: boolean; onPick: () => void }) {
  const mission = MISSION_BY_ID[c.mission];
  return (
    <article className="reveal overflow-hidden rounded-card border border-hairline bg-bg">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 pt-5 sm:px-6">
        <h2 className="text-lg font-bold">{c.topic}</h2>
        {mine && <span className="rounded-full bg-watch-soft px-2.5 py-0.5 text-xs font-medium text-watch">ตรงกับผลประเมินของคุณ</span>}
      </header>

      <div className="mt-4 grid sm:grid-cols-2">
        <section className="border-t border-hairline px-5 py-4 sm:px-6" aria-label={`ทางเลือก ก: ${c.a.label}`}>
          <p className="text-xs font-semibold text-muted">ทางเลือก ก</p>
          <h3 className="mt-0.5 font-semibold text-muted">{c.a.label}</h3>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted">
            {c.a.points.map((x) => (
              <li key={x} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted/50" aria-hidden="true" />
                {x}
              </li>
            ))}
          </ul>
        </section>
        <section className="border-t border-hairline bg-accent-soft/50 px-5 py-4 sm:border-l sm:px-6" aria-label={`ทางเลือก ข: ${c.b.label}`}>
          <p className="text-xs font-semibold text-accent-text">ทางเลือก ข</p>
          <h3 className="mt-0.5 font-semibold">{c.b.label}</h3>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
            {c.b.points.map((x) => (
              <li key={x} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={2.5} aria-hidden="true" />
                {x}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="flex flex-col gap-4 border-t border-hairline px-5 py-4 sm:flex-row sm:items-center sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{c.takeaway}</p>
          <ul className="mt-1.5 space-y-1">
            {c.sources.map((src) => (
              <li key={src.url}>
                <a href={src.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1.5 text-xs text-muted underline decoration-hairline underline-offset-4 hover:text-ink">
                  <BookOpen className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                  <span>ที่มา: {src.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        {mission && recommended ? (
          <Link href="/app/missions" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-accent-soft px-4 py-2.5 text-sm font-semibold text-accent-text">
            <Check className="size-4" /> อยู่ในภารกิจแนะนำแล้ว
          </Link>
        ) : mission && (
          <button
            type="button"
            onClick={onPick}
            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              picked ? "bg-ink text-white" : "border-[1.5px] border-ink hover:bg-ink hover:text-white"
            }`}
          >
            {picked ? <Check className="size-4" /> : <Plus className="size-4" />}
            {picked ? "เพิ่มเป็นภารกิจแล้ว" : `เลือกทาง ข · ${mission.title}`}
          </button>
        )}
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

      <div className="stagger space-y-5">
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

        {list.map((c) => (
          <ChoiceCard key={c.id} c={c} mine={isMine(c)} picked={ready && picked.includes(c.mission)} recommended={ready && recIds.has(c.mission)} onPick={() => togglePicked(c.mission)} />
        ))}

        <Link href="/app/missions" className="lift group flex items-center justify-between gap-4 rounded-card bg-ink p-5 text-white">
          <span>
            <span className="block font-semibold">ไปทำภารกิจวันนี้</span>
            <span className="block text-sm text-white/70">{pickedCount > 0 ? `คุณเลือกเพิ่มไว้ ${pickedCount} ภารกิจ` : "มีภารกิจที่แนะนำจากผลประเมินรออยู่"}</span>
          </span>
          <ArrowRight className="size-5 shrink-0 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </>
  );
}
