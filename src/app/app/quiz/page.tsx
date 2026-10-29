"use client";

import { useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CircleAlert } from "lucide-react";
import { btn, PageHead } from "@/components/ui";
import { bmiOf, FREQ_LABEL, type Freq, type Profile, type Smoking } from "@/lib/health";
import { useCare, useHydrated } from "@/lib/store";

const EMPTY: Profile = {
  name: "",
  age: 25,
  sex: "female",
  heightCm: 160,
  weightKg: 55,
  sleepHours: 7,
  exerciseDays: 2,
  sweet: 1,
  salty: 1,
  fatty: 1,
  veggies: 3,
  stress: 5,
  smoking: "never",
  alcohol: 0,
  water: 6,
  family: { diabetes: false, hypertension: false, heart: false },
};

const STEPS = ["ข้อมูลพื้นฐาน", "การกินและการนอน", "ความเครียดและพฤติกรรมเสี่ยง"];
/** Short names for the step tracker, so all three fit side by side on a phone. */
const STEP_SHORT = ["ร่างกาย", "กินและนอน", "ความเครียด"];

type Ids = { input: string; label: string; describedBy?: string };

/**
 * One question: label on the left, the live answer on the right, hint under the label, error under the control.
 * `children` gets the ids so each control can point at its own label, hint and error.
 */
function Field({
  label,
  hint,
  value,
  error,
  group,
  children,
}: {
  label: string;
  hint?: string;
  value?: ReactNode;
  error?: string;
  /** Radio or checkbox sets: the wrapper becomes the labelled group instead of a <label for>. */
  group?: "radiogroup" | "group";
  children: (ids: Ids) => ReactNode;
}) {
  const id = useId();
  const ids = { input: `${id}-in`, label: `${id}-label`, hint: `${id}-hint`, error: `${id}-err` };
  const describedBy = [hint && ids.hint, error && ids.error].filter(Boolean).join(" ") || undefined;
  const head = (
    <div className="flex items-baseline justify-between gap-4">
      {group ? (
        <span id={ids.label} className="font-semibold">
          {label}
        </span>
      ) : (
        <label id={ids.label} htmlFor={ids.input} className="font-semibold">
          {label}
        </label>
      )}
      {value !== undefined && (
        <span className="shrink-0 text-lg leading-6 font-bold tabular-nums" aria-hidden="true">
          {value}
        </span>
      )}
    </div>
  );
  const body = (
    <>
      {head}
      {hint && (
        <p id={ids.hint} className="mt-0.5 text-sm text-muted">
          {hint}
        </p>
      )}
      <div className="mt-3">{children({ input: ids.input, label: ids.label, describedBy })}</div>
      {error && (
        <p id={ids.error} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-high">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </>
  );
  return group ? (
    <div role={group} aria-labelledby={ids.label} aria-describedby={describedBy}>
      {body}
    </div>
  ) : (
    <div>{body}</div>
  );
}

const input =
  "h-12 w-full rounded-xl border bg-bg px-3.5 text-base tabular-nums outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/15";

function Num({
  ids,
  value,
  onChange,
  onBlur,
  step = 1,
  unit,
  invalid,
  label,
}: {
  ids: Ids;
  value?: number;
  onChange: (v?: number) => void;
  onBlur?: () => void;
  step?: number;
  unit?: string;
  invalid?: boolean;
  /** Accessible name when one field holds two inputs (blood pressure). */
  label?: string;
}) {
  return (
    <div className="relative">
      <input
        id={label ? undefined : ids.input}
        type="number"
        inputMode={step < 1 ? "decimal" : "numeric"}
        enterKeyHint="next"
        aria-label={label}
        aria-describedby={ids.describedBy}
        aria-invalid={invalid || undefined}
        className={`${input} ${unit ? "pr-16" : ""} ${invalid ? "border-high" : "border-hairline"}`}
        // 0 is never a valid answer here, so an emptied field stays empty instead of snapping to "0".
        value={value || ""}
        step={step}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
      {unit && <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-muted">{unit}</span>}
    </div>
  );
}

/** Range input with a large thumb (28px, in a 44px hit row), a filled track and its two ends labelled. */
const range = [
  "block h-11 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none",
  "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full",
  "[&::-webkit-slider-runnable-track]:[background:linear-gradient(var(--accent),var(--accent))_0_0/var(--p)_100%_no-repeat_var(--surface-2)]",
  "[&::-webkit-slider-thumb]:-mt-2.5 [&::-webkit-slider-thumb]:size-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
  "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-bg [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgb(11_11_15/0.18)]",
  "[&::-webkit-slider-thumb]:transition-transform active:[&::-webkit-slider-thumb]:scale-110",
  "[&:focus-visible::-webkit-slider-thumb]:outline-2 [&:focus-visible::-webkit-slider-thumb]:outline-offset-2 [&:focus-visible::-webkit-slider-thumb]:outline-accent",
  "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-surface-2",
  "[&::-moz-range-progress]:h-2 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-accent",
  "[&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-ink [&::-moz-range-thumb]:bg-bg",
  "[&:focus-visible::-moz-range-thumb]:outline-2 [&:focus-visible::-moz-range-thumb]:outline-offset-2 [&:focus-visible::-moz-range-thumb]:outline-accent",
].join(" ");

function Slider({
  ids,
  value,
  onChange,
  min,
  max,
  step = 1,
  format,
  ends,
}: {
  ids: Ids;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format: (v: number) => string;
  ends: [string, string];
}) {
  return (
    <div>
      <input
        id={ids.input}
        type="range"
        className={range}
        style={{ "--p": `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
        value={value}
        min={min}
        max={max}
        step={step}
        aria-valuetext={format(value)}
        aria-describedby={ids.describedBy}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-xs text-muted" aria-hidden="true">
        <span>{ends[0]}</span>
        <span>{ends[1]}</span>
      </div>
    </div>
  );
}

/** A set of real radio inputs drawn as equal-width segments: arrow keys and screen readers work natively. */
function Choice<T extends string | number>({
  value,
  options,
  onChange,
  cols,
}: {
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
  cols: string;
}) {
  const name = useId();
  return (
    <div className={`grid gap-2 ${cols}`}>
      {options.map(([v, label]) => (
        <label key={String(v)} className="relative">
          <input type="radio" name={name} className="peer sr-only" checked={value === v} onChange={() => onChange(v)} />
          <span className="flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-hairline bg-bg px-2 text-center text-sm leading-tight transition hover:border-ink/40 peer-checked:border-ink peer-checked:bg-ink peer-checked:font-semibold peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
            {label}
          </span>
        </label>
      ))}
    </div>
  );
}

const FREQS: [Freq, string][] = ([0, 1, 2, 3] as Freq[]).map((f) => [f, FREQ_LABEL[f]]);
const DAYS: [number, string][] = [0, 1, 2, 3, 4, 5, 6, 7].map((d) => [d, String(d)]);

type ErrKey = "age" | "heightCm" | "weightKg" | "bp";

/** Plausibility checks: flag values that are likely typos, next to the field they belong to. All live on step 1. */
function errorsOf(p: Profile) {
  const e: Partial<Record<ErrKey, string>> = {};
  const bmi = bmiOf(p.heightCm, p.weightKg);
  if (!(p.age >= 10 && p.age <= 100)) e.age = "อายุควรอยู่ระหว่าง 10–100 ปี";
  if (!(p.heightCm >= 120 && p.heightCm <= 220)) e.heightCm = "ส่วนสูงดูไม่สมเหตุสมผล ตรวจสอบหน่วยเป็นเซนติเมตร";
  else if (!(bmi >= 13 && bmi <= 60)) e.weightKg = "น้ำหนักกับส่วนสูงดูไม่สอดคล้องกัน ลองตรวจสอบอีกครั้ง";
  if (!p.weightKg) e.weightKg = "กรอกน้ำหนักเป็นกิโลกรัม";
  if ((p.systolic && !p.diastolic) || (!p.systolic && p.diastolic)) e.bp = "กรอกความดันให้ครบทั้งค่าบนและค่าล่าง หรือเว้นว่างทั้งคู่";
  else if (p.systolic && (p.systolic < 70 || p.systolic > 250)) e.bp = "ค่าความดันตัวบนผิดปกติมาก ลองวัดซ้ำ";
  else if (p.systolic && p.diastolic && p.systolic <= p.diastolic) e.bp = "ค่าความดันตัวบนควรมากกว่าตัวล่าง";
  return e;
}

const FAMILY = [
  ["diabetes", "เบาหวาน"],
  ["hypertension", "ความดันสูง"],
  ["heart", "โรคหัวใจ"],
] as const;

export default function QuizPage() {
  const router = useRouter();
  const ready = useHydrated();
  const saved = useCare((s) => s.profile);
  const setProfile = useCare((s) => s.setProfile);
  const consent = useCare((s) => s.consent);
  const setConsent = useCare((s) => s.setConsent);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [step, setStep] = useState(0);
  /** Errors appear once a field is left or the user tries to move on, not while they are still typing. */
  const [touched, setTouched] = useState<Set<ErrKey>>(new Set());
  const [tried, setTried] = useState(false);
  const [consentMissing, setConsentMissing] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!ready) return <div className="h-96 animate-pulse rounded-card bg-surface" aria-busy="true" />;
  const p = draft ?? saved ?? EMPTY;
  const set = (patch: Partial<Profile>) => setDraft({ ...p, ...patch });
  const errors = errorsOf(p);
  const shown = (k: ErrKey) => (tried || touched.has(k) ? errors[k] : undefined);
  const touch = (k: ErrKey) => () => setTouched((t) => new Set(t).add(k));
  const bmi = bmiOf(p.heightCm, p.weightKg);
  const last = step === STEPS.length - 1;

  const goTo = (s: number) => {
    setStep(s);
    // On a phone the button sits at the bottom of a long form: start the next step from its top.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0 });
      top.current?.focus({ preventScroll: true });
    });
  };

  const focusFirstError = () =>
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());

  const next = () => {
    if (step === 0 && Object.keys(errors).length) {
      setTried(true);
      focusFirstError();
      return;
    }
    if (!last) return goTo(step + 1);
    if (Object.keys(errors).length) {
      setTried(true);
      return goTo(0);
    }
    if (!consent) {
      setConsentMissing(true);
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>("#consent")?.focus());
      return;
    }
    setProfile({ ...p, name: p.name.trim() });
    router.push("/app/result");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div ref={top} tabIndex={-1} className="outline-none">
        <PageHead feature="quiz" title={STEPS[step]} sub="แบบประเมินความเสี่ยง · ตอบตามพฤติกรรมจริงในช่วง 1–3 เดือนที่ผ่านมา ใช้เวลาราว 3 นาที" />
      </div>
      <p className="sr-only" aria-live="polite">
        ขั้นที่ {step + 1} จาก {STEPS.length}: {STEPS[step]}
      </p>

      <ol className="mb-2 grid grid-cols-3 gap-2" aria-label="ความคืบหน้า">
        {STEPS.map((s, i) => {
          const done = i < step;
          const body = (
            <>
              <span className={`block h-1.5 rounded-full transition-colors ${i <= step ? "bg-ink" : "bg-surface-2"}`} />
              <span className={`mt-2 flex items-center gap-1 text-xs sm:text-sm ${i === step ? "font-semibold text-ink" : "text-muted"}`}>
                {done && <Check className="size-3.5 shrink-0" aria-hidden="true" />}
                <span className="sr-only">ขั้นที่ {i + 1} </span>
                {STEP_SHORT[i]}
              </span>
            </>
          );
          return (
            <li key={s} aria-current={i === step ? "step" : undefined}>
              {done ? (
                <button type="button" onClick={() => goTo(i)} className="block w-full rounded-md pb-1 text-left hover:[&>span:last-child]:text-ink" aria-label={`กลับไปแก้ ${s}`}>
                  {body}
                </button>
              ) : (
                <div className="pb-1">{body}</div>
              )}
            </li>
          );
        })}
      </ol>

      <form
        ref={formRef}
        noValidate
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <div className="divide-y divide-hairline [&>*]:py-6 [&>*:first-child]:pt-0">
          {step === 0 && (
            <>
              <Field label="ชื่อเล่น" hint="ไม่บังคับ ใช้เรียกคุณในแอป">
                {(ids) => (
                  <input
                    id={ids.input}
                    aria-describedby={ids.describedBy}
                    className={`${input} border-hairline`}
                    value={p.name}
                    maxLength={30}
                    autoComplete="nickname"
                    enterKeyHint="next"
                    onChange={(e) => set({ name: e.target.value })}
                    placeholder="เช่น มายด์"
                  />
                )}
              </Field>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="อายุ" error={shown("age")}>
                  {(ids) => <Num ids={ids} value={p.age} onChange={(v) => set({ age: v ?? 0 })} onBlur={touch("age")} unit="ปี" invalid={!!shown("age")} />}
                </Field>
                <Field group="radiogroup" label="เพศกำเนิด">
                  {() => (
                    <Choice
                      cols="grid-cols-2"
                      value={p.sex}
                      onChange={(sex) => set({ sex })}
                      options={[
                        ["female", "หญิง"],
                        ["male", "ชาย"],
                      ]}
                    />
                  )}
                </Field>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="ส่วนสูง" error={shown("heightCm")}>
                  {(ids) => (
                    <Num ids={ids} value={p.heightCm} onChange={(v) => set({ heightCm: v ?? 0 })} onBlur={touch("heightCm")} unit="ซม." invalid={!!shown("heightCm")} />
                  )}
                </Field>
                <Field label="น้ำหนัก" value={bmi >= 10 && bmi <= 70 ? <span className="text-sm font-medium text-muted">BMI {bmi.toFixed(1)}</span> : undefined} error={shown("weightKg")}>
                  {(ids) => (
                    <Num
                      ids={ids}
                      value={p.weightKg}
                      onChange={(v) => set({ weightKg: v ?? 0 })}
                      onBlur={touch("weightKg")}
                      step={0.1}
                      unit="กก."
                      invalid={!!shown("weightKg")}
                    />
                  )}
                </Field>
              </div>
              <Field group="group" label="ความดันโลหิตล่าสุด" hint="ไม่บังคับ · วัดหลังนั่งพัก 5 นาที หน่วย มม.ปรอท" error={shown("bp")}>
                {(ids) => (
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <Num ids={ids} label="ความดันตัวบน" value={p.systolic} onChange={(systolic) => set({ systolic })} onBlur={touch("bp")} unit="ตัวบน" invalid={!!shown("bp")} />
                    <span className="text-xl text-muted" aria-hidden="true">
                      /
                    </span>
                    <Num ids={ids} label="ความดันตัวล่าง" value={p.diastolic} onChange={(diastolic) => set({ diastolic })} onBlur={touch("bp")} unit="ตัวล่าง" invalid={!!shown("bp")} />
                  </div>
                )}
              </Field>
              <Field group="group" label="พ่อ แม่ หรือพี่น้อง เคยเป็นโรคเหล่านี้" hint="เลือกได้หลายข้อ ถ้าไม่มีหรือไม่ทราบ ข้ามได้เลย">
                {() => (
                  <div className="grid grid-cols-3 gap-2">
                    {FAMILY.map(([k, label]) => (
                      <label key={k} className="relative">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={p.family[k]}
                          onChange={() => set({ family: { ...p.family, [k]: !p.family[k] } })}
                        />
                        <span className="flex min-h-12 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-hairline bg-bg px-2 text-center text-sm leading-tight transition hover:border-ink/40 peer-checked:border-ink peer-checked:bg-ink peer-checked:font-semibold peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent [&>svg]:hidden peer-checked:[&>svg]:block">
                          <Check className="size-4 shrink-0" aria-hidden="true" />
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="นอนหลับเฉลี่ยต่อคืน" value={`${p.sleepHours} ชม.`}>
                {(ids) => <Slider ids={ids} value={p.sleepHours} onChange={(sleepHours) => set({ sleepHours })} min={3} max={12} step={0.5} format={(v) => `${v} ชั่วโมง`} ends={["3 ชม.", "12 ชม."]} />}
              </Field>
              <Field group="radiogroup" label="ออกกำลังกาย 30 นาทีขึ้นไป" hint="กี่วันต่อสัปดาห์ · เดินเร็ว ปั่นจักรยาน วิ่ง เล่นกีฬา" value={`${p.exerciseDays} วัน`}>
                {() => <Choice cols="grid-cols-8" value={p.exerciseDays} options={DAYS} onChange={(exerciseDays) => set({ exerciseDays })} />}
              </Field>
              <Field group="radiogroup" label="กินหวาน" hint="ชานม น้ำอัดลม ขนมหวาน">
                {() => <Choice cols="grid-cols-4" value={p.sweet} options={FREQS} onChange={(sweet) => set({ sweet })} />}
              </Field>
              <Field group="radiogroup" label="กินเค็ม" hint="เติมน้ำปลา บะหมี่กึ่งสำเร็จรูป ของหมักดอง">
                {() => <Choice cols="grid-cols-4" value={p.salty} options={FREQS} onChange={(salty) => set({ salty })} />}
              </Field>
              <Field group="radiogroup" label="กินมัน" hint="ของทอด กะทิ หนังสัตว์">
                {() => <Choice cols="grid-cols-4" value={p.fatty} options={FREQS} onChange={(fatty) => set({ fatty })} />}
              </Field>
              <Field label="ผักและผลไม้" hint="1 ส่วน ≈ ผักสุก 1 ทัพพี หรือผลไม้ 1 กำมือ" value={`${p.veggies} ส่วน/วัน`}>
                {(ids) => <Slider ids={ids} value={p.veggies} onChange={(veggies) => set({ veggies })} min={0} max={8} format={(v) => `${v} ส่วนต่อวัน`} ends={["0", "8 ส่วน"]} />}
              </Field>
              <Field label="ดื่มน้ำเปล่า" value={`${p.water} แก้ว/วัน`}>
                {(ids) => <Slider ids={ids} value={p.water} onChange={(water) => set({ water })} min={0} max={14} format={(v) => `${v} แก้วต่อวัน`} ends={["0", "14 แก้ว"]} />}
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="ระดับความเครียดโดยเฉลี่ย" value={`${p.stress}/10`}>
                {(ids) => <Slider ids={ids} value={p.stress} onChange={(stress) => set({ stress })} min={1} max={10} format={(v) => `${v} จาก 10`} ends={["1 สบาย ๆ", "10 เครียดมาก"]} />}
              </Field>
              <Field group="radiogroup" label="การสูบบุหรี่ / บุหรี่ไฟฟ้า">
                {() => (
                  <Choice<Smoking>
                    cols="grid-cols-3"
                    value={p.smoking}
                    onChange={(smoking) => set({ smoking })}
                    options={[
                      ["never", "ไม่เคยสูบ"],
                      ["former", "เลิกแล้ว"],
                      ["current", "สูบอยู่"],
                    ]}
                  />
                )}
              </Field>
              <Field label="เครื่องดื่มแอลกอฮอล์" hint="ต่อสัปดาห์ · 1 ดื่มมาตรฐาน ≈ เบียร์ 1 กระป๋อง" value={p.alcohol ? `${p.alcohol} ดื่ม` : "ไม่ดื่ม"}>
                {(ids) => (
                  <Slider
                    ids={ids}
                    value={p.alcohol}
                    onChange={(alcohol) => set({ alcohol })}
                    min={0}
                    max={30}
                    format={(v) => (v ? `${v} ดื่มมาตรฐานต่อสัปดาห์` : "ไม่ดื่ม")}
                    ends={["ไม่ดื่ม", "30 ดื่ม"]}
                  />
                )}
              </Field>
              <div>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm leading-relaxed transition ${consentMissing && !consent ? "border-high bg-high-soft" : consent ? "border-ink/20 bg-surface" : "border-hairline bg-surface"}`}
                >
                  <input
                    id="consent"
                    type="checkbox"
                    className="mt-0.5 size-5 shrink-0 cursor-pointer"
                    checked={consent}
                    aria-invalid={consentMissing && !consent ? true : undefined}
                    aria-describedby={consentMissing && !consent ? "consent-err" : undefined}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    ฉันยินยอมให้ CARE+ ใช้ข้อมูลนี้เพื่อประเมินปัจจัยเสี่ยงเบื้องต้น ข้อมูลเก็บไว้ในเบราว์เซอร์ของฉันเท่านั้น
                    และเข้าใจว่าผลประเมินไม่ใช่การวินิจฉัยโรค
                  </span>
                </label>
                {consentMissing && !consent && (
                  <p id="consent-err" className="mt-2 flex items-start gap-1.5 text-sm font-medium text-high">
                    <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    ติ๊กยินยอมก่อน แล้วกดดูผลประเมินอีกครั้ง
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {tried && step === 0 && Object.keys(errors).length > 0 && (
          <p className="mt-2 text-sm text-muted" role="alert">
            ยังไปต่อไม่ได้ ตรวจสอบช่องที่มีคำเตือนด้านบนก่อน
          </p>
        )}

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-hairline pt-6">
          {step > 0 ? (
            <button type="button" className={`${btn.ghost} min-h-12`} onClick={() => goTo(step - 1)}>
              <ArrowLeft className="size-4" aria-hidden="true" /> ย้อนกลับ
            </button>
          ) : (
            <span className="text-sm text-muted">ขั้นที่ 1 จาก {STEPS.length}</span>
          )}
          <button type="submit" className={`${btn.primary} min-h-12 px-6`}>
            {last ? "ดูผลประเมิน" : `ถัดไป: ${STEP_SHORT[step + 1]}`} <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
}
