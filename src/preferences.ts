export type Preferences = {
  mode: "shift" | "study";
  theme: "system" | "light" | "dark";
  favorites: string[];
};
export const defaults: Preferences = {
  mode: "shift",
  theme: "system",
  favorites: [],
};
export function readPreferences(): Preferences {
  try {
    const p = JSON.parse(
      localStorage.getItem("clinicare-preferences") ?? "null",
    );
    return {
      mode: p?.mode === "study" ? "study" : "shift",
      theme: ["light", "dark"].includes(p?.theme) ? p.theme : "system",
      favorites: Array.isArray(p?.favorites)
        ? p.favorites.filter((x: unknown) => typeof x === "string")
        : [],
    };
  } catch {
    return defaults;
  }
}
export function savePreferences(p: Preferences) {
  try {
    localStorage.setItem("clinicare-preferences", JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}
