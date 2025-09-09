import { useState, useEffect, useCallback } from 'react';

interface PWAState {
  isInstalled: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  canInstall: boolean;
  hasUpdate: boolean;
  isUpdating: boolean;
}

interface UsePWAReturn extends PWAState {
  install: () => Promise<boolean>;
  update: () => Promise<void>;
  checkForUpdates: () => void;
}

export const usePWA = (): UsePWAReturn => {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    isStandalone: false,
    isOnline: navigator.onLine,
    canInstall: false,
    hasUpdate: false,
    isUpdating: false,
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Initialize PWA state
  useEffect(() => {
    const checkPWAStatus = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInstalled = isStandaloneMode || isInWebAppiOS;

      setState(prev => ({
        ...prev,
        isInstalled,
        isStandalone: isStandaloneMode,
      }));
    };

    checkPWAStatus();

    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Listen for online/offline events
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setState(prev => ({ ...prev, canInstall: true }));
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log('📱 PWA: App installed successfully');
      setState(prev => ({ 
        ...prev, 
        isInstalled: true, 
        canInstall: false 
      }));
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Register service worker
  const registerServiceWorker = async () => {
    try {
      console.log('🔧 PWA: Registering service worker...');
      
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      setRegistration(reg);
      console.log('✅ PWA: Service worker registered successfully');

      // Check for updates
      reg.update();

      // Listen for updates
      reg.addEventListener('updatefound', () => {
        console.log('🔍 PWA: Update found');
        const newWorker = reg.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'waiting') {
              console.log('⏳ PWA: New version waiting');
              setState(prev => ({ ...prev, hasUpdate: true }));
            }
          });
        }
      });

      // Check if there's already a waiting service worker
      if (reg.waiting) {
        setState(prev => ({ ...prev, hasUpdate: true }));
      }

      // Listen for controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 PWA: New service worker took control');
        window.location.reload();
      });

    } catch (error) {
      console.error('❌ PWA: Service worker registration failed:', error);
    }
  };

  // Install PWA
  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log('📱 PWA: No install prompt available');
      return false;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for user choice
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('📱 PWA: User accepted install');
        setState(prev => ({ 
          ...prev, 
          canInstall: false 
        }));
        return true;
      } else {
        console.log('📱 PWA: User dismissed install');
        return false;
      }
    } catch (error) {
      console.error('📱 PWA: Install failed:', error);
      return false;
    } finally {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  // Update PWA
  const update = useCallback(async (): Promise<void> => {
    if (!registration?.waiting) {
      console.log('⚠️ PWA: No update available');
      return;
    }

    setState(prev => ({ ...prev, isUpdating: true }));

    try {
      // Skip waiting and activate the new service worker
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      setState(prev => ({ 
        ...prev, 
        hasUpdate: false,
        isUpdating: false 
      }));

    } catch (error) {
      console.error('🔄 PWA: Update failed:', error);
      setState(prev => ({ ...prev, isUpdating: false }));
    }
  }, [registration]);

  // Check for updates manually
  const checkForUpdates = useCallback(() => {
    if (registration) {
      console.log('🔍 PWA: Checking for updates...');
      registration.update();
    }
  }, [registration]);

  return {
    ...state,
    install,
    update,
    checkForUpdates,
  };
};