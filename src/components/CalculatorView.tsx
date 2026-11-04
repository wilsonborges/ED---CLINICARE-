import { useState } from "react";
import type { Calculator, Calculation } from "../modules/calculators/catalog";
import { Fields, ErrorMessage } from "./ClinicalForm";
import { Reference } from "./Reference";
export function CalculatorView({
  calculator: c,
  mode,
}: {
  calculator: Calculator;
  mode: string;
}) {
  const [values, setValues] = useState<Record<string, string>>({}),
    [result, setResult] = useState<Calculation | null>(null),
    [error, setError] = useState("");
  return (
    <section className="tool">
      <p className="eyebrow">{c.category} / Calculadora</p>
      <h1>{c.title}</h1>
      <p className="lead">{c.description}</p>
      <div className="tool-layout">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setResult(null);
            try {
              setResult(c.compute(values));
              setError("");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <Fields
            fields={c.fields}
            values={values}
            onChange={(k, v) => {
              setValues({ ...values, [k]: v });
              setResult(null);
              setError("");
            }}
          />
          <ErrorMessage error={error} />
          <div className="form-actions">
            <button className="primary" type="submit">
              Calcular resultado
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setValues({});
                setResult(null);
                setError("");
              }}
            >
              Limpar campos
            </button>
          </div>
        </form>
        <aside>
          <div className="result" aria-live="polite">
            {result ? (
              <>
                <span className="eyebrow">Resultado calculado</span>
                <h2>{result.value}</h2>
                <p>{result.detail}</p>
                {result.parts && (
                  <ul className="score-parts">
                    {result.parts.map((p) => (
                      <li key={p.label}>
                        <span>{p.label}</span>
                        <strong className={`score score-${p.score}`}>
                          {p.score}
                        </strong>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <>
                <span className="result-symbol">＋</span>
                <h2>Precisão começa nos dados.</h2>
                <p>
                  Preencha todos os campos na unidade indicada. O resultado
                  aparece aqui.
                </p>
              </>
            )}
          </div>
          <p className="small-note">
            Os valores ficam apenas nesta tela. Nenhum resultado é armazenado ou
            transmitido.
          </p>
        </aside>
      </div>
      <Reference
        id={c.reference}
        formula={c.formula}
        limits={c.limits}
        study={c.study}
        mode={mode}
      />
    </section>
  );
}
