"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Home } from "lucide-react";
import { useCare, useHydrated } from "@/lib/store";
import { Logo } from "./Logo";
import { FEATURE } from "./theme";

const ITEMS = [
  { href: "/app", label: "หน้าหลัก", icon: Home },
  { href: FEATURE.quiz.href, label: FEATURE.quiz.title, short: "ประเมิน", icon: FEATURE.quiz.icon, desktopOnly: true },
  { href: "/app/result", label: "ผลประเมิน", icon: Activity },
  { href: FEATURE.choice.href, label: FEATURE.choice.title, short: "ทางเลือก", icon: FEATURE.choice.icon },
  { href: FEATURE.missions.href, label: FEATURE.missions.title, short: "ภารกิจ", icon: FEATURE.missions.icon },
  { href: FEATURE.pet.href, label: FEATURE.pet.title, icon: FEATURE.pet.icon },
];

/** Spendable XP, always in view so finishing a mission and feeding the cat feel connected. */
function XpBadge({ className = "" }: { className?: string }) {
  const ready = useHydrated();
  const xp = useCare((s) => s.xp);
  return (
    <Link
      href="/app/pet"
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent-soft px-3 py-1.5 text-sm font-semibold tabular-nums text-accent-text ${className}`}
      aria-label={ready ? `มี ${xp} XP ไปดูแลน้องแมว` : "ไปดูแลน้องแมว"}
    >
      <span className="grid size-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-white" aria-hidden="true">
        XP
      </span>
      {ready ? xp : "–"}
    </Link>
  );
}

export function AppNav() {
  const path = usePathname();
  const active = (href: string) => (href === "/app" ? path === "/app" : path.startsWith(href));

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-hairline px-4 py-7 lg:flex">
        <Logo className="px-3" />
        <XpBadge className="mx-3 mt-6 self-start" />
        <nav className="mt-6 flex flex-col gap-1" aria-label="เมนูแอป">
          {ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-[15px] transition ${
                active(href) ? "bg-ink font-semibold text-white" : "font-medium text-ink hover:bg-surface"
              }`}
            >
              <Icon className="size-[18px]" strokeWidth={2.2} /> {label}
            </Link>
          ))}
        </nav>
        <p className="mt-auto px-4 text-xs leading-relaxed text-muted">ประเมินความเสี่ยงเบื้องต้น ไม่ใช่การวินิจฉัยโรค ฉุกเฉินโทร 1669</p>
      </aside>

      <header className="sticky top-[env(safe-area-inset-top,0px)] z-30 flex h-16 items-center gap-2 border-b border-hairline bg-bg/90 px-4 backdrop-blur lg:hidden">
        <Logo href="/app" />
        <XpBadge className="ml-auto" />
        <Link href="/app/quiz" className="whitespace-nowrap rounded-full border border-hairline px-3.5 py-1.5 text-sm">
          ประเมินใหม่
        </Link>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-hairline bg-bg/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur lg:hidden"
        aria-label="เมนูแอป"
      >
        {ITEMS.filter((i) => !i.desktopOnly).map(({ href, label, short, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={active(href) ? "page" : undefined}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] text-ink ${active(href) ? "font-bold" : "font-semibold"}`}
          >
            <span className={`grid h-7 w-12 place-items-center rounded-full transition ${active(href) ? "bg-ink text-white" : ""}`}>
              <Icon className="size-[18px]" strokeWidth={2.2} />
            </span>
            {short ?? label}
          </Link>
        ))}
      </nav>
    </>
  );
}
