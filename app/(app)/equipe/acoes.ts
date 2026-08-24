"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  adicionarPessoa,
  alternarStatusPessoa,
  editarPessoa,
  type DadosPessoa,
} from "@/lib/equipe";
import { COOKIE_SESSAO, lerSessao, type Sessao } from "@/lib/sessao";
import { gerarHashSenha, gerarSenhaTemporaria } from "@/lib/senha";
import { criarUsuario, emailEmUso, sincronizarUsuario } from "@/lib/usuarios";

export type EstadoPessoa = {
  erro?: string;
  ok?: boolean;
  /** Só existe uma vez, na resposta da criação. Nunca é regravado depois. */
  senhaTemporaria?: string;
  emailCriado?: string;
} | null;

const SEM_PERMISSAO = "Seu acesso não permite alterar a equipe.";

/**
 * Só dono, gestor e equipe Boechat mexem na equipe. Corretor nunca.
 *
 * Devolve null em vez de lançar: quem chama transforma isso em recado
 * na tela. Exceção aqui derrubaria a rota inteira na fronteira de erro
 * por causa de um clique que a pessoa nem podia ter dado.
 */
async function sessaoPermitida(): Promise<Sessao | null> {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao || !["dono", "gestor", "boechat"].includes(sessao.papel)) return null;
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

/** Limites do que cabe no cartão da lista sem virar parágrafo. */
const MAX_NOME = 80;
const MAX_CARGO = 40;
const MAX_EMAIL = 120;

export async function salvarPessoa(
  _estado: EstadoPessoa,
  formData: FormData
): Promise<EstadoPessoa> {
  const sessao = await sessaoPermitida();
  if (!sessao) return { erro: SEM_PERMISSAO };

  const id = String(formData.get("id") ?? "");
  const dados = lerFormulario(formData);

  if (!dados.nome || !dados.email) return { erro: "Nome e e-mail são obrigatórios." };
  if (dados.nome.length > MAX_NOME) {
    return { erro: `O nome passou de ${MAX_NOME} caracteres. Use o nome de uso.` };
  }
  if (dados.email.length > MAX_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    return { erro: "Esse e-mail não parece válido. Confira e tente de novo." };
  }
  if (dados.cargo.length > MAX_CARGO) {
    return { erro: `O cargo passou de ${MAX_CARGO} caracteres. Encurte o título.` };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.entrada) || Number.isNaN(Date.parse(dados.entrada))) {
    return { erro: "A data de entrada não é uma data válida." };
  }
  if (dados.entrada > new Date().toISOString().slice(0, 10)) {
    return { erro: "A data de entrada não pode ser no futuro." };
  }

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

export type ResultadoAcao = { ok: true } | { ok: false; erro: string };

export async function alternarStatus(formData: FormData): Promise<ResultadoAcao> {
  if (!(await sessaoPermitida())) return { ok: false, erro: SEM_PERMISSAO };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, erro: "Pessoa não informada." };
  if (!alternarStatusPessoa(id)) {
    return { ok: false, erro: "Essa pessoa não está mais na equipe. Atualize a página." };
  }

  revalidatePath("/equipe");
  revalidatePath("/painel");
  return { ok: true };
}
