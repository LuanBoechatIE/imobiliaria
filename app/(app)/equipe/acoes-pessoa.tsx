"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { alternarStatus } from "./acoes";
import { executar } from "@/lib/acao";
import { FormularioPessoa } from "./formulario-pessoa";
import type { Pessoa } from "@/lib/equipe";

export function AcoesPessoa({ pessoa }: { pessoa: Pessoa }) {
  const [aberto, setAberto] = useState(false);
  const [enviando, iniciarTransicao] = useTransition();
  const caixa = useRef<HTMLDivElement>(null);
  const inativo = pessoa.status === "inativo";

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  function mudarStatus() {
    setAberto(false);
    const dados = new FormData();
    dados.set("id", pessoa.id);

    iniciarTransicao(async () => {
      await executar(() => alternarStatus(dados), {
        titulo: inativo
          ? `${pessoa.nome} voltou para a equipe`
          : `${pessoa.nome} foi desativado`,
        descricao: inativo
          ? "Já pode entrar no sistema e volta a ser avaliado no ciclo."
          : "Perdeu o acesso e saiu dos rankings. O histórico continua guardado.",
      });
    });
  }

  return (
    <div ref={caixa} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label={`Ações de ${pessoa.nome}`}
        aria-expanded={aberto}
        disabled={enviando}
        className="alvo-toque grid size-8 place-items-center rounded-lg border border-transparent text-suave transition-colors hover:border-linha-forte hover:bg-fundo-2 hover:text-tinta disabled:opacity-50"
      >
        <MoreHorizontal size={18} />
      </button>

      {aberto && (
        <div className="surge absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-lg border border-linha bg-white py-1 shadow-lg">
            {pessoa.papel === "corretor" && !inativo && (
              <Link
                href={`/painel/corretor/${pessoa.id}`}
                className="alvo-alto block px-3 py-2 text-[0.88rem] text-tinta-suave no-underline transition-colors hover:bg-fundo-2"
              >
                Ver avaliação
              </Link>
            )}

            <FormularioPessoa pessoa={pessoa} gatilho="item" />

            <button
              type="button"
              onClick={mudarStatus}
              className={`alvo-alto flex w-full items-center px-3 py-2 text-left text-[0.88rem] transition-colors hover:bg-fundo-2 ${
                inativo ? "text-ok" : "text-alerta"
              }`}
            >
              {inativo ? "Reativar acesso" : "Desativar acesso"}
            </button>
        </div>
      )}
    </div>
  );
}
