"use server";

import { cookies } from "next/headers";
import { COOKIE_SESSAO, assinarSessao, lerSessao } from "@/lib/sessao";
import { conferirSenha, gerarHashSenha } from "@/lib/senha";
import { acharPorId, trocarSenhaUsuario } from "@/lib/usuarios";

export type EstadoSenha = { erro?: string; ok?: boolean } | null;

/**
 * Troca de senha de dentro do sistema, para quem já entrou.
 *
 * Diferente de /trocar-senha, que é o primeiro acesso e termina em
 * navegação: aqui a pessoa está no meio de uma tarefa, então o resultado
 * volta como recado na própria tela.
 *
 * A senha trocada é sempre a de quem está logado — o id vem da sessão e
 * não do formulário.
 */
export async function alterarMinhaSenha(
  _estado: EstadoSenha,
  formData: FormData
): Promise<EstadoSenha> {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao) return { erro: "Sua sessão expirou. Entre de novo." };

  const usuario = acharPorId(sessao.id);
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };

  const atual = String(formData.get("atual") ?? "");
  const nova = String(formData.get("nova") ?? "");
  const confirma = String(formData.get("confirma") ?? "");

  if (!conferirSenha(atual, usuario.senhaHash)) {
    return { erro: "Senha atual incorreta." };
  }
  if (nova.length < 8) {
    return { erro: "A nova senha precisa de pelo menos 8 caracteres." };
  }
  if (nova.length > 200) {
    return { erro: "A nova senha passou de 200 caracteres." };
  }
  if (nova !== confirma) {
    return { erro: "A confirmação não bate com a nova senha." };
  }
  if (nova === atual) {
    return { erro: "Escolha uma senha diferente da atual." };
  }

  trocarSenhaUsuario(usuario.id, gerarHashSenha(nova));

  // A sessão é reassinada para não continuar carregando um estado que
  // deixou de ser verdade depois da troca.
  const { valor, expiraEm } = await assinarSessao({
    id: usuario.id,
    nome: usuario.nome,
    papel: usuario.papel,
    imobiliariaId: usuario.imobiliariaId,
    deveTrocarSenha: false,
  });

  jar.set(COOKIE_SESSAO, valor, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiraEm,
  });

  return { ok: true };
}
