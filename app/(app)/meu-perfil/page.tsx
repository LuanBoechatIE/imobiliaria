import type { Metadata } from "next";
import { Mail, ShieldCheck } from "lucide-react";
import { Cabecalho, Pagina, Secao } from "@/components/pagina";
import { UploaderFoto } from "../perfil/uploader-foto";
import { FormularioSenha } from "./formulario-senha";
import { exigirCorretor } from "@/lib/corretor";
import { acharPorId } from "@/lib/usuarios";
import { NOME_PAPEL, dataCurta } from "@/lib/equipe";

export const metadata: Metadata = { title: "Meu perfil" };

export default async function PáginaMeuPerfil() {
  const { sessao, pessoa } = await exigirCorretor();
  const usuario = acharPorId(sessao.id);

  return (
    <Pagina largura="estreita">
      <Cabecalho
        titulo="Meu perfil"
        apoio="Sua foto e os dados da sua conta."
      />

      <section className="rounded-xl border border-linha bg-white p-5">
        <UploaderFoto nome={pessoa.nome} fotoInicial={usuario?.foto ?? null} />
      </section>

      <section className="flex flex-col gap-1 rounded-xl border border-linha bg-white p-5">
        <h2 className="m-0 mb-2 text-[1rem] font-bold tracking-tight text-tinta">
          Dados da conta
        </h2>

        <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-3 text-[0.92rem]">
          <span className="text-suave">Nome</span>
          <span className="font-medium text-tinta">{pessoa.nome}</span>

          <span className="text-suave">E-mail</span>
          <span className="flex items-center gap-1.5 font-medium text-tinta">
            <Mail size={14} className="text-suave" />
            {usuario?.email}
          </span>

          <span className="text-suave">Cargo</span>
          <span className="font-medium text-tinta">{pessoa.cargo}</span>

          <span className="text-suave">Na equipe desde</span>
          <span className="font-medium text-tinta">{dataCurta(pessoa.entrada)}</span>

          <span className="text-suave">Papel no sistema</span>
          <span className="flex items-center gap-1.5 font-medium text-tinta">
            <ShieldCheck size={14} className="text-suave" />
            {NOME_PAPEL[pessoa.papel]}
          </span>
        </div>

        {/* Nome, cargo e papel são de quem administra a equipe. Dizer isso
            aqui evita a pessoa procurar um botão de editar que não existe. */}
        <p className="m-0 mt-4 text-[0.8rem] leading-relaxed text-suave">
          Nome, e-mail, cargo e papel são definidos por quem administra a equipe da
          imobiliária. Se algum dado estiver errado, fale com seu gestor.
        </p>
      </section>

      <Secao titulo="Senha" apoio="Troque quando quiser. Só você usa essa conta.">
        <div className="rounded-xl border border-linha bg-white p-5">
          <FormularioSenha />
        </div>
      </Secao>
    </Pagina>
  );
}
