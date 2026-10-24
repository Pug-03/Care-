"use client";

import { useState } from "react";
import { Building2, Clock, FileText, HeartPulse, LocateFixed, MapPin, Navigation, Phone, ShieldCheck, Siren, Stethoscope } from "lucide-react";
import { btn, Card, PageHead } from "@/components/ui";
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

const chip = (on: boolean) =>
  `rounded-full border px-4 py-2 text-sm shadow-soft transition ${on ? "border-transparent bg-gradient-to-r from-sky-500 to-blue-600 font-medium text-white" : "border-hairline bg-white hover:border-blue-300"}`;

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
        feature="care"
        says={
          <>
            สุขภาพดี เริ่มได้จาก
            <br />
            การตรวจเช็กนะครับ 💙
          </>
        }
        eyebrow="ถ้าควรพบแพทย์"
        title="ค้นหาสถานพยาบาล"
        sub="CARE+ ไม่วินิจฉัยโรคเอง แต่ช่วยให้คุณเข้าถึงบริการสุขภาพที่เหมาะสมได้ง่ายขึ้น"
      />

      <div className="stagger space-y-6">
        <a href="tel:1669" className="flex items-center gap-3 rounded-card bg-high-soft p-4 text-sm">
          <Siren className="size-5 shrink-0 text-high" />
          <span className="flex-1">
            <span className="font-semibold text-high">เจ็บหน้าอก หายใจลำบาก แขนขาอ่อนแรง พูดไม่ชัด?</span> โทร 1669 ทันที (บริการการแพทย์ฉุกเฉิน)
          </span>
        </a>

        {a?.seeDoctor && (
          <Card className="flex items-start gap-4 border-blue-200/70 bg-gradient-to-r from-sky-50 to-blue-50">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white">
              <Stethoscope className="size-7" />
            </span>
            <div>
              <p className="font-bold text-[#123a73]">จากผลการประเมินสุขภาพของคุณ ควรพิจารณาตรวจเพิ่มเติม</p>
              <ul className="mt-1 text-sm text-muted">
                {a.seeDoctorReasons.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-muted">แนะนำ: คลินิกอายุรกรรม หรือบริการตรวจคัดกรอง NCDs ใกล้บ้าน</p>
            </div>
          </Card>
        )}

        <Card className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">สิทธิการรักษาของฉัน</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(RIGHT_LABEL) as Right[]).map((r) => (
                <button key={r} type="button" aria-pressed={rights.includes(r)} onClick={() => toggleRight(r)} className={chip(rights.includes(r))}>
                  {RIGHT_LABEL[r]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">ประเภทสถานพยาบาล</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={type === "all"} onClick={() => setType("all")} className={chip(type === "all")}>
                ทั้งหมด
              </button>
              {(Object.keys(TYPE_LABEL) as FacilityType[]).map((t) => (
                <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)} className={chip(type === t)}>
                  {TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-4">
            <button type="button" onClick={locate} className={btn.ghost} disabled={locating === "busy"}>
              <LocateFixed className="size-4" /> {here ? "อัปเดตตำแหน่ง" : locating === "busy" ? "กำลังหาตำแหน่ง…" : "ใช้ตำแหน่งของฉัน"}
            </button>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} /> เปิดอยู่ตอนนี้
            </label>
            <span className="text-xs text-muted">
              {here ? "วัดระยะจากตำแหน่งของคุณ" : locating === "denied" ? "ไม่ได้รับตำแหน่ง ใช้ระยะจากใจกลางกรุงเทพฯ แทน" : "ระยะทางวัดจากใจกลางกรุงเทพฯ"}
            </span>
          </div>
        </Card>

        <div>
          <p className="mb-3 text-sm text-muted">
            พบ {list.length} แห่ง · <span className="text-watch">ข้อมูลตัวอย่างสำหรับต้นแบบ ไม่ใช่สถานพยาบาลจริง</span>
          </p>
          <ul className="grid gap-3 md:grid-cols-2">
            {list.map((f) => {
              const open = isOpen(f);
              return (
                <li key={f.id} className="reveal lift flex flex-col rounded-card border border-hairline bg-white p-5 shadow-soft">
                  <div className="flex items-start gap-3">
                    <span
                      className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white ${f.type === "private" ? "from-violet-400 to-purple-600" : f.type === "clinic" ? "from-emerald-400 to-teal-600" : f.type === "community" ? "from-amber-400 to-orange-500" : "from-sky-400 to-blue-600"}`}
                    >
                      {f.type === "clinic" ? <HeartPulse className="size-7" /> : <Building2 className="size-7" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted">{TYPE_LABEL[f.type]}</p>
                      <h3 className="font-bold text-[#123a73]">{f.name}</h3>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${open ? "bg-good-soft text-good" : "bg-surface-2 text-muted"}`}>
                      {open ? "เปิดอยู่" : "ปิดแล้ว"}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm text-muted">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0" />
                      <span>
                        {f.km.toFixed(1)} กม. · เขต{f.district}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 shrink-0" />
                      <span>{hoursLabel(f)}</span>
                    </div>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {f.services.map((s) => (
                      <li key={s} className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-800">
                        {s}
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-2 flex flex-wrap items-center gap-1.5">
                    <ShieldCheck className="size-4 text-emerald-600" aria-label="สิทธิการรักษา" />
                    {f.rights.map((r) => (
                      <li
                        key={r}
                        className={`rounded-md px-2 py-0.5 text-xs ${rights.includes(r) ? "bg-emerald-100 font-medium text-emerald-700" : "bg-emerald-50 text-emerald-700"}`}
                      >
                        {RIGHT_SHORT[r]}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex gap-2 pt-4">
                    <a href={`tel:${f.phone.replace(/-/g, "")}`} className={`${btn.ghost} flex-1 px-3`}>
                      <Phone className="size-4" /> โทร
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${btn.primary} flex-1 px-3`}
                    >
                      <Navigation className="size-4" /> ดูเส้นทาง
                    </a>
                  </div>
                  <p className="mt-3 text-[11px] text-muted">
                    อัปเดตข้อมูล {new Date(f.updated).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </li>
              );
            })}
          </ul>
          {list.length === 0 && (
            <p className="rounded-card border border-dashed border-hairline p-8 text-center text-sm text-muted">
              ไม่พบสถานพยาบาลตามตัวกรอง ลองเลือกตัวกรองให้น้อยลง
            </p>
          )}
        </div>

        <Card>
          <div className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white">
              <FileText className="size-5" />
            </span>
            <h2 className="font-semibold">เตรียมตัวก่อนไปตามสิทธิ</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {(rights.length ? rights : (Object.keys(RIGHT_DOCS) as Right[])).map((r) => (
              <div key={r} className="rounded-2xl border border-blue-100 bg-gradient-to-br from-sky-50 to-blue-50 p-4 text-sm">
                <p className="font-medium">{RIGHT_SHORT[r]}</p>
                <ul className="mt-2 space-y-1 text-muted">
                  {RIGHT_DOCS[r].docs.map((d) => (
                    <li key={d}>• {d}</li>
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
