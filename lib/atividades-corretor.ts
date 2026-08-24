import {
  acharTreinamento,
  listarTreinamentos,
  treinamentosDaPessoa,
  type Atividade,
  type CompetenciaOuGeral,
  type Treinamento,
} from "./treinamentos";
import type { ChaveCompetencia } from "./dados";

/**
 * A camada que liga corretor ↔ atividade.
 *
 * O sistema já tinha atividade dentro do treinamento, mas como uma lista
 * da turma inteira: um item, um checkbox, marcado pelo gestor. Isso
 * responde "a turma fez?", não "o que EU tenho para fazer agora", que é
 * a única pergunta da área do corretor.
 *
 * Então aqui não se cria uma segunda base de atividades: cria-se a
 * atribuição, que aponta para a atividade que já existe no treinamento e
 * carrega o que é de cada pessoa (status, prazo, o que ela respondeu).
 *
 * ⚠️ O checkbox do gestor continua sendo a palavra final: atividade
 * marcada como concluída lá aparece concluída aqui, independentemente do
 * que o corretor tenha enviado. Corretor não aprova o próprio trabalho.
 */

export type StatusAtividade =
  | "pendente"
  | "em-andamento"
  | "aguardando-revisao"
  | "concluida";

export const ROTULO_ATIVIDADE: Record<StatusAtividade, string> = {
  pendente: "Pendente",
  "em-andamento": "Em andamento",
  "aguardando-revisao": "Aguardando revisão",
  concluida: "Concluída",
};

/** Como cada status se pinta. Usa só os tokens que o sistema já tem. */
export const TOM_ATIVIDADE: Record<StatusAtividade, string> = {
  pendente: "border-linha-forte bg-fundo-2 text-tinta-suave",
  "em-andamento": "border-laranja/35 bg-laranja-suave text-acao",
  "aguardando-revisao": "border-laranja/35 bg-laranja-suave text-acao",
  concluida: "border-ok/30 bg-ok-suave text-ok",
};

export type Atribuicao = {
  id: string;
  corretorId: string;
  treinamentoId: string;
  /** Aponta para a atividade que já mora dentro do treinamento. */
  atividadeId: string;
  objetivo: string;
  instrucoes: string;
  /** ISO, yyyy-mm-dd. null = sem data combinada. */
  prazo: string | null;
  status: StatusAtividade;
  resposta: string | null;
  enviadoEm: string | null;
};

/**
 * Base provisória, em memória — mesmo regime do resto do sistema.
 * Some a cada reinício. Vira banco quando existir cliente pagando.
 */
const ATRIBUICOES: Atribuicao[] = [
  {
    id: "at-ricardo-1",
    corretorId: "ricardo",
    treinamentoId: "follow-up-que-nao-morre",
    atividadeId: "a1",
    objetivo: "Enxergar quanto negócio parado existe na sua própria carteira.",
    instrucoes:
      "Abra sua carteira e liste 3 negócios que esfriaram: nome, imóvel de interesse e há quantos dias ninguém fala com o cliente. Traga a lista escrita para a próxima call.",
    prazo: "2026-08-22",
    // Entregue e já fechada pelo gestor no treinamento: aparece como
    // concluída porque o checkbox de lá vence o que está guardado aqui.
    status: "aguardando-revisao",
    resposta:
      "Listei os 3: família Souza (23 dias), Marcelo do Jardim Aurora (17 dias) e a Cláudia do apartamento da Vila Nova (12 dias).",
    enviadoEm: "2026-08-21T18:10:00",
  },
  {
    id: "at-ricardo-2",
    corretorId: "ricardo",
    treinamentoId: "follow-up-que-nao-morre",
    atividadeId: "a2",
    objetivo: "Praticar a reabertura de negócio frio antes de fazer no cliente real.",
    instrucoes:
      "Reabra um dos 3 negócios da lista em role-play na próxima call. Sem pedir desculpa pelo sumiço e sem perguntar 'ainda tem interesse?'. Entre com motivo novo.",
    prazo: "2026-08-29",
    status: "aguardando-revisao",
    resposta:
      "Fiz o role-play com a Renata usando o caso da família Souza. Entrei com o imóvel novo da mesma rua como motivo, sem falar do sumiço.",
    enviadoEm: "2026-08-23T09:40:00",
  },
  {
    id: "at-ricardo-3",
    corretorId: "ricardo",
    treinamentoId: "qualificacao-antes-da-visita",
    atividadeId: "a3",
    objetivo: "Parar de marcar visita com quem ainda não tem como comprar.",
    instrucoes:
      "Aplique o checklist de qualificação nos seus próximos 5 leads: crédito, prazo e quem decide junto. Anote a resposta dos 3 pontos em cada um e traga para revisão.",
    prazo: "2026-08-30",
    status: "pendente",
    resposta: null,
    enviadoEm: null,
  },
  {
    id: "at-marcos-1",
    corretorId: "marcos",
    treinamentoId: "follow-up-que-nao-morre",
    atividadeId: "a1",
    objetivo: "Enxergar quanto negócio parado existe na sua própria carteira.",
    instrucoes:
      "Abra sua carteira e liste 3 negócios que esfriaram: nome, imóvel de interesse e há quantos dias ninguém fala com o cliente.",
    prazo: "2026-08-22",
    status: "pendente",
    resposta: null,
    enviadoEm: null,
  },
  {
    id: "at-eduardo-1",
    corretorId: "eduardo",
    treinamentoId: "follow-up-que-nao-morre",
    atividadeId: "a1",
    objetivo: "Enxergar quanto negócio parado existe na sua própria carteira.",
    instrucoes:
      "Abra sua carteira e liste 3 negócios que esfriaram: nome, imóvel de interesse e há quantos dias ninguém fala com o cliente.",
    prazo: "2026-08-22",
    status: "pendente",
    resposta: null,
    enviadoEm: null,
  },
  {
    id: "at-eduardo-2",
    corretorId: "eduardo",
    treinamentoId: "qualificacao-antes-da-visita",
    atividadeId: "a3",
    objetivo: "Parar de marcar visita com quem ainda não tem como comprar.",
    instrucoes:
      "Aplique o checklist de qualificação nos seus próximos 5 leads e anote crédito, prazo e decisor em cada um.",
    prazo: "2026-08-30",
    status: "pendente",
    resposta: null,
    enviadoEm: null,
  },
];

/**
 * Plano de desenvolvimento por competência. É o que o corretor lê quando
 * pergunta "e o que eu faço com essa nota?".
 *
 * Fica vazio quando ninguém escreveu nada: a tela mostra o estado vazio
 * em vez de inventar recomendação genérica.
 */
type Plano = { corretorId: string; competencia: ChaveCompetencia; acoes: string[] };

const PLANOS: Plano[] = [
  {
    corretorId: "ricardo",
    competencia: "followup",
    acoes: [
      "Fechar todo atendimento com o próximo contato já combinado: dia, hora e canal.",
      "Manter cadência de 5 toques em quem visitou e não decidiu, antes de considerar o negócio frio.",
      "Reabrir negócio parado com motivo novo (imóvel novo, mudança de preço), nunca com 'ainda tem interesse?'.",
    ],
  },
  {
    corretorId: "ricardo",
    competencia: "qualificacao",
    acoes: [
      "Confirmar situação de crédito antes de marcar qualquer visita.",
      "Descobrir o motivo real da mudança: sem motivo não existe urgência para trabalhar depois.",
      "Identificar quem decide junto e trazer essa pessoa para a visita.",
    ],
  },
  {
    corretorId: "ricardo",
    competencia: "registro",
    acoes: [
      "Passar as negociações que hoje vivem no WhatsApp pessoal para o registro da imobiliária.",
      "Atualizar a etapa do negócio no mesmo dia em que ela muda.",
    ],
  },
  {
    corretorId: "eduardo",
    competencia: "followup",
    acoes: [
      "Fazer o segundo contato em até 48h depois da primeira conversa, sempre.",
      "Deixar combinado com o cliente qual é o próximo passo antes de desligar.",
    ],
  },
];

/* ---------- leitura ---------- */

export type AtividadeDoCorretor = Atribuicao & {
  titulo: string;
  treinamento: Treinamento;
  competencia: CompetenciaOuGeral;
};

/** Ordem de urgência: o que está parado primeiro, o que acabou por último. */
const PESO: Record<StatusAtividade, number> = {
  pendente: 0,
  "em-andamento": 1,
  "aguardando-revisao": 2,
  concluida: 3,
};

/**
 * O status que a tela mostra.
 *
 * O checkbox do gestor no treinamento fecha a atividade, mas só de quem
 * entregou. Ele é um só para a turma inteira: se fechasse para todos,
 * quem não fez nada veria "concluída" e a nota viraria mentira. Então
 * ele vale como aprovação de uma entrega que existe, e para quem não
 * entregou continua valendo o estado da própria pessoa.
 */
function statusEfetivo(atribuicao: Atribuicao, atividade: Atividade): StatusAtividade {
  const entregou = atribuicao.resposta !== null || atribuicao.status === "aguardando-revisao";
  return atividade.concluida && entregou ? "concluida" : atribuicao.status;
}

function montar(atribuicao: Atribuicao): AtividadeDoCorretor | null {
  const treinamento = acharTreinamento(atribuicao.treinamentoId);
  if (!treinamento || treinamento.status === "cancelado") return null;

  const atividade = treinamento.atividades.find((a) => a.id === atribuicao.atividadeId);
  if (!atividade) return null;

  return {
    ...atribuicao,
    status: statusEfetivo(atribuicao, atividade),
    titulo: atividade.titulo,
    treinamento,
    competencia: treinamento.competencia,
  };
}

/** Tudo que foi atribuído a uma pessoa. Nunca devolve o de outra. */
export function atividadesDoCorretor(corretorId: string): AtividadeDoCorretor[] {
  return ATRIBUICOES.filter((a) => a.corretorId === corretorId)
    .map(montar)
    .filter((a): a is AtividadeDoCorretor => a !== null)
    .sort((a, b) => {
      const porStatus = PESO[a.status] - PESO[b.status];
      if (porStatus !== 0) return porStatus;
      return (a.prazo ?? "9999").localeCompare(b.prazo ?? "9999");
    });
}

/**
 * Uma atividade específica, **desde que seja dessa pessoa**.
 *
 * A checagem de dono mora aqui, e não na página, porque é o ponto por
 * onde toda leitura passa: esconder o link não impede ninguém de digitar
 * o id na barra de endereço.
 */
export function acharAtividadeDoCorretor(
  id: string,
  corretorId: string
): AtividadeDoCorretor | null {
  const atribuicao = ATRIBUICOES.find((a) => a.id === id && a.corretorId === corretorId);
  return atribuicao ? montar(atribuicao) : null;
}

export function atividadesDaCompetencia(
  corretorId: string,
  competencia: ChaveCompetencia
): AtividadeDoCorretor[] {
  return atividadesDoCorretor(corretorId).filter((a) => a.competencia === competencia);
}

export function planoDaCompetencia(
  corretorId: string,
  competencia: ChaveCompetencia
): string[] {
  return (
    PLANOS.find((p) => p.corretorId === corretorId && p.competencia === competencia)?.acoes ??
    []
  );
}

/* ---------- treinamentos, na visão de quem participou ---------- */

export type TreinamentoDoCorretor = {
  treinamento: Treinamento;
  status: StatusAtividade;
  /** 0 a 100, calculado sobre as atividades atribuídas nesse treino. */
  progresso: number;
  atividades: AtividadeDoCorretor[];
};

function statusDoTreino(atividades: AtividadeDoCorretor[]): StatusAtividade {
  if (atividades.length === 0) return "pendente";
  if (atividades.every((a) => a.status === "concluida")) return "concluida";
  if (atividades.some((a) => a.status !== "pendente")) return "em-andamento";
  return "pendente";
}

/** Só os treinamentos de que a pessoa participou. Nunca a biblioteca inteira. */
export function treinamentosDoCorretor(corretorId: string): TreinamentoDoCorretor[] {
  return treinamentosDaPessoa(corretorId).map((treinamento) => {
    const atividades = atividadesDoCorretor(corretorId).filter(
      (a) => a.treinamentoId === treinamento.id
    );
    const feitas = atividades.filter((a) => a.status === "concluida").length;

    return {
      treinamento,
      status: statusDoTreino(atividades),
      progresso: atividades.length ? Math.round((feitas / atividades.length) * 100) : 0,
      atividades,
    };
  });
}

/** Um treinamento, **desde que a pessoa tenha participado dele**. */
export function acharTreinamentoDoCorretor(
  id: string,
  corretorId: string
): TreinamentoDoCorretor | null {
  return treinamentosDoCorretor(corretorId).find((t) => t.treinamento.id === id) ?? null;
}

/** Treinamentos que atacam uma competência e que são dessa pessoa. */
export function treinamentosDaCompetenciaDoCorretor(
  corretorId: string,
  competencia: ChaveCompetencia
): TreinamentoDoCorretor[] {
  return treinamentosDoCorretor(corretorId).filter(
    (t) => t.treinamento.competencia === competencia
  );
}

/* ---------- progresso do ciclo ---------- */

export type Progresso = { feitas: number; total: number; porcentagem: number };

/**
 * Quanto do que foi combinado com essa pessoa já saiu do papel. Conta
 * atividade, que é o que ela controla — não treino, que depende de a
 * casa marcar a call.
 */
export function progressoDoCorretor(corretorId: string): Progresso {
  const atividades = atividadesDoCorretor(corretorId);
  const feitas = atividades.filter((a) => a.status === "concluida").length;
  return {
    feitas,
    total: atividades.length,
    porcentagem: atividades.length ? Math.round((feitas / atividades.length) * 100) : 0,
  };
}

/* ---------- próximas ações ---------- */

export type ProximaAcao = {
  tipo: "treinamento" | "atividade";
  titulo: string;
  apoio: string;
  status: StatusAtividade;
  href: string;
};

/**
 * A fila do corretor, na ordem em que ele deve atacar.
 *
 * Gravação de treino ainda não assistido entra na frente das atividades
 * daquele treino: fazer a tarefa sem ter visto a call é o caminho mais
 * curto para fazer errado.
 */
export function proximasAcoes(corretorId: string, limite = 4): ProximaAcao[] {
  const acoes: ProximaAcao[] = [];

  for (const t of treinamentosDoCorretor(corretorId)) {
    if (t.status === "pendente" && t.treinamento.gravacaoUrl) {
      acoes.push({
        tipo: "treinamento",
        titulo: "Assistir ao treinamento",
        apoio: t.treinamento.titulo,
        status: "pendente",
        href: `/meus-treinamentos/${t.treinamento.id}`,
      });
    }
  }

  for (const a of atividadesDoCorretor(corretorId)) {
    if (a.status === "concluida") continue;
    acoes.push({
      tipo: "atividade",
      titulo: a.titulo,
      apoio: a.treinamento.titulo,
      status: a.status,
      href: `/minhas-atividades/${a.id}`,
    });
  }

  return acoes.slice(0, limite);
}

/* ---------- escrita ---------- */

/**
 * O corretor mexe no próprio status e em nada mais. Toda função de
 * escrita exige o corretorId da sessão e confere o dono antes.
 */
function minha(id: string, corretorId: string): Atribuicao | undefined {
  return ATRIBUICOES.find((a) => a.id === id && a.corretorId === corretorId);
}

export function iniciarAtividade(id: string, corretorId: string): boolean {
  const atribuicao = minha(id, corretorId);
  if (!atribuicao || atribuicao.status !== "pendente") return false;
  atribuicao.status = "em-andamento";
  return true;
}

/**
 * Entregar não é concluir: vai para revisão.
 *
 * Quem fecha de verdade é o gestor, pelo checkbox que já existe no
 * treinamento. Deixar o corretor marcar a própria tarefa como concluída
 * transformaria a nota numa autodeclaração, e a nota é o produto.
 */
export function entregarAtividade(
  id: string,
  corretorId: string,
  resposta: string
): { ok: true } | { ok: false; erro: string } {
  const atribuicao = minha(id, corretorId);
  if (!atribuicao) return { ok: false, erro: "Essa atividade não é sua." };
  if (atribuicao.status === "concluida") {
    return { ok: false, erro: "Essa atividade já foi concluída." };
  }

  const texto = resposta.trim();
  if (texto.length < 3) {
    return { ok: false, erro: "Escreva o que você fez antes de enviar." };
  }
  if (texto.length > 4000) {
    return { ok: false, erro: "Passou de 4000 caracteres. Resuma o que fez." };
  }

  atribuicao.resposta = texto;
  atribuicao.status = "aguardando-revisao";
  atribuicao.enviadoEm = new Date().toISOString();
  return { ok: true };
}

/** Quantos treinamentos existem no total, para nunca vazar esse número. */
export function totalNaBiblioteca(): number {
  return listarTreinamentos().length;
}
