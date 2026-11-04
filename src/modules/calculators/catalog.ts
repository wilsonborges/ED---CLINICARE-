import { numberInput, format } from "../validation";
import { news2 } from "./news";
export type Field = {
  key: string;
  label: string;
  unit: string;
  min?: number;
  max?: number;
  integer?: boolean;
  options?: [string, string][];
};
export type Calculation = {
  value: string;
  detail: string;
  parts?: { label: string; score: number }[];
};
export type Calculator = {
  id: string;
  title: string;
  category: string;
  description: string;
  fields: Field[];
  formula: string;
  reference: string;
  limits: string;
  study: string;
  compute: (v: Record<string, string>) => Calculation;
};
const f = (
  key: string,
  label: string,
  unit: string,
  min = 0,
  max = 100000,
  integer = false,
): Field => ({ key, label, unit, min, max, integer });
const select = (
  key: string,
  label: string,
  options: [string, string][],
): Field => ({ key, label, unit: "", options });
const age = f("age", "Idade", "anos", 18, 120, true),
  weight = f("weight", "Peso", "kg", 1, 500),
  height = f("height", "Altura", "cm", 50, 250),
  hours = f("hours", "Duração", "h", 0.01, 8760),
  volume = f("volume", "Volume", "mL", 0, 100000),
  na = f("na", "Sódio", "mmol/L", 50, 250),
  cr = f("cr", "Creatinina sérica", "mg/dL", 0.1, 30),
  sex = select("sex", "Sexo utilizado pela equação", [
    ["female", "Feminino"],
    ["male", "Masculino"],
  ]);
const stable = select("stable", "Adulto não gestante com creatinina estável?", [
  ["yes", "Sim, confirmado"],
  ["no", "Não / desconhecido"],
]);
function values(fields: Field[], v: Record<string, string>) {
  const r: Record<string, number> = {};
  for (const field of fields) {
    if (field.options) {
      if (!field.options.some(([key]) => key === v[field.key]))
        throw new Error(`Informe ${field.label}.`);
    } else
      r[field.key] = numberInput(
        v[field.key],
        field.label,
        field.min ?? 0,
        field.max ?? 100000,
        field.integer,
      );
  }
  return r;
}
function def(
  id: string,
  title: string,
  category: string,
  description: string,
  fields: Field[],
  formula: string,
  reference: string,
  limits: string,
  calc: (v: Record<string, number>, raw: Record<string, string>) => number,
  unit: string,
  study: string,
): Calculator {
  return {
    id,
    title,
    category,
    description,
    fields,
    formula,
    reference,
    limits,
    study,
    compute(raw) {
      const v = values(fields, raw);
      if (fields.some((f) => f.key === "stable") && raw.stable !== "yes")
        throw new Error(
          "Equação indisponível: exige adulto não gestante e creatinina estável. Não usar na lesão renal aguda.",
        );
      const value = calc(v, raw);
      if (!Number.isFinite(value))
        throw new Error("Resultado não finito. Revise os dados.");
      return {
        value: `${format(value, id === "drops" ? 0 : 2)} ${unit}`,
        detail:
          id === "drops"
            ? "Arredondado para gotas inteiras. Confira prescrição, equipo e protocolo antes de qualquer administração."
            : limits,
      };
    },
  };
}
export function ckdEpi(age: number, cr: number, sex: string) {
  numberInput(age, "Idade", 18, 120, true);
  numberInput(cr, "Creatinina", 0.1, 30);
  if (!["female", "male"].includes(sex))
    throw new Error("Informe sexo da equação.");
  const female = sex === "female",
    k = female ? 0.7 : 0.9,
    a = female ? -0.241 : -0.302;
  return (
    142 *
    Math.min(cr / k, 1) ** a *
    Math.max(cr / k, 1) ** -1.2 *
    0.9938 ** age *
    (female ? 1.012 : 1)
  );
}
export const calculators: Calculator[] = [
  {
    id: "news",
    title: "NEWS2",
    category: "Avaliação",
    description: "Escore de alerta precoce e deterioração clínica.",
    fields: [
      age,
      select("eligible", "Adulto não gestante?", [
        ["yes", "Sim"],
        ["no", "Não / desconhecido"],
      ]),
      f("rr", "Frequência respiratória", "irpm", 1, 80, true),
      f("spo", "SpO₂", "%", 1, 100, true),
      select("scale", "Escala de SpO₂", [
        ["1", "Escala 1"],
        ["2", "Escala 2 — alvo 88–92%"],
      ]),
      select("authorized", "Escala 2 indicada por profissional habilitado?", [
        ["yes", "Sim"],
        ["no", "Não / não se aplica"],
      ]),
      select("oxygen", "Ar ou oxigênio?", [
        ["air", "Ar ambiente"],
        ["oxygen", "Oxigênio suplementar"],
      ]),
      f("sbp", "Pressão sistólica", "mmHg", 1, 300, true),
      f("hr", "Pulso", "bpm", 1, 300, true),
      select("consciousness", "Consciência", [
        ["alert", "Alerta, sem confusão nova"],
        ["cvpu", "Confusão nova / resposta à voz ou dor / sem resposta"],
      ]),
      f("temp", "Temperatura", "°C", 25, 45),
    ],
    formula:
      "Soma de 7 componentes, incluindo +2 com O₂ suplementar. Cada parâmetro fisiológico recebe 0–3.",
    reference: "news",
    limits:
      "Somente adultos não gestantes nesta V1. Escala 2 apenas sob indicação habilitada para alvo 88–92%. Não substitui avaliação clínica.",
    study:
      "O total deve ser lido junto à pontuação individual. Um parâmetro com 3 pontos exige atenção mesmo com total baixo. A necessidade crescente de O₂ pode não alterar o escore. Tradução não aprovada pelo RCP; confira a versão inglesa antes de uso clínico.",
    compute: (v) => {
      const r = news2(v);
      return {
        value: `${r.total} pontos`,
        detail: r.description,
        parts: r.parts,
      };
    },
  },
  def(
    "pam",
    "Pressão arterial média",
    "Cardiovascular",
    "Estimativa da PAM a partir da pressão arterial.",
    [
      f("sbp", "Pressão sistólica", "mmHg", 1, 300),
      f("dbp", "Pressão diastólica", "mmHg", 1, 200),
    ],
    "(PAS + 2 × PAD) / 3",
    "hemodynamics",
    "Estimativa; arritmias e frequências extremas reduzem a precisão.",
    (v) => {
      if (v.dbp > v.sbp)
        throw new Error("A diastólica não pode superar a sistólica.");
      return (v.sbp + 2 * v.dbp) / 3;
    },
    "mmHg",
    "A diástole ocupa aproximadamente dois terços do ciclo em frequências usuais. Não equivale à medida invasiva.",
  ),
  def(
    "shock",
    "Índice de choque",
    "Cardiovascular",
    "Relação entre frequência cardíaca e pressão sistólica.",
    [
      f("hr", "Frequência cardíaca", "bpm", 1, 300),
      f("sbp", "Pressão sistólica", "mmHg", 1, 300),
    ],
    "FC / PAS",
    "hemodynamics",
    "Betabloqueadores, idade e gestação afetam o índice; não diagnostica choque.",
    (v) => v.hr / v.sbp,
    "",
    "A relação descreve a interação entre pulso e pressão. Um número isolado não estabelece estabilidade hemodinâmica.",
  ),
  def(
    "tfg",
    "TFG · CKD-EPI 2021",
    "Renal",
    "Estimativa de filtração glomerular sem coeficiente racial.",
    [age, sex, cr, stable],
    "142 × min(Scr/κ,1)^α × max(Scr/κ,1)^−1,200 × 0,9938^idade × 1,012 (feminino)",
    "kidney",
    "≥18 anos; creatinina IDMS estável. Não diagnostica DRC com uma medida isolada; não usar na gestação ou lesão renal aguda.",
    (v, r) => ckdEpi(v.age, v.cr, r.sex),
    "mL/min/1,73 m²",
    "κ: 0,7 feminino e 0,9 masculino; α: −0,241 e −0,302. Extremos de massa muscular alteram a estimativa. TFG indexada não é intercambiável com clearance para doses.",
  ),
  def(
    "cg",
    "Cockcroft–Gault",
    "Renal",
    "Estimativa histórica de clearance de creatinina.",
    [age, sex, weight, cr, stable],
    "(140 − idade) × peso / (72 × Scr) × 0,85 (feminino)",
    "cg",
    "Não equivale à TFG indexada. Peso escolhido requer revisão em obesidade, edema e extremos de composição corporal. Não sugere doses.",
    (v, r) =>
      (((140 - v.age) * v.weight) / (72 * v.cr)) *
      (r.sex === "female" ? 0.85 : 1),
    "mL/min",
    "Equação de 1976. Usa o peso informado, sem substituição automática por peso ideal. A escolha do peso e da equação para medicamentos exige protocolo e revisão profissional.",
  ),
  def(
    "urine",
    "Débito urinário",
    "Renal",
    "Volume urinário por peso e tempo de coleta.",
    [volume, weight, hours],
    "Volume / (peso × horas)",
    "nursing",
    "Confirme período completo e perdas não medidas. Não classifica lesão renal isoladamente.",
    (v) => v.volume / v.weight / v.hours,
    "mL/kg/h",
    "A duração da alteração é fundamental. Um débito isolado não define etiologia ou estágio de lesão renal.",
  ),
  def(
    "pf",
    "Relação PaO₂/FiO₂",
    "Respiratório",
    "Índice de oxigenação com amostra arterial.",
    [
      f("pao", "PaO₂ arterial", "mmHg", 1, 800),
      f("fio", "FiO₂ conhecida", "%", 21, 100),
    ],
    "PaO₂ / (FiO₂% / 100)",
    "gas",
    "Somente sangue arterial e FiO₂ conhecida. Não estima FiO₂ por fluxo de cateter e não diagnostica SDRA.",
    (v) => v.pao / (v.fio / 100),
    "mmHg",
    "Pressão positiva, altitude e suporte respiratório modificam a interpretação. A relação não substitui os critérios completos de SDRA.",
  ),
  def(
    "ag",
    "Ânion gap",
    "Metabólico",
    "Diferença de íons sem inclusão de potássio.",
    [
      na,
      f("cl", "Cloro", "mmol/L", 30, 200),
      f("hco", "Bicarbonato", "mmol/L", 1, 80),
    ],
    "Na − (Cl + HCO₃)",
    "gas",
    "Compare com intervalo do laboratório. Sem albumina, o gap não está corrigido.",
    (v) => v.na - v.cl - v.hco,
    "mmol/L",
    "A albumina contribui para o gap. A gasometria permite corrigir por albumina quando ela foi medida; não se presume albumina normal.",
  ),
  def(
    "osm",
    "Osmolaridade calculada",
    "Metabólico",
    "Estimativa com sódio, glicose e ureia total.",
    [
      na,
      f("glucose", "Glicose", "mg/dL", 1, 3000),
      f("urea", "Ureia total (não BUN)", "mg/dL", 0, 1000),
    ],
    "2 × Na + glicose/18 + ureia/6",
    "sodium",
    "Ureia total em mg/dL; não usar BUN neste campo. Estimativa em mOsm/L, diferente de osmolalidade medida.",
    (v) => 2 * v.na + v.glucose / 18 + v.urea / 6,
    "mOsm/L",
    "A osmolaridade inclui ureia. Tonicidade efetiva exclui ureia. Sem valor medido, não se calcula gap osmolar.",
  ),
  def(
    "sodium",
    "Sódio corrigido",
    "Metabólico",
    "Correção em hiperglicemia pelo coeficiente de Katz.",
    [na, f("glucose", "Glicose", "mg/dL", 100, 3000)],
    "Na + 1,6 × (glicose − 100)/100",
    "sodium",
    "Katz 1,6; outros coeficientes existem. Incerteza maior em hiperglicemia extrema. Não orienta correção ou reposição.",
    (v) => v.na + (1.6 * (v.glucose - 100)) / 100,
    "mmol/L",
    "A correção é uma estimativa da mudança associada à glicose; não prevê perdas, ganhos de água ou resposta ao tratamento.",
  ),
  def(
    "infusion",
    "Bomba de infusão",
    "Enfermagem",
    "Velocidade volumétrica de uma prescrição existente.",
    [volume, hours],
    "Volume / horas",
    "nursing",
    "Não calcula dose de medicamento. Confirme prescrição e precisão da bomba com dupla checagem.",
    (v) => v.volume / v.hours,
    "mL/h",
    "O resultado é volumétrico e não considera concentração, compatibilidade ou limites de segurança do fármaco.",
  ),
  def(
    "drops",
    "Gotejamento",
    "Enfermagem",
    "Velocidade por fator do equipo informado.",
    [volume, hours, f("factor", "Fator do equipo", "gotas/mL", 1, 100, true)],
    "Volume × fator / (horas × 60)",
    "nursing",
    "Fator deve ser lido no equipo. Arredondamento ao inteiro mais próximo, sem precisão de bomba.",
    (v) => (v.volume * v.factor) / (v.hours * 60),
    "gotas/min",
    "Equipos têm diferentes fatores; não se presume 20 ou 60 gotas/mL. Arredondar introduz diferença no volume final.",
  ),
  def(
    "balance",
    "Balanço hídrico",
    "Enfermagem",
    "Saldo entre entradas e saídas no mesmo período.",
    [
      f("input", "Entradas totais", "mL", 0, 100000),
      f("output", "Saídas totais", "mL", 0, 100000),
    ],
    "Entradas − saídas",
    "nursing",
    "Use o mesmo período. Não inclui perdas insensíveis ou não medidas e não determina estado volêmico.",
    (v) => v.input - v.output,
    "mL",
    "Saldo positivo significa entradas registradas maiores que saídas; não equivale, sozinho, a hipervolemia.",
  ),
  def(
    "bmi",
    "Índice de massa corporal",
    "Geral",
    "Relação entre peso e altura, sem classificação automática.",
    [weight, height],
    "Peso / (altura em m)²",
    "bmi",
    "Medidas de adultos; não diferencia massa muscular, edema ou composição corporal. Sem categorias pediátricas.",
    (v) => v.weight / (v.height / 100) ** 2,
    "kg/m²",
    "Ferramenta de rastreio, não diagnóstico nutricional. Não aplicada à gestação nesta versão.",
  ),
  def(
    "bsa",
    "Superfície corporal",
    "Geral",
    "Estimativa pela fórmula de Mosteller.",
    [weight, height],
    "√(altura em cm × peso em kg / 3600)",
    "bsa",
    "Estimativa antropométrica. Não calcula doses nem valida esquemas de medicamentos.",
    (v) => Math.sqrt((v.height * v.weight) / 3600),
    "m²",
    "A fórmula simplifica a estimativa da superfície corporal e tem limitações nos extremos de composição corporal.",
  ),
];
