import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar } from "lucide-react";
import { Cabecalho, Pagina, Voltar } from "@/components/pagina";
import { Impressao, Vertice } from "@/components/impressao";
import { HexAvatar } from "@/components/hex-avatar";
import {
  COMPETENCIAS,
  IMOBILIARIA,
  acharCorretor,
  critica,
  evidenciaPadrao,
  fmt,
  media,
  type Corretor,
  type PontoHistorico,
} from "@/lib/dados";
import { dataCurta } from "@/lib/equipe";
import { nomeCompetencia, treinamentosDaPessoa } from "@/lib/treinamentos";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: acharCorretor(id)?.nome ?? "Corretor" };
}

/**
 * Linha do tempo da nota geral. A linha de corte do 5 aparece desenhada,
 * porque a pergunta que essa curva responde não é "subiu?", é "já saiu
 * da zona crítica?".
 */
function Evolucao({ pontos }: { pontos: PontoHistorico[] }) {
  if (pontos.length < 2) {
    return (
      <p className="m-0 px-6 py-5 text-[0.89rem] text-suave">
        Só existe um ciclo avaliado até agora. A curva aparece a partir do segundo.
      </p>
    );
  }

  const L = 700;
  const A = 96;
  const lado = 30;
  const piso = 2;
  const teto = 10;

  const x = (i: number) => lado + i * ((L - lado * 2) / (pontos.length - 1));
  const y = (n: number) => A - ((n - piso) / (teto - piso)) * (A - 16);

  const linha = pontos.map((p, i) => `${x(i).toFixed(1)},${y(p.nota).toFixed(1)}`).join(" ");
  const area = `${lado},${A} ${linha} ${(L - lado).toFixed(1)},${A}`;

  return (
    <svg
      viewBox={`0 0 ${L} ${A + 26}`}
      className="h-[7.5rem] w-full overflow-visible"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line
        x1="0"
        y1={y(5).toFixed(1)}
        x2={L}
        y2={y(5).toFixed(1)}
        stroke="var(--alerta)"
        strokeWidth="1"
        strokeDasharray="3 5"
        opacity="0.5"
        vectorEffect="non-scaling-stroke"
      />
      <text
        x="2"
        y={(y(5) - 6).toFixed(1)}
        fontSize="10"
        fontWeight="700"
        letterSpacing="0.05em"
        fill="var(--alerta)"
      >
        LINHA DE CORTE 5,0
      </text>

      <polygon points={area} fill="var(--laranja)" fillOpacity="0.08" />
      <polyline
        points={linha}
        fill="none"
        stroke="var(--laranja)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {pontos.map((p, i) => (
        <g key={p.ciclo}>
          <circle
            cx={x(i).toFixed(1)}
            cy={y(p.nota).toFixed(1)}
            r={i === pontos.length - 1 ? 5 : 3.5}
            fill="#fff"
            stroke="var(--laranja)"
            strokeWidth="2.5"
          />
          <text
            x={x(i).toFixed(1)}
            y={(y(p.nota) - 13).toFixed(1)}
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
            fill="var(--tinta)"
          >
            {fmt(p.nota)}
          </text>
          <text
            x={x(i).toFixed(1)}
            y={A + 20}
            fontSize="11"
            textAnchor="middle"
            fill="var(--suave)"
          >
            {p.ciclo}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Variacao({ pessoa }: { pessoa: Corretor }) {
  if (!pessoa.anterior) {
    return <span className="text-[0.85rem] font-medium text-suave">primeiro ciclo</span>;
  }

  const diff = media(pessoa.notas) - media(pessoa.anterior);
  if (Math.abs(diff) < 0.05) {
    return <span className="text-[0.85rem] font-medium text-suave">estável no mês</span>;
  }

  const sobe = diff > 0;
  return (
    <span
      className={`text-[0.85rem] font-semibold tabular-nums ${sobe ? "text-ok" : "text-alerta"}`}
    >
      {sobe ? "+" : "−"}
      {fmt(Math.abs(diff))} no ciclo
    </span>
  );
}

export default async function PáginaCorretor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pessoa = acharCorretor(id);
  if (!pessoa) notFound();

  const nota = media(pessoa.notas);
  const aTreinar = COMPETENCIAS.filter((c) => critica(pessoa.notas[c.chave]));
  const treinamentos = treinamentosDaPessoa(id);
  const pior = [...COMPETENCIAS].sort(
    (a, b) => pessoa.notas[a.chave] - pessoa.notas[b.chave]
  )[0];

  return (
    <Pagina>
      <Voltar href="/painel">Voltar para o time</Voltar>

      <Cabecalho
        etiqueta={`Equipe · ciclo de ${IMOBILIARIA.ciclo}`}
        titulo={pessoa.nome}
        acao={
          <Link
            href={`/avaliacoes/${pessoa.id}`}
            className="rounded-md bg-acao px-3.5 py-2 alvo-alto text-[0.88rem] font-semibold text-white no-underline transition-colors hover:bg-acao-forte"
          >
            Avaliar no ciclo em coleta
          </Link>
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-[22rem_1fr]">
        {/* Coluna de identidade: acompanha a rolagem, porque a silhueta é a
            referência que a pessoa consulta enquanto lê as provas. */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          <section className="flex flex-col items-center rounded-xl border border-linha bg-white px-6 py-6 text-center">
            <HexAvatar nome={pessoa.nome} tamanho={92} />
            <h2 className="m-0 mt-3 text-[1.3rem] font-bold tracking-[-0.02em] text-tinta">
              {pessoa.nome}
            </h2>
            <p className="m-0 mt-0.5 text-[0.85rem] text-suave">
              Na equipe desde {pessoa.desde}
            </p>

            <div className="mt-4 flex items-baseline gap-3">
              <span
                className={`text-[2.6rem] font-bold leading-none tracking-[-0.04em] tabular-nums ${nota < 5 ? "text-alerta" : "text-tinta"}`}
              >
                {fmt(nota)}
              </span>
              <Variacao pessoa={pessoa} />
            </div>

            <div className="mt-2 w-full">
              <Impressao
                notas={pessoa.notas}
                antes={pessoa.inicial ?? undefined}
                tamanho={300}
                rotulos
                malha
                fraco={pior.chave}
                anima
                className="mx-auto max-w-full"
              />
            </div>

            {pessoa.inicial && (
              <div className="flex items-center justify-center gap-5 text-[0.78rem] text-suave">
                <span className="inline-flex items-center gap-1.5">
                  <svg width="15" height="4" aria-hidden="true">
                    <line
                      x1="0"
                      y1="2"
                      x2="15"
                      y2="2"
                      stroke="var(--suave)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                  </svg>
                  Raio-X de {IMOBILIARIA.cicloInicial.split(" ")[0].toLowerCase()}
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-tinta-suave">
                  <svg width="15" height="4" aria-hidden="true">
                    <line x1="0" y1="2" x2="15" y2="2" stroke="var(--laranja)" strokeWidth="2.5" />
                  </svg>
                  {IMOBILIARIA.ciclo.split(" ")[0]}
                </span>
              </div>
            )}

            <dl className="mt-5 grid w-full gap-2 border-t border-linha pt-4 text-left text-[0.86rem]">
              <div className="flex justify-between gap-3">
                <dt className="text-suave">Zona crítica</dt>
                <dd
                  className={`m-0 font-semibold ${aTreinar.length ? "text-alerta" : "text-ok"}`}
                >
                  {aTreinar.length
                    ? `${aTreinar.length} ${aTreinar.length === 1 ? "competência" : "competências"}`
                    : "nenhuma"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-suave">Provas no ciclo</dt>
                <dd className="m-0 font-semibold text-tinta">
                  {COMPETENCIAS.filter((c) => pessoa.evidencias?.[c.chave]?.length).length} de{" "}
                  {COMPETENCIAS.length}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-suave">Treinos feitos</dt>
                <dd className="m-0 font-semibold text-tinta">{treinamentos.length}</dd>
              </div>
            </dl>
          </section>

          {aTreinar.length > 0 && (
            <section className="rounded-xl border border-laranja/30 bg-laranja-suave px-5 py-4">
              <h2 className="m-0 text-[0.95rem] font-bold tracking-[-0.015em] text-tinta">
                O que treinar no próximo ciclo
              </h2>
              <p className="m-0 mt-1 text-[0.86rem] text-tinta-suave">
                A trilha abre só nas competências abaixo de 5, não no conteúdo inteiro.
              </p>
              <div className="mt-3 flex flex-col gap-1.5">
                {aTreinar.map((c) => (
                  <span key={c.chave} className="flex items-center gap-2.5">
                    <Vertice
                      competencia={c.chave}
                      nota={pessoa.notas[c.chave]}
                      tamanho={20}
                    />
                    <span className="text-[0.9rem] font-semibold text-tinta">{c.nome}</span>
                    <span className="ml-auto text-[0.9rem] font-bold tabular-nums text-alerta">
                      {fmt(pessoa.notas[c.chave])}
                    </span>
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <section className="rounded-xl border border-linha bg-white pb-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-6 pt-5">
              <h2 className="m-0 text-[1.05rem] font-bold tracking-[-0.015em] text-tinta">
                Evolução
              </h2>
              <span className="text-[0.85rem] text-suave">
                nota geral em cada ciclo avaliado
              </span>
            </div>
            <div className="px-4">
              <Evolucao pontos={pessoa.historico} />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-linha bg-white">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-linha px-6 py-4">
              <h2 className="m-0 text-[1.05rem] font-bold tracking-[-0.015em] text-tinta">
                As seis competências
              </h2>
              <span className="text-[0.85rem] text-suave">
                cada nota carrega a prova que a gerou
              </span>
            </div>

            {COMPETENCIAS.map((c) => {
              const valor = pessoa.notas[c.chave];
              const antes = pessoa.inicial?.[c.chave];
              const alerta = critica(valor);
              const provas = pessoa.evidencias?.[c.chave] ?? [evidenciaPadrao(c.chave, valor)];

              return (
                <article
                  key={c.chave}
                  className={`border-t border-linha px-5 py-4 first:border-t-0 sm:px-6 ${alerta ? "bg-laranja-suave/45" : ""}`}
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Vertice competencia={c.chave} nota={valor} tamanho={21} />
                    <h3 className="m-0 flex-1 text-[1rem] font-bold tracking-[-0.015em] text-tinta">
                      {c.nome}
                    </h3>
                    {antes !== undefined && (
                      <span
                        className={`text-[0.8rem] font-semibold tabular-nums ${valor >= antes ? "text-ok" : "text-alerta"}`}
                      >
                        {valor >= antes ? "+" : "−"}
                        {fmt(Math.abs(valor - antes))} desde o Raio-X
                      </span>
                    )}
                    <span
                      className={`text-[1.25rem] font-bold tabular-nums tracking-[-0.02em] ${alerta ? "text-alerta" : "text-tinta"}`}
                    >
                      {fmt(valor)}
                    </span>
                  </div>

                  <span className="mt-3 block h-[7px] overflow-hidden rounded-full bg-fundo-2">
                    <span
                      className={`barra-enche block h-full rounded-full ${alerta ? "bg-alerta" : "bg-acao"}`}
                      style={{ width: `${(valor / 10) * 100}%` }}
                    />
                  </span>

                  <div className="mt-3 flex flex-col gap-2">
                    {provas.map((prova, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-linha bg-white px-3.5 py-3"
                      >
                        <span className="text-[0.7rem] font-bold uppercase tracking-[0.06em] text-acao">
                          {prova.tipo}
                        </span>
                        <p className="m-0 mt-1 text-[0.9rem] text-tinta-suave">{prova.texto}</p>
                        <span className="mt-1.5 block text-[0.78rem] text-suave">
                          {prova.quando}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </section>

          {treinamentos.length > 0 && (
            <section className="overflow-hidden rounded-xl border border-linha bg-white">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-linha px-6 py-4">
                <h2 className="m-0 flex-1 text-[1.05rem] font-bold tracking-[-0.015em] text-tinta">
                  Treinamentos que essa pessoa fez
                </h2>
                <Link
                  href="/treinamentos"
                  className="text-[0.85rem] font-semibold text-acao no-underline hover:underline"
                >
                  Todos
                </Link>
              </div>

              {treinamentos.map((t) => (
                <Link
                  key={t.id}
                  href={`/treinamentos/${t.id}`}
                  className="flex items-center gap-3.5 border-t border-linha px-5 py-3 no-underline transition-colors first:border-t-0 hover:bg-fundo sm:px-6"
                >
                  {t.competencia !== "geral" ? (
                    <Vertice competencia={t.competencia} tamanho={19} />
                  ) : (
                    <span className="size-[19px] shrink-0" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[0.93rem] font-semibold text-tinta">
                      {t.titulo}
                    </span>
                    <span className="text-[0.8rem] text-suave">
                      Alvo: {nomeCompetencia(t.competencia)}
                    </span>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-[0.8rem] tabular-nums text-suave">
                    <Calendar size={13} />
                    {dataCurta(t.data)}
                  </span>
                </Link>
              ))}
            </section>
          )}
        </div>
      </div>
    </Pagina>
  );
}
