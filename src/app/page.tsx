import Link from "next/link";
import { ArrowRight, Check, CupSoda, Droplet, Footprints, HeartPulse, Moon, Salad, Scale, Smartphone, Sun, Wind, X, type LucideIcon } from "lucide-react";
import { HeroLab } from "@/components/HeroLab";
import { Logo, Robot, RobotButton } from "@/components/Logo";
import { FutureJourney } from "@/components/motion/FutureJourney";
import { ScrollFx } from "@/components/motion/ScrollFx";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Tile, type FeatureKey } from "@/components/theme";
import { btn, Disclaimer } from "@/components/ui";

const STEPS: { key: FeatureKey; title: string; body: string }[] = [
  { key: "chat", title: "เล่าให้ AI ฟัง", body: "การนอน อาหาร การออกกำลังกาย ความเครียด AI ถามต่อจนข้อมูลครบ" },
  { key: "analysis", title: "เห็นปัจจัยเสี่ยง", body: "รู้ว่าพฤติกรรมไหนเพิ่มความเสี่ยงโรคไหน เรียงจากเรื่องที่ควรใส่ใจก่อน" },
  { key: "simulate", title: "เทียบสองอนาคต", body: "ถ้าใช้ชีวิตแบบเดิม กับ ถ้าเริ่มปรับวันนี้ ห่างกันแค่ไหนใน 1–10 ปี" },
  { key: "plan", title: "ทำทีละนิดทุกวัน", body: "เป้าหมายเล็กที่ทำได้จริง ติ๊กทุกวัน แล้ววิเคราะห์ซ้ำเพื่อดูผล" },
  { key: "care", title: "ถึงเวลาพบแพทย์", body: "เมื่อควรตรวจเพิ่ม หาสถานพยาบาลใกล้คุณตามสิทธิที่ใช้ได้" },
];

const COMPARE: [string, string][] = [
  ["บันทึกน้ำหนัก การนอน การออกกำลังกาย", "รวมข้อมูลสุขภาพและพฤติกรรมเพื่อวิเคราะห์เชิงลึก"],
  ["แสดงข้อมูลย้อนหลังหรือสถิติ", "จำลองแนวโน้มสุขภาพในอนาคต"],
  ["คำแนะนำแบบเดียวกันสำหรับทุกคน", "คำแนะนำเฉพาะตัว จากปัจจัยเสี่ยงของคุณเอง"],
  ["ผู้ใช้ต้องตีความข้อมูลเอง", "เห็นผลลัพธ์ของการเปลี่ยนพฤติกรรมทันที"],
];

const HABITS_A: [LucideIcon, string][] = [
  [Moon, "นอน 7 ชั่วโมง"],
  [Footprints, "เดินเร็ว 15 นาทีหลังมื้อเย็น"],
  [Salad, "ผักครึ่งจาน"],
  [Droplet, "น้ำเปล่า 8 แก้ว"],
  [CupSoda, "สั่งหวานน้อย"],
  [Wind, "หายใจ 4-7-8"],
];
const HABITS_B: [LucideIcon, string][] = [
  [HeartPulse, "วัดความดันเช้า–เย็น"],
  [Smartphone, "วางมือถือก่อนนอน 30 นาที"],
  [Sun, "แดดเช้า 10 นาที"],
  [Scale, "ชั่งน้ำหนักทุกสัปดาห์"],
  [Footprints, "ขึ้นบันไดแทนลิฟต์"],
  [Salad, "ต้ม นึ่ง แทนทอด"],
];

function HabitRow({ items, dir }: { items: [LucideIcon, string][]; dir: 1 | -1 }) {
  const doubled = [...items, ...items];
  return (
    <div className="flex w-max gap-3" data-fx="loop" data-dir={dir} aria-hidden="true">
      {doubled.map(([Icon, label], i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border px-5 py-3 text-lg font-semibold ${i % 4 === 1 ? "border-ink bg-ink text-white" : "border-hairline bg-bg"}`}
        >
          <Icon className={`size-5 ${i % 4 === 1 ? "text-sky-300" : "text-accent"}`} strokeWidth={2} />
          {label}
        </span>
      ))}
    </div>
  );
}

/** Blue hand-drawn stroke under a phrase; draws itself in once. */
function Scribble({ children }: { children: React.ReactNode }) {
  return (
    <span className="scribble">
      {children}
      <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
        <path d="M2 8.5C40 3.5 92 2.6 132 4.6c22 1.1 44 2.6 66 4.4" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" pathLength={1} />
      </svg>
    </span>
  );
}

export default function Landing() {
  return (
    <>
      <SmoothScroll />
      <ScrollFx />
      <header className="sticky top-[env(safe-area-inset-top,0px)] z-40 bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5">
          <Logo />
          <nav className="hidden items-center gap-8 text-[15px] text-muted md:flex" aria-label="หลัก">
            <a href="#future" className="hover:text-ink">
              จำลองอนาคต
            </a>
            <a href="#how" className="hover:text-ink">
              ใช้งานอย่างไร
            </a>
            <a href="#why" className="hover:text-ink">
              ต่างจากแอปอื่น
            </a>
          </nav>
          <Link href="/app" className={`${btn.ghost} px-4 py-2`}>
            เข้าสู่แอป
          </Link>
        </div>
      </header>

      <main id="main">
        {/* Hero: headline on the left, the working future chart on the right. */}
        <section className="mx-auto grid max-w-6xl items-center gap-x-14 gap-y-20 px-5 pb-24 pt-12 md:grid-cols-[1fr_1.05fr] md:pt-20">
          <div className="rise">
            <h1 className="text-[clamp(2.75rem,7vw,5rem)] font-bold leading-[1.12] tracking-tight">
              เห็นอนาคต
              <br />
              ก่อน<Scribble>สายเกินไป</Scribble>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted sm:text-xl">
              บอกพฤติกรรมวันนี้ แล้ว CARE+ จะวิเคราะห์ปัจจัยเสี่ยงโรคไม่ติดต่อเรื้อรัง และจำลองให้เห็นว่าอีก 10 ปีสุขภาพของคุณจะไปทางไหน
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link href="/app/check" className="pill px-8 py-4 text-lg">
                ประเมินสุขภาพฟรี <ArrowRight className="size-5" />
              </Link>
              <Link href="/app/demo" className="text-[15px] font-semibold underline decoration-hairline decoration-2 underline-offset-8 hover:decoration-ink">
                ดูผลตัวอย่าง
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted">3 นาที ไม่ต้องสมัครสมาชิก ข้อมูลอยู่ในเครื่องของคุณ</p>
          </div>
          <div className="rise [animation-delay:150ms]">
            <HeroLab />
          </div>
        </section>

        {/* Statement */}
        <section className="relative overflow-hidden border-t border-hairline px-5 py-28 text-center">
          <h2 className="text-[clamp(2.25rem,6vw,4.25rem)] font-bold leading-[1.15] tracking-tight">
            ผลของพฤติกรรม
            <br />
            <span className="text-muted">ไม่ได้มาในวันนี้</span>
          </h2>
          <p className="mx-auto mt-10 max-w-3xl text-xl leading-[1.9] text-muted sm:text-2xl">
            โรคไม่ติดต่อเรื้อรังเป็นสาเหตุการเสียชีวิตของคนไทย{" "}
            <strong className="text-ink">
              <span data-fx="countup">74</span>%
            </strong>{" "}
            หรือราว{" "}
            <strong className="text-ink">
              <span data-fx="countup">400,000</span> คน
            </strong>{" "}
            ต่อปี และทำให้ประเทศเสียหายราว{" "}
            <strong className="text-ink">
              <span data-fx="countup" data-decimals="1">
                1.6
              </span>{" "}
              ล้านล้านบาท
            </strong>{" "}
            ต่อปี ส่วนใหญ่เริ่มจากการนอน การกิน และการขยับในแต่ละวัน
          </p>
          <p className="mt-6 text-xs text-muted">ที่มา: WHO Thailand, NCDs Investment Case</p>
        </section>

        <div id="future">
          <FutureJourney />
        </div>

        {/* Habit band */}
        <section className="overflow-hidden border-y border-hairline py-16" aria-label="ตัวอย่างเป้าหมายเล็ก ๆ ที่ CARE+ แนะนำ">
          <div className="space-y-4">
            <HabitRow items={HABITS_A} dir={1} />
            <HabitRow items={HABITS_B} dir={-1} />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-5 py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.15] tracking-tight">
              จากข้อมูลสุขภาพ
              <br />
              <span className="text-muted">สู่สิ่งที่ทำได้จริง</span>
            </h2>
            <Link href="/app" className={btn.ghost}>
              ลองใช้แอป <ArrowRight className="size-4" />
            </Link>
          </div>
          <ol className="relative mt-14 grid gap-4 md:grid-cols-5" data-fx="steps">
            <span data-fx-line className="absolute left-0 right-0 top-[2.15rem] hidden h-px origin-left bg-ink/15 md:block" aria-hidden="true" />
            {STEPS.map((s, i) => (
              <li key={s.key} data-fx-item className="relative rounded-card border border-hairline bg-bg p-6">
                <div className="flex items-start justify-between">
                  <Tile feature={s.key} />
                  <span className="text-sm tabular-nums text-muted">0{i + 1}</span>
                </div>
                <h3 className="mt-8 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-center text-muted">
            แล้ววนกลับไปวิเคราะห์ซ้ำ <span className="text-ink">ไม่ใช่การประเมินครั้งเดียว แต่เป็นวงจรที่ติดตามคุณต่อเนื่อง</span>
          </p>
        </section>

        {/* Why */}
        <section id="why" className="border-t border-hairline bg-surface">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-28 md:grid-cols-[0.85fr_1.15fr]">
            <div>
              <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.15] tracking-tight">
                แอปทั่วไปบอกว่า
                <br />
                <span className="text-muted">วันนี้คุณเป็นอย่างไร</span>
              </h2>
              <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted">
                CARE+ บอกว่า <span className="font-semibold text-ink">อนาคตคุณจะเป็นอย่างไร</span> และสิ่งที่เปลี่ยนได้ตั้งแต่วันนี้
              </p>
            </div>
            <ul className="divide-y divide-hairline rounded-card border border-hairline bg-bg" data-fx="rows">
              {COMPARE.map(([a, b]) => (
                <li key={a} data-fx-item className="grid gap-3 p-6 sm:grid-cols-2 sm:gap-6">
                  <span className="flex items-start gap-2.5 text-muted">
                    <X className="mt-1 size-4 shrink-0" /> {a}
                  </span>
                  <span className="flex items-start gap-2.5 font-medium">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-white">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Close */}
        <section data-fx="sheet" className="relative overflow-hidden bg-ink px-5 py-28 text-center text-white">
          <Robot className="float mx-auto size-28 ring-8 ring-white/10" />
          <p className="mx-auto mt-10 max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.2] tracking-tight">
            ทำให้คนเห็นผลของสุขภาพวันนี้
            <br />
            <span className="text-white/55">เพื่อเริ่มเปลี่ยนแปลงก่อนที่จะสายเกินไป</span>
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            <Link href="/app/check" className="pill px-8 py-4 text-lg [--bg:var(--text)] [--text:#fff]">
              เริ่มประเมินสุขภาพ <ArrowRight className="size-5" />
            </Link>
            <Link href="/app/chat" className="font-semibold text-white underline decoration-white/30 decoration-2 underline-offset-8 hover:decoration-white">
              คุยกับน้อง CARE+
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 md:grid-cols-[auto_1fr] md:gap-16">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-muted">ทีม The Challengers · PSAT HealthHacks 2026</p>
          </div>
          <Disclaimer className="max-w-2xl md:justify-self-end" />
        </div>
      </footer>
      <RobotButton />
    </>
  );
}
