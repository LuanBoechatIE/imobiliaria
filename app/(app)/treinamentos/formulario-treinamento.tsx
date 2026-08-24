"use client";

/**
 * Só o botão. O corpo da janela mora em painel-treinamento.tsx e é
 * baixado no primeiro clique, porque a maior parte das visitas a
 * Treinamentos é para ler, não para cadastrar.
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import type { Pessoa } from "@/lib/equipe";
import type { Treinamento } from "@/lib/treinamentos";

const PainelTreinamento = dynamic(
  () => import("./painel-treinamento").then((m) => m.PainelTreinamento),
  { ssr: false }
);

export function FormularioTreinamento({
  pessoas,
  treinamento,
  gatilho = "botao",
}: {
  pessoas: Pessoa[];
  treinamento?: Treinamento;
  gatilho?: "botao" | "item";
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      {gatilho === "botao" ? (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="alvo-alto inline-flex items-center gap-1.5 rounded-md bg-acao px-3.5 py-2 text-[0.9rem] font-semibold text-white transition-colors hover:bg-acao-forte"
        >
          <Plus size={16} strokeWidth={2.6} />
          Novo treinamento
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="alvo-alto inline-flex items-center gap-1.5 rounded-md border border-borda-campo bg-white px-3 py-1.5 text-[0.85rem] font-semibold text-tinta-suave transition-colors hover:border-laranja hover:text-acao"
        >
          Editar informações
        </button>
      )}

      {aberto && (
        <PainelTreinamento
          pessoas={pessoas}
          treinamento={treinamento}
          aoFechar={() => setAberto(false)}
        />
      )}
    </>
  );
}
