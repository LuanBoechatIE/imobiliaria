"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESSAO, assinarSessao, lerSessao } from "@/lib/sessao";
import { conferirSenha, gerarHashSenha } from "@/lib/senha";
import { acharPorId, trocarSenhaUsuario } from "@/lib/usuarios";

export type EstadoTrocarSenha = { erro?: string } | null;

export async function trocarSenha(
  _estado: EstadoTrocarSenha,
  formData: FormData
): Promise<EstadoTrocarSenha> {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao) redirect("/entrar");

  const usuario = acharPorId(sessao.id);
  if (!usuario) redirect("/entrar");

  const atual = String(formData.get("atual") ?? "");
  const nova = String(formData.get("nova") ?? "");
  const confirma = String(formData.get("confirma") ?? "");

  if (!conferirSenha(atual, usuario.senhaHash)) {
    return { erro: "Senha temporária incorreta." };
  }
  if (nova.length < 8) {
    return { erro: "A nova senha precisa de pelo menos 8 caracteres." };
  }
  if (nova !== confirma) {
    return { erro: "A confirmação não bate com a nova senha." };
  }
  if (nova === atual) {
    return { erro: "Escolha uma senha diferente da temporária." };
  }

  trocarSenhaUsuario(usuario.id, gerarHashSenha(nova));

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

  redirect("/painel");
}
