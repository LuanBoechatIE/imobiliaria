import { COMPETENCIAS, critica, fmt, type ChaveCompetencia, type Notas } from "@/lib/dados";
import { cn } from "@/lib/utils";

/**
 * A "impressão" do corretor: as seis competências desenhadas como um
 * hexágono. Existe porque seis é um número fixo do produto — o formato
 * vira reconhecível, e comparar pessoas passa a ser comparar silhuetas
 * em vez de ler seis números.
 *
 * A ordem dos vértices é a mesma em toda tela do sistema, senão comparar
 * formato não significaria nada. O anel tracejado vermelho marca o 5,
 * que é a linha de corte: o que afunda pra dentro dele precisa de
 * atenção, sem precisar de legenda.
 *
 * O desenho vive num viewBox fixo, então o mesmo componente serve de
 * miniatura de 36px numa lista e de protagonista de 300px numa tela.
 */

const LADOS = COMPETENCIAS.length;
const CENTRO = 100;

/** Posição de um vértice no anel de raio r. O 0 fica no topo. */
function ponto(raio: number, i: number): [number, number] {
  const angulo = (-90 + (360 / LADOS) * i) * (Math.PI / 180);
  return [CENTRO + raio * Math.cos(angulo), CENTRO + raio * Math.sin(angulo)];
}

function poligono(valores: number[], raio: number): string {
  return valores
    .map((valor, i) => {
      const [x, y] = ponto((Math.max(valor, 0) / 10) * raio, i);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function anel(valor: number, raio: number): string {
  return poligono(Array(LADOS).fill(valor), raio);
}

export function Impressao({
  notas,
  rotuloDe,
  antes,
  tamanho = 44,
  rotulos = false,
  malha = false,
  pontas = false,
  fraco,
  anima = false,
  className,
}: {
  notas: Notas;
  /**
   * Notas de verdade, quando `notas` está em movimento.
   *
   * Existe por causa da silhueta que viaja até a nota nova (ver
   * `ImpressaoViva`): a geometria precisa dos valores quebrados de cada
   * quadro, mas o texto do rótulo e a cor de alerta não podem rodar
   * junto — número girando 8,3 · 7,6 · 6,9 vira ruído, e a cor piscaria
   * ao cruzar o 5 no meio do caminho.
   */
  rotuloDe?: Notas;
  /** Quando existe, desenha o momento anterior por baixo, em fantasma. */
  antes?: Notas;
  /** Largura do desenho em pixels. */
  tamanho?: number;
  /** Nome e nota de cada competência ao redor. Só cabe acima de ~180px. */
  rotulos?: boolean;
  /** Anéis de referência e eixos, para ler a distância até o 10. */
  malha?: boolean;
  /** Bolinha em cada vértice. */
  pontas?: boolean;
  /** Vértice que a tela quer que a pessoa olhe primeiro. */
  fraco?: ChaveCompetencia;
  anima?: boolean;
  className?: string;
}) {
  // Com rótulos o viewBox abre espaço em volta, então o raio encolhe.
  const raio = rotulos ? 63 : 82;
  const vb = rotulos ? { x: -36, y: -8, l: 272, a: 216 } : { x: 0, y: 0, l: 200, a: 200 };

  const valores = COMPETENCIAS.map((c) => notas[c.chave]);
  // O que se lê vem do valor final; o que se desenha, do quadro atual.
  const lidos = COMPETENCIAS.map((c) => (rotuloDe ?? notas)[c.chave]);
  const temCritica = lidos.some(critica);

  // O traço é o que separa a silhueta do fundo, e ela aparece tanto sobre
  // branco quanto sobre --laranja-suave, então usa a cor de ação, que
  // passa 3:1 nos dois. O preenchimento por baixo continua sendo a marca.
  const cor = temCritica ? "var(--alerta)" : "var(--acao)";
  const preenchimento = temCritica ? "var(--alerta)" : "var(--laranja)";
  const indiceFraco = fraco ? COMPETENCIAS.findIndex((c) => c.chave === fraco) : -1;

  return (
    <svg
      width={tamanho}
      height={(tamanho * vb.a) / vb.l}
      viewBox={`${vb.x} ${vb.y} ${vb.l} ${vb.a}`}
      className={cn("shrink-0 overflow-visible", className)}
      aria-hidden="true"
    >
      {malha && (
        <>
          <polygon points={anel(2.5, raio)} fill="none" stroke="var(--linha)" strokeWidth="1" />
          <polygon points={anel(7.5, raio)} fill="none" stroke="var(--linha)" strokeWidth="1" />
          {COMPETENCIAS.map((c, i) => {
            const [x, y] = ponto(raio, i);
            return (
              <line
                key={c.chave}
                x1={CENTRO}
                y1={CENTRO}
                x2={x.toFixed(2)}
                y2={y.toFixed(2)}
                stroke="var(--linha)"
                strokeWidth="1"
              />
            );
          })}
        </>
      )}

      {/* Linha de corte do 5. Vermelha porque é a régua do produto. */}
      <polygon
        points={anel(5, raio)}
        fill="none"
        stroke="var(--alerta)"
        strokeWidth="1"
        strokeDasharray="2 4"
        opacity="0.55"
      />

      {/* Limite do 10. */}
      <polygon points={anel(10, raio)} fill="none" stroke="var(--linha-forte)" strokeWidth="1" />

      {antes && (
        <polygon
          points={poligono(
            COMPETENCIAS.map((c) => antes[c.chave]),
            raio
          )}
          fill="none"
          stroke="var(--suave)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeLinejoin="round"
        />
      )}

      <g className={anima ? "hex-cresce" : undefined}>
        <polygon
          points={poligono(valores, raio)}
          fill={preenchimento}
          fillOpacity="0.16"
          stroke={cor}
          strokeWidth={rotulos ? 2 : 2.5}
          strokeLinejoin="round"
        />
      </g>

      {(pontas || rotulos) &&
        COMPETENCIAS.map((c, i) => {
          const [x, y] = ponto((Math.max(valores[i], 0) / 10) * raio, i);
          const destaque = i === indiceFraco;
          return (
            <g key={c.chave}>
              <circle
                cx={x.toFixed(2)}
                cy={y.toFixed(2)}
                r={destaque ? 3.6 : 2.6}
                fill={critica(lidos[i]) ? "var(--alerta)" : cor}
              />
              {destaque && (
                <circle
                  className="hex-pulso"
                  cx={x.toFixed(2)}
                  cy={y.toFixed(2)}
                  r="3.6"
                  fill="none"
                  stroke={cor}
                  strokeWidth="1.4"
                />
              )}
            </g>
          );
        })}

      {rotulos &&
        COMPETENCIAS.map((c, i) => {
          const [x, y] = ponto(raio + 21, i);
          // O vértice de cima e o de baixo centralizam; os dos lados
          // encostam para fora, senão o texto passa por cima do desenho.
          const alinhamento = i === 0 || i === 3 ? "middle" : i === 1 || i === 2 ? "start" : "end";
          const dy = i === 0 ? -3 : i === 3 ? 11 : 4;
          const alerta = critica(lidos[i]);

          return (
            <g key={c.chave}>
              <text
                x={x.toFixed(1)}
                y={(y + dy).toFixed(1)}
                textAnchor={alinhamento}
                fontSize="9.5"
                fontWeight="600"
                letterSpacing="0.04em"
                fill={alerta ? "var(--alerta)" : "var(--suave)"}
              >
                {c.curto.toUpperCase()}
              </text>
              <text
                x={x.toFixed(1)}
                y={(y + dy + 11).toFixed(1)}
                textAnchor={alinhamento}
                fontSize="10"
                fontWeight="700"
                className="tabular-nums"
                fill={alerta ? "var(--alerta)" : "var(--tinta)"}
              >
                {fmt(lidos[i])}
              </text>
            </g>
          );
        })}
    </svg>
  );
}

/**
 * Um vértice só, isolado do hexágono. Serve para dizer "este assunto é
 * este lado da silhueta" sem repetir o desenho inteiro — é o que marca
 * cada competência nas listas e cada treinamento pelo alvo dele.
 */
export function Vertice({
  competencia,
  nota,
  tamanho = 22,
  meta,
}: {
  competencia: ChaveCompetencia;
  /** Pinta de vermelho quando abaixo de 5. */
  nota?: number;
  tamanho?: number;
  /** Segundo ponto, tracejado, para mostrar onde a nota deveria chegar. */
  meta?: number;
}) {
  const i = COMPETENCIAS.findIndex((c) => c.chave === competencia);
  if (i < 0) return null;

  const raio = 82;
  const cor = nota !== undefined && critica(nota) ? "var(--alerta)" : "var(--acao)";
  const [x, y] = ponto(nota === undefined ? raio : (Math.max(nota, 0) / 10) * raio, i);

  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 200 200"
      className="shrink-0"
      aria-hidden="true"
    >
      <polygon points={anel(10, raio)} fill="none" stroke="var(--linha-forte)" strokeWidth="9" />
      {meta !== undefined &&
        (() => {
          const [mx, my] = ponto((Math.max(meta, 0) / 10) * raio, i);
          return (
            <circle
              cx={mx.toFixed(2)}
              cy={my.toFixed(2)}
              r="16"
              fill="none"
              stroke="var(--acao)"
              strokeWidth="6"
              strokeDasharray="10 9"
            />
          );
        })()}
      <circle cx={x.toFixed(2)} cy={y.toFixed(2)} r="24" fill={cor} />
    </svg>
  );
}
