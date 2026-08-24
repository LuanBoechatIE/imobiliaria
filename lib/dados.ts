import {
  MESES_DESDE_O_RAIO_X,
  mesPorExtenso,
  rotuloCiclo,
  rotuloCurto,
  type ChaveCiclo,
} from "./ciclos";

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

/** Um ponto da curva de evolução, já com o rótulo do mês resolvido. */
export type PontoHistorico = { ciclo: string; nota: number };

export type Corretor = {
  id: string;
  nome: string;
  desde: string;
  notas: Notas;
  anterior: Notas | null;
  /** Foto do Raio-X: como a pessoa estava quando o trabalho começou. */
  inicial: Notas | null;
  /**
   * Notas gerais em ordem, da mais antiga para a mais recente, sempre
   * terminando no ciclo atual. Só o número é guardado: o mês de cada
   * ponto é derivado da posição na hora de ler (ver `historicoDe`),
   * porque um rótulo gravado envelheceria junto com o dado.
   */
  historico: number[];
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
  // Getters, e não valores: o módulo é avaliado uma vez quando o
  // servidor sobe, então uma string fixa aqui congelaria o ciclo no mês
  // do deploy. Lendo a cada acesso, a virada de mês aparece sozinha.
  get ciclo() {
    return rotuloCiclo(0);
  },
  get cicloAnterior() {
    return rotuloCiclo(-1);
  },
  get cicloInicial() {
    return rotuloCiclo(-MESES_DESDE_O_RAIO_X);
  },
  corretores: [
    {
      id: "ana",
      nome: "Ana Ribeiro",
      desde: "2022",
      notas: { velocidade: 9, qualificacao: 8.5, visita: 9, followup: 7.5, negociacao: 8, registro: 8.5 },
      anterior: { velocidade: 8.5, qualificacao: 8, visita: 8.5, followup: 6.5, negociacao: 8, registro: 8 },
      inicial: { velocidade: 7, qualificacao: 6, visita: 8, followup: 4.5, negociacao: 7, registro: 7 },
      historico: [6.6, 7.1, 7.7, 8.4],
      evidencias: {
        visita: [
          {
            tipo: "áudio",
            texto:
              "Confirmou a visita na véspera, levou 3 imóveis dentro do perfil e fechou perguntando qual dos três o cliente levaria hoje.",
            quando: `12 ${rotuloCurto().toLowerCase()}`,
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
      historico: [3.9, 4.4, 4.9, 5.4],
      evidencias: {
        velocidade: [
          {
            tipo: "tempo",
            texto: "Mediana de 12 minutos entre o lead entrar e o primeiro contato. Melhor tempo do time.",
            quando: mesPorExtenso(),
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
            quando: `8 ${rotuloCurto().toLowerCase()}`,
          },
        ],
        followup: [
          {
            tipo: "tempo",
            texto:
              "9 clientes visitaram imóvel e não receberam nenhum contato depois. O mais antigo está há 23 dias sem retorno.",
            quando: mesPorExtenso(),
          },
          {
            tipo: "áudio",
            texto:
              "Cliente pediu para pensar. Não houve nova tentativa de contato em nenhum canal.",
            quando: `3 ${rotuloCurto().toLowerCase()}`,
          },
        ],
        registro: [
          {
            tipo: "registro",
            texto:
              "6 negociações ativas vivem só no WhatsApp pessoal dele. Se ele sair da imobiliária, a carteira sai junto.",
            quando: mesPorExtenso(),
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
      historico: [4.4, 5.0, 5.7, 6.3],
    },
    {
      id: "marcos",
      nome: "Marcos Teixeira",
      desde: "2021",
      notas: { velocidade: 5, qualificacao: 6, visita: 7.5, followup: 3.5, negociacao: 7, registro: 3 },
      anterior: { velocidade: 5.5, qualificacao: 6, visita: 7, followup: 4, negociacao: 6.5, registro: 3 },
      inicial: { velocidade: 4.5, qualificacao: 4, visita: 6.5, followup: 1.5, negociacao: 6, registro: 2.5 },
      historico: [4.2, 4.5, 4.9, 5.3],
    },
    {
      id: "patricia",
      nome: "Patrícia Lemos",
      desde: "2020",
      notas: { velocidade: 6.5, qualificacao: 7.5, visita: 8, followup: 6, negociacao: 7.5, registro: 6 },
      anterior: { velocidade: 6.5, qualificacao: 7, visita: 8, followup: 5, negociacao: 7, registro: 6 },
      inicial: { velocidade: 6, qualificacao: 5.5, visita: 7.5, followup: 3.5, negociacao: 6.5, registro: 5 },
      historico: [5.7, 6.1, 6.5, 6.9],
    },
    {
      id: "eduardo",
      nome: "Eduardo Vasques",
      desde: "2024",
      notas: { velocidade: 4, qualificacao: 4.5, visita: 5, followup: 2.5, negociacao: 4, registro: 5.5 },
      anterior: { velocidade: 3, qualificacao: 4, visita: 4, followup: 2.5, negociacao: 3.5, registro: 5 },
      inicial: { velocidade: 3.5, qualificacao: 1.5, visita: 4, followup: 0.5, negociacao: 4, registro: 4.5 },
      historico: [3.0, 3.4, 3.8, 4.3],
      evidencias: {
        velocidade: [
          {
            tipo: "tempo",
            texto:
              "Mediana de 5 horas para o primeiro contato. Dois leads de sexta só foram respondidos na segunda.",
            quando: mesPorExtenso(),
          },
        ],
        followup: [
          {
            tipo: "tempo",
            texto:
              "Nenhum contato depois da primeira conversa em 11 dos 14 leads recebidos.",
            quando: mesPorExtenso(),
          },
        ],
        negociacao: [
          {
            tipo: "role-play",
            texto:
              "Levou a proposta baixa direto ao proprietário sem preparar o terreno. Proprietário recusou sem contraproposta.",
            quando: `15 ${rotuloCurto().toLowerCase()}`,
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
      historico: [5.4],
    },
  ],
};

export function acharCorretor(id: string): Corretor | undefined {
  return IMOBILIARIA.corretores.find((c) => c.id === id);
}

/**
 * A curva de evolução com o mês de cada ponto resolvido agora: o último
 * é sempre o ciclo atual, e os anteriores contam para trás a partir dele.
 *
 * Isso assume ciclos consecutivos, sem buraco. É verdade por construção
 * — o ciclo fecha todo mês e quem não foi avaliado não gera ponto — e é
 * o preço de não gravar o mês junto da nota, que é o que faria a curva
 * envelhecer.
 */
export function historicoDe(corretor: Corretor): PontoHistorico[] {
  const ultimo = corretor.historico.length - 1;
  return corretor.historico.map((nota, i) => ({
    ciclo: rotuloCurto(i - ultimo),
    nota,
  }));
}

/**
 * As notas da pessoa em um dos três ciclos comparáveis. Devolve null
 * quando aquele ciclo não existe para ela: quem entrou depois do Raio-X
 * não tem foto inicial, e quem está no primeiro ciclo não tem anterior.
 */
export function notasDoCiclo(corretor: Corretor, ciclo: ChaveCiclo): Notas | null {
  if (ciclo === "anterior") return corretor.anterior;
  if (ciclo === "inicial") return corretor.inicial;
  return corretor.notas;
}

/** Quem tem nota no ciclo pedido. É a base de qualquer média de time. */
export function corretoresNoCiclo(ciclo: ChaveCiclo, corretores = IMOBILIARIA.corretores) {
  return corretores.filter((c) => notasDoCiclo(c, ciclo) !== null);
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
  notas: Notas;
  evidencias: Partial<Record<ChaveCompetencia, Evidencia>>;
}): void {
  const { id, nome, desde, notas, evidencias } = params;
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
      historico: [media(notas)],
      evidencias: evidenciasPorCompetencia,
    });
    return;
  }

  existente.anterior = existente.notas;
  existente.notas = notas;
  existente.evidencias = evidenciasPorCompetencia;

  // O último ponto da curva é, por definição, o ciclo atual — e é ele
  // que esta avaliação acabou de decidir. Reavaliar no mesmo mês corrige
  // o ponto em vez de criar um mês novo do nada.
  if (existente.historico.length === 0) {
    existente.historico = [media(notas)];
  } else {
    existente.historico = [...existente.historico.slice(0, -1), media(notas)];
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
  // Último anteparo: qualquer média de lista vazia chega aqui como NaN,
  // e "NaN" na tela é pior do que o mesmo ponto que já marca nota
  // ausente no formulário de avaliação.
  if (!Number.isFinite(n)) return "·";
  return n.toFixed(1).replace(".", ",");
}

/** Abaixo de 5 a competência entra como ponto de atenção. */
export function critica(nota: number): boolean {
  return nota < 5;
}

/**
 * Média do time em cada competência, da mais fraca para a mais forte.
 *
 * `pegar` diz de qual ciclo ler. O padrão é o ciclo atual, que é o que
 * quase toda tela quer; o painel passa outro quando o usuário está
 * olhando um ciclo fechado.
 */
export function mediasPorCompetencia(
  corretores: Corretor[],
  pegar: (c: Corretor) => Notas = (c) => c.notas
) {
  const quantos = corretores.length || 1;
  return COMPETENCIAS.map((c) => ({
    ...c,
    valor: corretores.reduce((soma, p) => soma + pegar(p)[c.chave], 0) / quantos,
  })).sort((a, b) => a.valor - b.valor);
}
