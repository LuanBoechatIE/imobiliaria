"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  LogOut,
  TrendingUp,
  Users,
} from "lucide-react";
import { HexAvatar } from "@/components/hex-avatar";
import { NOME_PAPEL } from "@/lib/equipe";
import type { Papel } from "@/lib/sessao";
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
  { href: "/treinamentos", rotulo: "Treinamentos", Icone: GraduationCap },
  { href: "/evolucao", rotulo: "Antes e depois", Icone: TrendingUp },
  { href: "/numeros", rotulo: "Números", Icone: LineChart, emBreve: true },
];

export function MenuLateral({
  nome,
  papel,
  foto,
  ciclo,
  sair,
  aoNavegar,
}: {
  nome: string;
  papel: Papel;
  foto: string | null;
  ciclo: string;
  sair: () => Promise<void>;
  aoNavegar?: () => void;
}) {
  const caminho = usePathname();
  const ativo = (href: string) => caminho === href || caminho.startsWith(`${href}/`);

  return (
    <nav className="flex h-full w-full flex-col bg-white">
      <div className="flex flex-col gap-0.5 px-5 pb-3 pt-4">
        <span className="flex items-center gap-2.5 text-[0.97rem] font-semibold tracking-[-0.01em] text-tinta">
          <svg width="20" height="20" viewBox="0 0 100 100" aria-hidden="true">
            <polygon
              points="50,4 90,27 90,73 50,96 10,73 10,27"
              fill="none"
              stroke="var(--laranja)"
              strokeWidth="8"
            />
          </svg>
          Boechat
        </span>
        <span className="pl-[1.9rem] text-[0.78rem] text-suave">Imobiliárias</span>
      </div>

      <div className="mx-5 mb-3 rounded-lg bg-fundo-2 px-3 py-2">
        <span className="block text-[0.66rem] font-bold uppercase tracking-[0.1em] text-suave">
          Ciclo atual
        </span>
        <span className="block text-[0.87rem] font-semibold text-tinta">{ciclo}</span>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 px-3">
        {ITENS.map(({ href, rotulo, Icone, emBreve }) => {
          if (emBreve) {
            return (
              <span
                key={href}
                className="flex cursor-default items-center gap-2.5 rounded-lg px-3 py-2 text-[0.9rem] text-suave"
              >
                <Icone size={17} strokeWidth={2} className="shrink-0 opacity-60" />
                <span className="flex-1">{rotulo}</span>
                <span className="rounded-full bg-fundo-2 px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-suave">
                  em breve
                </span>
              </span>
            );
          }

          const estaAtivo = ativo(href);

          return (
            <Link
              key={href}
              href={href}
              onClick={aoNavegar}
              className={cn(
                "alvo-alto relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.9rem] no-underline transition-colors",
                estaAtivo
                  ? "bg-laranja-suave font-semibold text-acao"
                  : "text-tinta-suave hover:bg-fundo-2 hover:text-tinta"
              )}
            >
              {estaAtivo && (
                <motion.span
                  layoutId="menu-ativo"
                  className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-acao"
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

      <div className="border-t border-linha p-3">
        <Link
          href="/perfil"
          onClick={aoNavegar}
          className={cn(
            "alvo-alto flex items-center gap-2.5 rounded-lg px-2 py-2 no-underline transition-colors",
            ativo("/perfil") ? "bg-laranja-suave" : "hover:bg-fundo-2"
          )}
        >
          <HexAvatar nome={nome} foto={foto} tamanho={30} />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[0.87rem] font-semibold text-tinta">{nome}</span>
            {/* Sobre a superfície de marca o secundário sai do matiz laranja,
                não de um cinza neutro que brigaria com o fundo. */}
            <span
              className={cn(
                "text-[0.75rem]",
                ativo("/perfil") ? "text-suave-marca" : "text-suave"
              )}
            >
              {NOME_PAPEL[papel]}
            </span>
          </span>
        </Link>

        <form action={sair}>
          <button
            type="submit"
            className="alvo-alto mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[0.87rem] font-medium text-suave transition-colors hover:bg-fundo-2 hover:text-alerta"
          >
            <LogOut size={16} strokeWidth={2} className="shrink-0" />
            Sair
          </button>
        </form>
      </div>

      <p className="px-5 pb-4 text-[0.72rem] leading-relaxed text-suave">
        Ambiente de demonstração.
        <br />
        Dados fictícios.
      </p>
    </nav>
  );
}
