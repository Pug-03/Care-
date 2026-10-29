"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Check,
  Cloud,
  Cookie,
  Droplet,
  Feather,
  Fish,
  Hand,
  Heart,
  Volleyball,
  Zap,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { CatFace, CatForm } from "@/components/Logo";
import { btn, Card, PageHead } from "@/components/ui";
import { useNow } from "@/components/useNow";
import { streakOf } from "@/lib/missions";
import { canPat, catNow, FORMS, ITEMS, KIND_LABEL, STAT_LABEL, type Form, type Item, type ItemKind, type Stat } from "@/lib/pet";
import { useCare, useHydrated } from "@/lib/store";

const KIND_TINT: Record<ItemKind, string> = { food: "bg-amber-100", toy: "bg-rose-100", rest: "bg-indigo-100" };

const ITEM_ICON: Record<string, LucideIcon> = {
  kibble: Cookie,
  fish: Fish,
  water: Droplet,
  yarn: Volleyball,
  feather: Feather,
  cushion: Cloud,
  blanket: BedDouble,
};

/** Each stat keeps one colour everywhere: its icon tile, its bar, and the item effects that raise it. */
const STAT: Record<Stat, { icon: LucideIcon; tile: string; bar: string; text: string }> = {
  full: { icon: Utensils, tile: "bg-amber-100", bar: "bg-amber-400", text: "text-amber-800" },
  joy: { icon: Heart, tile: "bg-rose-100", bar: "bg-rose-400", text: "text-rose-700" },
  energy: { icon: Zap, tile: "bg-indigo-100", bar: "bg-accent", text: "text-accent-text" },
};

const STATS = Object.keys(STAT_LABEL) as Stat[];
const LOW = 30;
const GLOW_STREAK = 3;

function Effects({ effect }: { effect: Item["effect"] }) {
  return (
    <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs font-medium">
      {(Object.entries(effect) as [Stat, number][]).map(([k, v]) => (
        <span key={k} className={`tabular-nums ${v > 0 ? STAT[k].text : "text-muted"}`}>
          {STAT_LABEL[k]} {v > 0 ? "+" : "−"}
          {Math.abs(v)}
        </span>
      ))}
    </span>
  );
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
  const [given, setGiven] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const catRef = useRef<HTMLDivElement>(null);

  // A little happy hop when the cat gets something. Skipped when the user prefers reduced motion.
  const hop = () => {
    const el = catRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.animate(
      [
        { transform: "translateY(0) scale(1, 1)" },
        { transform: "translateY(2px) scale(1.04, 0.96)", offset: 0.15 },
        { transform: "translateY(-18px) scale(0.98, 1.03)", offset: 0.45 },
        { transform: "translateY(0) scale(1.02, 0.98)", offset: 0.75 },
        { transform: "translateY(0) scale(1, 1)" },
      ],
      { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  };

  // The cat's reply shows for a few seconds, then it goes back to saying how it feels.
  useEffect(() => {
    if (!said) return;
    const t = setTimeout(() => setSaid(null), 6000);
    return () => clearTimeout(t);
  }, [said]);
  // The "given" tick on a bought item lasts a moment.
  useEffect(() => {
    if (!given) return;
    const t = setTimeout(() => setGiven(null), 1800);
    return () => clearTimeout(t);
  }, [given]);

  if (!ready) return <div className="h-96 animate-pulse rounded-card bg-surface" aria-busy="true" />;

  const { pet, form, mood, text } = catNow(saved, done, now);
  const info = FORMS[form];
  const patReady = canPat(saved, now);
  const streak = streakOf(done, now);
  const cheapest = Math.min(...ITEMS.map((i) => i.cost));
  const priciest = Math.max(...ITEMS.map((i) => i.cost));

  const onBuy = (item: Item) => {
    if (!buy(item.id)) return;
    setSaid(item.kind === "food" ? `อร่อยจัง ขอบคุณสำหรับ${item.name}นะ` : item.kind === "toy" ? `สนุกมาก! เล่น${item.name}อีกได้มั้ย` : "สบายจัง ขอนอนพักแป๊บนึงนะ");
    setGiven(item.id);
    setNotice(`ให้${item.name}แล้ว เหลือ ${xp - item.cost} XP`);
    hop();
  };

  const onPat = () => {
    if (!patPet()) return;
    setSaid("ชอบจัง ลูบหัวอีกได้นะ");
    hop();
  };

  return (
    <>
      <PageHead
        feature="pet"
        title="น้องแมว"
        sub="ใช้ XP จากภารกิจสุขภาพแลกอาหาร ของเล่น และที่นอนให้น้อง ยิ่งคุณดูแลตัวเองสม่ำเสมอ น้องก็ยิ่งสดใส"
      />

      <div className="stagger space-y-10">
        <div className="grid items-start gap-6 lg:grid-cols-2">
          {/* The cat: who it is, how it feels, and what it needs. */}
          <Card className="overflow-hidden lg:sticky lg:top-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="text-3xl font-bold tracking-tight">{info.nick}</h2>
              <p className="text-sm font-semibold text-accent-text">{info.name}</p>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted">{info.quote}</p>

            <div className="relative mt-4 flex justify-center">
              <span className="absolute inset-x-12 bottom-1 h-7 rounded-[50%] bg-sky-100 blur-md" aria-hidden="true" />
              <div ref={catRef} className="relative origin-bottom">
                <CatForm key={form} form={form} priority className="float relative h-60 w-auto max-w-full sm:h-72" alt={`${info.name} ${info.nick}`} />
              </div>
            </div>

            {/* Speech bubble with a tail pointing up at the cat. */}
            <div className="relative mt-4">
              <span className="absolute -top-[7px] left-1/2 size-3.5 -translate-x-1/2 rotate-45 border-l border-t border-hairline bg-bg" aria-hidden="true" />
              <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-bg px-4 py-3 shadow-soft" role="status" aria-live="polite">
                <CatFace mood={mood} form={form} className="size-11 shrink-0" />
                <p className="text-[0.95rem] leading-snug">{said ?? text}</p>
              </div>
            </div>

            <ul className="mt-6 space-y-4" aria-label="สถานะของน้อง">
              {STATS.map((k) => {
                const s = STAT[k];
                const low = pet[k] < LOW;
                return (
                  <li key={k} className="flex items-center gap-3">
                    <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${s.tile}`} aria-hidden="true">
                      <s.icon className="size-4" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
                        <span className="font-medium">
                          {STAT_LABEL[k]}
                          {low && <span className="ml-2 text-xs font-semibold text-high">ต่ำ ต้องดูแล</span>}
                        </span>
                        <span className={`tabular-nums ${low ? "font-semibold text-high" : "text-muted"}`}>
                          {pet[k]}
                          <span className="text-muted">/100</span>
                        </span>
                      </div>
                      <div
                        className="h-2.5 overflow-hidden rounded-full bg-surface-2"
                        role="meter"
                        aria-label={STAT_LABEL[k]}
                        aria-valuenow={pet[k]}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div className={`h-full rounded-full transition-[width] duration-700 ease-out ${s.bar}`} style={{ width: `${pet[k]}%` }} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <button type="button" disabled={!patReady} onClick={onPat} className={`${btn.ghost} mt-6 w-full disabled:border-hairline disabled:bg-surface disabled:text-muted disabled:hover:bg-surface disabled:active:scale-100`}>
              <Hand className="size-4" aria-hidden="true" />
              {patReady ? "ลูบหัวน้อง · ฟรี ชั่วโมงละครั้ง" : "เพิ่งลูบหัวไป กลับมาลูบใหม่ในชั่วโมงหน้า"}
            </button>
          </Card>

          {/* The shop: what each thing costs, what it does, and what you have. */}
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">แลกของให้น้อง</h2>
                <p className="mt-1 text-sm text-muted">แตะครั้งเดียว น้องได้รับทันที</p>
              </div>
              <div className="shrink-0 rounded-2xl bg-accent-soft px-4 py-2 text-right">
                <p className="text-xs font-medium text-accent-text">XP ของคุณ</p>
                <p className="text-2xl font-bold leading-tight tabular-nums text-accent-text">{xp}</p>
              </div>
            </div>
            <p className="sr-only" role="status" aria-live="polite">
              {notice}
            </p>

            {xp < cheapest && (
              <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-relaxed">XP ยังไม่พอแลกของชิ้นไหนเลย ทำภารกิจสักข้อแล้วกลับมาหาน้องนะ</p>
                <Link href="/app/missions" className={`${btn.primary} shrink-0`}>
                  ไปทำภารกิจ <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            )}

            {(Object.keys(KIND_LABEL) as ItemKind[]).map((kind) => (
              <section key={kind} className="mt-6" aria-labelledby={`kind-${kind}`}>
                <h3 id={`kind-${kind}`} className="mb-2 text-sm font-semibold text-muted">
                  {KIND_LABEL[kind]}
                </h3>
                <ul className="space-y-2">
                  {ITEMS.filter((i) => i.kind === kind).map((item) => {
                    const Icon = ITEM_ICON[item.id] ?? Fish;
                    const short = item.cost - xp;
                    const justGiven = given === item.id;
                    const raises = (Object.entries(item.effect) as [Stat, number][]).filter(([, v]) => v > 0).map(([k]) => k);
                    const wasted = raises.length > 0 && raises.every((k) => pet[k] >= 100);
                    return (
                      <li key={item.id} className="flex items-center gap-3 rounded-2xl border border-hairline p-3 transition-colors hover:border-ink/20">
                        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${KIND_TINT[kind]}`} aria-hidden="true">
                          <Icon className="size-5" strokeWidth={1.8} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[0.95rem] font-semibold leading-snug">{item.name}</span>
                          <span className="block text-xs text-muted">{wasted ? `${raises.map((k) => STAT_LABEL[k]).join("และ")}เต็มแล้ว ยังไม่ต้องแลก` : item.detail}</span>
                          <Effects effect={item.effect} />
                        </span>
                        <button
                          type="button"
                          disabled={short > 0}
                          onClick={() => onBuy(item)}
                          aria-label={short > 0 ? `${item.name} ${item.cost} XP ขาดอีก ${short} XP` : `แลก${item.name} ใช้ ${item.cost} XP`}
                          className={`inline-flex min-h-11 w-[6.75rem] shrink-0 flex-col items-center justify-center rounded-full px-3 text-sm font-semibold leading-tight tabular-nums transition active:scale-[0.97] disabled:active:scale-100 ${
                            justGiven ? "bg-good text-white" : short > 0 ? "bg-surface text-muted" : "bg-ink text-white hover:bg-accent"
                          }`}
                        >
                          {justGiven ? (
                            <span className="inline-flex items-center gap-1">
                              <Check className="size-4" aria-hidden="true" /> ให้แล้ว
                            </span>
                          ) : short > 0 ? (
                            <>
                              <span>{item.cost} XP</span>
                              <span className="text-[0.7rem] font-medium">ขาดอีก {short}</span>
                            </>
                          ) : (
                            <span>แลก {item.cost} XP</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            {xp >= cheapest && xp < priciest && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-5">
                <p className="text-sm text-muted">อยากได้ชิ้นที่เหลือ? ทำภารกิจเพิ่มเพื่อเก็บ XP</p>
                <Link href="/app/missions" className={btn.ghost}>
                  ไปทำภารกิจ <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* The four characters and what brings each one out. */}
        <section aria-labelledby="forms-head">
          <h2 id="forms-head" className="text-xl font-bold tracking-tight">
            4 ร่างของน้องแมว
          </h2>
          <p className="mt-1 text-sm text-muted">ไม่ต้องใช้ XP น้องเปลี่ยนร่างเองตามการดูแลตัวเองของคุณ</p>
          <ul className="mt-5 grid grid-cols-1 gap-3 min-[440px]:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(FORMS) as Form[]).map((k) => {
              const f = FORMS[k];
              const isCurrent = k === form;
              return (
                <li
                  key={k}
                  aria-current={isCurrent ? "true" : undefined}
                  className={`flex flex-col rounded-card border p-4 ${isCurrent ? "border-accent bg-accent-soft/60 ring-1 ring-accent" : "border-hairline bg-bg"}`}
                >
                  <CatForm form={k} className="mx-auto h-28 w-auto max-w-full" alt="" />
                  <p className="mt-3 font-semibold">
                    {f.nick} <span className="text-sm font-normal text-muted">{f.name}</span>
                  </p>
                  {isCurrent && <span className="mt-1.5 self-start rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white">ร่างตอนนี้</span>}
                  <p className="mt-2 text-xs font-semibold text-muted">น้องเป็นร่างนี้เมื่อ</p>
                  <p className="mt-0.5 text-sm leading-relaxed">{f.when}</p>
                  {k === "glow" && !isCurrent && (
                    <div className="mt-auto pt-3">
                      <p className="text-xs tabular-nums text-muted">
                        ทำภารกิจต่อเนื่องแล้ว {Math.min(streak, GLOW_STREAK)}/{GLOW_STREAK} วัน
                      </p>
                      <div className="mt-1 flex gap-1" aria-hidden="true">
                        {Array.from({ length: GLOW_STREAK }, (_, i) => (
                          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < streak ? "bg-accent" : "bg-surface-2"}`} />
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
