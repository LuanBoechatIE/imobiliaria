"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Check, Save } from "lucide-react";
import { RatingScaleGroup, RatingScaleItem } from "@/components/ui/rating-scale-group";
import { gravarAvaliacao } from "../acoes";
import { COMPETENCIAS, type ChaveCompetencia } from "@/lib/dados";
import type { Avaliacao } from "@/lib/avaliacoes";

const O_QUE_MEDE: Record<ChaveCompetencia, string> = {
  velocidade: "Tempo entre o lead chegar e o corretor falar com ele.",
  qualificacao: "Descobre renda, situação de crédito, urgência e quem decide.",
  visita: "Preparo, roteiro de imóveis, leitura de sinal e retorno depois.",
  followup: "Cadência real de contato, e o que faz com quem parou de responder.",
  negociacao: "Com o comprador e com o proprietário.",
  registro: "Usa o processo e deixa rastro, de forma que a carteira fique com a imobiliária.",
};

const TIPOS = ["áudio", "tempo", "role-play", "registro"] as const;

const caixa =
  "w-full rounded-md border border-linha-forte bg-white px-3 py-2 text-[0.92rem] text-tinta outline-none transition focus:border-laranja focus:ring-3 focus:ring-laranja-suave";

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

  const preenchidas = COMPETENCIAS.filter((c) => notas[c.chave] !== undefined).length;
  const completo = preenchidas === COMPETENCIAS.length;

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="corretorId" value={corretorId} />

      {/* progresso */}
      <div className="sticky top-14 z-20 flex items-center gap-3 rounded-xl border border-linha bg-white/95 px-4 py-3 backdrop-blur">
        <span className="h-2 flex-1 overflow-hidden rounded-full bg-fundo-2">
          <span
            className={`block h-full rounded-full transition-all ${completo ? "bg-ok" : "bg-laranja"}`}
            style={{ width: `${(preenchidas / COMPETENCIAS.length) * 100}%` }}
          />
        </span>
        <span className="shrink-0 text-[0.83rem] font-semibold tabular-nums text-tinta-suave">
          {preenchidas} de {COMPETENCIAS.length}
        </span>
      </div>

      {estado?.erro && (
        <p className="flex items-start gap-2 rounded-lg border border-alerta/30 bg-alerta-suave px-4 py-3 text-[0.9rem] text-alerta">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          {estado.erro}
        </p>
      )}

      {estado?.salvo && (
        <p className="flex items-center gap-2 rounded-lg border border-ok/30 bg-ok-suave px-4 py-3 text-[0.9rem] font-medium text-ok">
          <Check size={17} />
          Rascunho salvo. Dá para voltar e terminar depois.
        </p>
      )}

      {COMPETENCIAS.map((c) => {
        const item = avaliacao?.itens[c.chave];
        const valor = notas[c.chave];
        const baixa = valor !== undefined && Number(valor) < 5;

        return (
          <fieldset
            key={c.chave}
            className={`flex flex-col gap-3 rounded-xl border bg-white px-4 py-4 transition-colors ${
              baixa ? "border-alerta/40" : "border-linha"
            }`}
          >
            <legend className="flex flex-wrap items-baseline gap-x-2.5 px-1">
              <span className="text-[1rem] font-bold tracking-tight text-tinta">{c.nome}</span>
              <span className="text-[0.83rem] text-suave">{O_QUE_MEDE[c.chave]}</span>
            </legend>

            <div className="flex flex-col gap-1.5">
              <span className="text-[0.78rem] font-semibold uppercase tracking-wider text-suave">
                Nota
              </span>
              <RatingScaleGroup
                name={`nota-${c.chave}`}
                value={valor ?? ""}
                onValueChange={(v) => setNotas((n) => ({ ...n, [c.chave]: v }))}
              >
                {Array.from({ length: 11 }).map((_, i) => (
                  <RatingScaleItem
                    key={i}
                    value={String(i)}
                    label={String(i)}
                    atencao={i < 5}
                  />
                ))}
              </RatingScaleGroup>
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
              </div>
            </div>
          </fieldset>
        );
      })}

      <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-t border-linha bg-fundo/95 py-3 backdrop-blur">
        <button
          type="submit"
          name="acao"
          value="rascunho"
          disabled={enviando}
          className="inline-flex items-center gap-1.5 rounded-md border border-linha-forte bg-white px-3.5 py-2 text-[0.9rem] font-semibold text-tinta-suave transition-colors hover:bg-fundo-2 disabled:opacity-60"
        >
          <Save size={15} />
          Salvar rascunho
        </button>
        <button
          type="submit"
          name="acao"
          value="concluir"
          disabled={enviando}
          className="inline-flex items-center gap-1.5 rounded-md bg-laranja px-3.5 py-2 text-[0.9rem] font-semibold text-white transition-colors hover:bg-laranja-escuro disabled:opacity-60"
        >
          <Check size={16} strokeWidth={2.6} />
          Concluir avaliação
        </button>
      </div>
    </form>
  );
}
