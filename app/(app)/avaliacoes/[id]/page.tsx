import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Cabecalho, Pagina, Voltar } from "@/components/pagina";
import { HexAvatar } from "@/components/hex-avatar";
import { Formulario } from "./formulario";
import {
  cicloAtual,
  ROTULO_STATUS,
  acharAvaliacao,
  quantasPreenchidas,
  statusDe,
} from "@/lib/avaliacoes";
import { acharPessoa, dataCurta } from "@/lib/equipe";
import { COMPETENCIAS } from "@/lib/dados";

export const metadata: Metadata = { title: "Avaliar corretor" };

export default async function PáginaAvaliar({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pessoa = acharPessoa(id);
  if (!pessoa || pessoa.papel !== "corretor") notFound();

  const avaliacao = acharAvaliacao(id);
  const status = statusDe(id);
  const feitas = quantasPreenchidas(id);

  return (
    <Pagina>
      <Voltar href="/avaliacoes">Voltar para o ciclo</Voltar>

      <Cabecalho
        etiqueta={`Avaliações · coleta de ${cicloAtual().toLowerCase()}`}
        titulo="Avaliar corretor"
        apoio="Toda nota precisa de uma prova junto. Sem o fato concreto, o corretor contesta e o dono perde a confiança no número."
      />

      <section className="flex flex-wrap items-center gap-4 rounded-xl border border-linha bg-white px-5 py-4">
        <HexAvatar nome={pessoa.nome} tamanho={44} />

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[1.15rem] font-bold tracking-[-0.02em] text-tinta">
            {pessoa.nome}
          </span>
          <span className="text-[0.85rem] text-suave">
            {pessoa.cargo} · na equipe desde {dataCurta(pessoa.entrada)}
          </span>
        </div>

        <span className="shrink-0 rounded-full border border-linha-forte bg-fundo-2 px-3 py-1 text-[0.82rem] font-semibold text-tinta-suave">
          {ROTULO_STATUS[status]} · {feitas} de {COMPETENCIAS.length}
        </span>
      </section>

      <Formulario corretorId={pessoa.id} avaliacao={avaliacao} />
    </Pagina>
  );
}
