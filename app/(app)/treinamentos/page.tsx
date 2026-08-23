import Link from "next/link";
import type { Metadata } from "next";
import { PlayCircle } from "lucide-react";
import { Cabecalho, Pagina, Vazio } from "@/components/pagina";
import { Vertice } from "@/components/impressao";
import { PilhaHex } from "@/components/hex-avatar";
import { FormularioTreinamento } from "./formulario-treinamento";
import {
  ROTULO_STATUS_TREINAMENTO,
  listarTreinamentos,
  nomeCompetencia,
  type CompetenciaOuGeral,
  type StatusTreinamento,
  type Treinamento,
} from "@/lib/treinamentos";
import { acharPessoa, dataCurta, listarPessoas } from "@/lib/equipe";
import { COMPETENCIAS, IMOBILIARIA, critica, fmt, mediasPorCompetencia } from "@/lib/dados";

export const metadata: Metadata = { title: "Treinamentos" };

const ESTILO_STATUS: Record<StatusTreinamento, string> = {
  realizado: "border-ok/30 bg-ok-suave text-ok",
  agendado: "border-laranja/30 bg-laranja-suave text-laranja-escuro",
  cancelado: "border-linha-forte bg-fundo-2 text-suave",
};

function Linha({ t }: { t: Treinamento }) {
  const participantes = t.participantesIds
    .map((id) => acharPessoa(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <Link
      href={`/treinamentos/${t.id}`}
      className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-t border-linha px-4 py-3.5 no-underline transition-colors first:border-t-0 hover:bg-fundo lg:grid-cols-[5.5rem_minmax(12rem,1fr)_10rem_8rem] lg:px-5"
    >
      <span className="order-2 text-[0.83rem] tabular-nums text-tinta-suave lg:order-none">
        {dataCurta(t.data)}
      </span>

      <div className="order-1 flex min-w-0 flex-col lg:order-none">
        <span className="truncate text-[0.98rem] font-semibold tracking-[-0.01em] text-tinta">
          {t.titulo}
        </span>
        <span className="line-clamp-1 text-[0.83rem] text-suave">{t.descricao}</span>
      </div>

      <span className="order-3 flex items-center gap-2 lg:order-none">
        {participantes.length > 0 ? (
          <PilhaHex nomes={participantes.map((p) => p.nome)} mostrar={4} tamanho={26} />
        ) : (
          <span className="text-[0.8rem] text-suave">sem participantes</span>
        )}
      </span>

      <span className="order-4 flex items-center justify-end gap-2 lg:order-none">
        {t.gravacaoUrl && (
          <PlayCircle size={15} className="text-laranja-escuro" aria-label="Com gravação" />
        )}
        <span
          className={`rounded-full border px-2 py-0.5 text-[0.72rem] font-semibold ${ESTILO_STATUS[t.status]}`}
        >
          {ROTULO_STATUS_TREINAMENTO[t.status]}
        </span>
      </span>
    </Link>
  );
}

export default async function PáginaTreinamentos() {
  const treinamentos = listarTreinamentos();
  const pessoasAtivas = listarPessoas().filter((p) => p.status === "ativo");

  const realizados = treinamentos.filter((t) => t.status === "realizado").length;
  const agendados = treinamentos.filter((t) => t.status === "agendado").length;
  const comGravacao = treinamentos.filter((t) => t.gravacaoUrl).length;

  // A ordem dos grupos é a fila de prioridade do time: a competência mais
  // fraca primeiro, porque é onde o próximo treino tem mais a ganhar.
  const notaDoTime = new Map(
    mediasPorCompetencia(IMOBILIARIA.corretores).map((c) => [c.chave, c.valor])
  );

  const ordem: CompetenciaOuGeral[] = [
    ...[...COMPETENCIAS]
      .sort((a, b) => (notaDoTime.get(a.chave) ?? 0) - (notaDoTime.get(b.chave) ?? 0))
      .map((c) => c.chave),
    "geral",
  ];

  const grupos = ordem
    .map((chave) => ({
      chave,
      nota: chave === "geral" ? null : (notaDoTime.get(chave) ?? null),
      itens: treinamentos.filter((t) => t.competencia === chave),
    }))
    .filter((g) => g.itens.length > 0);

  return (
    <Pagina>
      <Cabecalho
        etiqueta={IMOBILIARIA.nome}
        titulo="Treinamentos"
        apoio={`${realizados} ${realizados === 1 ? "realizado" : "realizados"} · ${agendados} ${agendados === 1 ? "agendado" : "agendados"} · ${comGravacao} com gravação`}
        acao={<FormularioTreinamento pessoas={pessoasAtivas} />}
      />

      {treinamentos.length === 0 ? (
        <Vazio titulo="Nenhum treinamento registrado">
          Comece pelo módulo do gestor. É ele que sustenta o padrão depois que o treino
          termina.
        </Vazio>
      ) : (
        <>
          <section className="flex flex-wrap items-start gap-x-10 gap-y-4 rounded-xl border border-linha bg-white px-6 py-5">
            <div className="min-w-0 flex-1">
              <h2 className="m-0 max-w-[24ch] text-[1.25rem] font-bold leading-[1.16] tracking-[-0.02em] text-tinta">
                Treino aqui é o que foi feito com este time.
              </h2>
              <p className="m-0 mt-2 max-w-[56ch] text-[0.92rem] text-tinta-suave">
                Nada de curso de prateleira. Cada treino aponta para um lado do hexágono, e a
                lista abaixo está agrupada por lado, do mais fraco do time para o mais forte.
              </p>
            </div>
          </section>

          <div className="flex flex-col gap-6">
            {grupos.map((grupo) => (
              <section key={grupo.chave} className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1">
                  {grupo.chave !== "geral" ? (
                    <Vertice
                      competencia={grupo.chave}
                      nota={grupo.nota ?? undefined}
                      tamanho={26}
                    />
                  ) : (
                    <span
                      style={{ width: 22, height: 24 }}
                      className="hex-recorte shrink-0 bg-linha-forte"
                      aria-hidden="true"
                    />
                  )}

                  <h2 className="m-0 text-[1.05rem] font-bold tracking-[-0.015em] text-tinta">
                    {nomeCompetencia(grupo.chave)}
                  </h2>

                  <span className="text-[0.83rem] text-suave">
                    {grupo.nota !== null && (
                      <>
                        time hoje{" "}
                        <strong
                          className={`font-bold tabular-nums ${critica(grupo.nota) ? "text-alerta" : "text-tinta"}`}
                        >
                          {fmt(grupo.nota)}
                        </strong>{" "}
                        ·{" "}
                      </>
                    )}
                    {grupo.itens.length} {grupo.itens.length === 1 ? "treino" : "treinos"}
                  </span>
                </div>

                <div className="overflow-hidden rounded-xl border border-linha bg-white">
                  {grupo.itens.map((t) => (
                    <Linha key={t.id} t={t} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </Pagina>
  );
}
