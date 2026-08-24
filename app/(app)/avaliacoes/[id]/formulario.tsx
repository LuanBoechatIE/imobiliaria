"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Check, Save } from "lucide-react";
import { RatingScaleGroup, RatingScaleItem } from "@/components/ui/rating-scale-group";
import { Impressao, Vertice } from "@/components/impressao";
import { gravarAvaliacao } from "../acoes";
import { COMPETENCIAS, fmt, type ChaveCompetencia, type Notas } from "@/lib/dados";
import type { Avaliacao } from "@/lib/avaliacoes";

const TIPOS = ["áudio", "tempo", "role-play", "registro"] as const;

const caixa =
  "w-full rounded-md border border-borda-campo bg-white px-3 py-2 text-[0.92rem] text-tinta transition focus:border-acao";

export function Formulario({
  corretorId,
  avaliacao,
}: {
  corretorId: string;
  avaliacao?: Avaliacao;
}) {
  const [estado, acao, enviando] = useActionState(gravarAvaliacao, null);

  const [notas, setNotas] = useState<Partial<Record<ChaveCompetencia, string>>>(() => {
    const inicial: Partial<Record<ChaveCompetencia, string>> = {};
    for (const c of COMPETENCIAS) {
      const item = avaliacao?.itens[c.chave];
      if (item) inicial[c.chave] = String(item.nota);
    }
    return inicial;
  });

  const dadas = COMPETENCIAS.filter((c) => notas[c.chave] !== undefined);
  const preenchidas = dadas.length;
  const completo = preenchidas === COMPETENCIAS.length;

  // A silhueta parcial mostra o vazio: o que ainda não foi avaliado fica
  // colado no centro, então dá para ver a forma se fechando nota a nota.
  const parcial = {} as Notas;
  for (const c of COMPETENCIAS) parcial[c.chave] = Number(notas[c.chave] ?? 0);

  const mediaDadas = preenchidas
    ? dadas.reduce((s, c) => s + Number(notas[c.chave]), 0) / preenchidas
    : 0;

  return (
    <form action={acao} className="grid items-start gap-5 lg:grid-cols-[1fr_20rem]">
      <input type="hidden" name="corretorId" value={corretorId} />

      <div className="flex flex-col gap-4">
        {estado?.erro && (
          <p className="m-0 flex items-start gap-2 rounded-lg border border-alerta/30 bg-alerta-suave px-4 py-3 text-[0.9rem] text-alerta">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            {estado.erro}
          </p>
        )}

        {estado?.salvo && (
          <p className="m-0 flex items-center gap-2 rounded-lg border border-ok/30 bg-ok-suave px-4 py-3 text-[0.9rem] font-medium text-ok">
            <Check size={17} />
            Rascunho salvo. Dá para voltar e terminar depois.
          </p>
        )}

        {COMPETENCIAS.map((c, i) => {
          const item = avaliacao?.itens[c.chave];
          const valor = notas[c.chave];
          const baixa = valor !== undefined && Number(valor) < 5;

          return (
            <fieldset
              key={c.chave}
              className={`flex flex-col gap-3 rounded-xl border bg-white px-4 py-4 transition-colors sm:px-5 ${
                baixa ? "border-alerta/40" : "border-linha"
              }`}
            >
              <legend className="flex items-center gap-2.5 px-1">
                <Vertice
                  competencia={c.chave}
                  nota={valor !== undefined ? Number(valor) : undefined}
                  tamanho={21}
                />
                <span className="text-[1rem] font-bold tracking-[-0.015em] text-tinta">
                  {i + 1}. {c.nome}
                </span>
                <span
                  className={`text-[1.15rem] font-bold tabular-nums ${
                    valor === undefined
                      ? "text-suave"
                      : baixa
                        ? "text-alerta"
                        : "text-tinta"
                  }`}
                >
                  {valor === undefined ? "·" : fmt(Number(valor))}
                </span>
              </legend>

              <p className="m-0 text-[0.86rem] text-suave">{c.mede}</p>

              <div className="flex flex-col gap-1.5">
                <RatingScaleGroup
                  name={`nota-${c.chave}`}
                  value={valor ?? ""}
                  onValueChange={(v) => setNotas((n) => ({ ...n, [c.chave]: v }))}
                >
                  {Array.from({ length: 11 }).map((_, n) => (
                    <RatingScaleItem
                      key={n}
                      value={String(n)}
                      label={String(n)}
                      atencao={n < 5}
                    />
                  ))}
                </RatingScaleGroup>
                <div className="flex flex-wrap justify-between gap-x-4 text-[0.73rem] text-suave">
                  <span className="font-semibold text-alerta">0 a 4 · zona crítica</span>
                  <span>5 a 7 · faz o básico</span>
                  <span>8 a 10 · referência</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-[0.78rem] font-semibold uppercase tracking-wider text-suave"
                    htmlFor={`tipo-${c.chave}`}
                  >
                    Tipo de prova
                  </label>
                  <select
                    id={`tipo-${c.chave}`}
                    name={`tipo-${c.chave}`}
                    className={caixa}
                    defaultValue={item?.tipo ?? "áudio"}
                  >
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-[0.78rem] font-semibold uppercase tracking-wider text-suave"
                    htmlFor={`evidencia-${c.chave}`}
                  >
                    O que foi observado
                  </label>
                  <textarea
                    id={`evidencia-${c.chave}`}
                    name={`evidencia-${c.chave}`}
                    rows={2}
                    className={`${caixa} resize-y`}
                    defaultValue={item?.evidencia}
                    placeholder="O fato concreto que sustenta essa nota. Sem isso a nota não vale."
                  />
                  <p
                    className={`m-0 text-[0.78rem] ${baixa ? "font-medium text-alerta" : "text-suave"}`}
                  >
                    {baixa
                      ? "Nota abaixo de 5 entra no plano de treino do próximo ciclo."
                      : "A nota só vale com a prova escrita ao lado."}
                  </p>
                </div>
              </div>
            </fieldset>
          );
        })}
      </div>

      {/* A silhueta em construção substitui a barra de progresso: o que
          mede o avanço aqui é o mesmo desenho que o produto entrega. */}
      <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
        <div className="flex flex-col items-center rounded-xl border border-linha bg-white px-5 py-5 text-center">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
            Silhueta em construção
          </span>

          <Impressao notas={parcial} tamanho={250} rotulos malha className="max-w-full" />

          <div className="flex items-baseline gap-2">
            <span className="text-[2.1rem] font-bold leading-none tabular-nums tracking-[-0.035em] text-tinta">
              {fmt(mediaDadas)}
            </span>
            <span className="text-[0.85rem] text-suave">
              de {preenchidas} {preenchidas === 1 ? "preenchida" : "preenchidas"}
            </span>
          </div>

          <p className="m-0 mt-1.5 text-[0.82rem] text-suave">
            A forma fecha quando as seis notas entram.
          </p>
        </div>

        <div className="rounded-xl border border-linha bg-white px-4 py-4">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
            Provas anexadas
          </span>

          <div className="mt-2 flex flex-col">
            {COMPETENCIAS.map((c) => {
              const valor = notas[c.chave];
              const feito = valor !== undefined;
              return (
                <span
                  key={c.chave}
                  className={`flex items-center gap-2.5 py-1.5 text-[0.87rem] ${feito ? "text-tinta" : "text-suave"}`}
                >
                  <span
                    style={{ width: 16, height: 18 }}
                    className={`hex-recorte shrink-0 ${feito ? "bg-acao" : "bg-fundo-2"}`}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{c.nome}</span>
                  <span className="font-semibold tabular-nums">
                    {feito ? fmt(Number(valor)) : "·"}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="submit"
              name="acao"
              value="rascunho"
              disabled={enviando}
              className="alvo-alto inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-linha-forte bg-white px-3.5 py-2 text-[0.9rem] font-semibold text-tinta-suave transition-colors hover:bg-fundo-2 disabled:opacity-60"
            >
              <Save size={15} />
              Rascunho
            </button>
            <button
              type="submit"
              name="acao"
              value="concluir"
              disabled={enviando}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-acao px-3.5 py-2 alvo-alto text-[0.9rem] font-semibold text-white transition-colors hover:bg-acao-forte disabled:opacity-60"
            >
              <Check size={16} strokeWidth={2.6} />
              Concluir
            </button>
          </div>
          <p className="m-0 text-center text-[0.79rem] text-suave">
            {completo
              ? "As seis notas estão dadas. Falta só a prova escrita de cada uma."
              : `Só fecha com as ${COMPETENCIAS.length} notas e as ${COMPETENCIAS.length} provas escritas.`}
          </p>
        </div>
      </aside>
    </form>
  );
}
