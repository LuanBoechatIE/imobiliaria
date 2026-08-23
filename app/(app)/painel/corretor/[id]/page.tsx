import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar, GraduationCap } from "lucide-react";
import { Cabecalho, Pagina, Secao, Voltar } from "@/components/pagina";
import { Impressao } from "@/components/impressao";
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

function Evolucao({ pontos }: { pontos: PontoHistorico[] }) {
  if (pontos.length < 2) return null;

  const L = 4;
  const A = 44;
  const passo = (100 - L * 2) / (pontos.length - 1);
  const y = (n: number) => A - 6 - (n / 10) * (A - 14);

  const coords = pontos.map((p, i) => ({ x: L + i * passo, y: y(p.nota) }));
  const linha = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x} ${c.y}`).join(" ");
  const area = `${linha} L${coords[coords.length - 1].x} ${A} L${coords[0].x} ${A} Z`;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
        Evolução
      </span>
      <svg viewBox={`0 0 100 ${A}`} preserveAspectRatio="none" className="h-11 w-40" aria-hidden="true">
        <path d={area} fill="var(--laranja-suave)" />
        <path
          d={linha}
          fill="none"
          stroke="var(--laranja)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="1.8" fill="var(--laranja)" />
        ))}
      </svg>
      <div className="flex w-40 justify-between text-[0.7rem] text-suave">
        {pontos.map((p) => (
          <span key={p.ciclo}>{p.ciclo}</span>
        ))}
      </div>
    </div>
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
    <span className={`text-[0.85rem] font-semibold tabular-nums ${sobe ? "text-ok" : "text-alerta"}`}>
      {sobe ? "↑" : "↓"} {fmt(Math.abs(diff))} contra {IMOBILIARIA.cicloAnterior.split(" ")[0]}
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

  const aTreinar = COMPETENCIAS.filter((c) => critica(pessoa.notas[c.chave]));
  const treinamentos = treinamentosDaPessoa(id);

  return (
    <Pagina largura="media">
      <Voltar href="/painel">Voltar para o time</Voltar>

      <Cabecalho
        etiqueta={`Ciclo de ${IMOBILIARIA.ciclo}`}
        titulo={pessoa.nome}
        apoio={`Na equipe desde ${pessoa.desde}`}
      />

      {/* Nota, formato e evolução juntos: os três jeitos de ler a mesma pessoa. */}
      <section className="flex flex-wrap items-center gap-x-8 gap-y-6 rounded-xl border border-linha bg-white px-5 py-5">
        <div className="flex flex-col gap-1">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
            Nota geral
          </span>
          <span className="text-[2.8rem] font-extrabold leading-none tracking-[-0.04em] tabular-nums text-laranja">
            {fmt(media(pessoa.notas))}
          </span>
          <Variacao pessoa={pessoa} />
        </div>

        <div className="mx-auto sm:mx-0">
          <Impressao notas={pessoa.notas} tamanho={104} comEixos />
        </div>

        <Evolucao pontos={pessoa.historico} />
      </section>

      {aTreinar.length > 0 ? (
        <section className="flex flex-col gap-2.5 rounded-xl border border-laranja/30 bg-laranja-suave px-5 py-4">
          <h2 className="m-0 text-[0.98rem] font-bold tracking-[-0.015em] text-tinta">
            O que treinar no próximo ciclo
          </h2>
          <p className="m-0 max-w-[60ch] text-[0.89rem] text-tinta-suave">
            Sai das competências abaixo de 5. A trilha abre só nesses temas, não no
            conteúdo inteiro.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {aTreinar.map((c) => (
              <span
                key={c.chave}
                className="rounded-full bg-laranja px-2.5 py-1 text-[0.82rem] font-semibold text-white"
              >
                {c.nome}
              </span>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-linha bg-white px-5 py-4">
          <h2 className="m-0 text-[0.98rem] font-bold tracking-[-0.015em] text-tinta">
            Nenhuma competência em nível crítico
          </h2>
          <p className="m-0 mt-1 max-w-[60ch] text-[0.89rem] text-suave">
            O treino do ciclo entra na competência mais baixa, para continuar subindo.
          </p>
        </section>
      )}

      <Secao
        titulo="As seis competências, com a prova de cada nota"
        apoio="Nenhuma nota é opinião. Cada uma vem de áudio de atendimento, tempo medido, role-play gravado ou do que está registrado."
      >
        <div className="flex flex-col gap-2">
          {COMPETENCIAS.map((c) => {
            const nota = pessoa.notas[c.chave];
            const antes = pessoa.anterior?.[c.chave];
            const alerta = critica(nota);
            const provas = pessoa.evidencias?.[c.chave] ?? [evidenciaPadrao(c.chave, nota)];

            return (
              <article
                key={c.chave}
                className={`flex flex-col gap-3 rounded-xl border-l-[3px] bg-white px-4 py-4 ${
                  alerta ? "border border-l-alerta border-linha" : "border border-l-laranja border-linha"
                }`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[1rem] font-bold tracking-[-0.015em] text-tinta">
                    {c.nome}
                  </span>
                  <span className="flex items-baseline gap-2">
                    <span
                      className={`text-[1.35rem] font-extrabold tabular-nums tracking-[-0.03em] ${alerta ? "text-alerta" : "text-tinta"}`}
                    >
                      {fmt(nota)}
                    </span>
                    {antes !== undefined && (
                      <span className="whitespace-nowrap text-[0.76rem] tabular-nums text-suave">
                        era {fmt(antes)}
                      </span>
                    )}
                  </span>
                </div>

                <span className="block h-1.5 overflow-hidden rounded-full bg-fundo-2">
                  <span
                    className={`block h-full rounded-full ${alerta ? "bg-alerta" : "bg-laranja"}`}
                    style={{ width: `${(nota / 10) * 100}%` }}
                  />
                </span>

                <div className="flex flex-col gap-2 border-t border-dashed border-linha-forte pt-3">
                  {provas.map((prova, i) => (
                    <div key={i} className="flex flex-col gap-1 sm:flex-row sm:gap-2.5">
                      <span className="w-fit shrink-0 rounded-full bg-fundo-2 px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide text-tinta-suave">
                        {prova.tipo}
                      </span>
                      <p className="m-0 text-[0.9rem] text-tinta-suave">
                        {prova.texto}{" "}
                        <span className="text-suave">({prova.quando})</span>
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </Secao>

      {treinamentos.length > 0 && (
        <Secao
          titulo="Treinamentos que essa pessoa fez"
          apoio="O que já foi trabalhado com ela, e onde estão a gravação e os materiais."
        >
          <div className="flex flex-col gap-2">
            {treinamentos.map((t) => (
              <Link
                key={t.id}
                href={`/treinamentos/${t.id}`}
                className="group flex items-center gap-3 rounded-xl border border-linha bg-white px-4 py-3 no-underline transition-colors hover:border-laranja"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-laranja-suave text-laranja-escuro">
                  <GraduationCap size={16} strokeWidth={2.2} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[0.94rem] font-semibold text-tinta group-hover:text-laranja-escuro">
                    {t.titulo}
                  </span>
                  <span className="flex items-center gap-2 text-[0.8rem] text-suave">
                    <span className="rounded bg-fundo-2 px-1.5 py-0.5 font-semibold text-tinta-suave">
                      {nomeCompetencia(t.competencia)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} />
                      {dataCurta(t.data)}
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Secao>
      )}
    </Pagina>
  );
}
