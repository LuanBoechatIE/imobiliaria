import type { Metadata } from "next";
import { FormularioTrocarSenha } from "./formulario";

export const metadata: Metadata = { title: "Trocar senha" };

export default function PáginaTrocarSenha() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-fundo px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-linha bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-laranja text-[0.95rem] font-extrabold text-white">
            B
          </span>
          <span className="text-[0.95rem] font-semibold text-tinta">Boechat</span>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[1.35rem] font-bold tracking-tight text-tinta">
            Primeiro acesso
          </h1>
          <p className="m-0 text-[0.88rem] text-suave">
            Sua conta foi criada com uma senha temporária. Defina uma senha só sua antes
            de continuar.
          </p>
        </div>

        <FormularioTrocarSenha />
      </div>
    </main>
  );
}
