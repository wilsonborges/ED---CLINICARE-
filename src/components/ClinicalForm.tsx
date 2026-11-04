import type { Field } from "../modules/calculators/catalog";
export function Fields({
  fields,
  values,
  onChange,
}: {
  fields: Field[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="fields">
      {fields.map((f) => (
        <label key={f.key}>
          {f.label}
          {f.unit && <span className="unit">{f.unit}</span>}
          {f.options ? (
            <select
              required
              value={values[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
            >
              <option value="">Selecione…</option>
              {f.options.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          ) : (
            <input
              required
              type="text"
              inputMode={f.integer ? "numeric" : "decimal"}
              autoComplete="off"
              placeholder={f.unit || "0"}
              value={values[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
            />
          )}
        </label>
      ))}
    </div>
  );
}
export function ErrorMessage({ error }: { error: string }) {
  return error ? (
    <div className="error" role="alert">
      {error}
    </div>
  ) : null;
}
