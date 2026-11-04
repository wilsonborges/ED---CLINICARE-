import { describe, it, expect } from "vitest";
import { analyzeGas } from "./analyze";
const base = { age: "40", sample: "arterial", ph: "7.28", co: "29", hco: "14" };
describe("gasometria determinística", () => {
  it("exemplo especificado, Winter 27–31", () => {
    const r = analyzeGas(base);
    expect(r.summary).toContain("Acidemia");
    expect(r.summary).toContain("acidose metabólica");
    expect(r.items.join(" ")).toContain("27–31 mmHg");
    expect(r.items.join(" ")).toContain("dentro da faixa");
  });
  it("compensação fora da faixa e distúrbio misto", () => {
    expect(
      analyzeGas({ ...base, ph: "7.19", co: "38" }).warnings.join(" "),
    ).toContain("fora da faixa");
    expect(
      analyzeGas({ ...base, ph: "7.10", co: "60", hco: "18" }).summary,
    ).toContain("associadas");
  });
  it("alcalose metabólica e compensação", () =>
    expect(
      analyzeGas({ ...base, ph: "7.48", co: "50", hco: "36" }).summary,
    ).toContain("alcalose metabólica"));
  it("acidose respiratória mostra faixas aguda e crônica", () => {
    const r = analyzeGas({ ...base, ph: "7.25", co: "60", hco: "26" });
    expect(r.summary).toContain("acidose respiratória");
    expect(r.items.join(" ")).toContain("agudo: 26–28");
    expect(r.items.join(" ")).toContain("crônico: 30–32");
  });
  it("alcalose respiratória", () =>
    expect(
      analyzeGas({ ...base, ph: "7.50", co: "30", hco: "23" }).summary,
    ).toContain("alcalose respiratória"));
  it("pH na faixa não exclui distúrbio", () => {
    const r = analyzeGas({ ...base, ph: "7.40", co: "20", hco: "12" });
    expect(r.summary).toContain("Sem conclusão");
    expect(r.warnings.join(" ")).toContain("Não classificar como normal");
  });
  it.each(["7.35", "7.45"])("limite %s incluso", (ph) =>
    expect(
      analyzeGas({ ...base, ph, co: "40", hco: ph === "7.35" ? "22" : "26" })
        .summary,
    ).toContain("faixa arterial convencional"),
  );
  it("não interpreta dados incoerentes", () =>
    expect(analyzeGas({ ...base, ph: "7.7" }).summary).toContain("suspensa"));
  it("restringe amostra venosa e oxigenação", () => {
    const r = analyzeGas({ ...base, sample: "venous", pao: "40", fio: "21" });
    expect(r.summary).toContain("venosa");
    expect(r.items.join(" ")).not.toContain("PaO₂/FiO₂");
    expect(r.items.join(" ")).not.toContain("Winter");
  });
  it("gap e correção por albumina sem presumir faixa", () => {
    const r = analyzeGas({ ...base, na: "140", cl: "104", alb: "2" });
    expect(r.items.join(" ")).toContain("22 mmol/L");
    expect(r.items.join(" ")).toContain("27 mmol/L");
  });
  it("sinaliza sódio ou cloro faltante e FiO₂ ausente", () => {
    const r = analyzeGas({ ...base, na: "140", pao: "80" });
    expect(r.warnings.join(" ")).toContain("sódio e cloro juntos");
    expect(r.warnings.join(" ")).toContain("Oxigenação não analisada");
  });
  it("PaO₂/FiO₂ e lactato só quando informados", () => {
    const r = analyzeGas({ ...base, pao: "80", fio: "40", lactate: "2.5" });
    expect(r.items.join(" ")).toContain("200 mmHg");
    expect(r.items.join(" ")).toContain("2,5 mmol/L");
  });
  it.each<Record<string, string>>([
    { ph: "" },
    { co: "29 kPa" },
    { hco: "0" },
    { sample: "" },
    { age: "10" },
    { fio: "0.4" },
  ])("bloqueia entrada inválida %j", (v) =>
    expect(() => analyzeGas({ ...base, ...v })).toThrow(),
  );
});
