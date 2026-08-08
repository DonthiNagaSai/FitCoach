# FitCoach AI

Full-stack fitness app: Next.js (App Router, TypeScript, Tailwind v4) + Supabase (auth/database) + Claude API for AI-generated workout/diet plans and a conversational coach.

Ported from a Figma Make UI prototype into a real, working app — real auth, real database persistence, real AI calls (no more mock data).

## Stack

- **Frontend/backend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- **Auth + database**: Supabase (Postgres, built-in auth, Row Level Security)
- **AI**: Claude API (`@anthropic-ai/sdk`), called server-side only from `/api/plans/generate` and `/api/coach`
- **Charts**: Recharts

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), create a free project.
2. In the SQL Editor, run the contents of `supabase/schema.sql` — this creates the `profiles`, `plans`, `weight_logs`, and `chat_messages` tables with Row Level Security so users can only ever read/write their own data.
3. In **Project Settings > API**, copy the Project URL and the `anon public` key.

### 3. Get a Claude API key

Create a key at [console.anthropic.com](https://console.anthropic.com) (used server-side to generate plans and power the coach chat).

### 4. Set environment variables

Copy `.env.example` to `.env.local` and fill in the three values:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=your-claude-api-key
```

### 5. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, complete onboarding, and it'll call Claude to generate your first real plan.

## How it's wired together

- **Auth**: Supabase Auth via `@supabase/ssr`. `src/lib/supabase/client.ts` for client components, `src/lib/supabase/server.ts` for API routes. The `(app)` route group layout (`src/app/(app)/layout.tsx`) checks for a session and redirects to `/login` if none exists.
- **Plan generation**: `POST /api/plans/generate` (`src/app/api/plans/generate/route.ts`) sends the user's profile to Claude with a prompt asking for structured JSON (a 7-day workout split + a diet plan with macro targets), parses it, and stores it in the `plans` table.
- **AI coach**: `POST /api/coach` (`src/app/api/coach/route.ts`) sends the user's message plus their profile and latest plan as context to Claude, and returns the reply. Chat history is persisted client-side to the `chat_messages` table.
- **Progress tracking**: the Progress page reads/writes the `weight_logs` table directly from the browser (protected by Row Level Security, so this is safe without going through an API route).

## Known simplifications (good "what's next" talking points for interviews)

- Exercise/meal completion checkboxes on Dashboard/Workouts/Diet are local UI state, not yet persisted — a natural next step is a `plan_progress` table.
- Settings currently saves profile fields; password change/account deletion UI is stubbed with real Supabase Auth calls to add (`supabase.auth.updateUser`, admin API for deletion).
- No email notifications yet (daily reminders, weekly summaries) — would use a cron job (Vercel Cron / Supabase Edge Functions) + an email provider like Resend.

## Deploying

Push to GitHub, import into [Vercel](https://vercel.com), add the same three environment variables in the Vercel project settings, deploy. Supabase requires no separate deployment — it's already hosted.

## A note on this environment

This project was built and code-reviewed manually in a sandbox with no network access, so `npm install` / `npm run build` haven't been run yet. Run both locally after setup to confirm everything compiles — if TypeScript flags anything, it'll be minor (most likely a Supabase or Anthropic SDK type signature that shifted in a recent version bump; pinning the exact versions from `package.json` should avoid this).
