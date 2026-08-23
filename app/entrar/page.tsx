import type { Metadata } from "next";
import s from "./entrar.module.css";
import { entrar } from "./acoes";
import { AcessoDemo } from "./acesso-demo";

export const metadata: Metadata = {
  title: "Entrar",
};

export default async function PáginaEntrar({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; de?: string }>;
}) {
  const { erro, de } = await searchParams;

  return (
    <div className={s.tela}>
      <aside className={s.marca}>
        <div className={s.logo}>
          <span className={s.logoMarca}>B</span>
          <span className={s.logoNome}>Boechat</span>
        </div>

        <div className={s.discurso}>
          <h2 className={s.discursoTitulo}>
            Você não descobre quem vende bem olhando o fim do mês.
          </h2>
          <p className={s.discursoTexto}>
            Aqui cada corretor é avaliado nas seis competências que decidem uma venda,
            todo mês, com evidência. O que estiver baixo vira treino.
          </p>
        </div>

        <div className={s.provas}>
          <span className={s.prova}>
            <span className={s.provaMarca}>✓</span>
            Nota por competência, atualizada todo mês
          </span>
          <span className={s.prova}>
            <span className={s.provaMarca}>✓</span>
            Treino definido pelo que a medição apontou
          </span>
          <span className={s.prova}>
            <span className={s.provaMarca}>✓</span>
            Roda junto com o CRM que você já usa
          </span>
        </div>
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
