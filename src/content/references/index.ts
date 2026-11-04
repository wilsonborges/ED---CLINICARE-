export const revision = "2026-11-04";
export const references: Record<
  string,
  { title: string; url: string; version: string }
> = {
  news: {
    title: "Royal College of Physicians · NEWS2",
    url: "https://www.rcp.ac.uk/resources/national-early-warning-score-news-2/",
    version: "Relatório 2017; tabelas oficiais NEWS2",
  },
  kidney: {
    title: "National Kidney Foundation · CKD-EPI 2021",
    url: "https://www.kidney.org/professionals/ckd-epi-creatinine-equation-2021",
    version: "Equação de creatinina 2021",
  },
  cg: {
    title: "Cockcroft & Gault · Nephron",
    url: "https://doi.org/10.1159/000180580",
    version: "Publicação original, 1976",
  },
  abg: {
    title: "MedlinePlus · Faixas convencionais de gasometria arterial",
    url: "https://medlineplus.gov/lab-tests/arterial-blood-gas-abg-test/",
    version: "Referências educacionais arteriais, consulta 2026-11-04",
  },
  gas: {
    title: "Merck Manual · Distúrbios ácido-base e compensação",
    url: "https://www.merckmanuals.com/en-ca/professional/nephrology/acid-base-regulation-and-disorders/acid-base-disorders",
    version: "Versão profissional online, consultada em 2026-11-04",
  },
  sodium: {
    title: "Ing et al. · Corrected Serum Sodium in Hyperglycemic Crises",
    url: "https://www.frontiersin.org/journals/medicine/articles/10.3389/fmed.2020.00477/full",
    version: "2020; coeficiente de Katz 1,6",
  },
  hemodynamics: {
    title: "Jentzer et al. · Noninvasive Hemodynamic Assessment",
    url: "https://www.jacc.org/doi/10.1016/j.jcmg.2020.05.038",
    version: "2021; PAM estimada e índice de choque",
  },
  nursing: {
    title: "Open RN · Nursing Skills",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK593207/",
    version: "Capítulo 5, Math Calculations; análise dimensional",
  },
  bmi: {
    title: "CDC · Calculating BMI",
    url: "https://www.cdc.gov/growth-chart-training/hcp/using-bmi/calculating-bmi.html",
    version: "Fórmula métrica; sem classificação na V1",
  },
  bsa: {
    title: "DICOM · Body Surface Area, Mosteller",
    url: "https://dicom.nema.org/medical/dicom/2020a/output/chtml/part16/chapter_D.html",
    version: "DICOM 2020a; conceito 122244, Mosteller 1987",
  },
  labs: {
    title: "MedlinePlus · Understanding Your Lab Test Results",
    url: "https://medlineplus.gov/lab-tests/how-to-understand-your-lab-results/",
    version:
      "Comparação apenas com intervalo informado do laudo; sem limiares críticos universais",
  },
};
