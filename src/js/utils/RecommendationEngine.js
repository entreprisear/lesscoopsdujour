/**
 * Moteur de recommandations intelligent pour Business Troc
 * Utilise un algorithme hybride basé sur le comportement utilisateur et les similarités de contenu
 */
class RecommendationEngine {
  constructor(userBehavior, articles) {
    this.userBehavior = userBehavior || {};
    this.articles = articles || [];
    this.weights = {
      category: 0.3,      // Préférence de catégorie
      readingTime: 0.2,   // Temps de lecture historique
      recency: 0.2,       // Articles récents
      popularity: 0.15,   // Popularité générale
      similarity: 0.15    // Similarité textuelle
    };

    // Cache pour les performances
    this.userProfiles = new Map();
    this.similarityCache = new Map();

    // Données béninoises pour recommandations locales
    this.benineseCategories = [
      'économie', 'politique', 'culture', 'sport', 'éducation',
      'agriculture', 'technologie', 'santé', 'tourisme', 'entrepreneuriat'
    ];

    this.benineseKeywords = [
      'benin', 'cotonou', 'porto-novo', 'patrice talon', 'fpi',
      'bceao', 'uemoa', 'marché dantokpa', 'lac ahémé', 'parc w',
      'recensement', 'développement', 'investissement', 'startup'
    ];
  }

  /**
   * Génère des recommandations personnalisées pour un utilisateur
   */
  generateRecommendations(userId, limit = 5, context = {}) {
    const userProfile = this.buildUserProfile(userId);
    const scoredArticles = this.scoreArticles(userProfile, context);

    return scoredArticles
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        article: item.article,
        score: item.score,
        reasons: item.reasons
      }));
  }

  /**
   * Construit le profil utilisateur basé sur son comportement
   */
  buildUserProfile(userId) {
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId);
    }

    const behavior = this.userBehavior[userId] || {};
    const profile = {
      userId,
      preferredCategories: this.calculatePreferredCategories(behavior),
      readingPatterns: this.analyzeReadingPatterns(behavior),
      interactionHistory: behavior.interactions || [],
      timePreferences: this.analyzeTimePreferences(behavior),
      benineseAffinity: this.calculateBenineseAffinity(behavior),
      lastActivity: behavior.lastActivity || Date.now()
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  /**
   * Calcule les catégories préférées de l'utilisateur
   */
  calculatePreferredCategories(behavior) {
    const categoryScores = {};
    const interactions = behavior.interactions || [];

    interactions.forEach(interaction => {
      const category = interaction.category || 'general';
      const weight = this.getInteractionWeight(interaction.type);

      categoryScores[category] = (categoryScores[category] || 0) + weight;
    });

    // Normaliser les scores
    const total = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
    if (total === 0) return {};

    Object.keys(categoryScores).forEach(cat => {
      categoryScores[cat] = categoryScores[cat] / total;
    });

    return categoryScores;
  }

  /**
   * Analyse les patterns de lecture
   */
  analyzeReadingPatterns(behavior) {
    const articles = behavior.viewedArticles || [];
    const patterns = {
      avgReadingTime: 0,
      preferredReadingTimes: [],
      scrollDepth: 0,
      completionRate: 0
    };

    if (articles.length === 0) return patterns;

    const totalTime = articles.reduce((sum, article) => sum + (article.readingTime || 0), 0);
    patterns.avgReadingTime = totalTime / articles.length;

    patterns.completionRate = articles.filter(a => a.completionRate > 0.8).length / articles.length;

    return patterns;
  }

  /**
   * Analyse les préférences temporelles
   */
  analyzeTimePreferences(behavior) {
    const interactions = behavior.interactions || [];
    const hourCounts = new Array(24).fill(0);

    interactions.forEach(interaction => {
      const hour = new Date(interaction.timestamp).getHours();
      hourCounts[hour]++;
    });

    const maxHour = hourCounts.indexOf(Math.max(...hourCounts));
    return {
      peakHour: maxHour,
      isMorningPerson: maxHour >= 6 && maxHour <= 12,
      isEveningPerson: maxHour >= 18 && maxHour <= 23
    };
  }

  /**
   * Calcule l'affinité pour le contenu béninois
   */
  calculateBenineseAffinity(behavior) {
    const interactions = behavior.interactions || [];
    let benineseInteractions = 0;
    let totalInteractions = interactions.length;

    interactions.forEach(interaction => {
      const title = (interaction.title || '').toLowerCase();
      const content = (interaction.content || '').toLowerCase();

      const hasBenineseContent = this.benineseKeywords.some(keyword =>
        title.includes(keyword) || content.includes(keyword)
      );

      if (hasBenineseContent) {
        benineseInteractions++;
      }
    });

    return totalInteractions > 0 ? benineseInteractions / totalInteractions : 0.5;
  }

  /**
   * Score tous les articles pour un profil utilisateur
   */
  scoreArticles(userProfile, context = {}) {
    return this.articles.map(article => {
      const score = this.calculateScore(article, userProfile, context);
      const reasons = this.generateReasons(article, userProfile, score);

      return {
        article,
        score,
        reasons
      };
    });
  }

  /**
   * Calcule le score d'un article pour un profil utilisateur
   */
  calculateScore(article, userProfile, context = {}) {
    let score = 0;
    const reasons = [];

    // Score basé sur les catégories préférées
    const categoryScore = this.calculateCategoryScore(article, userProfile);
    score += categoryScore * this.weights.category;
    if (categoryScore > 0.7) reasons.push('catégorie préférée');

    // Score basé sur le temps de lecture
    const readingScore = this.calculateReadingTimeScore(article, userProfile);
    score += readingScore * this.weights.readingTime;
    if (readingScore > 0.8) reasons.push('durée de lecture adaptée');

    // Score basé sur la récence
    const recencyScore = this.calculateRecencyScore(article);
    score += recencyScore * this.weights.recency;
    if (recencyScore > 0.8) reasons.push('article récent');

    // Score basé sur la popularité
    const popularityScore = this.calculatePopularityScore(article);
    score += popularityScore * this.weights.popularity;
    if (popularityScore > 0.8) reasons.push('très populaire');

    // Score basé sur la similarité
    const similarityScore = this.calculateSimilarityScore(article, userProfile);
    score += similarityScore * this.weights.similarity;
    if (similarityScore > 0.7) reasons.push('similaire à vos lectures');

    // Bonus pour le contenu béninois
    const benineseBonus = this.calculateBenineseBonus(article, userProfile);
    score += benineseBonus;
    if (benineseBonus > 0) reasons.push('contenu béninois');

    // Ajustements contextuels
    score = this.applyContextAdjustments(score, article, context);

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calcule le score de catégorie
   */
  calculateCategoryScore(article, userProfile) {
    const articleCategory = article.category || 'general';
    const userPrefs = userProfile.preferredCategories;

    if (!userPrefs[articleCategory]) return 0.1; // Score minimum

    return userPrefs[articleCategory];
  }

  /**
   * Calcule le score basé sur le temps de lecture
   */
  calculateReadingTimeScore(article, userProfile) {
    const articleTime = article.readingTime || 5; // minutes
    const userAvg = userProfile.readingPatterns.avgReadingTime || 5;

    const ratio = Math.min(articleTime, userAvg) / Math.max(articleTime, userAvg);
    return ratio;
  }

  /**
   * Calcule le score de récence
   */
  calculateRecencyScore(article) {
    const now = Date.now();
    const published = new Date(article.publishedAt).getTime();
    const ageInDays = (now - published) / (1000 * 60 * 60 * 24);

    // Score décroissant avec l'âge (max 30 jours)
    if (ageInDays > 30) return 0.1;
    return Math.max(0.1, 1 - (ageInDays / 30));
  }

  /**
   * Calcule le score de popularité
   */
  calculatePopularityScore(article) {
    const views = article.views || 0;
    const likes = article.likes || 0;
    const comments = article.comments || 0;

    // Score composite basé sur l'engagement
    const engagement = (likes * 2) + (comments * 3) + (views * 0.1);
    const maxEngagement = 1000; // Valeur de référence

    return Math.min(1, engagement / maxEngagement);
  }

  /**
   * Calcule le score de similarité
   */
  calculateSimilarityScore(article, userProfile) {
    const cacheKey = `${userProfile.userId}-${article.id}`;
    if (this.similarityCache.has(cacheKey)) {
      return this.similarityCache.get(cacheKey);
    }

    const userArticles = userProfile.interactionHistory
      .filter(i => i.type === 'view' && i.completionRate > 0.5)
      .slice(-10); // Derniers 10 articles

    if (userArticles.length === 0) return 0.5;

    let totalSimilarity = 0;
    userArticles.forEach(userArticle => {
      const similarity = this.calculateTextSimilarity(article, userArticle);
      totalSimilarity += similarity;
    });

    const avgSimilarity = totalSimilarity / userArticles.length;
    this.similarityCache.set(cacheKey, avgSimilarity);

    return avgSimilarity;
  }

  /**
   * Calcule la similarité textuelle simple
   */
  calculateTextSimilarity(article1, article2) {
    const text1 = `${article1.title} ${article1.content || ''}`.toLowerCase();
    const text2 = `${article2.title} ${article2.content || ''}`.toLowerCase();

    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Calcule le bonus pour le contenu béninois
   */
  calculateBenineseBonus(article, userProfile) {
    const affinity = userProfile.benineseAffinity;
    const title = (article.title || '').toLowerCase();
    const content = (article.content || '').toLowerCase();

    const hasBenineseContent = this.benineseKeywords.some(keyword =>
      title.includes(keyword) || content.includes(keyword)
    );

    const isBenineseCategory = this.benineseCategories.includes(
      (article.category || '').toLowerCase()
    );

    if (hasBenineseContent || isBenineseCategory) {
      return affinity * 0.2; // Bonus jusqu'à 20% basé sur l'affinité
    }

    return 0;
  }

  /**
   * Applique les ajustements contextuels
   */
  applyContextAdjustments(score, article, context) {
    let adjustedScore = score;

    // Ajustement temporel
    if (context.timeOfDay) {
      const userPrefs = context.userProfile?.timePreferences;
      if (userPrefs) {
        const currentHour = context.timeOfDay;
        const preferredHour = userPrefs.peakHour;

        if (Math.abs(currentHour - preferredHour) <= 2) {
          adjustedScore *= 1.1; // Bonus 10% si heure préférée
        }
      }
    }

    // Ajustement saisonnier pour le Bénin
    if (context.season) {
      const seasonalTopics = this.getSeasonalTopics(context.season);
      const title = (article.title || '').toLowerCase();

      if (seasonalTopics.some(topic => title.includes(topic))) {
        adjustedScore *= 1.15; // Bonus 15% pour contenu saisonnier
      }
    }

    return adjustedScore;
  }

  /**
   * Génère les raisons de recommandation
   */
  generateReasons(article, userProfile, score) {
    const reasons = [];

    if (score > 0.8) reasons.push('Excellent match');
    else if (score > 0.6) reasons.push('Bon match');
    else if (score > 0.4) reasons.push('Intéressant');

    // Raisons spécifiques
    const category = article.category;
    if (userProfile.preferredCategories[category] > 0.5) {
      reasons.push(`Vous aimez la catégorie ${category}`);
    }

    if (this.calculateRecencyScore(article) > 0.8) {
      reasons.push('Article récent');
    }

    if (this.calculatePopularityScore(article) > 0.7) {
      reasons.push('Très populaire');
    }

    const benineseBonus = this.calculateBenineseBonus(article, userProfile);
    if (benineseBonus > 0) {
      reasons.push('Contenu béninois');
    }

    return reasons;
  }

  /**
   * Obtient les sujets saisonniers pour le Bénin
   */
  getSeasonalTopics(season) {
    const seasonalMap = {
      'dry': ['sécheresse', 'eau', 'irrigation', 'agriculture'],
      'rainy': ['pluie', 'inondation', 'récolte', 'agriculture'],
      'harmattan': ['harmattan', 'santé', 'vent', 'sécheresse']
    };

    return seasonalMap[season] || [];
  }

  /**
   * Obtient le poids d'une interaction
   */
  getInteractionWeight(type) {
    const weights = {
      'view': 1,
      'like': 3,
      'comment': 5,
      'share': 4,
      'bookmark': 4,
      'read_complete': 2
    };

    return weights[type] || 1;
  }

  /**
   * Met à jour le comportement utilisateur
   */
  updateUserBehavior(userId, interaction) {
    if (!this.userBehavior[userId]) {
      this.userBehavior[userId] = {
        interactions: [],
        viewedArticles: [],
        lastActivity: Date.now()
      };
    }

    this.userBehavior[userId].interactions.push({
      ...interaction,
      timestamp: Date.now()
    });

    this.userBehavior[userId].lastActivity = Date.now();

    // Invalider le cache du profil
    this.userProfiles.delete(userId);

    // Limiter l'historique à 100 interactions
    if (this.userBehavior[userId].interactions.length > 100) {
      this.userBehavior[userId].interactions = this.userBehavior[userId].interactions.slice(-100);
    }
  }

  /**
   * Obtient des statistiques de recommandation
   */
  getRecommendationStats(userId) {
    const profile = this.buildUserProfile(userId);
    const recommendations = this.generateRecommendations(userId, 10);

    return {
      totalArticles: this.articles.length,
      recommendationsCount: recommendations.length,
      avgScore: recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length,
      topCategories: Object.entries(profile.preferredCategories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3),
      benineseAffinity: profile.benineseAffinity
    };
  }

  /**
   * Exporte les données pour analyse
   */
  exportData() {
    return {
      userProfiles: Array.from(this.userProfiles.entries()),
      behaviorData: this.userBehavior,
      articlesCount: this.articles.length,
      cacheSize: this.similarityCache.size
    };
  }
}

// Export pour utilisation globale
if (typeof window !== 'undefined') {
  window.RecommendationEngine = RecommendationEngine;
}

export default RecommendationEngine;
