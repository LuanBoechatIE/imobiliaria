"use client";

import { useRef, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { salvarAtividade } from "./acoes";
import { executar } from "@/lib/acao";

/** Mesmo teto do servidor, para o campo cortar antes de a ação recusar. */
const MAX_TITULO = 120;

export function NovaAtividade({ treinamentoId }: { treinamentoId: string }) {
  const form = useRef<HTMLFormElement>(null);
  const [enviando, setEnviando] = useState(false);

  return (
    <form
      ref={form}
      action={async (dados) => {
        setEnviando(true);
        // Só limpa o campo se entrou mesmo. Antes o texto sumia junto
        // com o erro, e a pessoa tinha que digitar tudo de novo.
        const deuCerto = await executar(() => salvarAtividade(dados));
        setEnviando(false);
        if (deuCerto) form.current?.reset();
      }}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="treinamentoId" value={treinamentoId} />
      <input
        name="titulo"
        aria-label="Nova atividade ou tarefa"
        placeholder="Nova atividade ou tarefa"
        maxLength={MAX_TITULO}
        disabled={enviando}
        className="alvo-alto min-w-0 flex-1 rounded-md border border-borda-campo bg-white px-3 py-1.5 text-[0.88rem] text-tinta transition focus:border-acao disabled:opacity-60"
        required
      />
      <button
        type="submit"
        disabled={enviando}
        className="alvo-alto inline-flex shrink-0 items-center gap-1 rounded-md border border-linha-forte bg-white px-2.5 py-1.5 text-[0.83rem] font-semibold text-tinta-suave transition-colors hover:border-laranja hover:text-acao disabled:pointer-events-none disabled:opacity-60"
      >
        {enviando ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        Adicionar
      </button>
    </form>
  );
}
