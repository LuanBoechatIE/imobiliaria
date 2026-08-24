"use client";

import { useEffect } from "react";
import { BotaoAviso, TelaAviso } from "@/components/tela-aviso";

/**
 * Rede de segurança da raiz. Pega o que estourar fora da casca do
 * app: tela de entrada, troca de senha e o próprio layout autenticado
 * (que é onde a sessão é lida).
 */
export default function ErroRaiz({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-fundo">
      <TelaAviso
        titulo="O sistema travou nessa hora"
        detalhe={error.digest ? `Código do erro: ${error.digest}` : undefined}
        acao={
          <>
            <BotaoAviso onClick={reset} forte>
              Tentar de novo
            </BotaoAviso>
            <BotaoAviso href="/entrar">Voltar para a entrada</BotaoAviso>
          </>
        }
      >
        Nada do que você digitou foi perdido de propósito, mas essa tela não conseguiu
        carregar. Tente de novo. Se repetir, mande o código abaixo para a Boechat.
      </TelaAviso>
    </main>
  );
}
