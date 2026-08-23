import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Cabecalho, Pagina, Secao, Vazio } from "@/components/pagina";
import { Impressao } from "@/components/impressao";
import {
  COMPETENCIAS,
  IMOBILIARIA,
  critica,
  fmt,
  media,
  mediasPorCompetencia,
  type Corretor,
} from "@/lib/dados";
import { treinamentosDaCompetencia } from "@/lib/treinamentos";

export const metadata: Metadata = { title: "Painel" };

function Variacao({ pessoa }: { pessoa: Corretor }) {
  if (!pessoa.anterior) {
    return <span className="text-[0.76rem] font-medium text-suave">1º ciclo</span>;
  }

  const diff = media(pessoa.notas) - media(pessoa.anterior);
  if (Math.abs(diff) < 0.05) {
    return <span className="text-[0.76rem] font-medium text-suave">estável</span>;
  }

  const sobe = diff > 0;
  return (
    <span
      className={`text-[0.76rem] font-semibold tabular-nums ${sobe ? "text-ok" : "text-alerta"}`}
    >
      {sobe ? "↑" : "↓"} {fmt(Math.abs(diff))}
    </span>
  );
}

export default async function PáginaPainel() {
  const { nome, ciclo, cicloAnterior, corretores } = IMOBILIARIA;

  const ranking = [...corretores].sort((a, b) => media(b.notas) - media(a.notas));
  const porCompetencia = mediasPorCompetencia(corretores);
  const maisFraca = porCompetencia[0];
  const emAtencao = corretores.filter((p) =>
    COMPETENCIAS.some((c) => critica(p.notas[c.chave]))
  );
  const treinosDoTema = treinamentosDaCompetencia(maisFraca.chave);

  return (
    <Pagina>
      <Cabecalho
        etiqueta={`Ciclo de ${ciclo}`}
        titulo={nome}
        apoio={`${corretores.length} corretores avaliados, comparados com ${cicloAnterior.toLowerCase()}`}
      />

      {corretores.length === 0 ? (
        <Vazio titulo="Nenhum corretor avaliado ainda">
          Assim que a primeira avaliação fechar em Avaliações, o time aparece aqui.
        </Vazio>
      ) : (
        <>
          {/* O que fazer primeiro. Lidera a tela porque é a única parte
              que pede uma decisão, não só informa. */}
          <section className="overflow-hidden rounded-xl border border-linha bg-white">
            <div className="flex flex-col gap-4 border-b border-linha px-5 py-5 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
                  Onde o time mais perde negócio
                </span>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-[1.6rem] font-extrabold leading-none tracking-[-0.03em] text-tinta">
                    {maisFraca.nome}
                  </span>
                  <span
                    className={`text-[1.05rem] font-bold tabular-nums ${critica(maisFraca.valor) ? "text-alerta" : "text-tinta-suave"}`}
                  >
                    média {fmt(maisFraca.valor)}
                  </span>
                </div>
                <p className="m-0 max-w-[54ch] text-[0.89rem] text-suave">
                  É a competência mais baixa do time inteiro. Corrigir ela move mais
                  resultado do que qualquer outra.
                </p>
              </div>

              <div className="shrink-0 sm:border-l sm:border-linha sm:pl-6">
                {treinosDoTema.length > 0 ? (
                  <Link
                    href={`/treinamentos/${treinosDoTema[0].id}`}
                    className="inline-flex items-center gap-2 rounded-md bg-laranja px-3.5 py-2 text-[0.88rem] font-semibold text-white no-underline transition-colors hover:bg-laranja-escuro"
                  >
                    <GraduationCap size={15} />
                    Ver treinamento do tema
                  </Link>
                ) : (
                  <Link
                    href="/treinamentos"
                    className="inline-flex items-center gap-2 rounded-md border border-linha-forte bg-white px-3.5 py-2 text-[0.88rem] font-semibold text-tinta-suave no-underline transition-colors hover:border-laranja hover:text-laranja-escuro"
                  >
                    <GraduationCap size={15} />
                    Registrar treinamento
                  </Link>
                )}
              </div>
            </div>

            {/* As seis competências como uma régua contínua, da mais fraca
                para a mais forte. */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              {porCompetencia.map((c) => {
                const alerta = critica(c.valor);
                return (
                  <div
                    key={c.chave}
                    className="flex flex-col gap-2 border-b border-r border-linha px-4 py-3.5 last:border-r-0"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[0.8rem] text-tinta-suave">{c.nome}</span>
                      <span
                        className={`text-[0.88rem] font-bold tabular-nums ${alerta ? "text-alerta" : "text-tinta"}`}
                      >
                        {fmt(c.valor)}
                      </span>
                    </div>
                    <span className="block h-1.5 overflow-hidden rounded-full bg-fundo-2">
                      <span
                        className={`block h-full rounded-full ${alerta ? "bg-alerta" : "bg-laranja"}`}
                        style={{ width: `${(c.valor / 10) * 100}%` }}
                      />
                    </span>
                  </div>
                );
              })}
            </div>

            {emAtencao.length > 0 && (
              <p className="m-0 bg-fundo-2 px-5 py-3 text-[0.86rem] text-tinta-suave">
                <strong className="font-bold text-alerta">{emAtencao.length}</strong>{" "}
                {emAtencao.length === 1 ? "corretor tem" : "corretores têm"} pelo menos uma
                competência abaixo de 5:{" "}
                {emAtencao.map((p, i) => (
                  <span key={p.id}>
                    {i > 0 && ", "}
                    <Link
                      href={`/painel/corretor/${p.id}`}
                      className="font-semibold text-tinta-suave underline decoration-linha-forte underline-offset-2 hover:text-laranja-escuro"
                    >
                      {p.nome.split(" ")[0]}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </section>

          <Secao
            titulo="Corretor por corretor"
            apoio="Cada hexágono é o formato das seis competências daquela pessoa. O anel tracejado marca o 5: o que afunda pra dentro dele precisa de atenção."
          >
            <div className="flex flex-col gap-2">
              {ranking.map((pessoa, i) => {
                const nota = media(pessoa.notas);
                const fracas = COMPETENCIAS.filter((c) => critica(pessoa.notas[c.chave]));

                return (
                  <Link
                    key={pessoa.id}
                    href={`/painel/corretor/${pessoa.id}`}
                    className="group flex items-center gap-4 rounded-xl border border-linha bg-white px-4 py-3.5 no-underline transition-colors hover:border-laranja"
                  >
                    <span className="w-5 shrink-0 text-[0.8rem] font-bold tabular-nums text-suave">
                      {i + 1}
                    </span>

                    <Impressao notas={pessoa.notas} tamanho={40} />

                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[1rem] font-bold tracking-[-0.015em] text-tinta group-hover:text-laranja-escuro">
                        {pessoa.nome}
                      </span>
                      <span className="truncate text-[0.82rem] text-suave">
                        {fracas.length === 0
                          ? "nenhuma competência abaixo de 5"
                          : `precisa de ${fracas.map((c) => c.nome.toLowerCase()).join(", ")}`}
                      </span>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-0.5">
                      <span className="text-[1.5rem] font-extrabold leading-none tracking-[-0.035em] tabular-nums text-tinta">
                        {fmt(nota)}
                      </span>
                      <Variacao pessoa={pessoa} />
                    </div>

                    <ArrowRight
                      size={16}
                      className="hidden shrink-0 text-linha-forte transition-colors group-hover:text-laranja sm:block"
                    />
                  </Link>
                );
              })}
            </div>
          </Secao>
        </>
      )}

      <footer className="border-t border-linha pt-5 text-[0.82rem] text-suave">
        Cada nota vem de uma prova registrada: áudio de atendimento, tempo de resposta
        medido ou role-play gravado. Abra um corretor para ver a de cada competência.
      </footer>
    </Pagina>
  );
}
