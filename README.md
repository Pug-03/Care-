# CARE+

**ระบบอัจฉริยะวิเคราะห์และจำลองแนวโน้มสุขภาพเพื่อส่งเสริมการปรับพฤติกรรม**
Team The Challengers · PSAT HealthHacks 2026

CARE+ helps people see how today's habits shape their future health. It screens NCD risk factors (diet, activity,
sleep, stress, tobacco, alcohol, weight, blood pressure), simulates "keep habits" vs "change habits" over 1–10 years,
turns the result into small daily actions, and points to nearby facilities by insurance right when a check-up is due.

> CARE+ is a screening and behaviour-change prototype. It does not diagnose and does not replace a doctor.

## Features

| Route | Feature |
| --- | --- |
| `/` | Landing page |
| `/app` | Home: daily overview (stress, sleep, BP, BMI), today's goals, tip of the day |
| `/app/check` | Health profile, 3 steps, with plausibility checks and consent |
| `/app/chat` | คุยกับ AI: Claude chat grounded in the saved profile; emergency keywords answered locally with 1669 / 1323 |
| `/app/analysis` | AI วิเคราะห์: overall risk, 4 NCD risk scores, ranked factors, "see a doctor" flag |
| `/app/simulate` | จำลองอนาคต: A/B projection with adjustable habits |
| `/app/plan` | แนะนำสิ่งที่ทำได้จริง: daily checklist and 7-day history (feedback loop) |
| `/app/care` | ถ้าควรพบแพทย์: facilities filtered by type, right (บัตรทอง / ประกันสังคม / ข้าราชการ), open now, distance |
| `/app/demo` | Loads a sample profile so every screen is filled in |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · zustand (persisted to localStorage) ·
lucide-react · GSAP + ScrollTrigger and Lenis (scroll motion, as in PeelPlan) · Anthropic SDK (`claude-opus-5-5`) · Vitest.

## Run

```bash
pnpm install
cp .env.example .env.local   # optional: add ANTHROPIC_API_KEY
pnpm dev
```

Without `ANTHROPIC_API_KEY` the chat runs an offline demo responder, so everything works with no keys.
With a key, `/api/chat` streams from Claude Opus 5.5 at `effort: "low"` with server-side refusal fallback enabled
(`fallbacks: "default"`).

```bash
pnpm test        # risk model, simulation, plan, clinics, chat safety
pnpm typecheck
pnpm lint
pnpm build
```

## How the model works

`src/lib/health.ts` is a transparent, rule-based heuristic built from the WHO NCD risk factors, Asian BMI cut-offs
(23 / 25) and BP bands (120/80, 140/90). Each condition (type 2 diabetes, hypertension, cardiovascular disease,
overweight) gets a weighted index mapped through a logistic curve to a 3–90 score.

`src/lib/simulate.ts` ages the profile year by year, drifting weight and systolic pressure according to the habits,
and reruns the same model. New habits phase in over the first year so both lines start from today's score.

Both are demonstration models for the prototype and **have not been clinically validated**. Weights should be reviewed
with medical staff before real use.

## Data and privacy

- All user data stays in the browser (`localStorage` key `careplus`). Nothing is stored server-side.
- The chat sends the conversation and a profile summary to the Anthropic API only when a key is configured.
- `src/lib/clinics.ts` is **sample data** with fictional facilities, labelled as such in the UI. Production needs an
  official source (MOPH facility registry, NHSO and SSO unit lists).

## Next steps

- Extract structured profile fields from the chat (tool use) so the conversation can fill in the health profile.
- Real facility directory and right lookup.
- Accounts and sync (e.g. Supabase) with explicit consent and data export/delete.
- Elder mode: larger type, text-to-speech, family caregiver view.
- Clinical review of risk weights and copy.
