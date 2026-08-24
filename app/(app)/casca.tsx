"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { MenuLateral } from "@/components/menu-lateral";
import type { Papel } from "@/lib/sessao";

export function Casca({
  nome,
  papel,
  foto,
  ciclo,
  sair,
  children,
}: {
  nome: string;
  papel: Papel;
  foto: string | null;
  ciclo: string;
  sair: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="flex min-h-screen bg-fundo">
      {/* menu fixo no desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-linha lg:block">
        <MenuLateral
          nome={nome}
          papel={papel}
          foto={foto}
          ciclo={ciclo}
          sair={sair}
        />
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
              // A gaveta encosta nas quatro bordas do aparelho, então o
              // conteúdo dela recua do notch, do canto arredondado e do
              // indicador de home em vez de passar por baixo deles.
              style={{
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
                paddingLeft: "env(safe-area-inset-left)",
              }}
              className="fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto border-r border-linha bg-white lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 38 }}
            >
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar menu"
                className="alvo-toque absolute right-3 top-4 grid size-8 place-items-center rounded-lg text-suave hover:bg-fundo-2"
              >
                <X size={18} />
              </button>
              <MenuLateral
                nome={nome}
                papel={papel}
                foto={foto}
                ciclo={ciclo}
                sair={sair}
                aoNavegar={() => setAberto(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* barra só no celular: no desktop a navegação inteira mora na lateral */}
        <header
          // Fica presa no topo, então o conteúdo dela desce abaixo do notch
          // quando o aparelho tem um, e nada muda quando não tem.
          style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}
          className="sticky top-0 z-30 flex items-center gap-3 border-b border-linha bg-white/90 px-4 pb-2.5 backdrop-blur lg:hidden"
        >
          <button
            type="button"
            onClick={() => setAberto(true)}
            aria-label="Abrir menu"
            className="alvo-toque grid size-9 place-items-center rounded-lg border border-linha-forte text-tinta-suave"
          >
            <Menu size={18} />
          </button>
          <span className="flex items-center gap-2 text-[0.93rem] font-semibold tracking-[-0.01em] text-tinta">
            <svg width="18" height="18" viewBox="0 0 100 100" aria-hidden="true">
              <polygon
                points="50,4 90,27 90,73 50,96 10,73 10,27"
                fill="none"
                stroke="var(--laranja)"
                strokeWidth="8"
              />
            </svg>
            Boechat
          </span>
          <span className="ml-auto text-[0.8rem] text-suave">{ciclo}</span>
        </header>

        {children}
      </div>
    </div>
  );
}
