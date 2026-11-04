# ED - CLINICARE — Especificação do produto

## 1. Identidade e visão
Nome de apresentação: **ED - CLINICARE**.
Proposta: PWA moderno e minimalista de calculadoras clínicas e interpretação assistida de exames, destinado principalmente à enfermagem de UPA, classificação de risco, Sala Vermelha e Sala Amarela.
Idioma: português brasileiro.
Modos: **Plantão** (objetivo, rápido e compacto) e **Estudo** (fisiopatologia, explicações e referências).

## 2. Experiência e visual
- Interface premium, hospitalar moderna, sóbria: fundo claro, azul profundo, toques discretos de verde/teal, muito boa legibilidade; tema claro/escuro adaptativo.
- Layout responsivo para iPhone, tablet e desktop; navegação curta, sem excesso de cartões/blocos dentro de blocos.
- Página inicial: marca, busca geral, favoritos, acesso a Calculadoras, Exames, Gasometria, Avaliação, Histórico local (opcional) e Configurações.
- Acesso rápido a NEWS2, Hemograma, Gasometria e TFG; formulários com unidades claras, teclado numérico adequado e TAB correto.
- Mostrar fórmula, fonte, data/versão de revisão, campos exigidos, condições de uso, limites e aviso de apoio não substitutivo.

## 3. Calculadoras candidatas, por módulos
- Avaliação inicial: NEWS2, MEWS, Glasgow, qSOFA.
- Cardiovascular: pressão arterial média (PAM), índice de choque; outras apenas quando validadas.
- Respiratório: relação PaO2/FiO2, gradiente A-a com premissas explicitadas.
- Renal: CKD-EPI 2021 adulto, Cockcroft-Gault com suas limitações, débito urinário.
- Metabólico: ânion gap, osmolaridade calculada, correção de sódio em hiperglicemia (coeficiente documentado).
- Enfermagem: gotejamento, bomba de infusão, balanço hídrico.
- Neurológico: Glasgow e, em etapa posterior, NIHSS guiada, sem atalhos não validados.
- Geral: IMC, superfície corporal, escalas validadas.
A seleção exata da V1 deve ser priorizada por risco, utilidade e capacidade de validação.

## 4. Interpretação de exames — entrada manual na V1
- Hemograma completo (série vermelha, branca e plaquetas).
- Eletrólitos: sódio, potássio, cloro, cálcio, magnésio.
- Função renal: ureia, creatinina e TFG.
- Gasometria arterial e venosa com diferenças de aplicabilidade explícitas.
Futuras extensões: PCR e outros marcadores inflamatórios, troponina/BNP, função hepática, coagulograma, EAS.

Cada interpretador deve:
1. Pedir dados relevantes (idade/faixa etária, sexo quando necessário à equação/referência, unidade, tipo de amostra, intervalo do laboratório).
2. Validar números e unidades e impedir interpretação se faltar dado essencial.
3. Diferenciar baixo/normal/alto em relação ao intervalo informado, sem confundir faixa de referência com limiar de gravidade.
4. Apresentar resumo objetivo e explicação didática; não emitir diagnóstico definitivo.
5. Não criar resultados inexistentes ou inferir exames que não foram informados.
6. Explicitar que o contexto clínico, o laboratório e os protocolos locais prevalecem.

## 5. Gasometria — prioridade alta
- Entrada: pH, PaCO2, HCO3-, PaO2 quando disponível, FiO2, lactato, Na, Cl, albumina quando necessários.
- Sequência: acidemia/alcalemia, distúrbio primário, compensação esperada (incluindo Winter quando aplicável), ânion gap corrigido quando apropriado e sinalização cautelosa de distúrbios mistos.
- Fórmulas documentadas e testadas com cenários conhecidos.
- Não afirmar interpretação de oxigenação sem FiO2/amostra/contexto adequados.
- Exemplo de demonstração: pH 7,28 / PaCO2 29 / HCO3 14 -> acidemia e quadro compatível com acidose metabólica com compensação respiratória esperada pela fórmula de Winter; conteúdo apenas ilustrativo.

## 6. PWA e tecnologia
- React, TypeScript, Vite, módulos independentes; CSS acessível, testes unitários.
- Manifest, ícones adequados, service worker, atualização com aviso de nova versão e funcionamento offline para funções determinísticas.
- Primeira versão sem autenticação, sem servidores de pacientes, sem transmissão de dados clínicos identificáveis. Se houver histórico local, opt-in e limpeza total de dados; priorizar não persistir resultados.
- Não usar APIs pagas nem IA remota na V1.
- Configurar GitHub Pages/Actions para `wilsonborges/ED---CLINICARE-`. Base path Vite deve ser `/ED---CLINICARE-/`; links internos e recursos devem funcionar no subcaminho.
- Publicação somente após build/testes e revisão de segurança clínica.

## 7. Roadmap
**V1 — MVP:** navegação e identidade, busca/favoritos, modos Plantão/Estudo, 10 a 15 calculadoras selecionadas e validadas, gasometria, hemograma, eletrólitos e função renal, formulários manuais, offline, deploy automático.
**V2 — Integração:** interpretação conjunta de exames, comparação temporal local opcional, lógica de alertas parametrizada conforme referências/protocolo, testes ampliados.
**V3 — Assistente documental:** importação de foto/PDF, reconhecimento OCR e revisão humana obrigatória antes da interpretação; IA opcional apenas para explicação contextual, após análise de privacidade, custos e governança.

## 8. Segurança clínica
- Diferenciar exemplo educacional de ferramenta validada para prática assistencial.
- Não emitir recomendações terapêuticas autônomas, nem substituir fluxos institucionais.
- Redigir avisos úteis, não apenas disclaimer genérico.
- Faixas laboratoriais devem ser informadas/confirmadas pelo usuário, considerando laboratório e população. Faixas padrão, quando presentes, serão referências demonstrativas identificadas como tais.
- Para escalas de alerta, registrar as limitações de contexto e populações de aplicação.
- Tratar dados de saúde como sensíveis sob a LGPD; não publicar exames reais, logs identificáveis ou chaves de API no repositório.

## 9. Aceitação inicial
- Abrir sem erros no celular e computador, instalar no iPhone, ter ícones reais e funcionar offline nas funções centrais.
- Exibir respostas consistentes com testes de referência, entrada inválida tratada e unidades visíveis.
- Mudança aprovada no GitHub aciona build/deploy com status verificável.
- Nenhum módulo deve ser anunciado como clinicamente validado apenas por passar testes de software.
