import { numberInput } from "../validation";
export function news2(v: Record<string, string>) {
  const n = (k: string, min: number, max: number, integer = true) =>
    numberInput(v[k], k, min, max, integer);
  n("age", 18, 120);
  if (v.eligible !== "yes")
    throw new Error(
      "Confirme adulto não gestante. NEWS2 não se aplica à gestação nesta versão.",
    );
  const rr = n("rr", 1, 80),
    spo = n("spo", 1, 100),
    sbp = n("sbp", 1, 300),
    hr = n("hr", 1, 300),
    temp = n("temp", 25, 45, false);
  if (
    !["1", "2"].includes(v.scale) ||
    !["air", "oxygen"].includes(v.oxygen) ||
    !["alert", "cvpu"].includes(v.consciousness)
  )
    throw new Error("Preencha escala, oxigênio e consciência.");
  if (v.scale === "2" && v.authorized !== "yes")
    throw new Error(
      "Escala 2 exige confirmação de indicação por profissional habilitado para alvo 88–92%.",
    );
  const oxygen = v.oxygen === "oxygen";
  const parts = [
    {
      label: "Frequência respiratória",
      score: rr <= 8 ? 3 : rr <= 11 ? 1 : rr <= 20 ? 0 : rr <= 24 ? 2 : 3,
    },
    {
      label: "SpO₂",
      score:
        v.scale === "1"
          ? spo <= 91
            ? 3
            : spo <= 93
              ? 2
              : spo <= 95
                ? 1
                : 0
          : spo <= 83
            ? 3
            : spo <= 85
              ? 2
              : spo <= 87
                ? 1
                : spo <= 92 || !oxygen
                  ? 0
                  : spo <= 94
                    ? 1
                    : spo <= 96
                      ? 2
                      : 3,
    },
    { label: "Oxigênio suplementar", score: oxygen ? 2 : 0 },
    {
      label: "Pressão sistólica",
      score:
        sbp <= 90 ? 3 : sbp <= 100 ? 2 : sbp <= 110 ? 1 : sbp <= 219 ? 0 : 3,
    },
    {
      label: "Pulso",
      score:
        hr <= 40
          ? 3
          : hr <= 50
            ? 1
            : hr <= 90
              ? 0
              : hr <= 110
                ? 1
                : hr <= 130
                  ? 2
                  : 3,
    },
    {
      label: "Consciência / confusão nova",
      score: v.consciousness === "alert" ? 0 : 3,
    },
    {
      label: "Temperatura",
      score:
        temp <= 35 ? 3 : temp <= 36 ? 1 : temp <= 38 ? 0 : temp <= 39 ? 1 : 2,
    },
  ];
  const total = parts.reduce((s, p) => s + p.score, 0),
    single = parts.some((p) => p.score === 3);
  const risk =
    total >= 7
      ? "Alto risco"
      : total >= 5
        ? "Médio risco"
        : single
          ? "Parâmetro isolado com 3 pontos"
          : total > 0
            ? "Baixo risco agregado"
            : "Escore agregado zero";
  return {
    total,
    parts,
    risk,
    description: `${risk}. ${total >= 5 || single ? "Requer avaliação e escalonamento conforme protocolo institucional." : "O escore não exclui deterioração; valorize o contexto e a preocupação clínica."}`,
  };
}
