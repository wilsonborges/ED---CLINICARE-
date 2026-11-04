import { references, revision } from "../content/references";
export function Reference({
  id,
  formula,
  limits,
  study,
  mode,
}: {
  id: string;
  formula?: string;
  limits?: string;
  study?: string;
  mode: string;
}) {
  const ref = references[id];
  return (
    <details className="reference" open={mode === "study"} key={mode}>
      <summary>Fórmula, fonte e limites de uso</summary>
      {formula && <p className="formula">{formula}</p>}
      {limits && <p>{limits}</p>}
      {mode === "study" && study && <p>{study}</p>}
      <p>
        <a href={ref.url} target="_blank" rel="noreferrer">
          {ref.title} ↗
        </a>
      </p>
      <small>
        {ref.version} · Conferência técnica: {revision} · Algoritmo V1.
        Validação clínica pendente.
      </small>
      {id === "gas" && (
        <p>
          <a href={references.abg.url} target="_blank" rel="noreferrer">
            {references.abg.title} ↗
          </a>
        </p>
      )}
      {id === "news" && (
        <>
          <p>
            Reproduced from: Royal College of Physicians. National Early Warning
            Score (NEWS) 2: Standardising the assessment of acute-illness
            severity in the NHS. Updated report of a working party. London: RCP,
            2017.
          </p>
          <small>
            The wording of this translation has not been specifically approved
            by the Royal College of Physicians – please refer to the English
            language version before making any clinical use of this information.
          </small>
        </>
      )}
    </details>
  );
}
