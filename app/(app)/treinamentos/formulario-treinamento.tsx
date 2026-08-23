"use client";

import { useActionState, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, GraduationCap, Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { salvarTreinamento } from "./acoes";
import { COMPETENCIAS } from "@/lib/dados";
import type { Pessoa } from "@/lib/equipe";
import type { Treinamento } from "@/lib/treinamentos";

const campo =
  "w-full rounded-md border border-linha-forte bg-white px-3 py-2 text-[0.95rem] text-tinta outline-none transition focus:border-laranja focus:ring-3 focus:ring-laranja-suave";
const rotulo = "text-[0.83rem] font-semibold text-tinta-suave";

export function FormularioTreinamento({
  pessoas,
  treinamento,
  gatilho = "botao",
}: {
  pessoas: Pessoa[];
  treinamento?: Treinamento;
  gatilho?: "botao" | "item";
}) {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState(salvarTreinamento, null);
  const editando = Boolean(treinamento);

  useEffect(() => {
    if (estado?.ok) setAberto(false);
  }, [estado]);

  return (
    <>
      {gatilho === "botao" ? (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-laranja px-3.5 py-2 text-[0.9rem] font-semibold text-white transition-colors hover:bg-laranja-escuro"
        >
          <Plus size={16} strokeWidth={2.6} />
          Novo treinamento
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-linha-forte bg-white px-3 py-1.5 text-[0.85rem] font-semibold text-tinta-suave transition-colors hover:border-laranja hover:text-laranja-escuro"
        >
          Editar informações
        </button>
      )}

      <AnimatePresence>
        {aberto && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.div
              className="absolute inset-0 bg-tinta/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAberto(false)}
            />

            <motion.div
              className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-linha bg-white shadow-xl sm:rounded-xl"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            >
              <div className="flex items-center gap-2.5 border-b border-linha px-5 py-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-laranja-suave text-laranja-escuro">
                  <GraduationCap size={16} strokeWidth={2.4} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="m-0 text-[1.05rem] font-bold tracking-tight text-tinta">
                    {editando ? "Editar treinamento" : "Novo treinamento"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  aria-label="Fechar"
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-suave transition-colors hover:bg-fundo-2"
                >
                  <X size={17} />
                </button>
              </div>

              {estado?.erro && (
                <p className="mx-5 mt-3 flex items-start gap-2 rounded-lg border border-alerta/30 bg-alerta-suave px-3.5 py-2.5 text-[0.87rem] text-alerta">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {estado.erro}
                </p>
              )}

              <form action={acao} className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-4">
                {treinamento && <input type="hidden" name="id" value={treinamento.id} />}

                <div className="flex flex-col gap-1">
                  <label className={rotulo} htmlFor="titulo">
                    Título
                  </label>
                  <input
                    id="titulo"
                    name="titulo"
                    className={campo}
                    defaultValue={treinamento?.titulo}
                    placeholder="Ex.: Follow-up que não morre no terceiro contato"
                    required
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className={rotulo} htmlFor="competencia">
                      Competência relacionada
                    </label>
                    <select
                      id="competencia"
                      name="competencia"
                      className={campo}
                      defaultValue={treinamento?.competencia ?? "geral"}
                    >
                      <option value="geral">Geral (não é uma competência só)</option>
                      {COMPETENCIAS.map((c) => (
                        <option key={c.chave} value={c.chave}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className={rotulo} htmlFor="data">
                      Data
                    </label>
                    <input
                      id="data"
                      name="data"
                      type="date"
                      className={campo}
                      defaultValue={treinamento?.data ?? new Date().toISOString().slice(0, 10)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={rotulo} htmlFor="descricao">
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    rows={3}
                    className={`${campo} resize-y`}
                    defaultValue={treinamento?.descricao}
                    placeholder="O que foi trabalhado, e por que esse tema entrou agora."
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={rotulo} htmlFor="gravacaoUrl">
                    Link da gravação
                  </label>
                  <input
                    id="gravacaoUrl"
                    name="gravacaoUrl"
                    type="url"
                    className={campo}
                    defaultValue={treinamento?.gravacaoUrl ?? ""}
                    placeholder="Drive, YouTube não listado, Loom..."
                  />
                  <span className="text-[0.78rem] text-suave">
                    Pode deixar em branco e colar depois, na página do treinamento.
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className={rotulo}>Participantes</span>
                  <div className="flex flex-col gap-1 rounded-md border border-linha-forte bg-fundo-2 p-2.5 max-h-48 overflow-y-auto">
                    {pessoas.length === 0 && (
                      <span className="px-1.5 py-1 text-[0.85rem] text-suave">
                        Nenhuma pessoa ativa na equipe ainda.
                      </span>
                    )}
                    {pessoas.map((p) => {
                      const marcado = treinamento?.participantesIds.includes(p.id) ?? false;
                      return (
                        <label
                          key={p.id}
                          className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5 text-[0.9rem] text-tinta-suave transition-colors hover:bg-white"
                        >
                          <Checkbox name="participantes" value={p.id} defaultChecked={marcado} />
                          <span className="truncate">{p.nome}</span>
                          <span className="ml-auto shrink-0 text-[0.76rem] text-suave">{p.cargo}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="sticky bottom-0 -mx-5 mt-1 flex justify-end gap-2 border-t border-linha bg-white px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => setAberto(false)}
                    className="rounded-md border border-linha-forte bg-white px-3.5 py-2 text-[0.9rem] font-semibold text-tinta-suave transition-colors hover:bg-fundo-2"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviando}
                    className="rounded-md bg-laranja px-3.5 py-2 text-[0.9rem] font-semibold text-white transition-colors hover:bg-laranja-escuro disabled:opacity-60"
                  >
                    {enviando ? "Salvando..." : editando ? "Salvar" : "Criar treinamento"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
