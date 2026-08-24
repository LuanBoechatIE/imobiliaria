import { toast } from "sonner";

export type ResultadoAcao = { ok: true } | { ok: false; erro: string };

/**
 * Envelope para Server Action de resposta curta, chamada de dentro de
 * um clique. Cobre os três desfechos que existem de verdade: deu certo,
 * o servidor recusou, ou a chamada nem chegou lá (aba offline, deploy
 * no meio, sessão expirada).
 *
 * Existe porque o padrão anterior era `await acao()` seguido de toast de
 * sucesso incondicional: a pessoa via "salvo" mesmo quando nada tinha
 * sido salvo, e só descobria ao recarregar a página.
 */
export async function executar(
  chamada: () => Promise<ResultadoAcao>,
  sucesso?: { titulo: string; descricao?: string }
): Promise<boolean> {
  try {
    const resultado = await chamada();

    if (!resultado.ok) {
      toast.error(resultado.erro);
      return false;
    }

    if (sucesso) toast.success(sucesso.titulo, { description: sucesso.descricao });
    return true;
  } catch {
    toast.error("Não consegui salvar", {
      description: "A conexão caiu no meio. Confira a internet e tente de novo.",
    });
    return false;
  }
}
