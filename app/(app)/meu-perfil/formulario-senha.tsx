"use client";

import { useActionState } from "react";
import { AlertCircle, Check, KeyRound } from "lucide-react";
import { alterarMinhaSenha } from "./acoes";
import { BOTAO, CAMPO } from "@/components/estilos";

const rotulo = "text-[0.83rem] font-semibold text-tinta-suave";

export function FormularioSenha() {
  const [estado, acao, enviando] = useActionState(alterarMinhaSenha, null);

  return (
    <form action={acao} className="flex flex-col gap-3.5">
      {estado?.erro && (
        <p
          role="alert"
          className="m-0 flex items-start gap-2 rounded-lg border border-alerta/30 bg-alerta-suave px-3.5 py-2.5 text-[0.87rem] text-alerta"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {estado.erro}
        </p>
      )}

      {estado?.ok && (
        <p
          role="status"
          className="m-0 flex items-start gap-2 rounded-lg border border-ok/30 bg-ok-suave px-3.5 py-2.5 text-[0.87rem] text-ok"
        >
          <Check size={16} className="mt-0.5 shrink-0" />
          Senha alterada. Use a nova no próximo acesso.
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label className={rotulo} htmlFor="atual">
          Senha atual
        </label>
        <input
          id="atual"
          name="atual"
          type="password"
          autoComplete="current-password"
          className={CAMPO}
          maxLength={200}
          required
        />
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className={rotulo} htmlFor="nova">
            Nova senha
          </label>
          <input
            id="nova"
            name="nova"
            type="password"
            autoComplete="new-password"
            className={CAMPO}
            placeholder="Mínimo 8 caracteres"
            maxLength={200}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={rotulo} htmlFor="confirma">
            Repita a nova senha
          </label>
          <input
            id="confirma"
            name="confirma"
            type="password"
            autoComplete="new-password"
            className={CAMPO}
            maxLength={200}
            required
          />
        </div>
      </div>

      <button type="submit" disabled={enviando} className={`${BOTAO.solido} w-fit`}>
        <KeyRound size={14} />
        {enviando ? "Alterando..." : "Alterar senha"}
      </button>
    </form>
  );
}
