import Link from "next/link";
import type { Metadata } from "next";
import { Pagina, Secao, Vazio } from "@/components/pagina";
import { Impressao } from "@/components/impressao";
import { HexAvatar } from "@/components/hex-avatar";
import {
  COMPETENCIAS,
  IMOBILIARIA,
  critica,
  fmt,
  media,
  mediasPorCompetencia,
  type Corretor,
  type Notas,
} from "@/lib/dados";
import { resumoDoCiclo } from "@/lib/avaliacoes";
import { treinamentosDaCompetencia } from "@/lib/treinamentos";
import { dataCurta } from "@/lib/equipe";
import { BOTAO } from "@/components/estilos";

export const metadata: Metadata = { title: "Painel" };

/** Média do time em cada competência, no formato que a Impressão desenha. */
function silhuetaDoTime(corretores: Corretor[]): Notas {
  const notas = {} as Notas;
  for (const c of COMPETENCIAS) {
    notas[c.chave] = corretores.reduce((s, p) => s + p.notas[c.chave], 0) / corretores.length;
  }
  return notas;
}

function Variacao({ pessoa }: { pessoa: Corretor }) {
  if (!pessoa.anterior) {
    return <span className="text-[0.78rem] font-medium text-suave">1º ciclo</span>;
  }

  const diff = media(pessoa.notas) - media(pessoa.anterior);
  if (Math.abs(diff) < 0.05) {
    return <span className="text-[0.78rem] font-medium text-suave">estável</span>;
  }

  const sobe = diff > 0;
  return (
    <span
      className={`text-[0.8rem] font-semibold tabular-nums ${sobe ? "text-ok" : "text-alerta"}`}
    >
      {sobe ? "+" : "−"}
      {fmt(Math.abs(diff))}
    </span>
  );
}

/** Número com rótulo pequeno embaixo. Usado só na faixa de prova do diagnóstico. */
function Prova({
  valor,
  rotulo,
  alerta,
}: {
  valor: string;
  rotulo: string;
  alerta?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span
        className={`text-[1.4rem] font-bold leading-tight tracking-[-0.02em] tabular-nums ${alerta ? "text-alerta" : "text-tinta"}`}
      >
        {valor}
      </span>
      <span className="text-[0.76rem] text-suave">{rotulo}</span>
    </div>
  );
}

function CartaoAcao({
  marca,
  alerta,
  titulo,
  apoio,
  href,
  acao,
}: {
  marca: string;
  alerta?: boolean;
  titulo: string;
  apoio: string;
  href: string;
  acao: string;
}) {
  return (
    <div className="flex items-start gap-3.5 rounded-xl border border-linha bg-white px-4 py-4">
      <span
        style={{ width: 26, height: 29 }}
        className={`hex-recorte grid shrink-0 place-items-center text-[0.76rem] font-bold ${
          alerta ? "bg-alerta-suave text-alerta" : "bg-laranja-suave text-acao"
        }`}
      >
        {marca}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[0.92rem] font-semibold tracking-[-0.01em] text-tinta">
          {titulo}
        </span>
        <span className="text-[0.83rem] text-suave">{apoio}</span>
        <Link
          href={href}
          className="mt-1 w-fit text-[0.83rem] font-semibold text-acao no-underline hover:underline"
        >
          {acao}
        </Link>
      </div>
    </div>
  );
}

export default async function PáginaPainel() {
  const { nome, ciclo, corretores } = IMOBILIARIA;

  if (corretores.length === 0) {
    return (
      <Pagina>
        <Vazio titulo="Nenhum corretor avaliado ainda">
          Assim que a primeira avaliação fechar em Avaliações, o time aparece aqui.
        </Vazio>
      </Pagina>
    );
  }

  const ranking = [...corretores].sort((a, b) => media(b.notas) - media(a.notas));
  const porCompetencia = mediasPorCompetencia(corretores);
  const maisFraca = porCompetencia[0];
  const notaGeral = corretores.reduce((s, p) => s + media(p.notas), 0) / corretores.length;

  const fracosNela = corretores.filter((p) => critica(p.notas[maisFraca.chave]));
  const emAtencao = corretores.filter((p) =>
    COMPETENCIAS.some((c) => critica(p.notas[c.chave]))
  );

  const resumo = resumoDoCiclo();
  const treinoDoTema = treinamentosDaCompetencia(maisFraca.chave)[0];

  return (
    <Pagina>
      {/* O diagnóstico lidera a tela: a pergunta do dono não é "como
          estamos", é "o que está travando". */}
      <section className="grid overflow-hidden rounded-xl border border-linha bg-white md:grid-cols-[1fr_20rem]">
        <div className="flex flex-col px-6 py-6 sm:px-7 sm:py-7">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
            {nome} · o que está travando o time agora
          </span>

          <h1 className="m-0 mt-3 max-w-[15ch] text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] text-tinta sm:text-[2.15rem]">
            <span className="text-acao">{maisFraca.nome}</span> é o ponto mais fraco
            do time.
          </h1>

          <p className="m-0 mt-3.5 max-w-[52ch] text-[0.98rem] text-tinta-suave">
            Média {fmt(maisFraca.valor)} de 10
            {critica(maisFraca.valor) ? ", abaixo da linha de corte" : ""}, e ela aparece fraca
            em {fracosNela.length} {fracosNela.length === 1 ? "corretor" : "corretores"} de{" "}
            {corretores.length}. Corrigir ela move mais resultado do que qualquer outra.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4 border-t border-linha pt-5">
            <Prova
              valor={fmt(maisFraca.valor)}
              rotulo={`${maisFraca.nome} do time`}
              alerta={critica(maisFraca.valor)}
            />
            <Prova valor={fmt(notaGeral)} rotulo="Nota geral do time" />
            <Prova
              valor={`${fracosNela.length} de ${corretores.length}`}
              rotulo="Corretores fracos nela"
            />
            <Prova valor={String(resumo.notasLancadas)} rotulo="Provas no ciclo em coleta" />
          </div>
        </div>

        <div className="relative grid place-items-center border-t border-linha bg-laranja-suave px-4 pb-9 pt-5 md:border-l md:border-t-0">
          <Impressao
            notas={silhuetaDoTime(corretores)}
            tamanho={280}
            rotulos
            malha
            fraco={maisFraca.chave}
            anima
          />
          <span className="absolute inset-x-0 bottom-3.5 text-center text-[0.76rem] font-semibold text-acao">
            Silhueta do time · {ciclo.toLowerCase()}
          </span>
        </div>
      </section>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {emAtencao.length > 0 && (
          <CartaoAcao
            marca={String(emAtencao.length)}
            alerta
            titulo={`${emAtencao.length} ${emAtencao.length === 1 ? "corretor em zona crítica" : "corretores em zona crítica"}`}
            apoio={`${emAtencao
              .slice(0, 2)
              .map((p) => p.nome)
              .join(" e ")}${emAtencao.length > 2 ? ` e mais ${emAtencao.length - 2}` : ""}, com competência abaixo de 5.`}
            href={`/painel/corretor/${emAtencao[0].id}`}
            acao="Ver perfil"
          />
        )}

        {resumo.pendentes > 0 && (
          <CartaoAcao
            marca={String(resumo.pendentes)}
            titulo={`${resumo.pendentes} ${resumo.pendentes === 1 ? "avaliação falta" : "avaliações faltam"} fechar`}
            apoio={`${resumo.avaliados} de ${resumo.total} concluídas no ciclo em coleta.`}
            href="/avaliacoes"
            acao="Abrir coleta"
          />
        )}

        {treinoDoTema ? (
          <CartaoAcao
            marca="↗"
            titulo={`Treino de ${maisFraca.nome.toLowerCase()} em ${dataCurta(treinoDoTema.data)}`}
            apoio={`${treinoDoTema.participantesIds.length} ${treinoDoTema.participantesIds.length === 1 ? "participante" : "participantes"} · ${treinoDoTema.titulo}`}
            href={`/treinamentos/${treinoDoTema.id}`}
            acao="Ver treinamento"
          />
        ) : (
          <CartaoAcao
            marca="↗"
            titulo={`Sem treino de ${maisFraca.nome.toLowerCase()}`}
            apoio="A competência mais fraca do time ainda não tem treinamento registrado."
            href="/treinamentos"
            acao="Registrar treinamento"
          />
        )}
      </div>

      <Secao
        titulo="Time por silhueta"
        apoio="Comparar pessoa é comparar formato, não só número. O que afunda pra dentro do anel tracejado está abaixo de 5."
        acao={
          <Link
            href="/equipe"
            className={BOTAO.contornoMiudo}
          >
            Gerenciar equipe
          </Link>
        }
      >
        <div className="overflow-hidden rounded-xl border border-linha bg-white">
          <div className="hidden grid-cols-[1.6rem_2.75rem_minmax(9rem,1fr)_12rem_4rem_4rem] items-center gap-4 border-b border-linha px-5 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-suave lg:grid">
            <span className="text-right">#</span>
            <span />
            <span>Corretor</span>
            <span>Competência mais fraca</span>
            <span className="text-right">Nota</span>
            <span className="text-right">No ciclo</span>
          </div>

          {ranking.map((pessoa, i) => {
            const nota = media(pessoa.notas);
            const fracas = COMPETENCIAS.filter((c) => critica(pessoa.notas[c.chave]));
            const pior = [...COMPETENCIAS].sort(
              (a, b) => pessoa.notas[a.chave] - pessoa.notas[b.chave]
            )[0];

            return (
              <Link
                key={pessoa.id}
                href={`/painel/corretor/${pessoa.id}`}
                className="grid grid-cols-[1.6rem_2.75rem_1fr_auto] items-center gap-x-4 gap-y-1.5 border-t border-linha px-4 py-3 no-underline transition-colors first:border-t-0 hover:bg-fundo lg:grid-cols-[1.6rem_2.75rem_minmax(9rem,1fr)_12rem_4rem_4rem] lg:px-5"
              >
                <span className="text-right text-[0.82rem] font-medium tabular-nums text-suave">
                  {i + 1}
                </span>

                <Impressao notas={pessoa.notas} tamanho={42} anima />

                <div className="flex min-w-0 items-center gap-3">
                  <HexAvatar nome={pessoa.nome} tamanho={32} />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[0.96rem] font-semibold tracking-[-0.01em] text-tinta">
                      {pessoa.nome}
                    </span>
                    <span className="truncate text-[0.79rem] text-suave">
                      {fracas.length === 0
                        ? "nenhuma competência abaixo de 5"
                        : `${fracas.length} ${fracas.length === 1 ? "competência" : "competências"} abaixo de 5`}
                    </span>
                  </div>
                </div>

                <span className="col-span-4 text-[0.85rem] text-tinta-suave lg:col-span-1">
                  {pior.nome}{" "}
                  <span
                    className={`tabular-nums ${critica(pessoa.notas[pior.chave]) ? "font-semibold text-alerta" : "text-suave"}`}
                  >
                    {fmt(pessoa.notas[pior.chave])}
                  </span>
                </span>

                <span
                  className={`text-right text-[1.2rem] font-bold tabular-nums tracking-[-0.02em] ${nota < 5 ? "text-alerta" : "text-tinta"}`}
                >
                  {fmt(nota)}
                </span>

                <span className="text-right">
                  <Variacao pessoa={pessoa} />
                </span>
              </Link>
            );
          })}
        </div>
      </Secao>

      <footer className="border-t border-linha pt-5 text-[0.82rem] text-suave">
        Cada nota vem de uma prova registrada: áudio de atendimento, tempo de resposta
        medido ou role-play gravado. Abra um corretor para ver a de cada competência.
      </footer>
    </Pagina>
  );
}
