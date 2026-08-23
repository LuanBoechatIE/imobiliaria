import type { Metadata } from "next";
import s from "./entrar.module.css";
import { entrar } from "./acoes";
import { AcessoDemo } from "./acesso-demo";
import { Impressao } from "@/components/impressao";
import { COMPETENCIAS } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Entrar",
};

/** Silhueta ilustrativa. Não é dado de cliente, é o produto se mostrando. */
const EXEMPLO = {
  velocidade: 7,
  qualificacao: 6,
  visita: 7,
  followup: 4,
  negociacao: 7,
  registro: 6,
};

/** Malha de hexágonos ao fundo do painel de marca. */
function Malha() {
  const linhas = [];
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 7; x++) {
      const cx = 70 + x * 140 + (y % 2 ? 70 : 0);
      const cy = 70 + y * 122;
      const pontos = [0, 1, 2, 3, 4, 5]
        .map((i) => {
          const a = ((-90 + 60 * i) * Math.PI) / 180;
          return `${(cx + 52 * Math.cos(a)).toFixed(1)},${(cy + 52 * Math.sin(a)).toFixed(1)}`;
        })
        .join(" ");
      linhas.push(
        <polygon
          key={`${x}-${y}`}
          points={pontos}
          fill="none"
          stroke="var(--laranja)"
          strokeOpacity="0.13"
          strokeWidth="1"
        />
      );
    }
  }

  return (
    <div className={s.malha} aria-hidden="true">
      <svg
        viewBox="0 0 900 900"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
      >
        {linhas}
      </svg>
    </div>
  );
}

export default async function PáginaEntrar({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; de?: string }>;
}) {
  const { erro, de } = await searchParams;

  return (
    <div className={s.tela}>
      <aside className={s.marca}>
        <Malha />

        <div className={s.logo}>
          <span className={s.logoMarca}>B</span>
          <span className={s.logoNome}>Boechat</span>
        </div>

        <div className={s.discurso}>
          <h2 className={s.discursoTitulo}>
            Corretor bom não é opinião. É evidência medida.
          </h2>
          <p className={s.discursoTexto}>
            Seis competências, nota de 0 a 10, prova anexada em cada nota. A silhueta do
            time muda quando o trabalho muda.
          </p>
          <ul className={s.seis}>
            {COMPETENCIAS.map((c) => (
              <li key={c.chave}>{c.nome}</li>
            ))}
          </ul>
        </div>

        <div className={s.silhueta} aria-hidden="true">
          <Impressao notas={EXEMPLO} tamanho={420} pontas anima className="w-full" />
        </div>

        <p className={s.rodapeMarca}>
          Avaliação, treino e comparação de antes e depois no mesmo lugar.
        </p>
      </aside>

      <main className={s.lado}>
        <div className={s.caixa}>
          <div className={s.logoMobile}>
            <span className={s.logoMarca}>B</span>
            <span className={s.logoNome}>Boechat</span>
          </div>

          <div className={s.cabecalho}>
            <h1 className={s.titulo}>Entrar</h1>
            <p className={s.sub}>Acesse o painel da sua imobiliária.</p>
          </div>

          {erro ? (
            <p className={s.erro}>
              <span aria-hidden="true">!</span>
              <span>E-mail ou senha incorretos. Confira e tente de novo.</span>
            </p>
          ) : null}

          <form action={entrar} className={s.form} data-login>
            <input type="hidden" name="de" value={de ?? ""} />

            <div className={s.campo}>
              <label className={s.rotulo} htmlFor="email">
                E-mail
              </label>
              <input
                className={s.entrada}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="voce@imobiliaria.com"
                required
                autoFocus
              />
            </div>

            <div className={s.campo}>
              <label className={s.rotulo} htmlFor="senha">
                Senha
              </label>
              <input
                className={s.entrada}
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </div>

            <button className={s.botao} type="submit">
              Entrar
            </button>
          </form>

          <div className={s.rodape}>
            <AcessoDemo />
          </div>
        </div>
      </main>
    </div>
  );
}
