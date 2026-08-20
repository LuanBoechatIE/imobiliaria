import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import s from "./painel.module.css";
import { Barra } from "./barra";
import { COOKIE_SESSAO, lerSessao } from "@/lib/sessao";
import {
  COMPETENCIAS,
  IMOBILIARIA,
  critica,
  fmt,
  media,
  mediasPorCompetencia,
  type Corretor,
} from "@/lib/dados";

function Medidor({ nota }: { nota: number }) {
  return (
    <div className={s.trilho}>
      <div className={s.preenche} style={{ width: `${(nota / 10) * 100}%` }} />
    </div>
  );
}

function Delta({ pessoa }: { pessoa: Corretor }) {
  if (!pessoa.anterior) return <span className={s.delta}>1º ciclo</span>;

  const diff = media(pessoa.notas) - media(pessoa.anterior);
  if (Math.abs(diff) < 0.05) return <span className={s.delta}>estável</span>;

  const sobe = diff > 0;
  return (
    <span className={`${s.delta} ${sobe ? s.deltaSobe : s.deltaCai}`}>
      {sobe ? "▲" : "▼"} {fmt(Math.abs(diff))}
    </span>
  );
}

export default async function PáginaPainel() {
  const jar = await cookies();
  const sessao = await lerSessao(jar.get(COOKIE_SESSAO)?.value);
  if (!sessao) redirect("/entrar");

  const { nome, cidade, ciclo, cicloAnterior, corretores } = IMOBILIARIA;

  const ranking = [...corretores].sort((a, b) => media(b.notas) - media(a.notas));
  const mediaTime = corretores.reduce((soma, p) => soma + media(p.notas), 0) / corretores.length;
  const porCompetencia = mediasPorCompetencia(corretores);
  const maisFraca = porCompetencia[0];
  const emAtencao = corretores.filter((p) =>
    COMPETENCIAS.some((c) => critica(p.notas[c.chave]))
  ).length;

  return (
    <>
      <Barra nome={sessao.nome} papel={sessao.papel} />

      <main className={s.shell}>
        <div className={s.topo}>
          <div className={s.identidade}>
            <span className={s.selo}>Dados de exemplo</span>
            <h1 className={s.titulo}>{nome}</h1>
            <span className={s.local}>
              {cidade} · {corretores.length} corretores avaliados
            </span>
          </div>
          <div className={s.cicloBox}>
            <span className={s.rotulo}>Ciclo</span>
            <span className={s.ciclo}>{ciclo}</span>
            <span className={s.local}>comparado com {cicloAnterior}</span>
          </div>
        </div>

        <section className={s.resumo}>
          <div className={s.tile}>
            <span className={s.rotulo}>Nota do time</span>
            <span className={s.tileValor}>{fmt(mediaTime)}</span>
            <span className={s.tileNota}>média das 6 competências, de 0 a 10</span>
          </div>
          <div className={s.tile}>
            <span className={s.rotulo}>Ponto mais fraco</span>
            <span className={s.tileValorMenor}>{maisFraca.nome}</span>
            <span className={s.tileNota}>
              média {fmt(maisFraca.valor)}. É onde o time inteiro perde negócio.
            </span>
          </div>
          <div className={s.tile}>
            <span className={s.rotulo}>Precisam de atenção</span>
            <span className={s.tileValor}>{emAtencao}</span>
            <span className={s.tileNota}>
              corretores com pelo menos uma competência abaixo de 5
            </span>
          </div>
        </section>

        <section className={s.bloco}>
          <h2 className={s.blocoTitulo}>Onde o time está</h2>
          <p className={s.blocoSub}>
            Média de cada competência, da mais fraca para a mais forte. A ordem aqui
            define o que entra no treino do mês.
          </p>
          <div className={s.timeGrid}>
            {porCompetencia.map((c) => (
              <div
                key={c.chave}
                className={`${s.timeItem} ${critica(c.valor) ? s.alerta : ""}`}
              >
                <div className={s.timeLinha}>
                  <span className={s.timeNome}>{c.nome}</span>
                  <span className={s.timeValor}>{fmt(c.valor)}</span>
                </div>
                <Medidor nota={c.valor} />
              </div>
            ))}
          </div>
        </section>

        <section className={s.bloco}>
          <h2 className={s.blocoTitulo}>Corretor por corretor</h2>
          <p className={s.blocoSub}>
            Ordenado pela nota geral. Cada competência abaixo de 5 aparece destacada.
          </p>
          <div className={s.lista}>
            {ranking.map((pessoa, i) => (
              <Link
                key={pessoa.id}
                href={`/painel/corretor/${pessoa.id}`}
                className={s.pessoa}
              >
                <span className={s.posicao}>{String(i + 1).padStart(2, "0")}</span>

                <div className={s.pessoaNome}>
                  <span className={s.nome}>{pessoa.nome}</span>
                  <span className={s.desde}>na equipe desde {pessoa.desde}</span>
                </div>

                <div className={s.geral}>
                  <span className={s.geralValor}>{fmt(media(pessoa.notas))}</span>
                  <Delta pessoa={pessoa} />
                </div>

                <div className={s.minis}>
                  {COMPETENCIAS.map((c) => {
                    const nota = pessoa.notas[c.chave];
                    return (
                      <div
                        key={c.chave}
                        className={`${s.mini} ${critica(nota) ? s.alerta : ""}`}
                        title={`${c.nome}: ${fmt(nota)}`}
                      >
                        <div className={s.miniTopo}>
                          <span className={s.miniNome}>{c.curto}</span>
                          <span className={s.miniValor}>{fmt(nota)}</span>
                        </div>
                        <Medidor nota={nota} />
                      </div>
                    );
                  })}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className={s.rodape}>
          <span>
            Toda nota é produzida a partir de evidência: áudio de atendimento, tempo de
            resposta medido e role-play gravado.
          </span>
          <span>Imobiliária fictícia, números ilustrativos. Nenhum dado de cliente real.</span>
        </footer>
      </main>
    </>
  );
}
