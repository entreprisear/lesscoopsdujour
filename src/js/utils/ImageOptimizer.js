// Les Scoops du Jour - Image Optimization System
// Système complet d'optimisation d'images avec WebP, responsive et cache

export class ImageOptimizer {
  constructor(options = {}) {
    this.webpSupport = null;
    this.cache = new Map();
    this.options = {
      quality: options.quality || 80,
      enableWebP: options.enableWebP !== false,
      enableResponsive: options.enableResponsive !== false,
      enableCompression: options.enableCompression !== false,
      cacheTimeout: options.cacheTimeout || 3600000, // 1 heure
      ...options
    };

    this.init();
  }

  async init() {
    this.webpSupport = await this.checkWebPSupport();
    this.setupCacheCleanup();
  }

  // Vérifier le support WebP
  async checkWebPSupport() {
    if (!this.options.enableWebP) return false;

    // Vérifier le cache
    if (this.cache.has('webp-support')) {
      return this.cache.get('webp-support');
    }

    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        const supported = webP.height === 2;
        this.cache.set('webp-support', supported);
        resolve(supported);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  // Optimiser une image
  async optimizeImage(src, options = {}) {
    const opts = {
      width: options.width,
      height: options.height,
      quality: options.quality || this.options.quality,
      format: options.format || 'auto',
      ...options
    };

    const cacheKey = this.generateCacheKey(src, opts);

    // Vérifier le cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const optimizedSrc = await this.processImage(src, opts);
      const result = {
        src: optimizedSrc,
        originalSrc: src,
        options: opts,
        webp: this.webpSupport && opts.format !== 'jpeg',
        responsive: opts.width ? this.generateResponsiveSources(optimizedSrc, opts) : null
      };

      // Mettre en cache
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.warn('Image optimization failed:', error);
      return { src, originalSrc: src, options: opts, error };
    }
  }

  // Traiter l'image
  async processImage(src, options) {
    // En production, ceci utiliserait un service d'optimisation d'images
    // Pour la démo, on simule l'optimisation

    let processedSrc = src;

    // Ajouter les paramètres d'optimisation
    const params = new URLSearchParams();

    if (options.width) params.set('w', options.width);
    if (options.height) params.set('h', options.height);
    if (options.quality) params.set('q', options.quality);

    // Format
    if (options.format === 'auto') {
      params.set('format', this.webpSupport ? 'webp' : 'jpeg');
    } else {
      params.set('format', options.format);
    }

    // Compression
    if (this.options.enableCompression) {
      params.set('compress', 'true');
    }

    if (params.toString()) {
      processedSrc += (src.includes('?') ? '&' : '?') + params.toString();
    }

    return processedSrc;
  }

  // Générer les sources responsives
  generateResponsiveSources(src, options) {
    if (!this.options.enableResponsive) return null;

    const sources = [];
    const breakpoints = [
      { width: 320, descriptor: '320w' },
      { width: 640, descriptor: '640w' },
      { width: 768, descriptor: '768w' },
      { width: 1024, descriptor: '1024w' },
      { width: 1280, descriptor: '1280w' },
      { width: 1920, descriptor: '1920w' }
    ];

    breakpoints.forEach(bp => {
      if (!options.width || bp.width <= options.width) {
        const responsiveSrc = this.generateResponsiveUrl(src, bp.width, options);
        sources.push(`${responsiveSrc} ${bp.descriptor}`);
      }
    });

    return sources.length > 0 ? sources.join(', ') : null;
  }

  // Générer l'URL responsive
  generateResponsiveUrl(src, width, options) {
    const baseUrl = src.split('?')[0];
    const params = new URLSearchParams(src.split('?')[1] || '');

    params.set('w', width);
    params.set('h', Math.round(width * (options.height / options.width || 0.75)));
    params.set('fit', 'cover');

    return `${baseUrl}?${params.toString()}`;
  }

  // Générer la clé de cache
  generateCacheKey(src, options) {
    const key = `${src}_${JSON.stringify(options)}_${this.webpSupport}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '');
  }

  // Nettoyer le cache périodiquement
  setupCacheCleanup() {
    setInterval(() => {
      // En production, implémenter une logique de nettoyage plus sophistiquée
      if (this.cache.size > 100) {
        // Garder seulement les 50 entrées les plus récentes
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));
        this.cache.clear();
        entries.slice(0, 50).forEach(([key, value]) => {
          this.cache.set(key, value);
        });
      }
    }, this.options.cacheTimeout);
  }

  // Précharger une image
  preloadImage(src, options = {}) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve({ src, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));

      this.optimizeImage(src, options).then(result => {
        img.src = result.src;
      }).catch(reject);
    });
  }

  // Précharger plusieurs images
  async preloadImages(sources, options = {}) {
    const promises = sources.map(src => this.preloadImage(src, options));
    return Promise.allSettled(promises);
  }

  // Obtenir les statistiques
  getStats() {
    return {
      webpSupport: this.webpSupport,
      cacheSize: this.cache.size,
      cacheEntries: Array.from(this.cache.keys())
    };
  }

  // Nettoyer le cache
  clearCache() {
    this.cache.clear();
  }
}

// Fonction pour créer une image optimisée
export function createOptimizedImageElement(src, alt, options = {}) {
  const {
    className = '',
    loading = 'lazy',
    sizes = '100vw',
    width,
    height,
    quality = 80,
    placeholder = true
  } = options;

  const img = document.createElement('img');
  img.alt = alt;
  img.loading = loading;
  img.className = className;

  if (sizes) img.sizes = sizes;

  // Créer l'optimiseur
  const optimizer = new ImageOptimizer();

  // Placeholder pendant le chargement
  if (placeholder) {
    const placeholderColor = getImagePlaceholderColor(src);
    img.style.backgroundColor = placeholderColor;
    img.classList.add('image-placeholder');
  }

  // Optimiser et charger l'image
  optimizer.optimizeImage(src, { width, height, quality }).then(result => {
    img.src = result.src;

    if (result.responsive) {
      img.srcset = result.responsive;
    }

    img.addEventListener('load', () => {
      img.classList.remove('image-placeholder');
      img.classList.add('loaded');
    });

    img.addEventListener('error', () => {
      console.warn(`Failed to load optimized image: ${result.src}`);
      img.classList.add('error');
      // Fallback vers l'image originale
      img.src = src;
    });
  }).catch(error => {
    console.warn('Image optimization failed, using original:', error);
    img.src = src;
  });

  return img;
}

// Générer une couleur de placeholder
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

// Système de cache avancé
export class CacheManager {
  constructor(options = {}) {
    this.storage = options.storage || localStorage;
    this.prefix = options.prefix || 'lscj_cache_';
    this.defaultTTL = options.ttl || 3600000; // 1 heure
    this.maxEntries = options.maxEntries || 100;
    this.compression = options.compression || false;

    this.init();
  }

  init() {
    this.cleanup();
  }

  // Stocker une valeur
  set(key, value, ttl = null) {
    const cacheKey = this.prefix + key;
    const expiry = Date.now() + (ttl || this.defaultTTL);

    const cacheEntry = {
      value: this.compression ? this.compress(value) : value,
      expiry,
      compressed: this.compression,
      timestamp: Date.now()
    };

    try {
      this.storage.setItem(cacheKey, JSON.stringify(cacheEntry));
      this.enforceMaxEntries();
    } catch (error) {
      console.warn('Cache storage failed:', error);
      this.cleanup(); // Essayer de libérer de l'espace
    }
  }

  // Récupérer une valeur
  get(key) {
    const cacheKey = this.prefix + key;

    try {
      const item = this.storage.getItem(cacheKey);
      if (!item) return null;

      const cacheEntry = JSON.parse(item);

      // Vérifier l'expiration
      if (Date.now() > cacheEntry.expiry) {
        this.delete(key);
        return null;
      }

      return cacheEntry.compressed ? this.decompress(cacheEntry.value) : cacheEntry.value;
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
      this.delete(key);
      return null;
    }
  }

  // Vérifier si une clé existe et n'est pas expirée
  has(key) {
    const cacheKey = this.prefix + key;

    try {
      const item = this.storage.getItem(cacheKey);
      if (!item) return false;

      const cacheEntry = JSON.parse(item);
      return Date.now() <= cacheEntry.expiry;
    } catch (error) {
      return false;
    }
  }

  // Supprimer une entrée
  delete(key) {
    const cacheKey = this.prefix + key;
    this.storage.removeItem(cacheKey);
  }

  // Vider tout le cache
  clear() {
    const keys = Object.keys(this.storage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        this.storage.removeItem(key);
      }
    });
  }

  // Nettoyer les entrées expirées
  cleanup() {
    const keys = Object.keys(this.storage);
    const now = Date.now();

    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const item = this.storage.getItem(key);
          const cacheEntry = JSON.parse(item);

          if (now > cacheEntry.expiry) {
            this.storage.removeItem(key);
          }
        } catch (error) {
          // Supprimer les entrées corrompues
          this.storage.removeItem(key);
        }
      }
    });
  }

  // Appliquer la limite maximale d'entrées
  enforceMaxEntries() {
    const keys = Object.keys(this.storage)
      .filter(key => key.startsWith(this.prefix));

    if (keys.length > this.maxEntries) {
      // Trier par timestamp et supprimer les plus anciennes
      const entries = keys.map(key => {
        try {
          const item = this.storage.getItem(key);
          const cacheEntry = JSON.parse(item);
          return { key, timestamp: cacheEntry.timestamp || 0 };
        } catch (error) {
          return { key, timestamp: 0 };
        }
      });

      entries.sort((a, b) => a.timestamp - b.timestamp);

      // Supprimer les entrées les plus anciennes
      const toDelete = entries.slice(0, keys.length - this.maxEntries);
      toDelete.forEach(entry => {
        this.storage.removeItem(entry.key);
      });
    }
  }

  // Compression (simple pour la démo)
  compress(data) {
    // En production, utiliser une vraie compression
    return btoa(JSON.stringify(data));
  }

  decompress(data) {
    // En production, utiliser une vraie décompression
    return JSON.parse(atob(data));
  }

  // Statistiques du cache
  getStats() {
    const keys = Object.keys(this.storage)
      .filter(key => key.startsWith(this.prefix));

    let totalSize = 0;
    let expiredCount = 0;
    const now = Date.now();

    keys.forEach(key => {
      try {
        const item = this.storage.getItem(key);
        totalSize += item.length;

        const cacheEntry = JSON.parse(item);
        if (now > cacheEntry.expiry) {
          expiredCount++;
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    });

    return {
      entries: keys.length,
      expiredEntries: expiredCount,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      averageSize: keys.length > 0 ? `${(totalSize / keys.length / 1024).toFixed(2)} KB` : '0 KB'
    };
  }
}

// Initialiser le système d'optimisation d'images global
export function initImageOptimization() {
  const imageOptimizer = new ImageOptimizer({
    enableWebP: true,
    enableResponsive: true,
    enableCompression: true,
    quality: 80
  });

  // Optimiser automatiquement toutes les images avec data-optimize
  const images = document.querySelectorAll('img[data-optimize]');
  images.forEach(img => {
    const src = img.getAttribute('data-src') || img.src;
    const options = {
      width: parseInt(img.getAttribute('data-width')) || null,
      height: parseInt(img.getAttribute('data-height')) || null,
      quality: parseInt(img.getAttribute('data-quality')) || 80
    };

    imageOptimizer.optimizeImage(src, options).then(result => {
      img.src = result.src;
      if (result.responsive) {
        img.srcset = result.responsive;
      }
    });
  });

  // Exposer globalement
  window.imageOptimizer = imageOptimizer;

  return imageOptimizer;
}

// Initialiser le cache manager
export function initCacheManager() {
  const cacheManager = new CacheManager({
    prefix: 'lscj_',
    ttl: 3600000, // 1 heure
    maxEntries: 100,
    compression: false // Désactiver pour la simplicité
  });

  // Exposer globalement
  window.cacheManager = cacheManager;

  return cacheManager;
}

// Fonction pour mesurer les performances d'image
export function measureImagePerformance(img) {
  if (!('performance' in window)) return;

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.name.includes(img.src)) {
        console.log(`Image performance: ${entry.name}`);
        console.log(`Load time: ${entry.responseEnd - entry.requestStart}ms`);
        console.log(`Size: ${entry.transferSize} bytes`);
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });

  // Cleanup après 10 secondes
  setTimeout(() => observer.disconnect(), 10000);
}
