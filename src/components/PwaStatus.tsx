import { useState, useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
export function PwaStatus() {
  const [install, setInstall] = useState<InstallEvent | null>(null),
    [online, setOnline] = useState(navigator.onLine),
    [hint, setHint] = useState(false);
  const {
    needRefresh: [refresh],
    offlineReady: [ready],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration)
        window.setInterval(
          () => {
            if (navigator.onLine) void registration.update().catch(() => {});
          },
          60 * 60 * 1000,
        );
    },
  });
  useEffect(() => {
    const onInstall = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallEvent);
    };
    const onInstalled = () => setInstall(null),
      onOnline = () => setOnline(true),
      onOffline = () => setOnline(false);
    window.addEventListener("beforeinstallprompt", onInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);
  return (
    <div className="pwa-area">
      <span className="connection">
        <i className={online ? "online" : ""} />
        {!online
          ? "Você está offline"
          : ready
            ? "Pronto para uso offline"
            : "Uso local · sem APIs clínicas"}
      </span>
      <button
        className="install"
        onClick={async () => {
          if (install) {
            await install.prompt();
            if ((await install.userChoice).outcome === "accepted")
              setInstall(null);
          } else setHint(!hint);
        }}
      >
        Instalar aplicativo ↗
      </button>
      {hint && (
        <p className="install-hint">
          No iPhone: abra no Safari, toque em Compartilhar → Adicionar à Tela de
          Início. No Android/desktop: use “Instalar aplicativo” no menu do
          navegador. Acesse uma vez online para preparar o uso offline.
        </p>
      )}
      {refresh && (
        <div className="update" role="status">
          Nova versão disponível. Atualizar limpa os campos abertos.
          <button onClick={() => void updateServiceWorker(true)}>
            Atualizar agora
          </button>
        </div>
      )}
    </div>
  );
}
