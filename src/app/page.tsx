import Link from "next/link";
import { ArrowRight, Brain, Check, CupSoda, Droplet, Footprints, HeartPulse, Moon, Salad, Scale, Smartphone, Wind, X, type LucideIcon } from "lucide-react";
import { AppIcon, Cat, CatForm, Logo } from "@/components/Logo";
import { ScrollFx } from "@/components/motion/ScrollFx";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { FEATURE, Tile, type FeatureKey } from "@/components/theme";
import { btn, Disclaimer } from "@/components/ui";
import { FORMS, type Form } from "@/lib/pet";

const STEPS: { key: FeatureKey; body: string }[] = [
  { key: "quiz", body: "ตอบคำถามพฤติกรรมสุขภาพ ระบบใช้เกณฑ์ที่กำหนดไว้ล่วงหน้า แสดงปัจจัยเสี่ยงเบื้องต้นของคุณ" },
  { key: "choice", body: "เทียบทางเลือกในการใช้ชีวิตแบบเห็นภาพ ด้วยข้อมูลสุขภาพที่มีแหล่งอ้างอิง" },
  { key: "missions", body: "เลือกภารกิจเล็ก ๆ ประจำวัน ทำสำเร็จแล้วรับ XP" },
  { key: "pet", body: "ใช้ XP แลกอาหารและไอเทม ดูแลแมวเสมือนจริงของคุณ" },
];

const COMPARE: [string, string][] = [
  ["ประเมินเสร็จแล้วจบ ไม่รู้ต้องทำอะไรต่อ", "ผลประเมินพาไปสู่ทางเลือกและภารกิจที่ทำได้จริง"],
  ["คำแนะนำลอย ๆ ไม่บอกที่มา", "เทียบทางเลือกด้วยข้อมูลที่มีแหล่งอ้างอิง"],
  ["ตั้งใจได้ไม่กี่วันก็เลิก", "XP และน้องแมวชวนให้กลับมาดูแลตัวเองทุกวัน"],
  ["บอกว่าคุณจะเป็นโรคอะไร", "ไม่วินิจฉัย ไม่ทำนายรายบุคคล ชี้แค่ปัจจัยเสี่ยงเบื้องต้น"],
];

const HABITS_A: [LucideIcon, string][] = [
  [Moon, "เข้านอนก่อน 23:00"],
  [Footprints, "เดินเร็ว 15 นาที"],
  [Salad, "ผักครึ่งจาน"],
  [Droplet, "น้ำเปล่า 8 แก้ว"],
  [CupSoda, "สั่งหวานน้อย"],
  [Wind, "หายใจช้า ๆ 5 นาที"],
];
const HABITS_B: [LucideIcon, string][] = [
  [HeartPulse, "วัดความดันเช้า–เย็น"],
  [Smartphone, "วางมือถือก่อนนอน 30 นาที"],
  [Brain, "พักสายตาทุกชั่วโมง"],
  [Scale, "ชั่งน้ำหนักและจดไว้"],
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
          <span className={`text-sm ${i % 4 === 1 ? "text-sky-300" : "text-accent-text"}`}>+XP</span>
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
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-3 px-5">
          <Logo />
          <nav className="hidden items-center gap-8 text-[15px] text-muted md:flex" aria-label="หลัก">
            <a href="#how" className="hover:text-ink">
              ใช้งานอย่างไร
            </a>
            <a href="#cats" className="hover:text-ink">
              น้องแมว
            </a>
            <a href="#why" className="hover:text-ink">
              ต่างจากแอปอื่น
            </a>
          </nav>
          <Link href="/app" className={`${btn.ghost} whitespace-nowrap px-3.5 py-1.5 text-[13px] sm:px-4 sm:py-2 sm:text-sm`}>
            เข้าสู่แอป
          </Link>
        </div>
      </header>

      <main id="main">
        {/* Hero: headline on the left, the app icon cat with the loop around it on the right. */}
        <section className="mx-auto grid max-w-6xl items-center gap-x-14 gap-y-16 px-5 pb-24 pt-12 md:grid-cols-[1fr_0.95fr] md:pt-20">
          <div className="rise">
            <h1 className="text-[clamp(2.75rem,7vw,5rem)] font-bold leading-[1.12] tracking-tight">
              ดูแลสุขภาพ
              <br />
              ไปกับ<Scribble>น้องแมว</Scribble>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted sm:text-xl">
              ประเมินความเสี่ยงสุขภาพเบื้องต้น เทียบทางเลือกด้วยข้อมูลที่มีแหล่งอ้างอิง ทำภารกิจเล็ก ๆ ทุกวัน แล้วเอา XP ไปเลี้ยงแมวของคุณ
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link href="/app/quiz" className="pill whitespace-nowrap px-6 py-3.5 text-base sm:px-8 sm:py-4 sm:text-lg">
                เริ่มทำแบบประเมิน <ArrowRight className="size-5" />
              </Link>
              <Link href="/app/demo" className="text-[15px] font-semibold underline decoration-hairline decoration-2 underline-offset-8 hover:decoration-ink">
                ดูตัวอย่าง
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted">3 นาที ไม่ต้องสมัครสมาชิก ข้อมูลอยู่ในเครื่องของคุณ</p>
          </div>
          <div className="rise relative mx-auto w-full max-w-md [animation-delay:150ms]" aria-hidden="true">
            <AppIcon priority className="float mx-auto h-auto w-[78%]" />
            <span className="absolute left-0 top-[8%] flex items-center gap-2 rounded-2xl border border-hairline bg-bg px-3.5 py-2.5 text-sm shadow-soft">
              <span className="grid size-6 place-items-center rounded-full bg-accent text-white">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              เดินเร็ว 15 นาที <b className="text-accent-text">+20 XP</b>
            </span>
            <span className="absolute -right-1 top-[46%] rounded-2xl border border-hairline bg-bg px-3.5 py-2.5 text-sm shadow-soft">
              ปลานึ่ง <b>20 XP</b> <span className="text-muted">อิ่มท้อง +40</span>
            </span>
            <span className="absolute bottom-[4%] left-[6%] rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-soft">ทำต่อเนื่อง 3 วัน</span>
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

        {/* How it works: the four components as one path, looping back to new missions. */}
        <section id="how" className="mx-auto max-w-6xl px-5 py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.15] tracking-tight">
              4 ขั้นตอน
              <br />
              <span className="text-muted">ที่เชื่อมกันเป็นวงจร</span>
            </h2>
            <Link href="/app" className={btn.ghost}>
              ลองใช้แอป <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-16" data-fx="steps">
            <ol className="relative grid gap-10 pl-10 md:grid-cols-4 md:gap-8 md:pl-0">
              <span data-fx-line className="absolute bottom-2 left-[1.375rem] top-2 w-0.5 origin-top bg-ink md:hidden" aria-hidden="true" />
              <span data-fx-line className="absolute left-0 right-0 top-[1.375rem] hidden h-0.5 origin-left bg-ink md:block" aria-hidden="true" />
              {STEPS.map((s, i) => (
                <li key={s.key} data-fx-item className="relative">
                  <span className="absolute -left-10 top-0 md:static">
                    <span className="relative z-10 block w-fit rounded-xl ring-8 ring-bg">
                      <Tile feature={s.key} />
                    </span>
                  </span>
                  <p className="text-sm font-medium text-muted md:mt-6">
                    {i + 1}. {FEATURE[s.key].en}
                  </p>
                  <h3 className="text-lg font-bold">{FEATURE[s.key].title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex items-center gap-4 md:pl-[50%]">
              <svg viewBox="0 0 120 40" className="h-10 w-28 shrink-0 text-accent" aria-hidden="true">
                <path
                  d="M116 4C116 30 80 36 40 32 20 30 8 24 4 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="5 6"
                />
                <path d="M1 22 4 13l9 4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-lg">
                แล้วกลับมาทำภารกิจใหม่ทุกวัน <span className="text-muted">ดูแลตัวเองต่อเนื่อง น้องแมวก็เติบโตไปด้วยกัน</span>
              </p>
            </div>
          </div>
        </section>

        {/* Mission band */}
        <section className="overflow-hidden border-y border-hairline py-16">
          <div className="space-y-4">
            <HabitRow items={HABITS_A} dir={1} />
            <HabitRow items={HABITS_B} dir={-1} />
          </div>
        </section>

        {/* The four cats */}
        <section id="cats" className="mx-auto max-w-6xl px-5 py-28">
          <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.15] tracking-tight">
            เลี้ยงแมว
            <br />
            <span className="text-muted">แต่ได้ดูแลตัวเอง</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">น้องแมวมี 4 ร่าง และจะเปลี่ยนไปตามพฤติกรรมสุขภาพของคุณ</p>
          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-fx="stagger">
            {(Object.keys(FORMS) as Form[]).map((k) => (
              <li key={k} data-fx-item className="flex flex-col rounded-card border border-hairline bg-bg p-5">
                <div className="grid h-48 place-items-center rounded-2xl bg-accent-soft/50">
                  <CatForm form={k} className="h-40 w-auto max-w-full" />
                </div>
                <p className="mt-5 text-sm font-semibold text-accent-text">{FORMS[k].name}</p>
                <h3 className="text-xl font-bold">{FORMS[k].nick}</h3>
                <p className="mt-2 text-[15px] leading-relaxed">“{FORMS[k].quote}”</p>
                <p className="mt-auto pt-4 text-sm text-muted">{FORMS[k].when}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Why */}
        <section id="why" className="border-t border-hairline bg-surface">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-28 md:grid-cols-[0.85fr_1.15fr]">
            <div>
              <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.15] tracking-tight">
                รู้ว่าควรดูแล
                <br />
                <span className="text-muted">แต่ไม่รู้จะเริ่มยังไง</span>
              </h2>
              <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted">
                CARE+ พาจาก <span className="font-semibold text-ink">ผลประเมิน</span> ไปสู่ <span className="font-semibold text-ink">สิ่งที่ทำได้วันนี้</span> และมีเพื่อนตัวน้อยคอยรอให้กลับมา
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
          <Cat className="float mx-auto size-28 ring-8 ring-white/10" />
          <p className="mx-auto mt-10 max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.2] tracking-tight">
            เริ่มดูแลตัวเองวันนี้
            <br />
            <span className="text-white/55">น้องแมวรออยู่นะ</span>
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            <Link href="/app/quiz" className="pill px-8 py-4 text-lg [--bg:var(--text)] [--text:#fff]">
              เริ่มทำแบบประเมิน <ArrowRight className="size-5" />
            </Link>
            <Link href="/app/demo" className="font-semibold text-white underline decoration-white/30 decoration-2 underline-offset-8 hover:decoration-white">
              ดูตัวอย่าง
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
    </>
  );
}
