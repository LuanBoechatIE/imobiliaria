"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESSAO, lerSessao } from "@/lib/sessao";
import { definirFoto } from "@/lib/usuarios";

const LIMITE_BYTES = 1_800_000; // ~1,8 MB de data URL, folga acima do que o recorte no cliente gera

export async function atualizarFoto(dataUrl: string | null) {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao) redirect("/entrar");

  if (dataUrl && (!dataUrl.startsWith("data:image/") || dataUrl.length > LIMITE_BYTES)) {
    return { erro: "Imagem inválida ou grande demais." };
  }

  definirFoto(sessao.id, dataUrl);
  revalidatePath("/perfil");
  // O corretor usa o mesmo recortador em /meu-perfil, que é outra rota.
  revalidatePath("/meu-perfil");
  revalidatePath("/", "layout");
  return { ok: true };
}
