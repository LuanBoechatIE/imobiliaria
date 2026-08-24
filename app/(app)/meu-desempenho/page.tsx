import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { Cabecalho, Pagina, Vazio } from "@/components/pagina";
import { Impressao, Vertice } from "@/components/impressao";
import { Barra, SeloCompetencia, Variacao } from "@/components/corretor-ui";
import { IMOBILIARIA, fmt, media, notasDoCiclo } from "@/lib/dados";
import { evolucaoDo, exigirCorretor, lerCompetencias } from "@/lib/corretor";
import {
  acharCiclo,
  cicloDeComparacao,
  lerChaveCiclo,
  type ChaveCiclo,
} from "@/lib/ciclos";
import { AvisoCicloPassado, SeletorCiclo } from "@/components/seletor-ciclo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Meu desempenho" };

export default async function PáginaMeuDesempenho({
  searchParams,
}: {
  searchParams: Promise<{ ciclo?: string }>;
}) {
  const { corretor } = await exigirCorretor();
  const chave = lerChaveCiclo((await searchParams).ciclo);
  const cicloVisto = acharCiclo(chave);
  const éAtual = chave === "atual";

  if (!corretor) {
    return (
      <Pagina largura="media">
        <Cabecalho
          etiqueta={`Ciclo atual · ${IMOBILIARIA.ciclo}`}
          titulo="Meu desempenho"
        />
        <Vazio titulo="Você ainda não possui uma avaliação neste ciclo.">
          As seis competências aparecem aqui assim que sua primeira avaliação for fechada.
        </Vazio>
      </Pagina>
    );
  }

  const semDados = (["atual", "anterior", "inicial"] as ChaveCiclo[]).filter(
    (c) => notasDoCiclo(corretor, c) === null
  );

  const competencias = lerCompetencias(corretor, chave);
  const evolucao = evolucaoDo(corretor);
  const pior = [...competencias].sort((a, b) => a.nota - b.nota)[0];

  const notas = notasDoCiclo(corretor, chave) ?? corretor.notas;
  const chaveBase = cicloDeComparacao(chave);
  const base = chaveBase ? notasDoCiclo(corretor, chaveBase) : null;

  const notaDoCiclo = media(notas);
  const variacao = base ? notaDoCiclo - media(base) : null;

  return (
    <Pagina largura="media">
      <Cabecalho
        etiqueta={`${éAtual ? "Ciclo atual" : "Ciclo fechado"} · ${cicloVisto.rotulo}`}
        titulo="Meu desempenho"
        apoio={
          éAtual
            ? "Suas seis competências. Cada nota carrega a prova que a gerou."
            : "Como você estava neste ciclo. Troque acima para comparar com os outros."
        }
        acao={
          <SeletorCiclo atual={chave} base="/meu-desempenho" indisponiveis={semDados} />
        }
      />

      <AvisoCicloPassado ciclo={chave} rotulo={cicloVisto.rotulo} className="-mt-3" />

      <section className="flex flex-col items-center gap-5 rounded-xl border border-linha bg-white px-6 py-6 sm:flex-row sm:items-center sm:gap-8">
        <Impressao
          notas={notas}
          antes={base ?? undefined}
          tamanho={186}
          malha
          fraco={pior.chave}
          anima
          className="shrink-0"
        />

        <div className="flex min-w-0 flex-col items-center text-center sm:items-start sm:text-left">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
            Nota geral
          </span>
          <span
            className={cn(
              "mt-1 text-[3rem] font-bold leading-none tabular-nums tracking-[-0.04em]",
              notaDoCiclo < 5 ? "text-alerta" : "text-tinta"
            )}
          >
            {fmt(notaDoCiclo)}
          </span>
          <Variacao
            valor={variacao}
            sufixo={
              chaveBase === "inicial"
                ? "em relação ao Raio-X"
                : "em relação ao ciclo anterior"
            }
            className="mt-2"
          />

          {base && (
            <p className="m-0 mt-3 max-w-[42ch] text-[0.88rem] text-suave">
              A silhueta pontilhada é como você estava em{" "}
              {acharCiclo(chaveBase!).rotulo.split(" ")[0].toLowerCase()}. A cheia é{" "}
              {éAtual ? "agora" : cicloVisto.rotulo.split(" ")[0].toLowerCase()}.
            </p>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-linha bg-white">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-linha px-6 py-4">
          <h2 className="m-0 text-[1.05rem] font-bold tracking-[-0.015em] text-tinta">
            As seis competências
          </h2>
          <span className="text-[0.85rem] text-suave">
            {éAtual
              ? "toque em uma para ver a prova e o que fazer"
              : `suas notas em ${cicloVisto.rotulo.toLowerCase()}`}
          </span>
        </div>

        {competencias.map((c) => (
          <Link
            key={c.chave}
            href={
              éAtual
                ? `/meu-desempenho/${c.chave}`
                : `/meu-desempenho/${c.chave}?ciclo=${chave}`
            }
            className={cn(
              "block border-t border-linha px-5 py-4 no-underline transition-colors first:border-t-0 hover:bg-fundo sm:px-6",
              c.status === "atencao" && "bg-alerta-suave/40"
            )}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Vertice competencia={c.chave} nota={c.nota} tamanho={21} />
              <h3 className="m-0 flex-1 text-[1rem] font-bold tracking-[-0.015em] text-tinta">
                {c.nome}
              </h3>
              <SeloCompetencia status={c.status} />
              <span
                className={cn(
                  "text-[1.25rem] font-bold tabular-nums tracking-[-0.02em]",
                  c.status === "atencao" ? "text-alerta" : "text-tinta"
                )}
              >
                {fmt(c.nota)}
              </span>
              <ChevronRight size={16} className="shrink-0 text-suave" />
            </div>

            <div className="mt-3">
              <Barra porcentagem={(c.nota / 10) * 100} alerta={c.status === "atencao"} />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[0.83rem] text-suave">
                {c.anterior === null
                  ? "sem ciclo anterior para comparar"
                  : `${acharCiclo(chaveBase!).rotulo.split(" ")[0].toLowerCase()} ${fmt(c.anterior)}`}
              </span>
              <Variacao valor={c.variacao} />
            </div>
          </Link>
        ))}
      </section>
    </Pagina>
  );
}
