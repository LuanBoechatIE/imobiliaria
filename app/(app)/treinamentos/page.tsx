import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, GraduationCap, PlayCircle, Users } from "lucide-react";
import { Cabecalho, Pagina, Vazio } from "@/components/pagina";
import { FormularioTreinamento } from "./formulario-treinamento";
import {
  ROTULO_STATUS_TREINAMENTO,
  listarTreinamentos,
  nomeCompetencia,
  type StatusTreinamento,
} from "@/lib/treinamentos";
import { acharPessoa, dataCurta, listarPessoas } from "@/lib/equipe";

export const metadata: Metadata = { title: "Treinamentos" };

const ESTILO_STATUS: Record<StatusTreinamento, string> = {
  realizado: "border-ok/30 bg-ok-suave text-ok",
  agendado: "border-laranja/30 bg-laranja-suave text-laranja-escuro",
  cancelado: "border-linha-forte bg-fundo-2 text-suave",
};

export default async function PáginaTreinamentos() {
  const treinamentos = listarTreinamentos();
  const pessoasAtivas = listarPessoas().filter((p) => p.status === "ativo");

  const realizados = treinamentos.filter((t) => t.status === "realizado").length;
  const agendados = treinamentos.filter((t) => t.status === "agendado").length;

  return (
    <Pagina largura="media">
      <Cabecalho
        titulo="Treinamentos"
        apoio={`${realizados} ${realizados === 1 ? "realizado" : "realizados"} · ${agendados} ${agendados === 1 ? "agendado" : "agendados"}`}
        acao={<FormularioTreinamento pessoas={pessoasAtivas} />}
      />

      {treinamentos.length === 0 ? (
        <Vazio titulo="Nenhum treinamento registrado">
          Comece pelo módulo do gestor. É ele que sustenta o padrão depois que o treino
          termina.
        </Vazio>
      ) : (
        <div className="flex flex-col gap-2">
          {treinamentos.map((t) => {
            const participantes = t.participantesIds
              .map((id) => acharPessoa(id))
              .filter((p): p is NonNullable<typeof p> => Boolean(p));

            return (
              <Link
                key={t.id}
                href={`/treinamentos/${t.id}`}
                className="group flex flex-col gap-3 rounded-xl border border-linha bg-white px-4 py-3.5 no-underline transition-colors hover:border-laranja sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-laranja-suave text-laranja-escuro">
                  <GraduationCap size={18} strokeWidth={2.2} />
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.98rem] font-semibold tracking-tight text-tinta group-hover:text-laranja-escuro">
                      {t.titulo}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.72rem] font-semibold ${ESTILO_STATUS[t.status]}`}
                    >
                      {ROTULO_STATUS_TREINAMENTO[t.status]}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.82rem] text-suave">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-fundo-2 px-2 py-0.5 font-semibold text-tinta-suave">
                      {nomeCompetencia(t.competencia)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={13} />
                      {dataCurta(t.data)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users size={13} />
                      {participantes.length} {participantes.length === 1 ? "participante" : "participantes"}
                    </span>
                    {t.gravacaoUrl && (
                      <span className="inline-flex items-center gap-1 text-laranja-escuro">
                        <PlayCircle size={13} />
                        Com gravação
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex -space-x-2 sm:pl-2">
                  {participantes.slice(0, 4).map((p) => (
                    <span
                      key={p.id}
                      title={p.nome}
                      className="grid size-7 place-items-center rounded-full bg-laranja-suave text-[0.7rem] font-bold text-laranja-escuro ring-2 ring-white"
                    >
                      {p.nome.charAt(0)}
                    </span>
                  ))}
                  {participantes.length > 4 && (
                    <span className="grid size-7 place-items-center rounded-full bg-fundo-2 text-[0.68rem] font-bold text-suave ring-2 ring-white">
                      +{participantes.length - 4}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Pagina>
  );
}
