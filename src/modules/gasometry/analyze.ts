import { numberInput, format } from "../validation";
export type GasResult = {
  summary: string;
  items: string[];
  warnings: string[];
};
export function analyzeGas(v: Record<string, string>): GasResult {
  const n = (k: string, label: string, min: number, max: number) =>
    numberInput(v[k], label, min, max);
  n("age", "Idade", 18, 120);
  if (!["arterial", "venous"].includes(v.sample))
    throw new Error("Informe o tipo de amostra.");
  const ph = n("ph", "pH", 6.5, 8),
    co = n("co", "PCO₂ (mmHg)", 5, 150),
    hco = n("hco", "HCO₃ (mmol/L)", 1, 70),
    arterial = v.sample === "arterial";
  const optional = (k: string, label: string, min: number, max: number) =>
    v[k]?.trim() ? n(k, label, min, max) : undefined;
  const pao = optional("pao", "PO₂", 1, 800),
    fio = optional("fio", "FiO₂ em %", 21, 100),
    na = optional("na", "Sódio", 50, 250),
    cl = optional("cl", "Cloro", 30, 200),
    alb = optional("alb", "Albumina em g/dL", 0.1, 8),
    lactate = optional("lactate", "Lactato", 0, 40);
  const items: string[] = [],
    warnings: string[] = [];
  const state =
    ph < 7.35
      ? "Acidemia"
      : ph > 7.45
        ? "Alcalemia"
        : "pH na faixa arterial convencional (7,35–7,45)";
  // Henderson–Hasselbalch consistency gate: tolerance is an engineering safeguard, not a diagnostic cutoff.
  const predicted = 6.1 + Math.log10(hco / (0.03 * co));
  if (Math.abs(predicted - ph) > 0.08)
    return {
      summary: "Dados discordantes: interpretação ácido-base suspensa.",
      items: [
        `pH calculado por Henderson–Hasselbalch: ${format(predicted, 2)}. Confira pH, PCO₂, HCO₃, unidades e se são da mesma coleta.`,
      ],
      warnings: [
        "Tolerância técnica de 0,08 pH, pendente de validação clínica. Não use estes valores para inferir um distúrbio.",
      ],
    };
  if (!arterial) {
    return {
      summary: "Amostra venosa: análise limitada.",
      items: [
        `pH venoso informado: ${format(ph, 2)}; PCO₂ ${format(co)} mmHg; HCO₃ ${format(hco)} mmol/L.`,
        ...(na !== undefined && cl !== undefined
          ? [`Ânion gap sem K: ${format(na - cl - hco)} mmol/L.`]
          : []),
      ],
      warnings: [
        "A V1 não aplica faixas arteriais, compensação de Winter ou PaO₂/FiO₂ à amostra venosa. Não converte valores venosos em arteriais. Valide com contexto e referências venosas do laboratório.",
      ],
    };
  }
  let primary = "";
  const range = (measured: number, low: number, high: number, unit: string) => {
    items.push(
      `Compensação esperada: ${format(low)}–${format(high)} ${unit}; medido: ${format(measured)} ${unit}.`,
    );
    if (measured < low || measured > high)
      warnings.push(
        "Compensação fora da faixa estimada: considerar distúrbio adicional e avaliar clinicamente.",
      );
    else
      items.push(
        "Valor dentro da faixa de compensação estimada; isso não exclui outros distúrbios.",
      );
  };
  if (ph < 7.35 && hco < 22 && co > 45) {
    primary = "Possível acidose metabólica e respiratória associadas";
    warnings.push(
      "Padrão sugestivo de distúrbio misto; requer avaliação profissional.",
    );
  } else if (ph > 7.45 && hco > 26 && co < 35) {
    primary = "Possível alcalose metabólica e respiratória associadas";
    warnings.push(
      "Padrão sugestivo de distúrbio misto; requer avaliação profissional.",
    );
  } else if (ph < 7.35 && hco < 22) {
    primary = "Compatível com acidose metabólica";
    const expected = 1.5 * hco + 8;
    items.push("Winter: PCO₂ esperada = 1,5 × HCO₃ + 8 ± 2 mmHg.");
    range(co, expected - 2, expected + 2, "mmHg");
  } else if (ph > 7.45 && hco > 26) {
    primary = "Compatível com alcalose metabólica";
    items.push(
      "Estimativa: PCO₂ aumenta 0,6–0,75 mmHg por mmol/L de HCO₃ acima de 24.",
    );
    range(
      co,
      40 + 0.6 * (hco - 24),
      Math.min(55, 40 + 0.75 * (hco - 24)),
      "mmHg",
    );
    if (co > 55)
      warnings.push(
        "PCO₂ >55 mmHg não costuma ser explicada apenas por compensação da alcalose metabólica.",
      );
  } else if (ph < 7.35 && co > 45) {
    primary = "Compatível com acidose respiratória";
    const d = (co - 40) / 10;
    items.push(
      `HCO₃ esperado agudo: ${format(24 + d)}–${format(24 + 2 * d)}; crônico: ${format(24 + 3 * d)}–${format(24 + 4 * d)} mmol/L.`,
    );
    warnings.push(
      "Não é possível definir agudo ou crônico sem evolução temporal. Compare as duas faixas ao HCO₃ medido; distúrbios mistos permanecem possíveis.",
    );
  } else if (ph > 7.45 && co < 35) {
    primary = "Compatível com alcalose respiratória";
    const d = (40 - co) / 10;
    items.push(
      `HCO₃ esperado agudo: ${format(24 - 2 * d)}–${format(24 - d)}; crônico: ${format(24 - 5 * d)}–${format(24 - 4 * d)} mmol/L.`,
    );
    warnings.push(
      "Não é possível definir agudo ou crônico sem evolução temporal. Compare as duas faixas ao HCO₃ medido; distúrbios mistos permanecem possíveis.",
    );
  } else if (ph >= 7.35 && ph <= 7.45) {
    primary = "Sem conclusão de distúrbio primário apenas pelo pH";
    if (co < 35 || co > 45 || hco < 22 || hco > 26)
      warnings.push(
        "pH na faixa convencional com PCO₂/HCO₃ alterados: compensação ou distúrbio misto possíveis. Não classificar como normal.",
      );
  } else {
    primary = "Padrão inconclusivo";
    warnings.push(
      "Revise valores, momento da coleta e contexto. Não há classificação segura nesta regra.",
    );
  }
  if ((na === undefined) !== (cl === undefined))
    warnings.push("Ânion gap não calculado: informe sódio e cloro juntos.");
  if (na !== undefined && cl !== undefined) {
    const gap = na - cl - hco;
    items.push(
      `Ânion gap sem K = Na − Cl − HCO₃ = ${format(gap)} mmol/L. Compare com o intervalo do laboratório.`,
    );
    if (alb !== undefined)
      items.push(
        `Gap corrigido = gap + 2,5 × (4 − albumina em g/dL) = ${format(gap + 2.5 * (4 - alb))} mmol/L.`,
      );
    else warnings.push("Albumina não informada: gap sem correção.");
  } else if (alb !== undefined)
    warnings.push("Albumina isolada não permite calcular o gap.");
  if (pao !== undefined && fio !== undefined)
    items.push(
      `PaO₂/FiO₂ = ${format(pao / (fio / 100))} mmHg. FiO₂ deve ser conhecida; não diagnostica SDRA.`,
    );
  else if (pao !== undefined || fio !== undefined)
    warnings.push(
      "Oxigenação não analisada: PaO₂ arterial e FiO₂ conhecida são necessárias juntas.",
    );
  if (lactate !== undefined)
    items.push(
      `Lactato informado: ${format(lactate)} mmol/L. Compare com o laudo; não define etiologia isoladamente.`,
    );
  return { summary: `${state} · ${primary}.`, items, warnings };
}
