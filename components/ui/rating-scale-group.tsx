"use client";

/**
 * Escala numérica de nota. Base: "Rating Scale Group" (ruixen.ui, 21st.dev),
 * adaptada para a paleta da casa e para escala de 0 a 10, onde nota abaixo
 * de 5 é ponto de atenção e aparece em vermelho.
 */

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as React from "react";
import { cn } from "@/lib/utils";

const RatingScaleGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn("flex w-full flex-wrap gap-1.5", className)}
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
      "relative flex size-9 items-center justify-center rounded-md border border-linha-forte bg-white text-[0.85rem] font-semibold text-tinta-suave transition-all",
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
