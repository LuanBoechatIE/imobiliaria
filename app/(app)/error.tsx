"use client";

import { useEffect } from "react";
import { BotaoAviso, TelaAviso } from "@/components/tela-aviso";

/**
 * Erro dentro da casca. O menu lateral segue de pé, então a falha de
 * uma tela não derruba a navegação inteira: dá para pular para outra
 * área sem recarregar nada.
 */
export default function ErroApp({
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
    <TelaAviso
      titulo="Essa tela não carregou"
      detalhe={error.digest ? `Código do erro: ${error.digest}` : undefined}
      acao={
        <>
          <BotaoAviso onClick={reset} forte>
            Tentar de novo
          </BotaoAviso>
          <BotaoAviso href="/painel">Voltar ao painel</BotaoAviso>
        </>
      }
    >
      O resto do sistema continua funcionando, é só esta parte que falhou. Tente de
      novo. Se repetir, mande o código abaixo para a Boechat.
    </TelaAviso>
  );
}
