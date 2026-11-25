# FitCoach AI

A full-stack fitness app. You tell it about yourself, and it builds a 7-day workout split and a meal plan with calorie and macro targets. A chat coach answers questions with your profile and current plan as context, and a progress page charts your weight over time.

Built with Next.js, TypeScript and Tailwind on the front end, Supabase for sign-in and the database, and OpenAI's open-weight GPT-OSS 120B model running on Groq's free tier for the AI parts. The whole thing runs at no cost.

**Live demo:** https://fitcoach-ai-navy-one.vercel.app (sign up with any email, it's free)

## Stack

- Next.js 15 (App Router), TypeScript and Tailwind CSS v4
- Supabase: Postgres, built-in auth and Row Level Security
- Groq's OpenAI-compatible API (GPT-OSS 120B), called only from server-side routes
- Recharts for the progress chart

## Features

- Sign up, log in and an onboarding form for age, height, weight, goal, activity level, diet restrictions and equipment
- AI-generated 7-day workout split with sets, reps, weights and rest times
- AI-generated daily meal plan with calorie, protein, carb and fat targets
- Coach chat that knows your profile and latest plan
- Weight logging with a trend chart
- Daily caps per user (5 plans and 30 coach messages by default) so the free AI quota isn't used up by one person

## Running it locally

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run `supabase/schema.sql`. It creates the `profiles`, `plans`, `weight_logs` and `chat_messages` tables with Row Level Security, so each user can only read and write their own rows.
3. In **Project Settings > API**, copy the Project URL and the `anon` public key.

### 3. Get a Groq API key

Sign up at [console.groq.com](https://console.groq.com) and create an API key. The free tier needs no credit card. If the free limit is reached, Groq returns a rate-limit error and the app shows a "try again later" message; you are never charged.

### 4. Set environment variables

```bash
cp .env.example .env.local
```

Then fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `GROQ_API_KEY`. You can also set `GROQ_MODEL`, `DAILY_PLAN_LIMIT` and `DAILY_CHAT_LIMIT` if you want to change the defaults.

### 5. Run it

```bash
npm run dev
```

Open http://localhost:3000, sign up, finish onboarding, and your first plan is generated.

## How it's wired together

- Auth: Supabase Auth through `@supabase/ssr`. `src/lib/supabase/client.ts` is used in client components and `src/lib/supabase/server.ts` in API routes. The `(app)` layout checks for a session and sends you to `/login` if there isn't one.
- AI helper: `src/lib/ai.ts` calls Groq's chat completions endpoint with `fetch`, so there's no extra SDK. It also pulls the JSON object out of the model's reply.
- Plan generation: `POST /api/plans/generate` sends the profile to the model and asks for JSON in a fixed shape (7-day workout plus diet). It checks both sections are there, then saves the plan to the `plans` table.
- Coach: `POST /api/coach` sends your message, the last 20 chat messages, your profile and your latest plan, and returns the reply. Chat history is saved to `chat_messages` from the browser.
- Daily caps: `src/lib/limits.ts` counts today's plans and coach messages for the signed-in user before calling the AI.
- Progress: the Progress page reads and writes `weight_logs` straight from the browser, which is safe because of Row Level Security.

## Deploying (free)

1. Import the repo into [Vercel](https://vercel.com) on the free Hobby plan.
2. Add the three environment variables in the Vercel project settings.
3. Deploy. Supabase is already hosted, so nothing else is needed.

Supabase pauses free projects after about a week with no database activity. If you get the warning email, open the project dashboard to keep it running.

## Known limitations

- Completion checkboxes for exercises and meals are local UI state and aren't saved yet. A `plan_progress` table would be the next step.
- Password change and account deletion in Settings aren't wired up yet.
- No email reminders yet. They'd need a scheduled job (Vercel Cron or a Supabase Edge Function) and an email provider.
- The daily caps count per user, so many new sign-ups in one day could still use up Groq's free quota. When that happens the app shows a friendly error instead of charging anything.
