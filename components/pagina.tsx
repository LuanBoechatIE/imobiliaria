import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Casca de página. Existe para todas as telas terem a mesma largura,
 * o mesmo respiro e o mesmo desenho de cabeçalho — antes cada uma
 * tinha o seu, e a diferença aparecia ao navegar entre elas.
 */
export function Pagina({
  children,
  largura = "ampla",
  className,
}: {
  children: React.ReactNode;
  largura?: "ampla" | "media" | "estreita";
  className?: string;
}) {
  // A largura máxima já desconta o menu lateral, para o conteúdo caber
  // inteiro em tela de 1440 sem precisar de rolagem horizontal.
  const max = {
    ampla: "max-w-[70rem]",
    media: "max-w-[58rem]",
    estreita: "max-w-[46rem]",
  }[largura];

  return (
    <main className={cn("mx-auto flex w-full flex-col gap-7 px-4 py-7 lg:px-7 lg:py-9", max, className)}>
      {children}
    </main>
  );
}

export function Voltar({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="-mb-2 w-fit text-[0.87rem] font-semibold text-suave no-underline transition-colors hover:text-acao"
    >
      ← {children}
    </Link>
  );
}

export function Cabecalho({
  titulo,
  apoio,
  acao,
  etiqueta,
}: {
  titulo: string;
  apoio?: React.ReactNode;
  acao?: React.ReactNode;
  /** Texto curto acima do título, quando ele situa o usuário. */
  etiqueta?: string;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-linha pb-5">
      <div className="flex min-w-0 flex-col gap-1">
        {etiqueta && (
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-laranja">
            {etiqueta}
          </span>
        )}
        <h1 className="m-0 text-[1.8rem] font-extrabold leading-none tracking-[-0.03em] text-tinta">
          {titulo}
        </h1>
        {apoio && <p className="m-0 text-[0.92rem] text-suave">{apoio}</p>}
      </div>
      {acao}
    </header>
  );
}

export function Secao({
  titulo,
  apoio,
  acao,
  children,
}: {
  titulo: string;
  apoio?: string;
  acao?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="m-0 text-[1.05rem] font-bold tracking-[-0.015em] text-tinta">{titulo}</h2>
          {apoio && <p className="m-0 max-w-[62ch] text-[0.88rem] text-suave">{apoio}</p>}
        </div>
        {acao}
      </div>
      {children}
    </section>
  );
}

export function Vazio({
  titulo,
  children,
  acao,
}: {
  titulo: string;
  children?: React.ReactNode;
  acao?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-linha-forte bg-white px-6 py-12 text-center">
      <p className="m-0 text-[1rem] font-semibold text-tinta">{titulo}</p>
      {children && <p className="m-0 max-w-[46ch] text-[0.9rem] text-suave">{children}</p>}
      {acao && <div className="mt-1.5">{acao}</div>}
    </div>
  );
}
