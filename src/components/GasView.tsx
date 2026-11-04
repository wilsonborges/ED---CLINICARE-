import { useState } from "react";
import { Fields, ErrorMessage } from "./ClinicalForm";
import { Reference } from "./Reference";
import { analyzeGas, type GasResult } from "../modules/gasometry/analyze";
import type { Field } from "../modules/calculators/catalog";
const required: Field[] = [
  { key: "age", label: "Idade", unit: "anos", integer: true },
  {
    key: "sample",
    label: "Amostra",
    unit: "",
    options: [
      ["arterial", "Arterial"],
      ["venous", "Venosa — análise limitada"],
    ],
  },
  { key: "ph", label: "pH", unit: "sem unidade" },
  { key: "co", label: "PCO₂", unit: "mmHg" },
  { key: "hco", label: "HCO₃⁻", unit: "mmol/L" },
];
const optional: Field[] = [
  { key: "pao", label: "PO₂", unit: "mmHg" },
  { key: "fio", label: "FiO₂ conhecida", unit: "%" },
  { key: "na", label: "Sódio", unit: "mmol/L" },
  { key: "cl", label: "Cloro", unit: "mmol/L" },
  { key: "alb", label: "Albumina", unit: "g/dL" },
  { key: "lactate", label: "Lactato", unit: "mmol/L" },
];
export function GasView({ mode }: { mode: string }) {
  const [v, setV] = useState<Record<string, string>>({}),
    [error, setError] = useState(""),
    [result, setResult] = useState<GasResult | null>(null);
  const change = (k: string, value: string) => {
    setV({ ...v, [k]: value });
    setResult(null);
    setError("");
  };
  return (
    <section className="tool">
      <p className="eyebrow">Gasometria / Análise ácido-base</p>
      <h1>Cada dado, no seu contexto.</h1>
      <p className="lead">
        Leitura estruturada de pH, compensação e ânion gap. Sem diagnóstico
        definitivo.
      </p>
      <div className="notice">
        Adultos. Valores da mesma coleta e unidades indicadas. Amostra venosa
        não permite avaliar oxigenação ou aplicar automaticamente regras
        arteriais.
      </div>
      <div className="tool-layout">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setResult(null);
            try {
              setResult(analyzeGas(v));
              setError("");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <Fields fields={required} values={v} onChange={change} />
          <h3 className="optional-title">
            Dados adicionais <small>opcionais</small>
          </h3>
          <Fields fields={optional} values={v} onChange={change} />
          <ErrorMessage error={error} />
          <div className="form-actions">
            <button className="primary">Analisar gasometria</button>
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setV({});
                setResult(null);
                setError("");
              }}
            >
              Limpar
            </button>
          </div>
          <button
            className="example text-button"
            type="button"
            onClick={() => {
              setV({
                age: "40",
                sample: "arterial",
                ph: "7,28",
                co: "29",
                hco: "14",
              });
              setResult(null);
              setError("");
            }}
          >
            Carregar exemplo educacional: 7,28 / 29 / 14
          </button>
        </form>
        <aside className="result" aria-live="polite">
          {result ? (
            <>
              <span className="eyebrow">Análise educacional</span>
              <h2>{result.summary}</h2>
              <ol>
                {result.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
              {result.warnings.map((w, i) => (
                <p className="warning" key={i}>
                  {w}
                </p>
              ))}
            </>
          ) : (
            <>
              <span className="result-symbol">≈</span>
              <h2>Do pH à compensação.</h2>
              <p>
                A análise verificará a coerência dos dados antes de aplicar as
                regras. Dados opcionais ausentes não serão inferidos.
              </p>
            </>
          )}
        </aside>
      </div>
      <Reference
        id="gas"
        mode={mode}
        formula="Winter: PCO₂ = 1,5 × HCO₃ + 8 ± 2. Gap = Na − (Cl + HCO₃). Gap corrigido = gap + 2,5 × (4 − albumina em g/dL)."
        limits="Faixas convencionais arteriais: pH 7,35–7,45; PCO₂ 35–45 mmHg; HCO₃ 22–26 mmol/L. Compensações são estimativas; tempo de evolução e distúrbios mistos exigem revisão. Gap sem classificação automática, pois depende do laboratório."
        study="Acidemia e alcalemia descrevem o pH; acidose e alcalose descrevem processos. A V1 mostra compensação aguda e crônica dos distúrbios respiratórios sem inferir a duração. Não calcula delta gap ou recomenda tratamento. Confira o método do bicarbonato e os dados da mesma coleta."
      />
    </section>
  );
}
