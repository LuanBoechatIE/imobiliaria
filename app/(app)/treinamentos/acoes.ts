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
import { COOKIE_SESSAO, lerSessao } from "@/lib/sessao";

export type EstadoTreinamento = { erro?: string; ok?: boolean } | null;

/** Só dono, gestor e equipe Boechat registram treinamento. Corretor só vê. */
async function exigirPermissao() {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao || !["dono", "gestor", "boechat"].includes(sessao.papel)) {
    throw new Error("Sem permissão para mexer em treinamentos.");
  }
  return sessao;
}

const COMPETENCIAS_VALIDAS = new Set<string>([...COMPETENCIAS.map((c) => c.chave), "geral"]);

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

export async function salvarTreinamento(
  _estado: EstadoTreinamento,
  formData: FormData
): Promise<EstadoTreinamento> {
  const sessao = await exigirPermissao();

  const id = String(formData.get("id") ?? "");
  const dados = lerFormulario(formData);

  if (!dados.titulo) return { erro: "Dá um título pro treinamento." };
  if (dados.participantesIds.length === 0) {
    return { erro: "Escolhe pelo menos um participante." };
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

export async function mudarStatus(formData: FormData) {
  await exigirPermissao();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as StatusTreinamento;
  if (id && ["agendado", "realizado", "cancelado"].includes(status)) {
    definirStatusTreinamento(id, status);
  }
  revalidatePath("/treinamentos");
  revalidatePath(`/treinamentos/${id}`);
}

export async function salvarMaterial(formData: FormData) {
  await exigirPermissao();
  const treinamentoId = String(formData.get("treinamentoId") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (treinamentoId && nome && url) adicionarMaterial(treinamentoId, { nome, url });
  revalidatePath(`/treinamentos/${treinamentoId}`);
}

export async function excluirMaterial(formData: FormData) {
  await exigirPermissao();
  const treinamentoId = String(formData.get("treinamentoId") ?? "");
  const materialId = String(formData.get("materialId") ?? "");
  if (treinamentoId && materialId) removerMaterial(treinamentoId, materialId);
  revalidatePath(`/treinamentos/${treinamentoId}`);
}

export async function salvarAtividade(formData: FormData) {
  await exigirPermissao();
  const treinamentoId = String(formData.get("treinamentoId") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (treinamentoId && titulo) adicionarAtividade(treinamentoId, titulo);
  revalidatePath(`/treinamentos/${treinamentoId}`);
}

export async function marcarAtividade(formData: FormData) {
  await exigirPermissao();
  const treinamentoId = String(formData.get("treinamentoId") ?? "");
  const atividadeId = String(formData.get("atividadeId") ?? "");
  if (treinamentoId && atividadeId) alternarAtividade(treinamentoId, atividadeId);
  revalidatePath(`/treinamentos/${treinamentoId}`);
}

export async function excluirAtividade(formData: FormData) {
  await exigirPermissao();
  const treinamentoId = String(formData.get("treinamentoId") ?? "");
  const atividadeId = String(formData.get("atividadeId") ?? "");
  if (treinamentoId && atividadeId) removerAtividade(treinamentoId, atividadeId);
  revalidatePath(`/treinamentos/${treinamentoId}`);
}
