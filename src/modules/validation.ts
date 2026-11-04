export function numberInput(
  raw: string | number | undefined,
  label: string,
  min: number,
  max: number,
  integer = false,
): number {
  if (raw === undefined || String(raw).trim() === "")
    throw new Error(`Informe ${label}.`);
  const text = String(raw).trim().replace(",", ".");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text))
    throw new Error(`${label}: use apenas um número na unidade indicada.`);
  const value = Number(text);
  if (
    !Number.isFinite(value) ||
    value < min ||
    value > max ||
    (integer && !Number.isInteger(value))
  )
    throw new Error(
      `${label}: informe ${integer ? "um inteiro " : ""}entre ${min} e ${max}, na unidade indicada.`,
    );
  return value;
}
export const format = (value: number, digits = 2) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
