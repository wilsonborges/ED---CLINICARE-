import { useState } from "react";
import {
  labPanels,
  interpretPanel,
  type LabEntry,
} from "../modules/labs/interpret";
import { ErrorMessage } from "./ClinicalForm";
import { Reference } from "./Reference";
import { format } from "../modules/validation";
export function LabView({
  panelId,
  mode,
  navigate,
}: {
  panelId: string;
  mode: string;
  navigate: (id: string) => void;
}) {
  const panel = labPanels[panelId],
    [entries, setEntries] = useState<Record<string, LabEntry>>({}),
    [age, setAge] = useState(""),
    [sex, setSex] = useState(""),
    [sample, setSample] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [error, setError] = useState(""),
    [results, setResults] = useState<ReturnType<typeof interpretPanel> | null>(
      null,
    );
  const clearResult = () => {
    setResults(null);
    setError("");
  };
  return (
    <section className="tool">
      <p className="eyebrow">Exames / Entrada manual</p>
      <h1>{panel.title}</h1>
      <p className="lead">{panel.description}</p>
      <p className="notice">
        Informe somente exames disponíveis. Para cada exame preenchido, informe
        os dois limites do laudo. A V1 atende adultos e não aplica faixas
        universais.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setResults(null);
          try {
            setResults(
              interpretPanel(panelId, entries, { age, sex, sample, confirmed }),
            );
            setError("");
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <div className="fields context">
          <label>
            Idade <span className="unit">anos, ≥18</span>
            <input
              required
              inputMode="numeric"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                clearResult();
              }}
            />
          </label>
          <label>
            Contexto do intervalo por sexo
            <select
              required
              value={sex}
              onChange={(e) => {
                setSex(e.target.value);
                clearResult();
              }}
            >
              <option value="">Selecione…</option>
              <option value="female">Feminino</option>
              <option value="male">Masculino</option>
              <option value="other">
                Outro / intervalo individual do laudo
              </option>
            </select>
          </label>
          <label>
            Amostra do laudo
            <select
              required
              value={sample}
              onChange={(e) => {
                setSample(e.target.value);
                clearResult();
              }}
            >
              <option value="">Selecione…</option>
              {panelId === "hemogram" ? (
                <option value="blood">Sangue total</option>
              ) : (
                <>
                  <option value="serum">Soro</option>
                  <option value="plasma">Plasma</option>
                </>
              )}
            </select>
          </label>
        </div>
        <div className="lab-table">
          <div className="lab-head">
            <span>Exame / unidade</span>
            <span>Resultado</span>
            <span>Limite inferior</span>
            <span>Limite superior</span>
          </div>
          {panel.analytes.map((a) => {
            const entry = entries[a.id] ?? {
              value: "",
              low: "",
              high: "",
              unit: a.unit,
            };
            return (
              <div className="lab-row" key={a.id}>
                <div>
                  <strong>{a.label}</strong>
                  <small>{a.unit}</small>
                </div>
                {(["value", "low", "high"] as const).map((key, i) => (
                  <label key={key}>
                    <span className="mobile-label">
                      {["Resultado", "Limite inferior", "Limite superior"][i]}
                    </span>
                    <input
                      aria-label={`${a.label} — ${["resultado", "limite inferior", "limite superior"][i]} (${a.unit})`}
                      inputMode="decimal"
                      placeholder="—"
                      value={entry[key]}
                      onChange={(e) => {
                        setEntries({
                          ...entries,
                          [a.id]: { ...entry, [key]: e.target.value },
                        });
                        clearResult();
                      }}
                    />
                  </label>
                ))}
              </div>
            );
          })}
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => {
              setConfirmed(e.target.checked);
              clearResult();
            }}
          />
          Confirmei unidades e intervalos do laboratório para a idade, sexo,
          amostra e método deste laudo.
        </label>
        <ErrorMessage error={error} />
        <div className="form-actions">
          <button className="primary">Comparar com o laudo</button>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setEntries({});
              setAge("");
              setSex("");
              setSample("");
              setConfirmed(false);
              clearResult();
            }}
          >
            Limpar tudo
          </button>
        </div>
      </form>
      {results && (
        <div aria-live="polite" className="lab-results">
          <h2>Comparação individual</h2>
          <p>
            “No intervalo” não exclui doença. Faixa de referência não é limiar
            de gravidade. Valores críticos e sintomas exigem avaliação conforme
            protocolo.
          </p>
          {results.map((r) => (
            <article key={r.id}>
              <div>
                <h3>{r.label}</h3>
                <strong>
                  {format(r.value)} {r.unit}
                </strong>
                <small>
                  Laudo: {format(r.low)}–{format(r.high)} {r.unit}
                </small>
              </div>
              <span
                className={`badge ${r.status === "No intervalo" ? "green" : "amber"}`}
              >
                {r.status}
              </span>
              {mode === "study" && <p>{r.about}</p>}
            </article>
          ))}
        </div>
      )}
      {panelId === "renal" && (
        <button className="secondary" onClick={() => navigate("tfg")}>
          Abrir TFG · CKD-EPI 2021 →
        </button>
      )}
      <Reference
        id="labs"
        mode={mode}
        limits="Comparação numérica, sem diagnóstico ou interpretação conjunta. Não identifica automaticamente gravidade. Intervalos do laboratório e protocolos locais prevalecem."
        study="Os intervalos dependem de método, população e amostra. Não deduzimos exames ausentes, causas de alterações ou necessidade de tratamento."
      />
    </section>
  );
}
