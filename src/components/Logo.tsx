import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Form, Mood } from "@/lib/pet";

/** The CARE+ cat's face, cropped from the app icon. Used as the mark and the mascot avatar. */
export function Mark({ className = "size-8" }: { className?: string }) {
  return <Image src="/brand/cat-hd.png" alt="" width={256} height={256} className={`rounded-[30%] object-cover ${className}`} />;
}

export function Logo({ href = "/", className = "" }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2.5 ${className}`} aria-label="CARE+ หน้าแรก">
      <Mark className="size-9" />
      <span className="text-xl font-bold tracking-tight max-[380px]:sr-only">
        CARE<span className="text-accent">+</span>
      </span>
    </Link>
  );
}

/** The cat mascot as a round avatar. */
export function Cat({ className = "size-10", priority = false }: { className?: string; priority?: boolean }) {
  return <Image src="/brand/cat-hd.png" alt="" width={256} height={256} priority={priority} className={`rounded-full bg-sky-50 object-cover ${className}`} />;
}

export function AppIcon({ className = "size-40", priority = false }: { className?: string; priority?: boolean }) {
  return <Image src="/brand/icon.png" alt="ไอคอนแอป CARE+ รูปแมวกับใบไม้อ่อน" width={512} height={512} priority={priority} className={className} />;
}

const FORM_SIZE: Record<Form, [number, number]> = { sprout: [811, 900], cloud: [778, 900], cozy: [1041, 900], glow: [669, 900] };

/** One of the four cat characters, full body. */
export function CatForm({ form, className = "", priority = false, alt = "" }: { form: Form; className?: string; priority?: boolean; alt?: string }) {
  const [w, h] = FORM_SIZE[form];
  return <Image src={`/brand/cats/${form}-hd.png`} alt={alt} width={w} height={h} priority={priority} className={`object-contain ${className}`} />;
}

/** The cat's face for a mood. Mood faces exist for Sprout only, so the other characters show their own picture instead. */
export function CatFace({ mood, form = "sprout", className = "size-12" }: { mood: Mood; form?: Form; className?: string }) {
  if (form !== "sprout") return <CatForm form={form} className={className} />;
  return <Image src={`/brand/cats/sprout-${mood}.png`} alt="" width={180} height={170} className={`object-contain ${className}`} />;
}

/** Cat with a speech bubble. */
export function CatSays({ children, className = "", size = "size-14" }: { children: ReactNode; className?: string; size?: string }) {
  return (
    <div className={`flex items-end gap-2 ${className}`}>
      <p className="mb-3 max-w-56 rounded-2xl rounded-br-md border border-hairline bg-bg px-3.5 py-2.5 text-sm leading-snug shadow-soft">{children}</p>
      <Cat className={`${size} shrink-0 shadow-soft ring-4 ring-white`} />
    </div>
  );
}
