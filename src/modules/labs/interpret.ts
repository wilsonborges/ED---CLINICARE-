import { numberInput } from "../validation";
export type Analyte = {
  id: string;
  label: string;
  unit: string;
  max: number;
  about: string;
};
export const labPanels: Record<
  string,
  { title: string; description: string; analytes: Analyte[] }
> = {
  hemogram: {
    title: "Hemograma",
    description:
      "Séries vermelha, branca e plaquetas, com comparação individual ao laudo.",
    analytes: [
      {
        id: "rbc",
        label: "Hemácias",
        unit: "milhões/µL",
        max: 20,
        about:
          "Interprete em conjunto com hemoglobina, hematócrito e índices eritrocitários.",
      },
      {
        id: "hb",
        label: "Hemoglobina",
        unit: "g/dL",
        max: 35,
        about:
          "Um valor baixo em relação ao laudo requer avaliação; não define causa ou tratamento.",
      },
      {
        id: "ht",
        label: "Hematócrito",
        unit: "%",
        max: 85,
        about: "Varia com a concentração plasmática e a massa de hemácias.",
      },
      {
        id: "mcv",
        label: "VCM",
        unit: "fL",
        max: 200,
        about:
          "Descreve o volume médio das hemácias. Não classifica anemia sem contexto.",
      },
      {
        id: "mch",
        label: "HCM",
        unit: "pg",
        max: 70,
        about: "Quantidade média de hemoglobina por hemácia.",
      },
      {
        id: "mchc",
        label: "CHCM",
        unit: "g/dL",
        max: 60,
        about: "Concentração média de hemoglobina nas hemácias.",
      },
      {
        id: "rdw",
        label: "RDW-CV",
        unit: "%",
        max: 60,
        about:
          "Variabilidade do volume eritrocitário; use referência específica do método.",
      },
      {
        id: "wbc",
        label: "Leucócitos",
        unit: "células/µL",
        max: 1000000,
        about: "Alteração não confirma nem exclui infecção.",
      },
      ...[
        "Neutrófilos",
        "Linfócitos",
        "Monócitos",
        "Eosinófilos",
        "Basófilos",
      ].map((label, i) => ({
        id: `diff${i}`,
        label: `${label} absolutos`,
        unit: "células/µL",
        max: 1000000,
        about: "Informe contagem absoluta; não digite percentuais neste campo.",
      })),
      {
        id: "plt",
        label: "Plaquetas",
        unit: "células/µL",
        max: 3000000,
        about:
          "Método, agregação plaquetária e contexto clínico podem alterar o resultado.",
      },
    ],
  },
  electrolytes: {
    title: "Eletrólitos",
    description:
      "Sódio, potássio, cloro, cálcio e magnésio. Sem correções presumidas.",
    analytes: [
      {
        id: "na",
        label: "Sódio",
        unit: "mmol/L",
        max: 250,
        about:
          "Interprete com glicemia, estado hídrico e método do laboratório.",
      },
      {
        id: "k",
        label: "Potássio",
        unit: "mmol/L",
        max: 15,
        about:
          "Hemólise pode alterar o resultado. Alterações importantes ou sintomas exigem avaliação imediata conforme protocolo.",
      },
      {
        id: "cl",
        label: "Cloro",
        unit: "mmol/L",
        max: 200,
        about:
          "A interpretação ácido-base exige outros dados; não é inferida aqui.",
      },
      {
        id: "ca",
        label: "Cálcio total",
        unit: "mg/dL",
        max: 30,
        about:
          "Cálcio total não equivale ao ionizado. Nenhuma correção por albumina é presumida.",
      },
      {
        id: "cai",
        label: "Cálcio ionizado",
        unit: "mmol/L",
        max: 5,
        about: "Use o intervalo e as condições de coleta específicos do laudo.",
      },
      {
        id: "mg",
        label: "Magnésio",
        unit: "mg/dL",
        max: 20,
        about:
          "Não converter mmol/L implicitamente. Confirme a unidade antes de comparar.",
      },
    ],
  },
  renal: {
    title: "Função renal",
    description:
      "Compare ureia e creatinina. A TFG é calculada em módulo próprio.",
    analytes: [
      {
        id: "urea",
        label: "Ureia total (não BUN)",
        unit: "mg/dL",
        max: 1000,
        about:
          "Não é BUN. Hidratação, catabolismo e outros fatores influenciam o resultado.",
      },
      {
        id: "cr",
        label: "Creatinina",
        unit: "mg/dL",
        max: 30,
        about:
          "Uma medida isolada não diagnostica lesão renal aguda ou doença renal crônica. A tendência e o contexto importam.",
      },
    ],
  },
};
export type LabEntry = {
  value: string;
  low: string;
  high: string;
  unit: string;
};
export function compareLab(a: Analyte, e: LabEntry) {
  if (e.unit !== a.unit)
    throw new Error(`${a.label}: unidade incompatível; use ${a.unit}.`);
  const value = numberInput(e.value, a.label, 0, a.max),
    low = numberInput(e.low, `limite inferior de ${a.label}`, 0, a.max),
    high = numberInput(e.high, `limite superior de ${a.label}`, 0, a.max);
  if (low >= high)
    throw new Error(
      `${a.label}: limite inferior deve ser menor que o superior.`,
    );
  return {
    id: a.id,
    label: a.label,
    value,
    low,
    high,
    unit: a.unit,
    status: value < low ? "Baixo" : value > high ? "Alto" : "No intervalo",
    about: a.about,
  };
}
export function interpretPanel(
  id: string,
  entries: Record<string, LabEntry>,
  context: { age: string; sex: string; sample: string; confirmed: boolean },
) {
  numberInput(context.age, "Idade", 18, 120, true);
  if (
    !["female", "male", "other"].includes(context.sex) ||
    !["blood", "serum", "plasma"].includes(context.sample) ||
    !context.confirmed
  )
    throw new Error(
      "Informe contexto e confirme que os intervalos correspondem à população, amostra, método e laboratório do laudo.",
    );
  const panel = labPanels[id];
  if (!panel) throw new Error("Painel desconhecido.");
  if (
    id === "hemogram"
      ? context.sample !== "blood"
      : !["serum", "plasma"].includes(context.sample)
  )
    throw new Error("Amostra incompatível com este painel; confira o laudo.");
  const selected = panel.analytes.filter((a) => {
    const e = entries[a.id];
    return e && [e.value, e.low, e.high].some((s) => s.trim() !== "");
  });
  if (!selected.length)
    throw new Error(
      "Informe pelo menos um resultado com os dois limites do laboratório.",
    );
  return selected.map((a) => compareLab(a, entries[a.id]));
}
