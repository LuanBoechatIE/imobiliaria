"use client";

import { useActionState } from "react";
import { AlertCircle, KeyRound } from "lucide-react";
import { trocarSenha } from "./acoes";

const campo =
  "w-full rounded-md border border-linha-forte bg-white px-3 py-2.5 text-[0.95rem] text-tinta outline-none transition focus:border-laranja focus:ring-3 focus:ring-laranja-suave";
const rotulo = "text-[0.83rem] font-semibold text-tinta-suave";

export function FormularioTrocarSenha() {
  const [estado, acao, enviando] = useActionState(trocarSenha, null);

  return (
    <form action={acao} className="flex w-full flex-col gap-3.5">
      {estado?.erro && (
        <p className="flex items-start gap-2 rounded-lg border border-alerta/30 bg-alerta-suave px-3.5 py-2.5 text-[0.87rem] text-alerta">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {estado.erro}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label className={rotulo} htmlFor="atual">
          Senha temporária
        </label>
        <input
          id="atual"
          name="atual"
          type="password"
          autoComplete="current-password"
          className={campo}
          placeholder="A que você recebeu"
          required
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={rotulo} htmlFor="nova">
          Nova senha
        </label>
        <input
          id="nova"
          name="nova"
          type="password"
          autoComplete="new-password"
          className={campo}
          placeholder="Mínimo 8 caracteres"
          minLength={8}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={rotulo} htmlFor="confirma">
          Confirmar nova senha
        </label>
        <input
          id="confirma"
          name="confirma"
          type="password"
          autoComplete="new-password"
          className={campo}
          minLength={8}
          required
        />
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-md bg-laranja px-4 py-2.5 text-[0.95rem] font-semibold text-white transition-colors hover:bg-laranja-escuro disabled:opacity-60"
      >
        <KeyRound size={16} />
        {enviando ? "Salvando..." : "Definir senha e entrar"}
      </button>
    </form>
  );
}
