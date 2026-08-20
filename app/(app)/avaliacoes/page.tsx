import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ChevronRight, CircleDashed, Clock3 } from "lucide-react";
import {
  CICLO_ATUAL,
  ROTULO_STATUS,
  corretoresDoCiclo,
  quantasPreenchidas,
  resumoDoCiclo,
  statusDe,
  type StatusAvaliacao,
} from "@/lib/avaliacoes";
import { COMPETENCIAS } from "@/lib/dados";

export const metadata: Metadata = { title: "Avaliações" };

const ESTILO: Record<StatusAvaliacao, { chip: string; Icone: typeof Clock3; cor: string }> = {
  avaliado: {
    chip: "border-ok/30 bg-ok-suave text-ok",
    Icone: CheckCircle2,
    cor: "text-ok",
  },
  "em-andamento": {
    chip: "border-laranja/30 bg-laranja-suave text-laranja-escuro",
    Icone: Clock3,
    cor: "text-laranja",
  },
  "nao-avaliado": {
    chip: "border-linha-forte bg-fundo-2 text-suave",
    Icone: CircleDashed,
    cor: "text-suave",
  },
};

const ORDEM: Record<StatusAvaliacao, number> = {
  "em-andamento": 0,
  "nao-avaliado": 1,
  avaliado: 2,
};

export default async function PáginaAvaliacoes({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const resumo = resumoDoCiclo();
  const total = COMPETENCIAS.length;

  const corretores = [...corretoresDoCiclo()].sort((a, b) => {
    const da = ORDEM[statusDe(a.id)];
    const db = ORDEM[statusDe(b.id)];
    return da !== db ? da - db : a.nome.localeCompare(b.nome, "pt-BR");
  });

  const progresso = Math.round((resumo.notasLancadas / resumo.notasTotais) * 100);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-suave">
            Ciclo em coleta
          </span>
          <h1 className="m-0 text-[1.75rem] font-bold leading-tight tracking-tight text-tinta">
            {CICLO_ATUAL}
          </h1>
          <p className="m-0 text-[0.9rem] text-suave">
            {resumo.avaliados} de {resumo.total} corretores com avaliação fechada
          </p>
        </div>
      </div>

      {ok && (
        <p className="flex items-center gap-2 rounded-lg border border-ok/30 bg-ok-suave px-4 py-3 text-[0.9rem] font-medium text-ok">
          <CheckCircle2 size={17} />
          Avaliação concluída e registrada no ciclo.
        </p>
      )}

      {/* resumo */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1 rounded-xl border border-linha bg-white px-4 py-3.5">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-suave">
            Avaliados
          </span>
          <span className="text-[2rem] font-bold leading-none tracking-tight text-ok tabular-nums">
            {resumo.avaliados}
          </span>
          <span className="text-[0.8rem] text-suave">as 6 competências fechadas</span>
        </div>

        <div className="flex flex-col gap-1 rounded-xl border border-linha bg-white px-4 py-3.5">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-suave">
            Pendentes
          </span>
          <span className="text-[2rem] font-bold leading-none tracking-tight text-laranja tabular-nums">
            {resumo.pendentes}
          </span>
          <span className="text-[0.8rem] text-suave">
            {resumo.emAndamento} começaram, {resumo.pendentes - resumo.emAndamento} nem
            começaram
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-xl border border-linha bg-white px-4 py-3.5">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-suave">
            Notas lançadas
          </span>
          <span className="text-[2rem] font-bold leading-none tracking-tight text-tinta tabular-nums">
            {resumo.notasLancadas}
          </span>
          <span className="text-[0.8rem] text-suave">de {resumo.notasTotais} possíveis</span>
        </div>

        <div className="flex flex-col justify-center gap-2 rounded-xl border border-linha bg-white px-4 py-3.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-suave">
              Progresso do ciclo
            </span>
            <span className="text-[1.05rem] font-bold tabular-nums text-tinta">
              {progresso}%
            </span>
          </div>
          <span className="block h-2 overflow-hidden rounded-full bg-fundo-2">
            <span
              className="block h-full rounded-full bg-laranja transition-all"
              style={{ width: `${progresso}%` }}
            />
          </span>
        </div>
      </section>

      {/* lista */}
      <section className="flex flex-col gap-2">
        <h2 className="m-0 text-[1.05rem] font-bold tracking-tight text-tinta">
          Corretores do ciclo
        </h2>
        <p className="m-0 max-w-[62ch] text-[0.88rem] text-suave">
          Quem está em andamento aparece primeiro. Corretor inativo não entra no ciclo.
        </p>

        <div className="mt-1 flex flex-col gap-2">
          {corretores.map((pessoa) => {
            const status = statusDe(pessoa.id);
            const feitas = quantasPreenchidas(pessoa.id);
            const { chip, Icone, cor } = ESTILO[status];

            return (
              <Link
                key={pessoa.id}
                href={`/avaliacoes/${pessoa.id}`}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 rounded-xl border border-linha bg-white px-4 py-3.5 no-underline transition-colors hover:border-laranja"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-laranja-suave text-[1.05rem] font-bold text-laranja-escuro">
                  {pessoa.nome.charAt(0)}
                </span>

                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.98rem] font-semibold tracking-tight text-tinta">
                      {pessoa.nome}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.72rem] font-semibold ${chip}`}
                    >
                      <Icone size={12} strokeWidth={2.5} />
                      {ROTULO_STATUS[status]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-24 overflow-hidden rounded-full bg-fundo-2">
                      <span
                        className={`block h-full rounded-full ${
                          status === "avaliado" ? "bg-ok" : "bg-laranja"
                        }`}
                        style={{ width: `${(feitas / total) * 100}%` }}
                      />
                    </span>
                    <span className="text-[0.78rem] text-suave">
                      {feitas} de {total} competências
                    </span>
                  </div>
                </div>

                <span
                  className={`flex items-center gap-1 text-[0.85rem] font-semibold ${cor} transition-transform group-hover:translate-x-0.5`}
                >
                  <span className="hidden sm:inline">
                    {status === "avaliado"
                      ? "Rever"
                      : status === "em-andamento"
                        ? "Continuar"
                        : "Iniciar avaliação"}
                  </span>
                  <ChevronRight size={17} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
