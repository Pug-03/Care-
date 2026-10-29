"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bed, Fish, Hand, ToyBrick, type LucideIcon } from "lucide-react";
import { CatFace, CatForm } from "@/components/Logo";
import { Card, PageHead } from "@/components/ui";
import { useNow } from "@/components/useNow";
import { canPat, catNow, FORMS, ITEMS, KIND_LABEL, STAT_LABEL, type Form, type ItemKind, type Stat } from "@/lib/pet";
import { useCare, useHydrated } from "@/lib/store";

const KIND_ICON: Record<ItemKind, [LucideIcon, string]> = {
  food: [Fish, "bg-amber-100"],
  toy: [ToyBrick, "bg-rose-100"],
  rest: [Bed, "bg-indigo-100"],
};

const STAT_COLOR: Record<Stat, string> = { full: "bg-amber-400", joy: "bg-rose-400", energy: "bg-accent" };

function effectText(effect: Partial<Record<Stat, number>>) {
  return (Object.entries(effect) as [Stat, number][]).map(([k, v]) => `${STAT_LABEL[k]} ${v > 0 ? "+" : ""}${v}`).join(" · ");
}

export default function PetPage() {
  const ready = useHydrated();
  const now = useNow();
  const saved = useCare((s) => s.pet);
  const xp = useCare((s) => s.xp);
  const done = useCare((s) => s.done);
  const buy = useCare((s) => s.buy);
  const patPet = useCare((s) => s.patPet);
  const [said, setSaid] = useState<string | null>(null);
  // The cat's reply shows for a few seconds, then it goes back to saying how it feels.
  useEffect(() => {
    if (!said) return;
    const t = setTimeout(() => setSaid(null), 6000);
    return () => clearTimeout(t);
  }, [said]);

  if (!ready) return <div className="h-96 animate-pulse rounded-card bg-surface" aria-busy="true" />;

  const { pet, form, mood, text } = catNow(saved, done, now);
  const info = FORMS[form];
  const patReady = canPat(saved, now);

  const onBuy = (id: string) => {
    const item = ITEMS.find((i) => i.id === id)!;
    if (buy(id)) setSaid(item.kind === "food" ? `อร่อยจัง ขอบคุณสำหรับ${item.name}นะ` : item.kind === "toy" ? `สนุกมาก! เล่น${item.name}อีกได้มั้ย` : "สบายจัง ขอนอนพักแป๊บนึงนะ");
  };

  return (
    <>
      <PageHead
        feature="pet"
        title="น้องแมว"
        sub="Virtual Pet · ใช้ XP จากภารกิจสุขภาพแลกอาหารและไอเทม น้องจะเปลี่ยนไปตามการดูแลตัวเองของคุณ"
      />

      <div className="stagger space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-accent-text">{info.name}</p>
                <h2 className="text-2xl font-bold tracking-tight">{info.nick}</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-semibold tabular-nums text-accent-text">
                {xp} XP
              </span>
            </div>

            <div className="relative mt-2 flex justify-center">
              <span className="absolute inset-x-8 bottom-2 h-8 rounded-[50%] bg-sky-100/70 blur-md" aria-hidden="true" />
              <CatForm key={form} form={form} priority className="float relative h-64 w-auto max-w-full sm:h-72" alt={`${info.name} ${info.nick}`} />
            </div>

            <div className="mt-2 flex items-center gap-3 rounded-2xl bg-surface p-3" role="status">
              <CatFace mood={mood} className="size-12 shrink-0" />
              <p className="text-sm leading-snug">{said ?? text}</p>
            </div>

            <ul className="mt-5 space-y-3">
              {(Object.keys(STAT_LABEL) as Stat[]).map((k) => (
                <li key={k}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{STAT_LABEL[k]}</span>
                    <span className="tabular-nums text-muted">{pet[k]}/100</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2" role="meter" aria-label={STAT_LABEL[k]} aria-valuenow={pet[k]} aria-valuemin={0} aria-valuemax={100}>
                    <div className={`h-full rounded-full transition-[width] duration-500 ${STAT_COLOR[k]}`} style={{ width: `${pet[k]}%` }} />
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              disabled={!patReady}
              onClick={() => patPet() && setSaid("ชอบจัง ลูบหัวอีกได้นะ")}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-ink px-5 py-2.5 text-sm font-semibold transition hover:bg-ink hover:text-white disabled:border-hairline disabled:text-muted disabled:hover:bg-transparent"
            >
              <Hand className="size-4" /> {patReady ? "ลูบหัวน้อง (ฟรี ชั่วโมงละครั้ง)" : "น้องเพิ่งได้ลูบหัวไป กลับมาใหม่อีกนิดนะ"}
            </button>
          </Card>

          <Card>
            <h2 className="font-semibold">แลกของให้น้อง</h2>
            <p className="text-sm text-muted">ใช้ XP ที่ได้จากภารกิจ แลกแล้วน้องได้รับทันที</p>
            {(Object.keys(KIND_LABEL) as ItemKind[]).map((kind) => {
              const [Icon, tint] = KIND_ICON[kind];
              return (
                <section key={kind} className="mt-5">
                  <h3 className="mb-2 text-sm font-medium text-muted">{KIND_LABEL[kind]}</h3>
                  <ul className="space-y-2">
                    {ITEMS.filter((i) => i.kind === kind).map((item) => {
                      const short = xp < item.cost;
                      return (
                        <li key={item.id} className="flex items-center gap-3 rounded-2xl border border-hairline p-3">
                          <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tint}`} aria-hidden="true">
                            <Icon className="size-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium">{item.name}</span>
                            <span className="block text-xs text-muted">{effectText(item.effect)}</span>
                          </span>
                          <button
                            type="button"
                            disabled={short}
                            onClick={() => onBuy(item.id)}
                            aria-label={`แลก${item.name} ${item.cost} XP`}
                            className="shrink-0 rounded-full bg-ink px-3.5 py-1.5 text-sm font-semibold tabular-nums text-white transition hover:bg-accent disabled:bg-surface-2 disabled:text-muted"
                          >
                            {item.cost} XP
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
            {xp < Math.min(...ITEMS.map((i) => i.cost)) && (
              <Link href="/app/missions" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4">
                XP ไม่พอ ไปทำภารกิจกันก่อน <ArrowRight className="size-4" />
              </Link>
            )}
          </Card>
        </div>

        <section>
          <h2 className="font-semibold">4 ตัวละครแมว</h2>
          <p className="text-sm text-muted">น้องจะเปลี่ยนร่างไปตามพฤติกรรมสุขภาพของคุณ</p>
          <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {(Object.keys(FORMS) as Form[]).map((k) => (
              <li
                key={k}
                aria-current={k === form ? "true" : undefined}
                className={`rounded-card border p-4 ${k === form ? "border-accent bg-accent-soft/50" : "border-hairline bg-bg"}`}
              >
                <CatForm form={k} className="mx-auto h-28 w-auto max-w-full" />
                <p className="mt-3 text-sm font-semibold">
                  {FORMS[k].nick} <span className="font-normal text-muted">{FORMS[k].name}</span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{FORMS[k].when}</p>
                {k === form && <p className="mt-2 text-xs font-semibold text-accent-text">ตอนนี้</p>}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
