-- FitCoach AI — Supabase schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  age int,
  weight numeric,
  height numeric,
  units text default 'metric',
  goal text,
  activity_level text,
  diet_restrictions text[] default '{}',
  equipment text,
  updated_at timestamptz default now()
);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  workout jsonb not null,
  diet jsonb not null,
  created_at timestamptz default now()
);

create table if not exists weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  weight numeric not null,
  logged_at timestamptz default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- Row Level Security: every user can only read/write their own rows
alter table profiles enable row level security;
alter table plans enable row level security;
alter table weight_logs enable row level security;
alter table chat_messages enable row level security;

create policy "Users manage their own profile" on profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own plans" on plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own weight logs" on weight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own chat messages" on chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
