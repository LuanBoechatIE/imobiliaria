import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

/**
 * Archivo em uma família só, explorando peso e largura para criar
 * hierarquia. Escolhida porque a Boechat já usa Archivo Black nas peças
 * de marca — o sistema herda a mesma voz tipográfica em vez de inventar
 * outra.
 */
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--fonte",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Avaliação do time", template: "%s · Boechat" },
  description: "Painel de avaliação e desenvolvimento do time comercial.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={archivo.variable}>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              border: "1px solid #eae4e0",
              color: "#1a1512",
              fontFamily: "var(--fonte)",
            },
          }}
        />
      </body>
    </html>
  );
}
