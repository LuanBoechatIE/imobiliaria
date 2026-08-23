import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Casca } from "./casca";
import { sair } from "../entrar/acoes";
import { COOKIE_SESSAO, lerSessao } from "@/lib/sessao";
import { acharPorId } from "@/lib/usuarios";
import { IMOBILIARIA } from "@/lib/dados";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao) redirect("/entrar");

  const foto = acharPorId(sessao.id)?.foto ?? null;

  return (
    <Casca
      nome={sessao.nome}
      papel={sessao.papel}
      foto={foto}
      ciclo={IMOBILIARIA.ciclo}
      sair={sair}
    >
      {children}
    </Casca>
  );
}
