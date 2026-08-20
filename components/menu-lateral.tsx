"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  rotulo: string;
  Icone: typeof Users;
  emBreve?: boolean;
};

const ITENS: Item[] = [
  { href: "/painel", rotulo: "Painel", Icone: LayoutDashboard },
  { href: "/avaliacoes", rotulo: "Avaliações", Icone: ClipboardCheck },
  { href: "/equipe", rotulo: "Equipe", Icone: Users },
  { href: "/treino", rotulo: "Treino", Icone: GraduationCap, emBreve: true },
  { href: "/numeros", rotulo: "Números", Icone: LineChart, emBreve: true },
];

const ITEM_PERFIL: Item = { href: "/perfil", rotulo: "Perfil", Icone: User };

type Realce = { top: number; height: number } | null;

export function MenuLateral({ aoNavegar }: { aoNavegar?: () => void }) {
  const caminho = usePathname();
  const lista = useRef<HTMLDivElement>(null);
  const [realce, setRealce] = useState<Realce>(null);

  const ativo = (href: string) => caminho === href || caminho.startsWith(`${href}/`);

  function entrar(evento: React.MouseEvent<HTMLElement>) {
    const alvo = evento.currentTarget;
    const caixa = lista.current;
    if (!caixa) return;
    setRealce({
      top: alvo.getBoundingClientRect().top - caixa.getBoundingClientRect().top,
      height: alvo.offsetHeight,
    });
  }

  return (
    <nav className="flex h-full w-full flex-col bg-white">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <span className="grid size-8 place-items-center rounded-lg bg-laranja text-[0.95rem] font-extrabold tracking-tight text-white">
          B
        </span>
        <span className="text-[0.97rem] font-semibold tracking-tight text-tinta">
          Boechat
        </span>
      </div>

      <div
        ref={lista}
        className="relative flex flex-1 flex-col gap-0.5 px-3"
        onMouseLeave={() => setRealce(null)}
      >
        <AnimatePresence>
          {realce && (
            <motion.span
              className="pointer-events-none absolute inset-x-0 z-0 rounded-lg bg-fundo-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, top: realce.top, height: realce.height }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
        </AnimatePresence>

        {ITENS.map(({ href, rotulo, Icone, emBreve }) => {
          const estaAtivo = ativo(href);

          if (emBreve) {
            return (
              <span
                key={href}
                onMouseEnter={entrar}
                className="relative z-10 flex cursor-default items-center gap-2.5 rounded-lg px-3 py-2 text-[0.9rem] text-suave/70"
              >
                <Icone size={17} strokeWidth={2} className="shrink-0 opacity-60" />
                <span className="flex-1">{rotulo}</span>
                <span className="rounded-full bg-fundo-2 px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-suave">
                  em breve
                </span>
              </span>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              onMouseEnter={entrar}
              onClick={aoNavegar}
              className={cn(
                "relative z-10 flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.9rem] no-underline transition-colors",
                estaAtivo ? "font-semibold text-laranja-escuro" : "text-tinta-suave"
              )}
            >
              {estaAtivo && (
                <motion.span
                  layoutId="menu-ativo"
                  className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-laranja"
                  transition={{ type: "spring", stiffness: 600, damping: 38 }}
                />
              )}
              <Icone
                size={17}
                strokeWidth={estaAtivo ? 2.4 : 2}
                className={cn("shrink-0", estaAtivo ? "text-laranja" : "text-suave")}
              />
              <span>{rotulo}</span>
            </Link>
          );
        })}
      </div>

      <div className="border-t border-linha px-3 pt-2">
        {(() => {
          const estaAtivo = ativo(ITEM_PERFIL.href);
          return (
            <Link
              href={ITEM_PERFIL.href}
              onClick={aoNavegar}
              className={cn(
                "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.9rem] no-underline transition-colors hover:bg-fundo-2",
                estaAtivo ? "font-semibold text-laranja-escuro" : "text-tinta-suave"
              )}
            >
              {estaAtivo && (
                <motion.span
                  layoutId="menu-ativo"
                  className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-laranja"
                  transition={{ type: "spring", stiffness: 600, damping: 38 }}
                />
              )}
              <User
                size={17}
                strokeWidth={estaAtivo ? 2.4 : 2}
                className={cn("shrink-0", estaAtivo ? "text-laranja" : "text-suave")}
              />
              <span>Perfil</span>
            </Link>
          );
        })()}
      </div>

      <p className="px-5 pb-4 pt-2 text-[0.72rem] leading-relaxed text-suave">
        Ambiente de demonstração.
        <br />
        Dados fictícios.
      </p>
    </nav>
  );
}
