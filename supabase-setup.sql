-- Rode isto no Supabase (SQL Editor) uma vez.
-- Cria a tabela de insights e libera INSERT anônimo (o app usa a anon key).

create table if not exists public.insights (
  id          bigint generated always as identity primary key,
  texto       text not null,
  tags        text default '',
  origem      text default 'webapp',
  secret      text default '',
  criado_em   text,                       -- horário local do aparelho (YYYY-MM-DDTHH:MM:SS)
  puxado      boolean default false,      -- o puxador marca true depois de salvar no vault
  inserted_at timestamptz default now()
);

alter table public.insights enable row level security;

-- O app (anon) só pode INSERIR. Ler/atualizar exige a service_role key (o puxador no PC).
drop policy if exists "anon_insert" on public.insights;
create policy "anon_insert" on public.insights
  for insert to anon
  with check (true);

-- Índice pra o puxador achar rápido o que falta puxar.
create index if not exists idx_insights_puxado on public.insights (puxado) where puxado = false;
