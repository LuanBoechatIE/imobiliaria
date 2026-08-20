import { COMPETENCIAS, type ChaveCompetencia, type TipoEvidencia } from "./dados";
import { listarPessoas, type Pessoa } from "./equipe";

/** Ciclo que está sendo coletado agora. O painel mostra o ciclo já fechado. */
export const CICLO_ATUAL = "Abril 2026";

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

/** Base em memória, igual ao resto da fase de demonstração. */
const AVALIACOES: Avaliacao[] = [
  {
    corretorId: "ana",
    ciclo: CICLO_ATUAL,
    concluida: true,
    atualizadaEm: "2026-08-14T15:20:00",
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
    ciclo: CICLO_ATUAL,
    concluida: true,
    atualizadaEm: "2026-08-15T10:05:00",
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
    ciclo: CICLO_ATUAL,
    concluida: false,
    atualizadaEm: "2026-08-18T16:40:00",
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
  return AVALIACOES.find((a) => a.corretorId === corretorId && a.ciclo === CICLO_ATUAL);
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
      ciclo: CICLO_ATUAL,
      itens,
      concluida: concluir,
      atualizadaEm: new Date().toISOString(),
      avaliadaPor,
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
