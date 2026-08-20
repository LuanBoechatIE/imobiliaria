export const COMPETENCIAS = [
  { chave: "velocidade", nome: "Velocidade", curto: "Vel" },
  { chave: "qualificacao", nome: "Qualificação", curto: "Qual" },
  { chave: "visita", nome: "Condução de visita", curto: "Vis" },
  { chave: "followup", nome: "Follow-up", curto: "Follow" },
  { chave: "negociacao", nome: "Negociação", curto: "Neg" },
  { chave: "registro", nome: "Registro", curto: "Reg" },
] as const;

export type ChaveCompetencia = (typeof COMPETENCIAS)[number]["chave"];

export type Notas = Record<ChaveCompetencia, number>;

export type Corretor = {
  id: string;
  nome: string;
  desde: string;
  notas: Notas;
  anterior: Notas | null;
};

export type Imobiliaria = {
  nome: string;
  cidade: string;
  ciclo: string;
  cicloAnterior: string;
  corretores: Corretor[];
};

/**
 * Dados de exemplo. Imobiliária fictícia, usada só para demonstração
 * comercial. Nenhum número aqui é de cliente real.
 */
export const IMOBILIARIA: Imobiliaria = {
  nome: "Imobiliária Vale Norte",
  cidade: "Exemplo",
  ciclo: "Março 2026",
  cicloAnterior: "Fevereiro 2026",
  corretores: [
    {
      id: "ana",
      nome: "Ana Ribeiro",
      desde: "2022",
      notas: { velocidade: 9, qualificacao: 8.5, visita: 9, followup: 7.5, negociacao: 8, registro: 8.5 },
      anterior: { velocidade: 8.5, qualificacao: 8, visita: 8.5, followup: 6.5, negociacao: 8, registro: 8 },
    },
    {
      id: "ricardo",
      nome: "Ricardo Mendes",
      desde: "2019",
      notas: { velocidade: 8, qualificacao: 4, visita: 7, followup: 3, negociacao: 6, registro: 4.5 },
      anterior: { velocidade: 7.5, qualificacao: 4, visita: 7, followup: 3.5, negociacao: 6, registro: 4 },
    },
    {
      id: "juliana",
      nome: "Juliana Prado",
      desde: "2023",
      notas: { velocidade: 7.5, qualificacao: 7, visita: 6.5, followup: 4.5, negociacao: 5.5, registro: 7 },
      anterior: { velocidade: 6, qualificacao: 6, visita: 6, followup: 4, negociacao: 5.5, registro: 6.5 },
    },
    {
      id: "marcos",
      nome: "Marcos Teixeira",
      desde: "2021",
      notas: { velocidade: 5, qualificacao: 6, visita: 7.5, followup: 3.5, negociacao: 7, registro: 3 },
      anterior: { velocidade: 5.5, qualificacao: 6, visita: 7, followup: 4, negociacao: 6.5, registro: 3 },
    },
    {
      id: "patricia",
      nome: "Patrícia Lemos",
      desde: "2020",
      notas: { velocidade: 6.5, qualificacao: 7.5, visita: 8, followup: 6, negociacao: 7.5, registro: 6 },
      anterior: { velocidade: 6.5, qualificacao: 7, visita: 8, followup: 5, negociacao: 7, registro: 6 },
    },
    {
      id: "eduardo",
      nome: "Eduardo Vasques",
      desde: "2024",
      notas: { velocidade: 4, qualificacao: 4.5, visita: 5, followup: 2.5, negociacao: 4, registro: 5.5 },
      anterior: { velocidade: 3, qualificacao: 4, visita: 4, followup: 2.5, negociacao: 3.5, registro: 5 },
    },
    {
      id: "silvia",
      nome: "Sílvia Castro",
      desde: "2025",
      notas: { velocidade: 7, qualificacao: 5.5, visita: 5, followup: 4, negociacao: 4.5, registro: 6.5 },
      anterior: null,
    },
  ],
};

export function media(notas: Notas): number {
  const valores = COMPETENCIAS.map((c) => notas[c.chave]);
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

export function fmt(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

/** Abaixo de 5 a competência entra como ponto de atenção. */
export function critica(nota: number): boolean {
  return nota < 5;
}

/** Média do time em cada competência, da mais fraca para a mais forte. */
export function mediasPorCompetencia(corretores: Corretor[]) {
  return COMPETENCIAS.map((c) => ({
    ...c,
    valor: corretores.reduce((soma, p) => soma + p.notas[c.chave], 0) / corretores.length,
  })).sort((a, b) => a.valor - b.valor);
}
