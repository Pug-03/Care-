# CARE+

**ระบบอัจฉริยะวิเคราะห์และจำลองแนวโน้มสุขภาพเพื่อส่งเสริมการปรับพฤติกรรม**
Team The Challengers · PSAT HealthHacks 2026

CARE+ is a prototype web app that gets people started on looking after their health through four linked parts:

1. **Health Risk Quiz** – questions about health behaviour, scored with predefined rules into a preliminary risk result.
2. **Health Choice** – side-by-side lifestyle choices backed by cited sources (WHO, AASM/SRS). General figures, never a personal prediction.
3. **Health Missions** – small daily missions picked from the quiz result (or by the user); finishing one pays XP.
4. **Virtual Pet** – spend XP on food, toys and rest items for a virtual cat. The cat has four characters (Sprout, Cloud, Cozy, Glow) that change with the user's habits.

Flow: quiz → result → compare choices → pick missions → earn XP → care for the cat → come back for new missions.

> CARE+ is a screening and behaviour-change prototype. It does not diagnose and does not replace a doctor.

## Features

| Route | Feature |
| --- | --- |
| `/` | Landing page |
| `/app` | Home: where you are in the flow, today's missions, the cat, latest result |
| `/app/quiz` | Health Risk Quiz, 3 steps, with plausibility checks and consent |
| `/app/result` | Preliminary result: overall risk, 4 NCD risk scores, ranked factors, "see a doctor" flag |
| `/app/choice` | Health Choice: cited comparisons; "pick option B" adds the matching mission |
| `/app/missions` | Health Missions: daily list, XP, streak, level |
| `/app/pet` | Virtual Pet: stats, shop, the four cat characters |
| `/app/care` | Facility finder, linked from the result when a check-up is advised (not in the menu) |
| `/app/demo` | Loads a sample profile so every screen is filled in |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · zustand (persisted to localStorage) ·
lucide-react · GSAP + ScrollTrigger and Lenis (scroll motion, as in PeelPlan) · Vitest.

## Run

```bash
pnpm install
pnpm dev
```

No API keys are needed; everything runs in the browser.

```bash
pnpm test        # risk model, missions, pet, clinics
pnpm typecheck
pnpm lint
pnpm build
```

## How the model works

`src/lib/health.ts` is a transparent, rule-based heuristic built from the WHO NCD risk factors, Asian BMI cut-offs
(23 / 25) and BP bands (120/80, 140/90). Each condition (type 2 diabetes, hypertension, cardiovascular disease,
overweight) gets a weighted index mapped through a logistic curve to a 3–90 score.

`src/lib/missions.ts` maps each factor that needs attention to missions. `src/lib/pet.ts` decays the cat's stats from the
last saved timestamp (no timers) and picks its character from the mission history: Cloud when the cat is neglected or no
mission was done for 2+ days, Glow on a 3+ day streak with a happy cat, Cozy after a sleep or stress mission today,
Sprout otherwise. `src/lib/choices.ts` holds the Health Choice content and its sources.

The risk model is a demonstration model for the prototype and **have not been clinically validated**. Weights should be reviewed
with medical staff before real use.

## Data and privacy

- All user data stays in the browser (`localStorage` key `careplus`). Nothing is stored server-side.
- `src/lib/clinics.ts` is **sample data** with fictional facilities, labelled as such in the UI. Production needs an
  official source (MOPH facility registry, NHSO and SSO unit lists).

## Next steps

- Real facility directory and right lookup.
- Accounts and sync (e.g. Supabase) with explicit consent and data export/delete.
- Elder mode: larger type, text-to-speech, family caregiver view.
- Clinical review of risk weights and copy.
