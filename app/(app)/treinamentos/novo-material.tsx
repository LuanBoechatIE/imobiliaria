"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { salvarMaterial } from "./acoes";

export function NovoMaterial({ treinamentoId }: { treinamentoId: string }) {
  const form = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={form}
      action={async (dados) => {
        await salvarMaterial(dados);
        form.current?.reset();
      }}
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <input type="hidden" name="treinamentoId" value={treinamentoId} />
      <input
        name="nome"
        placeholder="Nome do material"
        className="flex-1 rounded-md border border-borda-campo bg-white px-3 py-1.5 text-[0.88rem] text-tinta transition focus:border-acao"
        required
      />
      <input
        name="url"
        type="url"
        placeholder="Link (Drive, Docs...)"
        className="flex-1 rounded-md border border-borda-campo bg-white px-3 py-1.5 text-[0.88rem] text-tinta transition focus:border-acao"
        required
      />
      <button
        type="submit"
        className="inline-flex shrink-0 items-center justify-center gap-1 rounded-md border border-linha-forte bg-white px-2.5 py-1.5 text-[0.83rem] font-semibold text-tinta-suave transition-colors hover:border-laranja hover:text-acao"
      >
        <Plus size={14} />
        Adicionar
      </button>
    </form>
  );
}
