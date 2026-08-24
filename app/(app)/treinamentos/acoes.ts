"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  adicionarAtividade,
  adicionarMaterial,
  adicionarTreinamento,
  alternarAtividade,
  definirStatusTreinamento,
  editarTreinamento,
  removerAtividade,
  removerMaterial,
  type CompetenciaOuGeral,
  type DadosTreinamento,
  type StatusTreinamento,
} from "@/lib/treinamentos";
import { COMPETENCIAS } from "@/lib/dados";
import { COOKIE_SESSAO, lerSessao, type Sessao } from "@/lib/sessao";

export type EstadoTreinamento = { erro?: string; ok?: boolean } | null;
export type ResultadoAcao = { ok: true } | { ok: false; erro: string };

const SEM_PERMISSAO = "Seu acesso não permite mexer em treinamentos.";

/**
 * Só dono, gestor e equipe Boechat registram treinamento. Corretor só vê.
 *
 * Devolve null em vez de lançar: o clique sem permissão vira recado na
 * tela, não fronteira de erro em cima da página inteira.
 */
async function sessaoPermitida(): Promise<Sessao | null> {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao || !["dono", "gestor", "boechat"].includes(sessao.papel)) return null;
  return sessao;
}

const COMPETENCIAS_VALIDAS = new Set<string>([...COMPETENCIAS.map((c) => c.chave), "geral"]);

/** Limites do que o cartão e a lista aguentam sem virar parede de texto. */
const MAX_TITULO = 120;
const MAX_DESCRICAO = 2000;
const MAX_NOME_MATERIAL = 80;
const MAX_URL = 2048;

function lerFormulario(formData: FormData): DadosTreinamento {
  const competencia = String(formData.get("competencia") ?? "geral");
  const gravacaoUrl = String(formData.get("gravacaoUrl") ?? "").trim();
  return {
    titulo: String(formData.get("titulo") ?? "").trim(),
    competencia: (COMPETENCIAS_VALIDAS.has(competencia) ? competencia : "geral") as CompetenciaOuGeral,
    descricao: String(formData.get("descricao") ?? "").trim(),
    data: String(formData.get("data") ?? new Date().toISOString().slice(0, 10)),
    participantesIds: formData.getAll("participantes").map(String),
    gravacaoUrl: gravacaoUrl || null,
  };
}

/** Só http e https entram como link clicável. */
function linkAceito(url: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

export async function salvarTreinamento(
  _estado: EstadoTreinamento,
  formData: FormData
): Promise<EstadoTreinamento> {
  const sessao = await sessaoPermitida();
  if (!sessao) return { erro: SEM_PERMISSAO };

  const id = String(formData.get("id") ?? "");
  const dados = lerFormulario(formData);

  if (!dados.titulo) return { erro: "Dá um título pro treinamento." };
  if (dados.titulo.length > MAX_TITULO) {
    return { erro: `O título passou de ${MAX_TITULO} caracteres. Encurte.` };
  }
  if (dados.descricao.length > MAX_DESCRICAO) {
    return { erro: `A descrição passou de ${MAX_DESCRICAO} caracteres.` };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.data) || Number.isNaN(Date.parse(dados.data))) {
    return { erro: "A data do treinamento não é uma data válida." };
  }
  if (dados.participantesIds.length === 0) {
    return { erro: "Escolhe pelo menos um participante." };
  }
  if (dados.gravacaoUrl && !linkAceito(dados.gravacaoUrl)) {
    return { erro: "O link da gravação precisa começar com http:// ou https://." };
  }

  if (id) {
    const treinamento = editarTreinamento(id, dados);
    if (!treinamento) return { erro: "Treinamento não encontrado." };
  } else {
    const status: StatusTreinamento =
      dados.data > new Date().toISOString().slice(0, 10) ? "agendado" : "realizado";
    adicionarTreinamento(dados, sessao.nome, status);
  }

  revalidatePath("/treinamentos");
  return { ok: true };
}

export async function mudarStatus(formData: FormData): Promise<ResultadoAcao> {
  if (!(await sessaoPermitida())) return { ok: false, erro: SEM_PERMISSAO };

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as StatusTreinamento;
  if (!id || !["agendado", "realizado", "cancelado"].includes(status)) {
    return { ok: false, erro: "Status inválido." };
  }

  definirStatusTreinamento(id, status);
  revalidatePath("/treinamentos");
  revalidatePath(`/treinamentos/${id}`);
  return { ok: true };
}

export async function salvarMaterial(formData: FormData): Promise<ResultadoAcao> {
  if (!(await sessaoPermitida())) return { ok: false, erro: SEM_PERMISSAO };

  const treinamentoId = String(formData.get("treinamentoId") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!treinamentoId) return { ok: false, erro: "Treinamento não informado." };
  if (!nome) return { ok: false, erro: "Dá um nome pro material." };
  if (nome.length > MAX_NOME_MATERIAL) {
    return { ok: false, erro: `O nome passou de ${MAX_NOME_MATERIAL} caracteres.` };
  }
  if (url.length > MAX_URL || !linkAceito(url)) {
    return { ok: false, erro: "O link precisa começar com http:// ou https://." };
  }

  adicionarMaterial(treinamentoId, { nome, url });
  revalidatePath(`/treinamentos/${treinamentoId}`);
  return { ok: true };
}

export async function excluirMaterial(formData: FormData): Promise<ResultadoAcao> {
  if (!(await sessaoPermitida())) return { ok: false, erro: SEM_PERMISSAO };

  const treinamentoId = String(formData.get("treinamentoId") ?? "");
  const materialId = String(formData.get("materialId") ?? "");
  if (!treinamentoId || !materialId) return { ok: false, erro: "Material não informado." };

  removerMaterial(treinamentoId, materialId);
  revalidatePath(`/treinamentos/${treinamentoId}`);
  return { ok: true };
}

export async function salvarAtividade(formData: FormData): Promise<ResultadoAcao> {
  if (!(await sessaoPermitida())) return { ok: false, erro: SEM_PERMISSAO };

  const treinamentoId = String(formData.get("treinamentoId") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();

  if (!treinamentoId) return { ok: false, erro: "Treinamento não informado." };
  if (!titulo) return { ok: false, erro: "Escreve o que é a atividade." };
  if (titulo.length > MAX_TITULO) {
    return { ok: false, erro: `A atividade passou de ${MAX_TITULO} caracteres.` };
  }

  adicionarAtividade(treinamentoId, titulo);
  revalidatePath(`/treinamentos/${treinamentoId}`);
  return { ok: true };
}

export async function marcarAtividade(formData: FormData): Promise<ResultadoAcao> {
  if (!(await sessaoPermitida())) return { ok: false, erro: SEM_PERMISSAO };

  const treinamentoId = String(formData.get("treinamentoId") ?? "");
  const atividadeId = String(formData.get("atividadeId") ?? "");
  if (!treinamentoId || !atividadeId) return { ok: false, erro: "Atividade não informada." };

  alternarAtividade(treinamentoId, atividadeId);
  revalidatePath(`/treinamentos/${treinamentoId}`);
  return { ok: true };
}

export async function excluirAtividade(formData: FormData): Promise<ResultadoAcao> {
  if (!(await sessaoPermitida())) return { ok: false, erro: SEM_PERMISSAO };

  const treinamentoId = String(formData.get("treinamentoId") ?? "");
  const atividadeId = String(formData.get("atividadeId") ?? "");
  if (!treinamentoId || !atividadeId) return { ok: false, erro: "Atividade não informada." };

  removerAtividade(treinamentoId, atividadeId);
  revalidatePath(`/treinamentos/${treinamentoId}`);
  return { ok: true };
}
