import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Pagina, Secao } from "@/components/pagina";
import { HexAvatar } from "@/components/hex-avatar";
import {
  CICLO_ATUAL,
  ROTULO_STATUS,
  acharAvaliacao,
  corretoresDoCiclo,
  quantasPreenchidas,
  resumoDoCiclo,
  statusDe,
  type StatusAvaliacao,
} from "@/lib/avaliacoes";
import { COMPETENCIAS } from "@/lib/dados";
import { desdeQuando } from "@/lib/equipe";

export const metadata: Metadata = { title: "Avaliações" };

const ESTILO: Record<StatusAvaliacao, string> = {
  avaliado: "border-ok/30 bg-ok-suave text-ok",
  "em-andamento": "border-laranja/30 bg-laranja-suave text-acao",
  "nao-avaliado": "border-linha-forte bg-fundo-2 text-suave",
};

const ORDEM: Record<StatusAvaliacao, number> = {
  "em-andamento": 0,
  "nao-avaliado": 1,
  avaliado: 2,
};

const ACAO: Record<StatusAvaliacao, string> = {
  avaliado: "Rever",
  "em-andamento": "Continuar",
  "nao-avaliado": "Iniciar",
};

/**
 * Uma pessoa da coleta. O hexágono enche de baixo para cima conforme as
 * provas entram: cheio é avaliação fechada, pela metade é coleta em
 * andamento, vazio é ninguém começou. Ler quanto falta vira olhar a
 * malha, não somar números.
 */
function HexColeta({
  nome,
  feitas,
  total,
  atraso,
}: {
  nome: string;
  feitas: number;
  total: number;
  atraso: number;
}) {
  const pct = (feitas / total) * 100;
  const cheio = feitas === total;

  return (
    <span
      title={`${nome} · ${feitas} de ${total} provas`}
      style={{ width: 56, height: 62 }}
      // A moldura é o que representa "não iniciada", então ela é o
      // elemento gráfico que precisa se separar do fundo, não o miolo.
      className="hex-recorte grid shrink-0 place-items-center bg-borda-campo"
    >
      <span
        style={{ width: 53, height: 59 }}
        className="hex-recorte relative grid place-items-end overflow-hidden bg-white"
      >
        <span
          className="coluna-enche absolute inset-x-0 bottom-0 block"
          style={{
            height: `${pct}%`,
            animationDelay: `${atraso}ms`,
            // Fechada usa a cor de ação; em andamento, a marca. Os dois
            // tons passam 3:1 sobre o fundo da malha, e a altura do
            // preenchimento continua sendo o código principal.
            background: cheio ? "var(--acao)" : "var(--laranja)",
          }}
        />
        <span
          className={`relative z-10 w-full pb-2.5 text-center text-[0.72rem] font-bold ${cheio ? "text-white" : "text-tinta"}`}
        >
          {nome
            .split(/\s+/)
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </span>
      </span>
    </span>
  );
}

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

  const semComecar = resumo.total - resumo.avaliados - resumo.emAndamento;

  return (
    <Pagina>
      {ok && (
        <p className="m-0 flex items-center gap-2 rounded-lg border border-ok/30 bg-ok-suave px-4 py-3 text-[0.9rem] font-medium text-ok">
          <CheckCircle2 size={17} />
          Avaliação concluída e registrada no ciclo.
        </p>
      )}

      <section className="grid overflow-hidden rounded-xl border border-linha bg-white lg:grid-cols-[1fr_24rem]">
        <div className="flex flex-col px-6 py-6 sm:px-7">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
            Coleta de {CICLO_ATUAL.toLowerCase()}
          </span>

          <h1 className="m-0 mt-3 max-w-[18ch] text-[1.85rem] font-bold leading-[1.12] tracking-[-0.028em] text-tinta">
            {resumo.pendentes === 0
              ? "O ciclo está inteiro coletado."
              : `Faltam ${resumo.pendentes} ${resumo.pendentes === 1 ? "corretor" : "corretores"} para o ciclo fechar.`}
          </h1>

          <p className="m-0 mt-3 max-w-[50ch] text-[0.95rem] text-tinta-suave">
            Cada hexágono ao lado é uma pessoa. Cheio, avaliação fechada com as seis provas.
            Pela metade, coleta em andamento. Vazio, ninguém começou.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4 border-t border-linha pt-5">
            <div className="flex flex-col">
              <span className="text-[1.35rem] font-bold leading-tight tabular-nums tracking-[-0.02em] text-tinta">
                {resumo.avaliados} de {resumo.total}
              </span>
              <span className="text-[0.76rem] text-suave">Avaliações fechadas</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[1.35rem] font-bold leading-tight tabular-nums tracking-[-0.02em] text-tinta">
                {resumo.notasLancadas} de {resumo.notasTotais}
              </span>
              <span className="text-[0.76rem] text-suave">Provas coletadas</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[1.35rem] font-bold leading-tight tabular-nums tracking-[-0.02em] text-tinta">
                {semComecar}
              </span>
              <span className="text-[0.76rem] text-suave">Sem começar</span>
            </div>
          </div>
        </div>

        <div className="border-t border-linha bg-fundo px-5 py-6 lg:border-l lg:border-t-0">
          <div className="flex flex-wrap justify-center gap-2.5">
            {corretores.map((pessoa, i) => (
              <HexColeta
                key={pessoa.id}
                nome={pessoa.nome}
                feitas={quantasPreenchidas(pessoa.id)}
                total={total}
                atraso={i * 55}
              />
            ))}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[0.78rem] text-tinta-suave">
            <span className="inline-flex items-center gap-1.5">
              <span
                style={{ width: 10, height: 11 }}
                className="hex-recorte bg-acao"
                aria-hidden="true"
              />
              Fechada
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                style={{ width: 10, height: 11 }}
                className="hex-recorte bg-laranja"
                aria-hidden="true"
              />
              Em andamento
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                style={{ width: 10, height: 11 }}
                className="hex-recorte bg-linha-forte"
                aria-hidden="true"
              />
              Não iniciada
            </span>
          </div>
        </div>
      </section>

      <Secao
        titulo="Corretores do ciclo"
        apoio="Quem já começou aparece primeiro. Corretor desativado não entra no ciclo."
      >
        <div className="overflow-hidden rounded-xl border border-linha bg-white">
          <div className="hidden grid-cols-[2.5rem_minmax(9rem,1fr)_9rem_11rem_7rem_6rem] items-center gap-4 border-b border-linha px-5 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-suave lg:grid">
            <span />
            <span>Corretor</span>
            <span>Avaliador</span>
            <span>Provas coletadas</span>
            <span>Atualizado</span>
            <span className="text-right">Estado</span>
          </div>

          {corretores.map((pessoa) => {
            const status = statusDe(pessoa.id);
            const feitas = quantasPreenchidas(pessoa.id);
            const avaliacao = acharAvaliacao(pessoa.id);

            return (
              <Link
                key={pessoa.id}
                href={`/avaliacoes/${pessoa.id}`}
                className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-2 border-t border-linha px-4 py-3 no-underline transition-colors first:border-t-0 hover:bg-fundo lg:grid-cols-[2.5rem_minmax(9rem,1fr)_9rem_11rem_7rem_6rem] lg:px-5"
              >
                <HexAvatar
                  nome={pessoa.nome}
                  tamanho={34}
                  tom={status === "nao-avaliado" ? "neutro" : "laranja"}
                />

                <span className="min-w-0 truncate text-[0.96rem] font-semibold tracking-[-0.01em] text-tinta">
                  {pessoa.nome}
                </span>

                <span className="hidden text-[0.85rem] text-tinta-suave lg:block">
                  {avaliacao?.avaliadaPor ?? "não definido"}
                </span>

                <div className="col-span-3 flex items-center gap-2.5 lg:col-span-1">
                  <span className="block h-[7px] w-24 shrink-0 overflow-hidden rounded-full bg-fundo-2">
                    <span
                      className={`block h-full rounded-full ${status === "avaliado" ? "bg-ok" : "bg-acao"}`}
                      style={{ width: `${(feitas / total) * 100}%` }}
                    />
                  </span>
                  <span className="text-[0.79rem] tabular-nums text-suave">
                    {feitas} de {total}
                  </span>
                </div>

                <span className="hidden text-[0.83rem] text-suave lg:block">
                  {desdeQuando(avaliacao?.atualizadaEm ?? null)}
                </span>

                <span className="flex items-center justify-end gap-1.5">
                  <span
                    className={`hidden rounded-full border px-2 py-0.5 text-[0.72rem] font-semibold lg:inline ${ESTILO[status]}`}
                  >
                    {ROTULO_STATUS[status]}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[0.85rem] font-semibold text-acao lg:hidden">
                    {ACAO[status]}
                    <ChevronRight size={16} />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </Secao>
    </Pagina>
  );
}
