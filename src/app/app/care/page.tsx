"use client";

import { useState } from "react";
import { Building2, Clock, FileText, HeartPulse, LocateFixed, MapPin, Navigation, Phone, ShieldCheck, Siren, Stethoscope, X } from "lucide-react";
import { btn, Card, chip, PageHead } from "@/components/ui";
import { analyze } from "@/lib/health";
import {
  DEFAULT_CENTER,
  distanceKm,
  FACILITIES,
  hoursLabel,
  isOpen,
  RIGHT_DOCS,
  RIGHT_LABEL,
  RIGHT_SHORT,
  TYPE_LABEL,
  type FacilityType,
  type Right,
} from "@/lib/clinics";
import { useCare, useHydrated } from "@/lib/store";

export default function Care() {
  const ready = useHydrated();
  const profile = useCare((s) => s.profile);
  const rights = useCare((s) => s.rights);
  const setRights = useCare((s) => s.setRights);
  const [type, setType] = useState<FacilityType | "all">("all");
  const [openOnly, setOpenOnly] = useState(false);
  const [here, setHere] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState<"idle" | "busy" | "denied">("idle");

  if (!ready) return <div className="h-96 animate-pulse rounded-card bg-surface" />;

  const a = profile ? analyze(profile) : null;
  const center = here ?? DEFAULT_CENTER;
  const list = FACILITIES.filter((f) => type === "all" || f.type === type)
    .filter((f) => !openOnly || isOpen(f))
    .filter((f) => rights.length === 0 || rights.some((r) => f.rights.includes(r)))
    .map((f) => ({ ...f, km: distanceKm(center, f) }))
    .sort((x, y) => x.km - y.km);

  const locate = () => {
    if (!navigator.geolocation) return setLocating("denied");
    setLocating("busy");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setHere({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating("idle");
      },
      () => setLocating("denied"),
      { timeout: 10_000 },
    );
  };
  const toggleRight = (r: Right) => setRights(rights.includes(r) ? rights.filter((x) => x !== r) : [...rights, r]);

  return (
    <>
      <PageHead
        says={
          <>
            สุขภาพดี เริ่มได้จาก
            <br />
            การตรวจเช็กนะ
          </>
        }
        title="ค้นหาสถานพยาบาล"
        sub="CARE+ ไม่วินิจฉัยโรคเอง แต่ช่วยให้คุณเข้าถึงบริการสุขภาพที่เหมาะสมได้ง่ายขึ้น"
      />

      <div className="stagger space-y-6">
        <a href="tel:1669" className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-card border border-high/30 bg-high-soft p-4 sm:p-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-bg text-high" aria-hidden="true">
            <Siren className="size-5" />
          </span>
          <span className="min-w-0 flex-1 basis-56 text-sm">
            <span className="block font-semibold text-high">เจ็บหน้าอก หายใจลำบาก แขนขาอ่อนแรง พูดไม่ชัด?</span>
            <span className="text-ink/75">อาการฉุกเฉิน อย่ารอ โทรบริการการแพทย์ฉุกเฉินทันที</span>
          </span>
          <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-high px-5 text-sm font-bold text-white">
            <Phone className="size-4" aria-hidden="true" /> โทร 1669
          </span>
        </a>

        {a?.seeDoctor && (
          <Card className="flex items-start gap-4 bg-surface">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-rose-100" aria-hidden="true">
              <Stethoscope className="size-5" strokeWidth={1.8} />
            </span>
            <div>
              <p className="font-semibold">จากผลประเมินของคุณ ควรตรวจเพิ่มเติม</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-muted">
                {a.seeDoctorReasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-muted">แนะนำ: คลินิกอายุรกรรม หรือบริการตรวจคัดกรอง NCDs ใกล้บ้าน</p>
            </div>
          </Card>
        )}

        <Card className="space-y-4">
          <div>
            <p id="f-rights" className="text-sm font-semibold">
              สิทธิการรักษาของฉัน
            </p>
            <p className="mb-2.5 text-xs text-muted">เลือกได้หลายสิทธิ จะแสดงเฉพาะที่รับสิทธินั้น</p>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="f-rights">
              {(Object.keys(RIGHT_LABEL) as Right[]).map((r) => (
                <button key={r} type="button" aria-pressed={rights.includes(r)} onClick={() => toggleRight(r)} className={`${chip(rights.includes(r))} min-h-11`}>
                  {RIGHT_LABEL[r]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p id="f-type" className="mb-2.5 text-sm font-semibold">
              ประเภทสถานพยาบาล
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="f-type">
              <button type="button" aria-pressed={type === "all"} onClick={() => setType("all")} className={`${chip(type === "all")} min-h-11`}>
                ทั้งหมด
              </button>
              {(Object.keys(TYPE_LABEL) as FacilityType[]).map((t) => (
                <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)} className={`${chip(type === t)} min-h-11`}>
                  {TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-4">
            <button type="button" onClick={locate} className={`${btn.ghost} min-h-11 disabled:opacity-60`} disabled={locating === "busy"}>
              <LocateFixed className="size-4" aria-hidden="true" /> {here ? "อัปเดตตำแหน่ง" : locating === "busy" ? "กำลังหาตำแหน่ง…" : "ใช้ตำแหน่งของฉัน"}
            </button>
            <button type="button" aria-pressed={openOnly} onClick={() => setOpenOnly(!openOnly)} className={`${chip(openOnly)} inline-flex min-h-11 items-center gap-2`}>
              <Clock className="size-4" aria-hidden="true" /> เปิดอยู่ตอนนี้
            </button>
            <span className="basis-full text-xs text-muted" aria-live="polite">
              {here ? "วัดระยะจากตำแหน่งของคุณ" : locating === "denied" ? "ไม่ได้รับตำแหน่ง ใช้ระยะจากใจกลางกรุงเทพฯ แทน" : "ระยะทางวัดจากใจกลางกรุงเทพฯ"}
            </span>
          </div>
        </Card>

        <div>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="font-semibold" aria-live="polite">
              พบ {list.length} แห่ง <span className="text-sm font-normal text-muted">· เรียงจากใกล้ที่สุด</span>
            </h2>
            <p className="text-xs font-medium text-watch">ข้อมูลตัวอย่างสำหรับต้นแบบ ไม่ใช่สถานพยาบาลจริง</p>
          </div>
          <ul className="grid gap-3 md:grid-cols-2">
            {list.map((f) => {
              const open = isOpen(f);
              return (
                <li key={f.id} className="reveal flex flex-col rounded-card border border-hairline bg-bg p-5">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className={`grid size-11 shrink-0 place-items-center rounded-xl text-ink ${f.type === "private" ? "bg-violet-100" : f.type === "clinic" ? "bg-emerald-100" : f.type === "community" ? "bg-amber-100" : "bg-sky-100"}`}
                    >
                      {f.type === "clinic" ? <HeartPulse className="size-5" strokeWidth={1.8} /> : <Building2 className="size-5" strokeWidth={1.8} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold leading-snug">{f.name}</h3>
                      <p className="text-sm text-muted">{TYPE_LABEL[f.type]}</p>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${open ? "bg-good-soft text-good" : "bg-surface-2 text-muted"}`}>
                      <span className={`size-1.5 rounded-full ${open ? "bg-good" : "bg-muted"}`} aria-hidden="true" />
                      {open ? "เปิดอยู่" : "ปิดแล้ว"}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm text-muted">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0" aria-hidden="true" />
                      <span>
                        {f.km.toFixed(1)} กม. · เขต{f.district}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 shrink-0" aria-hidden="true" />
                      <span>{hoursLabel(f)}</span>
                    </div>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="บริการ">
                    {f.services.map((s) => (
                      <li key={s} className="rounded-md bg-surface px-2 py-0.5 text-xs">
                        {s}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 flex items-center gap-1.5">
                    <ShieldCheck className="size-4 shrink-0 text-muted" aria-hidden="true" />
                    <ul className="flex flex-wrap gap-1.5" aria-label="รับสิทธิการรักษา">
                      {f.rights.map((r) => (
                        <li
                          key={r}
                          className={`rounded-md px-2 py-0.5 text-xs ${rights.includes(r) ? "bg-accent-soft font-medium text-accent-text" : "border border-hairline text-muted"}`}
                        >
                          {RIGHT_SHORT[r]}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                    <a href={`tel:${f.phone.replace(/-/g, "")}`} className={`${btn.quiet} min-h-11 px-3`} aria-label={`โทร ${f.name} ${f.phone}`}>
                      <Phone className="size-4" aria-hidden="true" /> โทร
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${btn.ghost} min-h-11 px-3`}
                      aria-label={`ดูเส้นทางไป ${f.name} (เปิด Google Maps)`}
                    >
                      <Navigation className="size-4" aria-hidden="true" /> ดูเส้นทาง
                    </a>
                  </div>
                  <p className="mt-3 text-xs text-muted">
                    อัปเดตข้อมูล {new Date(f.updated).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </li>
              );
            })}
          </ul>
          {list.length === 0 && (
            <div className="rounded-card border border-dashed border-hairline p-8 text-center">
              <p className="font-semibold">ไม่พบสถานพยาบาลตามตัวกรอง</p>
              <p className="mt-1 text-sm text-muted">ลองเลือกตัวกรองให้น้อยลง</p>
              <button
                type="button"
                className={`${btn.ghost} mt-4 min-h-11`}
                onClick={() => {
                  setType("all");
                  setOpenOnly(false);
                  setRights([]);
                }}
              >
                <X className="size-4" aria-hidden="true" /> ล้างตัวกรอง
              </button>
            </div>
          )}
        </div>

        <Card>
          <div className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-xl bg-sky-100" aria-hidden="true">
              <FileText className="size-5" strokeWidth={1.8} />
            </span>
            <h2 className="font-semibold">เตรียมตัวก่อนไปตามสิทธิ</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {(rights.length ? rights : (Object.keys(RIGHT_DOCS) as Right[])).map((r) => (
              <div key={r} className="rounded-2xl bg-surface p-5 text-sm">
                <h3 className="font-semibold">{RIGHT_SHORT[r]}</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-ink/80">
                  {RIGHT_DOCS[r].docs.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <p className="mt-2 text-muted">{RIGHT_DOCS[r].tip}</p>
                <p className="mt-2 text-xs font-medium">{RIGHT_DOCS[r].hotline}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">สิทธิการรักษาอาจมีการเปลี่ยนแปลง ควรตรวจสอบกับหน่วยงานหรือสถานพยาบาลก่อนเข้ารับบริการ</p>
        </Card>
      </div>
    </>
  );
}
