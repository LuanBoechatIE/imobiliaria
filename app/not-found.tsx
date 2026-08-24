import type { Metadata } from "next";
import { BotaoAviso, TelaAviso } from "@/components/tela-aviso";

export const metadata: Metadata = { title: "Página não encontrada" };

export default function NaoEncontrada() {
  return (
    <main className="grid min-h-screen place-items-center bg-fundo">
      <TelaAviso
        titulo="Essa página não existe"
        acao={<BotaoAviso href="/painel" forte>Ir para o painel</BotaoAviso>}
      >
        O endereço pode ter mudado de nome ou o link veio quebrado. O painel continua
        no lugar de sempre.
      </TelaAviso>
    </main>
  );
}
