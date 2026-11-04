# Publicação no GitHub Pages

Destino preparado: `wilsonborges/ED---CLINICARE-`. Base Vite: `/ED---CLINICARE-/`. Não há domínio próprio nem backend. URL esperada após publicação bem-sucedida: `https://wilsonborges.github.io/ED---CLINICARE-/`. A URL esperada não comprova que o site esteja publicado.

## Ativação pelo proprietário

1. Concluir revisão da PR e revisão de segurança clínica conforme `CLINICAL_VALIDATION.md`. Não confundir testes verdes com validação assistencial.
2. No repositório, abrir **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Em **Settings → Actions → General**, permitir execução de Actions e as ações usadas no workflow. Não é preciso criar PAT, API key ou secret de serviço.
4. Em **Settings → Environments → github-pages**, limitar branches de deployment a `main`. Recomenda-se configurar **required reviewers** para aprovação de publicação com impacto clínico. Essa configuração administrativa não foi alterada automaticamente. Com revisão obrigatória, cada deploy espera aprovação; sem ela, o merge aprovado em `main` dispara publicação automática.
5. Proteger `main` exigindo PR, revisão e job `build` aprovado (nome do workflow: “Testes e GitHub Pages”). O workflow roda testes unitários, TypeScript/build e testes de navegador em toda PR.
6. Após revisão e autorização, fazer merge da PR. O push em `main` dispara `deploy.yml`; também é possível usar **Actions → Testes e GitHub Pages → Run workflow**, selecionando `main`.
7. Verificar em **Actions** os jobs `build` e `deploy`. Acessar a URL retornada pelo passo `actions/deploy-pages`, confirmar JS/CSS/manifest/ícones com HTTP 200 e instalar/testar o PWA. Não afirmar publicação antes desse sucesso.

## Comportamento de segurança

- Pull requests executam apenas build/testes, sem permissão de publicação.
- `contents: read` por padrão; `pages: write` e `id-token: write` somente no job de deployment.
- O job `deploy` depende de `build` e exige branch `main` e evento diferente de pull request.
- Não usa `pull_request_target`, segredos ou serviços pagos.
- Environments e proteção de branch precisam ser ativados no GitHub; o YAML sozinho não cria aprovação humana obrigatória.
- A execução manual em outra branch não publica.

## Conferência do PWA

- Abrir `/ED---CLINICARE-/`, verificar ausência de erros e navegação por hash. Os hashes evitam 404 de rotas no Pages.
- Esperar “Pronto para uso offline”, desligar a rede e recarregar. Conferir PAM, exemplo da gasometria e formulário de exames.
- Conferir manifest com ícones 192/512, scope e start_url no subcaminho; ícone maskable tem margem segura. iPhone usa apple-touch-icon de 180 px.
- iPhone: Safari → Compartilhar → Adicionar à Tela de Início. Android/desktop: instalar pelo menu do navegador ou botão do app quando disponível.
- Uma atualização gera aviso. O usuário escolhe quando atualizar; recarregar apaga formulários em memória. Caches antigos são removidos pelo Workbox.
- O navegador pode expurgar caches; links externos de referência precisam de rede.

## Falhas comuns

- Pages 404: confirme fonte GitHub Actions, branch `main`, sucesso de `deploy` e URL com nome exato do repositório.
- Permissão negada no deploy: conferir Pages habilitado, environment, permissões Actions e policies da conta/organização.
- Build sem lockfile: manter `package-lock.json` versionado e usar `npm ci`.
- Offline indisponível: acessar online até ativar service worker. Desenvolvimento (`npm run dev`) não gera cache; usar build + preview para testar.
