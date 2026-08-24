import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho, Pagina } from "@/components/pagina";
import { Impressao, Vertice } from "@/components/impressao";
import { IMOBILIARIA, critica, fmt } from "@/lib/dados";
import {
  comparaveis,
  competenciasComparadas,
  criticos,
  entraramDepois,
  escrever,
  evolucaoIndividual,
  indicadoresComerciais,
  melhorou,
  notaDoTime,
  notasMediasDoTime,
} from "@/lib/evolucao";

export const metadata: Metadata = { title: "Antes e depois" };

function Placar({
  valor,
  rotulo,
  apoio,
  tom,
}: {
  valor: string;
  rotulo: string;
  apoio?: string;
  tom?: "ok" | "alerta";
}) {
  return (
    <div className="flex flex-col">
      <span
        className={`text-[1.75rem] font-bold leading-tight tabular-nums tracking-[-0.028em] ${
          tom === "ok" ? "text-ok" : tom === "alerta" ? "text-alerta" : "text-tinta"
        }`}
      >
        {valor}
      </span>
      <span className="max-w-[18ch] text-[0.78rem] text-suave">{rotulo}</span>
      {apoio && <span className="text-[0.78rem] tabular-nums text-suave">{apoio}</span>}
    </div>
  );
}

export default async function PáginaEvolucao() {
  const { ciclo, cicloInicial } = IMOBILIARIA;
  const time = notaDoTime();
  const competencias = competenciasComparadas();
  const zonaCritica = criticos();
  const individual = evolucaoIndividual();
  const indicadores = indicadoresComerciais();
  const novatos = entraramDepois();
  const pessoas = comparaveis();
  const quantos = pessoas.length;

  const ganhoTime = time.depois - time.antes;
  const subiram = competencias.filter((c) => c.ganho > 0).length;
  const vendas = indicadores.find((i) => i.chave === "vendas");
  const aindaFraca = [...competencias].sort((a, b) => a.depois - b.depois)[0];

  return (
    <Pagina>
      <Cabecalho
        etiqueta={`${IMOBILIARIA.nome} · Raio-X de ${cicloInicial.toLowerCase()} comparado ao ciclo de ${ciclo.toLowerCase()}`}
        titulo="Antes e depois"
      />

      {/* A tela responde uma pergunta só, e ela cabe no primeiro olhar:
          o que mudou desde que começamos. */}
      <section className="grid overflow-hidden rounded-xl border border-linha bg-white lg:grid-cols-[1fr_24rem]">
        <div className="flex flex-col px-6 py-7 sm:px-8">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
            O que mudou desde o diagnóstico
          </span>

          <h1 className="m-0 mt-3 max-w-[15ch] text-[2.3rem] font-bold leading-[1.05] tracking-[-0.035em] text-tinta sm:text-[2.7rem]">
            O time saiu de {fmt(time.antes)} para{" "}
            <span className="text-acao">{fmt(time.depois)}</span>.
          </h1>

          <p className="m-0 mt-4 max-w-[46ch] text-[1rem] text-tinta-suave">
            {zonaCritica.saiaram.length > 0
              ? `${zonaCritica.saiaram.length} ${zonaCritica.saiaram.length === 1 ? "corretor deixou" : "corretores deixaram"} a zona crítica e a silhueta do time fechou mais nos seis lados. `
              : "A silhueta do time fechou mais nos seis lados. "}
            O que ainda falta é {aindaFraca.nome.toLowerCase()}, que subiu mas continua
            sendo o lado mais curto.
          </p>

          <div className="mt-7 flex flex-wrap gap-x-9 gap-y-5 border-t border-linha pt-6">
            <Placar
              valor={`${ganhoTime >= 0 ? "+" : "−"}${fmt(Math.abs(ganhoTime))}`}
              rotulo="Na nota do time"
              tom={ganhoTime > 0 ? "ok" : undefined}
            />
            <Placar
              valor={String(zonaCritica.saiaram.length)}
              rotulo="Saíram da zona crítica"
              tom={zonaCritica.saiaram.length > 0 ? "ok" : undefined}
            />
            <Placar
              valor={`${subiram} de ${competencias.length}`}
              rotulo="Competências que subiram"
            />
            {vendas && (
              <Placar
                valor={`+${vendas.depois - vendas.antes}`}
                rotulo="Vendas no mês"
                apoio={`${vendas.antes} para ${vendas.depois}`}
                tom={melhorou(vendas) ? "ok" : "alerta"}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 border-t border-linha bg-laranja-suave px-5 py-7 lg:border-l lg:border-t-0">
          <Impressao
            notas={notasMediasDoTime("depois")}
            antes={notasMediasDoTime("antes")}
            tamanho={310}
            rotulos
            malha
            fraco={aindaFraca.chave}
            anima
            className="max-w-full"
          />
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[0.79rem] text-tinta-suave">
            <span className="inline-flex items-center gap-1.5">
              <svg width="16" height="4" aria-hidden="true">
                <line
                  x1="0"
                  y1="2"
                  x2="16"
                  y2="2"
                  stroke="var(--suave)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </svg>
              Raio-X de {cicloInicial.toLowerCase()}
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <svg width="16" height="4" aria-hidden="true">
                <line x1="0" y1="2" x2="16" y2="2" stroke="var(--laranja)" strokeWidth="2.5" />
              </svg>
              Ciclo de {ciclo.toLowerCase()}
            </span>
          </div>
        </div>
      </section>

      {/* Competência por competência: barra de cima é o Raio-X, a de baixo
          é agora, e a marca vertical é a linha de corte do 5. */}
      <section className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1">
          <h2 className="m-0 text-[1.05rem] font-bold tracking-[-0.015em] text-tinta">
            Competência por competência
          </h2>
          <span className="text-[0.85rem] text-suave">
            barra cinza é o Raio-X, barra laranja é agora, a marca vertical é o 5
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-linha bg-white">
          {competencias.map((c, i) => (
            <div key={c.chave} className="border-t border-linha px-5 py-4 first:border-t-0 sm:px-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Vertice competencia={c.chave} nota={c.depois} tamanho={21} />
                <h3 className="m-0 flex-1 text-[0.98rem] font-bold tracking-[-0.012em] text-tinta">
                  {c.nome}
                </h3>
                <span className="text-[0.85rem] tabular-nums text-suave">
                  {fmt(c.antes)} para{" "}
                  <strong
                    className={`text-[1.05rem] font-bold ${critica(c.depois) ? "text-alerta" : "text-tinta"}`}
                  >
                    {fmt(c.depois)}
                  </strong>
                </span>
                <span
                  className={`w-14 text-right text-[0.85rem] font-bold tabular-nums ${c.ganho > 0 ? "text-ok" : "text-suave"}`}
                >
                  {c.ganho > 0 ? "+" : ""}
                  {fmt(c.ganho)}
                </span>
              </div>

              <div className="relative mt-3 h-[26px]">
                <span
                  className="absolute left-0 top-0 h-[9px] rounded-full bg-linha-forte"
                  style={{ width: `${c.antes * 10}%` }}
                />
                <span
                  className={`barra-enche absolute left-0 top-[13px] h-[9px] rounded-full ${critica(c.depois) ? "bg-alerta" : "bg-acao"}`}
                  style={{ width: `${c.depois * 10}%`, animationDelay: `${i * 70}ms` }}
                />
                <span
                  className="absolute -top-[3px] bottom-[-3px] left-1/2 w-px bg-alerta opacity-45"
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Pessoa por pessoa */}
        <section className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1">
            <h2 className="m-0 text-[1.05rem] font-bold tracking-[-0.015em] text-tinta">
              Pessoa por pessoa
            </h2>
            <span className="text-[0.85rem] text-suave">
              silhueta do Raio-X contra a de hoje
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-linha bg-white">
            {individual.map((p) => {
              const pessoa = pessoas.find((c) => c.id === p.id)!;
              const saiu = p.antes < 5 && p.depois >= 5;

              return (
                <Link
                  key={p.id}
                  href={`/painel/corretor/${p.id}`}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-t border-linha px-4 py-3 no-underline transition-colors first:border-t-0 hover:bg-fundo sm:px-5"
                >
                  <span className="min-w-0 truncate text-[0.94rem] font-semibold text-tinta">
                    {p.nome}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Impressao notas={pessoa.inicial} tamanho={34} className="opacity-45" />
                    <span className="text-[0.85rem] text-suave">›</span>
                    <Impressao notas={pessoa.notas} tamanho={38} anima />
                  </span>

                  <span className="col-span-2 flex items-baseline gap-2 text-[0.85rem] tabular-nums text-suave">
                    {fmt(p.antes)} para{" "}
                    <strong className="text-[1.05rem] font-bold text-tinta">
                      {fmt(p.depois)}
                    </strong>
                    <span
                      className={`ml-auto font-semibold ${
                        saiu
                          ? "text-ok"
                          : p.depois < 5
                            ? "text-alerta"
                            : "text-suave"
                      }`}
                    >
                      {saiu
                        ? "saiu da zona crítica"
                        : p.depois < 5
                          ? "ainda crítico"
                          : "já estava acima de 5"}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Indicadores comerciais */}
        <section className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1">
            <h2 className="m-0 text-[1.05rem] font-bold tracking-[-0.015em] text-tinta">
              O que isso fez na operação
            </h2>
            <span className="text-[0.85rem] text-suave">mesmo período, mesma base</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-linha bg-white">
            {indicadores.map((ind, i) => {
              const bom = melhorou(ind);
              // Barras só fazem sentido em taxa; tempo e contagem viram número.
              const escala = ind.formato === "porcentagem";
              const maior = Math.max(ind.antes, ind.depois) || 1;

              return (
                <div
                  key={ind.chave}
                  className="border-t border-linha px-5 py-3.5 first:border-t-0 sm:px-6"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span className="flex-1 text-[0.92rem] font-semibold text-tinta">
                      {ind.nome}
                    </span>
                    <span className="text-[0.85rem] tabular-nums text-suave">
                      {escrever(ind.antes, ind.formato)} para{" "}
                      <strong
                        className={`text-[1.1rem] font-bold ${bom ? "text-tinta" : "text-alerta"}`}
                      >
                        {escrever(ind.depois, ind.formato)}
                      </strong>
                    </span>
                  </div>

                  {escala && (
                    <div className="relative mt-2.5 h-[22px]">
                      <span
                        className="absolute left-0 top-0 h-2 rounded-full bg-linha-forte"
                        style={{ width: `${(ind.antes / maior) * 100}%` }}
                      />
                      <span
                        className={`barra-enche absolute left-0 top-3 h-2 rounded-full ${bom ? "bg-acao" : "bg-alerta"}`}
                        style={{
                          width: `${(ind.depois / maior) * 100}%`,
                          animationDelay: `${i * 70}ms`,
                        }}
                      />
                    </div>
                  )}

                  <p className="m-0 mt-1.5 text-[0.83rem] text-suave">{ind.leitura}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-3 rounded-xl border border-linha bg-white px-5 py-5 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex shrink-0 flex-col gap-1.5">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
            Corretores com competência abaixo de 5
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-[2.2rem] font-bold leading-none tabular-nums tracking-[-0.035em] text-suave">
              {zonaCritica.antes}
            </span>
            <span className="text-[1.5rem] font-medium leading-none text-suave">›</span>
            <span
              className={`text-[2.8rem] font-bold leading-none tabular-nums tracking-[-0.04em] ${
                zonaCritica.depois < zonaCritica.antes ? "text-ok" : "text-alerta"
              }`}
            >
              {zonaCritica.depois}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-linha sm:border-l sm:pl-8">
          {zonaCritica.saiaram.length > 0 && (
            <p className="m-0 text-[0.92rem] text-tinta-suave">
              <strong className="font-bold text-ok">Saíram da zona crítica:</strong>{" "}
              {zonaCritica.saiaram.map((p) => p.nome).join(", ")}. Nenhuma competência abaixo
              de 5 hoje.
            </p>
          )}
          {zonaCritica.restantes.length > 0 && (
            <p className="m-0 text-[0.92rem] text-tinta-suave">
              <strong className="font-bold text-tinta">Ainda precisam:</strong>{" "}
              {zonaCritica.restantes.map((p, i) => (
                <span key={p.id}>
                  {i > 0 && ", "}
                  <Link
                    href={`/painel/corretor/${p.id}`}
                    className="font-semibold underline decoration-linha-forte underline-offset-2 hover:text-acao"
                  >
                    {p.nome}
                  </Link>
                </span>
              ))}
              . É o trabalho do próximo ciclo.
            </p>
          )}
        </div>
      </section>

      <footer className="flex flex-col gap-1.5 border-t border-linha pt-5 text-[0.82rem] text-suave">
        <span>
          A comparação usa só os {quantos} corretores que já estavam na equipe em{" "}
          {cicloInicial.toLowerCase()}. Incluir quem entrou depois mudaria a média sem que
          nada tivesse mudado de verdade.
        </span>
        {novatos.length > 0 && (
          <span>
            Fora da conta: {novatos.map((p) => p.nome).join(", ")}, que{" "}
            {novatos.length === 1 ? "entrou" : "entraram"} depois do diagnóstico.
          </span>
        )}
      </footer>
    </Pagina>
  );
}
