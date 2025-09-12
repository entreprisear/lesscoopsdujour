// Les Scoops du Jour - Asset Optimization System
// Système d'optimisation des assets CSS/JS avec critical CSS et code splitting

export class AssetOptimizer {
  constructor(options = {}) {
    this.options = {
      enableCriticalCSS: options.enableCriticalCSS !== false,
      enableCodeSplitting: options.enableCodeSplitting !== false,
      enablePreloading: options.enablePreloading !== false,
      criticalCSSSelector: options.criticalCSSSelector || '.above-fold',
      ...options
    };

    this.loadedModules = new Set();
    this.preloadedAssets = new Set();
    this.criticalCSS = '';
  }

  // Extraire le CSS critique
  async extractCriticalCSS() {
    if (!this.options.enableCriticalCSS) return '';

    try {
      // Simuler l'extraction du CSS critique
      // En production, utiliser un outil comme critters ou penthouse

      const criticalRules = [];

      // Règles CSS critiques pour le header et contenu principal
      criticalRules.push(`
        .header { position: relative; background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%); color: white; padding: 1rem 0; }
        .header-main { position: relative; z-index: 10; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
        .logo { font-size: 1.5rem; font-weight: bold; text-decoration: none; color: white; }
        .nav ul { display: flex; gap: 2rem; list-style: none; margin: 0; }
        .nav a { color: white; text-decoration: none; font-weight: 500; }
        .search-bar { display: flex; gap: 0.5rem; }
        .search-bar input { padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; }
        .btn { display: inline-block; padding: 0.5rem 1rem; background: #d32f2f; color: white; text-decoration: none; border-radius: 0.375rem; }
        .hero-section { background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%); color: white; padding: 4rem 0; text-align: center; }
        .hero-title { font-size: 3rem; font-weight: bold; margin-bottom: 1rem; }
        .hero-subtitle { font-size: 1.25rem; opacity: 0.9; }
      `);

      this.criticalCSS = criticalRules.join('\n');
      return this.criticalCSS;
    } catch (error) {
      console.warn('Critical CSS extraction failed:', error);
      return '';
    }
  }

  // Injecter le CSS critique
  injectCriticalCSS() {
    if (!this.criticalCSS) return;

    const style = document.createElement('style');
    style.textContent = this.criticalCSS;
    style.setAttribute('data-critical', 'true');

    // Injecter au début du head
    const firstStyle = document.head.querySelector('style, link[rel="stylesheet"]');
    if (firstStyle) {
      document.head.insertBefore(style, firstStyle);
    } else {
      document.head.appendChild(style);
    }
  }

  // Charger un module JavaScript de manière asynchrone
  async loadModule(modulePath, options = {}) {
    const {
      priority = 'normal',
      onLoad = () => {},
      onError = (error) => console.error('Module load failed:', error)
    } = options;

    if (this.loadedModules.has(modulePath)) {
      onLoad();
      return;
    }

    try {
      const module = await import(modulePath);
      this.loadedModules.add(modulePath);
      onLoad(module);
      return module;
    } catch (error) {
      onError(error);
      throw error;
    }
  }

  // Précharger un asset
  preloadAsset(url, as, options = {}) {
    const {
      crossorigin = false,
      importance = 'low'
    } = options;

    if (this.preloadedAssets.has(url)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;

    if (crossorigin) link.crossOrigin = 'anonymous';
    if (importance === 'high') link.setAttribute('importance', 'high');

    document.head.appendChild(link);
    this.preloadedAssets.add(url);
  }

  // Précharger plusieurs assets
  preloadAssets(assets) {
    assets.forEach(asset => {
      this.preloadAsset(asset.url, asset.as, asset.options);
    });
  }

  // Code splitting basé sur les routes
  async loadRouteModule(route, options = {}) {
    if (!this.options.enableCodeSplitting) {
      // Fallback vers le chargement normal
      return this.loadModule(`./routes/${route}.js`, options);
    }

    const modulePath = `./routes/${route}.js`;

    // Charger le module de route
    return this.loadModule(modulePath, {
      ...options,
      onLoad: (module) => {
        // Initialiser la route après chargement
        if (module.init) {
          module.init();
        }
        if (options.onLoad) options.onLoad(module);
      }
    });
  }

  // Optimiser le chargement des polices
  optimizeFonts() {
    // Précharger les polices critiques
    this.preloadAsset(
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      'style',
      { importance: 'high' }
    );

    // Ajouter font-display: swap aux polices
    const fontCSS = `
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 300 700;
        font-display: swap;
        src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2') format('woff2');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
      }
    `;

    const style = document.createElement('style');
    style.textContent = fontCSS;
    document.head.appendChild(style);
  }

  // Optimiser les images
  optimizeImages() {
    // Ajouter loading="lazy" aux images qui n'en ont pas
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      img.loading = 'lazy';
    });

    // Ajouter decoding="async" pour un meilleur rendu
    const allImages = document.querySelectorAll('img:not([decoding])');
    allImages.forEach(img => {
      img.decoding = 'async';
    });
  }

  // Minifier et optimiser le CSS
  async optimizeCSS() {
    // En production, ceci utiliserait des outils comme cssnano ou postcss
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');

    stylesheets.forEach(link => {
      // Ajouter des attributs d'optimisation
      link.media = 'print';
      link.onload = () => {
        link.media = 'all';
        link.removeAttribute('onload');
      };
    });
  }

  // Optimiser les scripts
  optimizeScripts() {
    const scripts = document.querySelectorAll('script[src]:not([async]):not([defer])');

    scripts.forEach(script => {
      // Ajouter defer aux scripts non critiques
      if (!script.hasAttribute('data-critical')) {
        script.defer = true;
      }
    });
  }

  // Préchargement intelligent basé sur l'analyse de l'utilisateur
  setupIntelligentPreloading() {
    let preloadTimeout;

    const preloadBasedOnIntent = () => {
      clearTimeout(preloadTimeout);

      preloadTimeout = setTimeout(() => {
        // Précharger les routes probables
        const currentPath = window.location.pathname;

        if (currentPath === '/' || currentPath === '/index.html') {
          // Sur la page d'accueil, précharger les articles populaires
          this.preloadAsset('/article.html', 'document');
          this.preloadAsset('/search.html', 'document');
        } else if (currentPath.includes('article')) {
          // Sur un article, précharger le forum
          this.preloadAsset('/forum.html', 'document');
        }
      }, 1000);
    };

    // Écouter les mouvements de souris vers les liens
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a[href]');
      if (link && link.hostname === window.location.hostname) {
        this.preloadAsset(link.href, 'document', { importance: 'low' });
      }
    });

    // Préchargement basé sur le scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(preloadBasedOnIntent, 100);
    });
  }

  // Mesurer les performances de chargement
  setupPerformanceMonitoring() {
    if (!('performance' in window) || !('PerformanceObserver' in window)) return;

    // Observer les métriques de navigation
    const navObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log('Navigation performance:', {
          type: entry.type,
          loadTime: entry.loadEventEnd - entry.loadEventStart,
          domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
          firstPaint: entry.responseStart - entry.requestStart
        });
      });
    });

    navObserver.observe({ entryTypes: ['navigation'] });

    // Observer les métriques de ressources
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 1000) { // Plus d'1 seconde
          console.warn('Slow resource:', {
            url: entry.name,
            type: entry.initiatorType,
            loadTime: entry.responseEnd - entry.requestStart,
            size: entry.transferSize
          });
        }
      });
    });

    resourceObserver.observe({ entryTypes: ['resource'] });

    // Cleanup après 30 secondes
    setTimeout(() => {
      navObserver.disconnect();
      resourceObserver.disconnect();
    }, 30000);
  }

  // Générer un rapport de performance
  generatePerformanceReport() {
    if (!('performance' in window)) return null;

    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');

    const report = {
      navigation: {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstByte: navigation.responseStart - navigation.requestStart
      },
      resources: {
        total: resources.length,
        slowResources: resources.filter(r => r.duration > 1000).length,
        totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
      },
      assets: {
        loadedModules: this.loadedModules.size,
        preloadedAssets: this.preloadedAssets.size,
        criticalCSSSize: this.criticalCSS.length
      }
    };

    console.table(report);
    return report;
  }

  // Nettoyer les ressources
  cleanup() {
    this.loadedModules.clear();
    this.preloadedAssets.clear();
    this.criticalCSS = '';
  }
}

// Fonction pour initialiser l'optimisation globale des assets
export async function initAssetOptimization() {
  const assetOptimizer = new AssetOptimizer({
    enableCriticalCSS: true,
    enableCodeSplitting: true,
    enablePreloading: true
  });

  // Extraire et injecter le CSS critique
  await assetOptimizer.extractCriticalCSS();
  assetOptimizer.injectCriticalCSS();

  // Optimiser les polices
  assetOptimizer.optimizeFonts();

  // Optimiser les images
  assetOptimizer.optimizeImages();

  // Optimiser les scripts
  assetOptimizer.optimizeScripts();

  // Préchargement intelligent
  assetOptimizer.setupIntelligentPreloading();

  // Surveillance des performances
  assetOptimizer.setupPerformanceMonitoring();

  // Exposer globalement
  window.assetOptimizer = assetOptimizer;

  return assetOptimizer;
}

// Fonction pour mesurer les Core Web Vitals
export function measureCoreWebVitals() {
  if (!('web-vitals' in window)) return;

  // Mesurer les Core Web Vitals
  import('https://unpkg.com/web-vitals@3.1.1/dist/web-vitals.es5.min.js').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });
}

// Hook pour mesurer le temps de rendu
export function measureRenderTime(callback) {
  if (!('performance' in window)) return callback();

  const startMark = 'render-start';
  const endMark = 'render-end';

  performance.mark(startMark);

  const result = callback();

  // Mesurer après le prochain tick
  setTimeout(() => {
    performance.mark(endMark);
    performance.measure('render-time', startMark, endMark);

    const measure = performance.getEntriesByName('render-time')[0];
    if (measure) {
      console.log(`Render time: ${measure.duration.toFixed(2)}ms`);
    }
  }, 0);

  return result;
}

// Fonction pour optimiser le cache HTTP
export function setupHTTPCaching() {
  // En production, ceci serait configuré côté serveur
  // Pour la démo, on simule avec service worker

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration.scope);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  }
}

// Fonction pour compresser les réponses (simulation)
export function setupResponseCompression() {
  // En production, ceci serait configuré côté serveur (gzip, brotli)
  // Pour la démo, on vérifie si la compression est activée

  if ('connection' in navigator) {
    const connection = navigator.connection;
    console.log('Connection info:', {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    });
  }
}

// Fonction pour optimiser les requêtes réseau
export function setupNetworkOptimization() {
  // Préconnexion aux domaines externes
  const externalDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://via.placeholder.com'
  ];

  externalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // DNS prefetch pour les autres domaines
  const prefetchDomains = [
    'https://unpkg.com'
  ];

  prefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
}
