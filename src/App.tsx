import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Calculator,
  ChevronRight,
  ClipboardList,
  Droplets,
  FlaskConical,
  HeartPulse,
  House,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Stethoscope,
  X,
} from "lucide-react";
import { calculators } from "./modules/calculators/catalog";
import { labPanels } from "./modules/labs/interpret";
import { CalculatorView } from "./components/CalculatorView";
import { LabView } from "./components/LabView";
import { GasView } from "./components/GasView";
import { PwaStatus } from "./components/PwaStatus";
import {
  readPreferences,
  savePreferences,
  defaults,
  type Preferences,
} from "./preferences";
const allTools = [
  ...calculators.map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    description: c.description,
    kind: "calculator",
  })),
  ...Object.entries(labPanels).map(([id, p]) => ({
    id,
    title: p.title,
    category: "Exames",
    description: p.description,
    kind: "lab",
  })),
  {
    id: "gas",
    title: "Gasometria",
    category: "Exames",
    description: "Leitura ácido-base, compensação e ânion gap.",
    kind: "gas",
  },
];
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const nav = [
  { id: "home", title: "Visão geral", icon: House },
  { id: "calculators", title: "Calculadoras", icon: Calculator },
  { id: "labs", title: "Exames laboratoriais", icon: FlaskConical },
  { id: "gas", title: "Gasometria", icon: Activity },
  { id: "assessment", title: "Avaliação clínica", icon: ClipboardList },
  { id: "favorites", title: "Favoritos", icon: Star },
];
export default function App() {
  const [page, setPage] = useState(() => location.hash.slice(1) || "home"),
    [query, setQuery] = useState(""),
    [prefs, setPrefs] = useState<Preferences>(readPreferences),
    [menu, setMenu] = useState(false),
    [storageError, setStorageError] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const change = () => {
      setPage(location.hash.slice(1) || "home");
      setQuery("");
      setMenu(false);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme;
    setStorageError(!savePreferences(prefs));
  }, [prefs]);
  const navigate = (id: string) => {
    location.hash = id;
    setPage(id);
    setQuery("");
    setMenu(false);
    window.scrollTo(0, 0);
    requestAnimationFrame(() => mainRef.current?.focus());
  };
  const favorite = (id: string) =>
    setPrefs({
      ...prefs,
      favorites: prefs.favorites.includes(id)
        ? prefs.favorites.filter((i) => i !== id)
        : [...prefs.favorites, id],
    });
  const calculator = calculators.find((c) => c.id === page),
    isTool = calculator || page === "gas" || page in labPanels;
  const filtered = allTools
    .filter((t) =>
      normalize(`${t.title} ${t.category} ${t.description}`).includes(
        normalize(query),
      ),
    )
    .filter(
      (t) =>
        query ||
        page === "home" ||
        (page === "favorites" && prefs.favorites.includes(t.id)) ||
        (page === "calculators" && t.kind === "calculator") ||
        (page === "labs" && t.kind === "lab") ||
        (page === "assessment" && t.category === "Avaliação"),
    );
  const title =
    page === "favorites"
      ? "O que importa, por perto."
      : page === "calculators"
        ? "Cálculos claros. Decisões conscientes."
        : page === "labs"
          ? "Um olhar atento aos exames."
          : page === "assessment"
            ? "Avaliação à beira do leito."
            : "Seu conhecimento. Sempre à mão.";
  const cards = (items: typeof allTools) => (
    <div className="tool-grid">
      {items.map((t) => (
        <article className="tool-card" key={t.id}>
          <div className="card-top">
            <span
              className={`tool-icon ${t.category === "Renal" ? "teal" : ""}`}
            >
              {t.kind === "lab" ? (
                <FlaskConical size={22} />
              ) : t.id === "gas" ? (
                <Activity size={22} />
              ) : t.category === "Renal" ? (
                <Droplets size={22} />
              ) : (
                <Calculator size={22} />
              )}
            </span>
            <button
              className={`favorite ${prefs.favorites.includes(t.id) ? "active" : ""}`}
              aria-label={`${prefs.favorites.includes(t.id) ? "Remover" : "Adicionar"} ${t.title} ${prefs.favorites.includes(t.id) ? "dos" : "aos"} favoritos`}
              aria-pressed={prefs.favorites.includes(t.id)}
              onClick={() => favorite(t.id)}
            >
              <Star size={18} />
            </button>
          </div>
          <span className="card-category">{t.category}</span>
          <button className="card-link" onClick={() => navigate(t.id)}>
            <h3>{t.title}</h3>
            <span className="card-description">{t.description}</span>
            <span className="card-open">
              Abrir ferramenta <ArrowUpRight size={16} />
            </span>
          </button>
        </article>
      ))}
    </div>
  );
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Pular para conteúdo
      </a>
      <aside
        className={`sidebar ${menu ? "open" : ""}`}
        aria-label="Navegação principal"
      >
        <a
          className="brand"
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            navigate("home");
          }}
        >
          <span className="brand-mark">
            <HeartPulse size={26} />
          </span>
          <span>
            <small>ED —</small>
            <strong>CLINICARE</strong>
          </span>
        </a>
        <div className="workspace-label">
          ESPAÇO CLÍNICO <span>V1</span>
        </div>
        <nav>
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(n.id);
              }}
              className={page === n.id ? "selected" : ""}
              aria-current={page === n.id ? "page" : undefined}
            >
              <n.icon size={19} />
              {n.title}
              {n.id === "favorites" && <small>{prefs.favorites.length}</small>}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-note">
            <ShieldCheck size={23} />
            <strong>Seu espaço é privado.</strong>
            <p>
              Sem login. Sem envio de dados clínicos. Feito para acompanhar
              você.
            </p>
          </div>
          <a
            className={`settings-link ${page === "settings" ? "selected" : ""}`}
            href="#settings"
            onClick={(e) => {
              e.preventDefault();
              navigate("settings");
            }}
          >
            <Settings size={19} />
            Configurações
          </a>
          <div className="version">
            ED - CLINICARE <span>0.1.0</span>
          </div>
        </div>
      </aside>
      {menu && (
        <button
          aria-label="Fechar menu"
          className="menu-overlay"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="app-shell">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label={menu ? "Fechar navegação" : "Abrir navegação"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
          <div className="breadcrumb">
            Espaço clínico <ChevronRight size={14} />
            <strong>
              {calculator?.title ??
                labPanels[page]?.title ??
                nav.find((n) => n.id === page)?.title ??
                (page === "settings" ? "Configurações" : "Visão geral")}
            </strong>
          </div>
          <div className="mode-switch" role="group" aria-label="Modo de uso">
            <button
              aria-pressed={prefs.mode === "shift"}
              className={prefs.mode === "shift" ? "active" : ""}
              onClick={() => setPrefs({ ...prefs, mode: "shift" })}
            >
              <Stethoscope size={16} />
              Plantão
            </button>
            <button
              aria-pressed={prefs.mode === "study"}
              className={prefs.mode === "study" ? "active" : ""}
              onClick={() => setPrefs({ ...prefs, mode: "study" })}
            >
              <BookOpen size={16} />
              Estudo
            </button>
          </div>
          <div className="user-avatar" aria-label="Enfermagem">
            EN
          </div>
        </header>
        <main id="main-content" tabIndex={-1} ref={mainRef}>
          {storageError && (
            <p role="status" className="notice">
              Armazenamento indisponível. Preferências e favoritos valem apenas
              nesta sessão.
            </p>
          )}
          {isTool ? (
            <>
              <button
                className="back text-button"
                onClick={() =>
                  navigate(
                    calculator
                      ? "calculators"
                      : page === "gas"
                        ? "home"
                        : "labs",
                  )
                }
              >
                ← Voltar para{" "}
                {calculator
                  ? "calculadoras"
                  : page === "gas"
                    ? "início"
                    : "exames"}
              </button>
              {calculator ? (
                <CalculatorView
                  key={calculator.id}
                  calculator={calculator}
                  mode={prefs.mode}
                />
              ) : page === "gas" ? (
                <GasView mode={prefs.mode} />
              ) : (
                <LabView
                  key={page}
                  panelId={page}
                  mode={prefs.mode}
                  navigate={navigate}
                />
              )}
            </>
          ) : page === "settings" ? (
            <section className="tool settings">
              <p className="eyebrow">Personalize seu espaço</p>
              <h1>Configurações</h1>
              <h2>Aparência</h2>
              <label>
                Tema
                <select
                  value={prefs.theme}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      theme: e.target.value as Preferences["theme"],
                    })
                  }
                >
                  <option value="system">Acompanhar dispositivo</option>
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                </select>
              </label>
              <h2>Privacidade e armazenamento</h2>
              <p>
                Apenas tema, modo e favoritos são salvos neste navegador. Campos
                de exames e resultados ficam na memória da tela; sair do módulo
                ou recarregar os apaga. Não há histórico clínico, login, backend
                ou rastreadores.
              </p>
              <button
                className="secondary"
                onClick={() => {
                  setPrefs({ ...defaults });
                  try {
                    localStorage.removeItem("clinicare-preferences");
                  } catch {
                    /* storage unavailable */
                  }
                  navigate("home");
                }}
              >
                Limpar preferências e favoritos
              </button>
              <h2>Instalação e uso offline</h2>
              <p>
                Após o primeiro carregamento completo online, as ferramentas
                ficam disponíveis offline. O navegador pode remover o cache;
                verifique a disponibilidade antes de depender dele no plantão.
              </p>
              <PwaStatus />
              <h2>Validação clínica pendente</h2>
              <p>
                Todos os algoritmos são uma implementação educacional V1. Testes
                de software conferem cálculos, mas não validam a ferramenta para
                assistência. NEWS2, gasometria, equações renais, intervalos
                laboratoriais e cálculos de infusão precisam de revisão
                independente e homologação institucional.
              </p>
              <p>
                Sem recomendações terapêuticas autônomas. Não use para
                substituir avaliação profissional ou fluxos de urgência.
              </p>
            </section>
          ) : (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <span className="eyebrow">
                    <span className="tiny-dot" /> CUIDADO QUE COMEÇA COM
                    CONHECIMENTO
                  </span>
                  <h1>{title}</h1>
                  <p>
                    {prefs.mode === "study"
                      ? "Explore as fórmulas, entenda os limites e aprofunde seu raciocínio clínico."
                      : "Ferramentas essenciais para a enfermagem, reunidas em um espaço simples, seguro e acessível."}
                  </p>
                  <div className="hero-tags">
                    <span>
                      <ShieldCheck size={15} />
                      Dados apenas no dispositivo
                    </span>
                    <span>
                      <ArrowDownLeft size={15} />
                      Disponível offline após carregar
                    </span>
                  </div>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="art-circle outer" />
                  <div className="art-circle inner" />
                  <div className="art-cross">＋</div>
                  <svg viewBox="0 0 270 120">
                    <path d="M0 70 H55 L70 50 L85 87 L105 19 L127 107 L146 58 L161 70 H270" />
                  </svg>
                  <span className="art-label">
                    CIÊNCIA A SERVIÇO DO CUIDADO
                  </span>
                </div>
              </section>
              <section className="search-area">
                <label className="searchbox">
                  <Search size={21} />
                  <input
                    aria-label="Pesquisar ferramentas"
                    placeholder="O que você precisa consultar? Ex.: hemograma, TFG, NEWS2…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button
                      aria-label="Limpar pesquisa"
                      onClick={() => setQuery("")}
                    >
                      <X size={18} />
                    </button>
                  )}
                  <span className="search-key">BUSCAR</span>
                </label>
                <p>
                  Pesquisa em {allTools.length} ferramentas locais{" "}
                  <span>·</span> Sem envio de dados
                </p>
              </section>
              {page === "home" && !query && (
                <>
                  <section className="quick-section">
                    <div className="section-heading">
                      <h2>Acesso rápido</h2>
                      <span>Para os momentos que pedem agilidade</span>
                    </div>
                    <div className="quick-grid">
                      {[
                        {
                          id: "news",
                          title: "NEWS2",
                          sub: "Alerta precoce",
                          icon: HeartPulse,
                        },
                        {
                          id: "hemogram",
                          title: "Hemograma",
                          sub: "Interpretação manual",
                          icon: Droplets,
                        },
                        {
                          id: "gas",
                          title: "Gasometria",
                          sub: "Equilíbrio ácido-base",
                          icon: Activity,
                        },
                        {
                          id: "tfg",
                          title: "TFG",
                          sub: "CKD-EPI 2021",
                          icon: FlaskConical,
                        },
                      ].map((q) => (
                        <button key={q.id} onClick={() => navigate(q.id)}>
                          <span className="quick-icon">
                            <q.icon size={23} />
                          </span>
                          <span>
                            <strong>{q.title}</strong>
                            <small>{q.sub}</small>
                          </span>
                          <ChevronRight size={17} />
                        </button>
                      ))}
                    </div>
                  </section>
                  <section className="favorite-section">
                    <div className="section-heading">
                      <h2>
                        <Star size={19} />
                        Seus favoritos
                      </h2>
                      <button
                        className="text-button"
                        onClick={() => navigate("favorites")}
                      >
                        Ver todos <ChevronRight size={15} />
                      </button>
                    </div>
                    {prefs.favorites.length ? (
                      cards(
                        allTools
                          .filter((t) => prefs.favorites.includes(t.id))
                          .slice(0, 4),
                      )
                    ) : (
                      <div className="empty-favorites">
                        <Star size={24} />
                        <div>
                          <strong>
                            Seu plantão tem suas próprias prioridades.
                          </strong>
                          <p>
                            Toque na estrela de uma ferramenta para deixá-la
                            sempre por perto.
                          </p>
                        </div>
                      </div>
                    )}
                  </section>
                </>
              )}
              <section className="catalog">
                <div className="section-heading">
                  <h2>
                    {query
                      ? "Resultados da pesquisa"
                      : page === "favorites"
                        ? "Ferramentas favoritas"
                        : page === "labs"
                          ? "Interpretação de exames"
                          : page === "assessment"
                            ? "Escore de alerta"
                            : page === "calculators"
                              ? "Calculadoras clínicas"
                              : "Explore as ferramentas"}
                  </h2>
                  <span>{filtered.length} ferramentas</span>
                </div>
                {page === "home" && !query && (
                  <div className="category-links">
                    <button onClick={() => navigate("calculators")}>
                      <Calculator size={16} />
                      Calculadoras
                    </button>
                    <button onClick={() => navigate("labs")}>
                      <FlaskConical size={16} />
                      Exames
                    </button>
                    <button onClick={() => navigate("assessment")}>
                      <ClipboardList size={16} />
                      Avaliação
                    </button>
                  </div>
                )}
                {filtered.length ? (
                  cards(filtered)
                ) : (
                  <div className="empty-favorites">
                    <Search />
                    <p>
                      {page === "favorites"
                        ? "Nenhum favorito ainda. Explore as ferramentas e toque na estrela."
                        : "Nenhuma ferramenta encontrada. Tente outro termo."}
                    </p>
                  </div>
                )}
              </section>
              <div className="study-banner">
                <BookOpen size={25} />
                <div>
                  <h3>
                    {prefs.mode === "study"
                      ? "Entender também é cuidar."
                      : "Um espaço para aprender, também."}
                  </h3>
                  <p>
                    {prefs.mode === "study"
                      ? "As ferramentas exibem explicações, fórmulas e referências ampliadas."
                      : "Ative o modo Estudo para explorar as explicações por trás de cada cálculo."}
                  </p>
                </div>
                <button
                  className="secondary"
                  onClick={() =>
                    setPrefs({
                      ...prefs,
                      mode: prefs.mode === "study" ? "shift" : "study",
                    })
                  }
                >
                  {prefs.mode === "study"
                    ? "Voltar ao Plantão"
                    : "Conhecer modo Estudo"}{" "}
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </>
          )}
          <footer>
            <div className="clinical-warning">
              <ShieldCheck size={19} />
              <p>
                <strong>Apoio educacional · validação clínica pendente.</strong>{" "}
                Não substitui julgamento profissional nem protocolos
                institucionais. Em situações de urgência, siga o fluxo
                assistencial local.
              </p>
            </div>
            <PwaStatus />
            <div className="footer-line">
              <span>ED - CLINICARE · Feito para quem cuida.</span>
              <span>V1 · Revisão técnica 04 nov 2026</span>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
