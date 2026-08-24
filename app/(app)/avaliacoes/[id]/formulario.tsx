"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Check, Save } from "lucide-react";
import { EscalaNota } from "@/components/ui/rating-scale-group";
import { Impressao, Vertice } from "@/components/impressao";
import { gravarAvaliacao } from "../acoes";
import { COMPETENCIAS, fmt, type ChaveCompetencia, type Notas } from "@/lib/dados";
import type { Avaliacao } from "@/lib/avaliacoes";

const TIPOS = ["áudio", "tempo", "role-play", "registro"] as const;

const caixa =
  "w-full rounded-md border border-borda-campo bg-white px-3 py-2 text-[0.92rem] text-tinta transition focus:border-acao";

type Preenchidos = Partial<Record<ChaveCompetencia, string>>;

export function Formulario({
  corretorId,
  avaliacao,
}: {
  corretorId: string;
  avaliacao?: Avaliacao;
}) {
  const [estado, acao, enviando] = useActionState(gravarAvaliacao, null);

  const [notas, setNotas] = useState<Preenchidos>(() => {
    const inicial: Preenchidos = {};
    for (const c of COMPETENCIAS) {
      const item = avaliacao?.itens[c.chave];
      if (item) inicial[c.chave] = String(item.nota);
    }
    return inicial;
  });

  /**
   * A prova escrita também é estado, e não só `defaultValue`.
   *
   * Sem isso a tela não sabe o que falta antes de enviar, e quem clica
   * em "Concluir" com uma prova em branco só descobre pela recusa do
   * servidor — cuja mensagem aparece no topo de um formulário de seis
   * blocos, ou seja, fora da tela de quem acabou de rolar até o botão.
   * Era isto que fazia o envio parecer que não acontecia.
   */
  const [provas, setProvas] = useState<Preenchidos>(() => {
    const inicial: Preenchidos = {};
    for (const c of COMPETENCIAS) {
      const item = avaliacao?.itens[c.chave];
      if (item?.evidencia) inicial[c.chave] = item.evidencia;
    }
    return inicial;
  });

  /** Só depois da primeira tentativa de concluir é que o vazio vira erro. */
  const [cobrando, setCobrando] = useState(false);

  const blocos = useRef(new Map<ChaveCompetencia, HTMLFieldSetElement | null>());

  const dadas = COMPETENCIAS.filter((c) => notas[c.chave] !== undefined);
  const preenchidas = dadas.length;

  const semNota = COMPETENCIAS.filter((c) => notas[c.chave] === undefined);
  const semProva = COMPETENCIAS.filter(
    (c) => notas[c.chave] !== undefined && !(provas[c.chave] ?? "").trim()
  );
  const faltando = COMPETENCIAS.filter(
    (c) => notas[c.chave] === undefined || !(provas[c.chave] ?? "").trim()
  );
  const completo = faltando.length === 0;

  // A silhueta parcial mostra o vazio: o que ainda não foi avaliado fica
  // colado no centro, então dá para ver a forma se fechando nota a nota.
  const parcial = {} as Notas;
  for (const c of COMPETENCIAS) parcial[c.chave] = Number(notas[c.chave] ?? 0);

  const mediaDadas = preenchidas
    ? dadas.reduce((s, c) => s + Number(notas[c.chave]), 0) / preenchidas
    : 0;

  /**
   * A resposta do servidor vira aviso flutuante, no canto onde os outros
   * avisos do sistema aparecem. A faixa no topo continua, para quem
   * rolar de volta, mas quem está no botão precisa ver na hora.
   */
  useEffect(() => {
    if (estado?.erro) {
      toast.error("A avaliação não foi enviada", { description: estado.erro });
    } else if (estado?.salvo) {
      toast.success("Rascunho salvo", {
        description: "Dá para fechar a tela e terminar depois.",
      });
    }
  }, [estado]);

  /** Leva o olho até o bloco que falta, em vez de só dizer que falta. */
  function levarAte(chave: ChaveCompetencia) {
    const bloco = blocos.current.get(chave);
    if (!bloco) return;
    bloco.scrollIntoView({ behavior: "smooth", block: "center" });
    const alvo =
      notas[chave] === undefined
        ? bloco.querySelector<HTMLInputElement>('input[type="radio"]')
        : bloco.querySelector<HTMLTextAreaElement>("textarea");
    // O foco espera a rolagem para não brigar com ela no meio do caminho.
    setTimeout(() => alvo?.focus({ preventScroll: true }), 320);
  }

  /**
   * Concluir com bloco vazio nem chega ao servidor: a recusa seria a
   * mesma, e resolvida aqui ela vem sem espera de rede e sabendo apontar
   * onde está o buraco.
   */
  function aoConcluir(evento: React.MouseEvent<HTMLButtonElement>) {
    if (completo) return;
    evento.preventDefault();
    setCobrando(true);

    const nomes = faltando.map((c) => c.nome).join(", ");
    toast.error(
      faltando.length === 1
        ? "Falta 1 competência"
        : `Faltam ${faltando.length} competências`,
      {
        description:
          semNota.length && semProva.length
            ? `Sem nota: ${semNota.map((c) => c.nome).join(", ")}. Sem prova escrita: ${semProva
                .map((c) => c.nome)
                .join(", ")}.`
            : semNota.length
              ? `Sem nota: ${nomes}.`
              : `Sem prova escrita: ${nomes}.`,
        action: {
          label: "Ir para a primeira",
          onClick: () => levarAte(faltando[0].chave),
        },
      }
    );

    levarAte(faltando[0].chave);
  }

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
          const prova = provas[c.chave] ?? "";
          const baixa = valor !== undefined && Number(valor) < 5;
          const provaVazia = cobrando && valor !== undefined && !prova.trim();
          const falta = cobrando && (valor === undefined || !prova.trim());

          return (
            <fieldset
              key={c.chave}
              ref={(no) => {
                blocos.current.set(c.chave, no);
              }}
              className={`flex flex-col gap-3 rounded-xl border bg-white px-4 py-4 transition-colors sm:px-5 ${
                falta
                  ? "border-alerta ring-2 ring-alerta/25"
                  : baixa
                    ? "border-alerta/40"
                    : "border-linha"
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
                <EscalaNota
                  name={`nota-${c.chave}`}
                  valor={valor}
                  aoMudar={(v) => setNotas((n) => ({ ...n, [c.chave]: v }))}
                />
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
                    className={`${caixa} resize-y ${provaVazia ? "border-alerta" : ""}`}
                    value={prova}
                    onChange={(e) =>
                      setProvas((p) => ({ ...p, [c.chave]: e.target.value }))
                    }
                    placeholder="O fato concreto que sustenta essa nota. Sem isso a nota não vale."
                  />
                  <p
                    className={`m-0 text-[0.78rem] ${
                      provaVazia || baixa ? "font-medium text-alerta" : "text-suave"
                    }`}
                  >
                    {provaVazia
                      ? "Falta a prova escrita desta nota."
                      : baixa
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

        {/* Nota e prova lado a lado: as duas são o que o servidor exige
            para fechar, então as duas precisam ser visíveis daqui, sem
            rolar o formulário inteiro de volta. */}
        <div className="rounded-xl border border-linha bg-white px-4 py-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
              Nota e prova
            </span>
            <span
              className={`text-[0.76rem] font-semibold tabular-nums ${
                completo ? "text-ok" : "text-suave"
              }`}
            >
              {COMPETENCIAS.length - faltando.length} de {COMPETENCIAS.length}
            </span>
          </div>

          <div className="mt-2 flex flex-col">
            {COMPETENCIAS.map((c) => {
              const valor = notas[c.chave];
              const temNota = valor !== undefined;
              const temProva = Boolean((provas[c.chave] ?? "").trim());
              const pronto = temNota && temProva;

              return (
                <button
                  key={c.chave}
                  type="button"
                  onClick={() => levarAte(c.chave)}
                  className={`alvo-toque -mx-1.5 flex items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left text-[0.87rem] transition-colors hover:bg-fundo ${
                    pronto ? "text-tinta" : "text-suave"
                  }`}
                >
                  <span
                    style={{ width: 16, height: 18 }}
                    className={`hex-recorte shrink-0 ${
                      pronto ? "bg-acao" : temNota ? "bg-laranja/40" : "bg-fundo-2"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="flex-1 truncate">{c.nome}</span>
                  <span
                    className={`text-[0.74rem] font-semibold ${
                      temProva
                        ? "text-ok"
                        : cobrando && temNota
                          ? "text-alerta"
                          : "text-suave"
                    }`}
                  >
                    {temProva ? "prova ok" : "sem prova"}
                  </span>
                  <span className="w-6 text-right font-semibold tabular-nums">
                    {temNota ? fmt(Number(valor)) : "·"}
                  </span>
                </button>
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
              onClick={aoConcluir}
              aria-describedby="resumo-envio"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-acao px-3.5 py-2 alvo-alto text-[0.9rem] font-semibold text-white transition-colors hover:bg-acao-forte disabled:opacity-60"
            >
              <Check size={16} strokeWidth={2.6} />
              {enviando ? "Enviando" : "Concluir"}
            </button>
          </div>
          <p
            id="resumo-envio"
            className={`m-0 text-center text-[0.79rem] ${
              cobrando && !completo ? "font-medium text-alerta" : "text-suave"
            }`}
          >
            {completo
              ? "Tudo preenchido. Concluir fecha a avaliação do ciclo."
              : cobrando
                ? `Falta${faltando.length === 1 ? "" : "m"}: ${faltando.map((c) => c.nome).join(", ")}.`
                : `Só fecha com as ${COMPETENCIAS.length} notas e as ${COMPETENCIAS.length} provas escritas.`}
          </p>
        </div>
      </aside>
    </form>
  );
}
