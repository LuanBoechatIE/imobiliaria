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
import { BOTAO } from "@/components/estilos";

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
          className={BOTAO.solido}
        >
          <Plus size={16} strokeWidth={2.6} />
          Novo treinamento
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className={BOTAO.contornoMiudo}
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
