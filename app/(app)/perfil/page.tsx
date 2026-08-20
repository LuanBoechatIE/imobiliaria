import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Mail, ShieldCheck } from "lucide-react";
import { UploaderFoto } from "./uploader-foto";
import { COOKIE_SESSAO, lerSessao } from "@/lib/sessao";
import { acharPorId } from "@/lib/usuarios";
import { NOME_PAPEL, acharPessoa, dataCurta } from "@/lib/equipe";

export const metadata: Metadata = { title: "Perfil" };

export default async function PáginaPerfil() {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao) redirect("/entrar");

  const usuario = acharPorId(sessao.id);
  const pessoa = usuario?.pessoaId ? acharPessoa(usuario.pessoaId) : undefined;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-0.5">
        <h1 className="m-0 text-[1.75rem] font-bold leading-tight tracking-tight text-tinta">
          Perfil
        </h1>
        <p className="m-0 text-[0.9rem] text-suave">
          Sua foto aparece no menu e em qualquer lugar do sistema com o seu nome.
        </p>
      </div>

      <section className="rounded-xl border border-linha bg-white p-5">
        <UploaderFoto nome={sessao.nome} fotoInicial={usuario?.foto ?? null} />
      </section>

      <section className="flex flex-col gap-1 rounded-xl border border-linha bg-white p-5">
        <h2 className="m-0 mb-2 text-[1rem] font-bold tracking-tight text-tinta">
          Dados da conta
        </h2>

        <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-3 text-[0.92rem]">
          <span className="text-suave">Nome</span>
          <span className="font-medium text-tinta">{sessao.nome}</span>

          <span className="text-suave">E-mail</span>
          <span className="flex items-center gap-1.5 font-medium text-tinta">
            <Mail size={14} className="text-suave" />
            {usuario?.email}
          </span>

          <span className="text-suave">Papel no sistema</span>
          <span className="flex items-center gap-1.5 font-medium text-tinta">
            <ShieldCheck size={14} className="text-suave" />
            {NOME_PAPEL[sessao.papel]}
          </span>

          {pessoa && (
            <>
              <span className="text-suave">Cargo</span>
              <span className="font-medium text-tinta">{pessoa.cargo}</span>

              <span className="text-suave">Na equipe desde</span>
              <span className="font-medium text-tinta">{dataCurta(pessoa.entrada)}</span>
            </>
          )}
        </div>

        <p className="mt-4 text-[0.8rem] text-suave">
          Nome, e-mail e cargo são editados por quem administra a equipe, em{" "}
          <span className="font-semibold text-tinta-suave">Equipe</span>.
        </p>
      </section>
    </main>
  );
}
