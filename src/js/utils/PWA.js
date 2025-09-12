// Les Scoops du Jour - Progressive Web App Manager
// Gestion complète des fonctionnalités PWA

export class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.registration = null;
    this.init();
  }

  init() {
    this.checkInstallationStatus();
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupNetworkMonitoring();
    this.setupVisibilityChange();
    this.setupBeforeUnload();

    console.log('📱 PWA Manager initialized');
  }

  // Vérifier si l'app est déjà installée
  checkInstallationStatus() {
    // Vérifier si on est en mode standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = window.navigator.standalone === true;

    this.isInstalled = isStandalone || isIOSStandalone;

    if (this.isInstalled) {
      console.log('📱 App is running in standalone mode');
      this.hideInstallPrompt();
    } else {
      console.log('🌐 App is running in browser mode');
    }
  }

  // Enregistrer le service worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('✅ Service Worker registered:', this.registration.scope);

        // Gérer les mises à jour du service worker
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration.installing;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        });

        // Écouter les messages du service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event);
        });

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    } else {
      console.warn('⚠️ Service Worker not supported');
    }
  }

  // Configurer le prompt d'installation
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
      console.log('📱 Install prompt triggered');

      // Empêcher l'affichage automatique du prompt
      event.preventDefault();
      this.deferredPrompt = event;

      // Afficher notre propre prompt d'installation
      this.showInstallPrompt();
    });

    // Écouter l'événement d'installation réussie
    window.addEventListener('appinstalled', (event) => {
      console.log('✅ App installed successfully');
      this.isInstalled = true;
      this.hideInstallPrompt();
      this.showInstallSuccessNotification();
    });
  }

  // Afficher le prompt d'installation personnalisé
  showInstallPrompt() {
    if (this.isInstalled) return;

    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.className = 'install-banner';
    installBanner.innerHTML = `
      <div class="install-banner-content">
        <div class="install-banner-icon">📱</div>
        <div class="install-banner-text">
          <strong>Installez Les Scoops du Jour</strong>
          <span>Accédez aux actualités hors ligne et recevez des notifications</span>
        </div>
        <div class="install-banner-actions">
          <button class="install-btn" id="install-now">Installer</button>
          <button class="dismiss-btn" id="dismiss-install">Plus tard</button>
        </div>
      </div>
    `;

    document.body.appendChild(installBanner);

    // Gestionnaires d'événements
    document.getElementById('install-now').addEventListener('click', () => {
      this.installApp();
    });

    document.getElementById('dismiss-install').addEventListener('click', () => {
      this.hideInstallPrompt();
      // Stocker la préférence pour ne pas réafficher pendant 7 jours
      localStorage.setItem('install-dismissed', Date.now().toString());
    });

    // Animation d'entrée
    setTimeout(() => installBanner.classList.add('show'), 100);
  }

  // Masquer le prompt d'installation
  hideInstallPrompt() {
    const installBanner = document.getElementById('install-banner');
    if (installBanner) {
      installBanner.classList.remove('show');
      setTimeout(() => installBanner.remove(), 300);
    }
  }

  // Installer l'application
  async installApp() {
    if (!this.deferredPrompt) return;

    try {
      const result = await this.deferredPrompt.prompt();
      console.log('📱 Install prompt result:', result.outcome);

      // Nettoyer le deferred prompt
      this.deferredPrompt = null;

    } catch (error) {
      console.error('❌ Installation failed:', error);
    }
  }

  // Afficher la notification de mise à jour
  showUpdateNotification() {
    const updateBanner = document.createElement('div');
    updateBanner.id = 'update-banner';
    updateBanner.className = 'update-banner';
    updateBanner.innerHTML = `
      <div class="update-banner-content">
        <div class="update-banner-icon">🔄</div>
        <div class="update-banner-text">
          <strong>Mise à jour disponible</strong>
          <span>Une nouvelle version est prête à être installée</span>
        </div>
        <div class="update-banner-actions">
          <button class="update-btn" id="update-now">Mettre à jour</button>
          <button class="dismiss-btn" id="dismiss-update">Plus tard</button>
        </div>
      </div>
    `;

    document.body.appendChild(updateBanner);

    document.getElementById('update-now').addEventListener('click', () => {
      this.updateApp();
    });

    document.getElementById('dismiss-update').addEventListener('click', () => {
      updateBanner.remove();
    });

    setTimeout(() => updateBanner.classList.add('show'), 100);
  }

  // Mettre à jour l'application
  updateApp() {
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      this.registration.waiting.addEventListener('statechange', (event) => {
        if (event.target.state === 'activated') {
          window.location.reload();
        }
      });
    }
  }

  // Afficher la notification d'installation réussie
  showInstallSuccessNotification() {
    this.showNotification(
      '🎉 Application installée avec succès !',
      'success'
    );
  }

  // Gestion des notifications push
  async setupPushNotifications() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('⚠️ Push notifications not supported');
      return;
    }

    // Demander la permission
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('✅ Push notifications granted');

      // S'abonner aux notifications push
      try {
        const subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            'BKxQzBJhNpJf6Q3vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7vQ7v'
          )
        });

        console.log('📡 Push subscription:', subscription);

        // Envoyer la souscription au serveur
        this.sendSubscriptionToServer(subscription);

      } catch (error) {
        console.error('❌ Push subscription failed:', error);
      }

    } else {
      console.log('❌ Push notifications denied');
    }
  }

  // Convertir la clé VAPID
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  // Envoyer la souscription au serveur
  async sendSubscriptionToServer(subscription) {
    try {
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });
      console.log('📡 Subscription sent to server');
    } catch (error) {
      console.error('❌ Failed to send subscription:', error);
    }
  }

  // Background sync pour les actions hors ligne
  async setupBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        await this.registration.sync.register('background-sync');
        console.log('🔄 Background sync registered');
      } catch (error) {
        console.error('❌ Background sync registration failed:', error);
      }
    }
  }

  // Surveillance de la connectivité réseau
  setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored');
      this.showNotification('Connexion rétablie', 'success');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      console.log('🔌 Connection lost');
      this.showNotification('Vous êtes hors ligne', 'warning');
    });
  }

  // Synchroniser les données hors ligne
  async syncOfflineData() {
    if (this.registration) {
      try {
        await this.registration.sync.register('background-sync');
        console.log('🔄 Offline data sync initiated');
      } catch (error) {
        console.error('❌ Offline sync failed:', error);
      }
    }
  }

  // Gestion du changement de visibilité
  setupVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('👁️ Page hidden');
        // Pause des animations/timers si nécessaire
      } else {
        console.log('👁️ Page visible');
        // Reprise des animations/timers
        this.checkForUpdates();
      }
    });
  }

  // Vérifier les mises à jour quand la page redevient visible
  async checkForUpdates() {
    if (this.registration) {
      await this.registration.update();
    }
  }

  // Gestion de la fermeture de la page
  setupBeforeUnload() {
    window.addEventListener('beforeunload', (event) => {
      // Sauvegarder l'état de l'application si nécessaire
      this.saveAppState();
    });
  }

  // Sauvegarder l'état de l'application
  saveAppState() {
    const state = {
      scrollPosition: window.pageYOffset,
      currentPage: window.location.pathname,
      timestamp: Date.now()
    };

    try {
      sessionStorage.setItem('app-state', JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save app state:', error);
    }
  }

  // Restaurer l'état de l'application
  restoreAppState() {
    try {
      const state = JSON.parse(sessionStorage.getItem('app-state'));
      if (state && Date.now() - state.timestamp < 300000) { // 5 minutes
        // Restaurer la position de scroll
        if (state.scrollPosition > 0) {
          window.scrollTo(0, state.scrollPosition);
        }
      }
    } catch (error) {
      console.warn('Failed to restore app state:', error);
    }
  }

  // Gestion des messages du service worker
  handleServiceWorkerMessage(event) {
    const { type, data } = event.data;

    switch (type) {
      case 'CACHE_STATS':
        console.log('📊 Cache stats:', data);
        break;

      case 'OFFLINE_READY':
        this.showNotification('Contenu disponible hors ligne', 'success');
        break;

      default:
        console.log('📨 SW Message:', type, data);
    }
  }

  // Partage via Web Share API
  async shareContent(title, text, url) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url
        });
        console.log('📤 Content shared successfully');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('❌ Share failed:', error);
          this.fallbackShare(title, text, url);
        }
      }
    } else {
      this.fallbackShare(title, text, url);
    }
  }

  // Partage de fallback
  fallbackShare(title, text, url) {
    const shareUrl = `${text} ${url}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.showNotification('Lien copié dans le presse-papiers', 'success');
      });
    } else {
      // Fallback vers un prompt
      window.prompt('Copiez ce lien:', shareUrl);
    }
  }

  // Obtenir les statistiques PWA
  getStats() {
    return {
      isInstalled: this.isInstalled,
      serviceWorker: !!this.registration,
      pushSupported: 'Notification' in window,
      shareSupported: 'share' in navigator,
      online: navigator.onLine,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    };
  }

  // Afficher une notification
  showNotification(message, type = 'info') {
    // Utiliser le système de notifications existant
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      // Fallback vers alert
      alert(message);
    }
  }

  // Nettoyer les ressources
  destroy() {
    this.hideInstallPrompt();
    // Nettoyer les event listeners si nécessaire
  }
}

// Fonction pour initialiser la PWA
export function initPWA() {
  const pwaManager = new PWAManager();

  // Exposer globalement
  window.pwaManager = pwaManager;

  return pwaManager;
}

// Hook pour mesurer les métriques PWA
export function measurePWAMetrics() {
  if (!('performance' in window)) return;

  // Mesurer le temps de démarrage de la PWA
  const startTime = performance.now();

  window.addEventListener('load', () => {
    const loadTime = performance.now() - startTime;
    console.log(`🚀 PWA load time: ${loadTime.toFixed(2)}ms`);

    // Envoyer au service worker pour métriques
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PERFORMANCE_MARK',
        data: { loadTime, timestamp: Date.now() }
      });
    }
  });
}

// Gestion des gestes tactiles mobiles
export class TouchGestures {
  constructor() {
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.minSwipeDistance = 50;
    this.maxVerticalDistance = 100;

    this.init();
  }

  init() {
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });

    // Supprimer le délai de 300ms sur les taps
    this.removeTapDelay();

    console.log('👆 Touch gestures initialized');
  }

  handleTouchStart(event) {
    this.touchStartX = event.changedTouches[0].screenX;
    this.touchStartY = event.changedTouches[0].screenY;
  }

  handleTouchEnd(event) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.touchEndY = event.changedTouches[0].screenY;

    this.handleSwipe();
  }

  handleSwipe() {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Vérifier si c'est un swipe horizontal
    if (absDeltaX > this.minSwipeDistance && absDeltaY < this.maxVerticalDistance) {
      if (deltaX > 0) {
        this.onSwipeRight();
      } else {
        this.onSwipeLeft();
      }
    }
  }

  onSwipeLeft() {
    // Navigation vers la page suivante (articles, etc.)
    console.log('👈 Swipe left detected');
    // Implémenter la logique de navigation
  }

  onSwipeRight() {
    // Navigation vers la page précédente
    console.log('👉 Swipe right detected');
    // Implémenter la logique de navigation
  }

  removeTapDelay() {
    // Supprimer le délai de 300ms sur iOS
    if ('touchstart' in document.documentElement) {
      document.addEventListener('touchstart', () => {}, { passive: true });
    }

    // FastClick-like behavior
    let touchStartTime = 0;
    document.addEventListener('touchstart', () => {
      touchStartTime = Date.now();
    }, { passive: true });

    document.addEventListener('touchend', (event) => {
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime;

      if (touchDuration < 300) {
        // Fast tap - déclencher immédiatement
        event.target.click();
      }
    }, { passive: true });
  }
}

// Gestion de l'orientation et des safe areas
export class MobileOptimizations {
  constructor() {
    this.currentOrientation = this.getOrientation();
    this.init();
  }

  init() {
    this.setupOrientationHandling();
    this.setupSafeAreaInsets();
    this.setupScrollMomentum();

    console.log('📱 Mobile optimizations initialized');
  }

  getOrientation() {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  setupOrientationHandling() {
    window.addEventListener('orientationchange', () => {
      const newOrientation = this.getOrientation();

      if (newOrientation !== this.currentOrientation) {
        console.log(`📱 Orientation changed: ${this.currentOrientation} → ${newOrientation}`);
        this.currentOrientation = newOrientation;

        // Ajuster le layout si nécessaire
        this.adjustLayoutForOrientation(newOrientation);
      }
    });
  }

  adjustLayoutForOrientation(orientation) {
    const body = document.body;

    if (orientation === 'landscape') {
      body.classList.add('landscape-mode');
      body.classList.remove('portrait-mode');
    } else {
      body.classList.add('portrait-mode');
      body.classList.remove('landscape-mode');
    }
  }

  setupSafeAreaInsets() {
    // Détecter les safe area insets (iPhone X et plus récent)
    const style = document.createElement('style');
    style.textContent = `
      @supports (padding: max(0px)) {
        .safe-area-top { padding-top: max(1rem, env(safe-area-inset-top)); }
        .safe-area-bottom { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
        .safe-area-left { padding-left: max(1rem, env(safe-area-inset-left)); }
        .safe-area-right { padding-right: max(1rem, env(safe-area-inset-right)); }
      }
    `;
    document.head.appendChild(style);

    // Appliquer les classes safe area au body
    document.body.classList.add('safe-area-top', 'safe-area-bottom');
  }

  setupScrollMomentum() {
    // Activer le momentum scrolling sur iOS
    document.body.style.webkitOverflowScrolling = 'touch';

    // Optimiser le scroll pour les appareils mobiles
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-overflow-scrolling: touch;
      }

      .scrollable {
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }
    `;
    document.head.appendChild(style);
  }

  // Détecter les capacités de l'appareil
  getDeviceCapabilities() {
    return {
      touch: 'ontouchstart' in window,
      retina: window.devicePixelRatio > 1,
      standalone: window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches,
      pwa: 'serviceWorker' in navigator && 'manifest' in document.createElement('link'),
      safeArea: CSS.supports('padding: max(0px)') && CSS.supports('env(safe-area-inset-top)')
    };
  }
}

// Initialisation globale des fonctionnalités PWA
export function initPWACore() {
  // Initialiser le PWA manager
  const pwaManager = initPWA();

  // Mesurer les métriques PWA
  measurePWAMetrics();

  // Initialiser les gestes tactiles
  const touchGestures = new TouchGestures();

  // Initialiser les optimisations mobiles
  const mobileOptimizations = new MobileOptimizations();

  // Restaurer l'état de l'application
  pwaManager.restoreAppState();

  // Configurer les notifications push (optionnel)
  // pwaManager.setupPushNotifications();

  // Configurer le background sync
  pwaManager.setupBackgroundSync();

  console.log('🎯 PWA Core initialized with all features');

  return {
    pwaManager,
    touchGestures,
    mobileOptimizations
  };
}
