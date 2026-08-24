"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESSAO, assinarSessao } from "@/lib/sessao";
import { conferirSenha } from "@/lib/senha";
import { acharPorEmail } from "@/lib/usuarios";

/**
 * Tetos de entrada. `conferirSenha` roda scrypt, que é caro de
 * propósito: sem limite, um campo colado com megabytes de texto vira
 * carga de CPU no servidor a cada tentativa.
 */
const MAX_EMAIL = 120;
const MAX_SENHA = 200;

export async function entrar(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const de = String(formData.get("de") ?? "");

  const falhou = () => {
    const qs = new URLSearchParams({ erro: "1" });
    if (de) qs.set("de", de);
    redirect(`/entrar?${qs.toString()}`);
  };

  if (!email || !senha) falhou();
  if (email.length > MAX_EMAIL || senha.length > MAX_SENHA) falhou();

  const usuario = acharPorEmail(email);

  // Mesma resposta para e-mail inexistente e senha errada, para não
  // revelar quais e-mails existem.
  if (!usuario || !conferirSenha(senha, usuario.senhaHash)) falhou();

  const { valor, expiraEm } = await assinarSessao({
    id: usuario!.id,
    nome: usuario!.nome,
    papel: usuario!.papel,
    imobiliariaId: usuario!.imobiliariaId,
    deveTrocarSenha: usuario!.deveTrocarSenha,
  });

  const jar = await cookies();
  jar.set(COOKIE_SESSAO, valor, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiraEm,
  });

  if (usuario!.deveTrocarSenha) redirect("/trocar-senha");

  // `de` vem da URL. Só caminho interno passa: "//outro.site" também
  // começa com barra e o navegador o trata como endereço externo.
  const interno = de.startsWith("/") && !de.startsWith("//") && !de.startsWith("/\\");
  redirect(interno ? de : "/painel");
}

export async function sair() {
  const jar = await cookies();
  jar.delete(COOKIE_SESSAO);
  redirect("/entrar");
}
