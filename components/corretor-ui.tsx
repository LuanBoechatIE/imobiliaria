import Link from "next/link";
import { fmt } from "@/lib/dados";
import {
  ROTULO_ATIVIDADE,
  TOM_ATIVIDADE,
  type StatusAtividade,
} from "@/lib/atividades-corretor";
import { ROTULO_COMPETENCIA, type StatusCompetencia } from "@/lib/corretor";
import { cn } from "@/lib/utils";

/**
 * As peças que se repetem na área do corretor. Moram juntas porque a
 * mesma etiqueta de status aparece no painel, na lista de treinamentos e
 * na de atividades: três cópias divergiriam na primeira mudança.
 */

export function SeloAtividade({
  status,
  className,
}: {
  status: StatusAtividade;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[0.75rem] font-semibold",
        TOM_ATIVIDADE[status],
        className
      )}
    >
      {ROTULO_ATIVIDADE[status]}
    </span>
  );
}

const TOM_COMPETENCIA: Record<StatusCompetencia, string> = {
  atencao: "border-alerta/30 bg-alerta-suave text-alerta",
  desenvolvendo: "border-laranja/35 bg-laranja-suave text-acao",
  consistente: "border-ok/30 bg-ok-suave text-ok",
};

export function SeloCompetencia({ status }: { status: StatusCompetencia }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[0.75rem] font-semibold",
        TOM_COMPETENCIA[status]
      )}
    >
      {ROTULO_COMPETENCIA[status]}
    </span>
  );
}

/** Barra de preenchimento. Mesma altura e curva usadas no painel da casa. */
export function Barra({
  porcentagem,
  alerta = false,
}: {
  porcentagem: number;
  alerta?: boolean;
}) {
  return (
    <span className="block h-[7px] overflow-hidden rounded-full bg-fundo-2">
      <span
        className={cn(
          "barra-enche block h-full rounded-full",
          alerta ? "bg-alerta" : "bg-acao"
        )}
        style={{ width: `${Math.min(Math.max(porcentagem, 0), 100)}%` }}
      />
    </span>
  );
}

/**
 * Filtro por estado, feito com link e não com estado de cliente: a lista
 * já é renderizada no servidor, e assim o filtro escolhido sobrevive ao
 * recarregar e pode ser mandado por mensagem.
 */
export function Filtros({
  base,
  atual,
  opcoes,
}: {
  base: string;
  atual: string;
  opcoes: { valor: string; rotulo: string; quantos: number }[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {opcoes.map((o) => {
        const selecionado = o.valor === atual;
        return (
          <Link
            key={o.valor}
            href={o.valor === "todos" ? base : `${base}?estado=${o.valor}`}
            aria-current={selecionado ? "page" : undefined}
            className={cn(
              "alvo-alto inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.85rem] font-semibold no-underline transition-colors",
              selecionado
                ? "border-acao bg-acao text-white"
                : "border-linha-forte bg-white text-tinta-suave hover:border-laranja hover:text-acao"
            )}
          >
            {o.rotulo}
            <span
              className={cn(
                "tabular-nums",
                selecionado ? "text-white/70" : "text-suave"
              )}
            >
              {o.quantos}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Variação entre dois ciclos. Sem base de comparação a tela diz isso, em
 * vez de mostrar um zero que se leria como "não mudou nada".
 */
export function Variacao({
  valor,
  sufixo = "no ciclo",
  className,
}: {
  valor: number | null;
  sufixo?: string;
  className?: string;
}) {
  if (valor === null) {
    return (
      <span className={cn("text-[0.85rem] font-medium text-suave", className)}>
        primeiro ciclo
      </span>
    );
  }

  if (Math.abs(valor) < 0.05) {
    return (
      <span className={cn("text-[0.85rem] font-medium text-suave", className)}>
        estável {sufixo}
      </span>
    );
  }

  const sobe = valor > 0;
  return (
    <span
      className={cn(
        "text-[0.85rem] font-semibold tabular-nums",
        sobe ? "text-ok" : "text-alerta",
        className
      )}
    >
      {sobe ? "▲" : "▼"} {fmt(Math.abs(valor))} {sufixo}
    </span>
  );
}
