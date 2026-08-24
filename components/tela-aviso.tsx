import Link from "next/link";

/**
 * Tela de parada: o que aparece quando a navegação não chega ao
 * destino. Rota inexistente, corretor que não existe mais, erro no
 * servidor — os três param aqui em vez de cair na página crua do
 * Next, que vem em inglês e sem nada do produto.
 *
 * O desenho é o mesmo hexágono do resto do sistema, com um lado
 * faltando: a silhueta que não fechou é a própria mensagem.
 */
export function TelaAviso({
  titulo,
  children,
  acao,
  detalhe,
}: {
  titulo: string;
  children: React.ReactNode;
  acao?: React.ReactNode;
  /** Linha técnica curta, para quem for reportar o problema. */
  detalhe?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[34rem] flex-col items-center gap-5 px-5 py-16 text-center sm:py-24">
      <svg width="76" height="84" viewBox="0 0 100 110" aria-hidden="true">
        {/* Cinco lados fechados. */}
        <polyline
          points="50,4 95,30 95,80 50,106 5,80"
          fill="none"
          stroke="var(--laranja)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* O sexto, interrompido. */}
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

      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-[1.65rem] font-extrabold leading-tight tracking-[-0.03em] text-tinta text-balance">
          {titulo}
        </h1>
        <p className="m-0 text-[0.98rem] leading-relaxed text-tinta-suave text-pretty">
          {children}
        </p>
      </div>

      {acao && <div className="mt-1 flex flex-wrap justify-center gap-2.5">{acao}</div>}

      {detalhe && (
        <p className="m-0 max-w-full break-words font-mono text-[0.74rem] text-suave">
          {detalhe}
        </p>
      )}
    </div>
  );
}

export function BotaoAviso({
  href,
  onClick,
  forte,
  children,
}: {
  href?: string;
  onClick?: () => void;
  forte?: boolean;
  children: React.ReactNode;
}) {
  const classe = forte
    ? "alvo-alto inline-flex items-center justify-center rounded-md bg-acao px-4 py-2 text-[0.92rem] font-semibold text-white no-underline transition-colors hover:bg-acao-forte"
    : "alvo-alto inline-flex items-center justify-center rounded-md border border-linha-forte bg-white px-4 py-2 text-[0.92rem] font-semibold text-tinta-suave no-underline transition-colors hover:border-laranja hover:text-acao";

  if (href) {
    return (
      <Link href={href} className={classe}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classe}>
      {children}
    </button>
  );
}
