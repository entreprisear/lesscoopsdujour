// Les Scoops du Jour - SEO Manager
// Système complet de gestion SEO avec meta tags dynamiques et structured data

export class SEOManager {
  constructor(options = {}) {
    this.siteConfig = {
      name: 'Les Scoops du Jour',
      url: 'https://lesscoopsdujour.com',
      description: 'Toute l\'actualité du Bénin en temps réel. News, politique, économie, sport, culture.',
      keywords: 'actualités bénin, news, politique, économie, sport, culture, Cotonou, Porto-Novo',
      author: 'Les Scoops du Jour',
      language: 'fr',
      locale: 'fr_BJ',
      twitterHandle: '@scoopsbenin',
      ...options
    };

    this.defaultMeta = {
      title: `${this.siteConfig.name} - Actualités du Bénin`,
      description: this.siteConfig.description,
      keywords: this.siteConfig.keywords,
      author: this.siteConfig.author,
      robots: 'index, follow',
      googlebot: 'index, follow',
      viewport: 'width=device-width, initial-scale=1.0',
      charset: 'UTF-8'
    };

    this.init();
  }

  init() {
    // Définir les meta tags par défaut
    this.setDefaultMeta();

    // Écouter les changements de page pour mettre à jour le SEO
    this.setupPageChangeListener();

    console.log('🔍 SEO Manager initialized');
  }

  // Définir les meta tags par défaut
  setDefaultMeta() {
    this.updateMetaTags(this.defaultMeta);
    this.updateOpenGraph(this.getDefaultOpenGraph());
    this.updateTwitterCards(this.getDefaultTwitterCards());
    this.updateCanonicalUrl(window.location.href);
  }

  // Mettre à jour les meta tags de la page
  updatePageMeta(pageData) {
    const meta = {
      title: pageData.title || this.defaultMeta.title,
      description: pageData.description || this.defaultMeta.description,
      keywords: pageData.keywords || this.defaultMeta.keywords,
      author: pageData.author || this.defaultMeta.author,
      image: pageData.image,
      url: pageData.url || window.location.href,
      type: pageData.type || 'website',
      publishedTime: pageData.publishedTime,
      modifiedTime: pageData.modifiedTime,
      section: pageData.section,
      tags: pageData.tags
    };

    // Mettre à jour le titre de la page
    document.title = this.optimizeTitle(meta.title);

    // Mettre à jour les meta tags
    this.updateMetaTags(meta);

    // Mettre à jour Open Graph
    this.updateOpenGraph(this.generateOpenGraph(meta));

    // Mettre à jour Twitter Cards
    this.updateTwitterCards(this.generateTwitterCards(meta));

    // Mettre à jour l'URL canonique
    this.updateCanonicalUrl(meta.url);

    // Générer et injecter le structured data
    if (pageData.structuredData) {
      this.injectStructuredData(pageData.structuredData);
    } else {
      this.injectStructuredData(this.generateStructuredData(meta));
    }

    console.log('📄 Page meta updated:', meta.title);
  }

  // Optimiser le titre pour le SEO
  optimizeTitle(title) {
    // Limiter la longueur du titre (50-60 caractères recommandé)
    if (title.length > 60) {
      return title.substring(0, 57) + '...';
    }

    // Ajouter le nom du site si pas déjà présent
    if (!title.includes(this.siteConfig.name)) {
      return `${title} | ${this.siteConfig.name}`;
    }

    return title;
  }

  // Mettre à jour les meta tags standards
  updateMetaTags(meta) {
    // Description
    this.updateMetaTag('description', meta.description);

    // Keywords
    this.updateMetaTag('keywords', meta.keywords);

    // Author
    this.updateMetaTag('author', meta.author);

    // Robots
    this.updateMetaTag('robots', meta.robots || 'index, follow');

    // Article specific meta
    if (meta.publishedTime) {
      this.updateMetaTag('article:published_time', meta.publishedTime);
    }
    if (meta.modifiedTime) {
      this.updateMetaTag('article:modified_time', meta.modifiedTime);
    }
    if (meta.section) {
      this.updateMetaTag('article:section', meta.section);
    }
    if (meta.tags) {
      this.updateMetaTag('article:tag', meta.tags.join(', '));
    }
  }

  // Mettre à jour un meta tag spécifique
  updateMetaTag(name, content) {
    if (!content) return;

    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  // Générer les données Open Graph
  generateOpenGraph(meta) {
    return {
      'og:title': meta.title,
      'og:description': meta.description,
      'og:image': meta.image || `${this.siteConfig.url}/images/og-default.jpg`,
      'og:url': meta.url,
      'og:type': meta.type,
      'og:site_name': this.siteConfig.name,
      'og:locale': this.siteConfig.locale,
      'article:author': meta.author,
      'article:published_time': meta.publishedTime,
      'article:modified_time': meta.modifiedTime,
      'article:section': meta.section,
      'article:tag': meta.tags ? meta.tags.join(', ') : null
    };
  }

  // Mettre à jour les balises Open Graph
  updateOpenGraph(ogData) {
    Object.entries(ogData).forEach(([property, content]) => {
      if (!content) return;

      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    });
  }

  // Générer les Twitter Cards
  generateTwitterCards(meta) {
    return {
      'twitter:card': 'summary_large_image',
      'twitter:site': this.siteConfig.twitterHandle,
      'twitter:title': meta.title,
      'twitter:description': meta.description,
      'twitter:image': meta.image || `${this.siteConfig.url}/images/twitter-default.jpg`,
      'twitter:url': meta.url
    };
  }

  // Mettre à jour les Twitter Cards
  updateTwitterCards(twitterData) {
    Object.entries(twitterData).forEach(([name, content]) => {
      if (!content) return;

      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    });
  }

  // Mettre à jour l'URL canonique
  updateCanonicalUrl(url) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }

  // Générer le structured data Schema.org
  generateStructuredData(meta) {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.siteConfig.name,
      url: this.siteConfig.url,
      description: this.siteConfig.description,
      publisher: {
        '@type': 'Organization',
        name: this.siteConfig.name,
        logo: {
          '@type': 'ImageObject',
          url: `${this.siteConfig.url}/images/logo-512.svg`
        }
      }
    };

    // Ajouter des données spécifiques selon le type de page
    if (meta.type === 'article') {
      return {
        ...baseData,
        '@type': 'NewsArticle',
        headline: meta.title,
        description: meta.description,
        image: meta.image,
        datePublished: meta.publishedTime,
        dateModified: meta.modifiedTime,
        author: {
          '@type': 'Person',
          name: meta.author
        },
        publisher: baseData.publisher,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': meta.url
        },
        articleSection: meta.section,
        keywords: meta.tags ? meta.tags.join(', ') : meta.keywords
      };
    }

    return baseData;
  }

  // Injecter le structured data JSON-LD
  injectStructuredData(data) {
    // Supprimer l'ancien structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Créer le nouveau script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data, null, 2);

    // L'ajouter au head
    document.head.appendChild(script);
  }

  // Générer les breadcrumbs Schema.org
  generateBreadcrumbs(breadcrumbs) {
    const breadcrumbData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url
      }))
    };

    return breadcrumbData;
  }

  // Mettre à jour les breadcrumbs
  updateBreadcrumbs(breadcrumbs) {
    const breadcrumbData = this.generateBreadcrumbs(breadcrumbs);
    this.injectStructuredData(breadcrumbData);
  }

  // Écouter les changements de page
  setupPageChangeListener() {
    // Écouter les changements d'URL (pour SPA)
    let currentUrl = window.location.href;

    const checkUrlChange = () => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        // La page a changé, mettre à jour le SEO si nécessaire
        this.handlePageChange();
      }
    };

    // Vérifier périodiquement les changements d'URL
    setInterval(checkUrlChange, 1000);

    // Écouter les événements de navigation
    window.addEventListener('popstate', () => {
      setTimeout(() => this.handlePageChange(), 100);
    });
  }

  // Gérer le changement de page
  handlePageChange() {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    // Déterminer le type de page et mettre à jour le SEO en conséquence
    if (path.includes('/article')) {
      const articleId = searchParams.get('id');
      if (articleId) {
        this.updateArticleSEO(articleId);
      }
    } else if (path.includes('/category')) {
      const category = searchParams.get('category');
      if (category) {
        this.updateCategorySEO(category);
      }
    } else if (path.includes('/search')) {
      const query = searchParams.get('q');
      if (query) {
        this.updateSearchSEO(query);
      }
    } else {
      // Page d'accueil
      this.setDefaultMeta();
    }
  }

  // Mettre à jour le SEO pour un article
  async updateArticleSEO(articleId) {
    try {
      // Simuler la récupération des données d'article
      const articleData = await this.fetchArticleData(articleId);

      const pageData = {
        title: articleData.title,
        description: articleData.excerpt || articleData.description,
        keywords: articleData.tags ? articleData.tags.join(', ') : articleData.category,
        author: articleData.author,
        image: articleData.image,
        url: window.location.href,
        type: 'article',
        publishedTime: articleData.publishedAt,
        modifiedTime: articleData.updatedAt,
        section: articleData.category,
        tags: articleData.tags,
        structuredData: this.generateArticleStructuredData(articleData)
      };

      this.updatePageMeta(pageData);
    } catch (error) {
      console.error('Failed to update article SEO:', error);
    }
  }

  // Mettre à jour le SEO pour une catégorie
  updateCategorySEO(category) {
    const categoryNames = {
      politique: 'Politique',
      economie: 'Économie',
      sport: 'Sport',
      culture: 'Culture',
      tech: 'Technologie'
    };

    const categoryName = categoryNames[category] || category;

    const pageData = {
      title: `Actualités ${categoryName} - ${this.siteConfig.name}`,
      description: `Toute l'actualité ${categoryName.toLowerCase()} du Bénin. Suivez les dernières nouvelles et événements.`,
      keywords: `${categoryName.toLowerCase()}, actualités, bénin, news`,
      section: categoryName
    };

    this.updatePageMeta(pageData);
  }

  // Mettre à jour le SEO pour la recherche
  updateSearchSEO(query) {
    const pageData = {
      title: `Recherche: ${query} - ${this.siteConfig.name}`,
      description: `Résultats de recherche pour "${query}" sur ${this.siteConfig.name}`,
      keywords: `${query}, recherche, actualités, bénin`
    };

    this.updatePageMeta(pageData);
  }

  // Générer le structured data pour un article
  generateArticleStructuredData(article) {
    return {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.excerpt || article.description,
      image: article.image,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      author: {
        '@type': 'Person',
        name: article.author,
        image: article.authorAvatar
      },
      publisher: {
        '@type': 'Organization',
        name: this.siteConfig.name,
        logo: {
          '@type': 'ImageObject',
          url: `${this.siteConfig.url}/images/logo-512.svg`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': window.location.href
      },
      articleSection: article.category,
      keywords: article.tags ? article.tags.join(', ') : article.category,
      aggregateRating: article.rating ? {
        '@type': 'AggregateRating',
        ratingValue: article.rating,
        reviewCount: article.reviewCount || 1
      } : undefined
    };
  }

  // Simuler la récupération des données d'article
  async fetchArticleData(articleId) {
    // En production, ceci ferait un appel API
    // Pour la démo, retourner des données simulées
    return {
      id: articleId,
      title: `Article ${articleId} - Titre accrocheur`,
      excerpt: 'Description courte et attractive de l\'article pour le SEO...',
      description: 'Description complète de l\'article avec plus de détails pour les moteurs de recherche.',
      author: 'Marie KPOGNON',
      authorAvatar: '/images/authors/marie.jpg',
      image: '/images/articles/article-1.jpg',
      publishedAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T14:30:00Z',
      category: 'Politique',
      tags: ['gouvernement', 'politique', 'bénin'],
      rating: 4.5,
      reviewCount: 25
    };
  }

  // Générer un sitemap XML
  async generateSitemap() {
    const baseUrl = this.siteConfig.url;
    const currentDate = new Date().toISOString();

    // Pages statiques
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/search.html', priority: '0.8', changefreq: 'weekly' },
      { url: '/forum.html', priority: '0.7', changefreq: 'daily' }
    ];

    // Catégories
    const categories = [
      { url: '/forum-category.html?category=politique', priority: '0.8', changefreq: 'daily' },
      { url: '/forum-category.html?category=economie', priority: '0.8', changefreq: 'daily' },
      { url: '/forum-category.html?category=sport', priority: '0.8', changefreq: 'daily' },
      { url: '/forum-category.html?category=culture', priority: '0.8', changefreq: 'daily' }
    ];

    // Articles simulés (en production, récupérer de l'API)
    const articles = [];
    for (let i = 1; i <= 50; i++) {
      articles.push({
        url: `/article.html?id=${i}`,
        priority: '0.6',
        changefreq: 'weekly',
        lastmod: currentDate
      });
    }

    const allPages = [...staticPages, ...categories, ...articles];

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod || currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${page.image ? `    <image:image>
      <image:loc>${baseUrl}${page.image}</image:loc>
      <image:title>${page.imageTitle || 'Article image'}</image:title>
    </image:image>` : ''}
  </url>`).join('\n')}
</urlset>`;

    return sitemapXml;
  }

  // Soumettre le sitemap aux moteurs de recherche
  async submitSitemap() {
    const sitemapUrl = `${this.siteConfig.url}/sitemap.xml`;

    // Soumission à Google
    try {
      await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
      console.log('✅ Sitemap submitted to Google');
    } catch (error) {
      console.warn('Failed to submit sitemap to Google:', error);
    }

    // Soumission à Bing
    try {
      await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
      console.log('✅ Sitemap submitted to Bing');
    } catch (error) {
      console.warn('Failed to submit sitemap to Bing:', error);
    }
  }

  // Générer un robots.txt
  generateRobotsTxt() {
    return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${this.siteConfig.url}/sitemap.xml

# Crawl delay
Crawl-delay: 1

# Disallow admin areas (if any)
Disallow: /admin/
Disallow: /api/private/

# Allow all assets
Allow: /css/
Allow: /js/
Allow: /images/`;
  }

  // Obtenir les données Open Graph par défaut
  getDefaultOpenGraph() {
    return {
      'og:title': this.defaultMeta.title,
      'og:description': this.defaultMeta.description,
      'og:image': `${this.siteConfig.url}/images/og-default.jpg`,
      'og:url': this.siteConfig.url,
      'og:type': 'website',
      'og:site_name': this.siteConfig.name,
      'og:locale': this.siteConfig.locale
    };
  }

  // Obtenir les Twitter Cards par défaut
  getDefaultTwitterCards() {
    return {
      'twitter:card': 'summary_large_image',
      'twitter:site': this.siteConfig.twitterHandle,
      'twitter:title': this.defaultMeta.title,
      'twitter:description': this.defaultMeta.description,
      'twitter:image': `${this.siteConfig.url}/images/twitter-default.jpg`,
      'twitter:url': this.siteConfig.url
    };
  }

  // Obtenir les statistiques SEO
  getStats() {
    return {
      title: document.title,
      metaDescription: document.querySelector('meta[name="description"]')?.content,
      canonicalUrl: document.querySelector('link[rel="canonical"]')?.href,
      ogTags: Array.from(document.querySelectorAll('meta[property^="og:"]')).length,
      twitterTags: Array.from(document.querySelectorAll('meta[name^="twitter:"]')).length,
      structuredData: document.querySelector('script[type="application/ld+json"]') ? true : false
    };
  }

  // Nettoyer les ressources
  destroy() {
    // Nettoyer les event listeners si nécessaire
  }
}

// Fonction pour initialiser le SEO manager
export function initSEOManager(options = {}) {
  const seoManager = new SEOManager(options);

  // Exposer globalement
  window.seoManager = seoManager;

  return seoManager;
}

// Fonction utilitaire pour mettre à jour le SEO d'une page
export function updatePageSEO(pageData) {
  if (window.seoManager) {
    window.seoManager.updatePageMeta(pageData);
  }
}

// Fonction pour générer le structured data d'un article
export function generateArticleSEO(article) {
  return {
    title: article.title,
    description: article.excerpt || article.description,
    keywords: article.tags ? article.tags.join(', ') : article.category,
    author: article.author,
    image: article.image,
    url: `${window.location.origin}/article.html?id=${article.id}`,
    type: 'article',
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    section: article.category,
    tags: article.tags,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.excerpt || article.description,
      image: article.image,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      author: {
        '@type': 'Person',
        name: article.author
      },
      publisher: {
        '@type': 'Organization',
        name: 'Les Scoops du Jour',
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/images/logo-512.svg`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${window.location.origin}/article.html?id=${article.id}`
      },
      articleSection: article.category,
      keywords: article.tags ? article.tags.join(', ') : article.category
    }
  };
}

// Fonction pour mesurer l'efficacité SEO
export function measureSEOEffectiveness() {
  const stats = {
    hasTitle: document.title && document.title.length > 0,
    hasMetaDescription: !!document.querySelector('meta[name="description"]'),
    titleLength: document.title ? document.title.length : 0,
    descriptionLength: document.querySelector('meta[name="description"]')?.content?.length || 0,
    hasCanonical: !!document.querySelector('link[rel="canonical"]'),
    hasOpenGraph: document.querySelectorAll('meta[property^="og:"]').length > 0,
    hasTwitterCards: document.querySelectorAll('meta[name^="twitter:"]').length > 0,
    hasStructuredData: !!document.querySelector('script[type="application/ld+json"]'),
    hasViewport: !!document.querySelector('meta[name="viewport"]'),
    hasCharset: !!document.querySelector('meta[charset]')
  };

  // Calculer un score SEO simple
  let score = 0;
  if (stats.hasTitle && stats.titleLength >= 30 && stats.titleLength <= 60) score += 20;
  if (stats.hasMetaDescription && stats.descriptionLength >= 120 && stats.descriptionLength <= 160) score += 20;
  if (stats.hasCanonical) score += 15;
  if (stats.hasOpenGraph) score += 15;
  if (stats.hasTwitterCards) score += 10;
  if (stats.hasStructuredData) score += 10;
  if (stats.hasViewport) score += 5;
  if (stats.hasCharset) score += 5;

  stats.seoScore = score;

  console.table(stats);
  return stats;
}
