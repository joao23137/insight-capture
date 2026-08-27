// Puxador de insights: lê o Supabase, escreve os novos em "02 — Captura/" do
// vault e marca como puxados. Roda no PC (agendado ou na mão).
//
// Config via .env nesta pasta:
//   SUPABASE_URL=https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY=eyJ...   (service_role key — NUNCA vai pro app/web)
//   CAPTURE_SECRET=sua frase secreta (a mesma configurada no app)
//   VAULT_CAPTURA=C:\...\Meus pensamentos\02 — Captura   (opcional)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- lê .env simples ---
const envPath = path.join(__dirname, ".env");
const env = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
    if (m) env[m[1]] = m[2];
  }
}
const URL = (env.SUPABASE_URL || "").replace(/\/$/, "");
const KEY = env.SUPABASE_SERVICE_KEY || "";
const SECRET = env.CAPTURE_SECRET || "";
const CAPTURA =
  env.VAULT_CAPTURA ||
  "C:/Users/João Pedro/Documents/meus-pensamentos/Meus pensamentos/02 — Captura";

if (!URL || !KEY) {
  console.error("ERRO: configure SUPABASE_URL e SUPABASE_SERVICE_KEY no .env");
  process.exit(1);
}

const headers = { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" };

const slug = (s) =>
  (s || "insight")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "-").slice(0, 40) || "insight";

(async () => {
  // 1) busca os não puxados (filtra pelo secret, se definido)
  let q = URL + "/rest/v1/insights?puxado=eq.false&order=inserted_at.asc";
  if (SECRET) q += "&secret=eq." + encodeURIComponent(SECRET);
  const r = await fetch(q, { headers });
  if (!r.ok) { console.error("Falha ao ler insights:", r.status, await r.text()); process.exit(1); }
  const rows = await r.json();
  if (!rows.length) { console.log("Nada novo pra puxar."); return; }

  if (!fs.existsSync(CAPTURA)) fs.mkdirSync(CAPTURA, { recursive: true });

  const puxados = [];
  for (const it of rows) {
    const criado = it.criado_em || new Date().toISOString().slice(0, 19);
    const dataDia = criado.slice(0, 10);
    const hora = (criado.slice(11, 16) || "").replace(":", "");
    const primeiraLinha = (it.texto || "").split("\n")[0];
    const nome = `${dataDia} ${hora} — ${slug(primeiraLinha)}.md`;
    const tags = (it.tags || "").split(",").filter(Boolean).map((t) => "#" + t.trim()).join(" ");

    let md = `---\ntipo: captura\ndata: ${dataDia}\ncriado_em: ${criado}\norigem: ${it.origem || "webapp"}\nprocessado: false\n---\n\n`;
    md += `# 💭 ${slug(primeiraLinha).replace(/-/g, " ")}\n\n`;
    md += it.texto.trim() + "\n\n";
    md += `---\n*Tags:* #captura ${tags}\n*A IA processa:* organiza, adiciona links e move pro lugar certo.\n`;

    const outFile = path.join(CAPTURA, nome);
    fs.writeFileSync(outFile, md, "utf-8");
    console.log("Puxado ->", nome);
    puxados.push(it.id);
  }

  // 2) marca como puxados
  if (puxados.length) {
    const ids = puxados.join(",");
    const up = await fetch(URL + `/rest/v1/insights?id=in.(${ids})`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({ puxado: true }),
    });
    if (!up.ok) console.error("AVISO: falha ao marcar como puxados:", up.status, await up.text());
    else console.log(`${puxados.length} insight(s) marcados como puxados.`);
  }
})().catch((e) => { console.error("Erro:", e.message); process.exit(1); });
