/**
 * Composant d'affichage des recommandations personnalisées
 * Affiche les articles recommandés avec explications et métriques
 */
class RecommendationWidget {
  constructor(container, recommendationEngine, behaviorTracker) {
    this.container = container;
    this.recommendationEngine = recommendationEngine;
    this.behaviorTracker = behaviorTracker;
    this.currentRecommendations = [];
    this.isLoading = false;

    this.init();
  }

  /**
   * Initialise le composant
   */
  init() {
    this.renderSkeleton();
    this.loadRecommendations();
    this.setupEventListeners();
  }

  /**
   * Configure les écouteurs d'événements
   */
  setupEventListeners() {
    // Écouter les changements de comportement pour mettre à jour les recommandations
    document.addEventListener('recommendationUpdate', () => {
      this.loadRecommendations();
    });

    // Tracking des interactions avec les recommandations
    this.container.addEventListener('click', (event) => {
      const recommendationCard = event.target.closest('.recommendation-card');
      if (recommendationCard) {
        const articleId = recommendationCard.dataset.articleId;
        this.trackRecommendationClick(articleId, recommendationCard);
      }
    });
  }

  /**
   * Charge les recommandations depuis le moteur
   */
  async loadRecommendations(context = {}) {
    if (this.isLoading) return;

    this.isLoading = true;
    this.showLoadingState();

    try {
      const userId = this.behaviorTracker?.userId || 'anonymous';
      const recommendations = this.recommendationEngine.generateRecommendations(
        userId,
        6, // 6 recommandations
        {
          timeOfDay: new Date().getHours(),
          season: this.getCurrentSeason(),
          ...context
        }
      );

      this.currentRecommendations = recommendations;
      this.renderRecommendations(recommendations);

    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
      this.showErrorState();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Affiche l'état de chargement
   */
  showLoadingState() {
    const skeletonCards = Array(6).fill().map(() => `
      <div class="recommendation-card skeleton">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text short"></div>
        </div>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="recommendations-header">
        <h3>🔍 Pour vous</h3>
        <div class="loading-indicator">Actualisation...</div>
      </div>
      <div class="recommendations-grid">
        ${skeletonCards}
      </div>
    `;
  }

  /**
   * Affiche l'état d'erreur
   */
  showErrorState() {
    this.container.innerHTML = `
      <div class="recommendations-error">
        <div class="error-icon">⚠️</div>
        <p>Impossible de charger les recommandations</p>
        <button class="retry-btn" onclick="this.loadRecommendations()">
          Réessayer
        </button>
      </div>
    `;
  }

  /**
   * Rend les recommandations
   */
  renderRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      this.renderEmptyState();
      return;
    }

    const recommendationsHTML = recommendations.map(rec =>
      this.renderRecommendationCard(rec.article, rec.score, rec.reasons)
    ).join('');

    this.container.innerHTML = `
      <div class="recommendations-header">
        <h3>🔍 Pour vous</h3>
        <div class="recommendations-meta">
          <span class="recommendations-count">${recommendations.length} suggestions</span>
          <button class="refresh-btn" onclick="this.loadRecommendations()" title="Actualiser">
            🔄
          </button>
        </div>
      </div>
      <div class="recommendations-grid">
        ${recommendationsHTML}
      </div>
      <div class="recommendations-footer">
        <button class="view-more-btn" onclick="this.showMoreRecommendations()">
          Voir plus de recommandations
        </button>
      </div>
    `;

    this.addCardAnimations();
  }

  /**
   * Rend une carte de recommandation
   */
  renderRecommendationCard(article, score, reasons) {
    const scorePercentage = Math.round(score * 100);
    const primaryReason = reasons[0] || 'Recommandé pour vous';

    // Badge de score
    const scoreBadge = this.getScoreBadge(score);

    // Image de l'article (placeholder si pas d'image)
    const imageUrl = article.image || this.getPlaceholderImage(article.category);

    // Métadonnées de l'article
    const publishDate = this.formatDate(article.publishedAt);
    const readingTime = article.readingTime || 5;

    return `
      <div class="recommendation-card" data-article-id="${article.id}" data-score="${score}">
        <div class="recommendation-image">
          <img src="${imageUrl}" alt="${article.title}" loading="lazy">
          ${scoreBadge}
          <div class="recommendation-overlay">
            <div class="recommendation-reason">${primaryReason}</div>
          </div>
        </div>
        <div class="recommendation-content">
          <h4 class="recommendation-title">${this.truncateText(article.title, 60)}</h4>
          <p class="recommendation-excerpt">${this.truncateText(article.content || article.excerpt || '', 100)}</p>
          <div class="recommendation-meta">
            <span class="recommendation-category">${article.category || 'Général'}</span>
            <span class="recommendation-date">${publishDate}</span>
            <span class="recommendation-time">${readingTime} min</span>
          </div>
          <div class="recommendation-reasons">
            ${reasons.slice(1, 3).map(reason => `<span class="reason-tag">${reason}</span>`).join('')}
          </div>
          <div class="recommendation-actions">
            <button class="read-btn" onclick="this.trackRecommendationClick('${article.id}', this.closest('.recommendation-card'))">
              Lire l'article
            </button>
            <button class="bookmark-btn" onclick="this.toggleBookmark('${article.id}')" title="Ajouter aux favoris">
              🔖
            </button>
          </div>
        </div>
        <div class="recommendation-score" title="Score de pertinence: ${scorePercentage}%">
          ${scorePercentage}%
        </div>
      </div>
    `;
  }

  /**
   * Obtient le badge de score approprié
   */
  getScoreBadge(score) {
    if (score >= 0.8) {
      return '<div class="score-badge excellent">⭐ Excellent</div>';
    } else if (score >= 0.6) {
      return '<div class="score-badge good">👍 Bon</div>';
    } else if (score >= 0.4) {
      return '<div class="score-badge fair">👌 Intéressant</div>';
    } else {
      return '<div class="score-badge low">💡 Découvrir</div>';
    }
  }

  /**
   * Obtient une image placeholder basée sur la catégorie
   */
  getPlaceholderImage(category) {
    const placeholders = {
      'économie': 'https://via.placeholder.com/300x200/4CAF50/white?text=Économie',
      'politique': 'https://via.placeholder.com/300x200/2196F3/white?text=Politique',
      'culture': 'https://via.placeholder.com/300x200/FF9800/white?text=Culture',
      'sport': 'https://via.placeholder.com/300x200/4CAF50/white?text=Sport',
      'technologie': 'https://via.placeholder.com/300x200/9C27B0/white?text=Tech',
      'santé': 'https://via.placeholder.com/300x200/E91E63/white?text=Santé',
      'éducation': 'https://via.placeholder.com/300x200/3F51B5/white?text=Éducation'
    };

    return placeholders[category] || 'https://via.placeholder.com/300x200/607D8B/white?text=Article';
  }

  /**
   * Rend l'état vide
   */
  renderEmptyState() {
    this.container.innerHTML = `
      <div class="recommendations-empty">
        <div class="empty-icon">📚</div>
        <h3>Aucune recommandation disponible</h3>
        <p>Continuez à lire des articles pour recevoir des suggestions personnalisées.</p>
        <button class="explore-btn" onclick="this.exploreArticles()">
          Explorer les articles
        </button>
      </div>
    `;
  }

  /**
   * Rend le squelette de chargement
   */
  renderSkeleton() {
    this.showLoadingState();
  }

  /**
   * Ajoute des animations aux cartes
   */
  addCardAnimations() {
    const cards = this.container.querySelectorAll('.recommendation-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      card.classList.add('animate-in');
    });
  }

  /**
   * Track le clic sur une recommandation
   */
  trackRecommendationClick(articleId, cardElement) {
    if (this.behaviorTracker) {
      this.behaviorTracker.trackSocialInteraction('recommendation_click', articleId, {
        source: 'recommendation_widget',
        position: Array.from(cardElement.parentNode.children).indexOf(cardElement) + 1
      });
    }

    // Rediriger vers l'article
    const articleUrl = `/article.html?id=${articleId}`;
    window.location.href = articleUrl;
  }

  /**
   * Bascule le bookmark d'un article
   */
  toggleBookmark(articleId) {
    if (this.behaviorTracker) {
      this.behaviorTracker.trackSocialInteraction('bookmark', articleId);
    }

    // TODO: Implémenter la logique de bookmark
    console.log('Bookmark toggled for article:', articleId);
  }

  /**
   * Affiche plus de recommandations
   */
  showMoreRecommendations() {
    // Charger plus de recommandations
    this.loadRecommendations({ limit: 12 });
  }

  /**
   * Explore les articles disponibles
   */
  exploreArticles() {
    window.location.href = '/search.html';
  }

  /**
   * Obtient la saison actuelle (pour le Bénin)
   */
  getCurrentSeason() {
    const month = new Date().getMonth() + 1; // 1-12

    if (month >= 12 || month <= 2) return 'dry'; // Décembre-Février: Sèche
    if (month >= 3 && month <= 5) return 'dry'; // Mars-Mai: Sèche
    if (month >= 6 && month <= 9) return 'rainy'; // Juin-Septembre: Pluvieuse
    return 'harmattan'; // Octobre-Novembre: Harmattan
  }

  /**
   * Formate une date
   */
  formatDate(dateString) {
    if (!dateString) return 'Récemment';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;

    return date.toLocaleDateString('fr-FR');
  }

  /**
   * Tronque un texte à une longueur donnée
   */
  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Met à jour les recommandations avec un nouveau contexte
   */
  updateRecommendations(context = {}) {
    this.loadRecommendations(context);
  }

  /**
   * Obtient les statistiques des recommandations
   */
  getStats() {
    return {
      totalRecommendations: this.currentRecommendations.length,
      avgScore: this.currentRecommendations.length > 0
        ? this.currentRecommendations.reduce((sum, r) => sum + r.score, 0) / this.currentRecommendations.length
        : 0,
      recommendationsByCategory: this.groupByCategory(),
      isLoading: this.isLoading
    };
  }

  /**
   * Groupe les recommandations par catégorie
   */
  groupByCategory() {
    const categories = {};
    this.currentRecommendations.forEach(rec => {
      const category = rec.article.category || 'Général';
      categories[category] = (categories[category] || 0) + 1;
    });
    return categories;
  }

  /**
   * Exporte les données pour debug
   */
  exportData() {
    return {
      currentRecommendations: this.currentRecommendations,
      stats: this.getStats(),
      isLoading: this.isLoading
    };
  }
}

// Export pour utilisation globale
if (typeof window !== 'undefined') {
  window.RecommendationWidget = RecommendationWidget;
}

export default RecommendationWidget;
