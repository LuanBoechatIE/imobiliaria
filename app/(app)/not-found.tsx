import { BotaoAviso, TelaAviso } from "@/components/tela-aviso";

/**
 * Link velho de corretor, avaliação ou treinamento: o id não existe
 * mais. Separado do 404 da raiz porque o recado é outro, o registro
 * sumiu, não o endereço.
 *
 * O Next tira a casca do app ao desenhar esta tela, então o menu
 * lateral não aparece aqui: os dois botões abaixo são a única saída,
 * e por isso são caminho e não decoração.
 */
export default function NaoEncontradoNoApp() {
  return (
    <TelaAviso
      titulo="Esse registro não está mais aqui"
      acao={
        <>
          <BotaoAviso href="/equipe" forte>
            Ver a equipe
          </BotaoAviso>
          <BotaoAviso href="/painel">Voltar ao painel</BotaoAviso>
        </>
      }
    >
      A pessoa ou o treinamento que você abriu foi removido, ou o link está apontando
      para um código que não existe.
    </TelaAviso>
  );
}
