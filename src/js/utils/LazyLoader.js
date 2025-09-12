// Les Scoops du Jour - Advanced Lazy Loading System
// Système de chargement différé optimisé pour les performances

export class LazyLoader {
  constructor(options = {}) {
    this.rootMargin = options.rootMargin || '50px';
    this.threshold = options.threshold || 0.1;
    this.observer = null;
    this.observedElements = new Set();
    this.loadedElements = new Set();
    this.loadingQueue = new Map();
    this.init();
  }

  init() {
    this.observer = this.createObserver();
    this.setupPerformanceMonitoring();
  }

  createObserver() {
    return new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadElement(entry.target);
        }
      });
    }, {
      rootMargin: this.rootMargin,
      threshold: this.threshold
    });
  }

  observe(element) {
    if (!element || this.observedElements.has(element)) return;

    this.observedElements.add(element);
    this.observer.observe(element);
  }

  unobserve(element) {
    if (!element || !this.observedElements.has(element)) return;

    this.observedElements.delete(element);
    this.observer.unobserve(element);
  }

  loadElement(element) {
    if (!element || this.loadedElements.has(element)) return;

    const elementType = this.getElementType(element);

    switch (elementType) {
      case 'image':
        this.loadImage(element);
        break;
      case 'iframe':
        this.loadIframe(element);
        break;
      case 'video':
        this.loadVideo(element);
        break;
      case 'component':
        this.loadComponent(element);
        break;
      default:
        this.loadGeneric(element);
        break;
    }

    this.loadedElements.add(element);
    this.unobserve(element);
  }

  getElementType(element) {
    if (element.tagName === 'IMG') return 'image';
    if (element.tagName === 'IFRAME') return 'iframe';
    if (element.tagName === 'VIDEO') return 'video';
    if (element.hasAttribute('data-component')) return 'component';
    return 'generic';
  }

  loadImage(img) {
    const src = img.getAttribute('data-src');
    const srcset = img.getAttribute('data-srcset');
    const sizes = img.getAttribute('data-sizes');

    if (!src) return;

    // Créer une nouvelle image pour précharger
    const newImg = new Image();

    newImg.onload = () => {
      img.src = src;
      if (srcset) img.srcset = srcset;
      if (sizes) img.sizes = sizes;

      img.classList.remove('lazy');
      img.classList.add('loaded');

      this.performanceMark(`image-loaded-${src}`);
    };

    newImg.onerror = () => {
      console.warn(`Failed to load image: ${src}`);
      img.classList.add('error');
    };

    // Précharger l'image
    newImg.src = src;
    if (srcset) newImg.srcset = srcset;
  }

  loadIframe(iframe) {
    const src = iframe.getAttribute('data-src');
    if (!src) return;

    iframe.src = src;
    iframe.classList.remove('lazy');
    iframe.classList.add('loaded');

    this.performanceMark(`iframe-loaded-${src}`);
  }

  loadVideo(video) {
    const sources = video.querySelectorAll('source[data-src]');
    sources.forEach(source => {
      const src = source.getAttribute('data-src');
      const type = source.getAttribute('data-type');
      if (src) {
        source.src = src;
        if (type) source.type = type;
      }
    });

    video.load();
    video.classList.remove('lazy');
    video.classList.add('loaded');

    this.performanceMark('video-loaded');
  }

  loadComponent(element) {
    const componentName = element.getAttribute('data-component');
    const componentData = element.getAttribute('data-props');

    if (!componentName) return;

    // Simulation de chargement de composant dynamique
    this.loadComponentAsync(componentName, element, componentData);
  }

  async loadComponentAsync(componentName, element, data) {
    try {
      // Ici on pourrait charger dynamiquement un module
      // const module = await import(`./components/${componentName}.js`);
      // const Component = module.default;
      // const component = new Component(element, JSON.parse(data || '{}'));

      // Simulation
      element.innerHTML = `<div class="component-placeholder">Chargement de ${componentName}...</div>`;

      setTimeout(() => {
        element.innerHTML = `<div class="component-loaded">${componentName} chargé avec succès</div>`;
        element.classList.add('loaded');
        this.performanceMark(`component-loaded-${componentName}`);
      }, 100);

    } catch (error) {
      console.error(`Failed to load component: ${componentName}`, error);
      element.innerHTML = `<div class="component-error">Erreur de chargement</div>`;
      element.classList.add('error');
    }
  }

  loadGeneric(element) {
    // Pour les éléments génériques avec data-src
    const src = element.getAttribute('data-src');
    if (src) {
      // Logique générique de chargement
      element.classList.remove('lazy');
      element.classList.add('loaded');
    }
  }

  // Chargement par lot pour optimiser les performances
  loadBatch(elements) {
    elements.forEach(element => this.loadElement(element));
  }

  // Préchargement intelligent
  preloadNearby(elements, count = 3) {
    elements.slice(0, count).forEach(element => {
      if (!this.loadedElements.has(element)) {
        this.loadElement(element);
      }
    });
  }

  // Configuration adaptative basée sur la connexion
  adaptToConnection() {
    if ('connection' in navigator) {
      const connection = navigator.connection;

      if (connection.saveData) {
        // Mode économie de données
        this.rootMargin = '100px';
        this.threshold = 0.05;
      } else if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        // Connexion lente
        this.rootMargin = '200px';
        this.threshold = 0.01;
      } else if (connection.effectiveType === '3g') {
        // Connexion moyenne
        this.rootMargin = '100px';
        this.threshold = 0.1;
      } else {
        // Connexion rapide (4g+)
        this.rootMargin = '50px';
        this.threshold = 0.1;
      }

      // Recréer l'observer avec les nouvelles options
      this.observer.disconnect();
      this.observer = this.createObserver();

      // Réobserver tous les éléments
      this.observedElements.forEach(element => {
        this.observer.observe(element);
      });
    }
  }

  // Surveillance des performances
  setupPerformanceMonitoring() {
    if ('performance' in window && 'PerformanceObserver' in window) {
      // Observer les métriques de performance
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name.includes('lazy-load')) {
            console.log(`Lazy loading performance: ${entry.name} - ${entry.duration}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['measure'] });
    }
  }

  performanceMark(name) {
    if ('performance' in window && performance.mark) {
      performance.mark(name);
    }
  }

  // Statistiques de chargement
  getStats() {
    return {
      observedElements: this.observedElements.size,
      loadedElements: this.loadedElements.size,
      loadingQueue: this.loadingQueue.size,
      loadRatio: this.observedElements.size > 0 ?
        (this.loadedElements.size / this.observedElements.size * 100).toFixed(1) + '%' : '0%'
    };
  }

  // Nettoyage
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.observedElements.clear();
    this.loadedElements.clear();
    this.loadingQueue.clear();
  }
}

// Fonction utilitaire pour initialiser le lazy loading global
export function initGlobalLazyLoading() {
  const lazyLoader = new LazyLoader({
    rootMargin: '50px',
    threshold: 0.1
  });

  // Observer automatiquement tous les éléments avec data-src
  const lazyElements = document.querySelectorAll('[data-src]');
  lazyElements.forEach(element => {
    lazyLoader.observe(element);
  });

  // Adapter à la connexion
  lazyLoader.adaptToConnection();

  // Écouter les changements de connexion
  if ('connection' in navigator) {
    navigator.connection.addEventListener('change', () => {
      lazyLoader.adaptToConnection();
    });
  }

  // Exposer globalement pour utilisation dans d'autres modules
  window.lazyLoader = lazyLoader;

  return lazyLoader;
}

// Fonction pour créer des images responsives optimisées
export function createOptimizedImage(src, alt, options = {}) {
  const {
    sizes = '100vw',
    loading = 'lazy',
    className = '',
    webp = true,
    placeholder = true
  } = options;

  const img = document.createElement('img');
  img.alt = alt;
  img.loading = loading;
  img.className = className;

  if (sizes) img.sizes = sizes;

  // Générer les sources responsives
  const sources = generateResponsiveSources(src, webp);

  if (sources.length > 0) {
    img.srcset = sources.map(s => `${s.url} ${s.width}w`).join(', ');
  } else {
    img.src = src;
  }

  // Placeholder coloré pendant le chargement
  if (placeholder) {
    const color = getImagePlaceholderColor(src);
    img.style.backgroundColor = color;
    img.classList.add('image-placeholder');
  }

  // Gestionnaire de chargement
  img.addEventListener('load', () => {
    img.classList.add('loaded');
    img.classList.remove('image-placeholder');
  });

  img.addEventListener('error', () => {
    img.classList.add('error');
    console.warn(`Failed to load image: ${src}`);
  });

  return img;
}

// Générer les sources responsives
function generateResponsiveSources(src, webp = true) {
  const sources = [];
  const breakpoints = [320, 640, 768, 1024, 1280, 1920];

  breakpoints.forEach(width => {
    sources.push({
      url: generateResponsiveUrl(src, width, webp),
      width: width
    });
  });

  return sources;
}

// Générer l'URL responsive (simulation)
function generateResponsiveUrl(src, width, webp = true) {
  // En production, ceci serait géré par un service d'optimisation d'images
  const extension = webp ? 'webp' : src.split('.').pop();
  return `${src}?w=${width}&format=${extension}&quality=80`;
}

// Générer une couleur de placeholder basée sur l'URL
function getImagePlaceholderColor(src) {
  let hash = 0;
  for (let i = 0; i < src.length; i++) {
    hash = src.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];

  return colors[Math.abs(hash) % colors.length];
}

// Hook pour mesurer les performances de chargement
export function measureLoadingPerformance(callback) {
  if (!('performance' in window)) return callback();

  const startMark = 'loading-start';
  const endMark = 'loading-end';
  const measureName = 'total-loading-time';

  performance.mark(startMark);

  const result = callback();

  // Mesurer après un petit délai pour s'assurer que tout est chargé
  setTimeout(() => {
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);

    const measure = performance.getEntriesByName(measureName)[0];
    if (measure) {
      console.log(`Loading performance: ${measure.duration.toFixed(2)}ms`);
    }
  }, 100);

  return result;
}
