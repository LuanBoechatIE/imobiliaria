"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { excluirMaterial } from "./acoes";
import { executar } from "@/lib/acao";

/**
 * Removia por formulário puro, o que não dava resposta nenhuma quando a
 * ação falhava: o link continuava na lista e ninguém sabia por quê.
 */
export function RemoverMaterial({
  treinamentoId,
  materialId,
  nome,
}: {
  treinamentoId: string;
  materialId: string;
  nome: string;
}) {
  const [enviando, iniciarTransicao] = useTransition();

  function remover() {
    const dados = new FormData();
    dados.set("treinamentoId", treinamentoId);
    dados.set("materialId", materialId);

    iniciarTransicao(async () => {
      await executar(() => excluirMaterial(dados), { titulo: `${nome} foi removido` });
    });
  }

  return (
    <button
      type="button"
      onClick={remover}
      disabled={enviando}
      aria-label={`Remover ${nome}`}
      className="alvo-toque grid shrink-0 place-items-center rounded-md p-1.5 text-suave transition-colors hover:text-alerta focus-visible:text-alerta disabled:pointer-events-none disabled:opacity-40"
    >
      {enviando ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
    </button>
  );
}
