"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { GraduationCap, LayoutDashboard, ListChecks, LogOut, Target } from "lucide-react";
import { HexAvatar } from "@/components/hex-avatar";
import { IMOBILIARIA } from "@/lib/dados";
import { cn } from "@/lib/utils";

/**
 * O menu de quem é avaliado, não de quem avalia.
 *
 * Quatro destinos e nada mais. A área do corretor responde uma pergunta
 * só — "o que eu faço agora para melhorar" — e cada item a mais aqui
 * seria um convite a sair dela. Nada de painel da casa, ranking, equipe
 * ou biblioteca de treinamento: isso não é escondido por gentileza, é
 * barrado no middleware e conferido de novo em cada página.
 */

const ITENS = [
  { href: "/meu-painel", rotulo: "Meu painel", Icone: LayoutDashboard },
  { href: "/meu-desempenho", rotulo: "Meu desempenho", Icone: Target },
  { href: "/meus-treinamentos", rotulo: "Meus treinamentos", Icone: GraduationCap },
  { href: "/minhas-atividades", rotulo: "Minhas atividades", Icone: ListChecks },
];

export function MenuCorretor({
  nome,
  foto,
  sair,
  aoNavegar,
}: {
  nome: string;
  foto: string | null;
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
        <span className="truncate pl-[1.9rem] text-[0.78rem] text-suave">
          {IMOBILIARIA.nome}
        </span>
      </div>

      <div className="mx-5 mb-3 rounded-lg bg-fundo-2 px-3 py-2">
        <span className="block text-[0.66rem] font-bold uppercase tracking-[0.1em] text-suave">
          Corretor
        </span>
        <span className="block truncate text-[0.87rem] font-semibold text-tinta">{nome}</span>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 px-3">
        {ITENS.map(({ href, rotulo, Icone }) => {
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
          href="/meu-perfil"
          onClick={aoNavegar}
          className={cn(
            "alvo-alto flex items-center gap-2.5 rounded-lg px-2 py-2 no-underline transition-colors",
            ativo("/meu-perfil") ? "bg-laranja-suave" : "hover:bg-fundo-2"
          )}
        >
          <HexAvatar nome={nome} foto={foto} tamanho={30} />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[0.87rem] font-semibold text-tinta">Meu perfil</span>
            <span
              className={cn(
                "text-[0.75rem]",
                ativo("/meu-perfil") ? "text-suave-marca" : "text-suave"
              )}
            >
              Dados da conta
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
