"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Robot } from "@/components/Logo";
import { TrendChart } from "@/components/TrendChart";
import { SAMPLE_PROFILE } from "@/lib/health";
import { simulate, suggestedChanges } from "@/lib/simulate";

gsap.registerPlugin(ScrollTrigger);

const YEARS = 10;
const sim = simulate(SAMPLE_PROFILE, suggestedChanges(SAMPLE_PROFILE), YEARS);

const STAGES = [
  { at: 0, title: "จุดเริ่มต้นเดียวกัน", body: "นอนวันละ 5 ชั่วโมงครึ่ง ชานมทุกวัน ออกกำลังกายสัปดาห์ละครั้ง ยังรู้สึกปกติดี" },
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
    <section ref={root} aria-label="เดินทางสู่อนาคต" className="journey relative bg-gradient-to-b from-white via-sky-50 to-white">
      <div className="journey-frame flex items-center">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-5 py-14 md:grid-cols-[0.9fr_1.1fr] md:gap-12">
          <div>
            <p className="text-sm font-medium text-emerald-600">เลื่อนลงเพื่อเดินทางสู่อนาคต</p>
            <p className="mt-3 text-6xl font-bold tabular-nums tracking-tight text-[#123a73] sm:text-7xl">{i === 0 ? "วันนี้" : `ปีที่ ${i}`}</p>
            <div key={stage.title} className="rise mt-5 min-h-28">
              <p className="text-xl font-bold text-[#123a73]">{stage.title}</p>
              <p className="mt-2 max-w-md leading-relaxed text-muted">{stage.body}</p>
            </div>
            <div className="mt-6 h-1.5 max-w-md overflow-hidden rounded-full bg-blue-100" aria-hidden="true">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-500" style={{ width: `${p * 100}%` }} />
            </div>
          </div>

          <div className="relative rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-[0_20px_60px_rgb(43_124_243/0.15)] sm:p-6">
            <div
              className="pointer-events-none absolute -top-10 z-10 hidden transition-[left] duration-300 ease-out sm:block"
              style={{ left: `calc(${8 + p * 72}% - 2rem)` }}
              aria-hidden="true"
            >
              <Robot className="size-16 shadow-soft ring-4 ring-white" />
            </div>
            <p className="text-sm text-muted">ตัวอย่าง: นักศึกษา 27 ปี</p>
            <TrendChart current={sim.current} improved={sim.improved} progress={p} className="mt-3" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-rose-50 p-4">
                <p className="text-xs text-muted">ถ้ายังใช้ชีวิตแบบเดิม</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-rose-600">{cur.overall}%</p>
                <p className="text-xs tabular-nums text-muted">น้ำหนัก {cur.weightKg} กก.</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs text-muted">ถ้าเริ่มปรับวันนี้</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-emerald-600">{imp.overall}%</p>
                <p className="text-xs tabular-nums text-muted">น้ำหนัก {imp.weightKg} กก.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
