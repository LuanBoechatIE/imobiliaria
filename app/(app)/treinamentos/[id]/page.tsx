import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Calendar,
  CheckSquare,
  ExternalLink,
  FileText,
  GraduationCap,
  PlayCircle,
  Trash2,
  Users,
} from "lucide-react";
import { FormularioTreinamento } from "../formulario-treinamento";
import { ItemAtividade } from "../item-atividade";
import { NovaAtividade } from "../nova-atividade";
import { NovoMaterial } from "../novo-material";
import { excluirMaterial, mudarStatus } from "../acoes";
import {
  ROTULO_STATUS_TREINAMENTO,
  acharTreinamento,
  nomeCompetencia,
  type StatusTreinamento,
} from "@/lib/treinamentos";
import { acharPessoa, dataCurta, listarPessoas } from "@/lib/equipe";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: acharTreinamento(id)?.titulo ?? "Treinamento" };
}

const OPCOES_STATUS: StatusTreinamento[] = ["agendado", "realizado", "cancelado"];

export default async function PáginaTreinamento({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const treinamento = acharTreinamento(id);
  if (!treinamento) notFound();

  const pessoasAtivas = listarPessoas().filter((p) => p.status === "ativo");
  const participantes = treinamento.participantesIds
    .map((pid) => acharPessoa(pid))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const feitas = treinamento.atividades.filter((a) => a.concluida).length;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 lg:px-8 lg:py-8">
      <Link
        href="/treinamentos"
        className="w-fit text-[0.87rem] font-semibold text-suave no-underline transition-colors hover:text-laranja-escuro"
      >
        ← Voltar para treinamentos
      </Link>

      {/* Informações */}
      <section className="flex flex-col gap-4 rounded-xl border border-linha bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-laranja-suave text-laranja-escuro">
              <GraduationCap size={19} strokeWidth={2.2} />
            </span>
            <div className="flex flex-col gap-1">
              <h1 className="m-0 text-[1.4rem] font-bold leading-tight tracking-tight text-tinta">
                {treinamento.titulo}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.83rem] text-suave">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-fundo-2 px-2 py-0.5 font-semibold text-tinta-suave">
                  {nomeCompetencia(treinamento.competencia)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar size={13} />
                  {dataCurta(treinamento.data)}
                </span>
                <span>criado por {treinamento.criadoPor}</span>
              </div>
            </div>
          </div>
          <FormularioTreinamento pessoas={pessoasAtivas} treinamento={treinamento} gatilho="item" />
        </div>

        {treinamento.descricao && (
          <p className="m-0 max-w-[64ch] text-[0.92rem] text-tinta-suave">{treinamento.descricao}</p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 border-t border-linha pt-3.5">
          <span className="mr-1 text-[0.78rem] font-semibold uppercase tracking-wider text-suave">
            Status
          </span>
          {OPCOES_STATUS.map((s) => {
            const ativo = treinamento.status === s;
            return (
              <form key={s} action={mudarStatus}>
                <input type="hidden" name="id" value={treinamento.id} />
                <input type="hidden" name="status" value={s} />
                <button
                  type="submit"
                  disabled={ativo}
                  className={`rounded-full border px-3 py-1 text-[0.82rem] font-semibold transition-colors ${
                    ativo
                      ? s === "realizado"
                        ? "border-ok/30 bg-ok-suave text-ok"
                        : s === "cancelado"
                          ? "border-linha-forte bg-fundo-2 text-suave"
                          : "border-laranja/30 bg-laranja-suave text-laranja-escuro"
                      : "border-linha-forte bg-white text-suave hover:border-laranja hover:text-laranja-escuro"
                  }`}
                >
                  {ROTULO_STATUS_TREINAMENTO[s]}
                </button>
              </form>
            );
          })}
        </div>
      </section>

      {/* Gravação */}
      <section className="flex flex-col gap-2 rounded-xl border border-linha bg-white p-5">
        <h2 className="m-0 flex items-center gap-2 text-[1rem] font-bold tracking-tight text-tinta">
          <PlayCircle size={17} className="text-suave" />
          Gravação
        </h2>
        {treinamento.gravacaoUrl ? (
          <a
            href={treinamento.gravacaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1.5 rounded-md bg-laranja px-3.5 py-2 text-[0.88rem] font-semibold text-white no-underline transition-colors hover:bg-laranja-escuro"
          >
            Abrir gravação
            <ExternalLink size={14} />
          </a>
        ) : (
          <p className="m-0 text-[0.88rem] text-suave">
            Nenhum link cadastrado ainda. Edite as informações do treinamento pra colar o
            link (Drive, YouTube não listado, Loom...).
          </p>
        )}
      </section>

      {/* Materiais */}
      <section className="flex flex-col gap-3 rounded-xl border border-linha bg-white p-5">
        <h2 className="m-0 flex items-center gap-2 text-[1rem] font-bold tracking-tight text-tinta">
          <FileText size={17} className="text-suave" />
          Materiais
        </h2>

        {treinamento.materiais.length > 0 && (
          <div className="flex flex-col gap-1">
            {treinamento.materiais.map((m) => (
              <div
                key={m.id}
                className="group flex items-center gap-2 rounded-md border border-linha px-3 py-2"
              >
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-1.5 text-[0.88rem] font-medium text-tinta-suave no-underline hover:text-laranja-escuro"
                >
                  <span className="truncate">{m.nome}</span>
                  <ExternalLink size={12} className="shrink-0" />
                </a>
                <form action={excluirMaterial}>
                  <input type="hidden" name="treinamentoId" value={treinamento.id} />
                  <input type="hidden" name="materialId" value={m.id} />
                  <button
                    type="submit"
                    aria-label={`Remover ${m.nome}`}
                    className="shrink-0 rounded-md p-1 text-suave opacity-0 transition-opacity hover:text-alerta group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        <NovoMaterial treinamentoId={treinamento.id} />
      </section>

      {/* Participantes */}
      <section className="flex flex-col gap-3 rounded-xl border border-linha bg-white p-5">
        <h2 className="m-0 flex items-center gap-2 text-[1rem] font-bold tracking-tight text-tinta">
          <Users size={17} className="text-suave" />
          Participantes
          <span className="text-[0.85rem] font-normal text-suave">({participantes.length})</span>
        </h2>

        {participantes.length === 0 ? (
          <p className="m-0 text-[0.88rem] text-suave">Nenhum participante registrado.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {participantes.map((p) => {
              const conteudo = (
                <>
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-laranja-suave text-[0.68rem] font-bold text-laranja-escuro">
                    {p.nome.charAt(0)}
                  </span>
                  <span className="truncate">{p.nome}</span>
                </>
              );
              return p.papel === "corretor" ? (
                <Link
                  key={p.id}
                  href={`/painel/corretor/${p.id}`}
                  className="flex items-center gap-2 rounded-full border border-linha bg-fundo-2 py-1 pl-1 pr-3 text-[0.85rem] font-medium text-tinta-suave no-underline transition-colors hover:border-laranja hover:text-laranja-escuro"
                >
                  {conteudo}
                </Link>
              ) : (
                <span
                  key={p.id}
                  className="flex items-center gap-2 rounded-full border border-linha bg-fundo-2 py-1 pl-1 pr-3 text-[0.85rem] font-medium text-tinta-suave"
                >
                  {conteudo}
                </span>
              );
            })}
          </div>
        )}
      </section>

      {/* Atividades relacionadas */}
      <section className="flex flex-col gap-3 rounded-xl border border-linha bg-white p-5">
        <h2 className="m-0 flex items-center gap-2 text-[1rem] font-bold tracking-tight text-tinta">
          <CheckSquare size={17} className="text-suave" />
          Atividades relacionadas
          {treinamento.atividades.length > 0 && (
            <span className="text-[0.85rem] font-normal text-suave">
              ({feitas}/{treinamento.atividades.length})
            </span>
          )}
        </h2>
        <p className="m-0 text-[0.85rem] text-suave">
          O que fica de tarefa depois do treino: prática, aplicação no dia a dia, retorno
          combinado.
        </p>

        {treinamento.atividades.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {treinamento.atividades.map((a) => (
              <ItemAtividade key={a.id} treinamentoId={treinamento.id} atividade={a} />
            ))}
          </div>
        )}

        <NovaAtividade treinamentoId={treinamento.id} />
      </section>
    </main>
  );
}
