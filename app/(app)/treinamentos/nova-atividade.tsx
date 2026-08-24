"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { salvarAtividade } from "./acoes";

export function NovaAtividade({ treinamentoId }: { treinamentoId: string }) {
  const form = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={form}
      action={async (dados) => {
        await salvarAtividade(dados);
        form.current?.reset();
      }}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="treinamentoId" value={treinamentoId} />
      <input
        name="titulo"
        placeholder="Nova atividade ou tarefa"
        className="flex-1 rounded-md border border-borda-campo bg-white px-3 py-1.5 text-[0.88rem] text-tinta transition focus:border-acao"
        required
      />
      <button
        type="submit"
        className="alvo-alto inline-flex shrink-0 items-center gap-1 rounded-md border border-linha-forte bg-white px-2.5 py-1.5 text-[0.83rem] font-semibold text-tinta-suave transition-colors hover:border-laranja hover:text-acao"
      >
        <Plus size={14} />
        Adicionar
      </button>
    </form>
  );
}
