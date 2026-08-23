"use client";

import { useId, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { excluirAtividade, marcarAtividade } from "./acoes";
import type { Atividade } from "@/lib/treinamentos";

export function ItemAtividade({
  treinamentoId,
  atividade,
}: {
  treinamentoId: string;
  atividade: Atividade;
}) {
  const id = useId();
  const [emTransicao, iniciarTransicao] = useTransition();

  function alternar() {
    const dados = new FormData();
    dados.set("treinamentoId", treinamentoId);
    dados.set("atividadeId", atividade.id);
    iniciarTransicao(() => marcarAtividade(dados));
  }

  function remover() {
    const dados = new FormData();
    dados.set("treinamentoId", treinamentoId);
    dados.set("atividadeId", atividade.id);
    iniciarTransicao(() => excluirAtividade(dados));
  }

  return (
    <div
      className={`group flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-opacity ${emTransicao ? "opacity-60" : ""}`}
    >
      <Checkbox
        id={id}
        checked={atividade.concluida}
        onCheckedChange={alternar}
        className="shrink-0"
      />
      <label
        htmlFor={id}
        className="flex-1 cursor-pointer text-[0.92rem] text-tinta-suave data-[concluida=true]:text-suave data-[concluida=true]:line-through"
        data-concluida={atividade.concluida}
      >
        {atividade.titulo}
      </label>
      <button
        type="button"
        onClick={remover}
        aria-label="Remover atividade"
        className="shrink-0 rounded-md p-1 text-suave opacity-0 transition-opacity hover:text-alerta group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
