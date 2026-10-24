"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ClipboardList, Home, Hospital, MessageCircle, Sparkles, Target } from "lucide-react";
import { Logo } from "./Logo";

const ITEMS = [
  { href: "/app", label: "หน้าหลัก", icon: Home, mobile: true },
  { href: "/app/chat", label: "คุยกับ AI", icon: MessageCircle, mobile: true },
  { href: "/app/analysis", label: "AI วิเคราะห์", short: "สุขภาพ", icon: Activity, mobile: true },
  { href: "/app/simulate", label: "จำลองอนาคต", icon: Sparkles, mobile: false },
  { href: "/app/plan", label: "แผนของฉัน", short: "แผน", icon: Target, mobile: true },
  { href: "/app/care", label: "ถ้าควรพบแพทย์", short: "พบแพทย์", icon: Hospital, mobile: true },
  { href: "/app/check", label: "ข้อมูลสุขภาพ", icon: ClipboardList, mobile: false },
];

export function AppNav() {
  const path = usePathname();
  const active = (href: string) => (href === "/app" ? path === "/app" : path.startsWith(href));

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-hairline bg-white/80 px-4 py-6 backdrop-blur lg:flex">
        <Logo className="px-2" tagline />
        <nav className="mt-8 flex flex-col gap-1" aria-label="เมนูแอป">
          {ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active(href)
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 font-medium text-white shadow-[0_6px_16px_rgb(43_124_243/0.25)]"
                  : "text-muted hover:bg-blue-50 hover:text-ink"
              }`}
            >
              <Icon className="size-[18px]" /> {label}
            </Link>
          ))}
        </nav>
        <p className="mt-auto px-3 text-xs leading-relaxed text-muted">ประเมินความเสี่ยงเบื้องต้น ไม่ใช่การวินิจฉัยโรค · ฉุกเฉินโทร 1669</p>
      </aside>

      <header className="sticky top-[env(safe-area-inset-top,0px)] z-30 flex h-16 items-center border-b border-hairline bg-white/85 px-4 backdrop-blur lg:hidden">
        <Logo href="/app" tagline />
        <Link href="/app/check" className="ml-auto text-sm text-muted hover:text-ink">
          ข้อมูลของฉัน
        </Link>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-hairline bg-white/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur lg:hidden"
        aria-label="เมนูแอป"
      >
        {ITEMS.filter((i) => i.mobile).map(({ href, label, short, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={active(href) ? "page" : undefined}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${active(href) ? "font-semibold text-blue-600" : "text-muted"}`}
          >
            <Icon className="size-5" />
            {short ?? label}
          </Link>
        ))}
      </nav>
    </>
  );
}
