import s from "./painel.module.css";
import { sair } from "../entrar/acoes";
import type { Papel } from "@/lib/sessao";

const NOME_PAPEL: Record<Papel, string> = {
  boechat: "Equipe Boechat",
  dono: "Dono",
  gestor: "Gestor comercial",
  corretor: "Corretor",
};

export function Barra({ nome, papel }: { nome: string; papel: Papel }) {
  return (
    <header className={s.barra}>
      <div className={s.barraDentro}>
        <div className={s.logo}>
          <span className={s.logoMarca}>B</span>
          <span className={s.logoNome}>Boechat</span>
        </div>

        <div className={s.usuario}>
          <div className={s.usuarioInfo}>
            <span className={s.usuarioNome}>{nome}</span>
            <span className={s.usuarioPapel}>{NOME_PAPEL[papel]}</span>
          </div>
          <form action={sair}>
            <button className={s.sair} type="submit">
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
