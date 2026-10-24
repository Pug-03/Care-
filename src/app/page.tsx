import Link from "next/link";
import { ArrowRight, Check, HeartPulse, Minus } from "lucide-react";
import { AppIcon, Logo, Robot } from "@/components/Logo";
import { FutureJourney } from "@/components/motion/FutureJourney";
import { ScrollFx } from "@/components/motion/ScrollFx";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { FEATURE, type FeatureKey } from "@/components/theme";
import { TrendChart } from "@/components/TrendChart";
import { btn, Disclaimer } from "@/components/ui";
import { SAMPLE_PROFILE } from "@/lib/health";
import { simulate, suggestedChanges } from "@/lib/simulate";

const FEATURES: { key: FeatureKey; body: string }[] = [
  { key: "chat", body: "เล่าอาการ การนอน อาหาร การออกกำลังกาย และความเครียดผ่านแชต AI ถามต่อเพื่อเก็บข้อมูลที่เกี่ยวข้อง" },
  { key: "analysis", body: "รวมข้อมูลสุขภาพและพฤติกรรม เพื่อระบุปัจจัยเสี่ยง NCDs พร้อมอธิบายว่าพฤติกรรมใดส่งผลอย่างไร" },
  { key: "simulate", body: "เปรียบเทียบ “ถ้ายังใช้พฤติกรรมเดิม” กับ “ถ้าเริ่มปรับพฤติกรรม” ให้เห็นผลของการเปลี่ยนแปลงชัดเจน" },
  { key: "plan", body: "เปลี่ยนคำว่า “ควรนอนให้มากขึ้น” เป็นเป้าหมายรายวันที่ทำได้ และติดตามผลต่อเนื่อง" },
  { key: "care", body: "ค้นหาสถานพยาบาลใกล้คุณ พร้อมระยะทาง เวลาเปิด บริการ และสิทธิการรักษาที่ใช้ได้" },
];

const COMPARE: [string, string][] = [
  ["บันทึกข้อมูลสุขภาพ เช่น น้ำหนัก การนอน", "รวบรวมข้อมูลสุขภาพและพฤติกรรมเพื่อวิเคราะห์เชิงลึก"],
  ["แสดงข้อมูลย้อนหลังหรือสถิติ", "จำลองแนวโน้มสุขภาพในอนาคต"],
  ["แสดงค่าข้อมูลทั่วไป", "วิเคราะห์ความสัมพันธ์ระหว่างพฤติกรรมกับความเสี่ยง NCDs"],
  ["คำแนะนำแบบเดียวกันสำหรับทุกคน", "คำแนะนำเฉพาะบุคคล"],
  ["ผู้ใช้ต้องตีความข้อมูลเอง", "เห็นผลลัพธ์จากการเปลี่ยนพฤติกรรม"],
];

const LOOP = ["วิเคราะห์", "แนะนำ", "ลงมือทำ", "เก็บข้อมูลใหม่", "วิเคราะห์ซ้ำ"];

const HABITS_A = ["😴 นอน 7 ชั่วโมง", "🚶 เดินเร็ว 15 นาที", "🥗 ผักครึ่งจาน", "💧 น้ำ 8 แก้ว", "🧋 หวานน้อย", "🧘 หายใจ 4-7-8", "🪜 ขึ้นบันได"];
const HABITS_B = [
  "🩺 วัดความดันเช้า-เย็น",
  "🍳 ต้ม นึ่ง แทนทอด",
  "📵 วางมือถือก่อนนอน",
  "🧂 ชิมก่อนปรุง",
  "☀️ แดดเช้า 10 นาที",
  "🚭 ลดบุหรี่",
  "⚖️ ชั่งน้ำหนักทุกสัปดาห์",
];

function HabitRow({ items, dir }: { items: string[]; dir: 1 | -1 }) {
  const doubled = [...items, ...items];
  return (
    <div className="flex w-max gap-3" data-fx="loop" data-dir={dir} aria-hidden="true">
      {doubled.map((h, i) => (
        <span key={i} className="whitespace-nowrap rounded-full border border-blue-100 bg-white px-5 py-2.5 text-base font-medium text-[#123a73] shadow-soft">
          {h}
        </span>
      ))}
    </div>
  );
}

export default function Landing() {
  const sim = simulate(SAMPLE_PROFILE, suggestedChanges(SAMPLE_PROFILE), 5);
  const cur = sim.current.at(-1)!.overall;
  const imp = sim.improved.at(-1)!.overall;

  return (
    <>
      <SmoothScroll />
      <ScrollFx />
      <header className="sticky top-[env(safe-area-inset-top,0px)] z-40 border-b border-hairline/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo tagline />
          <nav className="hidden items-center gap-7 text-sm text-muted md:flex" aria-label="หลัก">
            <a href="#problem" className="hover:text-ink">
              ปัญหา
            </a>
            <a href="#features" className="hover:text-ink">
              ฟีเจอร์
            </a>
            <a href="#why" className="hover:text-ink">
              ทำไมต้อง CARE+
            </a>
          </nav>
          <Link href="/app" className={btn.primary}>
            เริ่มประเมิน <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 md:grid-cols-[1.1fr_1fr] md:pt-20">
          <div
            className="pointer-events-none absolute -left-24 top-10 -z-10 size-72 rounded-full bg-sky-200/50 blur-3xl"
            data-fx="parallax"
            data-speed="60"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-10 bottom-0 -z-10 size-80 rounded-full bg-emerald-200/40 blur-3xl"
            data-fx="parallax"
            data-speed="-50"
            aria-hidden="true"
          />
          <div className="rise">
            <AppIcon className="float mb-4 size-28 drop-shadow-xl sm:size-32" priority />
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs text-blue-700">
              <HeartPulse className="size-3.5 text-accent-text" /> ระบบอัจฉริยะวิเคราะห์และจำลองแนวโน้มสุขภาพ
            </p>
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-[#123a73] sm:text-5xl md:text-6xl">
              เห็นสุขภาพ<span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">ในอนาคต</span>
              <br />
              ตั้งแต่วันนี้
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              CARE+ ใช้ AI ประเมินสุขภาพเบื้องต้นจากที่บ้าน วิเคราะห์ปัจจัยเสี่ยง และจำลองให้เห็นความเชื่อมโยงระหว่าง
              <span className="text-ink"> “พฤติกรรมในวันนี้” </span>กับ<span className="text-ink"> “สุขภาพในอนาคต”</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app/check" className={`${btn.primary} px-6 py-3 text-base`}>
                ประเมินสุขภาพฟรี <ArrowRight className="size-4" />
              </Link>
              <Link href="/app/demo" className={`${btn.ghost} px-6 py-3 text-base`}>
                ดูตัวอย่างผลลัพธ์
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted">ใช้เวลาประมาณ 3 นาที · ไม่ต้องสมัครสมาชิก · ข้อมูลเก็บไว้ในเครื่องของคุณ</p>
          </div>

          <div
            data-tilt
            className="rise rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-[0_20px_60px_rgb(43_124_243/0.15)] [animation-delay:120ms] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted">จำลองอนาคต 5 ปี</p>
                <p className="mt-0.5 font-medium">ตัวอย่าง: นักศึกษา 27 ปี นอนน้อย กินหวาน ออกกำลังกายน้อย</p>
              </div>
            </div>
            <TrendChart current={sim.current} improved={sim.improved} className="mt-4" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-high-soft p-4">
                <p className="text-xs text-muted">ถ้ายังใช้ชีวิตแบบเดิม</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-high">{cur}%</p>
                <p className="text-xs text-muted">ความเสี่ยงโดยรวม</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs text-muted">ถ้าเริ่มปรับวันนี้</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-emerald-600">{imp}%</p>
                <p className="text-xs text-muted">ความเสี่ยงโดยรวม</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section id="problem" className="border-y border-blue-100 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <p className="text-sm font-medium text-accent-text">ปัญหาที่พบ</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-bold leading-snug tracking-tight text-[#123a73]">
              ผลของพฤติกรรมเสี่ยงไม่ได้ปรากฏทันที คนจึงยังไม่เห็นความสำคัญของการเปลี่ยนแปลงตั้งแต่เนิ่น ๆ
            </h2>
            <dl className="mt-10 grid gap-4 sm:grid-cols-3" data-fx="stagger">
              {(
                [
                  ["", "74", 0, "%", "ของการเสียชีวิตในประเทศไทยมีสาเหตุจาก NCDs"],
                  ["~", "400,000", 0, "", "คนต่อปี เสียชีวิตจากโรคไม่ติดต่อเรื้อรัง"],
                  ["", "1.6", 1, " ล้านล้าน", "บาทต่อปี ความสูญเสียทางเศรษฐกิจ ราว 9.7% ของ GDP (2019)"],
                ] as const
              ).map(([pre, n, dec, suf, l]) => (
                <div key={n} data-fx-item className="rounded-card bg-gradient-to-br from-sky-50 to-blue-100/60 p-6">
                  <dt className="text-4xl font-bold tracking-tight tabular-nums text-blue-700">
                    {pre}
                    <span data-fx="countup" data-decimals={dec}>
                      {n}
                    </span>
                    {suf}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted">{l}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-muted">แหล่งอ้างอิง: WHO Thailand, NCDs Investment Case</p>

            <div className="mt-14 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center" data-fx="stagger">
              <div data-fx-item className="rounded-card border border-rose-100 bg-rose-50 p-6">
                <p className="text-sm text-muted">สิ่งที่คนส่วนใหญ่มี</p>
                <p className="mt-1 text-xl font-medium">“รู้ว่าควรดูแลสุขภาพ”</p>
              </div>
              <div data-fx-item className="flex items-center justify-center text-sm text-muted">
                <span className="hidden h-px w-10 bg-hairline md:block" />
                <span className="px-3">ช่องว่าง</span>
                <span className="hidden h-px w-10 bg-hairline md:block" />
              </div>
              <div data-fx-item className="rounded-card border border-emerald-200 bg-emerald-50 p-6">
                <p className="text-sm text-muted">สิ่งที่ CARE+ ช่วยให้เกิด</p>
                <p className="mt-1 text-xl font-medium">“เห็นความสำคัญ และลงมือเปลี่ยน”</p>
              </div>
            </div>
          </div>
        </section>

        <FutureJourney />

        {/* Habit band */}
        <section className="overflow-hidden py-14" aria-label="ตัวอย่างพฤติกรรมเล็ก ๆ ที่ CARE+ แนะนำ">
          <p className="mx-auto mb-6 max-w-6xl px-5 text-center text-sm font-medium text-orange-600">เปลี่ยนทีละนิด ทำได้จริงทุกวัน</p>
          <div className="space-y-3">
            <HabitRow items={HABITS_A} dir={1} />
            <HabitRow items={HABITS_B} dir={-1} />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-5 py-20">
          <p className="text-sm font-medium text-accent-text">5 ฟีเจอร์หลัก</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-[#123a73]">จากข้อมูลสุขภาพ สู่การเปลี่ยนพฤติกรรม</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-fx="fan">
            {FEATURES.map(({ key, body }, i) => {
              const f = FEATURE[key];
              return (
                <article key={key} data-fx-item data-tilt className={`rounded-card border p-6 shadow-soft ${f.soft} ${f.border}`}>
                  <div className="flex items-center justify-between">
                    <span className={`grid size-12 place-items-center rounded-full text-white shadow-soft ${f.solid}`}>
                      <f.icon className="size-6" />
                    </span>
                    <span className={`text-sm font-medium tabular-nums ${f.text}`}>0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#123a73]">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
                </article>
              );
            })}
            <article
              data-fx-item
              data-tilt
              className="flex flex-col justify-between rounded-card bg-gradient-to-br from-sky-500 to-blue-700 p-6 text-white shadow-soft"
            >
              <p className="text-lg font-semibold leading-snug">ไม่ใช่การวิเคราะห์ครั้งเดียว แต่เป็นวงจรที่ติดตามคุณต่อเนื่อง</p>
              <ol className="relative mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm" data-fx="steps">
                <span data-fx-line className="absolute -bottom-3 left-0 h-0.5 w-full origin-left rounded-full bg-white/60" aria-hidden="true" />
                {LOOP.map((s, i) => (
                  <li key={s} data-fx-item className="flex items-center gap-2">
                    <span className="rounded-full bg-white/20 px-3 py-1">{s}</span>
                    {i < LOOP.length - 1 && <ArrowRight className="size-3.5 opacity-70" />}
                  </li>
                ))}
              </ol>
            </article>
          </div>
        </section>

        {/* Why */}
        <section id="why" className="border-t border-blue-100 bg-gradient-to-b from-white to-blue-50/60">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <p className="text-sm font-medium text-accent-text">ทำไมต้อง CARE+</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-bold leading-snug tracking-tight text-[#123a73]">
              แอปสุขภาพทั่วไปช่วยให้ <span className="whitespace-nowrap">“รู้ข้อมูล”</span> CARE+ ช่วยให้{" "}
              <span className="whitespace-nowrap">“เข้าใจผลกระทบ</span> <span className="whitespace-nowrap">เห็นอนาคต</span>{" "}
              <span className="whitespace-nowrap">และลงมือเปลี่ยน”</span>
            </h2>
            <div className="mt-10 overflow-x-auto rounded-card border border-blue-100 bg-white shadow-soft">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-hairline">
                    <th scope="col" className="p-4 font-medium text-muted sm:p-5">
                      แอปที่มีอยู่แล้ว
                    </th>
                    <th scope="col" className="p-4 font-semibold sm:p-5">
                      CARE<span className="text-accent-text">+</span>
                    </th>
                  </tr>
                </thead>
                <tbody data-fx="rows">
                  {COMPARE.map(([a, b]) => (
                    <tr key={a} data-fx-item className="border-b border-hairline last:border-0">
                      <td className="p-4 text-muted sm:p-5">
                        <span className="inline-flex items-start gap-2">
                          <Minus className="mt-0.5 size-4 shrink-0" /> {a}
                        </span>
                      </td>
                      <td className="p-4 sm:p-5">
                        <span className="inline-flex items-start gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" /> {b}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section
          data-fx="sheet"
          className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 px-5 py-24 text-center text-white"
        >
          <div
            className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-white/10 blur-2xl"
            data-fx="parallax"
            data-speed="40"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -right-10 size-80 rounded-full bg-emerald-300/20 blur-2xl"
            data-fx="parallax"
            data-speed="-40"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-4xl">
            <Robot className="float mx-auto mb-6 size-24 ring-8 ring-white/20" />
            <p className="text-3xl font-bold leading-snug tracking-tight sm:text-4xl">
              “ทำให้คนเห็นผลของสุขภาพวันนี้
              <br className="hidden sm:block" /> เพื่อเริ่มเปลี่ยนแปลงก่อนที่จะสายเกินไป”
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/app/check"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-medium text-blue-700 shadow-soft transition hover:scale-[1.03]"
              >
                เริ่มประเมินสุขภาพ <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/app/chat"
                className="inline-flex items-center gap-2 rounded-full border border-white/50 px-6 py-3 text-base font-medium text-white transition hover:bg-white/10"
              >
                คุยกับ AI
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-blue-100 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 md:grid-cols-[auto_1fr] md:gap-16">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-muted">
              ทีม The Challengers · PSAT HealthHacks <span className="editorial-italic">2026</span>
            </p>
          </div>
          <Disclaimer className="max-w-2xl md:justify-self-end" />
        </div>
      </footer>
    </>
  );
}
