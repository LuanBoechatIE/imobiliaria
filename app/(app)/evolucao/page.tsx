import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho, Pagina, Secao } from "@/components/pagina";
import { Impressao } from "@/components/impressao";
import { IMOBILIARIA, fmt, media } from "@/lib/dados";
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

/** Marca a posição de um valor de 0 a 10 numa régua. */
function pct(nota: number) {
  return `${(nota / 10) * 100}%`;
}

export default async function PáginaEvolucao() {
  const { ciclo, cicloInicial } = IMOBILIARIA;
  const time = notaDoTime();
  const competencias = competenciasComparadas();
  const zonaCritica = criticos();
  const individual = evolucaoIndividual();
  const indicadores = indicadoresComerciais();
  const novatos = entraramDepois();
  const quantos = comparaveis().length;

  const ganhoTime = time.depois - time.antes;
  const maiorGanho = competencias[0];

  return (
    <Pagina>
      <Cabecalho
        etiqueta={`${cicloInicial} → ${ciclo}`}
        titulo="Antes e depois"
        apoio={`O que mudou nos ${quantos} corretores que já estavam aqui quando começamos.`}
      />

      {/* Herói: a resposta da tela em uma linha, com a prova do lado. */}
      <section className="grid gap-6 rounded-xl border border-linha bg-white px-5 py-6 sm:px-7 sm:py-7 md:grid-cols-[1fr_auto] md:items-center md:gap-10">
        <div className="flex flex-col gap-3">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
            Nota do time
          </span>

          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-[2.6rem] font-extrabold leading-none tracking-[-0.04em] tabular-nums text-suave">
              {fmt(time.antes)}
            </span>
            <span className="text-[2rem] font-medium leading-none text-linha-forte">→</span>
            <span className="text-[4rem] font-extrabold leading-none tracking-[-0.045em] tabular-nums text-laranja">
              {fmt(time.depois)}
            </span>
          </div>

          <p className="m-0 max-w-[46ch] text-[0.95rem] text-tinta-suave">
            <strong className="font-bold text-ok">+{fmt(ganhoTime)} pontos</strong> desde o
            diagnóstico. O maior salto foi em{" "}
            <strong className="font-bold text-tinta">
              {maiorGanho.nome.toLowerCase()}
            </strong>
            , que era a competência mais trabalhada nos treinamentos.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Impressao
            notas={notasMediasDoTime("depois")}
            antes={notasMediasDoTime("antes")}
            tamanho={150}
            comEixos
          />
          <div className="flex items-center gap-4 text-[0.78rem]">
            <span className="inline-flex items-center gap-1.5 text-suave">
              <svg width="16" height="6" aria-hidden="true">
                <line
                  x1="0"
                  y1="3"
                  x2="16"
                  y2="3"
                  stroke="var(--suave)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              </svg>
              {cicloInicial.split(" ")[0]}
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-tinta-suave">
              <svg width="16" height="6" aria-hidden="true">
                <line x1="0" y1="3" x2="16" y2="3" stroke="var(--laranja)" strokeWidth="2.5" />
              </svg>
              {ciclo.split(" ")[0]}
            </span>
          </div>
        </div>
      </section>

      {/* Competências: quanto cada uma andou na régua de 0 a 10. */}
      <Secao
        titulo="As seis competências"
        apoio="Ordenadas pelo tamanho do avanço. A linha cinza é onde estava, o ponto laranja é onde está."
      >
        <div className="flex flex-col gap-1 rounded-xl border border-linha bg-white px-4 py-2 sm:px-5">
          {competencias.map((c) => (
            <div
              key={c.chave}
              className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-b border-linha py-3.5 last:border-b-0 sm:grid-cols-[10.5rem_1fr_auto]"
            >
              <span className="text-[0.92rem] font-semibold text-tinta">{c.nome}</span>

              {/* régua */}
              <div className="col-span-2 sm:col-span-1">
                <div className="relative h-5">
                  <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-fundo-2" />
                  <span
                    className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-laranja/25"
                    style={{ left: pct(c.antes), width: pct(c.depois - c.antes) }}
                  />
                  <span
                    className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-suave"
                    style={{ left: pct(c.antes) }}
                    title={`Antes: ${fmt(c.antes)}`}
                  />
                  <span
                    className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-laranja"
                    style={{ left: pct(c.depois) }}
                    title={`Depois: ${fmt(c.depois)}`}
                  />
                </div>
              </div>

              <div className="flex items-baseline justify-end gap-2 tabular-nums">
                <span className="text-[0.88rem] text-suave">{fmt(c.antes)}</span>
                <span className="text-[0.85rem] text-linha-forte">→</span>
                <span className="w-9 text-right text-[1.1rem] font-extrabold tracking-[-0.02em] text-tinta">
                  {fmt(c.depois)}
                </span>
                <span className="w-11 text-right text-[0.82rem] font-bold text-ok">
                  +{fmt(c.ganho)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Secao>

      {/* Zona crítica: o número que o dono mais entende. */}
      <section className="flex flex-col gap-4 rounded-xl border border-linha bg-white px-5 py-5 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex shrink-0 flex-col gap-1.5">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-suave">
            Corretores com competência abaixo de 5
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-[2.4rem] font-extrabold leading-none tracking-[-0.04em] tabular-nums text-suave">
              {zonaCritica.antes}
            </span>
            <span className="text-[1.6rem] font-medium leading-none text-linha-forte">→</span>
            <span
              className={`text-[3rem] font-extrabold leading-none tracking-[-0.045em] tabular-nums ${
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
              {zonaCritica.saiaram.map((p) => p.nome).join(", ")}. Nenhuma competência
              abaixo de 5 hoje.
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
                    className="font-semibold underline decoration-linha-forte underline-offset-2 hover:text-laranja-escuro"
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

      {/* Individual: mesma impressão do painel, agora com o fantasma do início. */}
      <Secao
        titulo="Corretor por corretor"
        apoio="O contorno tracejado é o formato de dezembro. O sólido é hoje."
      >
        <div className="flex flex-col gap-2">
          {individual.map((p) => {
            const pessoa = comparaveis().find((c) => c.id === p.id)!;
            return (
              <Link
                key={p.id}
                href={`/painel/corretor/${p.id}`}
                className="group flex items-center gap-4 rounded-xl border border-linha bg-white px-4 py-3.5 no-underline transition-colors hover:border-laranja"
              >
                <Impressao notas={pessoa.notas} antes={pessoa.inicial} tamanho={44} />

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[1rem] font-bold tracking-[-0.015em] text-tinta group-hover:text-laranja-escuro">
                    {p.nome}
                  </span>
                  <span className="text-[0.82rem] text-suave">
                    {p.ganho >= 1.5
                      ? "avanço grande no período"
                      : p.ganho >= 0.5
                        ? "avanço consistente"
                        : "praticamente parado"}
                  </span>
                </div>

                <div className="flex shrink-0 items-baseline gap-2 tabular-nums">
                  <span className="text-[0.95rem] text-suave">{fmt(p.antes)}</span>
                  <span className="text-[0.9rem] text-linha-forte">→</span>
                  <span className="text-[1.45rem] font-extrabold leading-none tracking-[-0.03em] text-tinta">
                    {fmt(p.depois)}
                  </span>
                  <span
                    className={`w-11 text-right text-[0.85rem] font-bold ${p.ganho > 0 ? "text-ok" : "text-suave"}`}
                  >
                    {p.ganho > 0 ? `+${fmt(p.ganho)}` : fmt(p.ganho)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Secao>

      {/* Indicadores comerciais: onde a nota vira dinheiro. */}
      <Secao
        titulo="O que isso fez na operação"
        apoio="Os números do funil no mês do diagnóstico e no mês atual."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {indicadores.map((ind) => {
            const bom = melhorou(ind);
            return (
              <div
                key={ind.chave}
                className="flex flex-col gap-2 rounded-xl border border-linha bg-white px-4 py-4"
              >
                <span className="text-[0.85rem] font-semibold text-tinta-suave">
                  {ind.nome}
                </span>

                <div className="flex items-baseline gap-2.5 tabular-nums">
                  <span className="text-[1.15rem] font-semibold text-suave">
                    {escrever(ind.antes, ind.formato)}
                  </span>
                  <span className="text-[1rem] text-linha-forte">→</span>
                  <span
                    className={`text-[1.9rem] font-extrabold leading-none tracking-[-0.035em] ${bom ? "text-laranja" : "text-tinta-suave"}`}
                  >
                    {escrever(ind.depois, ind.formato)}
                  </span>
                </div>

                <p className="m-0 text-[0.84rem] text-suave">{ind.leitura}</p>
              </div>
            );
          })}
        </div>
      </Secao>

      <footer className="flex flex-col gap-1.5 border-t border-linha pt-5 text-[0.82rem] text-suave">
        <span>
          A comparação usa só os {quantos} corretores que já estavam na equipe em{" "}
          {cicloInicial.toLowerCase()}. Incluir quem entrou depois mudaria a média sem que
          nada tivesse mudado de verdade.
        </span>
        {novatos.length > 0 && (
          <span>
            Fora da conta:{" "}
            {novatos.map((p) => p.nome).join(", ")}, que {novatos.length === 1 ? "entrou" : "entraram"}{" "}
            depois do diagnóstico.
          </span>
        )}
      </footer>
    </Pagina>
  );
}
