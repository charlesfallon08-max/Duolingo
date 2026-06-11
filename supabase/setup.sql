-- Configuration de la base pour Lingua : à coller dans Supabase → SQL Editor → Run.
-- Crée la table de progression et la sécurité (chacun ne voit que ses données).

create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "Chacun gère sa propre progression"
  on public.progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
