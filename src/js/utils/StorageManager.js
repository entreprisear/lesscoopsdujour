// Les Scoops du Jour - Storage Manager
// Gestion complète de la persistance des données utilisateur

export class StorageManager {
  constructor() {
    this.prefix = 'scoops_';
    this.version = '1.0';
    this.maxItems = {
      favorites: 100,
      history: 200,
      offlineArticles: 50
    };

    this.init();
  }

  init() {
    // Vérifier et migrer les données si nécessaire
    this.checkVersionAndMigrate();

    // Écouter les changements de stockage (sync entre onglets)
    this.setupStorageSync();

    console.log('💾 Storage Manager initialized');
  }

  // ===== GESTION DES FAVORIS =====

  saveFavorite(articleId) {
    const favorites = this.getFavorites();
    if (!favorites.includes(articleId)) {
      favorites.unshift(articleId); // Ajouter au début

      // Limiter le nombre de favoris
      if (favorites.length > this.maxItems.favorites) {
        favorites.splice(this.maxItems.favorites);
      }

      this.setItem('favorites', favorites);

      // Notification
      this.showNotification('Article ajouté aux favoris', 'success');

      return true;
    }
    return false;
  }

  removeFavorite(articleId) {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(articleId);
    if (index > -1) {
      favorites.splice(index, 1);
      this.setItem('favorites', favorites);

      // Notification
      this.showNotification('Article retiré des favoris', 'info');

      return true;
    }
    return false;
  }

  getFavorites() {
    return this.getItem('favorites', []);
  }

  isFavorite(articleId) {
    const favorites = this.getFavorites();
    return favorites.includes(articleId);
  }

  toggleFavorite(articleId) {
    if (this.isFavorite(articleId)) {
      return this.removeFavorite(articleId);
    } else {
      return this.saveFavorite(articleId);
    }
  }

  // ===== HISTORIQUE DE LECTURE =====

  saveReadingHistory(article) {
    const history = this.getReadingHistory();

    // Créer l'entrée d'historique
    const historyEntry = {
      id: article.id,
      title: article.title,
      category: article.category,
      author: article.author,
      image: article.image,
      readAt: new Date().toISOString(),
      timeSpent: 0, // Sera mis à jour lors de la fermeture
      completed: false
    };

    // Supprimer l'ancienne entrée si elle existe
    const existingIndex = history.findIndex(h => h.id === article.id);
    if (existingIndex > -1) {
      history.splice(existingIndex, 1);
    }

    // Ajouter au début
    history.unshift(historyEntry);

    // Limiter l'historique
    if (history.length > this.maxItems.history) {
      history.splice(this.maxItems.history);
    }

    this.setItem('readingHistory', history);

    // Démarrer le suivi du temps de lecture
    this.startReadingSession(article.id);
  }

  updateReadingTime(articleId, timeSpent, completed = false) {
    const history = this.getReadingHistory();
    const entry = history.find(h => h.id === articleId);

    if (entry) {
      entry.timeSpent = (entry.timeSpent || 0) + timeSpent;
      entry.completed = completed;
      entry.lastReadAt = new Date().toISOString();

      this.setItem('readingHistory', history);
    }
  }

  getReadingHistory(limit = null) {
    const history = this.getItem('readingHistory', []);
    return limit ? history.slice(0, limit) : history;
  }

  getRecentlyRead(limit = 10) {
    return this.getReadingHistory(limit);
  }

  clearReadingHistory() {
    this.setItem('readingHistory', []);
    this.showNotification('Historique de lecture effacé', 'info');
  }

  // ===== ARTICLES SAUVEGARDÉS HORS LIGNE =====

  saveOfflineArticle(article) {
    const offlineArticles = this.getOfflineArticles();

    if (!offlineArticles.find(a => a.id === article.id)) {
      // Créer une version optimisée pour le stockage hors ligne
      const offlineVersion = {
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        author: article.author,
        authorAvatar: article.authorAvatar,
        category: article.category,
        tags: article.tags,
        image: article.image,
        publishedAt: article.publishedAt,
        savedAt: new Date().toISOString(),
        readingProgress: 0
      };

      offlineArticles.unshift(offlineVersion);

      // Limiter le nombre d'articles hors ligne
      if (offlineArticles.length > this.maxItems.offlineArticles) {
        offlineArticles.splice(this.maxItems.offlineArticles);
      }

      this.setItem('offlineArticles', offlineArticles);

      // Notification
      this.showNotification('Article sauvegardé hors ligne', 'success');

      return true;
    }
    return false;
  }

  removeOfflineArticle(articleId) {
    const offlineArticles = this.getOfflineArticles();
    const filtered = offlineArticles.filter(a => a.id !== articleId);

    if (filtered.length !== offlineArticles.length) {
      this.setItem('offlineArticles', filtered);
      this.showNotification('Article supprimé du stockage hors ligne', 'info');
      return true;
    }
    return false;
  }

  getOfflineArticles() {
    return this.getItem('offlineArticles', []);
  }

  getOfflineArticle(articleId) {
    const offlineArticles = this.getOfflineArticles();
    return offlineArticles.find(a => a.id === articleId);
  }

  updateReadingProgress(articleId, progress) {
    const offlineArticles = this.getOfflineArticles();
    const article = offlineArticles.find(a => a.id === articleId);

    if (article) {
      article.readingProgress = progress;
      article.lastReadAt = new Date().toISOString();
      this.setItem('offlineArticles', offlineArticles);
    }
  }

  // ===== PRÉFÉRENCES UTILISATEUR =====

  saveUserPreferences(preferences) {
    const currentPrefs = this.getUserPreferences();
    const updatedPrefs = { ...currentPrefs, ...preferences };

    this.setItem('userPreferences', updatedPrefs);

    // Appliquer les préférences immédiatement
    this.applyUserPreferences(updatedPrefs);

    this.showNotification('Préférences sauvegardées', 'success');
  }

  getUserPreferences() {
    const defaults = {
      theme: 'light',
      language: 'fr',
      notifications: {
        breakingNews: true,
        dailyDigest: false,
        newComments: true,
        recommendations: true
      },
      categories: {
        politique: true,
        economie: true,
        sport: true,
        culture: true,
        tech: true
      },
      reading: {
        fontSize: 'medium',
        lineHeight: 'normal',
        showImages: true
      },
      privacy: {
        analytics: true,
        personalizedAds: false
      }
    };

    return { ...defaults, ...this.getItem('userPreferences', {}) };
  }

  applyUserPreferences(preferences) {
    // Appliquer le thème
    if (preferences.theme) {
      document.documentElement.setAttribute('data-theme', preferences.theme);
    }

    // Appliquer la taille de police
    if (preferences.reading?.fontSize) {
      document.documentElement.setAttribute('data-font-size', preferences.reading.fontSize);
    }

    // Appliquer l'interligne
    if (preferences.reading?.lineHeight) {
      document.documentElement.setAttribute('data-line-height', preferences.reading.lineHeight);
    }
  }

  // ===== NOTIFICATIONS =====

  saveNotificationSettings(settings) {
    const preferences = this.getUserPreferences();
    preferences.notifications = { ...preferences.notifications, ...settings };
    this.saveUserPreferences(preferences);
  }

  getNotificationSettings() {
    return this.getUserPreferences().notifications;
  }

  scheduleNotification(type, data, delay = 0) {
    if (!this.getNotificationSettings()[type]) return;

    const notificationId = `${type}_${Date.now()}`;

    setTimeout(() => {
      this.showNotification(data.message, data.type || 'info', {
        id: notificationId,
        actions: data.actions
      });
    }, delay);

    return notificationId;
  }

  // ===== ANALYTICS LOCALES =====

  trackReadingSession(articleId, startTime, endTime) {
    const duration = endTime - startTime;
    const session = {
      articleId,
      startTime,
      endTime,
      duration,
      date: new Date().toISOString().split('T')[0]
    };

    const sessions = this.getItem('readingSessions', []);
    sessions.push(session);

    // Garder seulement les 1000 dernières sessions
    if (sessions.length > 1000) {
      sessions.splice(0, sessions.length - 1000);
    }

    this.setItem('readingSessions', sessions);

    // Mettre à jour les statistiques
    this.updateReadingStats(articleId, duration);
  }

  updateReadingStats(articleId, duration) {
    const stats = this.getReadingStats();
    const articleStats = stats.articles[articleId] || {
      totalReads: 0,
      totalTime: 0,
      averageTime: 0,
      lastRead: null
    };

    articleStats.totalReads += 1;
    articleStats.totalTime += duration;
    articleStats.averageTime = articleStats.totalTime / articleStats.totalReads;
    articleStats.lastRead = new Date().toISOString();

    stats.articles[articleId] = articleStats;
    this.setItem('readingStats', stats);
  }

  getReadingStats() {
    return this.getItem('readingStats', { articles: {} });
  }

  getMostReadArticles(limit = 10) {
    const stats = this.getReadingStats();
    const articles = Object.entries(stats.articles)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalReads - a.totalReads)
      .slice(0, limit);

    return articles;
  }

  getReadingTimeStats() {
    const sessions = this.getItem('readingSessions', []);
    const today = new Date().toISOString().split('T')[0];

    const todaySessions = sessions.filter(s => s.date === today);
    const totalTimeToday = todaySessions.reduce((sum, s) => sum + s.duration, 0);

    const weekSessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    });
    const totalTimeWeek = weekSessions.reduce((sum, s) => sum + s.duration, 0);

    return {
      today: totalTimeToday,
      week: totalTimeWeek,
      sessionsToday: todaySessions.length,
      sessionsWeek: weekSessions.length
    };
  }

  // ===== SYNCHRONISATION =====

  setupStorageSync() {
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith(this.prefix)) {
        // Les données ont changé dans un autre onglet
        console.log('🔄 Storage sync:', e.key);

        // Notifier les autres parties de l'application
        window.dispatchEvent(new CustomEvent('storageSync', {
          detail: {
            key: e.key.replace(this.prefix, ''),
            oldValue: e.oldValue,
            newValue: e.newValue
          }
        }));
      }
    });
  }

  exportData() {
    const data = {
      version: this.version,
      exportDate: new Date().toISOString(),
      data: {}
    };

    // Exporter toutes les données utilisateur
    const keys = [
      'favorites',
      'readingHistory',
      'offlineArticles',
      'userPreferences',
      'readingSessions',
      'readingStats'
    ];

    keys.forEach(key => {
      data.data[key] = this.getItem(key);
    });

    return data;
  }

  importData(importData) {
    try {
      if (!importData.version || !importData.data) {
        throw new Error('Format de données invalide');
      }

      // Importer les données
      Object.entries(importData.data).forEach(([key, value]) => {
        this.setItem(key, value);
      });

      // Appliquer les préférences
      this.applyUserPreferences(this.getUserPreferences());

      this.showNotification('Données importées avec succès', 'success');

      return true;
    } catch (error) {
      console.error('Import failed:', error);
      this.showNotification('Erreur lors de l\'importation', 'error');
      return false;
    }
  }

  // ===== GESTION DE VERSION =====

  checkVersionAndMigrate() {
    const storedVersion = this.getItem('version');

    if (!storedVersion) {
      // Première utilisation
      this.setItem('version', this.version);
    } else if (storedVersion !== this.version) {
      // Migration nécessaire
      this.migrateData(storedVersion, this.version);
      this.setItem('version', this.version);
    }
  }

  migrateData(fromVersion, toVersion) {
    console.log(`🔄 Migrating data from ${fromVersion} to ${toVersion}`);

    // Exemple de migration
    if (fromVersion === '0.9' && toVersion === '1.0') {
      // Migrer l'ancien format vers le nouveau
      const oldFavorites = this.getItem('oldFavorites', []);
      if (oldFavorites.length > 0) {
        this.setItem('favorites', oldFavorites);
        localStorage.removeItem(this.prefix + 'oldFavorites');
      }
    }

    this.showNotification('Données migrées vers la nouvelle version', 'info');
  }

  // ===== UTILITAIRES =====

  setItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.prefix + key, serialized);

      // Dispatcher un événement personnalisé
      window.dispatchEvent(new CustomEvent('storageChange', {
        detail: { key, value }
      }));

      return true;
    } catch (error) {
      console.error('Storage error:', error);
      this.showNotification('Erreur de stockage local', 'error');
      return false;
    }
  }

  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage read error:', error);
      return defaultValue;
    }
  }

  removeItem(key) {
    localStorage.removeItem(this.prefix + key);

    window.dispatchEvent(new CustomEvent('storageChange', {
      detail: { key, action: 'remove' }
    }));
  }

  clearAllData() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });

    this.showNotification('Toutes les données ont été effacées', 'warning');
  }

  getStorageStats() {
    const keys = Object.keys(localStorage);
    const scoopsKeys = keys.filter(key => key.startsWith(this.prefix));

    let totalSize = 0;
    scoopsKeys.forEach(key => {
      const value = localStorage.getItem(key);
      totalSize += (key.length + value.length) * 2; // Approximation en bytes
    });

    return {
      totalKeys: scoopsKeys.length,
      totalSize: Math.round(totalSize / 1024), // KB
      keys: scoopsKeys.map(key => key.replace(this.prefix, ''))
    };
  }

  // ===== NOTIFICATIONS UTILISATEUR =====

  showNotification(message, type = 'info', options = {}) {
    // Utiliser le système de notifications existant ou créer un événement
    window.dispatchEvent(new CustomEvent('showNotification', {
      detail: {
        message,
        type,
        ...options
      }
    }));
  }

  // ===== SUIVI DE LECTURE =====

  startReadingSession(articleId) {
    this.currentReadingSession = {
      articleId,
      startTime: Date.now(),
      lastActivity: Date.now()
    };
  }

  updateReadingActivity() {
    if (this.currentReadingSession) {
      this.currentReadingSession.lastActivity = Date.now();
    }
  }

  endReadingSession(completed = false) {
    if (this.currentReadingSession) {
      const endTime = Date.now();
      const duration = endTime - this.currentReadingSession.startTime;

      this.trackReadingSession(
        this.currentReadingSession.articleId,
        this.currentReadingSession.startTime,
        endTime
      );

      this.updateReadingTime(
        this.currentReadingSession.articleId,
        duration,
        completed
      );

      this.currentReadingSession = null;
    }
  }

  // ===== RACCOURCIS CLAVIER =====

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + D : Ajouter/retirer des favoris
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        this.toggleCurrentArticleFavorite();
      }

      // Ctrl/Cmd + S : Sauvegarder hors ligne
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveCurrentArticleOffline();
      }
    });
  }

  toggleCurrentArticleFavorite() {
    // Cette méthode sera appelée depuis l'article en cours
    const articleId = window.currentArticleId;
    if (articleId) {
      this.toggleFavorite(articleId);
    }
  }

  saveCurrentArticleOffline() {
    // Cette méthode sera appelée depuis l'article en cours
    const article = window.currentArticle;
    if (article) {
      this.saveOfflineArticle(article);
    }
  }
}

// ===== FONCTIONS UTILITAIRES =====

// Initialiser le Storage Manager
export function initStorageManager(options = {}) {
  const storageManager = new StorageManager(options);

  // Exposer globalement
  window.storageManager = storageManager;

  return storageManager;
}

// Fonctions utilitaires pour un accès facile
export function saveFavorite(articleId) {
  if (window.storageManager) {
    return window.storageManager.saveFavorite(articleId);
  }
}

export function removeFavorite(articleId) {
  if (window.storageManager) {
    return window.storageManager.removeFavorite(articleId);
  }
}

export function isFavorite(articleId) {
  if (window.storageManager) {
    return window.storageManager.isFavorite(articleId);
  }
  return false;
}

export function getFavorites() {
  if (window.storageManager) {
    return window.storageManager.getFavorites();
  }
  return [];
}

export function saveReadingHistory(article) {
  if (window.storageManager) {
    return window.storageManager.saveReadingHistory(article);
  }
}

export function getReadingHistory(limit = null) {
  if (window.storageManager) {
    return window.storageManager.getReadingHistory(limit);
  }
  return [];
}

export function saveOfflineArticle(article) {
  if (window.storageManager) {
    return window.storageManager.saveOfflineArticle(article);
  }
}

export function getOfflineArticles() {
  if (window.storageManager) {
    return window.storageManager.getOfflineArticles();
  }
  return [];
}

export function saveUserPreferences(preferences) {
  if (window.storageManager) {
    return window.storageManager.saveUserPreferences(preferences);
  }
}

export function getUserPreferences() {
  if (window.storageManager) {
    return window.storageManager.getUserPreferences();
  }
  return {};
}

// Export de la classe pour utilisation avancée
export { StorageManager };
