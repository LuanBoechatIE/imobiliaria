
import { cn } from "@/lib/utils";
/**
 * Foto em recorte hexagonal. É o hexágono na sua menor escala: aparece
 * ao lado de todo nome do sistema, então mesmo uma tela sem nenhuma nota
 * na frente continua sendo obviamente a mesma família visual.
 */

/**
 * Iniciais do nome. Percorre por ponto de código, não por índice: nome
 * que começa com emoji ou letra fora do plano básico quebra ao meio em
 * `parte[0]` e sai como losango de caractere inválido.
 */
export function iniciais(nome: string): string {
  const letras = nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((parte) => Array.from(parte)[0] ?? "")
    .slice(0, 2)
    .join("");

  return letras ? letras.toLocaleUpperCase("pt-BR") : "?";
}

export function HexAvatar({
  nome,
  foto,
  tamanho = 34,
  tom = "laranja",
  className,
}: {
  nome: string;
  foto?: string | null;
  /** Largura em pixels. A altura acompanha a proporção do hexágono. */
  tamanho?: number;
  /** Neutro para quem está desativado ou não tem nota no ciclo. */
  tom?: "laranja" | "neutro";
  className?: string;
}) {
  return (
    <span
      title={nome}
      style={{
        width: tamanho,
        height: Math.round(tamanho * 1.11),
        fontSize: Math.max(9, Math.round(tamanho * 0.36)),
      }}
      className={cn(
        "hex-recorte grid shrink-0 place-items-center overflow-hidden font-bold leading-none",
        tom === "laranja" ? "bg-laranja-suave text-acao" : "bg-fundo-2 text-suave",
        className
      )}
    >
      {foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={foto} alt="" className="size-full object-cover" />
      ) : (
        iniciais(nome)
      )}
    </span>
  );
}

/**
 * Pilha de avatares para listas de participantes. Mostra os primeiros e
 * conta o resto, porque o número importa mais que o rosto de cada um.
 */
export function PilhaHex({
  nomes,
  mostrar = 4,
  tamanho = 27,
}: {
  nomes: string[];
  mostrar?: number;
  tamanho?: number;
}) {
  const visiveis = nomes.slice(0, mostrar);
  const resto = nomes.length - visiveis.length;

  return (
    <span className="flex items-center">
      {visiveis.map((nome, i) => (
        // O recorte hexagonal corta borda e sombra, então a separação
        // entre um avatar e o próximo vem de um hexágono branco por trás.
        <span
          key={`${nome}-${i}`}
          style={{ width: tamanho + 4, height: Math.round(tamanho * 1.11) + 4 }}
          className="hex-recorte -mr-2 grid shrink-0 place-items-center bg-white"
        >
          <HexAvatar nome={nome} tamanho={tamanho} />
        </span>
      ))}
      {resto > 0 && (
        <span className="ml-3.5 text-[0.78rem] font-medium text-suave">+{resto}</span>
      )}
    </span>
  );
}
