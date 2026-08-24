/**
 * O calendário do sistema.
 *
 * Ciclo é sempre um mês fechado, e o ciclo atual é sempre o mês de hoje.
 * Antes os rótulos eram strings fixas ("Março 2026") espalhadas por
 * `lib/dados.ts` e `lib/avaliacoes.ts`, o que travava o produto inteiro
 * no mês em que os dados foram escritos. Aqui eles passam a ser
 * derivados da data corrente, e o resto do sistema só pede o
 * deslocamento que quer: 0 é agora, -1 é o mês passado.
 *
 * Nada neste arquivo guarda estado. Cada leitura recalcula, de propósito:
 * o servidor pode ficar meses no ar e a virada de mês precisa aparecer
 * sozinha, sem deploy.
 */

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

/**
 * Quantos meses separam o Raio-X do ciclo atual. É a janela que os dados
 * de demonstração contam: começo do trabalho, um meio, e o agora.
 */
export const MESES_DESDE_O_RAIO_X = 3;

/** O mês de referência, deslocado em `meses` a partir de hoje. */
function mesDeslocado(meses: number): Date {
  const hoje = new Date();
  // Dia 1 evita o problema clássico de virar mês em data 29/30/31:
  // `setMonth` em 31 de março menos um mês cairia em 3 de março.
  return new Date(hoje.getFullYear(), hoje.getMonth() + meses, 1);
}

/** Rótulo cheio do ciclo: "Agosto 2026". */
export function rotuloCiclo(meses = 0): string {
  const d = mesDeslocado(meses);
  return `${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

/** Rótulo curto, do jeito que a curva de evolução escreve no eixo: "Ago". */
export function rotuloCurto(meses = 0): string {
  return MESES[mesDeslocado(meses).getMonth()].slice(0, 3);
}

/** Só o nome do mês, minúsculo, para cair no meio de uma frase. */
export function mesPorExtenso(meses = 0): string {
  return MESES[mesDeslocado(meses).getMonth()].toLowerCase();
}

/**
 * Uma data real dentro do ciclo atual, a `diasAtras` de hoje. Serve para
 * os carimbos de "atualizada em" dos dados de demonstração, que ficariam
 * presos no passado se fossem escritos à mão.
 */
export function dataNoCicloAtual(diasAtras: number): string {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return d.toISOString().slice(0, 19);
}

/* ---------- os ciclos que dá para comparar ---------- */

/**
 * Só existem três fotos completas de cada corretor: o Raio-X, o ciclo
 * anterior e o atual. A curva de evolução tem mais pontos, mas guarda só
 * a média — não dá para abrir as seis competências nela. O seletor de
 * ciclo é montado sobre estes três porque são os que sustentam uma
 * comparação de verdade, competência a competência.
 */
export type ChaveCiclo = "atual" | "anterior" | "inicial";

export const CICLO_PADRAO: ChaveCiclo = "atual";

/** Deslocamento em meses de cada ciclo comparável, a partir de hoje. */
const DESLOCAMENTO: Record<ChaveCiclo, number> = {
  atual: 0,
  anterior: -1,
  inicial: -MESES_DESDE_O_RAIO_X,
};

export type CicloComparavel = {
  chave: ChaveCiclo;
  /** "Agosto 2026" */
  rotulo: string;
  /** Como a tela chama esse ciclo quando precisa de contexto. */
  apelido: string;
};

export function ciclosComparaveis(): CicloComparavel[] {
  return [
    { chave: "atual", rotulo: rotuloCiclo(DESLOCAMENTO.atual), apelido: "ciclo atual" },
    { chave: "anterior", rotulo: rotuloCiclo(DESLOCAMENTO.anterior), apelido: "ciclo anterior" },
    { chave: "inicial", rotulo: rotuloCiclo(DESLOCAMENTO.inicial), apelido: "Raio-X" },
  ];
}

export function acharCiclo(chave: ChaveCiclo): CicloComparavel {
  return ciclosComparaveis().find((c) => c.chave === chave)!;
}

/**
 * Lê a escolha que veio na URL. Qualquer coisa fora das três chaves cai
 * no ciclo atual, para um link torto não quebrar a página.
 */
export function lerChaveCiclo(valor: string | string[] | undefined): ChaveCiclo {
  const bruto = Array.isArray(valor) ? valor[0] : valor;
  return bruto === "anterior" || bruto === "inicial" ? bruto : CICLO_PADRAO;
}

/**
 * Contra qual ciclo um ciclo se compara. É o degrau imediatamente
 * anterior na escada, e não um "antes" fixo: olhando o ciclo anterior, a
 * variação honesta é contra o Raio-X, não contra o mês de hoje, que
 * ainda nem existia quando aquela nota foi dada. O Raio-X é o começo de
 * tudo e não se compara com nada.
 */
export function cicloDeComparacao(ciclo: ChaveCiclo): ChaveCiclo | null {
  if (ciclo === "atual") return "anterior";
  if (ciclo === "anterior") return "inicial";
  return null;
}
