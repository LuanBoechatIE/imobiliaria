"use client";

import { useRef, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { salvarMaterial } from "./acoes";
import { executar } from "@/lib/acao";

/** Mesmos tetos do servidor, para o campo cortar antes de a ação recusar. */
const MAX_NOME = 80;
const MAX_URL = 2048;

export function NovoMaterial({ treinamentoId }: { treinamentoId: string }) {
  const form = useRef<HTMLFormElement>(null);
  const [enviando, setEnviando] = useState(false);

  return (
    <form
      ref={form}
      action={async (dados) => {
        setEnviando(true);
        // O link só é apagado do campo quando o servidor aceita: colar
        // de novo um endereço longo do Drive é o pior tipo de retrabalho.
        const deuCerto = await executar(() => salvarMaterial(dados));
        setEnviando(false);
        if (deuCerto) form.current?.reset();
      }}
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <input type="hidden" name="treinamentoId" value={treinamentoId} />
      <input
        name="nome"
        aria-label="Nome do material"
        placeholder="Nome do material"
        maxLength={MAX_NOME}
        disabled={enviando}
        className="alvo-alto min-w-0 flex-1 rounded-md border border-borda-campo bg-white px-3 py-1.5 text-[0.88rem] text-tinta transition focus:border-acao disabled:opacity-60"
        required
      />
      <input
        name="url"
        type="url"
        inputMode="url"
        aria-label="Link do material"
        placeholder="Link (Drive, Docs...)"
        maxLength={MAX_URL}
        disabled={enviando}
        className="alvo-alto min-w-0 flex-1 rounded-md border border-borda-campo bg-white px-3 py-1.5 text-[0.88rem] text-tinta transition focus:border-acao disabled:opacity-60"
        required
      />
      <button
        type="submit"
        disabled={enviando}
        className="alvo-alto inline-flex shrink-0 items-center justify-center gap-1 rounded-md border border-linha-forte bg-white px-2.5 py-1.5 text-[0.83rem] font-semibold text-tinta-suave transition-colors hover:border-laranja hover:text-acao disabled:pointer-events-none disabled:opacity-60"
      >
        {enviando ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        Adicionar
      </button>
    </form>
  );
}
