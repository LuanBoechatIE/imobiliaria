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
      {/*
       * Aparecer só no hover escondia este botão por completo no celular,
       * onde não existe hover. Agora ele fica discreto e sempre presente,
       * e o hover apenas o traz para a frente em quem usa mouse.
       */}
      <button
        type="button"
        onClick={remover}
        aria-label={`Remover atividade: ${atividade.titulo}`}
        className="alvo-toque grid shrink-0 place-items-center rounded-md p-1 text-suave transition-colors hover:text-alerta focus-visible:text-alerta"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
