import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Formulario } from "./formulario";
import { CICLO_ATUAL, ROTULO_STATUS, acharAvaliacao, statusDe } from "@/lib/avaliacoes";
import { acharPessoa, dataCurta } from "@/lib/equipe";

export const metadata: Metadata = { title: "Avaliar corretor" };

export default async function PáginaAvaliar({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pessoa = acharPessoa(id);
  if (!pessoa || pessoa.papel !== "corretor") notFound();

  const avaliacao = acharAvaliacao(id);
  const status = statusDe(id);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 lg:px-8 lg:py-8">
      <Link
        href="/avaliacoes"
        className="w-fit text-[0.87rem] font-semibold text-suave no-underline transition-colors hover:text-laranja-escuro"
      >
        ← Voltar para o ciclo
      </Link>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-linha bg-white px-4 py-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-laranja-suave text-[1.3rem] font-bold text-laranja-escuro">
          {pessoa.nome.charAt(0)}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h1 className="m-0 text-[1.5rem] font-bold leading-tight tracking-tight text-tinta">
            {pessoa.nome}
          </h1>
          <span className="text-[0.87rem] text-suave">
            {pessoa.cargo} · na equipe desde {dataCurta(pessoa.entrada)}
          </span>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-suave">
            {CICLO_ATUAL}
          </span>
          <span className="text-[0.9rem] font-semibold text-tinta">
            {ROTULO_STATUS[status]}
          </span>
        </div>
      </div>

      <p className="max-w-[64ch] text-[0.9rem] text-suave">
        Toda nota precisa de uma prova junto. Sem o fato concreto, o corretor contesta e o
        dono perde a confiança no número. Dá para salvar rascunho e terminar depois.
      </p>

      <Formulario corretorId={pessoa.id} avaliacao={avaliacao} />
    </main>
  );
}
