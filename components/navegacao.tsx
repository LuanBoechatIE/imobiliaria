"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { HexAvatar } from "@/components/hex-avatar";
import { NOME_PAPEL } from "@/lib/equipe";
import type { Papel } from "@/lib/sessao";
import { cn } from "@/lib/utils";

/**
 * Navegação no topo, não na lateral. A escolha é de espaço: as telas de
 * corretor, de avaliação e de treinamento têm uma coluna de apoio fixa
 * ao lado do conteúdo, e uma barra lateral roubaria justamente a largura
 * que essas colunas precisam.
 */

type Item = { href: string; rotulo: string; emBreve?: boolean };

const ITENS: Item[] = [
  { href: "/painel", rotulo: "Painel" },
  { href: "/avaliacoes", rotulo: "Avaliações" },
  { href: "/equipe", rotulo: "Equipe" },
  { href: "/treinamentos", rotulo: "Treinamentos" },
  { href: "/evolucao", rotulo: "Antes e depois" },
  { href: "/numeros", rotulo: "Números", emBreve: true },
];

function MarcaHex({ tamanho = 22 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" aria-hidden="true">
      <polygon
        points="50,4 90,27 90,73 50,96 10,73 10,27"
        fill="none"
        stroke="var(--laranja)"
        strokeWidth="8"
      />
    </svg>
  );
}

export function Navegacao({
  nome,
  papel,
  foto,
  ciclo,
  sair,
}: {
  nome: string;
  papel: Papel;
  foto: string | null;
  ciclo: string;
  sair: () => Promise<void>;
}) {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);

  const ativo = (href: string) => caminho === href || caminho.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-linha bg-white/92 backdrop-blur">
      <div className="mx-auto flex h-[3.9rem] max-w-[74rem] items-center gap-6 px-4 lg:px-7">
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-linha-forte text-tinta-suave lg:hidden"
        >
          <Menu size={18} />
        </button>

        <Link
          href="/painel"
          className="flex shrink-0 items-center gap-2.5 text-[0.95rem] font-semibold tracking-[-0.01em] text-tinta no-underline"
        >
          <MarcaHex />
          Boechat <span className="font-medium text-suave">Imobiliárias</span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {ITENS.map((item) =>
            item.emBreve ? (
              <span
                key={item.href}
                className="cursor-default rounded-lg px-3 py-1.5 text-[0.9rem] text-suave/70"
              >
                {item.rotulo}
                <span className="ml-1.5 text-[0.62rem] font-semibold uppercase tracking-wide">
                  em breve
                </span>
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-3 py-1.5 text-[0.9rem] no-underline transition-colors",
                  ativo(item.href)
                    ? "bg-laranja-suave font-semibold text-laranja-escuro"
                    : "text-tinta-suave hover:bg-fundo-2 hover:text-tinta"
                )}
              >
                {item.rotulo}
              </Link>
            )
          )}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <span className="hidden text-[0.82rem] tabular-nums text-suave md:inline">
            Ciclo de {ciclo}
          </span>

          <Link
            href="/perfil"
            title={`${nome} · ${NOME_PAPEL[papel]}`}
            className="no-underline"
          >
            <HexAvatar nome={nome} foto={foto} tamanho={30} />
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
            <motion.nav
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 38 }}
            >
              <div className="flex items-center gap-2.5 border-b border-linha px-5 py-4 text-[0.95rem] font-semibold text-tinta">
                <MarcaHex />
                Boechat
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  aria-label="Fechar menu"
                  className="ml-auto grid size-8 place-items-center rounded-lg text-suave hover:bg-fundo-2"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-0.5 p-3">
                {ITENS.map((item) =>
                  item.emBreve ? (
                    <span
                      key={item.href}
                      className="rounded-lg px-3 py-2.5 text-[0.95rem] text-suave/70"
                    >
                      {item.rotulo}
                      <span className="ml-1.5 text-[0.62rem] font-semibold uppercase">
                        em breve
                      </span>
                    </span>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setAberto(false)}
                      className={cn(
                        "rounded-lg px-3 py-2.5 text-[0.95rem] no-underline transition-colors",
                        ativo(item.href)
                          ? "bg-laranja-suave font-semibold text-laranja-escuro"
                          : "text-tinta-suave hover:bg-fundo-2"
                      )}
                    >
                      {item.rotulo}
                    </Link>
                  )
                )}
              </div>

              <Link
                href="/perfil"
                onClick={() => setAberto(false)}
                className="flex items-center gap-3 border-t border-linha px-5 py-4 no-underline"
              >
                <HexAvatar nome={nome} foto={foto} tamanho={32} />
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate text-[0.9rem] font-semibold text-tinta">{nome}</span>
                  <span className="text-[0.78rem] text-suave">{NOME_PAPEL[papel]}</span>
                </span>
              </Link>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
