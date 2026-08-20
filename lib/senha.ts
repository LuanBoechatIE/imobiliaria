import "server-only";
import { scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Verificação de senha. Usa node:crypto, então só pode ser importado
 * de server action ou route handler. Nunca do middleware.
 */
export function conferirSenha(senha: string, guardado: string): boolean {
  const [salt, hash] = guardado.split(":");
  if (!salt || !hash) return false;
  const esperado = Buffer.from(hash, "hex");
  const calculado = scryptSync(senha, salt, esperado.length);
  return esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}
