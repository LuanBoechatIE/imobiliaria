# Análise: o que dá pra adicionar ao sistema

Feita na madrugada de 2026-08-21, trabalhando sozinho enquanto Luan
dormia. Cobre duas coisas: o que **já mexi** nesta sessão (pendência
do Samuel + itens que decidi por conta própria) e o que fica **como
proposta**, priorizado, para as próximas sessões.

---

## O que já foi executado nesta sessão

### 1. 🔴 Pendência bloqueante do Samuel: login não nascia

Era o item marcado em `PENDENCIAS.md`. Resolvido de ponta a ponta:

- `lib/senha.ts` ganhou `gerarHashSenha` e `gerarSenhaTemporaria`
  (senha legível de 10 caracteres, sem letras ambíguas tipo `0`/`O`).
- `lib/usuarios.ts` deixou de ser array fixo — agora tem
  `criarUsuario`, `sincronizarUsuario`, `trocarSenhaUsuario`,
  `definirFoto`, `emailEmUso`, `acharPorPessoaId`.
- `/equipe`: adicionar pessoa nova **cria o login de verdade**,
  gera senha temporária, e mostra ela **uma única vez** na tela
  (com botão de copiar), exatamente como estava desenhado no
  `PENDENCIAS.md`.
- Editar pessoa agora **sincroniza** nome/e-mail/papel com o login
  (`sincronizarUsuario`) — esse era um dos itens "menores" que
  também estava anotado.
- Bloqueio de e-mail duplicado na equipe.

### 2. 🔒 Troca de senha obrigatória no primeiro acesso

Não estava no pendências como obrigatório, mas o próprio texto que
o Luan pediu ("senha aleatória para que ele troque depois") só fecha
o ciclo se o sistema **obrigar** a troca — senão a senha gerada vira
a senha definitiva pra sempre, o que é pior que não ter gerado nada.

- `Sessao` ganhou `deveTrocarSenha`.
- `middleware.ts` força qualquer sessão com a flag ligada para
  `/trocar-senha`, e não deixa quem já trocou voltar pra lá.
- `/trocar-senha`: confere a senha temporária, exige 8+ caracteres,
  não deixa repetir a mesma, e já entra com a nova sessão.
- Mesmo padrão já usado no módulo de Recrutamento do `site-boechat`
  (`trocaSenhaObrigatoria` aplicado de verdade via middleware, não só
  aviso visual).

### 3. 🔗 Avaliação concluída agora vira a nota de verdade

Este era o "próximo passo natural" que eu mesmo tinha apontado no
fim da Etapa 4: `/avaliacoes` e `/painel` liam de duas fontes que
nunca se falavam.

- `lib/dados.ts` ganhou `aplicarAvaliacaoAoCorretor`: quando uma
  avaliação fecha, a nota atual vira `anterior`, a nova nota entra,
  o histórico ganha um ponto (sem duplicar se fechar duas vezes no
  mesmo ciclo), e a evidência de cada competência passa a vir do que
  foi escrito na avaliação — não mais só do texto padrão.
- Corretor **novo**, cadastrado em `/equipe` e que ainda não existia
  em `lib/dados.ts`, nasce automaticamente lá assim que a primeira
  avaliação dele fecha. Antes disso ele não teria linha nenhuma no
  painel.
- Testado isoladamente (33 verificações, ver seção "Como testei"):
  bloqueio de conclusão sem evidência, criação de corretor novo,
  segunda avaliação preservando o histórico, etc. Tudo passou.

### 4. 🖼️ Perfil no menu lateral, com foto

Pedido explícito.

- `/perfil`: mostra e edita a foto (recorte automático quadrado
  320×320 no navegador antes de enviar, então nunca sobe imagem
  gigante), e mostra nome/e-mail/papel/cargo somente leitura.
- Foto entra no menu lateral (item novo, separado dos outros por uma
  linha) e no avatar do cabeçalho, substituindo a inicial quando
  existe.
- Guardada em memória no registro do usuário (mesmo regime de tudo
  no sistema hoje — some ao reiniciar). Sem infraestrutura de
  storage ainda, de propósito: não faz sentido configurar Blob/S3
  antes de existir cliente pagando.

### 5. Como testei

Servidor de produção real (`next build` + `next start`) sobe limpo.
`npm run build` passa com TypeScript estrito, zero erro.

Testar os **Server Actions** via `curl` puro se mostrou pouco
confiável (o protocolo de Server Actions do Next muda de encoding
por build e exige cabeçalhos específicos que um form real do
navegador manda sozinho). Em vez de forçar isso, testei a **lógica
de negócio isolada** — que é onde `PENDENCIAS.md` pedia atenção —
com um script descartável que importou as funções puras (`lib/senha`,
`lib/usuarios`, `lib/equipe`, `lib/dados`, `lib/avaliacoes`) e
exercitou os fluxos reais: criar pessoa → gerar senha → autenticar →
editar → trocar senha → foto → avaliar sem evidência (bloqueado) →
avaliar completo → virar nota → segunda avaliação → histórico. As 33
verificações passaram. O script não ficou no repo (era só teste).

O que **não** foi testado: o clique real no navegador, ponta a
ponta. Recomendo, antes da próxima reunião com cliente, abrir o
sistema publicado e passar uma vez por: entrar → adicionar pessoa →
copiar a senha → sair → entrar com ela → trocar a senha → avaliar
essa pessoa → ver a nota aparecer no painel → subir uma foto.

---

## Proposta priorizada para as próximas sessões

Organizado por o que destrava mais coisa primeiro. Nenhum item abaixo
foi implementado — é a análise que o Luan pediu.

### 🔴 Prioridade alta (destrava a operação real)

**1. Banco de dados.** Hoje `lib/dados.ts`, `lib/equipe.ts`,
`lib/avaliacoes.ts` e `lib/usuarios.ts` são tudo em memória — some a
cada deploy. Isso foi decisão consciente (não greenfield antes de
cliente pagando), mas o **gatilho pra sair da fixture** já existe:
primeiro cliente real. Sugestão de stack, coerente com o resto da
casa: Postgres (Neon ou Supabase, ambos com free tier e HTTP driver
que funciona em Edge/Vercel) + um schema fino equivalente aos tipos
que já existem (`Pessoa`, `Usuario`, `Corretor`, `Avaliacao`). A
migração é mecânica porque os tipos já estão desenhados — é trocar
"array em memória" por "linha de tabela", as funções (`acharPessoa`,
`salvarAvaliacao`, etc.) continuam com a mesma assinatura.

**2. Multi-tenant de verdade.** O sistema todo hoje lê de uma
`IMOBILIARIA` fixa (`lib/dados.ts`). `Usuario.imobiliariaId` e
`Sessao.imobiliariaId` já existem e já são propagados — a estrutura
de dado já prevê mais de um cliente, só falta o painel filtrar por
ela em vez de importar a fixture direto. Bloqueado pelo item 1 (sem
banco, "mais de uma imobiliária" significa mais um array fixo, que
não compensa construir ainda).

**3. Upload de evidência real.** Hoje o formulário de avaliação pede
pra **escrever** o que foi observado. O produto de verdade (ver
`imobiliarias.md` no vault) depende de anexar o áudio/gravação em
si, não só descrever. Primeiro passo realista: permitir anexar um
arquivo de áudio (Vercel Blob resolve isso sem servidor próprio) e
manter o campo de texto como resumo. Transcrição automática fica
pra depois — é literalmente o gatilho descrito no vault ("só quando
doer o suficiente pra pagar a conta da IA").

**4. Área do corretor.** Existe o papel `corretor` no tipo `Papel`
desde o início, mas nenhuma tela foi feita pra ele — hoje um
corretor logado cairia em `/painel`, que é visão de gestor. O vault
já registra a decisão de design: a tela do corretor fala em **R$
perdido**, não em nota, porque é a única forma de engajar quem não
tem chefe cobrando. Essa é a tela que falta pro produto ficar
completo pros três papéis que hoje têm login.

### 🟡 Prioridade média (redução de atrito operacional)

**5. E-mail transacional.** Hoje a senha temporária só aparece na
tela — sem `RESEND_API_KEY` configurada, é a única forma. O
`site-boechat` já tem o padrão de fail-soft pra isso (contratação
funciona igual, só não manda e-mail se a chave não existir). Vale
replicar aqui: manda e-mail com a senha quando configurado, mostra
na tela quando não.

**6. Páginas "Treino" e "Números" do menu lateral.** Hoje marcadas
"em breve" de propósito. Treino: listar as calls gravadas por tema
e marcar quem já assistiu (o formato "ao vivo + gravação obrigatória"
já está decidido no vault, falta só o repositório). Números: os 5
que o gestor lança por semana — **este eu cheguei a avaliar
implementar nesta sessão e decidi não fazer sem confirmar com o
Luan primeiro**, porque envolve decidir se vira gráfico de funil
(lead → visita → proposta → venda) ou só uma lista, e isso é decisão
de produto, não só de tela.

**7. Registro de quem editou o quê.** Hoje `alternarStatus`,
`salvarPessoa` e `salvarAvaliacao` não guardam um log de auditoria.
Pra uso interno da Boechat não faz falta ainda; passa a fazer no dia
em que o cliente tiver mais de uma pessoa administrando a equipe
dele e precisar saber "quem desativou o Fulano".

**8. Recuperação de senha.** Hoje se alguém esquecer a senha, só a
equipe Boechat resolve manualmente (não existe "esqueci minha
senha"). Baixo risco por enquanto (poucos usuários, todos
conhecidos), mas é o tipo de coisa que vira ruim na frente de
cliente na primeira vez que acontecer.

### 🟢 Prioridade baixa (polimento)

**9. Notificação de rascunho abandonado.** Uma avaliação em
"em andamento" há muitos dias poderia aparecer destacada — hoje ela
só sobe pro topo da lista, mas não tem alarme.

**10. Página do Raio-X exportável.** Quando o Raio-X virar de fato o
produto de entrada pago (ver `imobiliarias.md`), a tela de nota
provavelmente precisa de uma versão exportável/imprimível pra deixar
com o cliente depois da reunião — hoje é só tela.

**11. Tema escuro.** Decisão consciente de ficar só no claro (a
marca é clara por natureza). Não é bug, é escolha — só registrando
pra não ser "descoberto" como esquecimento depois.

**12. Rate limit no login.** Sem limite de tentativas hoje. Baixo
risco na fase de demonstração (poucos usuários, ambiente fechado),
mas vira item real assim que o sistema tiver o primeiro cliente
externo com e-mail público.

---

## O que eu decidi **não** mexer, e por quê

- **Não toquei no `prospec-engine` nem em nada do braço comercial**
  (fora do escopo pedido: "o sistema").
- **Não criei banco de dados sozinho.** Envolve escolher provedor,
  gerar credencial e configurar variável de ambiente — decisão que
  custa dinheiro e trava arquitetura, não é algo pra decidir sem o
  Luan.
- **Não mudei o recorte de competências nem os textos de evidência
  padrão.** É conteúdo de venda, não código — mexer nisso sem o
  Luan validar é o tipo de coisa que soa errado na frente de cliente.
