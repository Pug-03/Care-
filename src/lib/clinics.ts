/**
 * Sample facility directory for the prototype. Names, hours and rights are illustrative only and are labelled as
 * such in the UI; production must load an official source (e.g. MOPH facility registry, NHSO / SSO unit lists).
 */

export type Right = "ucs" | "sso" | "csmbs";
export type FacilityType = "hospital" | "private" | "clinic" | "community";

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  district: string;
  lat: number;
  lng: number;
  /** [openHour, closeHour] in 24h local time; null means open 24 hours. */
  hours: [number, number] | null;
  days: string;
  services: string[];
  rights: Right[];
  phone: string;
  updated: string;
}

export const RIGHT_LABEL: Record<Right, string> = {
  ucs: "บัตรทอง (หลักประกันสุขภาพแห่งชาติ)",
  sso: "ประกันสังคม",
  csmbs: "ข้าราชการ / กรมบัญชีกลาง",
};

export const RIGHT_SHORT: Record<Right, string> = { ucs: "บัตรทอง", sso: "ประกันสังคม", csmbs: "ข้าราชการ" };

export const RIGHT_DOCS: Record<Right, { docs: string[]; tip: string; hotline: string }> = {
  ucs: {
    docs: ["บัตรประชาชน (หรือสูติบัตรสำหรับเด็ก)", "ใบส่งตัว หากไปนอกหน่วยบริการประจำ"],
    tip: "ใช้สิทธิที่หน่วยบริการประจำที่ลงทะเบียนไว้ หรือหน่วยบริการปฐมภูมิที่ร่วมโครงการ",
    hotline: "สายด่วน สปสช. 1330",
  },
  sso: {
    docs: ["บัตรประชาชน"],
    tip: "ใช้สิทธิที่โรงพยาบาลตามสิทธิที่เลือกไว้ ตรวจสอบได้ในแอปหรือเว็บประกันสังคม",
    hotline: "สายด่วนประกันสังคม 1506",
  },
  csmbs: {
    docs: ["บัตรประชาชน", "ลงทะเบียนเบิกจ่ายตรงกับโรงพยาบาลครั้งแรก"],
    tip: "ใช้ได้ที่สถานพยาบาลของรัฐ ผู้ป่วยนอกเบิกจ่ายตรงได้เมื่อลงทะเบียนแล้ว",
    hotline: "สอบถามได้ที่ฝ่ายสิทธิ/การเงินของโรงพยาบาล",
  },
};

export const TYPE_LABEL: Record<FacilityType, string> = {
  hospital: "โรงพยาบาลรัฐ",
  private: "โรงพยาบาลเอกชน",
  clinic: "คลินิก",
  community: "ศูนย์บริการสาธารณสุข",
};

/** Default location when the user doesn't share theirs: central Bangkok. */
export const DEFAULT_CENTER = { lat: 13.7466, lng: 100.5347 };

export const FACILITIES: Facility[] = [
  {
    id: "f1",
    name: "โรงพยาบาลกลางเมือง (ตัวอย่าง)",
    type: "hospital",
    district: "ปทุมวัน",
    lat: 13.7398,
    lng: 100.5306,
    hours: null,
    days: "ทุกวัน",
    services: ["อายุรกรรม", "คลินิกเบาหวาน", "คลินิกความดัน", "ตรวจสุขภาพประจำปี", "ฉุกเฉิน 24 ชม."],
    rights: ["ucs", "sso", "csmbs"],
    phone: "02-000-0001",
    updated: "2026-09-20",
  },
  {
    id: "f2",
    name: "ศูนย์บริการสาธารณสุข 12 (ตัวอย่าง)",
    type: "community",
    district: "ราชเทวี",
    lat: 13.7546,
    lng: 100.5381,
    hours: [8, 16],
    days: "จ.–ศ.",
    services: ["ตรวจคัดกรอง NCDs", "วัดความดัน/น้ำตาล", "ให้คำปรึกษาโภชนาการ", "เลิกบุหรี่"],
    rights: ["ucs"],
    phone: "02-000-0002",
    updated: "2026-09-12",
  },
  {
    id: "f3",
    name: "คลินิกเวชกรรมอบอุ่น (ตัวอย่าง)",
    type: "clinic",
    district: "พญาไท",
    lat: 13.7631,
    lng: 100.5376,
    hours: [9, 20],
    days: "ทุกวัน",
    services: ["เวชปฏิบัติทั่วไป", "ตรวจเลือด", "คลินิกบัตรทองใกล้บ้าน"],
    rights: ["ucs"],
    phone: "02-000-0003",
    updated: "2026-08-30",
  },
  {
    id: "f4",
    name: "โรงพยาบาลสุขใจ (ตัวอย่าง)",
    type: "private",
    district: "วัฒนา",
    lat: 13.7382,
    lng: 100.5602,
    hours: null,
    days: "ทุกวัน",
    services: ["ศูนย์หัวใจ", "อายุรกรรม", "ตรวจสุขภาพ", "ฉุกเฉิน 24 ชม."],
    rights: ["sso"],
    phone: "02-000-0004",
    updated: "2026-09-25",
  },
  {
    id: "f5",
    name: "โรงพยาบาลริมน้ำ (ตัวอย่าง)",
    type: "hospital",
    district: "บางรัก",
    lat: 13.7262,
    lng: 100.5165,
    hours: null,
    days: "ทุกวัน",
    services: ["อายุรกรรม", "คลินิกโรคหัวใจ", "เวชศาสตร์ฟื้นฟู", "ฉุกเฉิน 24 ชม."],
    rights: ["ucs", "sso", "csmbs"],
    phone: "02-000-0005",
    updated: "2026-09-18",
  },
  {
    id: "f6",
    name: "คลินิกชุมชนสามย่าน (ตัวอย่าง)",
    type: "clinic",
    district: "ปทุมวัน",
    lat: 13.7326,
    lng: 100.5287,
    hours: [8, 19],
    days: "จ.–ส.",
    services: ["เวชปฏิบัติทั่วไป", "วัดความดัน", "ฉีดวัคซีน"],
    rights: ["ucs", "sso"],
    phone: "02-000-0006",
    updated: "2026-09-02",
  },
  {
    id: "f7",
    name: "ศูนย์บริการสาธารณสุข 7 (ตัวอย่าง)",
    type: "community",
    district: "คลองเตย",
    lat: 13.7189,
    lng: 100.5634,
    hours: [8, 16],
    days: "จ.–ศ.",
    services: ["ตรวจคัดกรอง NCDs", "คลินิกสุขภาพจิต", "ให้คำปรึกษาโภชนาการ"],
    rights: ["ucs"],
    phone: "02-000-0007",
    updated: "2026-08-21",
  },
  {
    id: "f8",
    name: "โรงพยาบาลรัฐฝั่งเหนือ (ตัวอย่าง)",
    type: "hospital",
    district: "ดุสิต",
    lat: 13.7781,
    lng: 100.5139,
    hours: null,
    days: "ทุกวัน",
    services: ["อายุรกรรม", "คลินิกเบาหวาน", "คลินิกไต", "ฉุกเฉิน 24 ชม."],
    rights: ["ucs", "csmbs"],
    phone: "02-000-0008",
    updated: "2026-09-10",
  },
];

/** Great-circle distance in km. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function isOpen(f: Facility, now = new Date()) {
  if (!f.hours) return true;
  const day = now.getDay();
  if (f.days === "จ.–ศ." && (day === 0 || day === 6)) return false;
  if (f.days === "จ.–ส." && day === 0) return false;
  const h = now.getHours() + now.getMinutes() / 60;
  return h >= f.hours[0] && h < f.hours[1];
}

export function hoursLabel(f: Facility) {
  if (!f.hours) return "เปิด 24 ชั่วโมง";
  const pad = (n: number) => `${String(n).padStart(2, "0")}:00`;
  return `${f.days} ${pad(f.hours[0])}–${pad(f.hours[1])}`;
}
