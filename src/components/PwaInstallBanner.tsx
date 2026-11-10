import React, { useEffect, useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showIosTip, setShowIosTip] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowIosTip(true);
    }
  };

  return (
    <>
      {isOffline && (
        <div className="bg-amber-600 text-white text-xs font-medium py-1.5 px-4 flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Modo Offline PWA activo — Tus datos locales siguen disponibles.</span>
        </div>
      )}

      {!dismissed && (
        <div className="bg-slate-900 text-white text-xs py-2 px-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-sky-500/20 text-sky-400">
              <Smartphone className="w-3.5 h-3.5" />
            </span>
            <span>
              <strong className="text-sky-400">App PWA Instalable:</strong> Lleva la agenda de tu consultorio o el portal de pacientes en tu pantalla de inicio.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500 hover:bg-sky-400 text-white font-semibold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Instalar PWA
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
              title="Cerrar aviso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {showIosTip && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-base">Instalar PEPEMEDIC PWA</h3>
              <button
                onClick={() => setShowIosTip(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Esta aplicación está empaquetada como <strong>Progressive Web App (PWA)</strong> en Cloudflare Pages:
            </p>
            <ol className="text-xs text-slate-700 space-y-2 mb-5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <li>1. En <strong>Chrome / Edge (Desktop o Android)</strong>: haz clic en el ícono de instalar en la barra de direcciones.</li>
              <li>2. En <strong>iPhone / iPad (Safari)</strong>: toca el botón <strong>Compartir</strong> y selecciona <strong>"Agregar a pantalla de inicio"</strong>.</li>
            </ol>
            <button
              onClick={() => setShowIosTip(false)}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
