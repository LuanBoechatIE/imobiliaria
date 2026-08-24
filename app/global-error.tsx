"use client";

import "./globals.css";

/**
 * Último recurso: só entra quando o próprio layout raiz quebra, e por
 * isso precisa desenhar html e body por conta própria. Sem a fonte
 * carregada aqui, então a pilha do sistema segura o texto.
 */
export default function ErroGlobal({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "2rem 1.25rem",
            background: "var(--fundo)",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "30rem", display: "grid", gap: "1rem", justifyItems: "center" }}>
            <svg width="66" height="73" viewBox="0 0 100 110" aria-hidden="true">
              <polyline
                points="50,4 95,30 95,80 50,106 5,80"
                fill="none"
                stroke="var(--laranja)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="5"
                y1="80"
                x2="5"
                y2="30"
                stroke="var(--linha-forte)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="2 13"
              />
            </svg>

            <h1
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--tinta)",
              }}
            >
              O sistema não subiu
            </h1>
            <p style={{ margin: 0, fontSize: "0.98rem", color: "var(--tinta-suave)" }}>
              Recarregue a página. Se continuar assim, avise a Boechat com o código
              abaixo.
            </p>

            <button
              type="button"
              onClick={reset}
              style={{
                minBlockSize: "44px",
                border: 0,
                borderRadius: "8px",
                background: "var(--acao)",
                color: "#fff",
                font: "inherit",
                fontWeight: 600,
                padding: "0.6rem 1.1rem",
                cursor: "pointer",
              }}
            >
              Recarregar
            </button>

            {error.digest && (
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.74rem",
                  color: "var(--suave)",
                }}
              >
                Código do erro: {error.digest}
              </p>
            )}
          </div>
        </main>
      </body>
    </html>
  );
}
