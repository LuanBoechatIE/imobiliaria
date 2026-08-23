import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { Cabecalho, Pagina, Vazio } from "@/components/pagina";
import { Impressao } from "@/components/impressao";
import { HexAvatar } from "@/components/hex-avatar";
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
import { IMOBILIARIA, acharCorretor, fmt } from "@/lib/dados";

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

  // Quem entra depois do Raio-X não tem "antes", então fica fora da
  // comparação de antes e depois até ganhar uma avaliação inicial.
  const semRaioX = todas.filter(
    (p) =>
      p.papel === "corretor" &&
      p.status === "ativo" &&
      acharCorretor(p.id) &&
      acharCorretor(p.id)!.inicial === null
  );

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
        etiqueta={IMOBILIARIA.nome}
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

      {semRaioX.length > 0 && (
        <section className="flex flex-wrap items-center gap-3.5 rounded-xl border border-laranja/25 bg-laranja-suave px-4 py-3.5">
          <span
            style={{ width: 26, height: 29 }}
            className="hex-recorte grid shrink-0 place-items-center bg-laranja text-[0.78rem] font-bold text-white"
          >
            {semRaioX.length}
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[0.92rem] font-semibold text-tinta">
              {semRaioX.length === 1
                ? "1 pessoa entrou depois do Raio-X e ainda não tem silhueta inicial."
                : `${semRaioX.length} pessoas entraram depois do Raio-X e ainda não têm silhueta inicial.`}
            </p>
            <p className="m-0 text-[0.86rem] text-tinta-suave">
              {semRaioX.map((p) => p.nome).join(", ")}{" "}
              {semRaioX.length === 1 ? "fica" : "ficam"} fora da comparação de antes e
              depois até {semRaioX.length === 1 ? "ter" : "terem"} avaliação inicial.
            </p>
          </div>
          <Link
            href="/avaliacoes"
            className="shrink-0 rounded-md border border-linha-forte bg-white px-3 py-1.5 text-[0.85rem] font-semibold text-tinta-suave no-underline transition-colors hover:border-laranja hover:text-laranja-escuro"
          >
            Avaliar agora
          </Link>
        </section>
      )}

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

      {pessoas.length === 0 ? (
        <Vazio titulo="Ninguém encontrado">
          {busca
            ? `Nenhum nome com "${q}". Tente outro termo ou limpe a busca.`
            : "Nenhuma pessoa nesse filtro. Escolha outro acima."}
        </Vazio>
      ) : (
        <div className="overflow-hidden rounded-xl border border-linha bg-white">
          <div className="hidden grid-cols-[minmax(11rem,1.4fr)_3rem_8rem_7rem_5rem_7rem_2.5rem] items-center gap-4 border-b border-linha px-5 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-suave lg:grid">
            <span>Pessoa</span>
            <span>Forma</span>
            <span>Papel</span>
            <span>Na equipe</span>
            <span className="text-right">Nota</span>
            <span>Último acesso</span>
            <span />
          </div>

          {pessoas.map((pessoa) => {
            const nota = notaAtual(pessoa);
            const inativo = pessoa.status === "inativo";
            const corretor = pessoa.papel === "corretor" ? acharCorretor(pessoa.id) : undefined;

            return (
              <article
                key={pessoa.id}
                className={`grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2.5 border-t border-linha px-4 py-3 transition-colors first:border-t-0 lg:grid-cols-[minmax(11rem,1.4fr)_3rem_8rem_7rem_5rem_7rem_2.5rem] lg:px-5 ${
                  inativo ? "opacity-60" : "hover:bg-fundo"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <HexAvatar
                    nome={pessoa.nome}
                    tamanho={36}
                    tom={inativo ? "neutro" : "laranja"}
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[0.96rem] font-semibold tracking-[-0.01em] text-tinta">
                        {pessoa.nome}
                      </span>
                      {inativo && (
                        <span className="shrink-0 rounded-full bg-fundo-2 px-2 py-0.5 text-[0.66rem] font-bold uppercase tracking-wide text-suave">
                          Inativo
                        </span>
                      )}
                    </span>
                    <span className="truncate text-[0.79rem] text-suave">{pessoa.email}</span>
                  </div>
                </div>

                {/* ações no mobile ficam à direita da primeira linha */}
                <div className="row-start-1 justify-self-end lg:hidden">
                  <AcoesPessoa pessoa={pessoa} />
                </div>

                <span className="hidden lg:block">
                  {corretor && <Impressao notas={corretor.notas} tamanho={38} anima />}
                </span>

                <div className="col-span-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.83rem] text-suave lg:col-span-1 lg:block">
                  <span className="rounded-md bg-fundo-2 px-2 py-0.5 text-[0.78rem] font-semibold text-tinta-suave">
                    {NOME_PAPEL[pessoa.papel]}
                  </span>
                  <span className="lg:hidden">desde {dataCurta(pessoa.entrada)}</span>
                  <span className="lg:hidden">{desdeQuando(pessoa.ultimoAcesso)}</span>
                  {nota !== null && (
                    <span
                      className={`font-bold tabular-nums lg:hidden ${nota < 5 ? "text-alerta" : "text-tinta"}`}
                    >
                      nota {fmt(nota)}
                    </span>
                  )}
                </div>

                <span className="hidden text-[0.85rem] tabular-nums text-tinta-suave lg:block">
                  {dataCurta(pessoa.entrada)}
                </span>

                <span
                  className={`hidden text-right text-[1.05rem] font-bold tabular-nums tracking-[-0.01em] lg:block ${
                    nota === null ? "text-suave" : nota < 5 ? "text-alerta" : "text-tinta"
                  }`}
                >
                  {nota === null ? "·" : fmt(nota)}
                </span>

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
      )}

      <p className="border-t border-linha pt-4 text-[0.8rem] text-suave">
        Quem é desativado perde o acesso ao sistema e sai dos rankings do ciclo, mas o
        histórico e as avaliações anteriores continuam guardados. Dá para reativar depois.
      </p>
    </Pagina>
  );
}
