"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { mudarStatus } from "./acoes";
import { ROTULO_STATUS_TREINAMENTO, type StatusTreinamento } from "@/lib/treinamentos";

const OPCOES: StatusTreinamento[] = ["agendado", "realizado", "cancelado"];

const ATIVO: Record<StatusTreinamento, string> = {
  agendado: "border-laranja/30 bg-laranja-suave text-acao",
  realizado: "border-ok/30 bg-ok-suave text-ok",
  cancelado: "border-linha-forte bg-fundo-2 text-suave",
};

export function TrocaStatus({ id, atual }: { id: string; atual: StatusTreinamento }) {
  const [enviando, iniciarTransicao] = useTransition();

  function trocar(status: StatusTreinamento) {
    const dados = new FormData();
    dados.set("id", id);
    dados.set("status", status);

    iniciarTransicao(async () => {
      await mudarStatus(dados);
      toast.success(`Marcado como ${ROTULO_STATUS_TREINAMENTO[status].toLowerCase()}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t border-linha pt-3.5">
      <span className="mr-1 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
        Status
      </span>
      {OPCOES.map((s) => {
        const ativo = atual === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => trocar(s)}
            disabled={ativo || enviando}
            className={`rounded-full border px-3 py-1 text-[0.82rem] font-semibold transition-colors disabled:cursor-default ${
              ativo
                ? ATIVO[s]
                : "border-linha-forte bg-white text-suave hover:border-laranja hover:text-acao disabled:opacity-50"
            }`}
          >
            {ROTULO_STATUS_TREINAMENTO[s]}
          </button>
        );
      })}
    </div>
  );
}
