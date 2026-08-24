import Link from "next/link";
import type { Metadata } from "next";
import { CheckSquare, FileText, Play, Search, Users } from "lucide-react";
import { Cabecalho, Pagina, Vazio } from "@/components/pagina";
import { Vertice } from "@/components/impressao";
import { PilhaHex } from "@/components/hex-avatar";
import { FormularioTreinamento } from "./formulario-treinamento";
import {
  ROTULO_STATUS_TREINAMENTO,
  listarTreinamentos,
  type CompetenciaOuGeral,
  type StatusTreinamento,
  type Treinamento,
} from "@/lib/treinamentos";
import { acharPessoa, dataCurta, listarPessoas } from "@/lib/equipe";
import {
  COMPETENCIAS,
  IMOBILIARIA,
  critica,
  fmt,
  mediasPorCompetencia,
  type ChaveCompetencia,
} from "@/lib/dados";
import { BOTAO } from "@/components/estilos";

export const metadata: Metadata = { title: "Treinamentos" };

const ESTILO_STATUS: Record<StatusTreinamento, string> = {
  realizado: "border-ok/30 bg-ok-suave text-ok",
  agendado: "border-laranja/30 bg-laranja-suave text-acao",
  cancelado: "border-linha-forte bg-fundo-2 text-suave",
};

/** Ordem em que as seções aparecem dentro de uma trilha. */
const SECOES: { status: StatusTreinamento; titulo: string; apoio: string }[] = [
  {
    status: "agendado",
    titulo: "Agendados",
    apoio: "ainda vão acontecer",
  },
  {
    status: "realizado",
    titulo: "Já realizados",
    apoio: "com gravação, material e atividade de cada um",
  },
  {
    status: "cancelado",
    titulo: "Cancelados",
    apoio: "ficam no histórico, mas não contam como treino entregue",
  },
];

function semAcento(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function Cartao({ t }: { t: Treinamento }) {
  const participantes = t.participantesIds
    .map((id) => acharPessoa(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const feitas = t.atividades.filter((a) => a.concluida).length;

  return (
    <Link
      href={`/treinamentos/${t.id}`}
      className="flex gap-4 rounded-xl border border-linha bg-white px-4 py-4 no-underline transition-colors hover:border-laranja sm:px-5"
    >
      <span
        style={{ width: 42, height: 46 }}
        className={`hex-recorte grid shrink-0 place-items-center ${
          t.gravacaoUrl ? "bg-acao text-white" : "bg-fundo-2 text-suave"
        }`}
        aria-hidden="true"
      >
        <Play size={15} fill="currentColor" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[1.02rem] font-bold tracking-[-0.015em] text-tinta">
            {t.titulo}
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[0.72rem] font-semibold ${ESTILO_STATUS[t.status]}`}
          >
            {ROTULO_STATUS_TREINAMENTO[t.status]}
          </span>
          <span className="ml-auto text-[0.83rem] tabular-nums text-suave">
            {dataCurta(t.data)}
          </span>
        </div>

        {t.descricao && (
          <p className="m-0 line-clamp-2 max-w-[70ch] text-[0.89rem] text-tinta-suave">
            {t.descricao}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.81rem] text-suave">
          <span className="inline-flex items-center gap-1.5">
            <Play size={13} />
            {t.gravacaoUrl ? "Gravação disponível" : "Sem gravação"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText size={13} />
            {t.materiais.length} {t.materiais.length === 1 ? "material" : "materiais"}
          </span>
          {t.atividades.length > 0 && (
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <CheckSquare size={13} />
              {feitas} de {t.atividades.length} atividades
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Users size={13} />
            {participantes.length}
          </span>
          {participantes.length > 0 && (
            <span className="ml-auto">
              <PilhaHex nomes={participantes.map((p) => p.nome)} mostrar={4} tamanho={25} />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function PáginaTreinamentos({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; q?: string }>;
}) {
  const { t: trilhaPedida = "todos", q = "" } = await searchParams;
  const busca = semAcento(q.trim());

  const todos = listarTreinamentos();
  const pessoasAtivas = listarPessoas().filter((p) => p.status === "ativo");

  const notaDoTime = new Map(
    mediasPorCompetencia(IMOBILIARIA.corretores).map((c) => [c.chave, c.valor])
  );

  // A ordem das trilhas é a fila de prioridade do time: a competência
  // mais fraca primeiro, porque é onde o próximo treino tem mais a ganhar.
  const chavesOrdenadas = [...COMPETENCIAS].sort(
    (a, b) => (notaDoTime.get(a.chave) ?? 0) - (notaDoTime.get(b.chave) ?? 0)
  );

  type Trilha = {
    chave: CompetenciaOuGeral;
    /** null na trilha Geral, que não é um lado do hexágono. */
    competencia: ChaveCompetencia | null;
    nome: string;
    mede: string;
    nota: number | null;
    itens: Treinamento[];
  };

  const trilhas: Trilha[] = [
    ...chavesOrdenadas.map((c) => ({
      chave: c.chave as CompetenciaOuGeral,
      competencia: c.chave as ChaveCompetencia,
      nome: c.nome as string,
      mede: c.mede as string,
      nota: notaDoTime.get(c.chave) ?? null,
      itens: todos.filter((x) => x.competencia === c.chave),
    })),
    {
      chave: "geral",
      competencia: null,
      nome: "Geral",
      mede: "Rotina de gestão e padrão de operação. Sustenta o resto.",
      nota: null,
      itens: todos.filter((x) => x.competencia === "geral"),
    },
  ];

  const trilhaAtual = trilhas.find((t) => t.chave === trilhaPedida) ?? null;

  const visiveis = (trilhaAtual ? trilhaAtual.itens : todos).filter(
    (x) => !busca || semAcento(x.titulo).includes(busca) || semAcento(x.descricao).includes(busca)
  );

  // Quem ainda está abaixo de 5 na competência desta trilha. É para eles
  // que o próximo treino daqui existe.
  const alvo = trilhaAtual?.competencia ?? null;
  const aindaFracos = alvo
    ? IMOBILIARIA.corretores.filter((c) => critica(c.notas[alvo]))
    : [];

  const url = (chave: string, termo = q) => {
    const qs = new URLSearchParams();
    if (chave !== "todos") qs.set("t", chave);
    if (termo) qs.set("q", termo);
    const s = qs.toString();
    return s ? `/treinamentos?${s}` : "/treinamentos";
  };

  return (
    <Pagina>
      <Cabecalho
        etiqueta={IMOBILIARIA.nome}
        titulo="Treinamentos"
        apoio="Treino aqui é o que foi feito com este time, não curso de prateleira. Cada trilha ataca um lado do hexágono."
        acao={<FormularioTreinamento pessoas={pessoasAtivas} />}
      />

      {todos.length === 0 ? (
        <Vazio titulo="Nenhum treinamento registrado">
          Comece pelo módulo do gestor. É ele que sustenta o padrão depois que o treino
          termina.
        </Vazio>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[16.5rem_1fr]">
          {/* Índice das trilhas. Fica fixo enquanto a lista rola, para nunca
              perder de vista em que assunto a pessoa está. */}
          <nav className="overflow-hidden rounded-xl border border-linha bg-white lg:sticky lg:top-6">
            <span className="block border-b border-linha px-4 py-3 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-suave">
              Trilhas
            </span>

            <Link
              href={url("todos")}
              className={`alvo-alto flex items-center gap-2.5 border-b border-linha px-4 py-2.5 no-underline transition-colors ${
                trilhaPedida === "todos"
                  ? "bg-laranja-suave font-semibold text-acao"
                  : "text-tinta-suave hover:bg-fundo"
              }`}
            >
              <span
                style={{ width: 20, height: 22 }}
                className="hex-recorte shrink-0 bg-linha-forte"
                aria-hidden="true"
              />
              <span className="flex-1 text-[0.9rem]">Todos os treinamentos</span>
              <span className="text-[0.82rem] tabular-nums text-suave">{todos.length}</span>
            </Link>

            {trilhas.map((trilha) => {
              const ativa = trilhaPedida === trilha.chave;
              const vazia = trilha.itens.length === 0;

              return (
                <Link
                  key={trilha.chave}
                  href={url(trilha.chave)}
                  className={`alvo-alto flex items-center gap-2.5 border-b border-linha px-4 py-2.5 no-underline transition-colors last:border-b-0 ${
                    ativa
                      ? "bg-laranja-suave text-acao"
                      : "text-tinta-suave hover:bg-fundo"
                  }`}
                >
                  {trilha.competencia ? (
                    <Vertice
                      competencia={trilha.competencia}
                      nota={trilha.nota ?? undefined}
                      tamanho={20}
                    />
                  ) : (
                    <span
                      style={{ width: 20, height: 22 }}
                      className="hex-recorte shrink-0 bg-fundo-2"
                      aria-hidden="true"
                    />
                  )}

                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span
                      className={`truncate text-[0.9rem] ${ativa ? "font-semibold" : ""}`}
                    >
                      {trilha.nome}
                    </span>
                    {trilha.nota !== null && (
                      <span className="text-[0.75rem] tabular-nums text-suave">
                        time {fmt(trilha.nota)}
                      </span>
                    )}
                  </span>

                  <span
                    className={`text-[0.82rem] tabular-nums ${vazia ? "text-suave" : "text-suave"}`}
                  >
                    {trilha.itens.length}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-5">
            {/* Cabeçalho da trilha: o que essa competência mede, como o time
                está nela e quem ainda precisa. */}
            <section className="rounded-xl border border-linha bg-white px-5 py-5 sm:px-6">
              {trilhaAtual ? (
                <>
                  <div className="flex items-center gap-3">
                    {trilhaAtual.competencia ? (
                      <Vertice
                        competencia={trilhaAtual.competencia}
                        nota={trilhaAtual.nota ?? undefined}
                        tamanho={34}
                      />
                    ) : (
                      <span
                        style={{ width: 30, height: 33 }}
                        className="hex-recorte shrink-0 bg-fundo-2"
                        aria-hidden="true"
                      />
                    )}
                    <h2 className="m-0 flex-1 text-[1.4rem] font-bold tracking-[-0.025em] text-tinta">
                      {trilhaAtual.nome}
                    </h2>
                    {trilhaAtual.nota !== null && (
                      <span className="flex flex-col items-end leading-tight">
                        <span
                          className={`text-[1.5rem] font-bold tabular-nums tracking-[-0.025em] ${critica(trilhaAtual.nota) ? "text-alerta" : "text-tinta"}`}
                        >
                          {fmt(trilhaAtual.nota)}
                        </span>
                        <span className="text-[0.74rem] text-suave">time hoje</span>
                      </span>
                    )}
                  </div>

                  <p className="m-0 mt-3 max-w-[62ch] text-[0.94rem] text-tinta-suave">
                    {trilhaAtual.mede}
                  </p>

                  {aindaFracos.length > 0 && (
                    <p className="m-0 mt-3 border-t border-linha pt-3 text-[0.87rem] text-suave">
                      Ainda abaixo de 5 aqui:{" "}
                      {aindaFracos.map((c, i) => (
                        <span key={c.id}>
                          {i > 0 && ", "}
                          <Link
                            href={`/painel/corretor/${c.id}`}
                            className="font-semibold text-tinta-suave underline decoration-linha-forte underline-offset-2 hover:text-acao"
                          >
                            {c.nome.split(" ")[0]}
                          </Link>
                        </span>
                      ))}
                      . É para eles que o próximo treino desta trilha existe.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="m-0 text-[1.4rem] font-bold tracking-[-0.025em] text-tinta">
                    Todos os treinamentos
                  </h2>
                  <p className="m-0 mt-2 max-w-[62ch] text-[0.94rem] text-tinta-suave">
                    {todos.length} {todos.length === 1 ? "treino registrado" : "treinos registrados"} com este
                    time. Escolha uma trilha ao lado para ver só o que ataca aquela
                    competência, ou busque pelo nome abaixo.
                  </p>
                </>
              )}
            </section>

            <form action="/treinamentos" className="relative">
              {trilhaPedida !== "todos" && <input type="hidden" name="t" value={trilhaPedida} />}
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-suave"
              />
              <input
                name="q"
                defaultValue={q}
                placeholder={
                  trilhaAtual
                    ? `Buscar em ${trilhaAtual.nome.toLowerCase()}`
                    : "Buscar por título ou assunto"
                }
                aria-label="Buscar treinamento"
                className="alvo-alto w-full rounded-md border border-borda-campo bg-white py-2.5 pl-9 pr-3 text-[0.92rem] text-tinta transition focus:border-acao"
              />
            </form>

            {visiveis.length === 0 ? (
              <Vazio
                titulo={busca ? "Nenhum treino com esse termo" : "Trilha ainda sem treino"}
                acao={
                  busca ? (
                    <Link
                      href={url(trilhaPedida, "")}
                      className={BOTAO.contorno}
                    >
                      Limpar busca
                    </Link>
                  ) : undefined
                }
              >
                {busca
                  ? `Nada encontrado para "${q}"${trilhaAtual ? ` dentro de ${trilhaAtual.nome.toLowerCase()}` : ""}.`
                  : "Nenhum treino registrado nessa competência ainda. Marque o primeiro pelo botão no topo."}
              </Vazio>
            ) : (
              SECOES.map((secao) => {
                const itens = visiveis.filter((x) => x.status === secao.status);
                if (itens.length === 0) return null;

                return (
                  <section key={secao.status} className="flex flex-col gap-2.5">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1">
                      <h3 className="m-0 text-[1rem] font-bold tracking-[-0.015em] text-tinta">
                        {secao.titulo}
                      </h3>
                      <span className="text-[0.84rem] text-suave">
                        {itens.length} · {secao.apoio}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {itens.map((x) => (
                        <Cartao key={x.id} t={x} />
                      ))}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        </div>
      )}
    </Pagina>
  );
}
