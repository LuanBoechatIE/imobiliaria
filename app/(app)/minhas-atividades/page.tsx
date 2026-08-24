import Link from "next/link";
import type { Metadata } from "next";
import { CalendarClock, ChevronRight } from "lucide-react";
import { Cabecalho, Pagina, Vazio } from "@/components/pagina";
import { Vertice } from "@/components/impressao";
import { Filtros, SeloAtividade } from "@/components/corretor-ui";
import { dataCurta } from "@/lib/equipe";
import { exigirCorretor } from "@/lib/corretor";
import { atividadesDoCorretor, type StatusAtividade } from "@/lib/atividades-corretor";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Minhas atividades" };

const ESTADOS = [
  { valor: "todos", rotulo: "Todas" },
  { valor: "pendente", rotulo: "Pendentes" },
  { valor: "em-andamento", rotulo: "Em andamento" },
  { valor: "aguardando-revisao", rotulo: "Aguardando revisão" },
  { valor: "concluida", rotulo: "Concluídas" },
] as const;

/** Prazo vencido em atividade aberta é a única urgência que a lista grita. */
function atrasada(prazo: string | null, status: StatusAtividade): boolean {
  if (!prazo || status === "concluida" || status === "aguardando-revisao") return false;
  return new Date(prazo) < new Date(new Date().toDateString());
}

export default async function PáginaMinhasAtividades({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { pessoa } = await exigirCorretor();
  const { estado } = await searchParams;

  const todas = atividadesDoCorretor(pessoa.id);
  const atual = ESTADOS.some((e) => e.valor === estado) ? estado! : "todos";
  const lista = atual === "todos" ? todas : todas.filter((a) => a.status === atual);

  const opcoes = ESTADOS.map((e) => ({
    valor: e.valor,
    rotulo: e.rotulo,
    quantos:
      e.valor === "todos"
        ? todas.length
        : todas.filter((a) => a.status === (e.valor as StatusAtividade)).length,
  }));

  return (
    <Pagina largura="media">
      <Cabecalho
        titulo="Minhas atividades"
        apoio="Tudo que ficou combinado com você, num lugar só."
      />

      {todas.length === 0 ? (
        <Vazio titulo="Você não possui atividades pendentes.">
          Quando um treino gerar tarefa para você, ela aparece aqui com o prazo.
        </Vazio>
      ) : (
        <>
          <Filtros base="/minhas-atividades" atual={atual} opcoes={opcoes} />

          {lista.length === 0 ? (
            <Vazio titulo="Nenhuma atividade nesse estado.">
              Troque o filtro acima para ver as outras.
            </Vazio>
          ) : (
            <section className="overflow-hidden rounded-xl border border-linha bg-white">
              {lista.map((a) => {
                const vencida = atrasada(a.prazo, a.status);

                return (
                  <Link
                    key={a.id}
                    href={`/minhas-atividades/${a.id}`}
                    className="block border-t border-linha px-5 py-4 no-underline transition-colors first:border-t-0 hover:bg-fundo sm:px-6"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      {a.competencia !== "geral" ? (
                        <Vertice competencia={a.competencia} tamanho={20} />
                      ) : (
                        <span className="size-[20px] shrink-0" aria-hidden="true" />
                      )}

                      <h2 className="m-0 min-w-0 flex-1 text-[1rem] font-bold tracking-[-0.015em] text-tinta">
                        {a.titulo}
                      </h2>

                      <SeloAtividade status={a.status} />
                      <ChevronRight size={16} className="shrink-0 text-suave" />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.83rem] text-suave">
                      <span className="truncate">
                        Treinamento:{" "}
                        <strong className="font-semibold text-tinta-suave">
                          {a.treinamento.titulo}
                        </strong>
                      </span>
                      {a.prazo && (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 tabular-nums",
                            vencida && "font-semibold text-alerta"
                          )}
                        >
                          <CalendarClock size={13} />
                          {vencida ? "Venceu em " : "Prazo: "}
                          {dataCurta(a.prazo)}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </section>
          )}
        </>
      )}
    </Pagina>
  );
}
