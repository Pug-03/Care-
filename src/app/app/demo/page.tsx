"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SAMPLE_PROFILE } from "@/lib/health";
import { useCare } from "@/lib/store";

/** Loads the sample profile so judges and first-time visitors can see every screen filled in. */
export default function Demo() {
  const router = useRouter();
  useEffect(() => {
    useCare.getState().setProfile(SAMPLE_PROFILE);
    router.replace("/app");
  }, [router]);
  return <p className="text-muted">กำลังโหลดข้อมูลตัวอย่าง…</p>;
}
