"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
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

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {hint && <span className="ml-2 text-xs text-muted">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const input = "w-full rounded-xl border border-hairline bg-bg px-3.5 py-2.5 tabular-nums outline-none transition focus:border-accent";

function Num({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
}: {
  value?: number;
  onChange: (v?: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        className={`${input} ${unit ? "pr-14" : ""}`}
        value={value ?? ""}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
      {unit && <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-muted">{unit}</span>}
    </div>
  );
}

function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  format,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format: (v: number) => string;
}) {
  return (
    <div className="flex items-center gap-4">
      <input type="range" className="w-full" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} />
      <output className="w-28 shrink-0 text-right text-sm font-medium tabular-nums">{format(value)}</output>
    </div>
  );
}

function Choice<T extends string | number>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map(([v, label]) => (
        <button
          key={String(v)}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`rounded-full border px-4 py-2 text-sm transition ${value === v ? "border-ink bg-ink font-medium text-white" : "border-hairline hover:border-ink/40"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const FREQS: [Freq, string][] = ([0, 1, 2, 3] as Freq[]).map((f) => [f, FREQ_LABEL[f]]);

/** Plausibility checks: flag values that are likely typos rather than reject them. */
function warningsOf(p: Profile) {
  const w: string[] = [];
  const bmi = bmiOf(p.heightCm, p.weightKg);
  if (p.age < 10 || p.age > 100) w.push("อายุควรอยู่ระหว่าง 10–100 ปี");
  if (p.heightCm < 120 || p.heightCm > 220) w.push("ส่วนสูงดูไม่สมเหตุสมผล ตรวจสอบหน่วยเป็นเซนติเมตร");
  if (bmi < 13 || bmi > 60) w.push("น้ำหนักกับส่วนสูงดูไม่สอดคล้องกัน ลองตรวจสอบอีกครั้ง");
  if ((p.systolic && !p.diastolic) || (!p.systolic && p.diastolic)) w.push("กรอกความดันให้ครบทั้งค่าบนและค่าล่าง หรือเว้นว่างทั้งคู่");
  if (p.systolic && p.diastolic && p.systolic <= p.diastolic) w.push("ค่าความดันตัวบนควรมากกว่าตัวล่าง");
  if (p.systolic && (p.systolic < 70 || p.systolic > 250)) w.push("ค่าความดันตัวบนผิดปกติมาก ลองวัดซ้ำ");
  return w;
}

export default function CheckPage() {
  const router = useRouter();
  const ready = useHydrated();
  const saved = useCare((s) => s.profile);
  const setProfile = useCare((s) => s.setProfile);
  const consent = useCare((s) => s.consent);
  const setConsent = useCare((s) => s.setConsent);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [step, setStep] = useState(0);

  if (!ready) return <div className="h-96 animate-pulse rounded-card bg-surface" />;
  const p = draft ?? saved ?? EMPTY;
  const set = (patch: Partial<Profile>) => setDraft({ ...p, ...patch });
  const warnings = warningsOf(p);
  const bmi = bmiOf(p.heightCm, p.weightKg);
  const last = step === STEPS.length - 1;

  const submit = () => {
    if (warnings.length || !consent) return;
    setProfile({ ...p, name: p.name.trim() });
    router.push("/app/analysis");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHead title={STEPS[step]} sub="ตอบตามพฤติกรรมจริงในช่วง 1–3 เดือนที่ผ่านมา ยิ่งตรงความจริง ผลวิเคราะห์ยิ่งแม่นยำ" />
      <p className="mb-2 text-sm text-muted">
        ขั้นที่ {step + 1} จาก {STEPS.length}
      </p>
      <div className="mb-8 flex gap-1.5" aria-hidden="true">
        {STEPS.map((s, i) => (
          <span key={s} className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-ink" : "bg-surface-2"}`} />
        ))}
      </div>

      <form
        className="space-y-7"
        onSubmit={(e) => {
          e.preventDefault();
          if (last) submit();
          else setStep(step + 1);
        }}
      >
        {step === 0 && (
          <>
            <Field label="ชื่อเล่น" hint="ไม่บังคับ">
              <input className={input} value={p.name} maxLength={30} onChange={(e) => set({ name: e.target.value })} placeholder="เช่น มายด์" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="อายุ">
                <Num value={p.age} onChange={(v) => set({ age: v ?? 0 })} min={10} max={100} unit="ปี" />
              </Field>
              <Field label="เพศกำเนิด">
                <Choice
                  value={p.sex}
                  onChange={(sex) => set({ sex })}
                  options={[
                    ["female", "หญิง"],
                    ["male", "ชาย"],
                  ]}
                />
              </Field>
              <Field label="ส่วนสูง">
                <Num value={p.heightCm} onChange={(v) => set({ heightCm: v ?? 0 })} min={100} max={230} unit="ซม." />
              </Field>
              <Field label="น้ำหนัก" hint={bmi > 0 ? `BMI ${bmi.toFixed(1)}` : undefined}>
                <Num value={p.weightKg} onChange={(v) => set({ weightKg: v ?? 0 })} min={20} max={250} step={0.1} unit="กก." />
              </Field>
            </div>
            <Field label="ความดันโลหิตล่าสุด" hint="ไม่บังคับ · วัดหลังนั่งพัก 5 นาที">
              <div className="grid grid-cols-2 gap-3">
                <Num value={p.systolic} onChange={(systolic) => set({ systolic })} min={60} max={260} unit="ตัวบน" />
                <Num value={p.diastolic} onChange={(diastolic) => set({ diastolic })} min={30} max={160} unit="ตัวล่าง" />
              </div>
            </Field>
            <fieldset>
              <legend className="text-sm font-medium">พ่อ แม่ หรือพี่น้อง เคยเป็นโรคเหล่านี้</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    ["diabetes", "เบาหวาน"],
                    ["hypertension", "ความดันสูง"],
                    ["heart", "โรคหัวใจ"],
                  ] as const
                ).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={p.family[k]}
                    onClick={() => set({ family: { ...p.family, [k]: !p.family[k] } })}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition ${p.family[k] ? "border-ink bg-ink font-medium text-white" : "border-hairline hover:border-ink/40"}`}
                  >
                    {p.family[k] && <Check className="size-3.5" />}
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="นอนหลับเฉลี่ยต่อคืน">
              <Slider value={p.sleepHours} onChange={(sleepHours) => set({ sleepHours })} min={3} max={12} step={0.5} format={(v) => `${v} ชม.`} />
            </Field>
            <Field label="ออกกำลังกาย 30 นาทีขึ้นไป" hint="เดินเร็ว ปั่นจักรยาน วิ่ง เล่นกีฬา">
              <Slider value={p.exerciseDays} onChange={(exerciseDays) => set({ exerciseDays })} min={0} max={7} format={(v) => `${v} วัน/สัปดาห์`} />
            </Field>
            <Field label="กินหวาน" hint="ชานม น้ำอัดลม ขนมหวาน">
              <Choice value={p.sweet} options={FREQS} onChange={(sweet) => set({ sweet })} />
            </Field>
            <Field label="กินเค็ม" hint="เติมน้ำปลา บะหมี่กึ่งสำเร็จรูป ของหมักดอง">
              <Choice value={p.salty} options={FREQS} onChange={(salty) => set({ salty })} />
            </Field>
            <Field label="กินมัน" hint="ของทอด กะทิ หนังสัตว์">
              <Choice value={p.fatty} options={FREQS} onChange={(fatty) => set({ fatty })} />
            </Field>
            <Field label="ผักและผลไม้" hint="1 ส่วน ≈ ผักสุก 1 ทัพพี หรือผลไม้ 1 กำมือ">
              <Slider value={p.veggies} onChange={(veggies) => set({ veggies })} min={0} max={8} format={(v) => `${v} ส่วน/วัน`} />
            </Field>
            <Field label="ดื่มน้ำเปล่า">
              <Slider value={p.water} onChange={(water) => set({ water })} min={0} max={14} format={(v) => `${v} แก้ว/วัน`} />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="ระดับความเครียดโดยเฉลี่ย" hint="1 = สบาย ๆ, 10 = เครียดมาก">
              <Slider value={p.stress} onChange={(stress) => set({ stress })} min={1} max={10} format={(v) => `${v}/10`} />
            </Field>
            <Field label="การสูบบุหรี่ / บุหรี่ไฟฟ้า">
              <Choice<Smoking>
                value={p.smoking}
                onChange={(smoking) => set({ smoking })}
                options={[
                  ["never", "ไม่เคยสูบ"],
                  ["former", "เลิกแล้ว"],
                  ["current", "สูบอยู่"],
                ]}
              />
            </Field>
            <Field label="เครื่องดื่มแอลกอฮอล์" hint="1 ดื่มมาตรฐาน ≈ เบียร์ 1 กระป๋อง">
              <Slider value={p.alcohol} onChange={(alcohol) => set({ alcohol })} min={0} max={30} format={(v) => (v ? `${v} ดื่ม/สัปดาห์` : "ไม่ดื่ม")} />
            </Field>
            <label className="flex items-start gap-3 rounded-2xl bg-surface p-4 text-sm">
              <input type="checkbox" className="mt-0.5 size-4 accent-[var(--accent)]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                ฉันยินยอมให้ CARE+ ใช้ข้อมูลนี้เพื่อประเมินปัจจัยเสี่ยงเบื้องต้น ข้อมูลเก็บไว้ในเบราว์เซอร์ของฉันเท่านั้น
                และเข้าใจว่าผลประเมินไม่ใช่การวินิจฉัยโรค
              </span>
            </label>
          </>
        )}

        {warnings.length > 0 && (
          <ul className="space-y-1 rounded-2xl bg-watch-soft p-4 text-sm text-watch" role="alert">
            {warnings.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-hairline pt-6">
          {step > 0 ? (
            <button type="button" className={btn.ghost} onClick={() => setStep(step - 1)}>
              <ArrowLeft className="size-4" /> ย้อนกลับ
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className={btn.primary} disabled={last && (warnings.length > 0 || !consent)}>
            {last ? "ดูผลวิเคราะห์" : "ถัดไป"} <ArrowRight className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
