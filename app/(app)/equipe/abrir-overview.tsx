"use client";

/**
 * Só o gatilho: a linha inteira da equipe vira clicável.
 *
 * O botão é uma camada transparente por cima da linha, e não um <button>
 * envolvendo o conteúdo, porque dentro da linha já existem outros
 * controles (o menu de ações) — e botão dentro de botão é HTML inválido,
 * que o navegador conserta sozinho quebrando o menu.
 *
 * O corpo da gaveta e os dados dela só são baixados no primeiro clique.
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { lerOverview, type Overview } from "./acoes";

const PainelOverview = dynamic(
  () => import("./painel-overview").then((m) => m.PainelOverview),
  { ssr: false }
);

export function AbrirOverview({ id, nome }: { id: string; nome: string }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function abrir() {
    if (carregando) return;
    setCarregando(true);
    try {
      const resposta = await lerOverview(id);
      if (!resposta.ok) {
        toast.error(resposta.erro);
        return;
      }
      setOverview(resposta.overview);
    } catch {
      toast.error("Não consegui abrir o resumo", {
        description: "A conexão caiu no meio. Tente de novo.",
      });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        aria-label={`Abrir resumo de ${nome}`}
        aria-busy={carregando}
        className="alvo-toque absolute inset-0 z-0 cursor-pointer rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-acao"
      />

      {overview && (
        <PainelOverview overview={overview} aoFechar={() => setOverview(null)} />
      )}
    </>
  );
}
