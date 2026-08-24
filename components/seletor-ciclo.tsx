import Link from "next/link";
import { cn } from "@/lib/utils";
import { ciclosComparaveis, type ChaveCiclo } from "@/lib/ciclos";

/**
 * Troca de ciclo sem sair da tela.
 *
 * A escolha vive na URL (`?ciclo=`) e não em estado de cliente: assim a
 * página continua sendo server component, o link de um ciclo passado
 * pode ser copiado e mandado para o sócio, e o botão voltar do navegador
 * faz o que a pessoa espera.
 *
 * `indisponiveis` existe porque nem todo mundo tem os três ciclos: quem
 * entrou depois do Raio-X não tem foto inicial. Esconder a opção faria
 * a lista mudar de tamanho de pessoa para pessoa; deixá-la visível e
 * apagada explica por que aquele ciclo não abre.
 */
export function SeletorCiclo({
  atual,
  base,
  indisponiveis = [],
  className,
}: {
  atual: ChaveCiclo;
  /** Caminho da página, sem query. */
  base: string;
  indisponiveis?: ChaveCiclo[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Ciclo exibido"
      className={cn(
        "inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-linha-forte bg-white p-1",
        className
      )}
    >
      {ciclosComparaveis().map((c) => {
        const ativo = c.chave === atual;
        const vazio = indisponiveis.includes(c.chave);

        if (vazio) {
          return (
            <span
              key={c.chave}
              title={`Sem dados em ${c.rotulo.toLowerCase()}`}
              className="cursor-not-allowed rounded-md px-3 py-1.5 text-[0.83rem] font-semibold text-suave opacity-45"
            >
              {c.rotulo}
            </span>
          );
        }

        return (
          <Link
            key={c.chave}
            href={c.chave === "atual" ? base : `${base}?ciclo=${c.chave}`}
            aria-current={ativo ? "page" : undefined}
            scroll={false}
            className={cn(
              "alvo-alto rounded-md px-3 py-1.5 text-[0.83rem] font-semibold no-underline transition-colors",
              ativo
                ? "bg-acao text-white"
                : "text-tinta-suave hover:bg-fundo hover:text-acao"
            )}
          >
            {c.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Aviso de que a tela não está mostrando o agora. Sem isso, um ciclo
 * antigo aberto em outra aba é indistinguível do atual, e o número
 * antigo vira decisão errada.
 */
export function AvisoCicloPassado({
  ciclo,
  rotulo,
  className,
}: {
  ciclo: ChaveCiclo;
  rotulo: string;
  className?: string;
}) {
  if (ciclo === "atual") return null;

  return (
    <p
      className={cn(
        "m-0 rounded-lg border border-linha-forte bg-fundo-2 px-4 py-2.5 text-[0.85rem] text-tinta-suave",
        className
      )}
    >
      Você está vendo{" "}
      <strong className="font-semibold text-tinta">
        {ciclo === "inicial" ? `o Raio-X de ${rotulo.toLowerCase()}` : rotulo.toLowerCase()}
      </strong>
      , um ciclo já fechado. Os números não mudam mais.
    </p>
  );
}
