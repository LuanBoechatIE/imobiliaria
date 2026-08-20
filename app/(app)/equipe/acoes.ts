"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  adicionarPessoa,
  alternarStatusPessoa,
  editarPessoa,
  type DadosPessoa,
} from "@/lib/equipe";
import { COOKIE_SESSAO, lerSessao } from "@/lib/sessao";

/** Só dono e gestor mexem na equipe. Corretor nunca. */
async function exigirPermissao() {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao || !["dono", "gestor", "boechat"].includes(sessao.papel)) {
    throw new Error("Sem permissão para alterar a equipe.");
  }
}

function lerFormulario(formData: FormData): DadosPessoa {
  const papel = String(formData.get("papel") ?? "corretor");
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    cargo: String(formData.get("cargo") ?? "").trim(),
    papel: (["dono", "gestor", "corretor"].includes(papel) ? papel : "corretor") as DadosPessoa["papel"],
    entrada: String(formData.get("entrada") ?? new Date().toISOString().slice(0, 10)),
  };
}

export async function salvarPessoa(formData: FormData) {
  await exigirPermissao();

  const id = String(formData.get("id") ?? "");
  const dados = lerFormulario(formData);
  if (!dados.nome || !dados.email) return;

  if (id) editarPessoa(id, dados);
  else adicionarPessoa(dados);

  revalidatePath("/equipe");
}

export async function alternarStatus(formData: FormData) {
  await exigirPermissao();
  const id = String(formData.get("id") ?? "");
  if (id) alternarStatusPessoa(id);
  revalidatePath("/equipe");
  revalidatePath("/painel");
}
