"use client";

import { Building2, Headset } from "lucide-react";

const CONTAS = [
  {
    email: "dono@valenorte.com",
    senha: "valenorte2026",
    rotulo: "Entrar como dono da imobiliária",
    apoio: "Vê o time inteiro e as notas",
    Icone: Building2,
  },
  {
    email: "luan@boechat.com",
    senha: "boechat2026",
    rotulo: "Entrar como equipe Boechat",
    apoio: "Aplica as avaliações",
    Icone: Headset,
  },
];

/**
 * Antes as credenciais de demonstração ficavam escritas na tela e a
 * pessoa tinha que digitar. Agora é um clique — o campo é preenchido e
 * quem quiser conferir ainda vê o e-mail preenchido no formulário.
 */
export function AcessoDemo() {
  function preencher(email: string, senha: string) {
    const form = document.querySelector<HTMLFormElement>("form[data-login]");
    if (!form) return;

    const campoEmail = form.elements.namedItem("email") as HTMLInputElement | null;
    const campoSenha = form.elements.namedItem("senha") as HTMLInputElement | null;
    if (campoEmail) campoEmail.value = email;
    if (campoSenha) campoSenha.value = senha;

    form.requestSubmit();
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.78rem] font-semibold text-suave">
        Ou entre direto com uma conta de demonstração
      </span>

      <div className="flex flex-col gap-1.5">
        {CONTAS.map(({ email, senha, rotulo, apoio, Icone }) => (
          <button
            key={email}
            type="button"
            onClick={() => preencher(email, senha)}
            className="flex items-center gap-2.5 rounded-md border border-borda-campo bg-white px-3 py-2.5 text-left transition-colors hover:border-laranja"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-laranja-suave text-acao">
              <Icone size={14} strokeWidth={2.3} />
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="text-[0.87rem] font-semibold text-tinta">{rotulo}</span>
              <span className="text-[0.76rem] text-suave">{apoio}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
