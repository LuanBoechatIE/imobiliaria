/**
 * As seis competências são fixas: são os seis lados do hexágono e a
 * ordem nunca muda, senão comparar silhueta perderia o sentido.
 *
 * "mede" descreve o que entra na nota. Mora aqui porque a mesma frase é
 * usada no formulário de avaliação e na trilha de treinamento, e as duas
 * precisam dizer exatamente a mesma coisa.
 */
export const COMPETENCIAS = [
  {
    chave: "velocidade",
    nome: "Velocidade",
    curto: "Vel",
    mede: "Tempo entre o lead chegar e o corretor falar com ele.",
  },
  {
    chave: "qualificacao",
    nome: "Qualificação",
    curto: "Qual",
    mede: "Descobre renda, situação de crédito, urgência e quem decide.",
  },
  {
    chave: "visita",
    nome: "Condução de visita",
    curto: "Vis",
    mede: "Preparo, roteiro de imóveis, leitura de sinal e retorno depois.",
  },
  {
    chave: "followup",
    nome: "Follow-up",
    curto: "Follow",
    mede: "Cadência real de contato, e o que faz com quem parou de responder.",
  },
  {
    chave: "negociacao",
    nome: "Negociação",
    curto: "Neg",
    mede: "Conduz as duas pontas: o comprador e o proprietário.",
  },
  {
    chave: "registro",
    nome: "Registro",
    curto: "Reg",
    mede: "Deixa rastro no processo, de forma que a carteira fique com a imobiliária.",
  },
] as const;

export type ChaveCompetencia = (typeof COMPETENCIAS)[number]["chave"];

export type Notas = Record<ChaveCompetencia, number>;

export type TipoEvidencia = "áudio" | "tempo" | "role-play" | "registro";

export type Evidencia = {
  tipo: TipoEvidencia;
  texto: string;
  quando: string;
};

export type PontoHistorico = { ciclo: string; nota: number };

export type Corretor = {
  id: string;
  nome: string;
  desde: string;
  notas: Notas;
  anterior: Notas | null;
  /** Foto do Raio-X: como a pessoa estava quando o trabalho começou. */
  inicial: Notas | null;
  historico: PontoHistorico[];
  /** Evidências específicas. O que não estiver aqui usa o texto padrão. */
  evidencias?: Partial<Record<ChaveCompetencia, Evidencia[]>>;
};

export type Imobiliaria = {
  nome: string;
  cidade: string;
  ciclo: string;
  cicloAnterior: string;
  /** Ciclo do Raio-X, quando o trabalho começou. */
  cicloInicial: string;
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
  cicloInicial: "Dezembro 2025",
  corretores: [
    {
      id: "ana",
      nome: "Ana Ribeiro",
      desde: "2022",
      notas: { velocidade: 9, qualificacao: 8.5, visita: 9, followup: 7.5, negociacao: 8, registro: 8.5 },
      anterior: { velocidade: 8.5, qualificacao: 8, visita: 8.5, followup: 6.5, negociacao: 8, registro: 8 },
      inicial: { velocidade: 7, qualificacao: 6, visita: 8, followup: 4.5, negociacao: 7, registro: 7 },
      historico: [
        { ciclo: "Dez", nota: 6.6 },
        { ciclo: "Jan", nota: 7.1 },
        { ciclo: "Fev", nota: 7.7 },
        { ciclo: "Mar", nota: 8.4 },
      ],
      evidencias: {
        visita: [
          {
            tipo: "áudio",
            texto:
              "Confirmou a visita na véspera, levou 3 imóveis dentro do perfil e fechou perguntando qual dos três o cliente levaria hoje.",
            quando: "12 mar",
          },
        ],
      },
    },
    {
      id: "ricardo",
      nome: "Ricardo Mendes",
      desde: "2019",
      notas: { velocidade: 8, qualificacao: 4, visita: 7, followup: 3, negociacao: 6, registro: 4.5 },
      anterior: { velocidade: 7.5, qualificacao: 4, visita: 7, followup: 3.5, negociacao: 6, registro: 4 },
      inicial: { velocidade: 6.5, qualificacao: 2.5, visita: 6, followup: 1, negociacao: 5, registro: 2.5 },
      historico: [
        { ciclo: "Dez", nota: 3.9 },
        { ciclo: "Jan", nota: 4.4 },
        { ciclo: "Fev", nota: 4.9 },
        { ciclo: "Mar", nota: 5.4 },
      ],
      evidencias: {
        velocidade: [
          {
            tipo: "tempo",
            texto: "Mediana de 12 minutos entre o lead entrar e o primeiro contato. Melhor tempo do time.",
            quando: "março",
          },
        ],
        qualificacao: [
          {
            tipo: "áudio",
            texto:
              "Em 4 dos 5 atendimentos ouvidos, não perguntou se o comprador já tinha crédito aprovado. Marcou visita com quem ainda nem tinha ido ao banco.",
            quando: "5 atendimentos",
          },
          {
            tipo: "role-play",
            texto:
              "Foi direto para o imóvel sem entender por que a pessoa está mudando. Sem motivo, não há urgência para trabalhar depois.",
            quando: "8 mar",
          },
        ],
        followup: [
          {
            tipo: "tempo",
            texto:
              "9 clientes visitaram imóvel e não receberam nenhum contato depois. O mais antigo está há 23 dias sem retorno.",
            quando: "março",
          },
          {
            tipo: "áudio",
            texto:
              "Cliente pediu para pensar. Não houve nova tentativa de contato em nenhum canal.",
            quando: "3 mar",
          },
        ],
        registro: [
          {
            tipo: "registro",
            texto:
              "6 negociações ativas vivem só no WhatsApp pessoal dele. Se ele sair da imobiliária, a carteira sai junto.",
            quando: "março",
          },
        ],
      },
    },
    {
      id: "juliana",
      nome: "Juliana Prado",
      desde: "2023",
      notas: { velocidade: 7.5, qualificacao: 7, visita: 6.5, followup: 4.5, negociacao: 5.5, registro: 7 },
      anterior: { velocidade: 6, qualificacao: 6, visita: 6, followup: 4, negociacao: 5.5, registro: 6.5 },
      inicial: { velocidade: 5, qualificacao: 4.5, visita: 5.5, followup: 2, negociacao: 4.5, registro: 5 },
      historico: [
        { ciclo: "Dez", nota: 4.4 },
        { ciclo: "Jan", nota: 5.0 },
        { ciclo: "Fev", nota: 5.7 },
        { ciclo: "Mar", nota: 6.3 },
      ],
    },
    {
      id: "marcos",
      nome: "Marcos Teixeira",
      desde: "2021",
      notas: { velocidade: 5, qualificacao: 6, visita: 7.5, followup: 3.5, negociacao: 7, registro: 3 },
      anterior: { velocidade: 5.5, qualificacao: 6, visita: 7, followup: 4, negociacao: 6.5, registro: 3 },
      inicial: { velocidade: 4.5, qualificacao: 4, visita: 6.5, followup: 1.5, negociacao: 6, registro: 2.5 },
      historico: [
        { ciclo: "Dez", nota: 4.2 },
        { ciclo: "Jan", nota: 4.5 },
        { ciclo: "Fev", nota: 4.9 },
        { ciclo: "Mar", nota: 5.3 },
      ],
    },
    {
      id: "patricia",
      nome: "Patrícia Lemos",
      desde: "2020",
      notas: { velocidade: 6.5, qualificacao: 7.5, visita: 8, followup: 6, negociacao: 7.5, registro: 6 },
      anterior: { velocidade: 6.5, qualificacao: 7, visita: 8, followup: 5, negociacao: 7, registro: 6 },
      inicial: { velocidade: 6, qualificacao: 5.5, visita: 7.5, followup: 3.5, negociacao: 6.5, registro: 5 },
      historico: [
        { ciclo: "Dez", nota: 5.7 },
        { ciclo: "Jan", nota: 6.1 },
        { ciclo: "Fev", nota: 6.5 },
        { ciclo: "Mar", nota: 6.9 },
      ],
    },
    {
      id: "eduardo",
      nome: "Eduardo Vasques",
      desde: "2024",
      notas: { velocidade: 4, qualificacao: 4.5, visita: 5, followup: 2.5, negociacao: 4, registro: 5.5 },
      anterior: { velocidade: 3, qualificacao: 4, visita: 4, followup: 2.5, negociacao: 3.5, registro: 5 },
      inicial: { velocidade: 3.5, qualificacao: 1.5, visita: 4, followup: 0.5, negociacao: 4, registro: 4.5 },
      historico: [
        { ciclo: "Dez", nota: 3.0 },
        { ciclo: "Jan", nota: 3.4 },
        { ciclo: "Fev", nota: 3.8 },
        { ciclo: "Mar", nota: 4.3 },
      ],
      evidencias: {
        velocidade: [
          {
            tipo: "tempo",
            texto:
              "Mediana de 5 horas para o primeiro contato. Dois leads de sexta só foram respondidos na segunda.",
            quando: "março",
          },
        ],
        followup: [
          {
            tipo: "tempo",
            texto:
              "Nenhum contato depois da primeira conversa em 11 dos 14 leads recebidos.",
            quando: "março",
          },
        ],
        negociacao: [
          {
            tipo: "role-play",
            texto:
              "Levou a proposta baixa direto ao proprietário sem preparar o terreno. Proprietário recusou sem contraproposta.",
            quando: "15 mar",
          },
        ],
      },
    },
    {
      id: "silvia",
      nome: "Sílvia Castro",
      desde: "2025",
      notas: { velocidade: 7, qualificacao: 5.5, visita: 5, followup: 4, negociacao: 4.5, registro: 6.5 },
      anterior: null,
      inicial: null,
      historico: [{ ciclo: "Mar", nota: 5.4 }],
    },
  ],
};

export function acharCorretor(id: string): Corretor | undefined {
  return IMOBILIARIA.corretores.find((c) => c.id === id);
}

/**
 * Aplica o resultado de uma avaliação concluída (ver lib/avaliacoes.ts)
 * ao registro do corretor: a nota atual vira "anterior", a nova nota
 * entra, o ciclo é anotado no histórico e a evidência de cada
 * competência passa a vir do que foi observado na avaliação.
 *
 * Se o corretor ainda não existir aqui (pessoa nova, cadastrada só em
 * lib/equipe.ts), o registro nasce agora — é o gancho que traz gente
 * nova pra dentro do painel assim que a primeira avaliação fecha.
 */
export function aplicarAvaliacaoAoCorretor(params: {
  id: string;
  nome: string;
  desde: string;
  cicloRotulo: string;
  notas: Notas;
  evidencias: Partial<Record<ChaveCompetencia, Evidencia>>;
}): void {
  const { id, nome, desde, cicloRotulo, notas, evidencias } = params;
  const existente = IMOBILIARIA.corretores.find((c) => c.id === id);

  const evidenciasPorCompetencia: Partial<Record<ChaveCompetencia, Evidencia[]>> = {};
  for (const c of COMPETENCIAS) {
    const ev = evidencias[c.chave];
    if (ev) evidenciasPorCompetencia[c.chave] = [ev];
  }

  if (!existente) {
    IMOBILIARIA.corretores.push({
      id,
      nome,
      desde,
      notas,
      anterior: null,
      inicial: null,
      historico: [{ ciclo: cicloRotulo, nota: media(notas) }],
      evidencias: evidenciasPorCompetencia,
    });
    return;
  }

  existente.anterior = existente.notas;
  existente.notas = notas;
  existente.evidencias = evidenciasPorCompetencia;

  const jaTemCiclo = existente.historico.some((h) => h.ciclo === cicloRotulo);
  if (jaTemCiclo) {
    existente.historico = existente.historico.map((h) =>
      h.ciclo === cicloRotulo ? { ...h, nota: media(notas) } : h
    );
  } else {
    existente.historico = [...existente.historico, { ciclo: cicloRotulo, nota: media(notas) }];
  }
}

/** Texto usado quando não há evidência específica registrada. */
export function evidenciaPadrao(chave: ChaveCompetencia, nota: number): Evidencia {
  const base: Record<ChaveCompetencia, [string, string]> = {
    velocidade: [
      "Responde os leads dentro do prazo combinado na maior parte dos dias.",
      "Demora acima do prazo combinado em boa parte dos leads recebidos.",
    ],
    qualificacao: [
      "Levanta renda, crédito e motivo antes de marcar visita.",
      "Marca visita sem confirmar crédito ou entender o motivo da mudança.",
    ],
    visita: [
      "Prepara o roteiro e retoma o cliente logo depois da visita.",
      "Leva imóvel fora do perfil e não retoma o cliente depois.",
    ],
    followup: [
      "Mantém cadência de contato com quem ainda não decidiu.",
      "Para de procurar o cliente depois da segunda tentativa.",
    ],
    negociacao: [
      "Conduz as duas pontas e sustenta o preço com argumento.",
      "Repassa proposta sem preparar comprador nem proprietário.",
    ],
    registro: [
      "Deixa a negociação registrada e a carteira fica com a imobiliária.",
      "Boa parte das negociações vive só no WhatsApp pessoal.",
    ],
  };
  const [bom, ruim] = base[chave];
  return {
    tipo: "áudio",
    texto: nota >= 6 ? bom : ruim,
    quando: "amostra do mês",
  };
}

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
