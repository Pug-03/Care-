import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/** Heart with a pulse line, the CARE+ symbol. Flat accent, no gradient. */
export function Mark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 36" className={className} aria-hidden="true">
      <path d="M20 34S2 23.5 2 11.6A9.6 9.6 0 0 1 20 6.9a9.6 9.6 0 0 1 18 4.7C38 23.5 20 34 20 34Z" fill="var(--accent)" />
      <path d="M7 18h6l2.6-5 4 10 3-7 1.8 2H33" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ href = "/", className = "" }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2.5 ${className}`} aria-label="CARE+ หน้าแรก">
      <Mark />
      <span className="text-xl font-bold tracking-tight">
        CARE<span className="text-accent">+</span>
      </span>
    </Link>
  );
}

/** The CARE+ robot from the app icon, as a round avatar. */
export function Robot({ className = "size-10", priority = false }: { className?: string; priority?: boolean }) {
  return <Image src="/brand/robot.jpg" alt="" width={256} height={256} priority={priority} className={`rounded-full bg-sky-50 object-cover ${className}`} />;
}

export function AppIcon({ className = "size-40", priority = false }: { className?: string; priority?: boolean }) {
  return <Image src="/brand/icon.png" alt="ไอคอนแอป CARE+" width={512} height={519} priority={priority} className={className} />;
}

/** Robot with a speech bubble. */
export function RobotSays({ children, className = "", size = "size-14" }: { children: ReactNode; className?: string; size?: string }) {
  return (
    <div className={`flex items-end gap-2 ${className}`}>
      <p className="mb-3 max-w-56 rounded-2xl rounded-br-md border border-hairline bg-bg px-3.5 py-2.5 text-sm leading-snug shadow-soft">{children}</p>
      <Robot className={`${size} shrink-0 shadow-soft ring-4 ring-white`} />
    </div>
  );
}

/** Round robot button fixed to the corner, the way PeelPlan keeps its sticker logo within reach. Opens the chat. Sits above the app's mobile tab bar when there is one. */
export function RobotButton({ aboveTabBar = false }: { aboveTabBar?: boolean }) {
  return (
    <Link
      href="/app/chat"
      aria-label="คุยกับน้อง CARE+"
      className={`group fixed ${aboveTabBar ? "bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)]" : "bottom-[calc(env(safe-area-inset-bottom,0px)+1.25rem)]"} right-4 z-40 grid size-16 place-items-center rounded-full bg-white shadow-[0_8px_28px_rgb(11_11_15/0.16)] transition hover:-translate-y-1 lg:bottom-8 lg:right-8`}
    >
      <Robot className="size-14 transition group-hover:rotate-[-6deg]" />
      <span className="absolute -top-1 right-0 size-3.5 rounded-full border-2 border-white bg-accent" aria-hidden="true" />
    </Link>
  );
}
