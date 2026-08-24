import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, CalendarClock, ExternalLink, Play } from "lucide-react";
import { Cabecalho, Pagina, Secao, Voltar } from "@/components/pagina";
import { Vertice } from "@/components/impressao";
import { SeloAtividade } from "@/components/corretor-ui";
import { Entrega } from "../entrega";
import { BOTAO } from "@/components/estilos";
import { dataCurta } from "@/lib/equipe";
import { nomeCompetencia } from "@/lib/treinamentos";
import { exigirCorretor } from "@/lib/corretor";
import { acharAtividadeDoCorretor } from "@/lib/atividades-corretor";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { pessoa } = await exigirCorretor();
  return { title: acharAtividadeDoCorretor(id, pessoa.id)?.titulo ?? "Atividade" };
}

export default async function PáginaMinhaAtividade({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { pessoa } = await exigirCorretor();

  // A busca já é filtrada pelo dono: id de outra pessoa cai em 404, não
  // em página em branco nem em dado de terceiro.
  const atividade = acharAtividadeDoCorretor(id, pessoa.id);
  if (!atividade) notFound();

  const { treinamento } = atividade;
  const vencida =
    atividade.prazo !== null &&
    atividade.status !== "concluida" &&
    atividade.status !== "aguardando-revisao" &&
    new Date(atividade.prazo) < new Date(new Date().toDateString());

  return (
    <Pagina largura="estreita">
      <Voltar href="/minhas-atividades">Voltar para minhas atividades</Voltar>

      <Cabecalho
        etiqueta={`Atividade · ${nomeCompetencia(atividade.competencia)}`}
        titulo={atividade.titulo}
        acao={<SeloAtividade status={atividade.status} />}
      />

      <section className="flex flex-col gap-4 rounded-xl border border-linha bg-white px-5 py-5">
        <div className="flex items-start gap-3">
          {atividade.competencia !== "geral" && (
            <Vertice competencia={atividade.competencia} tamanho={34} />
          )}
          <div className="min-w-0">
            <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
              Objetivo
            </span>
            <p className="m-0 mt-0.5 text-[0.98rem] leading-relaxed text-tinta">
              {atividade.objetivo}
            </p>
          </div>
        </div>

        <div className="border-t border-linha pt-4">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
            Instruções
          </span>
          <p className="m-0 mt-1 text-[0.95rem] leading-relaxed text-tinta-suave">
            {atividade.instrucoes}
          </p>
        </div>

        {atividade.prazo && (
          <div
            className={cn(
              "flex items-center gap-2 border-t border-linha pt-4 text-[0.9rem]",
              vencida ? "font-semibold text-alerta" : "text-tinta-suave"
            )}
          >
            <CalendarClock size={15} className="shrink-0" />
            {vencida ? "Venceu em " : "Prazo: "}
            <span className="tabular-nums">{dataCurta(atividade.prazo)}</span>
          </div>
        )}
      </section>

      <Secao titulo="Entrega" apoio="Descreva o que foi feito. A Boechat confere e fecha.">
        <Entrega
          id={atividade.id}
          status={atividade.status}
          resposta={atividade.resposta}
        />
      </Secao>

      <Secao
        titulo="Apoio"
        apoio="A call e o material que sustentam essa atividade."
      >
        <div className="flex flex-col gap-2">
          <Link
            href={`/meus-treinamentos/${treinamento.id}`}
            className="flex items-center gap-3.5 rounded-xl border border-linha bg-white px-4 py-3.5 no-underline transition-colors hover:border-linha-forte hover:bg-fundo"
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[0.95rem] font-semibold text-tinta">
                {treinamento.titulo}
              </span>
              <span className="text-[0.83rem] text-suave">
                Treinamento · {dataCurta(treinamento.data)}
              </span>
            </span>
            <ArrowRight size={15} className="shrink-0 text-suave" />
          </Link>

          {treinamento.gravacaoUrl && (
            <a
              href={treinamento.gravacaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(BOTAO.contorno, "w-fit")}
            >
              <Play size={14} fill="currentColor" />
              Rever a gravação
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </Secao>
    </Pagina>
  );
}
