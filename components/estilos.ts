/**
 * Receitas de controle, num lugar só.
 *
 * Existem porque as mesmas classes vinham sendo reescritas em cada tela
 * e foram divergindo sozinhas: quatro tamanhos diferentes de botão
 * sólido, oito de botão de contorno e duas alturas de campo, todos
 * querendo ser a mesma coisa. Aqui a diferença entre um botão e outro
 * passa a ser uma escolha declarada, não um acidente de digitação.
 *
 * São strings e não componentes de propósito: cada tela continua dona
 * da sua estrutura (largura, ícone, posição) e só herda a aparência.
 */

/** Altura confortável de leitura, usada na maioria das ações. */
const BASE =
  "alvo-alto inline-flex items-center justify-center gap-1.5 rounded-md font-semibold transition-colors disabled:opacity-60";

/** Ação dentro de uma linha de lista ou de um cabeçalho apertado. */
const MIUDO = "px-3 py-1.5 text-[0.85rem]";
const NORMAL = "px-3.5 py-2 text-[0.9rem]";

export const BOTAO = {
  /** A ação principal da tela. Uma por tela, no máximo. */
  solido: `${BASE} ${NORMAL} bg-acao text-white no-underline hover:bg-acao-forte`,
  solidoMiudo: `${BASE} ${MIUDO} bg-acao text-white no-underline hover:bg-acao-forte`,

  /** Ação de apoio: existe, mas não disputa atenção com a principal. */
  contorno: `${BASE} ${NORMAL} border border-linha-forte bg-white text-tinta-suave no-underline hover:border-laranja hover:text-acao`,
  contornoMiudo: `${BASE} ${MIUDO} border border-linha-forte bg-white text-tinta-suave no-underline hover:border-laranja hover:text-acao`,

  /** Desativar, remover, encerrar. Contorno neutro, texto de alerta. */
  risco: `${BASE} ${MIUDO} border border-linha-forte bg-white text-alerta hover:border-alerta hover:bg-alerta-suave`,
} as const;

/**
 * Campo de entrada. A borda aqui é `--borda-campo`, mais escura que a
 * de um cartão, porque num campo vazio ela é o único sinal de que
 * existe algo para preencher.
 */
export const CAMPO =
  "alvo-alto w-full rounded-md border border-borda-campo bg-white px-3 py-2 text-[0.95rem] text-tinta transition focus:border-acao";
