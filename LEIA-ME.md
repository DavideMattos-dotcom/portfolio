# Portfólio de Davi — Cloudflare

Cópia editável do portfólio publicado, com conteúdo capturado em 18/10/2026, os cinco projetos atuais, a Nexo Store e o repositório GitHub da loja. Preserva o visual, filtros, seções, exportação/importação de conteúdo e editor. O login que dependia da hospedagem anterior foi substituído por senha administrativa própria.

## Publicar — Windows PowerShell / VS Code

1. Extraia o ZIP e abra no VS Code a pasta `portfolio-cloudflare` que contém `package.json` e `wrangler.jsonc`.
2. Abra um terminal nessa pasta. Execute os comandos abaixo **um por vez**.

### Instalar

```powershell
npm.cmd install
```

O pacote usa Wrangler 4.151.1. O `package-lock.json` registra as dependências. Se o login com Cloudflare tiver expirado, use `npx.cmd wrangler login`.

### Criar as tabelas do portfólio

```powershell
npm.cmd run db:migrate
```

Confirme com `y` se solicitado. Reutiliza o banco `nexo-store-db` que você já criou, ID `3acdcce5-b80a-4f94-84a4-beabeb60a0b4`. O binding neste projeto é `DB`.

As migrações `0003_portfolio.sql` e `0004_portfolio_login.sql` criam tabelas próprias: `portfolio_content` e `portfolio_login_attempts`. Não alteram produtos, pedidos ou login da loja. A senha do portfólio é independente da senha da loja.

Não precisa criar outro banco e não há comando de seed: o conteúdo atual está em `public/content.js` e aparece automaticamente enquanto não houver uma versão salva no banco. Ao salvar pelo editor pela primeira vez, ele passa a ficar persistido no D1.

### Publicar

```powershell
npm.cmd run deploy
```

O Worker deste projeto se chama `portfolio`, sem substituir o Worker `nexo-store`. Na conta cujo subdomínio é `nexo-store`, o endereço esperado é:

https://portfolio.nexo-store.workers.dev

Use a URL real confirmada no terminal. Se você já tiver outro Worker chamado `portfolio`, altere o campo `name` em `wrangler.jsonc` antes de publicar.

### Configurar a senha do editor

Depois da primeira publicação, execute:

```powershell
npm.cmd run setup:admin
```

O script gera uma senha aleatória de 32 caracteres e a grava como secret `PORTFOLIO_ADMIN_PASSWORD` na sua conta. A senha aparece somente no seu terminal; guarde-a no gerenciador de senhas. Não envie a senha em conversa, não a coloque no GitHub e não a copie para os arquivos do site.

No rodapé do portfólio, clique em **Acesso do proprietário**, informe a senha e use **Editar conteúdo**. Para sair, use **Sair do editor**.

Sem senha configurada, o site permanece visível ao público e a edição permanece bloqueada no servidor. A sessão é assinada, dura até 8 horas e usa cookie HttpOnly, Secure e SameSite=Strict. O login permite até 5 tentativas por IP por janela de 15 minutos. Para trocar uma senha esquecida, execute `npm.cmd run setup:admin` novamente; isso invalida as sessões anteriores.

## Abrir e testar no seu computador

Para o editor funcionar é necessário executar o servidor, em vez de abrir `index.html` diretamente ou usar somente Live Server.

```powershell
npx.cmd wrangler d1 migrations apply nexo-store-db --local
npm.cmd run dev
```

O banco local é separado do remoto. Para testar o login local, crie um arquivo `.dev.vars` na raiz e defina `PORTFOLIO_ADMIN_PASSWORD` com uma senha de teste de pelo menos 24 caracteres. Nunca versione esse arquivo; ele já consta no `.gitignore`. Use uma senha diferente da senha real. Se o navegador não aceitar o cookie Secure em HTTP local, use HTTPS no ambiente de desenvolvimento ou valide o login na URL publicada.

## Como editar

- `public/index.html`: estrutura das seções e diálogos.
- `public/styles.css`: layout, cores, tipografia e responsividade.
- `public/content.js`: conteúdo capturado do site atual; funciona como conteúdo inicial.
- `public/app.js`: filtros, projetos, editor, login e interações.
- `public/model.js`: validação, normalização e tratamento de links.
- `public/sync.js`: leitura e salvamento do conteúdo via API.
- `worker/index.js`: API de conteúdo, autorização de gravação e arquivos estáticos.
- `worker/auth.js`: autenticação, cookies assinados e limite de tentativas.
- `migrations/`: estrutura das tabelas no banco.
- `scripts/setup-admin.mjs`: geração e configuração da senha.
- `wrangler.jsonc`: configuração da hospedagem e banco.

Depois que salvar pelo editor, o conteúdo no banco tem prioridade sobre `public/content.js`. Para alterar os dados publicados, prefira o editor e clique em salvar. Você pode exportar um backup JSON e importá-lo pelo editor. Publicar novamente o código não apaga as edições já salvas no banco.

As edições feitas nesta instalação da Cloudflare não sincronizam com a hospedagem anterior, pois são bancos separados. Este ZIP não remove nem altera a versão anterior do portfólio. O histórico Git e as credenciais da hospedagem anterior foram excluídos da exportação.

## Validar e publicar futuras mudanças

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run deploy
```

Testes verificam: conteúdo capturado e links, filtros, bloqueio de visitantes, login, senha incorreta, limite de tentativas, gravação persistente, conflitos de revisão e preservação das tabelas da loja. Também foi executado o empacotamento Wrangler em modo dry-run; a publicação final depende do login salvo no seu computador. A interface não foi validada em navegador neste ambiente.

## Linguagens e lógica

HTML estrutura as seções. CSS define o visual e a adaptação ao celular. JavaScript controla filtros, diálogos, login e formulários. Um Worker recebe GET `/api/content` para leitura pública e PUT `/api/content` para salvamento autenticado. SQL e D1 guardam uma versão do conteúdo com número de revisão; uma gravação com revisão antiga é rejeitada para impedir que um aparelho sobrescreva uma edição mais recente. As senhas são configuradas como secrets, não incluídas no código entregue ao navegador.
