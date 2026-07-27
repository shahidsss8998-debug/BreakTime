import { createContext, useContext, useState, useEffect } from 'react';

const PWAContext = createContext();

export function usePWA() {
  return useContext(PWAContext);
}

export function PWAProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is already installed via display-mode
    const checkIsInstalled = () => {
      return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    };
    
    setIsInstalled(checkIsInstalled());

    // Listen for the beforeinstallprompt event (triggered by Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <PWAContext.Provider value={{
      isInstallable: !!deferredPrompt,
      isInstalled,
      installApp
    }}>
      {children}
    </PWAContext.Provider>
  );
}
