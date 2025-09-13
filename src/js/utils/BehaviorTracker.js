/**
 * Système de tracking comportemental pour Business Troc
 * Collecte et analyse le comportement des utilisateurs pour les recommandations
 */
class BehaviorTracker {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.userId = this.getOrCreateUserId();
    this.sessionId = this.generateSessionId();
    this.currentPage = null;
    this.pageStartTime = Date.now();
    this.scrollDepth = 0;
    this.interactions = [];

    // Configuration du tracking
    this.config = {
      trackScroll: true,
      trackTime: true,
      trackClicks: true,
      trackReading: true,
      autoSave: true,
      saveInterval: 30000 // 30 secondes
    };

    // Cache des données comportementales
    this.behaviorData = this.loadBehaviorData();

    // Métriques de session
    this.sessionMetrics = {
      startTime: Date.now(),
      pagesViewed: [],
      totalTime: 0,
      interactions: 0
    };

    this.init();
  }

  /**
   * Initialise le système de tracking
   */
  init() {
    this.setupEventListeners();
    this.startPeriodicSave();
    this.trackPageView(window.location.pathname);

    // Tracking de la visibilité de la page
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackPageLeave();
      } else {
        this.trackPageReturn();
      }
    });

    // Tracking avant fermeture de la page
    window.addEventListener('beforeunload', () => {
      this.trackPageLeave();
      this.saveBehaviorData();
    });
  }

  /**
   * Configure les écouteurs d'événements
   */
  setupEventListeners() {
    // Tracking du scroll
    if (this.config.trackScroll) {
      let scrollTimeout;
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.trackScroll();
        }, 100);
      });
    }

    // Tracking des clics
    if (this.config.trackClicks) {
      document.addEventListener('click', (event) => {
        this.trackClick(event);
      });
    }

    // Tracking du temps passé
    if (this.config.trackTime) {
      setInterval(() => {
        this.trackTimeSpent();
      }, 10000); // Toutes les 10 secondes
    }
  }

  /**
   * Génère ou récupère l'ID utilisateur
   */
  getOrCreateUserId() {
    let userId = this.storageManager.get('userId');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      this.storageManager.set('userId', userId);
    }
    return userId;
  }

  /**
   * Génère un ID de session unique
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Charge les données comportementales depuis le stockage
   */
  loadBehaviorData() {
    const data = this.storageManager.get('behaviorData') || {};
    if (!data[this.userId]) {
      data[this.userId] = {
        interactions: [],
        viewedArticles: [],
        searchHistory: [],
        preferences: {},
        lastActivity: Date.now()
      };
    }
    return data;
  }

  /**
   * Sauvegarde les données comportementales
   */
  saveBehaviorData() {
    this.behaviorData[this.userId].lastActivity = Date.now();
    this.storageManager.set('behaviorData', this.behaviorData);
  }

  /**
   * Démarre la sauvegarde périodique
   */
  startPeriodicSave() {
    if (this.config.autoSave) {
      setInterval(() => {
        this.saveBehaviorData();
      }, this.config.saveInterval);
    }
  }

  /**
   * Track une vue de page
   */
  trackPageView(pagePath, metadata = {}) {
    const pageView = {
      type: 'page_view',
      page: pagePath,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      ...metadata
    };

    this.addInteraction(pageView);
    this.currentPage = pagePath;
    this.pageStartTime = Date.now();
    this.scrollDepth = 0;

    // Ajouter à la liste des pages vues de la session
    this.sessionMetrics.pagesViewed.push({
      path: pagePath,
      startTime: Date.now(),
      ...metadata
    });
  }

  /**
   * Track le scroll sur la page
   */
  trackScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

    if (scrollPercentage > this.scrollDepth) {
      this.scrollDepth = scrollPercentage;

      const scrollEvent = {
        type: 'scroll',
        page: this.currentPage,
        depth: scrollPercentage,
        timestamp: Date.now(),
        sessionId: this.sessionId
      };

      this.addInteraction(scrollEvent);
    }
  }

  /**
   * Track les clics utilisateur
   */
  trackClick(event) {
    const target = event.target;
    const clickData = {
      type: 'click',
      page: this.currentPage,
      element: target.tagName.toLowerCase(),
      className: target.className,
      id: target.id,
      text: target.textContent?.substring(0, 50),
      position: {
        x: event.clientX,
        y: event.clientY
      },
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    // Détecter le type de clic
    if (target.closest('a')) {
      clickData.clickType = 'link';
      clickData.href = target.closest('a').href;
    } else if (target.closest('button')) {
      clickData.clickType = 'button';
    } else if (target.closest('[data-article-id]')) {
      clickData.clickType = 'article';
      clickData.articleId = target.closest('[data-article-id]').dataset.articleId;
    }

    this.addInteraction(clickData);
  }

  /**
   * Track le temps passé sur la page
   */
  trackTimeSpent() {
    if (!this.currentPage) return;

    const timeSpent = Date.now() - this.pageStartTime;
    const timeEvent = {
      type: 'time_spent',
      page: this.currentPage,
      duration: timeSpent,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.addInteraction(timeEvent);
  }

  /**
   * Track la lecture d'un article
   */
  trackArticleReading(articleId, articleData = {}) {
    const readingEvent = {
      type: 'article_read',
      articleId: articleId,
      page: this.currentPage,
      startTime: Date.now(),
      scrollDepth: this.scrollDepth,
      completionRate: 0,
      ...articleData,
      sessionId: this.sessionId
    };

    // Calculer le taux de completion basé sur le scroll et le temps
    const timeSpent = Date.now() - this.pageStartTime;
    const estimatedReadingTime = articleData.readingTime || 300; // 5 minutes par défaut

    readingEvent.completionRate = Math.min(1, timeSpent / (estimatedReadingTime * 1000));
    readingEvent.completionRate = Math.max(readingEvent.completionRate, this.scrollDepth / 100);

    this.addInteraction(readingEvent);

    // Mettre à jour les articles vus
    this.updateViewedArticles(articleId, readingEvent);
  }

  /**
   * Track les interactions sociales
   */
  trackSocialInteraction(type, articleId, metadata = {}) {
    const socialEvent = {
      type: 'social_interaction',
      interactionType: type, // 'like', 'share', 'comment', 'bookmark'
      articleId: articleId,
      page: this.currentPage,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      ...metadata
    };

    this.addInteraction(socialEvent);
  }

  /**
   * Track les recherches
   */
  trackSearch(query, results = [], metadata = {}) {
    const searchEvent = {
      type: 'search',
      query: query,
      resultsCount: results.length,
      page: this.currentPage,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      ...metadata
    };

    this.addInteraction(searchEvent);

    // Ajouter à l'historique des recherches
    if (!this.behaviorData[this.userId].searchHistory) {
      this.behaviorData[this.userId].searchHistory = [];
    }

    this.behaviorData[this.userId].searchHistory.push({
      query,
      timestamp: Date.now(),
      resultsCount: results.length
    });

    // Limiter à 50 recherches récentes
    if (this.behaviorData[this.userId].searchHistory.length > 50) {
      this.behaviorData[this.userId].searchHistory = this.behaviorData[this.userId].searchHistory.slice(-50);
    }
  }

  /**
   * Track l'abandon de page
   */
  trackPageLeave() {
    if (!this.currentPage) return;

    const leaveEvent = {
      type: 'page_leave',
      page: this.currentPage,
      timeSpent: Date.now() - this.pageStartTime,
      scrollDepth: this.scrollDepth,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.addInteraction(leaveEvent);
  }

  /**
   * Track le retour sur la page
   */
  trackPageReturn() {
    const returnEvent = {
      type: 'page_return',
      page: this.currentPage,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.addInteraction(returnEvent);
    this.pageStartTime = Date.now();
  }

  /**
   * Met à jour la liste des articles vus
   */
  updateViewedArticles(articleId, readingEvent) {
    if (!this.behaviorData[this.userId].viewedArticles) {
      this.behaviorData[this.userId].viewedArticles = [];
    }

    const existingIndex = this.behaviorData[this.userId].viewedArticles.findIndex(
      article => article.id === articleId
    );

    if (existingIndex >= 0) {
      // Mettre à jour l'article existant
      const existing = this.behaviorData[this.userId].viewedArticles[existingIndex];
      existing.viewCount = (existing.viewCount || 1) + 1;
      existing.lastViewed = Date.now();
      existing.totalTimeSpent = (existing.totalTimeSpent || 0) + readingEvent.duration;
      existing.completionRate = Math.max(existing.completionRate || 0, readingEvent.completionRate);
      existing.scrollDepth = Math.max(existing.scrollDepth || 0, readingEvent.scrollDepth);
    } else {
      // Ajouter un nouvel article
      this.behaviorData[this.userId].viewedArticles.push({
        id: articleId,
        firstViewed: Date.now(),
        lastViewed: Date.now(),
        viewCount: 1,
        totalTimeSpent: readingEvent.duration || 0,
        completionRate: readingEvent.completionRate || 0,
        scrollDepth: readingEvent.scrollDepth || 0,
        category: readingEvent.category,
        title: readingEvent.title
      });
    }

    // Limiter à 100 articles récents
    if (this.behaviorData[this.userId].viewedArticles.length > 100) {
      this.behaviorData[this.userId].viewedArticles.sort((a, b) => b.lastViewed - a.lastViewed);
      this.behaviorData[this.userId].viewedArticles = this.behaviorData[this.userId].viewedArticles.slice(0, 100);
    }
  }

  /**
   * Ajoute une interaction à la liste
   */
  addInteraction(interaction) {
    this.interactions.push(interaction);
    this.sessionMetrics.interactions++;

    // Ajouter aux données comportementales globales
    if (!this.behaviorData[this.userId].interactions) {
      this.behaviorData[this.userId].interactions = [];
    }

    this.behaviorData[this.userId].interactions.push(interaction);

    // Limiter à 500 interactions récentes
    if (this.behaviorData[this.userId].interactions.length > 500) {
      this.behaviorData[this.userId].interactions = this.behaviorData[this.userId].interactions.slice(-500);
    }
  }

  /**
   * Obtient les données comportementales de l'utilisateur
   */
  getUserBehaviorData() {
    return this.behaviorData[this.userId] || {};
  }

  /**
   * Obtient les métriques de session
   */
  getSessionMetrics() {
    this.sessionMetrics.totalTime = Date.now() - this.sessionMetrics.startTime;
    return { ...this.sessionMetrics };
  }

  /**
   * Obtient les statistiques utilisateur
   */
  getUserStats() {
    const data = this.behaviorData[this.userId];
    if (!data) return {};

    const interactions = data.interactions || [];
    const viewedArticles = data.viewedArticles || [];

    return {
      totalInteractions: interactions.length,
      totalArticlesViewed: viewedArticles.length,
      avgSessionTime: this.calculateAvgSessionTime(interactions),
      topCategories: this.getTopCategories(viewedArticles),
      engagementRate: this.calculateEngagementRate(interactions),
      lastActivity: data.lastActivity
    };
  }

  /**
   * Calcule le temps moyen de session
   */
  calculateAvgSessionTime(interactions) {
    const sessions = {};
    interactions.forEach(interaction => {
      const sessionId = interaction.sessionId;
      if (!sessions[sessionId]) {
        sessions[sessionId] = {
          start: interaction.timestamp,
          end: interaction.timestamp
        };
      }
      sessions[sessionId].start = Math.min(sessions[sessionId].start, interaction.timestamp);
      sessions[sessionId].end = Math.max(sessions[sessionId].end, interaction.timestamp);
    });

    const sessionTimes = Object.values(sessions).map(s => s.end - s.start);
    return sessionTimes.length > 0 ? sessionTimes.reduce((a, b) => a + b) / sessionTimes.length : 0;
  }

  /**
   * Obtient les catégories les plus populaires
   */
  getTopCategories(viewedArticles) {
    const categoryCount = {};
    viewedArticles.forEach(article => {
      const category = article.category || 'general';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
  }

  /**
   * Calcule le taux d'engagement
   */
  calculateEngagementRate(interactions) {
    const totalInteractions = interactions.length;
    const engagedInteractions = interactions.filter(i =>
      ['like', 'comment', 'share', 'bookmark', 'article_read'].includes(i.type)
    ).length;

    return totalInteractions > 0 ? engagedInteractions / totalInteractions : 0;
  }

  /**
   * Exporte les données pour analyse
   */
  exportData() {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      behaviorData: this.behaviorData[this.userId],
      sessionMetrics: this.getSessionMetrics(),
      userStats: this.getUserStats(),
      currentInteractions: this.interactions
    };
  }

  /**
   * Réinitialise les données de l'utilisateur (pour debug)
   */
  resetUserData() {
    this.behaviorData[this.userId] = {
      interactions: [],
      viewedArticles: [],
      searchHistory: [],
      preferences: {},
      lastActivity: Date.now()
    };
    this.saveBehaviorData();
  }

  /**
   * Met à jour les préférences utilisateur
   */
  updateUserPreferences(preferences) {
    this.behaviorData[this.userId].preferences = {
      ...this.behaviorData[this.userId].preferences,
      ...preferences
    };
    this.saveBehaviorData();
  }
}

// Export pour utilisation globale
if (typeof window !== 'undefined') {
  window.BehaviorTracker = BehaviorTracker;
}

export default BehaviorTracker;
