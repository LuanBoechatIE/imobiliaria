"use client";

/**
 * Escala numérica de nota. Base: "Rating Scale Group" (ruixen.ui, 21st.dev),
 * adaptada para a paleta da casa e para escala de 0 a 10, onde nota abaixo
 * de 5 é ponto de atenção e aparece em vermelho.
 */

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as React from "react";
import { cn } from "@/lib/utils";

/*
 * No celular a escala vira uma grade de seis colunas, então as onze notas
 * caem em duas linhas com alvo grande, em vez de onze botões de 36px
 * espremidos em 358px de largura útil. A leitura continua da esquerda
 * para a direita e a legenda de faixas embaixo explica os cortes, então
 * a quebra não atrapalha.
 *
 * A partir de `sm` volta a ser uma linha só, que é como a escala deve
 * ser lida quando cabe.
 */
const RatingScaleGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn("grid w-full grid-cols-6 gap-1.5 sm:flex sm:flex-wrap", className)}
    {...props}
  />
));
RatingScaleGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RatingScaleItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    label: string;
    atencao?: boolean;
  }
>(({ className, label, atencao, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      // Na grade do celular o botão ocupa a coluna inteira; a partir de
      // `sm` volta ao quadrado fixo da escala em linha.
      "alvo-toque relative flex h-11 w-full items-center justify-center rounded-md border border-linha-forte bg-white text-[0.95rem] font-semibold text-tinta-suave transition-all sm:size-9 sm:text-[0.85rem]",
      "hover:border-laranja hover:text-acao",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-laranja",
      atencao
        ? "data-[state=checked]:border-alerta data-[state=checked]:bg-alerta data-[state=checked]:text-white"
        : "data-[state=checked]:border-acao data-[state=checked]:bg-acao data-[state=checked]:text-white",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {label}
  </RadioGroupPrimitive.Item>
));
RatingScaleItem.displayName = "RatingScaleItem";

export { RatingScaleGroup, RatingScaleItem };
