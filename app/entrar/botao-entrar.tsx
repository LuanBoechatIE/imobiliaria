"use client";

import { useFormStatus } from "react-dom";

/**
 * Entrar é a única ação da tela e leva um tempo perceptível: a
 * verificação de senha é scrypt, de propósito lenta. Sem estado de
 * envio a pessoa clica de novo achando que não pegou, e o servidor
 * refaz o hash à toa em cada clique.
 */
export function BotaoEntrar({ className }: { className: string }) {
  const { pending } = useFormStatus();

  return (
    <button className={className} type="submit" disabled={pending} aria-busy={pending}>
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}
