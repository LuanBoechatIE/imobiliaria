import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESSAO, lerSessao, type Sessao } from "./sessao";
import { acharPorId } from "./usuarios";
import { acharPessoa, type Pessoa } from "./equipe";
import {
  COMPETENCIAS,
  acharCorretor,
  critica,
  evidenciaPadrao,
  historicoDe,
  media,
  notasDoCiclo,
  type ChaveCompetencia,
  type Corretor,
  type Evidencia,
} from "./dados";
import { cicloDeComparacao, type ChaveCiclo } from "./ciclos";

/**
 * Identidade do corretor logado, resolvida sempre a partir da sessão.
 *
 * Regra que atravessa a área do corretor: nenhuma tela recebe o id de
 * quem ver por parâmetro, nem por URL, nem por formulário. Quem pergunta
 * é sempre quem está logado, e é este arquivo que responde. Sem isso,
 * trocar um id na barra de endereço abriria a avaliação do colega.
 */

export type ContextoCorretor = {
  sessao: Sessao;
  pessoa: Pessoa;
  /** Só existe depois da primeira avaliação fechada. Antes disso é null. */
  corretor: Corretor | null;
};

/**
 * Porta de entrada de toda página da área do corretor.
 *
 * Quem não está logado vai para a entrada; quem está logado com outro
 * papel volta para a área dele. Devolve a pessoa já resolvida, para a
 * página não precisar repetir a corrente sessão → usuário → pessoa.
 */
export async function exigirCorretor(): Promise<ContextoCorretor> {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao) redirect("/entrar");
  if (sessao.papel !== "corretor") redirect("/painel");

  const usuario = acharPorId(sessao.id);
  const pessoa = usuario?.pessoaId ? acharPessoa(usuario.pessoaId) : undefined;

  // Conta de corretor sem pessoa ligada não tem o que mostrar: a área
  // inteira é construída em cima do registro em lib/equipe.ts.
  if (!pessoa || pessoa.papel !== "corretor") redirect("/entrar");

  return { sessao, pessoa, corretor: acharCorretor(pessoa.id) ?? null };
}

/**
 * Mesma resolução, sem redirecionar. Para Server Action, onde a resposta
 * certa é uma recusa em texto e não uma navegação.
 */
export async function corretorDaSessao(): Promise<Pessoa | null> {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao || sessao.papel !== "corretor") return null;

  const usuario = acharPorId(sessao.id);
  const pessoa = usuario?.pessoaId ? acharPessoa(usuario.pessoaId) : undefined;
  return pessoa && pessoa.papel === "corretor" ? pessoa : null;
}

/* ---------- leitura das notas ---------- */

export type Competencia = (typeof COMPETENCIAS)[number];

export type LeituraCompetencia = {
  chave: ChaveCompetencia;
  nome: string;
  mede: string;
  nota: number;
  /** Nota do ciclo anterior, quando existe segundo ciclo. */
  anterior: number | null;
  /** Positivo subiu, negativo caiu, null sem base de comparação. */
  variacao: number | null;
  status: StatusCompetencia;
};

export type StatusCompetencia = "atencao" | "desenvolvendo" | "consistente";

export const ROTULO_COMPETENCIA: Record<StatusCompetencia, string> = {
  atencao: "Precisa de atenção",
  desenvolvendo: "Em desenvolvimento",
  consistente: "Consistente",
};

/**
 * Abaixo de 5 é a linha de corte que o resto do sistema já usa. Entre 5
 * e 7 a competência está de pé mas ainda não é padrão, e é essa faixa
 * que costuma decidir o mês.
 */
export function statusDaNota(nota: number): StatusCompetencia {
  if (critica(nota)) return "atencao";
  return nota < 7 ? "desenvolvendo" : "consistente";
}

/**
 * As seis competências no ciclo pedido, cada uma já comparada com o
 * ciclo imediatamente anterior a ele. O padrão é o ciclo atual; a tela
 * passa outro quando o corretor está olhando para trás.
 */
export function lerCompetencias(
  corretor: Corretor,
  ciclo: ChaveCiclo = "atual"
): LeituraCompetencia[] {
  const notas = notasDoCiclo(corretor, ciclo) ?? corretor.notas;
  const chaveBase = cicloDeComparacao(ciclo);
  const base = chaveBase ? notasDoCiclo(corretor, chaveBase) : null;

  return COMPETENCIAS.map((c) => {
    const nota = notas[c.chave];
    const anterior = base?.[c.chave] ?? null;
    return {
      chave: c.chave,
      nome: c.nome,
      mede: c.mede,
      nota,
      anterior,
      variacao: anterior === null ? null : nota - anterior,
      status: statusDaNota(nota),
    };
  });
}

export function lerCompetencia(
  corretor: Corretor,
  chave: string,
  ciclo: ChaveCiclo = "atual"
): LeituraCompetencia | null {
  return lerCompetencias(corretor, ciclo).find((c) => c.chave === chave) ?? null;
}

/** Provas registradas na competência. Cai no texto padrão quando não há. */
export function provasDa(corretor: Corretor, chave: ChaveCompetencia): Evidencia[] {
  const registradas = corretor.evidencias?.[chave];
  return registradas?.length ? registradas : [evidenciaPadrao(chave, corretor.notas[chave])];
}

/* ---------- o foco do ciclo ---------- */

export type Foco = {
  competencia: LeituraCompetencia;
  /** A prova que sustenta a nota, para explicar o foco sem inventar texto. */
  prova: Evidencia;
};

/**
 * A competência mais fraca do ciclo. É o único número que a área do
 * corretor promove a protagonista: a tela responde "o que eu faço
 * agora", e a resposta é sempre o lado mais baixo do hexágono.
 */
export function focoDoCiclo(corretor: Corretor): Foco | null {
  const competencias = lerCompetencias(corretor);
  if (competencias.length === 0) return null;

  const pior = [...competencias].sort((a, b) => a.nota - b.nota)[0];
  return { competencia: pior, prova: provasDa(corretor, pior.chave)[0] };
}

/* ---------- evolução ---------- */

export type Evolucao = {
  nota: number;
  anterior: number | null;
  variacao: number | null;
  historico: { ciclo: string; nota: number }[];
};

export function evolucaoDo(corretor: Corretor): Evolucao {
  const nota = media(corretor.notas);
  const anterior = corretor.anterior ? media(corretor.anterior) : null;
  return {
    nota,
    anterior,
    variacao: anterior === null ? null : nota - anterior,
    historico: historicoDe(corretor),
  };
}
