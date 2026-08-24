"use server";

import { revalidatePath } from "next/cache";
import { corretorDaSessao } from "@/lib/corretor";
import { entregarAtividade, iniciarAtividade } from "@/lib/atividades-corretor";

export type ResultadoAcao = { ok: true } | { ok: false; erro: string };

const SEM_PERMISSAO = "Essa atividade não é sua.";

/**
 * As duas únicas escritas que o corretor faz no sistema.
 *
 * O id de quem escreve vem sempre da sessão, nunca do formulário — se
 * viesse do formulário, trocar um campo escondido no navegador entregaria
 * a atividade do colega. E o dono é conferido de novo dentro de
 * lib/atividades-corretor.ts, porque uma checagem só, no lugar errado,
 * é o mesmo que nenhuma.
 */

export async function comecarAtividade(dados: FormData): Promise<ResultadoAcao> {
  const pessoa = await corretorDaSessao();
  if (!pessoa) return { ok: false, erro: SEM_PERMISSAO };

  const id = String(dados.get("id") ?? "");
  if (!iniciarAtividade(id, pessoa.id)) {
    return { ok: false, erro: "Não consegui iniciar essa atividade." };
  }

  revalidatePath("/minhas-atividades");
  revalidatePath(`/minhas-atividades/${id}`);
  revalidatePath("/meu-painel");
  return { ok: true };
}

export async function enviarAtividade(dados: FormData): Promise<ResultadoAcao> {
  const pessoa = await corretorDaSessao();
  if (!pessoa) return { ok: false, erro: SEM_PERMISSAO };

  const id = String(dados.get("id") ?? "");
  const resposta = String(dados.get("resposta") ?? "");

  const resultado = entregarAtividade(id, pessoa.id, resposta);
  if (!resultado.ok) return resultado;

  revalidatePath("/minhas-atividades");
  revalidatePath(`/minhas-atividades/${id}`);
  revalidatePath("/meu-painel");
  revalidatePath("/meus-treinamentos");
  return { ok: true };
}
