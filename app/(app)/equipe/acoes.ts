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
import { gerarHashSenha, gerarSenhaTemporaria } from "@/lib/senha";
import { acharPorPessoaId, criarUsuario, emailEmUso, sincronizarUsuario } from "@/lib/usuarios";

export type EstadoPessoa = {
  erro?: string;
  ok?: boolean;
  /** Só existe uma vez, na resposta da criação. Nunca é regravado depois. */
  senhaTemporaria?: string;
  emailCriado?: string;
} | null;

/** Só dono, gestor e equipe Boechat mexem na equipe. Corretor nunca. */
async function exigirPermissao() {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao || !["dono", "gestor", "boechat"].includes(sessao.papel)) {
    throw new Error("Sem permissão para alterar a equipe.");
  }
  return sessao;
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

export async function salvarPessoa(
  _estado: EstadoPessoa,
  formData: FormData
): Promise<EstadoPessoa> {
  const sessao = await exigirPermissao();

  const id = String(formData.get("id") ?? "");
  const dados = lerFormulario(formData);
  if (!dados.nome || !dados.email) return { erro: "Nome e e-mail são obrigatórios." };

  if (emailEmUso(dados.email, id ? `u-${id}` : undefined)) {
    return { erro: "Já existe alguém na equipe com esse e-mail." };
  }

  if (id) {
    const pessoa = editarPessoa(id, dados);
    if (!pessoa) return { erro: "Pessoa não encontrada." };

    // Mantém o login em dia se nome, e-mail ou papel mudaram na edição.
    sincronizarUsuario(id, { nome: dados.nome, email: dados.email, papel: dados.papel });

    revalidatePath("/equipe");
    return { ok: true };
  }

  const pessoa = adicionarPessoa(dados);

  // Toda pessoa nova ganha login: senha temporária, hash, obrigada a
  // trocar no primeiro acesso (middleware força /trocar-senha).
  const senhaTemporaria = gerarSenhaTemporaria();
  criarUsuario({
    pessoaId: pessoa.id,
    nome: pessoa.nome,
    email: pessoa.email,
    papel: pessoa.papel,
    imobiliariaId: sessao.imobiliariaId,
    senhaHash: gerarHashSenha(senhaTemporaria),
  });

  revalidatePath("/equipe");
  return { ok: true, senhaTemporaria, emailCriado: pessoa.email };
}

export async function alternarStatus(formData: FormData) {
  await exigirPermissao();
  const id = String(formData.get("id") ?? "");
  if (id) alternarStatusPessoa(id);
  revalidatePath("/equipe");
  revalidatePath("/painel");
}
