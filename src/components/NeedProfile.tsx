"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ClipboardList } from "lucide-react";
import type { Profile } from "@/lib/health";
import { useCare, useHydrated } from "@/lib/store";
import { btn } from "./ui";

/** Renders children with the saved profile, or a prompt to fill one in. */
export function NeedProfile({ children, what }: { children: (p: Profile) => ReactNode; what: string }) {
  const ready = useHydrated();
  const profile = useCare((s) => s.profile);
  if (!ready) return <div className="h-64 animate-pulse rounded-card bg-surface" aria-busy="true" />;
  if (!profile)
    return (
      <div className="rounded-card border border-dashed border-hairline p-8 text-center sm:p-12">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent-text">
          <ClipboardList className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-semibold">กรอกข้อมูลสุขภาพก่อน เพื่อ{what}</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">ใช้เวลาประมาณ 3 นาที ข้อมูลเก็บไว้ในเบราว์เซอร์ของคุณเท่านั้น</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/app/check" className={btn.primary}>
            กรอกข้อมูลสุขภาพ
          </Link>
          <Link href="/app/demo" className={btn.ghost}>
            ใช้ข้อมูลตัวอย่าง
          </Link>
        </div>
      </div>
    );
  return <>{children(profile)}</>;
}
