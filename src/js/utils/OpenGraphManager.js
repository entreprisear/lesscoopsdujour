// Les Scoops du Jour - Open Graph Manager
// Gestion optimisée des métadonnées Open Graph et Twitter Cards

export class OpenGraphManager {
  constructor(seoManager) {
    this.seoManager = seoManager;
    this.defaultMeta = {
      siteName: 'Les Scoops du Jour',
      locale: 'fr_FR',
      type: 'website',
      image: `${window.location.origin}/images/og-default.jpg`,
      imageWidth: 1200,
      imageHeight: 630,
      twitterSite: '@LesScoopsDuJour',
      twitterCreator: '@LesScoopsDuJour'
    };

    this.init();
  }

  init() {
    console.log('🔍 Open Graph Manager initialized');
  }

  // ===== GÉNÉRATION DES MÉTADONNÉES =====

  generateOpenGraphMeta(article, options = {}) {
    const meta = {
      // Basic Open Graph
      'og:title': this.getOptimizedTitle(article),
      'og:description': this.getOptimizedDescription(article),
      'og:image': this.getOptimizedImage(article),
      'og:image:width': this.defaultMeta.imageWidth,
      'og:image:height': this.defaultMeta.imageHeight,
      'og:url': this.getCanonicalUrl(article),
      'og:type': this.getContentType(article),
      'og:site_name': this.defaultMeta.siteName,
      'og:locale': this.defaultMeta.locale,

      // Article specific (if applicable)
      ...(article.category && {
        'article:author': article.author,
        'article:section': this.getCategoryName(article.category),
        'article:published_time': article.publishedAt,
        'article:modified_time': article.updatedAt,
        'article:tag': article.tags?.join(', ')
      }),

      // Twitter Cards
      'twitter:card': 'summary_large_image',
      'twitter:site': this.defaultMeta.twitterSite,
      'twitter:creator': this.defaultMeta.twitterCreator,
      'twitter:title': this.getOptimizedTitle(article, 70),
      'twitter:description': this.getOptimizedDescription(article, 200),
      'twitter:image': this.getOptimizedImage(article),
      'twitter:url': this.getCanonicalUrl(article),

      // Additional metadata
      'author': article.author,
      'publisher': this.defaultMeta.siteName,
      'robots': 'index, follow',
      'googlebot': 'index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1',

      ...options
    };

    return meta;
  }

  // ===== OPTIMISATION DU CONTENU =====

  getOptimizedTitle(article, maxLength = 60) {
    let title = article.title;

    // Ajouter le nom du site si nécessaire
    if (!title.includes(this.defaultMeta.siteName) && title.length < maxLength - 10) {
      title = `${title} - ${this.defaultMeta.siteName}`;
    }

    // Tronquer si trop long
    if (title.length > maxLength) {
      title = title.substring(0, maxLength - 3) + '...';
    }

    return title;
  }

  getOptimizedDescription(article, maxLength = 160) {
    let description = article.excerpt || article.description || '';

    // Nettoyer le HTML
    description = this.stripHtml(description);

    // Tronquer si trop long
    if (description.length > maxLength) {
      description = description.substring(0, maxLength - 3) + '...';
    }

    return description;
  }

  getOptimizedImage(article) {
    const image = article.image || article.urlToImage;

    if (!image) {
      return this.defaultMeta.image;
    }

    // S'assurer que l'URL est absolue
    if (image.startsWith('http')) {
      return image;
    } else {
      return `${window.location.origin}${image}`;
    }
  }

  getCanonicalUrl(article) {
    if (article.canonicalUrl) {
      return article.canonicalUrl;
    }

    const baseUrl = window.location.origin;
    const slug = this.slugify(article.title);
    return `${baseUrl}/article/${article.id}/${slug}`;
  }

  getContentType(article) {
    // Déterminer le type de contenu Open Graph
    if (article.type === 'video') {
      return 'video.other';
    } else if (article.type === 'article' || article.category) {
      return 'article';
    } else {
      return 'website';
    }
  }

  getCategoryName(categoryId) {
    const categories = {
      politique: 'Politique',
      economie: 'Économie',
      sport: 'Sport',
      culture: 'Culture',
      tech: 'Technologie'
    };

    return categories[categoryId] || categoryId;
  }

  // ===== MISE À JOUR DU DOM =====

  updateMetaTags(article, options = {}) {
    const meta = this.generateOpenGraphMeta(article, options);

    // Mettre à jour le titre de la page
    document.title = meta['og:title'];

    // Mettre à jour la description
    this.updateMetaTag('description', meta['og:description']);

    // Supprimer les anciennes balises Open Graph
    this.removeExistingMetaTags();

    // Ajouter les nouvelles balises
    Object.entries(meta).forEach(([property, content]) => {
      if (property.startsWith('og:')) {
        this.addMetaTag('property', property, content);
      } else if (property.startsWith('twitter:')) {
        this.addMetaTag('name', property, content);
      } else if (property.startsWith('article:')) {
        this.addMetaTag('property', property, content);
      } else {
        this.updateMetaTag(property, content);
      }
    });

    // Ajouter les balises Link pour les images
    this.addImageLinks(meta);

    console.log('🔍 Open Graph meta tags updated for article:', article.title);
  }

  updateMetaTag(name, content) {
    let metaTag = document.querySelector(`meta[name="${name}"]`);

    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', name);
      document.head.appendChild(metaTag);
    }

    metaTag.setAttribute('content', content);
  }

  addMetaTag(attribute, value, content) {
    const metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, value);
    metaTag.setAttribute('content', content);
    document.head.appendChild(metaTag);
  }

  removeExistingMetaTags() {
    // Supprimer les anciennes balises Open Graph et Twitter
    const selectors = [
      'meta[property^="og:"]',
      'meta[name^="twitter:"]',
      'meta[property^="article:"]'
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(tag => tag.remove());
    });
  }

  addImageLinks(meta) {
    // Ajouter les dimensions de l'image pour une meilleure optimisation
    const imageMeta = document.createElement('link');
    imageMeta.rel = 'image_src';
    imageMeta.href = meta['og:image'];
    document.head.appendChild(imageMeta);
  }

  // ===== VALIDATION ET OPTIMISATION =====

  validateMetaTags(meta) {
    const issues = [];

    // Vérifications de base
    if (!meta['og:title'] || meta['og:title'].length < 10) {
      issues.push('Titre Open Graph trop court ou manquant');
    }

    if (!meta['og:description'] || meta['og:description'].length < 50) {
      issues.push('Description Open Graph trop courte ou manquante');
    }

    if (!meta['og:image']) {
      issues.push('Image Open Graph manquante');
    }

    if (!meta['og:url']) {
      issues.push('URL canonique manquante');
    }

    // Vérifications de longueur
    if (meta['og:title'] && meta['og:title'].length > 95) {
      issues.push('Titre Open Graph trop long (recommandé: 60 caractères)');
    }

    if (meta['og:description'] && meta['og:description'].length > 200) {
      issues.push('Description Open Graph trop longue (recommandé: 160 caractères)');
    }

    return issues;
  }

  optimizeForPlatform(platform, meta) {
    // Optimisations spécifiques par plateforme
    const optimized = { ...meta };

    switch (platform) {
      case 'facebook':
        // Facebook privilégie les images carrées pour les posts
        optimized['og:image:width'] = 1200;
        optimized['og:image:height'] = 630;
        break;

      case 'twitter':
        // Twitter utilise summary_large_image
        optimized['twitter:card'] = 'summary_large_image';
        break;

      case 'linkedin':
        // LinkedIn aime les descriptions détaillées
        if (optimized['og:description'].length < 100) {
          optimized['og:description'] += ' Découvrez l\'actualité complète sur Les Scoops du Jour.';
        }
        break;

      case 'whatsapp':
        // WhatsApp utilise le titre et la description
        optimized.title = optimized['og:title'];
        optimized.description = optimized['og:description'];
        break;
    }

    return optimized;
  }

  // ===== GÉNÉRATION DE PREVIEW =====

  async generatePreview(article, platform = 'facebook') {
    const meta = this.generateOpenGraphMeta(article);
    const optimized = this.optimizeForPlatform(platform, meta);

    // Simulation d'un preview (en production, utiliser une API comme OpenGraph.xyz)
    const preview = {
      title: optimized['og:title'],
      description: optimized['og:description'],
      image: optimized['og:image'],
      url: optimized['og:url'],
      siteName: optimized['og:site_name'],
      platform: platform,
      issues: this.validateMetaTags(optimized)
    };

    return preview;
  }

  // ===== OUTILS DE DEBUG =====

  getCurrentMetaTags() {
    const metaTags = {};

    // Récupérer toutes les balises meta pertinentes
    document.querySelectorAll('meta').forEach(tag => {
      const property = tag.getAttribute('property');
      const name = tag.getAttribute('name');
      const content = tag.getAttribute('content');

      if (property && content) {
        metaTags[property] = content;
      } else if (name && content) {
        metaTags[name] = content;
      }
    });

    return metaTags;
  }

  logMetaTags() {
    const meta = this.getCurrentMetaTags();
    console.group('🔍 Current Meta Tags');
    console.table(meta);
    console.groupEnd();

    const issues = this.validateMetaTags(meta);
    if (issues.length > 0) {
      console.group('⚠️ Meta Tag Issues');
      issues.forEach(issue => console.warn(issue));
      console.groupEnd();
    }
  }

  // ===== UTILITAIRES =====

  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // ===== INTÉGRATION AVEC LE SEO MANAGER =====

  updateForSEO(article) {
    // Mettre à jour les métadonnées SEO également
    if (this.seoManager) {
      this.seoManager.updateMetaTags({
        title: this.getOptimizedTitle(article),
        description: this.getOptimizedDescription(article),
        keywords: article.tags?.join(', '),
        canonical: this.getCanonicalUrl(article),
        image: this.getOptimizedImage(article)
      });
    }
  }

  // ===== MÉTHODES STATIQUES =====

  static createMetaTagsHTML(meta) {
    // Générer le HTML des balises meta pour inclusion dans les templates
    const tags = [];

    Object.entries(meta).forEach(([property, content]) => {
      if (property.startsWith('og:')) {
        tags.push(`<meta property="${property}" content="${content.replace(/"/g, '"')}">`);
      } else if (property.startsWith('twitter:')) {
        tags.push(`<meta name="${property}" content="${content.replace(/"/g, '"')}">`);
      } else if (property.startsWith('article:')) {
        tags.push(`<meta property="${property}" content="${content.replace(/"/g, '"')}">`);
      }
    });

    return tags.join('\n');
  }

  static generateDefaultMeta() {
    return {
      'og:site_name': 'Les Scoops du Jour',
      'og:locale': 'fr_FR',
      'og:type': 'website',
      'og:image': '/images/og-default.jpg',
      'og:image:width': '1200',
      'og:image:height': '630',
      'twitter:card': 'summary_large_image',
      'twitter:site': '@LesScoopsDuJour',
      'twitter:creator': '@LesScoopsDuJour'
    };
  }
}

// ===== FONCTIONS UTILITAIRES =====

// Initialiser le gestionnaire Open Graph
export function initOpenGraphManager(seoManager) {
  const ogManager = new OpenGraphManager(seoManager);

  // Exposer globalement
  window.openGraphManager = ogManager;

  return ogManager;
}

// Mettre à jour les métadonnées Open Graph pour un article
export function updateOpenGraphMeta(article, options = {}) {
  if (window.openGraphManager) {
    window.openGraphManager.updateMetaTags(article, options);
    window.openGraphManager.updateForSEO(article);
  }
}

// Générer un preview Open Graph
export function generateOpenGraphPreview(article, platform = 'facebook') {
  if (window.openGraphManager) {
    return window.openGraphManager.generatePreview(article, platform);
  }
  return null;
}

// Valider les métadonnées actuelles
export function validateCurrentMetaTags() {
  if (window.openGraphManager) {
    const meta = window.openGraphManager.getCurrentMetaTags();
    const issues = window.openGraphManager.validateMetaTags(meta);
    return { meta, issues };
  }
  return { meta: {}, issues: ['Open Graph Manager not initialized'] };
}

// Log les métadonnées actuelles (pour debug)
export function logCurrentMetaTags() {
  if (window.openGraphManager) {
    window.openGraphManager.logMetaTags();
  }
}

// Export de la classe pour utilisation avancée
export { OpenGraphManager };
