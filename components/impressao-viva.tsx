"use client";

/**
 * A silhueta que viaja até a nota nova, em vez de saltar para ela.
 *
 * É o gesto central do produto: quem avalia mexe na escala e vê a ponta
 * daquele vértice sair do lugar e caminhar até onde a nota mandou. O
 * salto seco entrega a mesma informação e perde o que a forma está
 * dizendo — que ela se fecha nota a nota.
 *
 * Interpola em `requestAnimationFrame` e não com biblioteca de animação
 * porque o que precisa ser animado é o atributo `points` de um
 * polígono, que é uma string: nenhuma biblioteca interpola isso de
 * graça, todas exigiriam animar seis números à mão do mesmo jeito. Em
 * troca, a tela de avaliação não ganha nenhum kB de dependência.
 */

import { useEffect, useRef, useState } from "react";
import { Impressao } from "./impressao";
import { COMPETENCIAS, type Notas } from "@/lib/dados";

/** Longo o bastante para o olho seguir a ponta, curto para não atrasar quem avalia rápido. */
const DURACAO = 460;

/** Desacelera na chegada: a ponta encosta no valor, não bate nele. */
function suavizar(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function semMovimento(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type Props = Omit<React.ComponentProps<typeof Impressao>, "rotuloDe">;

export function ImpressaoViva({ notas, ...resto }: Props) {
  const [desenho, setDesenho] = useState<Notas>(notas);

  // De onde a próxima viagem começa: o último quadro desenhado, e não a
  // nota anterior. Mexer na escala duas vezes seguidas continua de onde
  // a ponta estava, sem teletransporte no meio do caminho.
  const atual = useRef<Notas>(notas);
  const quadro = useRef<number | null>(null);

  // Comparar por valor, e não pela identidade do objeto: quem chama
  // monta um objeto novo a cada tecla digitada no formulário, e por
  // referência a animação reiniciaria do zero a cada letra.
  const alvo = COMPETENCIAS.map((c) => notas[c.chave]).join(",");

  useEffect(() => {
    const de = atual.current;
    const para = notas;

    const igual = COMPETENCIAS.every((c) => Math.abs(de[c.chave] - para[c.chave]) < 0.01);
    if (igual) return;

    if (semMovimento()) {
      atual.current = para;
      setDesenho(para);
      return;
    }

    const comeco = performance.now();

    function passo(agora: number) {
      const t = Math.min(1, (agora - comeco) / DURACAO);
      const k = suavizar(t);

      const quadroAtual = {} as Notas;
      for (const c of COMPETENCIAS) {
        const inicio = de[c.chave];
        const fim = para[c.chave];
        quadroAtual[c.chave] = inicio + (fim - inicio) * k;
      }

      atual.current = quadroAtual;
      setDesenho(quadroAtual);

      if (t < 1) quadro.current = requestAnimationFrame(passo);
    }

    quadro.current = requestAnimationFrame(passo);

    return () => {
      if (quadro.current !== null) cancelAnimationFrame(quadro.current);
    };
    // `notas` entra pelo valor, via `alvo`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alvo]);

  return <Impressao notas={desenho} rotuloDe={notas} {...resto} />;
}
