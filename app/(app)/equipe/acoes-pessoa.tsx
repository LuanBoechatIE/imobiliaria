"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MoreHorizontal } from "lucide-react";
import { alternarStatus } from "./acoes";
import { FormularioPessoa } from "./formulario-pessoa";
import type { Pessoa } from "@/lib/equipe";

export function AcoesPessoa({ pessoa }: { pessoa: Pessoa }) {
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const inativo = pessoa.status === "inativo";

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  return (
    <div ref={caixa} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label={`Ações de ${pessoa.nome}`}
        aria-expanded={aberto}
        className="grid size-8 place-items-center rounded-lg border border-transparent text-suave transition-colors hover:border-linha-forte hover:bg-fundo-2 hover:text-tinta"
      >
        <MoreHorizontal size={18} />
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-lg border border-linha bg-white py-1 shadow-lg"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
          >
            {pessoa.papel === "corretor" && !inativo && (
              <Link
                href={`/painel/corretor/${pessoa.id}`}
                className="block px-3 py-2 text-[0.88rem] text-tinta-suave no-underline transition-colors hover:bg-fundo-2"
              >
                Ver perfil
              </Link>
            )}

            <FormularioPessoa pessoa={pessoa} gatilho="item" />

            <form action={alternarStatus}>
              <input type="hidden" name="id" value={pessoa.id} />
              <button
                type="submit"
                className={`w-full px-3 py-2 text-left text-[0.88rem] transition-colors hover:bg-fundo-2 ${
                  inativo ? "text-ok" : "text-alerta"
                }`}
              >
                {inativo ? "Reativar" : "Desativar"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
