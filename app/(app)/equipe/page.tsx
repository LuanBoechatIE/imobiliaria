import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { Cabecalho, Pagina, Vazio } from "@/components/pagina";
import { AcoesPessoa } from "./acoes-pessoa";
import { FormularioPessoa } from "./formulario-pessoa";
import {
  NOME_PAPEL,
  dataCurta,
  desdeQuando,
  listarPessoas,
  notaAtual,
  type Pessoa,
} from "@/lib/equipe";
import { fmt } from "@/lib/dados";

export const metadata: Metadata = { title: "Equipe" };

const FILTROS = [
  { chave: "todos", rotulo: "Todos" },
  { chave: "corretores", rotulo: "Corretores" },
  { chave: "gestores", rotulo: "Gestores" },
  { chave: "donos", rotulo: "Donos" },
  { chave: "ativos", rotulo: "Ativos" },
  { chave: "inativos", rotulo: "Inativos" },
] as const;

function passaNoFiltro(p: Pessoa, filtro: string): boolean {
  switch (filtro) {
    case "corretores":
      return p.papel === "corretor";
    case "gestores":
      return p.papel === "gestor";
    case "donos":
      return p.papel === "dono";
    case "ativos":
      return p.status === "ativo";
    case "inativos":
      return p.status === "inativo";
    default:
      return true;
  }
}

function semAcento(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default async function PáginaEquipe({
  searchParams,
}: {
  searchParams: Promise<{ f?: string; q?: string }>;
}) {
  const { f = "todos", q = "" } = await searchParams;
  const busca = semAcento(q.trim());

  const todas = listarPessoas();
  const ativos = todas.filter((p) => p.status === "ativo").length;

  const pessoas = todas
    .filter((p) => passaNoFiltro(p, f))
    .filter((p) => !busca || semAcento(p.nome).includes(busca))
    .sort((a, b) => {
      // ativos primeiro, depois nota (corretor), depois nome
      if (a.status !== b.status) return a.status === "ativo" ? -1 : 1;
      const na = notaAtual(a);
      const nb = notaAtual(b);
      if (na !== null && nb !== null && na !== nb) return nb - na;
      if (na !== null && nb === null) return -1;
      if (na === null && nb !== null) return 1;
      return a.nome.localeCompare(b.nome, "pt-BR");
    });

  const url = (chave: string) => {
    const qs = new URLSearchParams();
    if (chave !== "todos") qs.set("f", chave);
    if (q) qs.set("q", q);
    const s = qs.toString();
    return s ? `/equipe?${s}` : "/equipe";
  };

  return (
    <Pagina>
      <Cabecalho
        titulo="Equipe"
        apoio={
          <>
            {ativos} {ativos === 1 ? "pessoa com acesso" : "pessoas com acesso"} ao sistema
            {todas.length > ativos &&
              ` · ${todas.length - ativos} ${todas.length - ativos === 1 ? "desativada" : "desativadas"}`}
          </>
        }
        acao={<FormularioPessoa gatilho="botao" />}
      />

      {/* filtros e busca */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTROS.map((filtro) => {
            const ativo = f === filtro.chave;
            return (
              <Link
                key={filtro.chave}
                href={url(filtro.chave)}
                className={`rounded-full border px-3 py-1.5 text-[0.85rem] font-semibold no-underline transition-colors ${
                  ativo
                    ? "border-laranja bg-laranja text-white"
                    : "border-linha-forte bg-white text-tinta-suave hover:border-laranja hover:text-laranja-escuro"
                }`}
              >
                {filtro.rotulo}
              </Link>
            );
          })}
        </div>

        <form action="/equipe" className="relative ml-auto w-full sm:w-64">
          {f !== "todos" && <input type="hidden" name="f" value={f} />}
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-suave"
          />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome"
            aria-label="Buscar por nome"
            className="w-full rounded-md border border-linha-forte bg-white py-2 pl-9 pr-3 text-[0.9rem] text-tinta outline-none transition focus:border-laranja focus:ring-3 focus:ring-laranja-suave"
          />
        </form>
      </div>

      {/* cabeçalho da tabela, só no desktop */}
      <div className="flex flex-col gap-2">
        <div className="hidden grid-cols-[minmax(12rem,1.5fr)_9rem_8rem_7rem_8rem_2rem] items-center gap-4 px-4 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-suave lg:grid">
          <span>Pessoa</span>
          <span>Papel</span>
          <span>Na equipe desde</span>
          <span>Nota atual</span>
          <span>Último acesso</span>
          <span />
        </div>

        {pessoas.length === 0 && (
          <Vazio titulo="Ninguém encontrado">
            {busca
              ? `Nenhum nome com "${q}". Tente outro termo ou limpe a busca.`
              : "Nenhuma pessoa nesse filtro. Escolha outro acima."}
          </Vazio>
        )}

        {pessoas.map((pessoa) => {
          const nota = notaAtual(pessoa);
          const inativo = pessoa.status === "inativo";

          return (
            <article
              key={pessoa.id}
              className={`grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 rounded-xl border bg-white px-4 py-3.5 transition-colors lg:grid-cols-[minmax(12rem,1.5fr)_9rem_8rem_7rem_8rem_2rem] ${
                inativo ? "border-linha opacity-70" : "border-linha hover:border-laranja"
              }`}
            >
              {/* pessoa */}
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full text-[1.05rem] font-bold ${
                    inativo
                      ? "bg-fundo-2 text-suave"
                      : "bg-laranja-suave text-laranja-escuro"
                  }`}
                >
                  {pessoa.nome.charAt(0)}
                </span>
                <div className="flex min-w-0 flex-col">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[0.98rem] font-semibold tracking-tight text-tinta">
                      {pessoa.nome}
                    </span>
                    {inativo && (
                      <span className="shrink-0 rounded-full bg-fundo-2 px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide text-suave">
                        Inativo
                      </span>
                    )}
                  </div>
                  <span className="truncate text-[0.8rem] text-suave">{pessoa.cargo}</span>
                </div>
              </div>

              {/* ações no mobile ficam à direita da primeira linha */}
              <div className="row-start-1 justify-self-end lg:hidden">
                <AcoesPessoa pessoa={pessoa} />
              </div>

              {/* papel */}
              <div className="col-span-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.83rem] text-suave lg:col-span-1 lg:block">
                <span className="rounded-md bg-fundo-2 px-2 py-0.5 text-[0.78rem] font-semibold text-tinta-suave">
                  {NOME_PAPEL[pessoa.papel]}
                </span>
                <span className="lg:hidden">desde {dataCurta(pessoa.entrada)}</span>
                <span className="lg:hidden">{desdeQuando(pessoa.ultimoAcesso)}</span>
              </div>

              <span className="hidden text-[0.85rem] text-tinta-suave lg:block">
                {dataCurta(pessoa.entrada)}
              </span>

              {/* nota */}
              <div className="col-span-2 lg:col-span-1">
                {nota === null ? (
                  <span className="text-[0.85rem] text-suave">
                    {pessoa.papel === "corretor" ? "sem nota no ciclo" : "não se aplica"}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[1.05rem] font-bold tabular-nums tracking-tight ${
                        nota < 5 ? "text-alerta" : "text-tinta"
                      }`}
                    >
                      {fmt(nota)}
                    </span>
                    <span className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-fundo-2 lg:block">
                      <span
                        className={`block h-full rounded-full ${
                          nota < 5 ? "bg-alerta" : "bg-laranja"
                        }`}
                        style={{ width: `${(nota / 10) * 100}%` }}
                      />
                    </span>
                  </div>
                )}
              </div>

              <span className="hidden text-[0.83rem] text-suave lg:block">
                {desdeQuando(pessoa.ultimoAcesso)}
              </span>

              <div className="hidden justify-self-end lg:block">
                <AcoesPessoa pessoa={pessoa} />
              </div>
            </article>
          );
        })}
      </div>

      <p className="border-t border-linha pt-4 text-[0.8rem] text-suave">
        Quem é desativado perde o acesso ao sistema e sai dos rankings do ciclo, mas o
        histórico e as avaliações anteriores continuam guardados. Dá para reativar depois.
      </p>
    </Pagina>
  );
}
