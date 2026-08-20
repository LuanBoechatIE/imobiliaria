# Pendências — continuar daqui

Luan ficou sem crédito. Samuel continua a partir daqui. Este arquivo é
só a lista do que falta, sem código — cada item tem onde mexer.

---

## 🔴 BLOQUEANTE: criar pessoa em /equipe não cria login

**O problema:** em `/equipe`, o formulário "Adicionar pessoa"
(`app/(app)/equipe/formulario-pessoa.tsx` → `salvarPessoa` em
`app/(app)/equipe/acoes.ts`) só grava em `lib/equipe.ts`
(`adicionarPessoa`). Isso cadastra a pessoa na listagem, mas **não cria
usuário nenhum** em `lib/usuarios.ts`. Resultado: você adiciona alguém
pela tela e essa pessoa não consegue logar de jeito nenhum — o e-mail
dela não existe pra `acharPorEmail` (`lib/usuarios.ts`), que é o que
`app/entrar/acoes.ts` usa pra autenticar.

**O que precisa acontecer, ao salvar uma pessoa NOVA (não ao editar):**

1. Gerar uma senha aleatória (algo tipo 10-12 caracteres, letras +
   números). Pode ser bem simples nessa fase, tipo
   `Math.random().toString(36).slice(2, 12)` — não precisa ser
   criptograficamente forte, é senha temporária de uso único.
2. Fazer o hash dela com `scrypt`, do mesmo jeito que já existe em
   `lib/senha.ts` — só que hoje esse arquivo só tem `conferirSenha`
   (verificar). Falta a função de **gerar** o hash. É literalmente o
   inverso do script que já rodou uma vez pra gerar os hashes de
   `lib/usuarios.ts` (ver comentário lá em cima do arquivo, tem o
   comando de terminal que foi usado pra gerar `HASH_BOECHAT` e
   `HASH_VALENORTE` — é só reaproveitar essa lógica dentro do código
   em vez de rodar no terminal).
3. Criar o usuário em `lib/usuarios.ts` (função nova, tipo
   `criarUsuario`, no mesmo padrão de `adicionarPessoa` em
   `lib/equipe.ts` — hoje `USUARIOS` é um array fixo, precisa virar
   mutável do mesmo jeito que `PESSOAS` já é).
4. **Mostrar a senha gerada na tela, uma vez só**, depois de criar.
   Não dá pra mandar e-mail ainda (não tem serviço de e-mail
   configurado no projeto), então por enquanto a senha aparece na
   tela pro admin copiar e passar pra pessoa manualmente. Isso já é
   um padrão usado em outro projeto da casa (`site-boechat`, módulo
   de Recrutamento) — lá tem uma regra parecida: contratação sem
   e-mail configurado mostra a senha temporária na tela em vez de
   travar o fluxo. Vale seguir a mesma ideia aqui.
5. **Trocar senha no primeiro acesso.** Não existe isso ainda no
   sistema (nem o campo, nem o middleware fazendo cumprir). Se der
   tempo, adicionar; se não der, pelo menos deixar anotado que a
   senha gerada é a senha "de verdade" da pessoa até ela pedir pra
   alguém trocar manualmente — não é ideal, mas não bloqueia uso.

**Import que vai faltar:** `lib/equipe.ts` (onde fica `salvarPessoa`
por trás) não importa nada de `lib/senha.ts` hoje. Cuidado: o hash de
senha usa `node:crypto` (`scryptSync`), que só roda em server-only
(mesma explicação que já tem no topo de `lib/senha.ts` — não pode
vazar pro middleware/Edge). Como `salvarPessoa` já é uma Server Action
(`"use server"` em `app/(app)/equipe/acoes.ts`), isso é seguro, é só
importar `lib/senha.ts` ali dentro (ou criar a função de gerar hash
direto lá).

**Papel `corretor` também precisa logar?** Hoje o tipo `Papel` em
`lib/sessao.ts` já inclui `"corretor"`, mas nenhuma tela foi feita pra
esse papel ver (o painel e a equipe são só pra dono/gestor/boechat).
Decidir: cria o login mesmo assim (fica pronto pra quando a área do
corretor existir) ou só cria login pra papel dono/gestor por enquanto.
Recomendo criar sempre — não custa nada a mais e evita ter que voltar
nisso depois.

---

## Coisas menores que ficaram soltas (não bloqueiam, mas valem nota)

- **Editar pessoa não atualiza usuário.** Se um dia alguém trocar o
  e-mail de uma pessoa em "Editar" (`formulario-pessoa.tsx`), isso
  também vai dessincronizar do que tá em `lib/usuarios.ts`. Não é
  urgente porque hoje nem cria usuário ainda, mas quando o item de
  cima for resolvido, editar também precisa refletir lá.

- **Tudo em memória, some ao reiniciar.** `lib/dados.ts`,
  `lib/equipe.ts`, `lib/avaliacoes.ts`, `lib/usuarios.ts` — nenhum
  banco de dados ainda, de propósito (só vira necessário com cliente
  pagando). Mas vale lembrar: qualquer usuário criado pela tela some
  no próximo deploy/restart da Vercel também, não só localmente.

- **Ciclo de avaliação (`CICLO_ATUAL` em `lib/avaliacoes.ts`) e o ciclo
  do painel (`lib/dados.ts`) são duas fontes separadas.** Uma
  avaliação concluída em `/avaliacoes` não atualiza a nota que aparece
  em `/painel` nem no perfil do corretor. Próximo passo natural
  depois da pendência bloqueante acima.

---

Qualquer dúvida sobre alguma decisão (por que é assim e não assado),
tem mais contexto em `RESUMO-PARA-GPT.md` na raiz do projeto.
