// Les Scoops du Jour - AMP Generator
// Générateur automatique de pages AMP à partir des articles HTML

export class AMPGenerator {
  constructor(options = {}) {
    this.siteConfig = {
      name: 'Les Scoops du Jour',
      url: 'https://lesscoopsdujour.com',
      ampUrl: 'https://lesscoopsdujour.com/amp',
      ...options
    };

    this.templateCache = new Map();
    this.generatedPages = new Map();
  }

  // Générer une page AMP à partir d'un article
  async generateAMPPage(articleData, options = {}) {
    const {
      includeRelated = true,
      includeNewsletter = true,
      includeAnalytics = true
    } = options;

    // Charger le template AMP
    const template = await this.loadAMPtemplate();

    // Préparer les données de l'article
    const ampData = this.prepareAMPData(articleData);

    // Ajouter les articles similaires si demandé
    if (includeRelated) {
      ampData.relatedArticles = await this.getRelatedArticles(articleData.id, 3);
    }

    // Générer le HTML AMP
    const ampHtml = this.renderAMP(template, ampData, {
      includeNewsletter,
      includeAnalytics
    });

    // Valider le HTML AMP
    const validationResult = await this.validateAMP(ampHtml);

    if (!validationResult.valid) {
      console.warn('AMP validation warnings:', validationResult.warnings);
    }

    // Cacher la page générée
    this.generatedPages.set(articleData.id, {
      html: ampHtml,
      data: ampData,
      generatedAt: new Date(),
      validation: validationResult
    });

    return {
      html: ampHtml,
      url: `${this.siteConfig.ampUrl}/article/${articleData.id}`,
      canonicalUrl: `${this.siteConfig.url}/article.html?id=${articleData.id}`,
      validation: validationResult
    };
  }

  // Charger le template AMP
  async loadAMPtemplate() {
    if (this.templateCache.has('article')) {
      return this.templateCache.get('article');
    }

    try {
      // En production, charger depuis un fichier
      // Pour la démo, utiliser le template inline
      const template = this.getDefaultAMPtemplate();
      this.templateCache.set('article', template);
      return template;
    } catch (error) {
      console.error('Failed to load AMP template:', error);
      throw error;
    }
  }

  // Préparer les données pour le template AMP
  prepareAMPData(articleData) {
    return {
      article: {
        id: articleData.id,
        title: this.optimizeAMPTitle(articleData.title),
        excerpt: this.optimizeAMPDescription(articleData.description || articleData.excerpt),
        content: this.convertHTMLtoAMP(articleData.content),
        author: articleData.author,
        authorAvatar: articleData.authorAvatar || '/images/authors/default.jpg',
        category: articleData.category,
        tags: Array.isArray(articleData.tags) ? articleData.tags : (articleData.tags ? articleData.tags.split(',') : []),
        image: this.optimizeAMPImage(articleData.image),
        imageCaption: articleData.imageCaption || '',
        publishedAt: articleData.publishedAt,
        updatedAt: articleData.updatedAt || articleData.publishedAt,
        views: articleData.views || 0,
        likes: articleData.likes || 0,
        canonicalUrl: `${this.siteConfig.url}/article.html?id=${articleData.id}`
      }
    };
  }

  // Optimiser le titre pour AMP
  optimizeAMPTitle(title) {
    // AMP recommande des titres courts pour le mobile
    if (title.length > 50) {
      return title.substring(0, 47) + '...';
    }
    return title;
  }

  // Optimiser la description pour AMP
  optimizeAMPDescription(description) {
    if (!description) return '';

    // Limiter la longueur pour les extraits AMP
    if (description.length > 150) {
      return description.substring(0, 147) + '...';
    }
    return description;
  }

  // Convertir le HTML en AMP
  convertHTMLtoAMP(htmlContent) {
    if (!htmlContent) return '';

    let ampContent = htmlContent;

    // Convertir les images régulières en amp-img
    ampContent = ampContent.replace(
      /<img([^>]+)src="([^"]+)"([^>]*)>/gi,
      (match, beforeSrc, src, afterSrc) => {
        const optimizedSrc = this.optimizeAMPImage(src);
        return `<amp-img src="${optimizedSrc}" layout="responsive" width="800" height="450"${beforeSrc}${afterSrc}></amp-img>`;
      }
    );

    // Convertir les iframes en amp-iframe
    ampContent = ampContent.replace(
      /<iframe([^>]+)src="([^"]+)"([^>]*)><\/iframe>/gi,
      (match, beforeSrc, src, afterSrc) => {
        return `<amp-iframe src="${src}" layout="responsive" width="800" height="450" sandbox="allow-scripts allow-same-origin"${beforeSrc}${afterSrc}></amp-iframe>`;
      }
    );

    // Supprimer les éléments non supportés par AMP
    ampContent = ampContent.replace(/<script[^>]*>.*?<\/script>/gis, '');
    ampContent = ampContent.replace(/<style[^>]*>.*?<\/style>/gis, '');
    ampContent = ampContent.replace(/<form[^>]*>.*?<\/form>/gis, '');

    // Convertir les liens externes pour qu'ils s'ouvrent dans une nouvelle fenêtre
    ampContent = ampContent.replace(
      /<a([^>]+)href="((?:https?:\/\/|\/\/)[^"]+)"([^>]*)>/gi,
      (match, beforeHref, href, afterHref) => {
        return `<a${beforeHref}href="${href}"${afterHref} target="_blank" rel="noopener">`;
      }
    );

    return ampContent;
  }

  // Optimiser les images pour AMP
  optimizeAMPImage(imageUrl) {
    if (!imageUrl) return '/images/placeholder.jpg';

    // Ajouter des paramètres d'optimisation si nécessaire
    if (imageUrl.includes('via.placeholder.com')) {
      return imageUrl; // Garder tel quel pour les placeholders
    }

    // En production, utiliser un service d'optimisation d'images
    return imageUrl;
  }

  // Rendre le template AMP avec les données
  renderAMP(template, data, options = {}) {
    let html = template;

    // Remplacer les variables simples
    Object.entries(data.article).forEach(([key, value]) => {
      const regex = new RegExp(`{{article\\.${key}}}`, 'g');
      html = html.replace(regex, this.escapeHTML(value));
    });

    // Remplacer les variables d'options
    if (options.includeNewsletter) {
      // Garder la section newsletter
    } else {
      html = html.replace(/<section class="newsletter-section">[\s\S]*?<\/section>/g, '');
    }

    if (options.includeAnalytics) {
      // Garder les analytics
    } else {
      html = html.replace(/<amp-analytics[\s\S]*?<\/amp-analytics>/g, '');
    }

    // Rendre les articles similaires
    if (data.relatedArticles && data.relatedArticles.length > 0) {
      const relatedHtml = data.relatedArticles.map(article => `
        <a href="/amp/article/${article.id}" class="related-card">
          <amp-img src="${this.optimizeAMPImage(article.image)}" width="250" height="150" layout="responsive" class="related-image" alt="${this.escapeHTML(article.title)}"></amp-img>
          <div class="related-content">
            <h3 class="related-card-title">${this.escapeHTML(article.title)}</h3>
            <div class="related-meta">${this.escapeHTML(article.category)} • <amp-timeago datetime="${article.publishedAt}" layout="text">il y a quelques instants</amp-timeago></div>
          </div>
        </a>
      `).join('');

      html = html.replace(/{{#each relatedArticles}}[\s\S]*?{{\/each}}/g, relatedHtml);
    } else {
      html = html.replace(/<section class="related-articles">[\s\S]*?<\/section>/g, '');
    }

    return html;
  }

  // Échapper le HTML
  escapeHTML(text) {
    if (typeof text !== 'string') return text;

    const htmlEscapes = {
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    return text.replace(/[&<>"'/]/g, char => htmlEscapes[char]);
  }

  // Valider le HTML AMP
  async validateAMP(html) {
    try {
      // En production, utiliser l'API de validation AMP
      // https://amp.dev/documentation/guides-and-tutorials/learn/validation-workflow/validate_amp/

      const issues = [];

      // Vérifications de base
      if (!html.includes('<!doctype html>')) {
        issues.push('Missing DOCTYPE declaration');
      }

      if (!html.includes('<html ⚡')) {
        issues.push('Missing AMP HTML declaration');
      }

      if (!html.includes('https://cdn.ampproject.org/v0.js')) {
        issues.push('Missing AMP runtime script');
      }

      // Vérifier les composants AMP utilisés
      const ampComponents = html.match(/<amp-[a-z-]+/g) || [];
      const declaredComponents = html.match(/custom-element="amp-[a-z-]+"/g) || [];

      // Vérifications CSS
      const cssMatch = html.match(/<style amp-custom>([\s\S]*?)<\/style>/);
      if (cssMatch && cssMatch[1].length > 75000) {
        issues.push('AMP CSS exceeds 75KB limit');
      }

      return {
        valid: issues.length === 0,
        warnings: issues,
        components: ampComponents.length,
        cssSize: cssMatch ? cssMatch[1].length : 0
      };

    } catch (error) {
      console.error('AMP validation failed:', error);
      return {
        valid: false,
        warnings: ['Validation failed'],
        error: error.message
      };
    }
  }

  // Obtenir les articles similaires
  async getRelatedArticles(articleId, limit = 3) {
    try {
      // En production, faire un appel API
      // Pour la démo, retourner des articles mockés
      const mockArticles = [
        {
          id: 2,
          title: 'Économie béninoise : Croissance de 6,8% au premier trimestre',
          category: 'Économie',
          image: '/images/articles/economie.jpg',
          publishedAt: '2025-01-14T15:30:00Z'
        },
        {
          id: 3,
          title: 'Festival international d\'Ouidah : Plus de 50 000 visiteurs attendus',
          category: 'Culture',
          image: '/images/articles/culture.jpg',
          publishedAt: '2025-01-13T11:15:00Z'
        },
        {
          id: 4,
          title: 'Équipe nationale : Victoire historique contre le Maroc en CAN',
          category: 'Sport',
          image: '/images/articles/sport.jpg',
          publishedAt: '2025-01-12T09:45:00Z'
        }
      ];

      return mockArticles.slice(0, limit);
    } catch (error) {
      console.error('Failed to get related articles:', error);
      return [];
    }
  }

  // Générer un sitemap AMP
  async generateAMPSitemap() {
    const articles = await this.getAllArticles();

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${articles.map(article => `  <url>
    <loc>${this.siteConfig.ampUrl}/article/${article.id}</loc>
    <lastmod>${article.updatedAt || article.publishedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    return sitemapXml;
  }

  // Obtenir tous les articles (simulation)
  async getAllArticles() {
    // En production, récupérer depuis l'API
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      publishedAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
      updatedAt: new Date(Date.now() - (i * 12 * 60 * 60 * 1000)).toISOString()
    }));
  }

  // Template AMP par défaut
  getDefaultAMPtemplate() {
    return `<!doctype html>
<html ⚡ lang="fr">
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-img" src="https://cdn.ampproject.org/v0/amp-img-0.1.js"></script>
  <script async custom-element="amp-social-share" src="https://cdn.ampproject.org/v0/amp-social-share-0.1.js"></script>
  <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>
  <script async custom-element="amp-sidebar" src="https://cdn.ampproject.org/v0/amp-sidebar-0.1.js"></script>
  <script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>
  <script async custom-element="amp-timeago" src="https://cdn.ampproject.org/v0/amp-timeago-0.1.js"></script>

  <title>{{article.title}} - Les Scoops du Jour</title>
  <link rel="canonical" href="{{article.canonicalUrl}}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">

  <meta name="description" content="{{article.excerpt}}">
  <meta name="keywords" content="{{article.tags}}">
  <meta name="author" content="{{article.author}}">

  <meta property="og:title" content="{{article.title}}">
  <meta property="og:description" content="{{article.excerpt}}">
  <meta property="og:image" content="{{article.image}}">
  <meta property="og:url" content="{{article.canonicalUrl}}">
  <meta property="og:type" content="article">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{{article.title}}">
  <meta name="twitter:description" content="{{article.excerpt}}">
  <meta name="twitter:image" content="{{article.image}}">

  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>

  <style amp-custom>
    :root { --primary-color: #FE0202; --text-primary: #333; }
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: var(--text-primary); }
    .amp-header { background: var(--primary-color); color: white; padding: 1rem; }
    .article-container { max-width: 800px; margin: 0 auto; padding: 1rem; }
    .article-title { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; }
    .article-content { font-size: 1.125rem; line-height: 1.8; }
    .article-content h2 { font-size: 1.5rem; font-weight: 600; margin: 2rem 0 1rem 0; }
    .article-content p { margin-bottom: 1.5rem; }
  </style>
</head>
<body>
  <header class="amp-header">
    <a href="/" class="amp-logo">Les Scoops du Jour</a>
  </header>

  <main class="article-container">
    <h1 class="article-title">{{article.title}}</h1>
    <div class="article-content">{{{article.content}}}</div>

    <div class="article-share">
      <amp-social-share type="facebook" data-param-url="{{article.canonicalUrl}}"></amp-social-share>
      <amp-social-share type="twitter" data-param-url="{{article.canonicalUrl}}"></amp-social-share>
    </div>
  </main>

  <amp-analytics type="googleanalytics">
    <script type="application/json">{"vars": {"account": "UA-XXXXX-Y"}, "triggers": {"trackPageview": {"on": "visible", "request": "pageview"}}}</script>
  </amp-analytics>
</body>
</html>`;
  }

  // Obtenir les statistiques de génération AMP
  getStats() {
    return {
      generatedPages: this.generatedPages.size,
      cachedTemplates: this.templateCache.size,
      lastGeneration: Array.from(this.generatedPages.values()).pop()?.generatedAt
    };
  }

  // Nettoyer le cache
  clearCache() {
    this.templateCache.clear();
    this.generatedPages.clear();
  }
}

// Fonction pour initialiser le générateur AMP
export function initAMPGenerator(options = {}) {
  const ampGenerator = new AMPGenerator(options);

  // Exposer globalement
  window.ampGenerator = ampGenerator;

  return ampGenerator;
}

// Fonction utilitaire pour générer une page AMP
export async function generateAMPPage(articleData, options = {}) {
  if (!window.ampGenerator) {
    initAMPGenerator();
  }

  return window.ampGenerator.generateAMPPage(articleData, options);
}

// Hook pour générer automatiquement les pages AMP
export function setupAutoAMPGeneration() {
  // Écouter les nouveaux articles et générer automatiquement leur version AMP
  if (window.articlePublisher) {
    window.articlePublisher.onArticlePublished = async (article) => {
      try {
        const ampPage = await generateAMPPage(article);
        console.log('AMP page generated:', ampPage.url);

        // En production, sauvegarder la page AMP sur le serveur
        // await saveAMPPage(ampPage);

      } catch (error) {
        console.error('Failed to generate AMP page:', error);
      }
    };
  }
}

// Fonction pour vérifier si une URL est une page AMP
export function isAMPUrl(url) {
  return url.includes('/amp/') || url.includes('?amp=1');
}

// Fonction pour obtenir l'URL AMP équivalente
export function getAMPUrl(canonicalUrl) {
  if (isAMPUrl(canonicalUrl)) return canonicalUrl;

  // Convertir l'URL canonique en URL AMP
  return canonicalUrl.replace('/article.html', '/amp/article.html');
}

// Fonction pour obtenir l'URL canonique depuis une URL AMP
export function getCanonicalUrl(ampUrl) {
  if (!isAMPUrl(ampUrl)) return ampUrl;

  // Convertir l'URL AMP en URL canonique
  return ampUrl.replace('/amp/article.html', '/article.html');
}
