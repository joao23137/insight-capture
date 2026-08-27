# 🧠 Insight Capture — app de captura do segundo cérebro

Anota insight de qualquer lugar (celular/PC) → cai no Supabase → puxador joga na
`02 — Captura/` do vault → o agente organiza.

## Peças
- `index.html` — o app web (mobile-first, offline, instalável).
- `pull-insights.mjs` — puxador (roda no PC).
- `pull.cmd` — lançador do puxador.
- `supabase-setup.sql` — cria a tabela e as permissões.

---

## Setup (uma vez)

### 1. Supabase (o banco)
1. Crie um projeto em supabase.com (grátis).
2. **SQL Editor** → cole o conteúdo de `supabase-setup.sql` → Run.
3. **Settings → API**, anote:
   - `Project URL` → vai no app e no `.env`
   - `anon public` key → vai no app (⚙️)
   - `service_role` key → vai SÓ no `.env` do PC (nunca no app!)

### 2. Puxador (no PC)
1. Copie `.env.example` para `.env` e preencha URL, service_role key e `CAPTURE_SECRET`.
2. Teste: `pull.cmd` (deve dizer "Nada novo pra puxar." se o banco está vazio).
3. Agende (roda a cada X min) — ver seção Agendamento.

### 3. App web (hospedar na Vercel)
1. Suba esta pasta na Vercel (ou GitHub → import na Vercel). É estático, sem build.
2. Abra o link no celular → menu → **Adicionar à tela inicial** (vira app).
3. No app, toque em **⚙️** e preencha: Supabase URL, anon key e a mesma `CAPTURE_SECRET`.

---

## Agendamento do puxador
Tarefa do Windows rodando `pull.cmd` a cada 5–10 min (parecido com a análise semanal).
Peça pro Claude criar a tarefa "Cerebro - Puxar Insights".

## Segurança (honesto)
- A `anon key` fica exposta no app (normal no Supabase). A tabela só permite INSERT
  anônimo — ninguém lê seus dados com ela.
- O `CAPTURE_SECRET` evita que lixo aleatório entre na sua Captura: o puxador só
  traz linhas com o seu segredo.
- A `service_role` key (que lê tudo) fica só no seu PC, no `.env`.
- Para blindagem real, dá pra trocar o INSERT direto por uma Edge Function. v2.
