# AGENTS.md — ED - CLINICARE

Este repositório contém o **ED - CLINICARE**, PWA de apoio clínico à enfermagem, idealizado para consultas rápidas no plantão e aprendizado aprofundado.

Leia SEMPRE `docs/PROJECT_SPEC.md` antes de planejar, implementar ou revisar alterações.

## Modo de trabalho
- O proprietário é enfermeiro e descreve necessidades em português; responda em português claro, sem exigir que ele edite código manualmente.
- Inspecione a base existente antes de modificar. Preserve funcionalidades e não faça reescritas desnecessárias.
- Desenvolva em incrementos pequenos, com testes apropriados e build de produção. Relate o que mudou, o que foi testado e o que não foi possível validar.
- Antes de alterar fórmulas clínicas ou critérios de interpretação, consulte fontes clínicas oficiais/confiáveis e documente versão, aplicabilidade, unidades, limites e referências.
- Não invente resultados de exames, valores de referência, diagnósticos nem condutas. Sinalize ambiguidades, valores faltantes e casos que exigem avaliação profissional.
- Não use IA generativa como motor de cálculo clínico. Fórmulas e regras devem ser determinísticas e testadas; IA pode explicar resultados verificados e deixar explícitas as incertezas.
- Evite armazenar ou transmitir dados identificáveis de pacientes; V1 será sem login, sem backend, com preenchimento manual e operação local. Não conectar APIs externas com dados clínicos sem revisão de privacidade e autorização institucional.
- Priorize acessibilidade, legibilidade, uso por teclado, desempenho mobile e funcionamento offline.
- Prefira React + TypeScript + Vite, PWA manifest e service worker. Utilize caminhos de base corretos para GitHub Pages no repositório `ED---CLINICARE-`.
- GitHub Pages: preparar workflow de build/deploy em `.github/workflows/deploy.yml`; não afirmar que foi publicado sem checar a execução e URL real.
- Trabalhe preferencialmente em branch/PR para revisão; não faça merge nem publicação direta sem autorização expressa quando houver mudanças com impacto clínico.
- Inclua testes de casos normais, críticos, limites, dados ausentes, unidade incorreta e arredondamento.
- O aplicativo é apoio educacional e de organização clínica, não substitui julgamento profissional nem protocolos institucionais.

## Organização recomendada
- `src/modules/calculators/`: calculadoras, funções puras e testes.
- `src/modules/labs/`: validadores, comparações e interpretação determinística.
- `src/components/`: componentes visuais reutilizáveis.
- `src/content/references/`: referências e versões dos algoritmos.
- `public/`: ícones e recursos PWA.
- `docs/`: documentação do produto e validação.

## Ao receber pedido de implementação
1. Consulte PROJECT_SPEC e o código atual.
2. Explique brevemente o plano e escolha o menor escopo entregável.
3. Implemente e teste, sem quebrar fluxos existentes.
4. Apresente resumo, riscos, pendências de validação clínica e instruções para verificar a publicação.
