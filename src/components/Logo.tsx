import Image from "next/image";
import Link from "next/link";

/** Heart with a pulse line, the CARE+ wordmark symbol from the prototype header. */
export function Mark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 36" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="care-heart" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34c3e8" />
          <stop offset="1" stopColor="#1f5fd6" />
        </linearGradient>
      </defs>
      <path d="M20 34S2 23.5 2 11.6A9.6 9.6 0 0 1 20 6.9a9.6 9.6 0 0 1 18 4.7C38 23.5 20 34 20 34Z" fill="url(#care-heart)" />
      <path d="M6 18h7l2.6-5 4 10 3-7 1.8 2H34" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ href = "/", tagline = false, className = "" }: { href?: string; tagline?: boolean; className?: string }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2.5 ${className}`} aria-label="CARE+ หน้าแรก">
      <Mark />
      <span className="leading-none">
        <span className="block text-xl font-bold tracking-tight text-[#123a73]">
          CARE<span className="text-sky-500">+</span>
        </span>
        {tagline && <span className="mt-1 block text-[11px] text-muted">ดูแลวันนี้ เพื่ออนาคตที่ดีกว่า</span>}
      </span>
    </Link>
  );
}

/** The CARE+ robot, cropped to a round avatar. */
export function Robot({ className = "size-10", priority = false }: { className?: string; priority?: boolean }) {
  return <Image src="/brand/robot.jpg" alt="" width={256} height={256} priority={priority} className={`rounded-full object-cover ${className}`} />;
}

export function AppIcon({ className = "size-40", priority = false }: { className?: string; priority?: boolean }) {
  return <Image src="/brand/icon.png" alt="ไอคอนแอป CARE+ น้องหุ่นยนต์ผู้ช่วยสุขภาพ" width={512} height={519} priority={priority} className={className} />;
}

/** Robot with a speech bubble, used at the top right of feature screens. */
export function RobotSays({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <p className="relative mt-1 rounded-2xl rounded-tr-sm border border-hairline bg-bg px-3 py-2 text-xs leading-snug text-[#123a73] shadow-soft">
        {children}
      </p>
      <Robot className="size-14 shrink-0 ring-4 ring-white" />
    </div>
  );
}
