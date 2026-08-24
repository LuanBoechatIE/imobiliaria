import {
  COMPETENCIAS,
  aplicarAvaliacaoAoCorretor,
  type ChaveCompetencia,
  type Notas,
  type TipoEvidencia,
} from "./dados";
import { acharPessoa, listarPessoas, type Pessoa } from "./equipe";
import { dataNoCicloAtual, rotuloCiclo } from "./ciclos";

/**
 * O ciclo que está sendo coletado é sempre o mês corrente, o mesmo que o
 * painel exibe: avaliação de agosto se coleta em agosto. Era uma string
 * fixa ("Abril 2026") e por isso a coleta continuava apontando para um
 * mês morto enquanto o calendário andava.
 *
 * Função e não constante, pelo mesmo motivo dos getters em `lib/dados.ts`:
 * o módulo carrega uma vez, o mês vira sozinho.
 */
export function cicloAtual(): string {
  return rotuloCiclo(0);
}

export type ItemAvaliacao = {
  nota: number;
  tipo: TipoEvidencia;
  evidencia: string;
};

export type Avaliacao = {
  corretorId: string;
  ciclo: string;
  itens: Partial<Record<ChaveCompetencia, ItemAvaliacao>>;
  concluida: boolean;
  atualizadaEm: string | null;
  avaliadaPor: string | null;
};

export type StatusAvaliacao = "nao-avaliado" | "em-andamento" | "avaliado";

export const ROTULO_STATUS: Record<StatusAvaliacao, string> = {
  "nao-avaliado": "Não avaliado",
  "em-andamento": "Em andamento",
  avaliado: "Avaliado",
};

/**
 * Base em memória, igual ao resto da fase de demonstração.
 *
 * O ciclo destes registros é getter, e não valor: assim a coleta de
 * exemplo acompanha a virada do mês em vez de sumir da tela quando o
 * calendário passa do mês em que o arquivo foi escrito.
 */
const AVALIACOES: Avaliacao[] = [
  {
    corretorId: "ana",
    get ciclo() {
      return cicloAtual();
    },
    concluida: true,
    atualizadaEm: dataNoCicloAtual(10),
    avaliadaPor: "Samuel",
    itens: {
      velocidade: { nota: 9, tipo: "tempo", evidencia: "Mediana de 8 minutos até o primeiro contato em 22 leads." },
      qualificacao: { nota: 9, tipo: "áudio", evidencia: "Levantou crédito, motivo da mudança e prazo nos 5 atendimentos ouvidos." },
      visita: { nota: 9, tipo: "áudio", evidencia: "Confirmou véspera, levou 3 imóveis no perfil e retomou no mesmo dia." },
      followup: { nota: 8, tipo: "registro", evidencia: "Todos os clientes de visita receberam retorno em até 48h." },
      negociacao: { nota: 8, tipo: "role-play", evidencia: "Preparou o proprietário antes de levar a proposta abaixo do pedido." },
      registro: { nota: 9, tipo: "registro", evidencia: "Nenhuma negociação ativa fora do sistema." },
    },
  },
  {
    corretorId: "patricia",
    get ciclo() {
      return cicloAtual();
    },
    concluida: true,
    atualizadaEm: dataNoCicloAtual(9),
    avaliadaPor: "Samuel",
    itens: {
      velocidade: { nota: 7, tipo: "tempo", evidencia: "Mediana de 40 minutos. Cai para 3h nos leads que entram à noite." },
      qualificacao: { nota: 8, tipo: "áudio", evidencia: "Pergunta crédito sempre, mas raramente identifica quem decide junto." },
      visita: { nota: 8, tipo: "áudio", evidencia: "Roteiro preparado e leitura boa de sinal de compra." },
      followup: { nota: 6, tipo: "registro", evidencia: "Cadência existe, mas para no terceiro contato sem resposta." },
      negociacao: { nota: 8, tipo: "role-play", evidencia: "Sustenta preço com comparativo de mercado da região." },
      registro: { nota: 6, tipo: "registro", evidencia: "Registra o negócio, mas raramente atualiza a etapa." },
    },
  },
  {
    corretorId: "ricardo",
    get ciclo() {
      return cicloAtual();
    },
    concluida: false,
    atualizadaEm: dataNoCicloAtual(6),
    avaliadaPor: "Samuel",
    itens: {
      velocidade: { nota: 8, tipo: "tempo", evidencia: "Mediana de 12 minutos. Melhor tempo do time." },
      qualificacao: { nota: 4, tipo: "áudio", evidencia: "Em 4 de 5 atendimentos não perguntou sobre crédito aprovado." },
      followup: { nota: 3, tipo: "registro", evidencia: "9 clientes visitaram imóvel e não receberam nenhum contato depois." },
    },
  },
];

export function corretoresDoCiclo(): Pessoa[] {
  return listarPessoas().filter((p) => p.papel === "corretor" && p.status === "ativo");
}

export function acharAvaliacao(corretorId: string): Avaliacao | undefined {
  return AVALIACOES.find((a) => a.corretorId === corretorId && a.ciclo === cicloAtual());
}

export function statusDe(corretorId: string): StatusAvaliacao {
  const avaliacao = acharAvaliacao(corretorId);
  if (!avaliacao) return "nao-avaliado";
  if (avaliacao.concluida) return "avaliado";
  return Object.keys(avaliacao.itens).length > 0 ? "em-andamento" : "nao-avaliado";
}

export function quantasPreenchidas(corretorId: string): number {
  return Object.keys(acharAvaliacao(corretorId)?.itens ?? {}).length;
}

export function salvarAvaliacao(
  corretorId: string,
  itens: Partial<Record<ChaveCompetencia, ItemAvaliacao>>,
  concluir: boolean,
  avaliadaPor: string
): { ok: boolean; erro?: string } {
  if (concluir) {
    const faltando = COMPETENCIAS.filter((c) => {
      const item = itens[c.chave];
      return !item || item.evidencia.trim() === "";
    });
    if (faltando.length > 0) {
      return {
        ok: false,
        erro: `Falta nota ou evidência em: ${faltando.map((c) => c.nome).join(", ")}.`,
      };
    }
  }

  const existente = acharAvaliacao(corretorId);
  if (existente) {
    existente.itens = itens;
    existente.concluida = concluir;
    existente.atualizadaEm = new Date().toISOString();
    existente.avaliadaPor = avaliadaPor;
  } else {
    AVALIACOES.push({
      corretorId,
      ciclo: cicloAtual(),
      itens,
      concluida: concluir,
      atualizadaEm: new Date().toISOString(),
      avaliadaPor,
    });
  }

  // Avaliação fechada vira a nota que o painel e o perfil do corretor
  // mostram. É o elo que faltava entre coletar e exibir.
  if (concluir) {
    const pessoa = acharPessoa(corretorId);
    const notas = {} as Notas;
    const evidencias: Partial<Record<ChaveCompetencia, { tipo: TipoEvidencia; texto: string; quando: string }>> = {};

    for (const c of COMPETENCIAS) {
      const item = itens[c.chave]!; // salvarAvaliacao já garantiu que todas as 6 existem
      notas[c.chave] = item.nota;
      evidencias[c.chave] = { tipo: item.tipo, texto: item.evidencia, quando: cicloAtual() };
    }

    aplicarAvaliacaoAoCorretor({
      id: corretorId,
      nome: pessoa?.nome ?? corretorId,
      desde: pessoa?.entrada?.slice(0, 4) ?? new Date().getFullYear().toString(),
      notas,
      evidencias,
    });
  }

  return { ok: true };
}

export function resumoDoCiclo() {
  const corretores = corretoresDoCiclo();
  const avaliados = corretores.filter((c) => statusDe(c.id) === "avaliado").length;
  const emAndamento = corretores.filter((c) => statusDe(c.id) === "em-andamento").length;
  const notasLancadas = corretores.reduce((s, c) => s + quantasPreenchidas(c.id), 0);

  return {
    total: corretores.length,
    avaliados,
    emAndamento,
    pendentes: corretores.length - avaliados,
    notasLancadas,
    notasTotais: corretores.length * COMPETENCIAS.length,
  };
}
