"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, X } from "lucide-react";
import { salvarPessoa } from "./acoes";
import type { Pessoa } from "@/lib/equipe";

const campo =
  "w-full rounded-md border border-linha-forte bg-white px-3 py-2 text-[0.95rem] text-tinta outline-none transition focus:border-laranja focus:ring-3 focus:ring-laranja-suave";
const rotulo = "text-[0.83rem] font-semibold text-tinta-suave";

export function FormularioPessoa({
  pessoa,
  gatilho,
}: {
  pessoa?: Pessoa;
  gatilho: "botao" | "item";
}) {
  const [aberto, setAberto] = useState(false);
  const editando = Boolean(pessoa);

  return (
    <>
      {gatilho === "botao" ? (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-laranja px-3.5 py-2 text-[0.9rem] font-semibold text-white transition-colors hover:bg-laranja-escuro"
        >
          <Plus size={16} strokeWidth={2.6} />
          Adicionar pessoa
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="w-full px-3 py-2 text-left text-[0.88rem] text-tinta-suave transition-colors hover:bg-fundo-2"
        >
          Editar
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
              className="relative w-full max-w-md rounded-t-2xl border border-linha bg-white p-5 shadow-xl sm:rounded-xl"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            >
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg text-suave transition-colors hover:bg-fundo-2"
              >
                <X size={17} />
              </button>

              <h2 className="mb-0.5 text-[1.15rem] font-bold tracking-tight text-tinta">
                {editando ? "Editar pessoa" : "Adicionar pessoa"}
              </h2>
              <p className="mb-4 text-[0.87rem] text-suave">
                {editando
                  ? "As avaliações já registradas continuam ligadas a esta pessoa."
                  : "Quem entra como corretor passa a ser avaliado no próximo ciclo."}
              </p>

              <form
                action={async (formData) => {
                  await salvarPessoa(formData);
                  setAberto(false);
                }}
                className="flex flex-col gap-3"
              >
                {pessoa && <input type="hidden" name="id" value={pessoa.id} />}

                <div className="flex flex-col gap-1">
                  <label className={rotulo} htmlFor="nome">
                    Nome
                  </label>
                  <input
                    id="nome"
                    name="nome"
                    className={campo}
                    defaultValue={pessoa?.nome}
                    placeholder="Nome completo"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={rotulo} htmlFor="email">
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={campo}
                    defaultValue={pessoa?.email}
                    placeholder="pessoa@imobiliaria.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className={rotulo} htmlFor="cargo">
                      Cargo
                    </label>
                    <input
                      id="cargo"
                      name="cargo"
                      className={campo}
                      defaultValue={pessoa?.cargo}
                      placeholder="Corretor"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className={rotulo} htmlFor="papel">
                      Papel no sistema
                    </label>
                    <select
                      id="papel"
                      name="papel"
                      className={campo}
                      defaultValue={pessoa?.papel ?? "corretor"}
                    >
                      <option value="corretor">Corretor</option>
                      <option value="gestor">Gestor</option>
                      <option value="dono">Dono</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={rotulo} htmlFor="entrada">
                    Entrada na equipe
                  </label>
                  <input
                    id="entrada"
                    name="entrada"
                    type="date"
                    className={campo}
                    defaultValue={pessoa?.entrada ?? new Date().toISOString().slice(0, 10)}
                    required
                  />
                </div>

                <div className="mt-1 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAberto(false)}
                    className="rounded-md border border-linha-forte bg-white px-3.5 py-2 text-[0.9rem] font-semibold text-tinta-suave transition-colors hover:bg-fundo-2"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-laranja px-3.5 py-2 text-[0.9rem] font-semibold text-white transition-colors hover:bg-laranja-escuro"
                  >
                    {editando ? "Salvar" : "Adicionar"}
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
