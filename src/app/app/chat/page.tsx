"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Moon, RotateCcw, SendHorizontal, Siren, Utensils, Brain, Dumbbell } from "lucide-react";
import { Robot } from "@/components/Logo";
import { FEATURE } from "@/components/theme";
import { redFlag } from "@/lib/chat";
import { useCare, useHydrated, type ChatMessage } from "@/lib/store";

const SUGGESTIONS = [
  { text: "ช่วงนี้นอนไม่ค่อยหลับ ตื่นมาไม่สดชื่น", icon: Moon, tone: "text-indigo-500" },
  { text: "กินชานมทุกวัน จะเสี่ยงเบาหวานไหม", icon: Utensils, tone: "text-emerald-500" },
  { text: "ทำงานเครียด ปวดหัวบ่อย", icon: Brain, tone: "text-amber-500" },
  { text: "อยากเริ่มออกกำลังกาย แต่ไม่มีเวลา", icon: Dumbbell, tone: "text-orange-500" },
];

const WELCOME =
  "สวัสดีครับ 👋 ผม CARE+ ผู้ช่วยด้านสุขภาพของคุณ ยินดีที่ได้คุยด้วยครับ\n\nเล่าอาการ พฤติกรรมการกิน การนอน หรือความเครียดให้ฟังได้เลย ผมจะถามเพิ่มนิดหน่อย แล้วช่วยดูว่ามีปัจจัยเสี่ยงอะไรที่ควรใส่ใจครับ";

/** Tiny renderer for the subset of markdown the assistant is told to use: **bold** and "- " lists. */
function Rich({ text }: { text: string }) {
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    );
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length)
      blocks.push(
        <ul key={blocks.length} className="my-1 list-disc space-y-0.5 pl-5">
          {list.map((l, i) => (
            <li key={i}>{inline(l)}</li>
          ))}
        </ul>,
      );
    list = [];
  };
  for (const line of text.split("\n")) {
    if (/^\s*[-•]\s+/.test(line)) list.push(line.replace(/^\s*[-•]\s+/, ""));
    else {
      flush();
      if (line.trim()) blocks.push(<p key={blocks.length}>{inline(line)}</p>);
    }
  }
  flush();
  return <div className="space-y-2">{blocks}</div>;
}

function Bubble({ m }: { m: Pick<ChatMessage, "role" | "content"> }) {
  if (m.role === "user")
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg bg-gradient-to-br from-sky-400 to-blue-500 px-4 py-2.5 text-white shadow-soft">
          {m.content}
        </div>
      </div>
    );
  return (
    <div className="flex items-start gap-2.5">
      <Robot className="mt-0.5 size-10 shrink-0 ring-2 ring-white" />
      <div className="max-w-[85%] rounded-3xl rounded-tl-lg border border-hairline bg-white px-4 py-3 leading-relaxed shadow-soft">
        <Rich text={m.content} />
      </div>
    </div>
  );
}

export default function Chat() {
  const ready = useHydrated();
  const chat = useCare((s) => s.chat);
  const setChat = useCare((s) => s.setChat);
  const profile = useCare((s) => s.profile);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<string | null>(null);
  const [emergency, setEmergency] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat, busy]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    setInput("");
    if (redFlag(content)) setEmergency(true);
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content };
    const history = [...chat, userMsg];
    const reply: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: "" };
    setChat(history);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })), profile }),
      });
      if (!res.ok || !res.body) throw new Error(String(res.status));
      setMode(res.headers.get("X-Care-Mode"));
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply.content += dec.decode(value, { stream: true });
        setChat([...history, { ...reply }]);
      }
    } catch {
      setChat([...history, { ...reply, content: "ขออภัย ตอนนี้เชื่อมต่อไม่ได้ ลองส่งใหม่อีกครั้งนะ" }]);
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return <div className="h-96 animate-pulse rounded-card bg-surface" />;
  const waiting = busy && chat.at(-1)?.role === "user";

  return (
    <div className="mx-auto flex max-w-2xl flex-col" style={{ minHeight: "calc(100dvh - 12rem)" }}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`grid size-12 shrink-0 place-items-center rounded-full text-white shadow-soft ${FEATURE.chat.solid}`}>
            <FEATURE.chat.icon className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#123a73]">คุยกับ AI</h1>
            <p className="text-sm text-muted">
              {mode === "offline"
                ? "โหมดสาธิตออฟไลน์ (ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY)"
                : profile
                  ? "AI ใช้ข้อมูลสุขภาพที่คุณบันทึกไว้ประกอบคำตอบ"
                  : "บอกอาการและพฤติกรรมสุขภาพของคุณ"}
            </p>
          </div>
        </div>
        {chat.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setChat([]);
              setEmergency(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted hover:bg-surface hover:text-ink"
          >
            <RotateCcw className="size-3.5" /> เริ่มใหม่
          </button>
        )}
      </header>

      {emergency && (
        <a href="tel:1669" className="mb-4 flex items-center gap-3 rounded-2xl bg-high-soft p-4 text-sm" role="alert">
          <Siren className="size-5 shrink-0 text-high" />
          <span>
            <span className="font-semibold text-high">อาการนี้อาจเป็นเหตุฉุกเฉิน</span> แตะเพื่อโทร 1669 ทันที
          </span>
        </a>
      )}

      <div className="flex-1 space-y-4" aria-live="polite">
        <Bubble m={{ role: "assistant", content: WELCOME }} />
        {chat.map((m) => (m.content ? <Bubble key={m.id} m={m} /> : null))}
        {waiting && (
          <div className="flex items-center gap-2.5" aria-label="AI กำลังพิมพ์">
            <Robot className="size-10 ring-2 ring-white" />
            <span className="flex gap-1 rounded-3xl border border-hairline bg-white px-4 py-3.5 shadow-soft">
              {[0, 1, 2].map((i) => (
                <span key={i} className="typing-dot size-1.5 rounded-full bg-muted" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
          </div>
        )}
        <div ref={end} />
      </div>

      {chat.length === 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {SUGGESTIONS.map(({ text, icon: Icon, tone }) => (
            <button
              key={text}
              type="button"
              onClick={() => send(text)}
              className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-2 text-left text-sm shadow-soft transition hover:border-blue-300"
            >
              <Icon className={`size-4 shrink-0 ${tone}`} /> {text}
            </button>
          ))}
        </div>
      )}

      <form
        className="sticky bottom-16 mt-6 bg-gradient-to-t from-page via-page to-transparent pb-3 pt-4 lg:bottom-0"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <div className="flex items-end gap-2 rounded-full border border-blue-100 bg-white p-2 pl-3 shadow-soft focus-within:border-blue-400">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder="พิมพ์อาการหรือคำถามของคุณ…"
            aria-label="ข้อความ"
            className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 outline-none [field-sizing:content]"
          />
          <button
            type="submit"
            disabled={!input.trim() || busy}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white transition disabled:opacity-40"
            aria-label="ส่ง"
          >
            <SendHorizontal className="size-5" />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted">AI ให้ข้อมูลเบื้องต้น ไม่ใช่การวินิจฉัยโรค · ฉุกเฉินโทร 1669</p>
      </form>
    </div>
  );
}
