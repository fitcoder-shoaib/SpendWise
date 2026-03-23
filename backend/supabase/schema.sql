create table if not exists public.users (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  total_savings numeric not null default 0,
  weekly_savings numeric not null default 0,
  fixed_monthly_savings numeric not null default 3000,
  daily_spending_limit numeric not null default 2000,
  auto_round_off boolean not null default true,
  daily_auto_save_threshold numeric not null default 1200,
  daily_auto_save_amount numeric not null default 120,
  leaderboard_show_percentage boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transactions (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  amount numeric not null,
  category text not null,
  type text not null check (type in ('income', 'expense')),
  description text not null default '',
  date timestamptz not null default timezone('utc', now())
);

create table if not exists public.goals (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null,
  current_amount numeric not null default 0,
  deadline date not null,
  linked_auto_save boolean not null default false
);

create table if not exists public.savings_entries (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  source text not null,
  amount numeric not null,
  note text not null default '',
  date timestamptz not null default timezone('utc', now())
);

create table if not exists public.friends (
  id text primary key,
  name text not null,
  weekly_savings numeric not null default 0,
  streak integer not null default 0
);
