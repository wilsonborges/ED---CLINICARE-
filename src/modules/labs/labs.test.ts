import { it, expect, describe } from "vitest";
import { labPanels, compareLab, interpretPanel } from "./interpret";
const a = labPanels.electrolytes.analytes[1];
const context = { age: "40", sex: "female", sample: "serum", confirmed: true };
describe("comparação laboratorial", () => {
  it.each([
    ["3.4", "Baixo"],
    ["3.5", "No intervalo"],
    ["5", "No intervalo"],
    ["5.1", "Alto"],
    ["9", "Alto"],
  ])("valor %s", (value, status) =>
    expect(
      compareLab(a, { value, low: "3.5", high: "5", unit: a.unit }).status,
    ).toBe(status),
  );
  it("rejeita unidade incorreta e intervalos invertidos ou ausentes", () => {
    expect(() =>
      compareLab(a, { value: "4", low: "3.5", high: "5", unit: "mg/dL" }),
    ).toThrow();
    expect(() =>
      compareLab(a, { value: "4", low: "5", high: "3.5", unit: a.unit }),
    ).toThrow();
    expect(() =>
      compareLab(a, { value: "4", low: "", high: "5", unit: a.unit }),
    ).toThrow();
  });
  it("não inventa exames ausentes e aceita zeros reais", () => {
    const r = interpretPanel(
      "electrolytes",
      { k: { value: "0", low: "3.5", high: "5", unit: a.unit } },
      context,
    );
    expect(r).toHaveLength(1);
    expect(r[0].value).toBe(0);
    expect(r[0].status).toBe("Baixo");
  });
  it("bloqueia entradas parciais, sem confirmação e painel vazio", () => {
    expect(() => interpretPanel("electrolytes", {}, context)).toThrow();
    expect(() =>
      interpretPanel(
        "electrolytes",
        { k: { value: "4", low: "", high: "5", unit: a.unit } },
        context,
      ),
    ).toThrow();
    expect(() =>
      interpretPanel("electrolytes", {}, { ...context, confirmed: false }),
    ).toThrow();
  });
  it("conta plaquetas em células/µL, sem conversão silenciosa por mil", () => {
    const p = labPanels.hemogram.analytes.find((a) => a.id === "plt")!;
    expect(
      compareLab(p, {
        value: "150000",
        low: "150000",
        high: "450000",
        unit: "células/µL",
      }).status,
    ).toBe("No intervalo");
  });
});
