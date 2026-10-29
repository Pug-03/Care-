"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Robot } from "@/components/Logo";
import { TrendChart } from "@/components/TrendChart";
import type { Behavior } from "@/lib/health";
import { LEVERS, PERSONAS } from "@/lib/personas";
import { simulate } from "@/lib/simulate";

gsap.registerPlugin(ScrollTrigger);

const YEARS = 10;
// A different person from the hero, with every habit switched on, so the two charts never disagree about the same case.
const PERSON = PERSONAS.find((p) => p.id === "office")!;
const CHANGES = LEVERS.reduce<Partial<Behavior>>((acc, l) => ({ ...acc, ...l.apply(PERSON.profile) }), {});
const sim = simulate(PERSON.profile, CHANGES, YEARS);

const STAGES = [
  { at: 0, title: "จุดเริ่มต้นเดียวกัน", body: "นั่งทำงานทั้งวัน กินเค็ม เครียดงาน ดื่มสุดสัปดาห์ ความดันเริ่มสูงนิดหน่อย แต่ยังรู้สึกปกติดี" },
  {
    at: 1.5,
    title: "ผลที่สะสมอย่างเงียบ ๆ",
    body: "น้ำหนักค่อย ๆ ขึ้น ความดันเริ่มสูง โดยที่ยังไม่รู้สึกอะไร ถ้าเริ่มปรับตั้งแต่ตอนนี้ ความเสี่ยงลดลงเร็วมาก",
  },
  { at: 4, title: "สองเส้นทางแยกกันชัดเจน", body: "ถ้ายังใช้ชีวิตแบบเดิม ความเสี่ยงเบาหวานและความดันสูงขึ้นต่อเนื่อง ส่วนอีกเส้นทางยังคงทรงตัวอยู่ในระดับต่ำ" },
  { at: 8, title: "ต่างกันแค่การตัดสินใจวันนี้", body: "สองเส้นทางห่างกันมาก ทั้งที่เริ่มจากจุดเดียวกัน ลองจำลองด้วยข้อมูลของคุณเองได้ใน CARE+" },
];

/**
 * Scroll-driven story: the section is several screens tall and its frame stays pinned (CSS sticky) while
 * scrolling moves time forward from today to ten years on. Under reduced motion it shows the end state.
 */
export function FutureJourney() {
  const root = useRef<HTMLElement>(null);
  const [p, setP] = useState(1);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      el.dataset.scrub = "";
      setP(0);
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => setP((old) => (Math.abs(old - self.progress) > 0.004 || self.progress === 1 || self.progress === 0 ? self.progress : old)),
      });
      return () => {
        st.kill();
        delete el.dataset.scrub;
        setP(1);
      };
    });
    return () => mm.revert();
  }, []);

  const t = p * YEARS;
  const i = Math.min(YEARS, Math.round(t));
  const stage = [...STAGES].reverse().find((s) => t >= s.at) ?? STAGES[0];
  const cur = sim.current[i];
  const imp = sim.improved[i];

  return (
    <section ref={root} aria-label="เดินทางสู่อนาคต" className="journey relative border-t border-hairline bg-bg">
      <div className="journey-frame relative isolate flex items-center overflow-hidden">
        <div className="grid-paper pointer-events-none absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-5 py-14 md:grid-cols-[0.9fr_1.1fr] md:gap-12">
          <div>
            <p className="text-[clamp(4rem,10vw,7.5rem)] font-bold leading-none tabular-nums tracking-tight">{i === 0 ? "วันนี้" : `ปีที่ ${i}`}</p>
            <div key={stage.title} className="rise mt-5 min-h-28">
              <p className="text-2xl font-bold">{stage.title}</p>
              <p className="mt-2 max-w-md leading-relaxed text-muted">{stage.body}</p>
            </div>
            <div className="mt-8 h-1 max-w-md overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
              <div className="h-full rounded-full bg-ink" style={{ width: `${p * 100}%` }} />
            </div>
            <p className="mt-3 text-sm text-muted">เลื่อนลงเพื่อเดินหน้าไปในอนาคต</p>
          </div>

          <div className="relative rounded-[1.75rem] border border-hairline bg-bg p-5 shadow-[0_24px_60px_rgb(11_11_15/0.10)] sm:p-7">
            <div
              className="pointer-events-none absolute -top-10 z-10 hidden transition-[left] duration-300 ease-out sm:block"
              style={{ left: `calc(${8 + p * 72}% - 2rem)` }}
              aria-hidden="true"
            >
              <Robot className="size-16 shadow-soft ring-4 ring-white sm:size-20" />
            </div>
            <p className="text-sm font-semibold">ตัวอย่าง: {PERSON.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">เส้นสีฟ้า: ถ้าปรับครบ {LEVERS.map((l) => l.label).join(" · ")}</p>
            <TrendChart current={sim.current} improved={sim.improved} progress={p} className="mt-3" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-surface p-4">
                <p className="text-xs text-muted">ถ้ายังใช้ชีวิตแบบเดิม</p>
                <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight">{cur.overall}%</p>
                <p className="text-xs tabular-nums text-muted">น้ำหนัก {cur.weightKg} กก.</p>
              </div>
              <div className="rounded-2xl bg-accent-soft p-4">
                <p className="text-xs text-muted">ถ้าเริ่มปรับวันนี้</p>
                <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight text-accent">{imp.overall}%</p>
                <p className="text-xs tabular-nums text-muted">น้ำหนัก {imp.weightKg} กก.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
