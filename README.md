# ED - CLINICARE

PWA em português para apoio educacional à enfermagem. React + TypeScript + Vite, sem login, backend, serviços pagos ou APIs de IA.

**V1 educacional: validação clínica independente e homologação institucional pendentes. Não usar como ferramenta assistencial validada.**

## Primeira versão

- Interface responsiva com temas claro, escuro e automático; navegação por teclado.
- Pesquisa, favoritos e modos Plantão/Estudo; somente preferências persistidas.
- 15 calculadoras: NEWS2 (escalas 1 e 2), PAM, índice de choque, CKD-EPI 2021, Cockcroft–Gault, débito urinário, PaO₂/FiO₂, ânion gap, osmolaridade calculada, sódio corrigido (Katz), bomba de infusão, gotejamento, balanço hídrico, IMC e superfície corporal (Mosteller).
- Hemograma (incluindo diferencial absoluto), eletrólitos e função renal: comparação com intervalos digitados e confirmados do próprio laudo, sem diagnóstico automático.
- Gasometria arterial: acidemia/alcalemia, padrões primários, Winter, compensação metabólica/respiratória, possíveis distúrbios mistos, gap e correção por albumina; oxigenação somente com PaO₂ e FiO₂ conhecidas. Gasometria venosa com análise explicitamente limitada.
- Manifest, ícones PNG, service worker com pré-cache do aplicativo, aviso de atualização e instruções de instalação no iPhone/Android/desktop.
- Workflow de testes, build e publicação no Pages após revisão/merge.

## Executar e verificar

Requer Node.js 22.12+ (ou 24 LTS) e npm.

```sh
npm ci
npm run dev
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

O aplicativo usa `/ED---CLINICARE-/` tanto em desenvolvimento quanto em produção. `npm run preview` abre o build de produção em `http://localhost:4173/ED---CLINICARE-/`. O service worker é ativado no build/preview; não no servidor de desenvolvimento. O teste E2E inicia o preview automaticamente, mas requer build previamente criado.

## Organização

- `src/modules/calculators/`: catálogo tipado, equações puras, NEWS2 e testes.
- `src/modules/labs/`: painéis e comparação determinística de resultados.
- `src/modules/gasometry/`: análise ácido-base e testes.
- `src/components/`: formulários, resultados, referências, status PWA e telas dos módulos.
- `src/content/references/`: fontes e versões.
- `public/`: ícones locais; recursos sem CDN ou fontes remotas.
- `tests/`: testes de navegador desktop e viewport móvel, inclusive recarga offline.
- `docs/CLINICAL_VALIDATION.md`: fórmulas, limites, riscos e plano de homologação.
- `docs/DEPLOYMENT.md`: ativação do GitHub Pages e verificação.

## Privacidade e offline

Nenhum resultado ou campo clínico é salvo em `localStorage`, cache de dados, URL ou servidor. O estado dos formulários existe apenas em memória e é descartado ao trocar de módulo/recarregar. Apenas modo, tema e IDs de favoritos persistem sob `clinicare-preferences`; Configurações permite limpá-los. O cache PWA armazena arquivos estáticos do app, sem entradas clínicas. Não há telemetria. Links de referência só abrem sites externos por ação explícita, sem valores dos formulários.

Após o primeiro carregamento completo online, as funções determinísticas funcionam offline; o cache pode ser removido pelo navegador/sistema. Confirme a prontidão antes de depender do modo offline. A instalação real no Safari/iPhone e a disponibilidade prolongada de cache exigem teste em dispositivo físico.

## Pendências

Todos os módulos clínicos dependem de revisão e validação independente. Não há prescrição, ajuste automático de doses, diagnóstico definitivo, OCR/PDF, IA, histórico de pacientes, interpretação conjunta, NIHSS, Glasgow, qSOFA ou MEWS nesta entrega. O MVP seleciona 15 ferramentas conforme a priorização permitida na especificação. Não foram alterados outros repositórios.
