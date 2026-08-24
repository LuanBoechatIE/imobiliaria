"use client";

import { useState, useTransition } from "react";
import { Check, Play, Send } from "lucide-react";
import { comecarAtividade, enviarAtividade } from "./acoes";
import { executar } from "@/lib/acao";
import { BOTAO, CAMPO } from "@/components/estilos";
import type { StatusAtividade } from "@/lib/atividades-corretor";
import { cn } from "@/lib/utils";

const LIMITE = 4000;

/**
 * O que o corretor faz na atividade: começar e entregar.
 *
 * ⛔ Não existe "marcar como concluída". Entregar manda para revisão, e
 * quem fecha é o gestor. Deixar a pessoa fechar a própria tarefa
 * transformaria a nota numa autodeclaração, e a nota é o produto.
 */
export function Entrega({
  id,
  status,
  resposta,
}: {
  id: string;
  status: StatusAtividade;
  resposta: string | null;
}) {
  const [texto, setTexto] = useState(resposta ?? "");
  const [emTransicao, iniciarTransicao] = useTransition();

  function comecar() {
    const dados = new FormData();
    dados.set("id", id);
    iniciarTransicao(async () => {
      await executar(() => comecarAtividade(dados), {
        titulo: "Atividade iniciada",
        descricao: "Ela aparece como em andamento até você enviar.",
      });
    });
  }

  function enviar() {
    const dados = new FormData();
    dados.set("id", id);
    dados.set("resposta", texto);
    iniciarTransicao(async () => {
      await executar(() => enviarAtividade(dados), {
        titulo: "Enviado para revisão",
        descricao: "A Boechat confere e fecha a atividade.",
      });
    });
  }

  if (status === "concluida") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-ok/30 bg-ok-suave px-5 py-4">
        <Check size={18} className="mt-0.5 shrink-0 text-ok" />
        <div className="min-w-0">
          <p className="m-0 text-[0.95rem] font-semibold text-tinta">Atividade concluída</p>
          {resposta && (
            <p className="m-0 mt-1.5 whitespace-pre-wrap text-[0.9rem] leading-relaxed text-tinta-suave">
              {resposta}
            </p>
          )}
        </div>
      </div>
    );
  }

  const emRevisao = status === "aguardando-revisao";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-linha bg-white px-5 py-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="resposta"
          className="text-[0.95rem] font-semibold tracking-[-0.01em] text-tinta"
        >
          {emRevisao ? "O que você enviou" : "O que você fez"}
        </label>
        <p className="m-0 text-[0.85rem] text-suave">
          {emRevisao
            ? "Já está com a Boechat. Você ainda pode complementar e enviar de novo."
            : "Escreva o que foi feito. É isso que vira evidência da sua próxima nota."}
        </p>
      </div>

      <textarea
        id="resposta"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={5}
        maxLength={LIMITE}
        disabled={emTransicao}
        placeholder="Ex: apliquei o checklist nos 5 leads e anotei crédito, prazo e decisor de cada um."
        className={cn(CAMPO, "resize-y leading-relaxed")}
      />

      <div className="flex flex-wrap items-center gap-2">
        {status === "pendente" && (
          <button
            type="button"
            onClick={comecar}
            disabled={emTransicao}
            className={BOTAO.contorno}
          >
            <Play size={14} />
            Iniciar
          </button>
        )}

        <button
          type="button"
          onClick={enviar}
          disabled={emTransicao || texto.trim().length < 3}
          className={BOTAO.solido}
        >
          <Send size={14} />
          {emRevisao ? "Enviar de novo" : "Enviar para revisão"}
        </button>

        <span className="ml-auto text-[0.78rem] tabular-nums text-suave">
          {texto.length}/{LIMITE}
        </span>
      </div>
    </div>
  );
}
