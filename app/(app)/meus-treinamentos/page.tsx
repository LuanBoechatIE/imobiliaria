import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, ChevronRight, Play } from "lucide-react";
import { Cabecalho, Pagina, Vazio } from "@/components/pagina";
import { Vertice } from "@/components/impressao";
import { Barra, Filtros, SeloAtividade } from "@/components/corretor-ui";
import { dataCurta } from "@/lib/equipe";
import { nomeCompetencia } from "@/lib/treinamentos";
import { exigirCorretor } from "@/lib/corretor";
import { treinamentosDoCorretor, type StatusAtividade } from "@/lib/atividades-corretor";

export const metadata: Metadata = { title: "Meus treinamentos" };

const ESTADOS = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "pendente", rotulo: "Pendentes" },
  { valor: "em-andamento", rotulo: "Em andamento" },
  { valor: "concluida", rotulo: "Concluídos" },
] as const;

export default async function PáginaMeusTreinamentos({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { pessoa } = await exigirCorretor();
  const { estado } = await searchParams;

  // Só os treinos de que essa pessoa participou. A biblioteca da casa
  // não passa por aqui: quem não estava na sala não vê a call.
  const todos = treinamentosDoCorretor(pessoa.id);

  const atual = ESTADOS.some((e) => e.valor === estado) ? estado! : "todos";
  const lista = atual === "todos" ? todos : todos.filter((t) => t.status === atual);

  const opcoes = ESTADOS.map((e) => ({
    valor: e.valor,
    rotulo: e.rotulo,
    quantos:
      e.valor === "todos"
        ? todos.length
        : todos.filter((t) => t.status === (e.valor as StatusAtividade)).length,
  }));

  return (
    <Pagina largura="media">
      <Cabecalho
        titulo="Meus treinamentos"
        apoio="As calls de que você participou, com gravação, material e o que ficou de tarefa."
      />

      {todos.length === 0 ? (
        <Vazio titulo="Nenhum treinamento foi atribuído a você neste momento.">
          Quando você for incluído em uma call de treino, ela aparece aqui com a gravação e
          o material.
        </Vazio>
      ) : (
        <>
          <Filtros base="/meus-treinamentos" atual={atual} opcoes={opcoes} />

          {lista.length === 0 ? (
            <Vazio titulo="Nenhum treinamento nesse estado.">
              Troque o filtro acima para ver os outros.
            </Vazio>
          ) : (
            <section className="overflow-hidden rounded-xl border border-linha bg-white">
              {lista.map((t) => (
                <Link
                  key={t.treinamento.id}
                  href={`/meus-treinamentos/${t.treinamento.id}`}
                  className="block border-t border-linha px-5 py-4 no-underline transition-colors first:border-t-0 hover:bg-fundo sm:px-6"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    {t.treinamento.competencia !== "geral" ? (
                      <Vertice competencia={t.treinamento.competencia} tamanho={20} />
                    ) : (
                      <span className="size-[20px] shrink-0" aria-hidden="true" />
                    )}

                    <h2 className="m-0 min-w-0 flex-1 text-[1rem] font-bold tracking-[-0.015em] text-tinta">
                      {t.treinamento.titulo}
                    </h2>

                    <SeloAtividade status={t.status} />
                    <ChevronRight size={16} className="shrink-0 text-suave" />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.83rem] text-suave">
                    <span>
                      Competência:{" "}
                      <strong className="font-semibold text-tinta-suave">
                        {nomeCompetencia(t.treinamento.competencia)}
                      </strong>
                    </span>
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      <Calendar size={13} />
                      {dataCurta(t.treinamento.data)}
                    </span>
                    {t.treinamento.gravacaoUrl && (
                      <span className="inline-flex items-center gap-1.5">
                        <Play size={12} fill="currentColor" />
                        gravação disponível
                      </span>
                    )}
                  </div>

                  {t.atividades.length > 0 && (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="min-w-0 flex-1">
                        <Barra porcentagem={t.progresso} />
                      </span>
                      <span className="shrink-0 text-[0.8rem] font-semibold tabular-nums text-suave">
                        {t.progresso}%
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </section>
          )}
        </>
      )}
    </Pagina>
  );
}
