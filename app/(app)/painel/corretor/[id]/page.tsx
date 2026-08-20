import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import painel from "../../painel.module.css";
import s from "./corretor.module.css";
import { COOKIE_SESSAO, lerSessao } from "@/lib/sessao";
import {
  COMPETENCIAS,
  IMOBILIARIA,
  acharCorretor,
  critica,
  evidenciaPadrao,
  fmt,
  media,
  type Corretor,
  type PontoHistorico,
} from "@/lib/dados";

function Grafico({ pontos }: { pontos: PontoHistorico[] }) {
  if (pontos.length < 2) return null;

  const L = 4;
  const A = 46;
  const passo = (100 - L * 2) / (pontos.length - 1);
  const y = (n: number) => A - 6 - (n / 10) * (A - 14);

  const coords = pontos.map((p, i) => ({ x: L + i * passo, y: y(p.nota) }));
  const linha = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x} ${c.y}`).join(" ");
  const area = `${linha} L${coords[coords.length - 1].x} ${A} L${coords[0].x} ${A} Z`;

  return (
    <div className={s.historico}>
      <span className={s.rotulo}>Evolução</span>
      <svg className={s.grafico} viewBox={`0 0 100 ${A}`} preserveAspectRatio="none" aria-hidden="true">
        <path className={s.areaGrafico} d={area} />
        <path className={s.linhaGrafico} d={linha} vectorEffect="non-scaling-stroke" />
        {coords.map((c, i) => (
          <circle key={i} className={s.pontoGrafico} cx={c.x} cy={c.y} r="1.8" />
        ))}
      </svg>
      <div className={s.eixo}>
        {pontos.map((p) => (
          <span key={p.ciclo}>{p.ciclo}</span>
        ))}
      </div>
    </div>
  );
}

function Delta({ pessoa }: { pessoa: Corretor }) {
  if (!pessoa.anterior) return <span className={s.delta}>primeiro ciclo</span>;

  const diff = media(pessoa.notas) - media(pessoa.anterior);
  if (Math.abs(diff) < 0.05) return <span className={s.delta}>estável no mês</span>;

  const sobe = diff > 0;
  return (
    <span className={`${s.delta} ${sobe ? s.deltaSobe : s.deltaCai}`}>
      {sobe ? "▲" : "▼"} {fmt(Math.abs(diff))} contra {IMOBILIARIA.cicloAnterior.split(" ")[0]}
    </span>
  );
}

export default async function PáginaCorretor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao) redirect("/entrar");

  const { id } = await params;
  const pessoa = acharCorretor(id);
  if (!pessoa) notFound();

  const aTreinar = COMPETENCIAS.filter((c) => critica(pessoa.notas[c.chave]));

  return (
    <>
      <main className={painel.shell}>
        <Link className={s.voltar} href="/painel">
          ← Voltar para o time
        </Link>

        <div className={s.cabecalho}>
          <div className={s.quem}>
            <span className={s.inicial}>{pessoa.nome.charAt(0)}</span>
            <div className={s.quemTexto}>
              <h1 className={s.nome}>{pessoa.nome}</h1>
              <span className={s.desde}>
                na equipe desde {pessoa.desde} · ciclo de {IMOBILIARIA.ciclo}
              </span>
            </div>
          </div>

          <div className={s.numeros}>
            <div className={s.notaBloco}>
              <span className={s.rotulo}>Nota geral</span>
              <span className={s.notaGrande}>{fmt(media(pessoa.notas))}</span>
              <Delta pessoa={pessoa} />
            </div>
            <Grafico pontos={pessoa.historico} />
          </div>
        </div>

        {aTreinar.length > 0 ? (
          <div className={s.plano}>
            <h2 className={s.planoTitulo}>O que este corretor treina no próximo mês</h2>
            <p className={s.planoTexto}>
              Definido pelas competências abaixo de 5. A trilha dele abre só nesses temas,
              não no conteúdo inteiro.
            </p>
            <div className={s.etiquetas}>
              {aTreinar.map((c) => (
                <span key={c.chave} className={s.etiqueta}>
                  {c.nome}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className={`${s.plano} ${s.planoOk}`}>
            <h2 className={s.planoTitulo}>Nenhuma competência em nível crítico</h2>
            <p className={s.planoTexto}>
              O treino do mês entra na competência mais baixa, para continuar subindo.
            </p>
          </div>
        )}

        <section className={s.bloco}>
          <h2 className={s.blocoTitulo}>As seis competências, com a prova de cada nota</h2>
          <p className={s.blocoSub}>
            Nenhuma nota é opinião. Cada uma vem de áudio de atendimento, tempo medido,
            role-play gravado ou do que está registrado.
          </p>

          <div className={s.competencias}>
            {COMPETENCIAS.map((c) => {
              const nota = pessoa.notas[c.chave];
              const antes = pessoa.anterior?.[c.chave];
              const provas = pessoa.evidencias?.[c.chave] ?? [evidenciaPadrao(c.chave, nota)];

              return (
                <article
                  key={c.chave}
                  className={`${s.competencia} ${critica(nota) ? s.alerta : ""}`}
                >
                  <div className={s.compTopo}>
                    <span className={s.compNome}>{c.nome}</span>
                    <span className={s.compValor}>
                      <span className={s.compNota}>{fmt(nota)}</span>
                      {antes !== undefined ? (
                        <span className={s.compAnterior}>era {fmt(antes)}</span>
                      ) : null}
                    </span>
                  </div>

                  <div className={s.trilho}>
                    <div className={s.preenche} style={{ width: `${(nota / 10) * 100}%` }} />
                  </div>

                  <div className={s.provas}>
                    {provas.map((prova, i) => (
                      <div key={i} className={s.prova}>
                        <span className={s.provaTipo}>{prova.tipo}</span>
                        <p className={s.provaTexto}>
                          {prova.texto} <span className={s.provaQuando}>({prova.quando})</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <footer className={painel.rodape}>
          <span>Imobiliária fictícia, números ilustrativos. Nenhum dado de cliente real.</span>
        </footer>
      </main>
    </>
  );
}
