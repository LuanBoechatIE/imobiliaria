"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COMPETENCIAS, type ChaveCompetencia, type TipoEvidencia } from "@/lib/dados";
import { salvarAvaliacao, type ItemAvaliacao } from "@/lib/avaliacoes";
import { COOKIE_SESSAO, lerSessao } from "@/lib/sessao";

const TIPOS: TipoEvidencia[] = ["áudio", "tempo", "role-play", "registro"];

/** Quem avalia é a equipe Boechat e o gestor. Corretor nunca avalia. */
export async function gravarAvaliacao(_estado: unknown, formData: FormData) {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao || !["boechat", "gestor", "dono"].includes(sessao.papel)) {
    return { erro: "Você não tem permissão para avaliar." };
  }

  const corretorId = String(formData.get("corretorId") ?? "");
  if (!corretorId) return { erro: "Corretor não informado." };

  const concluir = String(formData.get("acao") ?? "") === "concluir";

  const itens: Partial<Record<ChaveCompetencia, ItemAvaliacao>> = {};
  for (const c of COMPETENCIAS) {
    const bruta = formData.get(`nota-${c.chave}`);
    const evidencia = String(formData.get(`evidencia-${c.chave}`) ?? "").trim();
    if (bruta === null || bruta === "") continue;

    const nota = Number(bruta);
    if (!Number.isFinite(nota) || nota < 0 || nota > 10) continue;

    const tipoBruto = String(formData.get(`tipo-${c.chave}`) ?? "áudio") as TipoEvidencia;
    itens[c.chave] = {
      nota,
      tipo: TIPOS.includes(tipoBruto) ? tipoBruto : "áudio",
      evidencia,
    };
  }

  const resultado = salvarAvaliacao(corretorId, itens, concluir, sessao.nome);
  if (!resultado.ok) return { erro: resultado.erro };

  revalidatePath("/avaliacoes");
  revalidatePath(`/avaliacoes/${corretorId}`);

  if (concluir) redirect("/avaliacoes?ok=1");
  return { salvo: true };
}
