import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Verificação e geração de senha. Usa node:crypto, então só pode ser
 * importado de server action ou route handler. Nunca do middleware.
 */
export function conferirSenha(senha: string, guardado: string): boolean {
  const [salt, hash] = guardado.split(":");
  if (!salt || !hash) return false;
  const esperado = Buffer.from(hash, "hex");
  const calculado = scryptSync(senha, salt, esperado.length);
  return esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}

/** Mesmo formato "salt:hash" já usado pelos usuários de demonstração. */
export function gerarHashSenha(senha: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const SEM_AMBIGUIDADE = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

/** Senha temporária legível, para o admin copiar e passar manualmente. */
export function gerarSenhaTemporaria(tamanho = 10): string {
  const bytes = randomBytes(tamanho);
  let senha = "";
  for (let i = 0; i < tamanho; i++) {
    senha += SEM_AMBIGUIDADE[bytes[i] % SEM_AMBIGUIDADE.length];
  }
  return senha;
}
