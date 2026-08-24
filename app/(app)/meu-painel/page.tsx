import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, GraduationCap, ListChecks } from "lucide-react";
import { Cabecalho, Pagina, Secao, Vazio } from "@/components/pagina";
import { Vertice } from "@/components/impressao";
import { Barra, SeloAtividade, Variacao } from "@/components/corretor-ui";
import { BOTAO } from "@/components/estilos";
import { IMOBILIARIA, fmt } from "@/lib/dados";
import { evolucaoDo, exigirCorretor, focoDoCiclo } from "@/lib/corretor";
import { progressoDoCorretor, proximasAcoes } from "@/lib/atividades-corretor";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Meu painel" };

/** Só o primeiro nome: o menu já mostra o nome inteiro logo ao lado. */
function primeiroNome(nome: string): string {
  return nome.split(" ")[0];
}

/**
 * Curva miúda da nota geral. É um resumo, não o gráfico do desempenho:
 * quem quer ler ciclo a ciclo clica em "Ver meu desempenho".
 */
function Curva({ pontos }: { pontos: { ciclo: string; nota: number }[] }) {
  if (pontos.length < 2) return null;

  const L = 200;
  const A = 44;
  const piso = 2;
  const teto = 10;

  const x = (i: number) => (i * L) / (pontos.length - 1);
  const y = (n: number) => A - ((n - piso) / (teto - piso)) * (A - 6) - 3;
  const linha = pontos.map((p, i) => `${x(i).toFixed(1)},${y(p.nota).toFixed(1)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${L} ${A}`}
      className="h-11 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon
        points={`0,${A} ${linha} ${L},${A}`}
        fill="var(--laranja)"
        fillOpacity="0.09"
      />
      <polyline
        points={linha}
        fill="none"
        stroke="var(--laranja)"
        strokeWidth="2"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={x(pontos.length - 1).toFixed(1)}
        cy={y(pontos[pontos.length - 1].nota).toFixed(1)}
        r="3"
        fill="#fff"
        stroke="var(--laranja)"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default async function PáginaMeuPainel() {
  const { pessoa, corretor } = await exigirCorretor();

  const foco = corretor ? focoDoCiclo(corretor) : null;
  const evolucao = corretor ? evolucaoDo(corretor) : null;
  const progresso = progressoDoCorretor(pessoa.id);
  const acoes = proximasAcoes(pessoa.id);

  return (
    <Pagina largura="media">
      <Cabecalho
        etiqueta={`Ciclo atual · ${IMOBILIARIA.ciclo}`}
        titulo={`Olá, ${primeiroNome(pessoa.nome)}.`}
        apoio={
          foco
            ? "Um foco por ciclo. É o que decide sua próxima nota."
            : "Sua avaliação deste ciclo ainda não foi fechada."
        }
      />

      {/* O foco é o único elemento que a tela promove. Tudo mais aqui
          existe para servir a ele. */}
      {foco ? (
        <section className="overflow-hidden rounded-xl border border-laranja/30 bg-laranja-suave">
          <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-start">
            <Vertice
              competencia={foco.competencia.chave}
              nota={foco.competencia.nota}
              tamanho={72}
            />

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-acao">
                Seu principal foco
              </span>
              <h2 className="m-0 mt-1 text-[1.55rem] font-extrabold leading-none tracking-[-0.03em] text-tinta">
                {foco.competencia.nome}
              </h2>

              <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[0.87rem] text-suave-marca">Nota atual</span>
                <span
                  className={cn(
                    "text-[1.6rem] font-bold leading-none tabular-nums tracking-[-0.03em]",
                    foco.competencia.status === "atencao" ? "text-alerta" : "text-tinta"
                  )}
                >
                  {fmt(foco.competencia.nota)}
                </span>
                <Variacao valor={foco.competencia.variacao} />
              </div>

              <p className="m-0 mt-3 max-w-[58ch] text-[0.95rem] leading-relaxed text-tinta-suave">
                Essa é sua prioridade neste ciclo. {foco.prova.texto}
              </p>

              <Link
                href={`/meu-desempenho/${foco.competencia.chave}`}
                className={cn(BOTAO.solido, "mt-4 w-fit")}
              >
                Ver o que preciso melhorar
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <Vazio titulo="Você ainda não possui uma avaliação neste ciclo.">
          Assim que a Boechat fechar sua avaliação, seu foco aparece aqui com a nota e a
          prova que a gerou.
        </Vazio>
      )}

      <Secao
        titulo="Próximas ações"
        apoio="Na ordem em que valem mais. Comece de cima."
        acao={
          acoes.length > 0 ? (
            <Link
              href="/minhas-atividades"
              className="text-[0.85rem] font-semibold text-acao no-underline hover:underline"
            >
              Ver todas
            </Link>
          ) : undefined
        }
      >
        {acoes.length === 0 ? (
          <Vazio titulo="Você não possui atividades pendentes.">
            Quando um treino gerar tarefa para você, ela aparece aqui.
          </Vazio>
        ) : (
          <ol className="m-0 flex list-none flex-col gap-2 p-0">
            {acoes.map((acao, i) => (
              <li key={`${acao.href}-${i}`}>
                <Link
                  href={acao.href}
                  className="flex items-center gap-3.5 rounded-xl border border-linha bg-white px-4 py-3.5 no-underline transition-colors hover:border-linha-forte hover:bg-fundo"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-fundo-2 text-[0.85rem] font-bold tabular-nums text-tinta-suave">
                    {i + 1}
                  </span>

                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center gap-1.5 text-[0.95rem] font-semibold text-tinta">
                      {acao.tipo === "treinamento" ? (
                        <GraduationCap size={15} className="shrink-0 text-suave" />
                      ) : (
                        <ListChecks size={15} className="shrink-0 text-suave" />
                      )}
                      <span className="truncate">{acao.titulo}</span>
                    </span>
                    <span className="truncate text-[0.83rem] text-suave">{acao.apoio}</span>
                  </span>

                  <SeloAtividade status={acao.status} />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </Secao>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="flex flex-col rounded-xl border border-linha bg-white px-5 py-5">
          <h2 className="m-0 text-[1.05rem] font-bold tracking-[-0.015em] text-tinta">
            Meu progresso
          </h2>

          {progresso.total === 0 ? (
            <p className="m-0 mt-2 text-[0.89rem] text-suave">
              Nenhuma ação combinada com você neste ciclo.
            </p>
          ) : (
            <>
              <p className="m-0 mt-1 text-[0.89rem] text-suave">
                <strong className="text-[1.05rem] font-bold tabular-nums text-tinta">
                  {progresso.feitas} de {progresso.total}
                </strong>{" "}
                ações concluídas
              </p>
              <div className="mt-auto pt-4">
                <Barra porcentagem={progresso.porcentagem} />
              </div>
            </>
          )}
        </section>

        <section className="flex flex-col rounded-xl border border-linha bg-white px-5 py-5">
          <h2 className="m-0 text-[1.05rem] font-bold tracking-[-0.015em] text-tinta">
            Minha evolução
          </h2>

          {evolucao ? (
            <>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[1.9rem] font-bold leading-none tabular-nums tracking-[-0.03em] text-tinta">
                  {fmt(evolucao.nota)}
                </span>
                <span className="text-[0.83rem] text-suave">nota geral</span>
              </div>
              <Variacao
                valor={evolucao.variacao}
                sufixo="em relação ao ciclo anterior"
                className="mt-1"
              />

              <div className="mt-auto pt-3">
                <Curva pontos={evolucao.historico} />
              </div>

              <Link
                href="/meu-desempenho"
                className={cn(BOTAO.contornoMiudo, "mt-4 w-fit")}
              >
                Ver meu desempenho
                <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <p className="m-0 mt-2 text-[0.89rem] text-suave">
              Sua evolução aparecerá aqui após novas avaliações.
            </p>
          )}
        </section>
      </div>
    </Pagina>
  );
}
