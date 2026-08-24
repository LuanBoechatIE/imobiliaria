import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, GraduationCap, ListChecks } from "lucide-react";
import { Cabecalho, Pagina, Secao, Vazio, Voltar } from "@/components/pagina";
import { Vertice } from "@/components/impressao";
import { Barra, SeloAtividade, SeloCompetencia, Variacao } from "@/components/corretor-ui";
import { IMOBILIARIA, fmt } from "@/lib/dados";
import { exigirCorretor, lerCompetencia, provasDa } from "@/lib/corretor";
import {
  atividadesDaCompetencia,
  planoDaCompetencia,
  treinamentosDaCompetenciaDoCorretor,
} from "@/lib/atividades-corretor";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competencia: string }>;
}): Promise<Metadata> {
  const { competencia } = await params;
  const { corretor } = await exigirCorretor();
  const leitura = corretor ? lerCompetencia(corretor, competencia) : null;
  return { title: leitura?.nome ?? "Competência" };
}

/**
 * A corrente que a tela precisa fechar, na ordem:
 * nota → por que recebi → qual a prova → o que faço agora.
 *
 * Quebrar essa ordem é o que faz avaliação virar discussão: nota sem
 * prova o corretor contesta, prova sem próxima ação não muda nada.
 */
export default async function PáginaCompetência({
  params,
}: {
  params: Promise<{ competencia: string }>;
}) {
  const { competencia } = await params;
  const { pessoa, corretor } = await exigirCorretor();
  if (!corretor) notFound();

  const leitura = lerCompetencia(corretor, competencia);
  if (!leitura) notFound();

  const provas = provasDa(corretor, leitura.chave);
  const plano = planoDaCompetencia(pessoa.id, leitura.chave);
  const treinos = treinamentosDaCompetenciaDoCorretor(pessoa.id, leitura.chave);
  const atividades = atividadesDaCompetencia(pessoa.id, leitura.chave);
  const proxima = atividades.find((a) => a.status !== "concluida");
  const alerta = leitura.status === "atencao";

  return (
    <Pagina largura="media">
      <Voltar href="/meu-desempenho">Voltar para meu desempenho</Voltar>

      <Cabecalho
        etiqueta={`Ciclo atual · ${IMOBILIARIA.ciclo}`}
        titulo={leitura.nome}
        apoio={leitura.mede}
      />

      <section
        className={cn(
          "flex flex-wrap items-center gap-x-8 gap-y-4 rounded-xl border px-6 py-5",
          alerta ? "border-alerta/25 bg-alerta-suave/50" : "border-linha bg-white"
        )}
      >
        <Vertice competencia={leitura.chave} nota={leitura.nota} tamanho={64} />

        <div className="flex flex-col">
          <span className="text-[0.78rem] text-suave">Nota atual</span>
          <span
            className={cn(
              "text-[2.4rem] font-bold leading-none tabular-nums tracking-[-0.04em]",
              alerta ? "text-alerta" : "text-tinta"
            )}
          >
            {fmt(leitura.nota)}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[0.78rem] text-suave">Nota anterior</span>
          <span className="text-[1.4rem] font-semibold leading-none tabular-nums text-tinta-suave">
            {leitura.anterior === null ? "—" : fmt(leitura.anterior)}
          </span>
          <Variacao valor={leitura.variacao} className="mt-1.5" />
        </div>

        <div className="ml-auto flex flex-col items-end gap-2">
          <SeloCompetencia status={leitura.status} />
          <div className="w-40">
            <Barra porcentagem={(leitura.nota / 10) * 100} alerta={alerta} />
          </div>
        </div>
      </section>

      <Secao
        titulo="Por que recebi essa nota"
        apoio="O que foi observado na sua operação, não opinião sobre você."
      >
        <div className="flex flex-col gap-2">
          {provas.map((prova, i) => (
            <article
              key={i}
              className="rounded-xl border border-linha bg-white px-5 py-4"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="rounded-full border border-linha-forte bg-fundo-2 px-2.5 py-0.5 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-tinta-suave">
                  {prova.tipo}
                </span>
                <span className="text-[0.8rem] text-suave">{prova.quando}</span>
              </div>
              <p className="m-0 mt-2.5 text-[0.95rem] leading-relaxed text-tinta-suave">
                {prova.texto}
              </p>
            </article>
          ))}
        </div>
      </Secao>

      <Secao
        titulo="O que preciso melhorar"
        apoio={
          plano.length
            ? "O plano combinado para essa competência."
            : undefined
        }
      >
        {plano.length === 0 ? (
          <Vazio titulo="Nenhum plano registrado para essa competência ainda.">
            Quando a Boechat definir o que treinar aqui, as ações aparecem nesta tela.
          </Vazio>
        ) : (
          <ol className="m-0 flex list-none flex-col gap-2 p-0">
            {plano.map((acao, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-xl border border-linha bg-white px-4 py-3.5"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-laranja-suave text-[0.78rem] font-bold tabular-nums text-acao">
                  {i + 1}
                </span>
                <p className="m-0 text-[0.94rem] leading-relaxed text-tinta-suave">{acao}</p>
              </li>
            ))}
          </ol>
        )}
      </Secao>

      <Secao titulo="Próxima ação" apoio="O passo mais curto entre essa nota e a próxima.">
        {!proxima && treinos.length === 0 ? (
          <Vazio titulo="Nenhuma ação pendente nessa competência.">
            Quando um treino desta competência gerar tarefa para você, ela aparece aqui.
          </Vazio>
        ) : (
          <div className="flex flex-col gap-2">
            {proxima && (
              <Link
                href={`/minhas-atividades/${proxima.id}`}
                className="flex items-center gap-3.5 rounded-xl border border-laranja/30 bg-laranja-suave px-4 py-3.5 no-underline transition-colors hover:border-laranja/60"
              >
                <ListChecks size={17} className="shrink-0 text-acao" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[0.95rem] font-semibold text-tinta">
                    {proxima.titulo}
                  </span>
                  <span className="truncate text-[0.83rem] text-suave-marca">
                    Atividade · {proxima.treinamento.titulo}
                  </span>
                </span>
                <SeloAtividade status={proxima.status} />
                <ArrowRight size={15} className="shrink-0 text-acao" />
              </Link>
            )}

            {treinos.map((t) => (
              <Link
                key={t.treinamento.id}
                href={`/meus-treinamentos/${t.treinamento.id}`}
                className="flex items-center gap-3.5 rounded-xl border border-linha bg-white px-4 py-3.5 no-underline transition-colors hover:border-linha-forte hover:bg-fundo"
              >
                <GraduationCap size={17} className="shrink-0 text-suave" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[0.95rem] font-semibold text-tinta">
                    {t.treinamento.titulo}
                  </span>
                  <span className="text-[0.83rem] text-suave">Treinamento</span>
                </span>
                <SeloAtividade status={t.status} />
                <ArrowRight size={15} className="shrink-0 text-suave" />
              </Link>
            ))}
          </div>
        )}
      </Secao>
    </Pagina>
  );
}
