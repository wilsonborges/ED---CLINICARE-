# Pequenas modificações no ED - CLINICARE

O projeto completo está versionado na branch [`feat/clinicare-pwa-v1`](https://github.com/wilsonborges/ED---CLINICARE-/tree/feat/clinicare-pwa-v1), proposto na [PR #1](https://github.com/wilsonborges/ED---CLINICARE-/pull/1). Enquanto a PR não for integrada, selecione essa branch no GitHub para ver todos os arquivos. A branch `main` ainda pode exibir somente a documentação inicial.

Não é necessário reconstruir o projeto ou copiar arquivos desta conversa. O repositório contém código-fonte, ícones, configurações, dependências com versões travadas, testes, referências clínicas e publicação automatizada.

## Onde alterar

| Quero ajustar                                 | Arquivo                                                                       | Orientação                                                                                                                |
| --------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Textos da página inicial, navegação e rodapé  | [`src/App.tsx`](../src/App.tsx)                                               | Localize o texto atual pela busca do editor. Preserve a estrutura e os avisos clínicos.                                   |
| Cores, fontes, espaçamento e responsividade   | [`src/styles.css`](../src/styles.css)                                         | As cores principais ficam nas variáveis do bloco `:root`; há também cores para o tema escuro ao final.                    |
| Título da aba e descrição para busca          | [`index.html`](../index.html)                                                 | Ajuste `<title>` e a descrição.                                                                                           |
| Nome e aparência do aplicativo instalado      | [`vite.config.ts`](../vite.config.ts)                                         | Edite `manifest.name`, `short_name`, `description` e cores. Mantenha `base`, `scope` e `start_url` para este repositório. |
| Ícones do aplicativo                          | [`public/`](../public/)                                                       | Substitua os PNGs preservando nomes e tamanhos: 192, 512 e 180 px; o maskable precisa de margem segura.                   |
| Títulos, descrições e campos das calculadoras | [`src/modules/calculators/catalog.ts`](../src/modules/calculators/catalog.ts) | Cada ferramenta tem título, descrição, campos, fórmula, limites, fonte e função de cálculo próprios.                      |
| Explicações dos exames                        | [`src/modules/labs/interpret.ts`](../src/modules/labs/interpret.ts)           | Painéis e observações por exame. Não introduza faixas universais de laboratório.                                          |
| Referências e data de conferência técnica     | [`src/content/references/index.ts`](../src/content/references/index.ts)       | Atualize a data apenas após nova conferência das fontes.                                                                  |
| Publicação automática                         | [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)             | Já prepara testes, build e deploy em `main`; veja o [guia de publicação](DEPLOYMENT.md).                                  |

Mudanças em fórmulas, unidades, critérios, exclusões e textos que orientem decisões clínicas exigem consulta de fonte confiável, testes e revisão clínica independente. As orientações estão em [CLINICAL_VALIDATION.md](CLINICAL_VALIDATION.md).

## Alterar pelo próprio GitHub

1. Abra a branch completa pelo link acima.
2. Abra o arquivo desejado e clique no lápis (**Edit this file**).
3. Faça a pequena alteração e confira o diff em **Preview changes**.
4. Registre a alteração nessa branch ou em uma nova branch com PR. Não faça mudanças clínicas diretamente em `main`.
5. Abra a aba **Checks** da PR e aguarde o workflow “Testes e GitHub Pages”. Ele valida cálculos, TypeScript, build e fluxos de navegador.

Também é possível pedir as alterações em português nesta conversa, sem editar código manualmente.

## Baixar o projeto completo

Na branch completa, use **Code → Download ZIP**. Isso inclui todos os arquivos de origem necessários. As pastas `node_modules` e `dist` são geradas automaticamente e não precisam ser copiadas ou mantidas manualmente.

Para editar e executar em um computador com Node.js 22.12+:

```sh
npm ci
npm run dev
```

Abra o endereço mostrado no terminal com `/ED---CLINICARE-/`. Após mudanças funcionais, execute `npm test` e `npm run build`. Para conferir fluxos de navegador e offline, instale o Chromium com `npx playwright install chromium` e execute `npm run test:e2e` após o build.

## Baixar o aplicativo já compilado

Após um workflow aprovado, abra **Actions → Testes e GitHub Pages → execução concluída → Artifacts → ED-CLINICARE-build**. O arquivo contém a versão estática e as instruções para teste; não exige Node.js para servi-la. Os artefatos ficam disponíveis por 14 dias; o código-fonte continua no repositório e permite gerar um novo build.

Ter arquivos no GitHub não ativa a hospedagem web automaticamente. Para abrir o aplicativo por um link público e instalá-lo no celular, ainda é necessário habilitar Pages e integrar a PR após revisão, conforme [DEPLOYMENT.md](DEPLOYMENT.md).
