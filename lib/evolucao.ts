import {
  COMPETENCIAS,
  IMOBILIARIA,
  critica,
  media,
  type ChaveCompetencia,
  type Corretor,
  type Notas,
} from "./dados";

/**
 * Comparação entre o Raio-X (quando o trabalho começou) e o ciclo atual.
 *
 * Regra de honestidade que atravessa este arquivo: só entra na conta de
 * time quem existia nos dois momentos. Quem foi contratado depois não
 * tem "antes", então incluir essa pessoa inflaria ou afundaria a média
 * sem que nada tivesse mudado de verdade. Ela aparece na tela, mas
 * separada.
 */

export type Indicadores = {
  leads: number;
  visitas: number;
  propostas: number;
  vendas: number;
  /** Mediana de minutos entre o lead entrar e o primeiro contato. */
  tempoRespostaMin: number;
};

/** Números da operação no mês do Raio-X e no mês atual. */
export const COMERCIAL_INICIAL: Indicadores = {
  leads: 210,
  visitas: 61,
  propostas: 11,
  vendas: 4,
  tempoRespostaMin: 190,
};

export const COMERCIAL_ATUAL: Indicadores = {
  leads: 228,
  visitas: 84,
  propostas: 26,
  vendas: 9,
  tempoRespostaMin: 22,
};

export type Comparavel = Corretor & { inicial: Notas };

/** Corretores que estavam lá no Raio-X e continuam hoje. */
export function comparaveis(): Comparavel[] {
  return IMOBILIARIA.corretores.filter((c): c is Comparavel => c.inicial !== null);
}

/** Quem entrou depois do Raio-X, e por isso fica fora da comparação. */
export function entraramDepois(): Corretor[] {
  return IMOBILIARIA.corretores.filter((c) => c.inicial === null);
}

function mediaDe(pessoas: Comparavel[], pegar: (p: Comparavel) => Notas): number {
  const total = pessoas.reduce((soma, p) => soma + media(pegar(p)), 0);
  return pessoas.length ? total / pessoas.length : 0;
}

export function notaDoTime() {
  const pessoas = comparaveis();
  return {
    antes: mediaDe(pessoas, (p) => p.inicial),
    depois: mediaDe(pessoas, (p) => p.notas),
  };
}

/** Média do time em cada competência, antes e depois, ordenada pelo maior ganho. */
export function competenciasComparadas() {
  const pessoas = comparaveis();

  return COMPETENCIAS.map((c) => {
    const antes = pessoas.reduce((s, p) => s + p.inicial[c.chave], 0) / pessoas.length;
    const depois = pessoas.reduce((s, p) => s + p.notas[c.chave], 0) / pessoas.length;
    return { ...c, antes, depois, ganho: depois - antes };
  }).sort((a, b) => b.ganho - a.ganho);
}

/** Notas médias do time como um objeto de Notas, para desenhar a impressão. */
export function notasMediasDoTime(momento: "antes" | "depois"): Notas {
  const pessoas = comparaveis();
  const notas = {} as Notas;
  for (const c of COMPETENCIAS) {
    const soma = pessoas.reduce(
      (s, p) => s + (momento === "antes" ? p.inicial[c.chave] : p.notas[c.chave]),
      0
    );
    notas[c.chave] = soma / pessoas.length;
  }
  return notas;
}

function temCritica(notas: Notas): boolean {
  return COMPETENCIAS.some((c) => critica(notas[c.chave]));
}

export function criticos() {
  const pessoas = comparaveis();
  const antes = pessoas.filter((p) => temCritica(p.inicial));
  const depois = pessoas.filter((p) => temCritica(p.notas));
  const saiaram = antes.filter((p) => !depois.some((d) => d.id === p.id));

  return {
    antes: antes.length,
    depois: depois.length,
    /** Quem tinha competência crítica no Raio-X e não tem mais. */
    saiaram,
    /** Quem ainda tem, e por isso é o trabalho do próximo ciclo. */
    restantes: depois,
  };
}

/** Evolução individual, do maior salto para o menor. */
export function evolucaoIndividual() {
  return comparaveis()
    .map((p) => ({
      id: p.id,
      nome: p.nome,
      antes: media(p.inicial),
      depois: media(p.notas),
      ganho: media(p.notas) - media(p.inicial),
    }))
    .sort((a, b) => b.ganho - a.ganho);
}

export type Indicador = {
  chave: string;
  nome: string;
  antes: number;
  depois: number;
  /** Como escrever o valor na tela. */
  formato: "porcentagem" | "numero" | "tempo";
  /** O que a mudança significa em uma frase. */
  leitura: string;
};

function taxa(parte: number, total: number): number {
  return total ? (parte / total) * 100 : 0;
}

export function indicadoresComerciais(): Indicador[] {
  const i = COMERCIAL_INICIAL;
  const a = COMERCIAL_ATUAL;

  return [
    {
      chave: "lead-visita",
      nome: "Lead que vira visita",
      antes: taxa(i.visitas, i.leads),
      depois: taxa(a.visitas, a.leads),
      formato: "porcentagem",
      leitura: "Mais gente saindo da conversa e indo ver imóvel.",
    },
    {
      chave: "visita-proposta",
      nome: "Visita que vira proposta",
      antes: taxa(i.propostas, i.visitas),
      depois: taxa(a.propostas, a.visitas),
      formato: "porcentagem",
      leitura: "O retorno depois da visita deixou de ser esquecido.",
    },
    {
      chave: "proposta-venda",
      nome: "Proposta que vira venda",
      antes: taxa(i.vendas, i.propostas),
      depois: taxa(a.vendas, a.propostas),
      formato: "porcentagem",
      leitura: "Chega mais proposta na mesa, e fechar virou o próximo gargalo.",
    },
    {
      chave: "tempo",
      nome: "Tempo até o primeiro contato",
      antes: i.tempoRespostaMin,
      depois: a.tempoRespostaMin,
      formato: "tempo",
      leitura: "O lead é atendido enquanto ainda está olhando anúncio.",
    },
    {
      chave: "vendas",
      nome: "Vendas no mês",
      antes: i.vendas,
      depois: a.vendas,
      formato: "numero",
      leitura: "Mesmo volume de lead entrando, mais contrato saindo.",
    },
  ];
}

export function escrever(valor: number, formato: Indicador["formato"]): string {
  if (formato === "porcentagem") return `${valor.toFixed(0)}%`;
  if (formato === "numero") return String(valor);

  // tempo
  if (valor < 60) return `${Math.round(valor)} min`;
  const horas = Math.floor(valor / 60);
  const minutos = Math.round(valor % 60);
  return minutos ? `${horas}h${String(minutos).padStart(2, "0")}` : `${horas}h`;
}

/** Para tempo, cair é melhorar. Para o resto, subir é melhorar. */
export function melhorou(indicador: Indicador): boolean {
  return indicador.formato === "tempo"
    ? indicador.depois < indicador.antes
    : indicador.depois > indicador.antes;
}

/** Quanto o lead ficou mais barato de converter, em vezes. */
export function multiplicadorDeVendas(): number {
  return COMERCIAL_INICIAL.vendas
    ? COMERCIAL_ATUAL.vendas / COMERCIAL_INICIAL.vendas
    : 0;
}
