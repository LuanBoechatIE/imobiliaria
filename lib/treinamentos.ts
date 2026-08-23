import { COMPETENCIAS, type ChaveCompetencia } from "./dados";

export type CompetenciaOuGeral = ChaveCompetencia | "geral";

export type StatusTreinamento = "agendado" | "realizado" | "cancelado";

export const ROTULO_STATUS_TREINAMENTO: Record<StatusTreinamento, string> = {
  agendado: "Agendado",
  realizado: "Realizado",
  cancelado: "Cancelado",
};

export type Material = { id: string; nome: string; url: string };
export type Atividade = { id: string; titulo: string; concluida: boolean };

export type Treinamento = {
  id: string;
  titulo: string;
  competencia: CompetenciaOuGeral;
  descricao: string;
  data: string; // ISO, yyyy-mm-dd
  participantesIds: string[];
  /** Link pra onde a gravação mora (Drive, YouTube não listado, Loom...). */
  gravacaoUrl: string | null;
  materiais: Material[];
  atividades: Atividade[];
  status: StatusTreinamento;
  criadoPor: string;
  criadoEm: string; // ISO datetime
};

export function nomeCompetencia(c: CompetenciaOuGeral): string {
  if (c === "geral") return "Geral";
  return COMPETENCIAS.find((x) => x.chave === c)?.nome ?? c;
}

/**
 * Base provisória, em memória — mesmo regime do resto do sistema.
 * Some a cada reinício, some com o próximo deploy. Vira banco quando
 * existir cliente pagando.
 */
const TREINAMENTOS: Treinamento[] = [
  {
    id: "follow-up-que-nao-morre",
    titulo: "Follow-up que não morre no terceiro contato",
    competencia: "followup",
    descricao:
      "Cadência de retorno por temperatura de lead, o que fazer com quem parou de responder, e como reabrir negócio frio sem soar desesperado.",
    data: "2026-08-05",
    participantesIds: ["ricardo", "marcos", "eduardo", "silvia"],
    gravacaoUrl: "https://drive.google.com/drive/folders/exemplo-followup-05ago",
    materiais: [
      { id: "m1", nome: "Roteiro de retomada (PDF)", url: "https://drive.google.com/exemplo-roteiro" },
      { id: "m2", nome: "Planilha de cadência por temperatura", url: "https://docs.google.com/exemplo-planilha" },
    ],
    atividades: [
      { id: "a1", titulo: "Cada um listar 3 negócios frios da própria carteira", concluida: true },
      { id: "a2", titulo: "Role-play de reabertura na próxima call", concluida: false },
    ],
    status: "realizado",
    criadoPor: "Samuel",
    criadoEm: "2026-08-05T19:30:00",
  },
  {
    id: "qualificacao-antes-da-visita",
    titulo: "Qualificação antes da visita: crédito, urgência, decisor",
    competencia: "qualificacao",
    descricao:
      "As três perguntas que faltam antes de marcar visita. Baseado nos áudios ouvidos no Raio-X, onde a maioria pulava direto pro agendamento.",
    data: "2026-08-12",
    participantesIds: ["ricardo", "eduardo", "juliana"],
    gravacaoUrl: "https://drive.google.com/drive/folders/exemplo-qualificacao-12ago",
    materiais: [
      { id: "m3", nome: "Checklist de qualificação", url: "https://drive.google.com/exemplo-checklist" },
    ],
    atividades: [
      { id: "a3", titulo: "Aplicar o checklist nos próximos 5 leads e trazer pra revisão", concluida: false },
    ],
    status: "realizado",
    criadoPor: "Samuel",
    criadoEm: "2026-08-12T20:00:00",
  },
  {
    id: "rotina-do-gestor",
    titulo: "Rotina do gestor: 1:1, leitura de painel e plano de ação",
    competencia: "geral",
    descricao:
      "Módulo obrigatório antes de qualquer treino de corretor. Como conduzir a reunião individual semanal, ler as seis competências no painel e transformar nota baixa em plano de ação com prazo.",
    data: "2026-08-28",
    participantesIds: ["renata"],
    gravacaoUrl: null,
    materiais: [],
    atividades: [
      { id: "a4", titulo: "Trazer a nota da equipe atualizada pra sessão", concluida: false },
    ],
    status: "agendado",
    criadoPor: "Luan",
    criadoEm: "2026-08-20T09:00:00",
  },
];

function gerarId(titulo: string): string {
  const base = titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  let id = base || "treinamento";
  let n = 2;
  while (TREINAMENTOS.some((t) => t.id === id)) id = `${base}-${n++}`;
  return id;
}

function gerarIdCurto(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function listarTreinamentos(): Treinamento[] {
  return [...TREINAMENTOS].sort((a, b) => (a.data < b.data ? 1 : -1));
}

export function acharTreinamento(id: string): Treinamento | undefined {
  return TREINAMENTOS.find((t) => t.id === id);
}

/** Treinamentos de que a pessoa participou, do mais recente para o mais antigo. */
export function treinamentosDaPessoa(pessoaId: string): Treinamento[] {
  return listarTreinamentos().filter(
    (t) => t.status !== "cancelado" && t.participantesIds.includes(pessoaId)
  );
}

/** Treinamentos que atacam uma competência específica. */
export function treinamentosDaCompetencia(competencia: CompetenciaOuGeral): Treinamento[] {
  return listarTreinamentos().filter(
    (t) => t.status !== "cancelado" && t.competencia === competencia
  );
}

export type DadosTreinamento = {
  titulo: string;
  competencia: CompetenciaOuGeral;
  descricao: string;
  data: string;
  participantesIds: string[];
  gravacaoUrl: string | null;
};

export function adicionarTreinamento(
  dados: DadosTreinamento,
  criadoPor: string,
  status: StatusTreinamento
): Treinamento {
  const treinamento: Treinamento = {
    id: gerarId(dados.titulo),
    ...dados,
    materiais: [],
    atividades: [],
    status,
    criadoPor,
    criadoEm: new Date().toISOString(),
  };
  TREINAMENTOS.push(treinamento);
  return treinamento;
}

export function editarTreinamento(
  id: string,
  dados: DadosTreinamento
): Treinamento | undefined {
  const treinamento = TREINAMENTOS.find((t) => t.id === id);
  if (!treinamento) return undefined;
  Object.assign(treinamento, dados);
  return treinamento;
}

export function definirStatusTreinamento(
  id: string,
  status: StatusTreinamento
): Treinamento | undefined {
  const treinamento = TREINAMENTOS.find((t) => t.id === id);
  if (!treinamento) return undefined;
  treinamento.status = status;
  return treinamento;
}

export function adicionarMaterial(
  treinamentoId: string,
  material: { nome: string; url: string }
): Treinamento | undefined {
  const treinamento = TREINAMENTOS.find((t) => t.id === treinamentoId);
  if (!treinamento) return undefined;
  treinamento.materiais.push({ id: gerarIdCurto(), ...material });
  return treinamento;
}

export function removerMaterial(treinamentoId: string, materialId: string): void {
  const treinamento = TREINAMENTOS.find((t) => t.id === treinamentoId);
  if (!treinamento) return;
  treinamento.materiais = treinamento.materiais.filter((m) => m.id !== materialId);
}

export function adicionarAtividade(treinamentoId: string, titulo: string): void {
  const treinamento = TREINAMENTOS.find((t) => t.id === treinamentoId);
  if (!treinamento) return;
  treinamento.atividades.push({ id: gerarIdCurto(), titulo, concluida: false });
}

export function alternarAtividade(treinamentoId: string, atividadeId: string): void {
  const treinamento = TREINAMENTOS.find((t) => t.id === treinamentoId);
  const atividade = treinamento?.atividades.find((a) => a.id === atividadeId);
  if (atividade) atividade.concluida = !atividade.concluida;
}

export function removerAtividade(treinamentoId: string, atividadeId: string): void {
  const treinamento = TREINAMENTOS.find((t) => t.id === treinamentoId);
  if (!treinamento) return;
  treinamento.atividades = treinamento.atividades.filter((a) => a.id !== atividadeId);
}
