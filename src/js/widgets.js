/**
 * Les Scoops du Jour - Embeddable Widgets
 * Version 1.0.0
 * Widgets embarquables pour médias partenaires béninois
 */

(function(window, document) {
  'use strict';

  // Configuration par défaut
  const DEFAULT_CONFIG = {
    baseURL: 'https://newsapi.org/v2',
    apiKey: 'demo-key', // À remplacer par une vraie clé API
    country: 'bj',
    pageSize: 12,
    theme: 'light',
    lang: 'fr'
  };

  // Cache pour les données
  const dataCache = new Map();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Utilitaires
  const utils = {
    // Générer un ID unique
    generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2),

    // Formater la date
    formatDate: (date, locale = 'fr-FR') => {
      return new Date(date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    // Échapper le HTML
    escapeHtml: (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    // Créer un élément à partir du HTML
    createElementFromHTML: (htmlString) => {
      const template = document.createElement('template');
      template.innerHTML = htmlString.trim();
      return template.content.firstElementChild;
    },

    // Injecter le CSS
    injectCSS: (css, id) => {
      if (document.getElementById(id)) return;

      const style = document.createElement('style');
      style.id = id;
      style.textContent = css;
      document.head.appendChild(style);
    },

    // Charger une police Google Fonts
    loadGoogleFont: (fontName) => {
      if (document.querySelector(`link[href*="fonts.googleapis.com"][href*="${fontName}"]`)) return;

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
  };

  // ==========================================
  // WIDGET ARTICLES RÉCENTS
  // ==========================================

  class ScoopsWidget {
    constructor(containerId, options = {}) {
      this.containerId = containerId;
      this.container = document.getElementById(containerId);

      if (!this.container) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
      }

      this.options = {
        theme: options.theme || 'light',
        category: options.category || null,
        limit: options.limit || 5,
        showImages: options.showImages !== false,
        showDates: options.showDates !== false,
        showExcerpt: options.showExcerpt !== false,
        showSource: options.showSource !== false,
        layout: options.layout || 'vertical', // 'vertical', 'horizontal', 'grid'
        maxTitleLength: options.maxTitleLength || 80,
        maxExcerptLength: options.maxExcerptLength || 120,
        primaryColor: options.primaryColor || '#FE0202',
        secondaryColor: options.secondaryColor || '#757575',
        backgroundColor: options.backgroundColor || '#ffffff',
        textColor: options.textColor || '#1a1a1a',
        borderRadius: options.borderRadius || '8px',
        fontFamily: options.fontFamily || 'Inter, sans-serif',
        ...options
      };

      this.isLoading = false;
      this.articles = [];

      this.init();
    }

    async init() {
      this.injectStyles();
      this.renderLoading();
      await this.loadArticles();
      this.render();
      this.attachEvents();
    }

    injectStyles() {
      const css = `
        .scoops-widget {
          font-family: ${this.options.fontFamily};
          background-color: ${this.options.backgroundColor};
          color: ${this.options.textColor};
          border-radius: ${this.options.borderRadius};
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          max-width: 100%;
        }

        .scoops-widget.dark {
          background-color: #1a1a1a;
          color: #ffffff;
        }

        .scoops-widget-header {
          padding: 16px 20px;
          background-color: ${this.options.primaryColor};
          color: white;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .scoops-widget-header::before {
          content: "📰";
          font-size: 20px;
        }

        .scoops-widget-content {
          padding: 0;
        }

        .scoops-article {
          display: flex;
          padding: 16px 20px;
          border-bottom: 1px solid #e0e0e0;
          transition: background-color 0.2s ease;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
        }

        .scoops-article:last-child {
          border-bottom: none;
        }

        .scoops-article:hover {
          background-color: rgba(254, 2, 2, 0.05);
        }

        .scoops-article-image {
          width: 80px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
          flex-shrink: 0;
          margin-right: 16px;
        }

        .scoops-article-content {
          flex: 1;
          min-width: 0;
        }

        .scoops-article-title {
          font-size: 16px;
          font-weight: 600;
          line-height: 1.4;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .scoops-article-excerpt {
          font-size: 14px;
          line-height: 1.4;
          color: #666;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .scoops-article-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #888;
        }

        .scoops-article-date,
        .scoops-article-source {
          font-weight: 500;
        }

        .scoops-loading {
          padding: 40px 20px;
          text-align: center;
          color: #666;
        }

        .scoops-loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid ${this.options.primaryColor};
          border-radius: 50%;
          animation: scoops-spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes scoops-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .scoops-error {
          padding: 40px 20px;
          text-align: center;
          color: #f44336;
        }

        .scoops-error-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .scoops-footer {
          padding: 16px 20px;
          background-color: #f5f5f5;
          text-align: center;
          border-top: 1px solid #e0e0e0;
        }

        .scoops-footer a {
          color: ${this.options.primaryColor};
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
        }

        .scoops-footer a:hover {
          text-decoration: underline;
        }

        /* Layout horizontal */
        .scoops-widget.layout-horizontal .scoops-article {
          flex-direction: column;
          padding: 12px;
        }

        .scoops-widget.layout-horizontal .scoops-article-image {
          width: 100%;
          height: 120px;
          margin-right: 0;
          margin-bottom: 12px;
        }

        /* Layout grid */
        .scoops-widget.layout-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 0;
        }

        .scoops-widget.layout-grid .scoops-article {
          flex-direction: column;
          border-bottom: none;
          border-right: 1px solid #e0e0e0;
        }

        .scoops-widget.layout-grid .scoops-article:nth-child(odd) {
          border-right: none;
        }

        .scoops-widget.layout-grid .scoops-article-image {
          width: 100%;
          height: 140px;
          margin-right: 0;
          margin-bottom: 12px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .scoops-widget.layout-grid {
            grid-template-columns: 1fr;
          }

          .scoops-widget.layout-grid .scoops-article {
            border-right: none;
            border-bottom: 1px solid #e0e0e0;
          }

          .scoops-widget.layout-grid .scoops-article:last-child {
            border-bottom: none;
          }
        }
      `;

      utils.injectCSS(css, `scoops-widget-styles-${this.containerId}`);
      utils.loadGoogleFont('Inter');
    }

    renderLoading() {
      const loadingHTML = `
        <div class="scoops-widget ${this.options.theme}">
          <div class="scoops-widget-header">
            Articles récents
          </div>
          <div class="scoops-widget-content">
            <div class="scoops-loading">
              <div class="scoops-loading-spinner"></div>
              <div>Chargement des articles...</div>
            </div>
          </div>
        </div>
      `;

      this.container.innerHTML = loadingHTML;
    }

    renderError(message = 'Erreur de chargement') {
      const errorHTML = `
        <div class="scoops-widget ${this.options.theme}">
          <div class="scoops-widget-header">
            Articles récents
          </div>
          <div class="scoops-widget-content">
            <div class="scoops-error">
              <div class="scoops-error-icon">⚠️</div>
              <div>${message}</div>
            </div>
          </div>
        </div>
      `;

      this.container.innerHTML = errorHTML;
    }

    render() {
      if (!this.articles || this.articles.length === 0) {
        this.renderError('Aucun article trouvé');
        return;
      }

      const articlesHTML = this.articles.map(article => this.renderArticle(article)).join('');

      const widgetHTML = `
        <div class="scoops-widget ${this.options.theme} layout-${this.options.layout}">
          <div class="scoops-widget-header">
            Articles récents
          </div>
          <div class="scoops-widget-content">
            ${articlesHTML}
          </div>
          <div class="scoops-footer">
            <a href="https://lesscoopsdujour.com" target="_blank" rel="noopener">
              Voir tous les articles →
            </a>
          </div>
        </div>
      `;

      this.container.innerHTML = widgetHTML;
    }

    renderArticle(article) {
      const title = this.truncateText(article.title, this.options.maxTitleLength);
      const excerpt = this.options.showExcerpt && article.description ?
        this.truncateText(article.description, this.options.maxExcerptLength) : '';

      const imageHTML = this.options.showImages && article.urlToImage ?
        `<img src="${article.urlToImage}" alt="${utils.escapeHtml(article.title)}" class="scoops-article-image" loading="lazy">` : '';

      const dateHTML = this.options.showDates ?
        `<span class="scoops-article-date">${utils.formatDate(article.publishedAt)}</span>` : '';

      const sourceHTML = this.options.showSource && article.source ?
        `<span class="scoops-article-source">${utils.escapeHtml(article.source.name)}</span>` : '';

      const metaHTML = (dateHTML || sourceHTML) ?
        `<div class="scoops-article-meta">${dateHTML}${sourceHTML ? ' • ' + sourceHTML : ''}</div>` : '';

      return `
        <a href="${article.url}" target="_blank" rel="noopener" class="scoops-article">
          ${imageHTML}
          <div class="scoops-article-content">
            <div class="scoops-article-title">${utils.escapeHtml(title)}</div>
            ${excerpt ? `<div class="scoops-article-excerpt">${utils.escapeHtml(excerpt)}</div>` : ''}
            ${metaHTML}
          </div>
        </a>
      `;
    }

    truncateText(text, maxLength) {
      if (!text || text.length <= maxLength) return text;
      return text.substring(0, maxLength).trim() + '...';
    }

    async loadArticles() {
      this.isLoading = true;

      try {
        const cacheKey = `articles-${this.options.category || 'all'}-${this.options.limit}`;
        const cached = dataCache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
          this.articles = cached.data.slice(0, this.options.limit);
          return;
        }

        // Simulation d'appel API (remplacer par vrai appel)
        const response = await this.fetchArticles();
        this.articles = response.slice(0, this.options.limit);

        // Mettre en cache
        dataCache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });

      } catch (error) {
        console.error('Erreur lors du chargement des articles:', error);
        this.articles = [];
      } finally {
        this.isLoading = false;
      }
    }

    async fetchArticles() {
      // Simulation - Remplacer par vrai appel API
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockArticles = [
            {
              title: "Nouveau gouvernement formé : Patrice Talon nomme ses ministres",
              description: "Le président Patrice Talon a annoncé la composition de son nouveau gouvernement après plusieurs semaines de consultations.",
              url: "https://lesscoopsdujour.com/article/gouvernement-talon",
              urlToImage: "https://via.placeholder.com/400x250/FE0202/FFFFFF?text=Gouvernement+Talon",
              publishedAt: "2025-09-13T10:00:00Z",
              source: { name: "Les Scoops du Jour" }
            },
            {
              title: "Économie béninoise : Croissance de 6,8% au premier trimestre",
              description: "Le Bénin enregistre une croissance économique solide malgré les défis mondiaux.",
              url: "https://lesscoopsdujour.com/article/croissance-economique",
              urlToImage: "https://via.placeholder.com/400x250/4CAF50/FFFFFF?text=Croissance+Économique",
              publishedAt: "2025-09-12T08:00:00Z",
              source: { name: "Les Scoops du Jour" }
            },
            {
              title: "Festival international d'Ouidah : Plus de 50 000 visiteurs attendus",
              description: "Le Festival International d'Ouidah 2025 promet d'être un événement majeur de la culture béninoise.",
              url: "https://lesscoopsdujour.com/article/festival-ouidah",
              urlToImage: "https://via.placeholder.com/400x250/9C27B0/FFFFFF?text=Festival+Ouidah",
              publishedAt: "2025-09-11T14:00:00Z",
              source: { name: "Les Scoops du Jour" }
            },
            {
              title: "Équipe nationale : Victoire historique contre le Maroc en CAN",
              description: "Les Écureuils du Bénin créent la sensation en battant le Maroc en Coupe d'Afrique.",
              url: "https://lesscoopsdujour.com/article/victoire-can",
              urlToImage: "https://via.placeholder.com/400x250/FF9800/FFFFFF?text=Victoire+CAN",
              publishedAt: "2025-09-10T16:00:00Z",
              source: { name: "Les Scoops du Jour" }
            },
            {
              title: "Réforme éducative : Nouveaux programmes pour 2025-2026",
              description: "Le ministre de l'Éducation annonce une réforme majeure du système éducatif béninois.",
              url: "https://lesscoopsdujour.com/article/reforme-education",
              urlToImage: "https://via.placeholder.com/400x250/2196F3/FFFFFF?text=Réforme+Éducation",
              publishedAt: "2025-09-09T12:00:00Z",
              source: { name: "Les Scoops du Jour" }
            }
          ];

          resolve(mockArticles);
        }, 1000);
      });
    }

    attachEvents() {
      // Analytics tracking
      const articles = this.container.querySelectorAll('.scoops-article');
      articles.forEach((article, index) => {
        article.addEventListener('click', () => {
          this.trackClick(this.articles[index]);
        });
      });
    }

    trackClick(article) {
      // Analytics - peut être intégré avec Google Analytics, etc.
      console.log('Article clicked:', article.title);

      if (window.gtag) {
        window.gtag('event', 'widget_article_click', {
          event_category: 'engagement',
          event_label: article.title,
          custom_parameter_1: this.containerId
        });
      }
    }

    // Méthodes publiques
    refresh() {
      this.loadArticles().then(() => this.render());
    }

    destroy() {
      this.container.innerHTML = '';
      dataCache.clear();
    }
  }

  // ==========================================
  // WIDGET ARTICLE DU JOUR
  // ==========================================

  class ArticleOfTheDayWidget {
    constructor(containerId, options = {}) {
      this.containerId = containerId;
      this.container = document.getElementById(containerId);

      if (!this.container) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
      }

      this.options = {
        theme: options.theme || 'light',
        showImage: options.showImage !== false,
        showExcerpt: options.showExcerpt !== false,
        showAuthor: options.showAuthor !== false,
        primaryColor: options.primaryColor || '#FE0202',
        secondaryColor: options.secondaryColor || '#757575',
        backgroundColor: options.backgroundColor || '#ffffff',
        textColor: options.textColor || '#1a1a1a',
        borderRadius: options.borderRadius || '12px',
        fontFamily: options.fontFamily || 'Inter, sans-serif',
        ...options
      };

      this.article = null;
      this.init();
    }

    async init() {
      this.injectStyles();
      this.renderLoading();
      await this.loadArticleOfTheDay();
      this.render();
    }

    injectStyles() {
      const css = `
        .article-day-widget {
          font-family: ${this.options.fontFamily};
          background-color: ${this.options.backgroundColor};
          color: ${this.options.textColor};
          border-radius: ${this.options.borderRadius};
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          max-width: 100%;
        }

        .article-day-header {
          background: linear-gradient(135deg, ${this.options.primaryColor}, ${this.options.primaryColor}dd);
          color: white;
          padding: 20px;
          text-align: center;
        }

        .article-day-badge {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .article-day-title {
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }

        .article-day-content {
          position: relative;
        }

        .article-day-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .article-day-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          padding: 20px;
          color: white;
        }

        .article-day-article-title {
          font-size: 20px;
          font-weight: 700;
          line-height: 1.3;
          margin-bottom: 8px;
        }

        .article-day-excerpt {
          font-size: 14px;
          line-height: 1.5;
          opacity: 0.9;
          margin-bottom: 12px;
        }

        .article-day-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 12px;
          opacity: 0.8;
        }

        .article-day-author {
          font-weight: 500;
        }

        .article-day-date {
          font-weight: 500;
        }

        .article-day-cta {
          position: absolute;
          top: 20px;
          right: 20px;
          background: ${this.options.primaryColor};
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          font-size: 14px;
        }

        .article-day-cta:hover {
          background: ${this.options.secondaryColor};
          transform: translateY(-1px);
        }

        .article-day-loading {
          padding: 60px 20px;
          text-align: center;
          color: #666;
        }

        .article-day-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid ${this.options.primaryColor};
          border-radius: 50%;
          animation: scoops-spin 1s linear infinite;
          margin: 0 auto 20px;
        }
      `;

      utils.injectCSS(css, `article-day-widget-styles-${this.containerId}`);
    }

    renderLoading() {
      const loadingHTML = `
        <div class="article-day-widget">
          <div class="article-day-header">
            <div class="article-day-badge">Article du jour</div>
            <h3 class="article-day-title">Chargement...</h3>
          </div>
          <div class="article-day-loading">
            <div class="article-day-spinner"></div>
            <div>Préparation de l'article du jour...</div>
          </div>
        </div>
      `;

      this.container.innerHTML = loadingHTML;
    }

    render() {
      if (!this.article) {
        this.renderError();
        return;
      }

      const imageHTML = this.options.showImage && this.article.urlToImage ?
        `<img src="${this.article.urlToImage}" alt="${utils.escapeHtml(this.article.title)}" class="article-day-image">` : '';

      const excerptHTML = this.options.showExcerpt && this.article.description ?
        `<p class="article-day-excerpt">${utils.escapeHtml(this.article.description)}</p>` : '';

      const authorHTML = this.options.showAuthor && this.article.author ?
        `<span class="article-day-author">Par ${utils.escapeHtml(this.article.author)}</span>` : '';

      const widgetHTML = `
        <div class="article-day-widget">
          <div class="article-day-header">
            <div class="article-day-badge">Article du jour</div>
            <h3 class="article-day-title">${utils.formatDate(new Date(), 'fr-FR')}</h3>
          </div>
          <div class="article-day-content">
            ${imageHTML}
            <div class="article-day-overlay">
              <h2 class="article-day-article-title">${utils.escapeHtml(this.article.title)}</h2>
              ${excerptHTML}
              <div class="article-day-meta">
                ${authorHTML}
                <span class="article-day-date">${utils.formatDate(this.article.publishedAt)}</span>
              </div>
            </div>
            <a href="${this.article.url}" target="_blank" rel="noopener" class="article-day-cta">
              Lire l'article →
            </a>
          </div>
        </div>
      `;

      this.container.innerHTML = widgetHTML;
    }

    renderError() {
      const errorHTML = `
        <div class="article-day-widget">
          <div class="article-day-header">
            <div class="article-day-badge">Article du jour</div>
            <h3 class="article-day-title">Erreur de chargement</h3>
          </div>
          <div class="article-day-loading">
            <div>Impossible de charger l'article du jour</div>
          </div>
        </div>
      `;

      this.container.innerHTML = errorHTML;
    }

    async loadArticleOfTheDay() {
      try {
        // Simulation - Remplacer par vrai appel API
        this.article = await new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              title: "Bénin 2025 : Une année de transformation économique majeure",
              description: "Le Bénin s'apprête à vivre une année charnière avec des réformes économiques d'envergure qui positionnent le pays comme leader régional.",
              url: "https://lesscoopsdujour.com/article/benin-2025-transformation",
              urlToImage: "https://via.placeholder.com/600x300/00a651/FFFFFF?text=Bénin+2025",
              publishedAt: "2025-09-13T06:00:00Z",
              author: "Marie KPOGNON"
            });
          }, 800);
        });
      } catch (error) {
        console.error('Erreur lors du chargement de l\'article du jour:', error);
        this.article = null;
      }
    }
  }

  // ==========================================
  // WIDGET MÉTÉO BÉNIN
  // ==========================================

  class WeatherWidget {
    constructor(containerId, options = {}) {
      this.containerId = containerId;
      this.container = document.getElementById(containerId);

      if (!this.container) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
      }

      this.options = {
        theme: options.theme || 'light',
        city: options.city || 'Cotonou',
        showHumidity: options.showHumidity !== false,
        showWind: options.showWind !== false,
        showForecast: options.showForecast !== false,
        primaryColor: options.primaryColor || '#FE0202',
        backgroundColor: options.backgroundColor || '#ffffff',
        textColor: options.textColor || '#1a1a1a',
        borderRadius: options.borderRadius || '12px',
        fontFamily: options.fontFamily || 'Inter, sans-serif',
        ...options
      };

      this.weather = null;
      this.init();
    }

    async init() {
      this.injectStyles();
      this.renderLoading();
      await this.loadWeather();
      this.render();
    }

    injectStyles() {
      const css = `
        .weather-widget {
          font-family: ${this.options.fontFamily};
          background-color: ${this.options.backgroundColor};
          color: ${this.options.textColor};
          border-radius: ${this.options.borderRadius};
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          max-width: 100%;
        }

        .weather-header {
          background: linear-gradient(135deg, ${this.options.primaryColor}, #2196F3);
          color: white;
          padding: 20px;
          text-align: center;
        }

        .weather-location {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 4px;
        }

        .weather-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }

        .weather-current {
          padding: 24px 20px;
          text-align: center;
        }

        .weather-temp {
          font-size: 48px;
          font-weight: 300;
          line-height: 1;
          margin-bottom: 8px;
        }

        .weather-condition {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .weather-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .weather-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 20px;
        }

        .weather-detail {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .weather-detail-icon {
          font-size: 20px;
          opacity: 0.7;
        }

        .weather-detail-text {
          font-size: 14px;
          font-weight: 500;
        }

        .weather-forecast {
          border-top: 1px solid #e0e0e0;
          padding: 20px;
        }

        .forecast-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          text-align: center;
        }

        .forecast-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .forecast-item {
          text-align: center;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .forecast-day {
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 8px;
          color: #666;
        }

        .forecast-icon {
          font-size: 24px;
          margin-bottom: 4px;
        }

        .forecast-temp {
          font-size: 16px;
          font-weight: 600;
        }

        .forecast-temp-min {
          opacity: 0.7;
          font-weight: 400;
        }

        .weather-loading {
          padding: 60px 20px;
          text-align: center;
          color: #666;
        }

        .weather-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid ${this.options.primaryColor};
          border-radius: 50%;
          animation: scoops-spin 1s linear infinite;
          margin: 0 auto 20px;
        }
      `;

      utils.injectCSS(css, `weather-widget-styles-${this.containerId}`);
    }

    renderLoading() {
      const loadingHTML = `
        <div class="weather-widget">
          <div class="weather-header">
            <div class="weather-location">${this.options.city}, Bénin</div>
            <h3 class="weather-title">Météo</h3>
          </div>
          <div class="weather-loading">
            <div class="weather-spinner"></div>
            <div>Chargement des données météo...</div>
          </div>
        </div>
      `;

      this.container.innerHTML = loadingHTML;
    }

    render() {
      if (!this.weather) {
        this.renderError();
        return;
      }

      const detailsHTML = this.renderWeatherDetails();
      const forecastHTML = this.options.showForecast ? this.renderForecast() : '';

      const widgetHTML = `
        <div class="weather-widget">
          <div class="weather-header">
            <div class="weather-location">${this.options.city}, Bénin</div>
            <h3 class="weather-title">Météo</h3>
          </div>
          <div class="weather-current">
            <div class="weather-icon">${this.getWeatherIcon(this.weather.condition)}</div>
            <div class="weather-temp">${this.weather.temperature}°C</div>
            <div class="weather-condition">${this.weather.condition}</div>
            ${detailsHTML}
          </div>
          ${forecastHTML}
        </div>
      `;

      this.container.innerHTML = widgetHTML;
    }

    renderWeatherDetails() {
      if (!this.options.showHumidity && !this.options.showWind) return '';

      let details = '';

      if (this.options.showHumidity) {
        details += `
          <div class="weather-detail">
            <span class="weather-detail-icon">💧</span>
            <span class="weather-detail-text">${this.weather.humidity}%</span>
          </div>
        `;
      }

      if (this.options.showWind) {
        details += `
          <div class="weather-detail">
            <span class="weather-detail-icon">💨</span>
            <span class="weather-detail-text">${this.weather.windSpeed} km/h</span>
          </div>
        `;
      }

      return `<div class="weather-details">${details}</div>`;
    }

    renderForecast() {
      if (!this.weather.forecast || this.weather.forecast.length === 0) return '';

      const forecastItems = this.weather.forecast.slice(0, 3).map(day => `
        <div class="forecast-item">
          <div class="forecast-day">${day.day}</div>
          <div class="forecast-icon">${this.getWeatherIcon(day.condition)}</div>
          <div class="forecast-temp">
            ${day.tempMax}° <span class="forecast-temp-min">${day.tempMin}°</span>
          </div>
        </div>
      `).join('');

      return `
        <div class="weather-forecast">
          <h4 class="forecast-title">Prévisions</h4>
          <div class="forecast-grid">
            ${forecastItems}
          </div>
        </div>
      `;
    }

    renderError() {
      const errorHTML = `
        <div class="weather-widget">
          <div class="weather-header">
            <div class="weather-location">${this.options.city}, Bénin</div>
            <h3 class="weather-title">Météo</h3>
          </div>
          <div class="weather-loading">
            <div>⚠️ Données météo indisponibles</div>
          </div>
        </div>
      `;

      this.container.innerHTML = errorHTML;
    }

    getWeatherIcon(condition) {
      const icons = {
        'ensoleillé': '☀️',
        'partiellement nuageux': '⛅',
        'nuageux': '☁️',
        'pluvieux': '🌧️',
        'orageux': '⛈️',
        'sunny': '☀️',
        'partly cloudy': '⛅',
        'cloudy': '☁️',
        'rainy': '🌧️',
        'stormy': '⛈️'
      };

      return icons[condition.toLowerCase()] || '☀️';
    }

    async loadWeather() {
      try {
        // Simulation - Remplacer par vrai appel API météo
        this.weather = await new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              temperature: 32,
              condition: 'ensoleillé',
              humidity: 65,
              windSpeed: 15,
              forecast: [
                { day: 'Demain', condition: 'partiellement nuageux', tempMax: 33, tempMin: 26 },
                { day: 'Jeu', condition: 'pluvieux', tempMax: 30, tempMin: 24 },
                { day: 'Ven', condition: 'ensoleillé', tempMax: 34, tempMin: 27 }
              ]
            });
          }, 600);
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données météo:', error);
        this.weather = null;
      }
    }
  }

  // ==========================================
  // WIDGET BREAKING NEWS TICKER
  // ==========================================

  class BreakingNewsTicker {
    constructor(containerId, options = {}) {
      this.containerId = containerId;
      this.container = document.getElementById(containerId);

      if (!this.container) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
      }

      this.options = {
        theme: options.theme || 'light',
        speed: options.speed || 50, // pixels per second
        showIcon: options.showIcon !== false,
        primaryColor: options.primaryColor || '#FE0202',
        backgroundColor: options.backgroundColor || '#FE0202',
        textColor: options.textColor || '#ffffff',
        fontFamily: options.fontFamily || 'Inter, sans-serif',
        ...options
      };

      this.news = [];
      this.animationId = null;
      this.isPaused = false;

      this.init();
    }

    async init() {
      this.injectStyles();
      this.renderLoading();
      await this.loadBreakingNews();
      this.render();
      this.startAnimation();
      this.attachEvents();
    }

    injectStyles() {
      const css = `
        .breaking-news-ticker {
          font-family: ${this.options.fontFamily};
          background-color: ${this.options.backgroundColor};
          color: ${this.options.textColor};
          overflow: hidden;
          position: relative;
          height: 40px;
          display: flex;
          align-items: center;
        }

        .breaking-news-label {
          background-color: ${this.options.primaryColor};
          padding: 8px 16px;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .breaking-news-content {
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        .breaking-news-track {
          display: flex;
          position: absolute;
          white-space: nowrap;
          animation: scroll-left ${60 / this.options.speed}s linear infinite;
        }

        .breaking-news-item {
          padding: 0 24px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .breaking-news-item:hover {
          opacity: 0.8;
        }

        .breaking-news-item:not(:last-child)::after {
          content: "•";
          margin-left: 24px;
          opacity: 0.5;
        }

        .breaking-news-icon {
          font-size: 16px;
        }

        @keyframes scroll-left {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .breaking-news-paused .breaking-news-track {
          animation-play-state: paused;
        }

        .breaking-news-loading {
          padding: 0 20px;
          font-size: 14px;
          color: rgba(255,255,255,0.8);
        }
      `;

      utils.injectCSS(css, `breaking-news-ticker-styles-${this.containerId}`);
    }

    renderLoading() {
      const loadingHTML = `
        <div class="breaking-news-ticker">
          <div class="breaking-news-label">
            ${this.options.showIcon ? '🔥' : ''} Breaking News
          </div>
          <div class="breaking-news-content">
            <div class="breaking-news-loading">Chargement des dernières actualités...</div>
          </div>
        </div>
      `;

      this.container.innerHTML = loadingHTML;
    }

    render() {
      if (!this.news || this.news.length === 0) {
        this.renderError();
        return;
      }

      const newsItems = this.news.map(item => `
        <div class="breaking-news-item" data-url="${item.url}">
          ${this.options.showIcon ? '<span class="breaking-news-icon">📰</span>' : ''}
          <span>${utils.escapeHtml(item.title)}</span>
        </div>
      `).join('');

      const tickerHTML = `
        <div class="breaking-news-ticker">
          <div class="breaking-news-label">
            ${this.options.showIcon ? '🔥' : ''} Breaking News
          </div>
          <div class="breaking-news-content">
            <div class="breaking-news-track">
              ${newsItems}
            </div>
          </div>
        </div>
      `;

      this.container.innerHTML = tickerHTML;
    }

    renderError() {
      const errorHTML = `
        <div class="breaking-news-ticker">
          <div class="breaking-news-label">
            ${this.options.showIcon ? '⚠️' : ''} Breaking News
          </div>
          <div class="breaking-news-content">
            <div class="breaking-news-loading">Actualités indisponibles</div>
          </div>
        </div>
      `;

      this.container.innerHTML = errorHTML;
    }

    async loadBreakingNews() {
      try {
        // Simulation - Remplacer par vrai appel API
        this.news = await new Promise((resolve) => {
          setTimeout(() => {
            resolve([
              {
                title: "Gouvernement Talon annonce de nouvelles mesures économiques",
                url: "https://lesscoopsdujour.com/breaking/gouvernement-talon"
              },
              {
                title: "Victoire historique des Écureuils en Coupe d'Afrique",
                url: "https://lesscoopsdujour.com/breaking/ecureuils-victoire"
              },
              {
                title: "Cours du coton en hausse sur les marchés mondiaux",
                url: "https://lesscoopsdujour.com/breaking/coton-hausse"
              },
              {
                title: "Nouveau partenariat Chine-Bénin pour le développement",
                url: "https://lesscoopsdujour.com/breaking/chine-benin"
              }
            ]);
          }, 400);
        });
      } catch (error) {
        console.error('Erreur lors du chargement des breaking news:', error);
        this.news = [];
      }
    }

    startAnimation() {
      // L'animation CSS gère le défilement automatiquement
      const track = this.container.querySelector('.breaking-news-track');
      if (track) {
        // Dupliquer le contenu pour un défilement continu
        const originalContent = track.innerHTML;
        track.innerHTML = originalContent + originalContent;
      }
    }

    attachEvents() {
      const items = this.container.querySelectorAll('.breaking-news-item');
      items.forEach(item => {
        item.addEventListener('click', (e) => {
          const url = e.currentTarget.dataset.url;
          if (url) {
            window.open(url, '_blank');
          }
        });
      });

      // Pause on hover
      const ticker = this.container.querySelector('.breaking-news-ticker');
      if (ticker) {
        ticker.addEventListener('mouseenter', () => {
          ticker.classList.add('breaking-news-paused');
        });

        ticker.addEventListener('mouseleave', () => {
          ticker.classList.remove('breaking-news-paused');
        });
      }
    }

    pause() {
      this.isPaused = true;
      const ticker = this.container.querySelector('.breaking-news-ticker');
      if (ticker) {
        ticker.classList.add('breaking-news-paused');
      }
    }

    resume() {
      this.isPaused = false;
      const ticker = this.container.querySelector('.breaking-news-ticker');
      if (ticker) {
        ticker.classList.remove('breaking-news-paused');
      }
    }
  }

  // ==========================================
  // EXPORTS GLOBAUX
  // ==========================================

  window.ScoopsWidgets = {
    ScoopsWidget,
    ArticleOfTheDayWidget,
    WeatherWidget,
    BreakingNewsTicker,
    utils
  };

  // Auto-initialisation pour les éléments avec data-widget
  document.addEventListener('DOMContentLoaded', () => {
    // Widgets d'articles récents
    document.querySelectorAll('[data-widget="scoops-recent"]').forEach(el => {
      const options = JSON.parse(el.dataset.options || '{}');
      new ScoopsWidget(el.id, options);
    });

    // Widgets article du jour
    document.querySelectorAll('[data-widget="scoops-article-day"]').forEach(el => {
      const options = JSON.parse(el.dataset.options || '{}');
      new ArticleOfTheDayWidget(el.id, options);
    });

    // Widgets météo
    document.querySelectorAll('[data-widget="scoops-weather"]').forEach(el => {
      const options = JSON.parse(el.dataset.options || '{}');
      new WeatherWidget(el.id, options);
    });

    // Widgets breaking news
    document.querySelectorAll('[data-widget="scoops-breaking-news"]').forEach(el => {
      const options = JSON.parse(el.dataset.options || '{}');
      new BreakingNewsTicker(el.id, options);
    });
  });

})(window, document);
