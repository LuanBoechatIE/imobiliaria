import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, ExternalLink, Play } from "lucide-react";
import { Cabecalho, Pagina, Secao, Vazio, Voltar } from "@/components/pagina";
import { Vertice } from "@/components/impressao";
import { Barra, SeloAtividade } from "@/components/corretor-ui";
import { BOTAO } from "@/components/estilos";
import { dataCurta } from "@/lib/equipe";
import { nomeCompetencia } from "@/lib/treinamentos";
import { exigirCorretor } from "@/lib/corretor";
import { acharTreinamentoDoCorretor } from "@/lib/atividades-corretor";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { pessoa } = await exigirCorretor();
  const treino = acharTreinamentoDoCorretor(id, pessoa.id);
  return { title: treino?.treinamento.titulo ?? "Treinamento" };
}

function Dado({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[0.95rem] font-semibold text-tinta">{valor}</span>
      <span className="text-[0.78rem] text-suave">{rotulo}</span>
    </div>
  );
}

export default async function PáginaMeuTreinamento({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { pessoa } = await exigirCorretor();

  // Quem não participou do treino não abre a página dele, mesmo digitando
  // o id na barra de endereço: a busca já filtra por participação.
  const treino = acharTreinamentoDoCorretor(id, pessoa.id);
  if (!treino) notFound();

  const { treinamento, atividades, progresso } = treino;
  const feitas = atividades.filter((a) => a.status === "concluida").length;

  return (
    <Pagina largura="media">
      <Voltar href="/meus-treinamentos">Voltar para meus treinamentos</Voltar>

      <Cabecalho
        etiqueta={`Treinamento · ${nomeCompetencia(treinamento.competencia)}`}
        titulo={treinamento.titulo}
        acao={<SeloAtividade status={treino.status} />}
      />

      <section className="overflow-hidden rounded-xl border border-linha bg-white">
        <div className="px-6 py-5">
          <div className="flex flex-wrap items-start gap-4">
            {treinamento.competencia !== "geral" && (
              <Vertice competencia={treinamento.competencia} tamanho={44} />
            )}
            {treinamento.descricao && (
              <p className="m-0 min-w-0 flex-1 max-w-[60ch] text-[1rem] leading-relaxed text-tinta-suave">
                {treinamento.descricao}
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-x-9 gap-y-4 border-t border-linha pt-4">
            <Dado valor={dataCurta(treinamento.data)} rotulo="Data do treino" />
            <Dado
              valor={nomeCompetencia(treinamento.competencia)}
              rotulo="Competência que ele move"
            />
            <Dado valor={treinamento.criadoPor} rotulo="Conduziu" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-linha bg-fundo-2 px-6 py-4">
          {treinamento.gravacaoUrl ? (
            <>
              <a
                href={treinamento.gravacaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir gravação do treino"
                style={{ width: 44, height: 48 }}
                className="hex-recorte grid shrink-0 place-items-center bg-acao text-white transition-colors hover:bg-acao-forte"
              >
                <Play size={15} fill="currentColor" />
              </a>
              <div className="min-w-0 flex-1">
                <p className="m-0 text-[0.94rem] font-semibold text-tinta">
                  Gravação do treino
                </p>
                <p className="m-0 text-[0.83rem] text-suave">
                  Assista antes de fazer a atividade.
                </p>
              </div>
              <a
                href={treinamento.gravacaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(BOTAO.contornoMiudo, "shrink-0")}
              >
                Assistir
                <ExternalLink size={13} />
              </a>
            </>
          ) : (
            <>
              <span
                style={{ width: 44, height: 48 }}
                className="hex-recorte grid shrink-0 place-items-center bg-linha-forte text-white"
                aria-hidden="true"
              >
                <Play size={15} fill="currentColor" />
              </span>
              <p className="m-0 min-w-0 flex-1 text-[0.88rem] text-suave">
                A gravação desta call ainda não foi publicada.
              </p>
            </>
          )}
        </div>
      </section>

      <Secao titulo="Materiais" apoio="O que ficou de apoio depois da call.">
        {treinamento.materiais.length === 0 ? (
          <Vazio titulo="Nenhum material publicado neste treino.">
            Roteiro, checklist e planilha aparecem aqui quando forem anexados.
          </Vazio>
        ) : (
          <div className="overflow-hidden rounded-xl border border-linha bg-white">
            {treinamento.materiais.map((m) => (
              <a
                key={m.id}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 border-t border-linha px-5 py-3.5 no-underline transition-colors first:border-t-0 hover:bg-fundo sm:px-6"
              >
                <span
                  style={{ width: 32, height: 35 }}
                  className="hex-recorte grid shrink-0 place-items-center bg-fundo-2 text-[0.62rem] font-bold uppercase tracking-wide text-tinta-suave"
                >
                  link
                </span>
                <span className="min-w-0 flex-1 truncate text-[0.93rem] font-semibold text-tinta">
                  {m.nome}
                </span>
                <ExternalLink size={14} className="shrink-0 text-suave" />
              </a>
            ))}
          </div>
        )}
      </Secao>

      <Secao
        titulo="Minhas atividades neste treino"
        apoio="O que ficou combinado com você depois da call."
        acao={
          atividades.length > 0 ? (
            <span className="text-[0.85rem] font-semibold tabular-nums text-suave">
              {feitas} de {atividades.length}
            </span>
          ) : undefined
        }
      >
        {atividades.length === 0 ? (
          <Vazio titulo="Nenhuma atividade foi atribuída a você neste treino.">
            Este treino ficou só na call. Nada ficou pendente do seu lado.
          </Vazio>
        ) : (
          <>
            <Barra porcentagem={progresso} />

            <div className="overflow-hidden rounded-xl border border-linha bg-white">
              {atividades.map((a) => (
                <Link
                  key={a.id}
                  href={`/minhas-atividades/${a.id}`}
                  className="flex items-center gap-3.5 border-t border-linha px-5 py-3.5 no-underline transition-colors first:border-t-0 hover:bg-fundo sm:px-6"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[0.94rem] font-semibold text-tinta">
                      {a.titulo}
                    </span>
                    {a.prazo && (
                      <span className="text-[0.82rem] text-suave">
                        Prazo: {dataCurta(a.prazo)}
                      </span>
                    )}
                  </span>
                  <SeloAtividade status={a.status} />
                  <ChevronRight size={16} className="shrink-0 text-suave" />
                </Link>
              ))}
            </div>
          </>
        )}
      </Secao>
    </Pagina>
  );
}
