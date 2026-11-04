# Verificação da V1

Verificação local em 2026-11-04, com dados fictícios. Branch `feat/clinicare-pwa-v1`.

| Verificação        | Resultado                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `npm test`         | 79 testes unitários aprovados em 3 arquivos                                                                |
| `npm run build`    | TypeScript e build de produção aprovados; manifest e service worker gerados                                |
| `npm run test:e2e` | 10 testes aprovados: 5 cenários em desktop Chromium e os mesmos 5 em viewport móvel iPhone 13 com Chromium |
| `git diff --check` | Sem erros de whitespace                                                                                    |
| Prettier           | Formatação conferida                                                                                       |

## O que foi exercitado

- Cálculos de referência de 15 calculadoras, valores extremos, limites, ausências, unidade textual incorreta, vírgula decimal e arredondamento.
- CKD-EPI nos pontos de transição de κ com conferência decimal independente; ramos de creatinina alta/baixa e sexos da equação.
- Limites de todos os componentes NEWS2, escalas 1 e 2, ar/O₂, autorização da escala 2, parâmetro isolado com 3, totais 5/7 e exclusões.
- Faixas laboratoriais inclusivas, resultado baixo/alto, intervalo ausente/invertido, unidade incompatível e exames ausentes não inferidos.
- Gasometria: exemplo especificado 7,28/29/14, Winter 27–31, padrões metabólicos/respiratórios, suspeita de mistura, pH na faixa com outros dados alterados, incoerência, gap corrigido, dados ausentes e restrições venosas.
- Navegação, pesquisa sem acentos, favoritos, persistência de modo e ausência de dados clínicos no armazenamento de preferências.
- Formulários, invalidação de resultado após edição, limpeza, modo Estudo e navegação por teclado.
- Ativação inicial do service worker, desligamento da rede, recarga real offline e PAM calculada offline no build de produção, nos dois viewports.

## Correções encontradas na verificação

- Valores esperados incorretos no teste da CKD-EPI no ponto Scr=κ: corrigidos após conferência independente com Decimal, sem mudar a equação NKF.
- Tipagem de cenários inválidos do teste de gasometria: corrigida para o build estrito de TypeScript.
- Ativação inicial offline: `clientsClaim: true` permite ao service worker ativo controlar a primeira página; atualização continua por aviso, sem `skipWaiting` automático.
- Seletor ambíguo no teste do campo idade: restringido ao papel textbox, pois a palavra também aparece na confirmação do laudo.

## O que ainda não foi validado

- Eficácia e segurança clínica, tradução do NEWS2 e homologação institucional.
- Instalação real em iPhone/Safari, Android, dispositivos físicos e comportamento com remoção do cache pelo sistema.
- Atualização real entre duas versões publicadas, expiração prolongada de cache e migração de service worker entre versões de produção.
- Leitores de tela e acessibilidade com usuários reais.
- Publicação real no GitHub Pages; requer ativação administrativa e revisão/merge. A execução de Actions da PR pode ser verificada separadamente no GitHub.

Arquivos: `src/modules/calculators/calculators.test.ts`, `src/modules/labs/labs.test.ts`, `src/modules/gasometry/gasometry.test.ts` e `tests/app.spec.ts`.
