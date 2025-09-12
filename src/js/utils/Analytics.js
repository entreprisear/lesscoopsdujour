// Les Scoops du Jour - Analytics personnalisé
// Système de monitoring et d'analytics complet

class Analytics {
  constructor(options = {}) {
    this.options = {
      endpoint: options.endpoint || '/api/analytics',
      batchSize: options.batchSize || 10,
      flushInterval: options.flushInterval || 30000, // 30 secondes
      enableLocalStorage: options.enableLocalStorage !== false,
      enableConsole: options.enableConsole || false,
      ...options
    };

    this.events = [];
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.startTime = Date.now();

    this.init();
  }

  init() {
    // Écouter les événements de visibilité de page
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_hidden', { timeSpent: Date.now() - this.startTime });
      } else {
        this.track('page_visible', { timeSpent: Date.now() - this.startTime });
      }
    });

    // Écouter les erreurs JavaScript
    window.addEventListener('error', (event) => {
      this.track('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Écouter les erreurs de promesse non gérées
    window.addEventListener('unhandledrejection', (event) => {
      this.track('promise_rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      });
    });

    // Démarrer le flush automatique
    this.startAutoFlush();

    // Restaurer les événements depuis localStorage si activé
    if (this.options.enableLocalStorage) {
      this.restoreFromStorage();
    }

    console.log('📊 Analytics initialized for session:', this.sessionId);
  }

  // ===== GÉNÉRATION D'IDENTIFIANTS =====

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getUserId() {
    // Essayer de récupérer depuis localStorage
    let userId = localStorage.getItem('analytics_user_id');

    if (!userId) {
      // Générer un nouvel ID utilisateur
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('analytics_user_id', userId);
    }

    return userId;
  }

  // ===== TRACKING DES ÉVÉNEMENTS =====

  track(event, data = {}) {
    const eventData = {
      event,
      data: {
        ...data,
        url: window.location.href,
        path: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: Date.now()
      },
      sessionId: this.sessionId,
      userId: this.userId,
      pageLoadTime: this.startTime
    };

    this.events.push(eventData);

    // Logging en console si activé
    if (this.options.enableConsole) {
      console.log('📊 Analytics Event:', event, eventData);
    }

    // Flush immédiat si batch size atteint
    if (this.events.length >= this.options.batchSize) {
      this.flush();
    }

    // Dispatcher un événement personnalisé pour les autres parties de l'app
    window.dispatchEvent(new CustomEvent('analyticsEvent', {
      detail: eventData
    }));

    return eventData;
  }

  // ===== ÉVÉNEMENTS SPÉCIFIQUES =====

  trackPageView(pageData = {}) {
    return this.track('page_view', {
      title: document.title,
      ...pageData
    });
  }

  trackUserInteraction(element, action, data = {}) {
    return this.track('user_interaction', {
      element: element.tagName + (element.id ? `#${element.id}` : '') + (element.className ? `.${element.className.split(' ').join('.')}` : ''),
      action,
      text: element.textContent?.substring(0, 100),
      ...data
    });
  }

  trackSocialShare(platform, article, success = true) {
    return this.track('social_share', {
      platform,
      articleId: article.id,
      articleTitle: article.title,
      success,
      url: article.url
    });
  }

  trackSearch(query, resultsCount, filters = {}) {
    return this.track('search', {
      query,
      resultsCount,
      filters,
      hasResults: resultsCount > 0
    });
  }

  trackNewsletterSubscription(email, source) {
    return this.track('newsletter_subscription', {
      email: this.hashEmail(email), // Hash pour la confidentialité
      source
    });
  }

  trackArticleEngagement(articleId, action, data = {}) {
    return this.track('article_engagement', {
      articleId,
      action, // 'read', 'bookmark', 'rate', 'comment', 'share'
      ...data
    });
  }

  trackPerformanceMetrics(metrics) {
    return this.track('performance_metrics', metrics);
  }

  trackError(error, context = {}) {
    return this.track('application_error', {
      message: error.message,
      stack: error.stack,
      context
    });
  }

  // ===== GESTION DES DONNÉES =====

  startAutoFlush() {
    this.flushInterval = setInterval(() => {
      if (this.events.length > 0) {
        this.flush();
      }
    }, this.options.flushInterval);
  }

  stopAutoFlush() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  async flush() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // Sauvegarder en localStorage avant envoi (au cas où)
      if (this.options.enableLocalStorage) {
        this.saveToStorage(eventsToSend);
      }

      // Envoyer les événements
      await this.sendEvents(eventsToSend);

      // Nettoyer le localStorage après envoi réussi
      if (this.options.enableLocalStorage) {
        this.clearStorage();
      }

      if (this.options.enableConsole) {
        console.log('📊 Analytics: Flushed', eventsToSend.length, 'events');
      }

    } catch (error) {
      console.warn('📊 Analytics: Failed to send events, will retry later', error);

      // Remettre les événements dans la queue
      this.events.unshift(...eventsToSend);
    }
  }

  async sendEvents(events) {
    // Simulation d'envoi (en production, remplacer par vraie API)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simuler un taux de succès de 95%
        if (Math.random() > 0.05) {
          resolve();
        } else {
          reject(new Error('Network error'));
        }
      }, 100 + Math.random() * 200); // 100-300ms de latence simulée
    });
  }

  // ===== PERSISTENCE LOCALE =====

  saveToStorage(events) {
    try {
      const existing = JSON.parse(localStorage.getItem('analytics_pending') || '[]');
      const combined = [...existing, ...events];
      localStorage.setItem('analytics_pending', JSON.stringify(combined));
    } catch (error) {
      console.warn('📊 Analytics: Failed to save to localStorage', error);
    }
  }

  restoreFromStorage() {
    try {
      const pending = JSON.parse(localStorage.getItem('analytics_pending') || '[]');
      if (pending.length > 0) {
        this.events.unshift(...pending);
        console.log('📊 Analytics: Restored', pending.length, 'pending events');
      }
    } catch (error) {
      console.warn('📊 Analytics: Failed to restore from localStorage', error);
    }
  }

  clearStorage() {
    try {
      localStorage.removeItem('analytics_pending');
    } catch (error) {
      console.warn('📊 Analytics: Failed to clear localStorage', error);
    }
  }

  // ===== UTILITAIRES =====

  hashEmail(email) {
    // Hash simple pour la confidentialité (en production, utiliser un vrai hash)
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir en 32 bits
    }
    return hash.toString(36);
  }

  getSessionDuration() {
    return Date.now() - this.startTime;
  }

  getEventCount() {
    return this.events.length;
  }

  // ===== MÉTRIQUES AVANCÉES =====

  getMetrics() {
    const eventsByType = {};
    this.events.forEach(event => {
      eventsByType[event.event] = (eventsByType[event.event] || 0) + 1;
    });

    return {
      sessionId: this.sessionId,
      userId: this.userId,
      sessionDuration: this.getSessionDuration(),
      totalEvents: this.events.length,
      eventsByType,
      pendingEvents: this.events.length,
      lastFlush: Date.now()
    };
  }

  // ===== NETTOYAGE =====

  destroy() {
    this.stopAutoFlush();
    this.flush(); // Flush final
    this.events = [];
  }
}

// ===== FONCTIONS UTILITAIRES =====

// Initialiser l'analytics
export function initAnalytics(options = {}) {
  const analytics = new Analytics(options);

  // Exposer globalement
  window.analytics = analytics;

  // Tracker automatiquement la page view
  analytics.trackPageView();

  return analytics;
}

// Tracker un événement
export function trackEvent(event, data = {}) {
  if (window.analytics) {
    return window.analytics.track(event, data);
  }
}

// Tracker une interaction utilisateur
export function trackInteraction(element, action, data = {}) {
  if (window.analytics) {
    return window.analytics.trackUserInteraction(element, action, data);
  }
}

// Tracker un partage social
export function trackSocialShare(platform, article, success = true) {
  if (window.analytics) {
    return window.analytics.trackSocialShare(platform, article, success);
  }
}

// Tracker une recherche
export function trackSearch(query, resultsCount, filters = {}) {
  if (window.analytics) {
    return window.analytics.trackSearch(query, resultsCount, filters);
  }
}

// Tracker un engagement d'article
export function trackArticleEngagement(articleId, action, data = {}) {
  if (window.analytics) {
    return window.analytics.trackArticleEngagement(articleId, action, data);
  }
}

// Tracker une erreur
export function trackError(error, context = {}) {
  if (window.analytics) {
    return window.analytics.trackError(error, context);
  }
}

// Obtenir les métriques
export function getAnalyticsMetrics() {
  if (window.analytics) {
    return window.analytics.getMetrics();
  }
  return null;
}

// Export de la classe pour utilisation avancée
export { Analytics };
