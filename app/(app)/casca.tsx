"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { MenuLateral } from "@/components/menu-lateral";
import { NOME_PAPEL } from "@/lib/equipe";
import type { Papel } from "@/lib/sessao";

export function Casca({
  nome,
  papel,
  foto,
  sair,
  children,
}: {
  nome: string;
  papel: Papel;
  foto: string | null;
  sair: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="flex min-h-screen bg-fundo">
      {/* menu fixo no desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-linha lg:block">
        <MenuLateral />
      </aside>

      {/* gaveta no celular */}
      <AnimatePresence>
        {aberto && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-tinta/35 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAberto(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-linha bg-white lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 38 }}
            >
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar menu"
                className="absolute right-3 top-4 grid size-8 place-items-center rounded-lg text-suave hover:bg-fundo-2"
              >
                <X size={18} />
              </button>
              <MenuLateral aoNavegar={() => setAberto(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-linha bg-white/85 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 lg:px-8">
            <button
              type="button"
              onClick={() => setAberto(true)}
              aria-label="Abrir menu"
              className="grid size-9 place-items-center rounded-lg border border-linha-forte text-tinta-suave lg:hidden"
            >
              <Menu size={18} />
            </button>

            <div className="ml-auto flex items-center gap-3">
              <Link href="/perfil" className="flex items-center gap-2.5 no-underline">
                <div className="hidden flex-col items-end leading-tight sm:flex">
                  <span className="text-[0.87rem] font-semibold text-tinta">{nome}</span>
                  <span className="text-[0.74rem] text-suave">{NOME_PAPEL[papel]}</span>
                </div>
                <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-laranja-suave text-[0.9rem] font-bold text-laranja-escuro ring-2 ring-white">
                  {foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={foto} alt="" className="size-full object-cover" />
                  ) : (
                    nome.charAt(0)
                  )}
                </span>
              </Link>
              <form action={sair}>
                <button
                  type="submit"
                  className="rounded-md border border-linha-forte bg-white px-3 py-1.5 text-[0.85rem] font-semibold text-tinta-suave transition-colors hover:border-laranja hover:text-laranja-escuro"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
