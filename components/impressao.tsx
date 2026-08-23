import { COMPETENCIAS, critica, type Notas } from "@/lib/dados";

/**
 * A "impressão" do corretor: as seis competências desenhadas como um
 * hexágono. Existe porque seis é um número fixo do produto — o formato
 * vira reconhecível, e comparar pessoas passa a ser comparar silhuetas
 * em vez de ler seis números.
 *
 * O anel tracejado marca o 5, que é a linha de corte. Quem cai abaixo
 * dela aparece afundado pra dentro do anel, sem precisar de legenda.
 */

const LADOS = COMPETENCIAS.length;

function pontos(valores: number[], raio: number, centro: number): string {
  return valores
    .map((valor, i) => {
      const angulo = (-90 + (360 / LADOS) * i) * (Math.PI / 180);
      const r = (Math.max(valor, 0) / 10) * raio;
      return `${centro + r * Math.cos(angulo)},${centro + r * Math.sin(angulo)}`;
    })
    .join(" ");
}

export function Impressao({
  notas,
  tamanho = 44,
  comEixos = false,
}: {
  notas: Notas;
  tamanho?: number;
  /** Mostra o nome de cada competência ao redor. Só cabe em tamanho grande. */
  comEixos?: boolean;
}) {
  const margem = comEixos ? 34 : 3;
  const raio = tamanho / 2;
  const centro = raio + margem;
  const lado = (raio + margem) * 2;

  const valores = COMPETENCIAS.map((c) => notas[c.chave]);
  const temCritica = valores.some(critica);
  const cor = temCritica ? "var(--alerta)" : "var(--laranja)";

  const limite = pontos(Array(LADOS).fill(10), raio, centro);
  const corte = pontos(Array(LADOS).fill(5), raio, centro);
  const forma = pontos(valores, raio, centro);

  return (
    <svg
      width={lado}
      height={lado}
      viewBox={`0 0 ${lado} ${lado}`}
      className="shrink-0 overflow-visible"
      aria-hidden="true"
    >
      <polygon points={limite} fill="var(--fundo-2)" stroke="none" />
      <polygon
        points={corte}
        fill="none"
        stroke="var(--linha-forte)"
        strokeWidth="1"
        strokeDasharray="2 2.5"
      />
      <polygon points={forma} fill={cor} fillOpacity="0.22" stroke={cor} strokeWidth="1.5" />

      {COMPETENCIAS.map((c, i) => {
        const angulo = (-90 + (360 / LADOS) * i) * (Math.PI / 180);
        const r = (Math.max(valores[i], 0) / 10) * raio;
        return (
          <circle
            key={c.chave}
            cx={centro + r * Math.cos(angulo)}
            cy={centro + r * Math.sin(angulo)}
            r={comEixos ? 3 : 1.8}
            fill={critica(valores[i]) ? "var(--alerta)" : cor}
          />
        );
      })}

      {comEixos &&
        COMPETENCIAS.map((c, i) => {
          const angulo = (-90 + (360 / LADOS) * i) * (Math.PI / 180);
          const rx = centro + (raio + 16) * Math.cos(angulo);
          const ry = centro + (raio + 16) * Math.sin(angulo);
          const alinhamento =
            Math.abs(Math.cos(angulo)) < 0.2 ? "middle" : Math.cos(angulo) > 0 ? "start" : "end";
          return (
            <text
              key={c.chave}
              x={rx}
              y={ry}
              textAnchor={alinhamento}
              dominantBaseline="middle"
              fontSize="10.5"
              fontWeight={critica(valores[i]) ? 700 : 500}
              fill={critica(valores[i]) ? "var(--alerta)" : "var(--suave)"}
            >
              {c.curto}
            </text>
          );
        })}
    </svg>
  );
}
