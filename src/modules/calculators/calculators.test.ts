import { describe, it, expect } from "vitest";
import { calculators, ckdEpi } from "./catalog";
import { news2 } from "./news";
import { numberInput } from "../validation";
const calc = (id: string, v: Record<string, string>) =>
  calculators.find((c) => c.id === id)!.compute(v);
const baseline = {
  age: "40",
  eligible: "yes",
  rr: "16",
  spo: "98",
  scale: "1",
  authorized: "no",
  oxygen: "air",
  sbp: "120",
  hr: "80",
  consciousness: "alert",
  temp: "37",
};
describe("validação de entrada e unidades fixas", () => {
  it.each([
    "",
    " ",
    "abc",
    "12 mg/dL",
    "1.2.3",
    "1,2,3",
    "Infinity",
    "NaN",
    "1e3",
  ])("rejeita %j", (v) =>
    expect(() => numberInput(v, "valor", 0, 100)).toThrow(),
  );
  it("aceita vírgula decimal e rejeita inteiro fracionário", () => {
    expect(numberInput("1,25", "valor", 0, 2)).toBe(1.25);
    expect(() => numberInput("1.5", "idade", 0, 100, true)).toThrow();
  });
});
describe("15 calculadoras", () => {
  it("entrega quinze módulos independentes", () =>
    expect(calculators).toHaveLength(15));
  it.each([
    ["pam", { sbp: "120", dbp: "80" }, "93,33 mmHg"],
    ["shock", { hr: "120", sbp: "80" }, "1,5"],
    [
      "cg",
      { age: "60", sex: "male", weight: "72", cr: "1", stable: "yes" },
      "80 mL/min",
    ],
    [
      "cg",
      { age: "60", sex: "female", weight: "72", cr: "1", stable: "yes" },
      "68 mL/min",
    ],
    ["urine", { volume: "420", weight: "70", hours: "6" }, "1 mL/kg/h"],
    ["pf", { pao: "80", fio: "40" }, "200 mmHg"],
    ["ag", { na: "140", cl: "104", hco: "24" }, "12 mmol/L"],
    ["osm", { na: "140", glucose: "180", urea: "30" }, "295 mOsm/L"],
    ["sodium", { na: "130", glucose: "500" }, "136,4 mmol/L"],
    ["infusion", { volume: "500", hours: "4" }, "125 mL/h"],
    ["drops", { volume: "500", hours: "4", factor: "20" }, "42 gotas/min"],
    ["balance", { input: "1000", output: "1500" }, "-500 mL"],
    ["bmi", { weight: "70", height: "175" }, "22,86 kg/m²"],
    ["bsa", { weight: "80", height: "180" }, "2 m²"],
  ] as [string, Record<string, string>, string][])(
    "%s: cenário de referência",
    (id, v, expected) => expect(calc(id, v).value.trim()).toBe(expected),
  );
  it("CKD-EPI 2021 usa os quatro ramos sem arredondamento intermediário", () => {
    expect(ckdEpi(50, 1, "male")).toBeCloseTo(91.6915, 3);
    expect(ckdEpi(50, 1, "female")).toBeCloseTo(68.6335, 3);
    expect(ckdEpi(50, 0.7, "female")).toBeCloseTo(105.297601, 3);
    expect(ckdEpi(50, 0.9, "male")).toBeCloseTo(104.049013, 3);
    expect(ckdEpi(50, 0.5, "female")).toBeGreaterThan(
      ckdEpi(50, 0.7, "female"),
    );
    expect(ckdEpi(50, 0.5, "male")).toBeGreaterThan(ckdEpi(50, 0.9, "male"));
  });
  it("rejeita divisores zero, unidades incompatíveis, idade pediátrica e instabilidade renal", () => {
    expect(() => calc("infusion", { volume: "500", hours: "0" })).toThrow();
    expect(() => calc("pam", { sbp: "80", dbp: "100" })).toThrow();
    expect(() =>
      calc("tfg", { age: "17", cr: "1", sex: "male", stable: "yes" }),
    ).toThrow();
    expect(() =>
      calc("tfg", { age: "50", cr: "1 mmol/L", sex: "male", stable: "yes" }),
    ).toThrow();
    expect(() =>
      calc("tfg", { age: "50", cr: "1", sex: "male", stable: "no" }),
    ).toThrow();
    expect(() => calc("pf", { pao: "80", fio: "0.4" })).toThrow();
    expect(() =>
      calc("drops", { volume: "500", hours: "4", factor: "" }),
    ).toThrow();
  });
  it("preserva precisão e permite resultados extremos sem concluir diagnóstico", () => {
    expect(calc("ag", { na: "120", cl: "120", hco: "24" }).value).toBe(
      "-24 mmol/L",
    );
    expect(calc("balance", { input: "0", output: "0" }).value).toBe("0 mL");
    expect(
      calc("tfg", { age: "50", cr: "1", sex: "male", stable: "yes" }).value,
    ).toBe("91,69 mL/min/1,73 m²");
  });
});
describe("NEWS2 — limites oficiais RCP", () => {
  it("zero e pior cenário", () => {
    expect(news2(baseline).total).toBe(0);
    expect(
      news2({
        ...baseline,
        rr: "30",
        spo: "85",
        sbp: "80",
        hr: "150",
        temp: "34",
        consciousness: "cvpu",
        oxygen: "oxygen",
      }).total,
    ).toBe(20);
  });
  it.each([
    [
      "rr",
      0,
      [
        [8, 3],
        [9, 1],
        [11, 1],
        [12, 0],
        [20, 0],
        [21, 2],
        [24, 2],
        [25, 3],
      ],
    ],
    [
      "spo",
      1,
      [
        [91, 3],
        [92, 2],
        [93, 2],
        [94, 1],
        [95, 1],
        [96, 0],
      ],
    ],
    [
      "sbp",
      3,
      [
        [90, 3],
        [91, 2],
        [100, 2],
        [101, 1],
        [110, 1],
        [111, 0],
        [219, 0],
        [220, 3],
      ],
    ],
    [
      "hr",
      4,
      [
        [40, 3],
        [41, 1],
        [50, 1],
        [51, 0],
        [90, 0],
        [91, 1],
        [110, 1],
        [111, 2],
        [130, 2],
        [131, 3],
      ],
    ],
    [
      "temp",
      6,
      [
        [35, 3],
        [35.1, 1],
        [36, 1],
        [36.1, 0],
        [38, 0],
        [38.1, 1],
        [39, 1],
        [39.1, 2],
      ],
    ],
  ] as [string, number, number[][]][])("limites %s", (key, index, cases) => {
    for (const [value, score] of cases)
      expect(
        news2({ ...baseline, [key]: String(value) }).parts[index].score,
        `${key}=${value}`,
      ).toBe(score);
  });
  it.each([
    [83, 3],
    [84, 2],
    [85, 2],
    [86, 1],
    [87, 1],
    [88, 0],
    [92, 0],
    [93, 1],
    [94, 1],
    [95, 2],
    [96, 2],
    [97, 3],
    [100, 3],
  ])("escala 2 em O₂: %i", (spo, score) =>
    expect(
      news2({
        ...baseline,
        scale: "2",
        authorized: "yes",
        oxygen: "oxygen",
        spo: String(spo),
      }).parts[1].score,
    ).toBe(score),
  );
  it("escala 2 no ar e indicação obrigatória", () => {
    expect(
      news2({ ...baseline, scale: "2", authorized: "yes", spo: "99" }).parts[1]
        .score,
    ).toBe(0);
    expect(() => news2({ ...baseline, scale: "2" })).toThrow();
  });
  it("não oculta parâmetro único com 3", () =>
    expect(news2({ ...baseline, rr: "8" }).risk).toContain("isolado"));
  it("total 5 e 7 aciona faixas de risco", () => {
    expect(news2({ ...baseline, rr: "25", oxygen: "oxygen" }).risk).toBe(
      "Médio risco",
    );
    expect(
      news2({ ...baseline, rr: "25", oxygen: "oxygen", spo: "92" }).risk,
    ).toBe("Alto risco");
  });
  it("bloqueia incompleto, gestação e população não elegível", () => {
    expect(() => news2({ ...baseline, eligible: "no" })).toThrow();
    expect(() => news2({ ...baseline, age: "12" })).toThrow();
    expect(() => news2({ ...baseline, rr: "" })).toThrow();
  });
});
