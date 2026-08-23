import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink, Play, Trash2 } from "lucide-react";
import { Cabecalho, Pagina, Voltar } from "@/components/pagina";
import { Vertice } from "@/components/impressao";
import { HexAvatar } from "@/components/hex-avatar";
import { FormularioTreinamento } from "../formulario-treinamento";
import { ItemAtividade } from "../item-atividade";
import { NovaAtividade } from "../nova-atividade";
import { NovoMaterial } from "../novo-material";
import { TrocaStatus } from "../troca-status";
import { excluirMaterial } from "../acoes";
import { acharTreinamento, nomeCompetencia } from "@/lib/treinamentos";
import { acharPessoa, dataCurta, listarPessoas } from "@/lib/equipe";
import {
  IMOBILIARIA,
  acharCorretor,
  critica,
  fmt,
  mediasPorCompetencia,
} from "@/lib/dados";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: acharTreinamento(id)?.titulo ?? "Treinamento" };
}

function Dado({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[0.95rem] font-semibold text-tinta">{valor}</span>
      <span className="text-[0.78rem] text-suave">{rotulo}</span>
    </div>
  );
}

export default async function PáginaTreinamento({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const treinamento = acharTreinamento(id);
  if (!treinamento) notFound();

  const pessoasAtivas = listarPessoas().filter((p) => p.status === "ativo");
  const participantes = treinamento.participantesIds
    .map((pid) => acharPessoa(pid))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const feitas = treinamento.atividades.filter((a) => a.concluida).length;
  const totalAtividades = treinamento.atividades.length;

  const alvo = treinamento.competencia;
  const notaDoTime =
    alvo === "geral"
      ? null
      : (mediasPorCompetencia(IMOBILIARIA.corretores).find((c) => c.chave === alvo)?.valor ??
        null);

  // Quantos dos que estavam na sala ainda estão abaixo de 5 no alvo do
  // treino. É o número que diz se o treino já pegou ou não.
  const criticosNoAlvo =
    alvo === "geral"
      ? []
      : participantes.filter((p) => {
          const corretor = acharCorretor(p.id);
          return corretor ? critica(corretor.notas[alvo]) : false;
        });

  return (
    <Pagina>
      <Voltar href="/treinamentos">Voltar para treinamentos</Voltar>

      <Cabecalho
        etiqueta={`Treinamentos · ${nomeCompetencia(treinamento.competencia)}`}
        titulo={treinamento.titulo}
        acao={
          <FormularioTreinamento
            pessoas={pessoasAtivas}
            treinamento={treinamento}
            gatilho="item"
          />
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_21rem]">
        <div className="flex flex-col gap-5">
          <section className="overflow-hidden rounded-xl border border-linha bg-white">
            <div className="px-6 py-5">
              {treinamento.descricao && (
                <p className="m-0 max-w-[60ch] text-[1rem] text-tinta-suave">
                  {treinamento.descricao}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-x-9 gap-y-4 border-t border-linha pt-4">
                <Dado valor={dataCurta(treinamento.data)} rotulo="Data do treino" />
                <Dado
                  valor={nomeCompetencia(treinamento.competencia)}
                  rotulo="Competência alvo"
                />
                <Dado valor={treinamento.criadoPor} rotulo="Conduziu" />
                <Dado
                  valor={`${participantes.length} ${participantes.length === 1 ? "pessoa" : "pessoas"}`}
                  rotulo="Participaram"
                />
              </div>

              <div className="mt-5 border-t border-linha pt-4">
                <TrocaStatus id={treinamento.id} atual={treinamento.status} />
              </div>
            </div>

            {/* A gravação vem logo depois do resumo: numa reunião com o
                dono, é a primeira coisa que alguém abre. */}
            <div className="flex flex-wrap items-center gap-4 border-t border-linha bg-fundo-2 px-6 py-4">
              {treinamento.gravacaoUrl ? (
                <>
                  <a
                    href={treinamento.gravacaoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Abrir gravação"
                    style={{ width: 44, height: 48 }}
                    className="hex-recorte grid shrink-0 place-items-center bg-laranja text-white transition-colors hover:bg-laranja-escuro"
                  >
                    <Play size={15} fill="currentColor" />
                  </a>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[0.94rem] font-semibold text-tinta">
                      Gravação do treino
                    </p>
                    <p className="m-0 truncate text-[0.83rem] text-suave">
                      {treinamento.gravacaoUrl}
                    </p>
                  </div>
                  <a
                    href={treinamento.gravacaoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-linha-forte bg-white px-3 py-1.5 text-[0.85rem] font-semibold text-tinta-suave no-underline transition-colors hover:border-laranja hover:text-laranja-escuro"
                  >
                    Abrir
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
                    Sem gravação cadastrada. Todo treino da Boechat é gravado: edite as
                    informações e cole o link para a imobiliária poder rever.
                  </p>
                </>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-linha bg-white">
            <div className="flex items-baseline gap-3 border-b border-linha px-6 py-4">
              <h2 className="m-0 flex-1 text-[1.05rem] font-bold tracking-[-0.015em] text-tinta">
                Materiais
              </h2>
              <span className="text-[0.83rem] text-suave">
                {treinamento.materiais.length}{" "}
                {treinamento.materiais.length === 1 ? "arquivo" : "arquivos"}
              </span>
            </div>

            {treinamento.materiais.map((m) => (
              <div
                key={m.id}
                className="group flex items-center gap-3.5 border-b border-linha px-5 py-3 sm:px-6"
              >
                <span
                  style={{ width: 32, height: 35 }}
                  className="hex-recorte grid shrink-0 place-items-center bg-fundo-2 text-[0.62rem] font-bold uppercase tracking-wide text-tinta-suave"
                >
                  link
                </span>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 flex-col no-underline"
                >
                  <span className="truncate text-[0.92rem] font-semibold text-tinta hover:text-laranja-escuro">
                    {m.nome}
                  </span>
                  <span className="truncate text-[0.78rem] text-suave">{m.url}</span>
                </a>
                <form action={excluirMaterial}>
                  <input type="hidden" name="treinamentoId" value={treinamento.id} />
                  <input type="hidden" name="materialId" value={m.id} />
                  <button
                    type="submit"
                    aria-label={`Remover ${m.nome}`}
                    className="shrink-0 rounded-md p-1.5 text-suave transition-colors hover:text-alerta"
                  >
                    <Trash2 size={15} />
                  </button>
                </form>
              </div>
            ))}

            <div className="px-5 py-4 sm:px-6">
              <NovoMaterial treinamentoId={treinamento.id} />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-linha bg-white">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-linha px-6 py-4">
              <h2 className="m-0 text-[1.05rem] font-bold tracking-[-0.015em] text-tinta">
                Atividade pós-treino
              </h2>
              <span className="flex-1 text-[0.83rem] text-suave">
                o que fica de tarefa depois que o treino acaba
              </span>
              {totalAtividades > 0 && (
                <span className="text-[0.85rem] font-semibold tabular-nums text-tinta-suave">
                  {feitas} de {totalAtividades}
                </span>
              )}
            </div>

            {totalAtividades > 0 && (
              <div className="px-5 pt-4 sm:px-6">
                <span className="block h-[7px] overflow-hidden rounded-full bg-fundo-2">
                  <span
                    className="barra-enche block h-full rounded-full bg-laranja"
                    style={{ width: `${(feitas / totalAtividades) * 100}%` }}
                  />
                </span>
              </div>
            )}

            <div className="flex flex-col gap-0.5 px-5 py-4 sm:px-6">
              {treinamento.atividades.map((a) => (
                <ItemAtividade key={a.id} treinamentoId={treinamento.id} atividade={a} />
              ))}
              <NovaAtividade treinamentoId={treinamento.id} />
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <section className="flex flex-col items-center rounded-xl border border-linha bg-white px-5 py-5 text-center">
            <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
              O lado que este treino move
            </span>

            <div className="mt-3">
              {alvo === "geral" ? (
                <span
                  style={{ width: 64, height: 71 }}
                  className="hex-recorte block bg-fundo-2"
                  aria-hidden="true"
                />
              ) : (
                <Vertice competencia={alvo} nota={notaDoTime ?? undefined} tamanho={72} />
              )}
            </div>

            <p className="m-0 mt-3 text-[1.05rem] font-bold tracking-[-0.015em] text-tinta">
              {nomeCompetencia(treinamento.competencia)}
            </p>

            {notaDoTime !== null ? (
              <>
                <p className="m-0 mt-1 text-[0.87rem] text-suave">
                  Time hoje{" "}
                  <strong
                    className={`text-[1.05rem] font-bold tabular-nums ${critica(notaDoTime) ? "text-alerta" : "text-tinta"}`}
                  >
                    {fmt(notaDoTime)}
                  </strong>
                </p>
                <p className="m-0 mt-2 text-[0.85rem] text-tinta-suave">
                  {criticosNoAlvo.length === 0
                    ? "Ninguém que participou está abaixo de 5 nessa competência."
                    : `${criticosNoAlvo.length} de ${participantes.length} de quem participou ainda está abaixo de 5 aqui.`}
                </p>
              </>
            ) : (
              <p className="m-0 mt-2 text-[0.85rem] text-tinta-suave">
                Treino de base, não aponta para uma competência só. Sustenta o padrão de
                todas as outras.
              </p>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-linha bg-white">
            <div className="flex items-baseline gap-2 border-b border-linha px-5 py-3.5">
              <h2 className="m-0 flex-1 text-[0.95rem] font-bold tracking-[-0.01em] text-tinta">
                Participantes
              </h2>
              <span className="text-[0.83rem] tabular-nums text-suave">
                {participantes.length}
              </span>
            </div>

            {participantes.length === 0 ? (
              <p className="m-0 px-5 py-4 text-[0.87rem] text-suave">
                Nenhum participante registrado ainda.
              </p>
            ) : (
              participantes.map((p) => {
                const corretor = acharCorretor(p.id);
                const fraco = alvo !== "geral" && corretor && critica(corretor.notas[alvo]);

                const conteudo = (
                  <>
                    <HexAvatar nome={p.nome} tamanho={28} />
                    <span className="min-w-0 flex-1 truncate text-[0.89rem] font-medium text-tinta">
                      {p.nome}
                    </span>
                    {alvo !== "geral" && corretor && (
                      <span
                        className={`shrink-0 text-[0.85rem] font-bold tabular-nums ${fraco ? "text-alerta" : "text-suave"}`}
                      >
                        {fmt(corretor.notas[alvo])}
                      </span>
                    )}
                  </>
                );

                return p.papel === "corretor" ? (
                  <Link
                    key={p.id}
                    href={`/painel/corretor/${p.id}`}
                    className="flex items-center gap-2.5 border-b border-linha px-5 py-2.5 no-underline transition-colors last:border-b-0 hover:bg-fundo"
                  >
                    {conteudo}
                  </Link>
                ) : (
                  <span
                    key={p.id}
                    className="flex items-center gap-2.5 border-b border-linha px-5 py-2.5 last:border-b-0"
                  >
                    {conteudo}
                  </span>
                );
              })
            )}
          </section>
        </aside>
      </div>
    </Pagina>
  );
}
