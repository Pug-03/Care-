import Anthropic from "@anthropic-ai/sdk";
import { emergencyReply, offlineReply, profileContext, redFlag, SYSTEM_PROMPT } from "@/lib/chat";
import type { Profile } from "@/lib/health";

interface Body {
  messages: { role: "user" | "assistant"; content: string }[];
  profile: Profile | null;
}

const MAX_TURNS = 30;
const MAX_CHARS = 4000;

/** Streams a short text reply word by word, so offline and emergency replies feel the same as live ones. */
function streamText(text: string, mode: "live" | "offline" | "emergency") {
  const enc = new TextEncoder();
  const parts = text.match(/\S+\s*/g) ?? [text];
  return new Response(
    new ReadableStream({
      async start(c) {
        for (const p of parts) {
          c.enqueue(enc.encode(p));
          await new Promise((r) => setTimeout(r, 18));
        }
        c.close();
      },
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Care-Mode": mode } },
  );
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response("invalid JSON", { status: 400 });
  }
  const messages = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  // The conversation must start with a user turn.
  while (messages.length && messages[0].role !== "user") messages.shift();
  const last = messages.at(-1);
  if (!last || last.role !== "user") return new Response("last message must be from the user", { status: 400 });

  // Emergencies never wait on a model round trip.
  if (redFlag(last.content)) return streamText(emergencyReply(last.content), "emergency");

  if (!process.env.ANTHROPIC_API_KEY) return streamText(offlineReply(last.content, body.profile ?? null), "offline");

  const client = new Anthropic();
  const enc = new TextEncoder();
  const stream = client.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 4096,
    output_config: { effort: "low" },
    // Server-side fallback: if a safety classifier declines, the API retries on a suitable model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      { type: "text", text: `ข้อมูลสุขภาพของผู้ใช้ที่บันทึกในแอป:\n${profileContext(body.profile ?? null)}` },
    ],
    messages,
  });

  return new Response(
    new ReadableStream({
      async start(c) {
        let sent = false;
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              c.enqueue(enc.encode(event.delta.text));
              sent = true;
            }
          }
          const final = await stream.finalMessage();
          if (final.stop_reason === "refusal") c.enqueue(enc.encode("\n\nขออภัย ฉันตอบเรื่องนี้ไม่ได้ ลองถามเรื่องสุขภาพและพฤติกรรมในชีวิตประจำวันดูนะ"));
        } catch (err) {
          console.error("[CARE+] chat stream failed", err);
          // Nothing streamed yet: answer from the offline responder instead of leaving the user with an error.
          c.enqueue(enc.encode(sent ? "\n\n(การเชื่อมต่อขัดข้อง ลองส่งใหม่อีกครั้ง)" : offlineReply(last.content, body.profile ?? null)));
        } finally {
          c.close();
        }
      },
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Care-Mode": "live" } },
  );
}
