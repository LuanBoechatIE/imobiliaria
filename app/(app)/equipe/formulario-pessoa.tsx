"use client";

/**
 * Só o gatilho. O corpo da janela mora em painel-pessoa.tsx e é baixado
 * no primeiro clique: a lista de equipe é aberta muito mais vezes para
 * consultar do que para cadastrar alguém.
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import type { Pessoa } from "@/lib/equipe";

const PainelPessoa = dynamic(
  () => import("./painel-pessoa").then((m) => m.PainelPessoa),
  { ssr: false }
);

export function FormularioPessoa({
  pessoa,
  gatilho,
}: {
  pessoa?: Pessoa;
  gatilho: "botao" | "item";
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
          Adicionar pessoa
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="alvo-alto flex w-full items-center px-3 py-2 text-left text-[0.88rem] text-tinta-suave transition-colors hover:bg-fundo-2"
        >
          Editar
        </button>
      )}

      {aberto && <PainelPessoa pessoa={pessoa} aoFechar={() => setAberto(false)} />}
    </>
  );
}
