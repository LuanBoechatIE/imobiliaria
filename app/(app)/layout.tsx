import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Casca } from "./casca";
import { sair } from "../entrar/acoes";
import { COOKIE_SESSAO, lerSessao } from "@/lib/sessao";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao) redirect("/entrar");

  return (
    <Casca nome={sessao.nome} papel={sessao.papel} sair={sair}>
      {children}
    </Casca>
  );
}
