"use client";

/**
 * Overview de uma pessoa da equipe, aberto ao clicar na linha da lista.
 *
 * É gaveta e não página inteira porque a pergunta que ela responde é de
 * consulta rápida — "como esse corretor está?" — feita no meio da
 * lista. Sair da lista para responder isso custa o contexto de quem
 * estava comparando o time.
 *
 * A animação é CSS (ver `.gaveta` em globals.css), pela mesma razão que
 * o menu de ações virou keyframe em 2026-08-24: deslocamento de 240ms
 * não paga uma biblioteca de animação na rota que mais se abre. O corpo
 * fica separado do gatilho para não ser baixado por quem só consulta.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ClipboardCheck, X } from "lucide-react";
import { Impressao, Vertice } from "@/components/impressao";
import { HexAvatar } from "@/components/hex-avatar";
import { BOTAO } from "@/components/estilos";
import { dataCurta, desdeQuando } from "@/lib/equipe";
import { fmt } from "@/lib/dados";
import type { Overview } from "./acoes";

/** Precisa acompanhar a duração de `.gaveta-saindo .gaveta` no CSS. */
const SAIDA_MS = 220;

function Delta({ agora, antes }: { agora: number; antes: number | null }) {
  if (antes === null) return null;
  const dif = agora - antes;
  if (Math.abs(dif) < 0.05) {
    return <span className="text-[0.8rem] text-suave">igual ao Raio-X</span>;
  }
  const subiu = dif > 0;
  return (
    <span
      className={`text-[0.8rem] font-semibold tabular-nums ${subiu ? "text-ok" : "text-alerta"}`}
    >
      {subiu ? "+" : "−"}
      {fmt(Math.abs(dif))} desde o Raio-X
    </span>
  );
}

export function PainelOverview({
  overview,
  aoFechar,
}: {
  overview: Overview;
  aoFechar: () => void;
}) {
  const tituloId = useId();
  const gaveta = useRef<HTMLDivElement>(null);
  const gatilhoAnterior = useRef<HTMLElement | null>(null);
  const [saindo, setSaindo] = useState(false);

  /** Deixa a saída acontecer na tela antes de tirar o nó do DOM. */
  const fechar = useCallback(() => {
    setSaindo(true);
    setTimeout(aoFechar, SAIDA_MS);
  }, [aoFechar]);

  const { pessoa, avaliacao, competencias, notas, inicial } = overview;
  const inativo = pessoa.status === "inativo";

  useEffect(() => {
    gatilhoAnterior.current = document.activeElement as HTMLElement | null;
    gaveta.current?.focus();

    const esc = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    const rolagem = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", esc);

    return () => {
      document.body.style.overflow = rolagem;
      document.removeEventListener("keydown", esc);
      gatilhoAnterior.current?.focus();
      gatilhoAnterior.current = null;
    };
  }, [fechar]);

  return (
    <div className={`fixed inset-0 z-50 flex justify-end ${saindo ? "gaveta-saindo" : ""}`}>
      <div
        className="veu absolute inset-0 bg-tinta/35"
        onClick={fechar}
        aria-hidden="true"
      />

      <div
        ref={gaveta}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="gaveta relative flex h-full w-full max-w-[27rem] flex-col overflow-y-auto border-l border-linha bg-white shadow-2xl outline-none"
      >
        <div className="sticky top-0 z-10 flex items-start gap-3 border-b border-linha bg-white/95 px-5 py-4 backdrop-blur">
          <HexAvatar
            nome={pessoa.nome}
            tamanho={44}
            tom={inativo ? "neutro" : "laranja"}
          />

          <div className="min-w-0 flex-1">
            <h2
              id={tituloId}
              className="m-0 flex items-center gap-2 text-[1.1rem] font-bold tracking-[-0.02em] text-tinta"
            >
              <span className="truncate">{pessoa.nome}</span>
              {inativo && (
                <span className="shrink-0 rounded-full bg-fundo-2 px-2 py-0.5 text-[0.64rem] font-bold uppercase tracking-wide text-suave">
                  Inativo
                </span>
              )}
            </h2>
            {/* O cargo é texto livre da imobiliária e o papel é do
                sistema. Quando dizem a mesma coisa, repetir só ocupa a
                linha: "Corretor · Corretor". */}
            <p className="m-0 truncate text-[0.84rem] text-suave">
              {pessoa.cargo === overview.papelRotulo
                ? pessoa.cargo
                : `${pessoa.cargo} · ${overview.papelRotulo}`}
            </p>
          </div>

          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar"
            className="alvo-toque -mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-suave transition-colors hover:bg-fundo-2"
          >
            <X size={17} />
          </button>
        </div>

        <div className="escalona flex flex-col gap-5 px-5 py-5">
          {notas ? (
            <>
              {/* A silhueta primeiro: é o resumo que o produto inteiro
                  entrega, e responde "como está" antes de qualquer número. */}
              <section className="flex flex-col items-center rounded-xl border border-linha bg-fundo px-4 py-4">
                <Impressao
                  notas={notas}
                  antes={inicial ?? undefined}
                  tamanho={220}
                  rotulos
                  malha
                  anima
                  className="max-w-full"
                />
                <div className="flex items-baseline gap-2">
                  <span className="text-[2.2rem] font-bold leading-none tabular-nums tracking-[-0.035em] text-tinta">
                    {fmt(overview.nota ?? 0)}
                  </span>
                  <span className="text-[0.82rem] text-suave">nota geral</span>
                </div>
                <Delta agora={overview.nota ?? 0} antes={overview.notaAntes} />
              </section>

              {avaliacao && (
                <section className="flex flex-wrap items-center gap-3 rounded-xl border border-linha bg-white px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
                      Ciclo de {avaliacao.ciclo.toLowerCase()}
                    </p>
                    <p className="m-0 text-[0.92rem] font-semibold text-tinta">
                      {avaliacao.rotulo} · {avaliacao.feitas} de {avaliacao.total}
                      {avaliacao.avaliadaPor ? ` · por ${avaliacao.avaliadaPor}` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/avaliacoes/${pessoa.id}`}
                    className={BOTAO.contornoMiudo}
                    onClick={aoFechar}
                  >
                    <ClipboardCheck size={14} />
                    {avaliacao.status === "avaliado" ? "Revisar" : "Avaliar"}
                  </Link>
                </section>
              )}

              <section className="flex flex-col gap-2.5">
                <h3 className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
                  As seis competências
                </h3>

                {competencias.map((c) => {
                  const baixa = c.nota < 5;
                  return (
                    <article
                      key={c.chave}
                      className={`rounded-xl border px-4 py-3 ${
                        baixa ? "border-alerta/40 bg-alerta-suave" : "border-linha bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Vertice competencia={c.chave} nota={c.nota} tamanho={19} />
                        <span className="flex-1 truncate text-[0.93rem] font-semibold text-tinta">
                          {c.nome}
                        </span>
                        {c.antes !== null && c.antes !== c.nota && (
                          <span className="text-[0.76rem] tabular-nums text-suave">
                            era {fmt(c.antes)}
                          </span>
                        )}
                        <span
                          className={`text-[1.05rem] font-bold tabular-nums ${
                            baixa ? "text-alerta" : "text-tinta"
                          }`}
                        >
                          {fmt(c.nota)}
                        </span>
                      </div>

                      <p className="m-0 mt-1.5 text-[0.84rem] leading-snug text-tinta-suave">
                        {c.evidencia}
                      </p>
                      <p className="m-0 mt-1 text-[0.74rem] uppercase tracking-wider text-suave">
                        prova: {c.tipo}
                      </p>
                    </article>
                  );
                })}
              </section>
            </>
          ) : (
            /* Quem não é corretor não tem silhueta: o que existe para
               mostrar aqui é acesso, não desempenho. */
            <section className="rounded-xl border border-linha bg-white px-4 py-4">
              <p className="m-0 text-[0.88rem] text-tinta-suave">
                {overview.papelRotulo} não é avaliado no ciclo. A silhueta das seis
                competências existe para quem atende lead.
              </p>
            </section>
          )}

          <section className="rounded-xl border border-linha bg-white px-4 py-3.5">
            <h3 className="m-0 mb-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
              Cadastro
            </h3>
            <dl className="m-0 grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1.5 text-[0.86rem]">
              <dt className="text-suave">E-mail</dt>
              <dd className="m-0 truncate text-tinta">{pessoa.email}</dd>

              <dt className="text-suave">Papel</dt>
              <dd className="m-0 text-tinta">{overview.papelRotulo}</dd>

              <dt className="text-suave">Na equipe desde</dt>
              <dd className="m-0 text-tinta">{dataCurta(pessoa.entrada)}</dd>

              <dt className="text-suave">Último acesso</dt>
              <dd className="m-0 text-tinta">{desdeQuando(pessoa.ultimoAcesso)}</dd>
            </dl>
          </section>
        </div>

        {notas && (
          <div className="sticky bottom-0 mt-auto border-t border-linha bg-white/95 px-5 py-3.5 backdrop-blur">
            <Link
              href={`/painel/corretor/${pessoa.id}`}
              className={`${BOTAO.solido} w-full`}
              onClick={aoFechar}
            >
              Ver perfil completo
              <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
