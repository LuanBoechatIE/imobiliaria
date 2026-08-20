/**
 * Sessão assinada por HMAC. Usa só Web Crypto, então roda tanto no
 * servidor quanto no middleware (runtime Edge).
 *
 * ⚠️ Nada de node:crypto aqui. Verificação de senha mora em lib/senha.ts.
 */

export type Papel = "boechat" | "dono" | "gestor" | "corretor";

export type Sessao = {
  id: string;
  nome: string;
  papel: Papel;
  imobiliariaId: string | null;
  exp: number;
};

export const COOKIE_SESSAO = "sessao";
const DURACAO_MS = 1000 * 60 * 60 * 8; // 8 horas

function segredo(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "SESSION_SECRET ausente ou curta demais. Defina uma string de 32+ caracteres."
    );
  }
  return s;
}

function paraBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function deBase64Url(texto: string): Uint8Array {
  const norm = texto.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(norm.padEnd(Math.ceil(norm.length / 4) * 4, "="));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function chave(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(segredo()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function assinarSessao(
  dados: Omit<Sessao, "exp">
): Promise<{ valor: string; expiraEm: Date }> {
  const expiraEm = new Date(Date.now() + DURACAO_MS);
  const sessao: Sessao = { ...dados, exp: expiraEm.getTime() };
  const corpo = paraBase64Url(new TextEncoder().encode(JSON.stringify(sessao)));
  const assinatura = await crypto.subtle.sign(
    "HMAC",
    await chave(),
    new TextEncoder().encode(corpo)
  );
  return { valor: `${corpo}.${paraBase64Url(new Uint8Array(assinatura))}`, expiraEm };
}

export async function lerSessao(valor: string | undefined): Promise<Sessao | null> {
  if (!valor) return null;
  const [corpo, assinatura] = valor.split(".");
  if (!corpo || !assinatura) return null;

  let confere = false;
  try {
    confere = await crypto.subtle.verify(
      "HMAC",
      await chave(),
      deBase64Url(assinatura),
      new TextEncoder().encode(corpo)
    );
  } catch {
    return null;
  }
  if (!confere) return null;

  try {
    const sessao = JSON.parse(new TextDecoder().decode(deBase64Url(corpo))) as Sessao;
    if (typeof sessao.exp !== "number" || sessao.exp < Date.now()) return null;
    return sessao;
  } catch {
    return null;
  }
}
