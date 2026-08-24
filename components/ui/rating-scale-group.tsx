"use client";

import { cn } from "@/lib/utils";
/**
 * Escala de nota de 0 a 10.
 *
 * Construída sobre `<input type="radio">` nativo, não sobre uma
 * biblioteca de componente. O grupo de rádio do navegador já entrega
 * navegação por setas, seleção por teclado, papel de radiogroup e
 * leitura correta em leitor de tela — tudo que uma implementação em
 * JavaScript teria que refazer, e que ela refaz pesando cerca de 20 kB
 * na tela que o gestor mais usa. O visual sai de `appearance: none`
 * mais o estado `:checked`, então nada se perde na troca.
 *
 * No celular a escala vira grade de seis colunas, então as onze notas
 * caem em duas linhas com alvo grande em vez de onze botões espremidos
 * em 358px. De `sm` para cima volta a ser uma linha só.
 */


const NOTAS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function EscalaNota({
  name,
  valor,
  aoMudar,
  className,
}: {
  name: string;
  /** Nota escolhida, ou undefined enquanto ninguém pontuou. */
  valor?: string;
  aoMudar: (valor: string) => void;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Nota de 0 a 10"
      className={cn("grid w-full grid-cols-6 gap-1.5 sm:flex sm:flex-wrap", className)}
    >
      {NOTAS.map((n) => {
        const marcado = valor === String(n);
        const atencao = n < 5;

        return (
          <label
            key={n}
            className={cn(
              // `escala-item` desenha o anel de foco no rótulo quando o
              // rádio escondido recebe foco de teclado (ver globals.css).
              "escala-item alvo-toque relative flex h-11 w-full cursor-pointer items-center justify-center rounded-md border text-[0.95rem] font-semibold transition-colors sm:size-9 sm:text-[0.85rem]",
              marcado
                ? atencao
                  ? "border-alerta bg-alerta text-white"
                  : "border-acao bg-acao text-white"
                : "border-linha-forte bg-white text-tinta-suave hover:border-laranja hover:text-acao"
            )}
          >
            <input
              type="radio"
              name={name}
              value={n}
              checked={marcado}
              onChange={() => aoMudar(String(n))}
              className="absolute size-0 appearance-none opacity-0"
            />
            {n}
          </label>
        );
      })}
    </div>
  );
}
