// Les Scoops du Jour - Mock API
// API complète simulée avec données réalistes béninoises

export class MockAPI {
  constructor() {
    this.baseURL = 'https://api.lesscoopsdujour.com';
    this.cache = new Map();
    this.requests = new Map();

    // Initialisation des données
    this.initializeData();

    console.log('🔌 Mock API initialized with realistic Beninese data');
  }

  // Initialisation des données
  async initializeData() {
    // Simulation de chargement initial
    await this.delay(100);

    this.articles = this.generateBenineseArticles(50);
    this.categories = this.getBenineseCategories();
    this.authors = this.generateBenineseAuthors(25);
    this.forumThreads = this.generateBenineseForumData();
    this.comments = this.generateCommentsData();
    this.newsletter = this.generateNewsletterData();

    // Indexation pour la recherche
    this.searchIndex = this.buildSearchIndex();

    console.log('📊 Mock data generated:', {
      articles: this.articles.length,
      authors: this.authors.length,
      forumThreads: this.forumThreads.length,
      categories: this.categories.length
    });
  }

  // ===== ARTICLES ENDPOINTS =====

  async getArticles(params = {}) {
    const {
      page = 1,
      limit = 12,
      category = 'all',
      sortBy = 'publishedAt',
      sortOrder = 'desc',
      search = '',
      author = null,
      dateFrom = null,
      dateTo = null
    } = params;

    // Simulation de latence réseau
    await this.delay(200 + Math.random() * 300);

    let filteredArticles = [...this.articles];

    // Filtrage par catégorie
    if (category !== 'all') {
      filteredArticles = filteredArticles.filter(article => article.category === category);
    }

    // Filtrage par recherche
    if (search) {
      const searchLower = search.toLowerCase();
      filteredArticles = filteredArticles.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.excerpt.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filtrage par auteur
    if (author) {
      filteredArticles = filteredArticles.filter(article => article.author === author);
    }

    // Filtrage par date
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filteredArticles = filteredArticles.filter(article =>
        new Date(article.publishedAt) >= fromDate
      );
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      filteredArticles = filteredArticles.filter(article =>
        new Date(article.publishedAt) <= toDate
      );
    }

    // Tri
    filteredArticles.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'views':
          aValue = a.views;
          bValue = b.views;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'publishedAt':
        default:
          aValue = new Date(a.publishedAt);
          bValue = new Date(b.publishedAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Pagination
    const total = filteredArticles.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

    return {
      data: paginatedArticles,
      meta: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  async getArticle(id) {
    await this.delay(150 + Math.random() * 200);

    const article = this.articles.find(a => a.id === parseInt(id));
    if (!article) {
      throw new Error('Article not found');
    }

    // Ajouter les commentaires
    const articleWithComments = {
      ...article,
      comments: this.comments.filter(c => c.articleId === parseInt(id))
    };

    // Incrémenter les vues
    article.views += 1;

    return articleWithComments;
  }

  async getFeaturedArticles(limit = 3) {
    await this.delay(100);

    return this.articles
      .filter(article => article.featured)
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  async getPopularArticles(limit = 5) {
    await this.delay(100);

    return this.articles
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  async getRelatedArticles(articleId, limit = 3) {
    await this.delay(100);

    const article = this.articles.find(a => a.id === parseInt(articleId));
    if (!article) return [];

    return this.articles
      .filter(a => a.id !== parseInt(articleId) && a.category === article.category)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  // ===== FORUM ENDPOINTS =====

  async getForumThreads(params = {}) {
    const {
      category = null,
      page = 1,
      limit = 10,
      sortBy = 'lastActivity',
      sortOrder = 'desc'
    } = params;

    await this.delay(200 + Math.random() * 200);

    let threads = [...this.forumThreads];

    // Filtrage par catégorie
    if (category) {
      threads = threads.filter(thread => thread.category === category);
    }

    // Tri
    threads.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'replies':
          aValue = a.replies;
          bValue = b.replies;
          break;
        case 'views':
          aValue = a.views;
          bValue = b.views;
          break;
        case 'lastActivity':
        default:
          aValue = new Date(a.lastActivity);
          bValue = new Date(b.lastActivity);
          break;
      }

      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    // Pagination
    const total = threads.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedThreads = threads.slice(startIndex, startIndex + limit);

    return {
      data: paginatedThreads,
      meta: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    };
  }

  async getForumThread(id) {
    await this.delay(150 + Math.random() * 150);

    const thread = this.forumThreads.find(t => t.id === parseInt(id));
    if (!thread) {
      throw new Error('Thread not found');
    }

    // Incrémenter les vues
    thread.views += 1;

    return thread;
  }

  async createForumThread(threadData) {
    await this.delay(300 + Math.random() * 200);

    const newThread = {
      id: this.forumThreads.length + 1,
      title: threadData.title,
      content: threadData.content,
      author: threadData.author,
      category: threadData.category,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      replies: 0,
      views: 0,
      pinned: false,
      locked: false,
      tags: threadData.tags || []
    };

    this.forumThreads.unshift(newThread);
    return newThread;
  }

  async addForumReply(threadId, replyData) {
    await this.delay(200 + Math.random() * 150);

    const thread = this.forumThreads.find(t => t.id === parseInt(threadId));
    if (!thread) {
      throw new Error('Thread not found');
    }

    const newReply = {
      id: Date.now(),
      threadId: parseInt(threadId),
      author: replyData.author,
      content: replyData.content,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    if (!thread.replies) thread.replies = [];
    thread.replies.push(newReply);
    thread.lastActivity = new Date().toISOString();

    return newReply;
  }

  // ===== SEARCH ENDPOINT =====

  async search(query, filters = {}) {
    const {
      type = 'all', // 'all', 'articles', 'forum'
      category = null,
      dateFrom = null,
      dateTo = null,
      limit = 20
    } = filters;

    await this.delay(300 + Math.random() * 400);

    if (!query || query.trim().length < 2) {
      return { data: [], meta: { total: 0 } };
    }

    const searchTerm = query.toLowerCase().trim();
    let results = [];

    // Recherche dans les articles
    if (type === 'all' || type === 'articles') {
      const articleResults = this.articles
        .filter(article => {
          const searchableText = `${article.title} ${article.excerpt} ${article.content} ${article.tags.join(' ')}`.toLowerCase();
          return searchableText.includes(searchTerm);
        })
        .map(article => ({
          id: article.id,
          type: 'article',
          title: article.title,
          excerpt: article.excerpt,
          url: `/article.html?id=${article.id}`,
          category: article.category,
          publishedAt: article.publishedAt,
          author: article.author,
          image: article.image
        }));

      results.push(...articleResults);
    }

    // Recherche dans le forum
    if (type === 'all' || type === 'forum') {
      const forumResults = this.forumThreads
        .filter(thread => {
          const searchableText = `${thread.title} ${thread.content}`.toLowerCase();
          return searchableText.includes(searchTerm);
        })
        .map(thread => ({
          id: thread.id,
          type: 'forum',
          title: thread.title,
          excerpt: thread.content.substring(0, 150) + '...',
          url: `/forum-thread.html?id=${thread.id}`,
          category: thread.category,
          publishedAt: thread.createdAt,
          author: thread.author,
          replies: thread.replies || 0
        }));

      results.push(...forumResults);
    }

    // Filtrage par catégorie
    if (category) {
      results = results.filter(result => result.category === category);
    }

    // Filtrage par date
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      results = results.filter(result => new Date(result.publishedAt) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      results = results.filter(result => new Date(result.publishedAt) <= toDate);
    }

    // Tri par pertinence (simplifié)
    results.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, searchTerm);
      const bScore = this.calculateRelevanceScore(b, searchTerm);
      return bScore - aScore;
    });

    return {
      data: results.slice(0, limit),
      meta: {
        total: results.length,
        query,
        filters
      }
    };
  }

  calculateRelevanceScore(item, searchTerm) {
    let score = 0;
    const title = item.title.toLowerCase();
    const excerpt = item.excerpt.toLowerCase();

    // Score plus élevé si le terme est dans le titre
    if (title.includes(searchTerm)) score += 10;

    // Score pour la proximité du terme dans l'extrait
    if (excerpt.includes(searchTerm)) score += 5;

    // Score basé sur la longueur (privilégier les titres courts)
    score += Math.max(0, 50 - title.length) / 10;

    return score;
  }

  // ===== RATINGS & COMMENTS =====

  async rateArticle(articleId, rating, userId = 'anonymous') {
    await this.delay(150);

    const article = this.articles.find(a => a.id === parseInt(articleId));
    if (!article) {
      throw new Error('Article not found');
    }

    if (!article.ratings) article.ratings = [];

    // Supprimer l'ancienne note de cet utilisateur
    article.ratings = article.ratings.filter(r => r.userId !== userId);

    // Ajouter la nouvelle note
    article.ratings.push({
      userId,
      rating,
      timestamp: new Date().toISOString()
    });

    // Recalculer la moyenne
    const totalRating = article.ratings.reduce((sum, r) => sum + r.rating, 0);
    article.rating = totalRating / article.ratings.length;
    article.reviewCount = article.ratings.length;

    return {
      articleId: parseInt(articleId),
      userRating: rating,
      averageRating: article.rating,
      totalRatings: article.reviewCount
    };
  }

  async addComment(articleId, commentData) {
    await this.delay(200 + Math.random() * 150);

    const article = this.articles.find(a => a.id === parseInt(articleId));
    if (!article) {
      throw new Error('Article not found');
    }

    const newComment = {
      id: Date.now(),
      articleId: parseInt(articleId),
      author: commentData.author,
      content: commentData.content,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: []
    };

    this.comments.push(newComment);

    return newComment;
  }

  async likeComment(commentId, userId = 'anonymous') {
    await this.delay(100);

    const comment = this.comments.find(c => c.id === parseInt(commentId));
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (!comment.likedBy) comment.likedBy = [];

    if (!comment.likedBy.includes(userId)) {
      comment.likedBy.push(userId);
      comment.likes += 1;
    }

    return { commentId: parseInt(commentId), likes: comment.likes };
  }

  // ===== NEWSLETTER =====

  async subscribeNewsletter(email, preferences = {}) {
    await this.delay(300 + Math.random() * 200);

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email address');
    }

    // Vérifier si déjà inscrit
    const existing = this.newsletter.subscribers.find(s => s.email === email);
    if (existing) {
      throw new Error('Email already subscribed');
    }

    const subscriber = {
      id: Date.now(),
      email,
      preferences: {
        frequency: 'daily',
        categories: ['politique', 'economie', 'culture'],
        ...preferences
      },
      subscribedAt: new Date().toISOString(),
      confirmed: false
    };

    this.newsletter.subscribers.push(subscriber);

    return {
      success: true,
      message: 'Successfully subscribed to newsletter',
      subscriberId: subscriber.id
    };
  }

  // ===== STATISTICS =====

  async getStats() {
    await this.delay(100);

    return {
      articles: {
        total: this.articles.length,
        byCategory: this.getStatsByCategory(),
        totalViews: this.articles.reduce((sum, a) => sum + a.views, 0),
        averageRating: this.articles.reduce((sum, a) => sum + a.rating, 0) / this.articles.length
      },
      forum: {
        totalThreads: this.forumThreads.length,
        totalReplies: this.forumThreads.reduce((sum, t) => sum + (t.replies?.length || 0), 0),
        byCategory: this.getForumStatsByCategory()
      },
      newsletter: {
        subscribers: this.newsletter.subscribers.length
      }
    };
  }

  getStatsByCategory() {
    const stats = {};
    this.categories.forEach(cat => {
      stats[cat.id] = this.articles.filter(a => a.category === cat.id).length;
    });
    return stats;
  }

  getForumStatsByCategory() {
    const stats = {};
    this.categories.forEach(cat => {
      stats[cat.id] = this.forumThreads.filter(t => t.category === cat.id).length;
    });
    return stats;
  }

  // ===== UTILITIES =====

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cache management
  setCache(key, data, ttl = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  // Error simulation (for testing)
  simulateError(endpoint, probability = 0.1) {
    if (Math.random() < probability) {
      throw new Error(`Simulated error in ${endpoint}`);
    }
  }

  // ===== DATA GENERATION =====

  generateBenineseArticles(count) {
    const articles = [];
    const categories = this.getBenineseCategories();

    for (let i = 1; i <= count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const author = this.authors[Math.floor(Math.random() * this.authors.length)];

      articles.push({
        id: i,
        title: this.getBenineseArticleTitle(category.id, i),
        excerpt: this.getBenineseArticleExcerpt(category.id),
        content: this.getBenineseArticleContent(category.id),
        author: author.name,
        authorAvatar: author.avatar,
        category: category.id,
        tags: this.getBenineseTags(category.id),
        image: this.getBenineseArticleImage(category.id),
        publishedAt: this.getRandomDate(),
        updatedAt: this.getRandomDate(),
        views: Math.floor(Math.random() * 5000) + 100,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
        reviewCount: Math.floor(Math.random() * 50) + 1,
        featured: Math.random() < 0.2, // 20% featured
        ratings: []
      });
    }

    return articles;
  }

  getBenineseCategories() {
    return [
      {
        id: 'politique',
        name: 'Politique',
        description: 'Actualités politiques du Bénin',
        color: '#FE0202',
        icon: '🏛️'
      },
      {
        id: 'economie',
        name: 'Économie',
        description: 'Économie et développement au Bénin',
        color: '#4CAF50',
        icon: '💰'
      },
      {
        id: 'sport',
        name: 'Sport',
        description: 'Sport national et international',
        color: '#FF9800',
        icon: '⚽'
      },
      {
        id: 'culture',
        name: 'Culture',
        description: 'Culture et traditions béninoises',
        color: '#9C27B0',
        icon: '🎭'
      },
      {
        id: 'tech',
        name: 'Technologie',
        description: 'Innovation et technologie',
        color: '#2196F3',
        icon: '💻'
      }
    ];
  }

  generateBenineseAuthors(count) {
    const names = [
      'Marie KPOGNON', 'Jean-Baptiste HOUNKPE', 'Aïchatou ADJOVI',
      'François AKPAKA', 'Victoire DOSSOU', 'Emmanuel ZINNOU',
      'Christelle HOUNGUE', 'Patrick AHOUANSOU', 'Isabelle HOUNGNIBO',
      'Théodore AGBODJINOU', 'Laurence ADJINACOU', 'Raphaël DOSSOU',
      'Sophie TCHEGNON', 'Alain HOUNTONDJI', 'Nathalie AHOUANVOEDO',
      'Benoît ASSOGBA', 'Carine DOSSOU', 'Didier HOUNGNIBO',
      'Émilie AGBO', 'Frédéric DOSSOU', 'Gabrielle HOUNKPE',
      'Henri ADJOVI', 'Isabelle TCHEGNON', 'Joseph AGBODJINOU'
    ];

    return names.slice(0, count).map((name, index) => ({
      id: index + 1,
      name,
      avatar: `/images/authors/author-${(index % 5) + 1}.jpg`,
      bio: `Journaliste spécialisé${name.includes('Marie') || name.includes('Victoire') ? 'e' : ''} en actualités béninoises`,
      articlesCount: Math.floor(Math.random() * 20) + 5
    }));
  }

  generateBenineseForumData() {
    const threads = [];
    const categories = ['politique', 'economie', 'sport', 'culture', 'tech'];

    for (let i = 1; i <= 30; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const author = this.authors[Math.floor(Math.random() * this.authors.length)];

      threads.push({
        id: i,
        title: this.getBenineseForumTitle(category, i),
        content: this.getBenineseForumContent(category),
        author: author.name,
        authorAvatar: author.avatar,
        category,
        createdAt: this.getRandomDate(),
        lastActivity: this.getRandomDate(),
        replies: Math.floor(Math.random() * 15),
        views: Math.floor(Math.random() * 200) + 10,
        pinned: Math.random() < 0.1,
        locked: Math.random() < 0.05,
        tags: this.getBenineseForumTags(category)
      });
    }

    return threads;
  }

  generateCommentsData() {
    const comments = [];

    this.articles.forEach(article => {
      const commentCount = Math.floor(Math.random() * 10) + 1;

      for (let i = 0; i < commentCount; i++) {
        const author = this.authors[Math.floor(Math.random() * this.authors.length)];

        comments.push({
          id: `${article.id}-${i + 1}`,
          articleId: article.id,
          author: author.name,
          authorAvatar: author.avatar,
          content: this.getBenineseComment(),
          createdAt: this.getRandomDate(),
          likes: Math.floor(Math.random() * 20),
          likedBy: []
        });
      }
    });

    return comments;
  }

  generateNewsletterData() {
    return {
      subscribers: [],
      campaigns: []
    };
  }

  buildSearchIndex() {
    // Indexation simple pour la recherche
    return {
      articles: this.articles.map(a => ({
        id: a.id,
        text: `${a.title} ${a.excerpt} ${a.content} ${a.tags.join(' ')}`.toLowerCase()
      })),
      forum: this.forumThreads.map(t => ({
        id: t.id,
        text: `${t.title} ${t.content}`.toLowerCase()
      }))
    };
  }

  // ===== BENINESE DATA HELPERS =====

  getBenineseArticleTitle(category, index) {
    const titles = {
      politique: [
        'Nouveau gouvernement formé : Patrice Talon nomme ses ministres',
        'Assemblée nationale : Débat houleux sur la réforme constitutionnelle',
        'Élections municipales 2025 : Préparatifs en cours à Cotonou',
        'Visite du président français : Renforcement des liens bilatéraux',
        'Lutte contre la corruption : Nouvelles mesures annoncées',
        'Développement régional : Focus sur le département du Zou',
        'Politique agricole : Vers une souveraineté alimentaire',
        'Réforme de l\'éducation : Les enseignants manifestent'
      ],
      economie: [
        'PIB béninois : Croissance de 6,8% au premier trimestre',
        'Port de Cotonou : Nouveaux investissements chinois',
        'Agriculture : Bonne campagne arachidière malgré la sécheresse',
        'Tourisme : Record de visiteurs au Palais de la Marina',
        'Entrepreneuriat : Boom des startups à Cotonou',
        'Commerce extérieur : Excédent commercial historique',
        'Emploi : Baisse du chômage chez les jeunes',
        'Inflation maîtrisée : Banque centrale salue la politique monétaire'
      ],
      sport: [
        'Équipe nationale : Victoire historique contre le Maroc en CAN',
        'Basketball : L\'AS Police remporte le championnat national',
        'Athlétisme : Record national battu au 100m',
        'Football féminin : Les Écureuils dames brillent en Afrique',
        'Tennis : Victoire de l\'équipe béninoise en Coupe Davis',
        'Handball : Médailles d\'or aux Jeux de la Francophonie',
        'Natation : Nouveaux talents émergent à Cotonou',
        'Cyclisme : Victoire au Tour du Bénin'
      ],
      culture: [
        'Festival international d\'Ouidah : Plus de 50 000 visiteurs attendus',
        'Cinéma béninois : Succès du film "La Vie en Relief"',
        'Musique : Album d\'Angélique Kidjo certifié disque d\'or',
        'Littérature : Nouveau roman primé à la Foire du livre',
        'Art contemporain : Exposition à la Galerie Cotonou',
        'Théâtre : Pièce sur l\'histoire du royaume d\'Abomey',
        'Danse traditionnelle : Festival des rythmes sacrés',
        'Cuisine béninoise : Reconnaissance UNESCO pour le repas royal'
      ],
      tech: [
        'Intelligence artificielle : Nouveau centre de formation à Porto-Novo',
        'Télécommunications : 5G déployée dans les grandes villes',
        'E-commerce : Boom des ventes en ligne pendant la pandémie',
        'Éducation numérique : Tablettes distribuées aux écoles',
        'Agriculture connectée : Drones pour surveiller les cultures',
        'Fintech : Applications mobiles de paiement en plein essor',
        'Cybersécurité : Formation des jeunes développeurs',
        'Innovation : Concours national des startups'
      ]
    };

    return titles[category][index % titles[category].length];
  }

  getBenineseArticleExcerpt(category) {
    const excerpts = {
      politique: 'Le président Patrice Talon a annoncé la composition de son nouveau gouvernement après plusieurs semaines de consultations. Découvrez les principales nominations et les défis qui attendent l\'équipe gouvernementale.',
      economie: 'Le Bureau national du recensement économique et social (BNRES) vient de publier les chiffres du premier trimestre 2025, révélant une croissance économique solide malgré le contexte international.',
      sport: 'Les Écureuils du Bénin ont créé la sensation en s\'imposant face au Maroc lors de la Coupe d\'Afrique des Nations, offrant une victoire historique au football béninois.',
      culture: 'Le Festival international d\'Ouidah, rendez-vous incontournable de la culture voodoo et des arts traditionnels, s\'annonce exceptionnel cette année avec plus de 50 000 visiteurs attendus.',
      tech: 'Le gouvernement béninois lance un vaste programme de formation en intelligence artificielle, avec l\'ouverture d\'un centre de formation de pointe à Porto-Novo.'
    };

    return excerpts[category];
  }

  getBenineseArticleContent(category) {
    // Contenu détaillé pour chaque catégorie
    const contents = {
      politique: `Le président Patrice Talon a enfin levé le voile sur la composition de son nouveau gouvernement. Après plusieurs semaines de consultations intenses avec les différents acteurs politiques du Bénin, le chef de l'État a nommé une équipe resserrée de 24 ministres.

Les principales nominations incluent :

- **Premier ministre** : Lionel Zinsou, reconduit dans ses fonctions
- **Ministre des Affaires étrangères** : Aurélie Adam Soulé Zoumarou
- **Ministre de l'Économie et des Finances** : Romuald Wadagni
- **Ministre de l'Agriculture** : Gaston Dossouhoui

Cette équipe gouvernementale devra faire face à plusieurs défis majeurs : la poursuite des réformes économiques, la lutte contre la corruption, et la préparation des élections municipales de 2025.

Les observateurs politiques notent une continuité dans la politique de développement prônée par le président Talon, avec un accent particulier sur l'agriculture et l'entrepreneuriat.`,
      economie: `Le Bureau national du recensement économique et social (BNRES) vient de publier son rapport trimestriel, révélant une croissance économique de 6,8% au premier trimestre 2025. Ce chiffre dépasse largement les prévisions des analystes qui tablaient sur 5,2%.

Les secteurs porteurs de cette croissance sont :

1. **L'agriculture** : +8,2% grâce à une campagne arachidière exceptionnelle
2. **Le commerce extérieur** : +12,5% avec de nouveaux marchés en Afrique de l'Ouest
3. **Le tourisme** : +15,3% boosté par le Festival d'Ouidah
4. **Les services** : +5,7% tirés par le numérique

Le ministre de l'Économie s'est félicité de ces résultats, soulignant que "le Bénin est sur la bonne voie pour atteindre son objectif de croissance à deux chiffres d'ici 2026".`,
      sport: `Les Écureuils du Bénin ont créé l'exploit en s'imposant 2-1 face au Maroc lors de leur premier match de la Coupe d'Afrique des Nations. Cette victoire historique propulse l'équipe béninoise en tête de son groupe.

Le sélectionneur national, Michel Dussuyer, a salué la performance de ses joueurs : "C'est le fruit d'un travail collectif exceptionnel. Nos jeunes talents ont montré une maturité remarquable."

Les buteurs de la rencontre :
- Steve Mounié (45e minute)
- Jodel Dossou (78e minute)

Cette victoire renforce la confiance de tout un pays et ouvre de belles perspectives pour la suite de la compétition.`,
      culture: `Le Festival international d'Ouidah, qui se déroule chaque année pendant la période des fêtes de fin d'année, s'annonce exceptionnel pour cette édition 2025. Plus de 50 000 visiteurs sont attendus pour célébrer la culture voodoo et les arts traditionnels béninois.

Le programme riche inclut :
- Des cérémonies rituelles au Temple des Pythons
- Des concerts de musique traditionnelle
- Des expositions d'art contemporain
- Des conférences sur l'histoire du royaume d'Abomey

Le ministre de la Culture a déclaré : "Ce festival est l'occasion de montrer au monde la richesse de notre patrimoine culturel et spirituel."`,
      tech: `Le gouvernement béninois vient d'inaugurer un centre de formation en intelligence artificielle à Porto-Novo. Ce projet ambitieux, financé par la Banque mondiale et l'Union européenne, vise à former 500 jeunes développeurs d'ici 2027.

Le centre est équipé :
- De serveurs haute performance
- De stations de travail dernier cri
- De laboratoires de recherche
- D'espaces de coworking

Le ministre de l'Enseignement supérieur s'est félicité de cette initiative : "L'IA représente l'avenir de notre économie. Nous devons préparer nos jeunes à relever les défis de demain."`
    };

    return contents[category];
  }

  getBenineseTags(category) {
    const tagSets = {
      politique: ['gouvernement', 'patrice-talon', 'réformes', 'développement', 'bénin'],
      economie: ['croissance', 'investissement', 'agriculture', 'commerce', 'développement'],
      sport: ['football', 'équipe-nationale', 'victoire', 'can', 'sport-béninois'],
      culture: ['festival', 'ouidah', 'traditions', 'art', 'culture-béninoise'],
      tech: ['ia', 'formation', 'innovation', 'développement', 'technologie']
    };

    return tagSets[category];
  }

  getBenineseArticleImage(category) {
    const images = {
      politique: '/images/articles/gouvernement-talon.jpg',
      economie: '/images/articles/croissance-economique.jpg',
      sport: '/images/articles/equipe-nationale.jpg',
      culture: '/images/articles/festival-ouidah.jpg',
      tech: '/images/articles/centre-ia.jpg'
    };

    return images[category];
  }

  getBenineseForumTitle(category, index) {
    const titles = {
      politique: [
        'Que pensez-vous des nouvelles réformes constitutionnelles ?',
        'Élections 2025 : Qui sont les candidats potentiels ?',
        'La politique agricole du gouvernement : efficace ou insuffisante ?',
        'Corruption : Comment améliorer la gouvernance au Bénin ?'
      ],
      economie: [
        'Le port de Cotonou : moteur de développement ou frein ?',
        'Entrepreneuriat au Bénin : difficultés et opportunités',
        'Tourisme : comment attirer plus de visiteurs étrangers ?',
        'Agriculture : vers une souveraineté alimentaire réelle ?'
      ],
      sport: [
        'CAN 2025 : pronostics pour l\'équipe du Bénin',
        'Football féminin : pourquoi si peu de soutien ?',
        'Infrastructures sportives : priorité nationale ?',
        'Formation des jeunes sportifs : état des lieux'
      ],
      culture: [
        'Festival d\'Ouidah : tradition ou folklore touristique ?',
        'Langues nationales : faut-il les promouvoir davantage ?',
        'Cinéma béninois : quel avenir pour notre 7ème art ?',
        'Artisanat : comment valoriser nos savoir-faire ?'
      ],
      tech: [
        '5G au Bénin : quand sera-t-elle disponible partout ?',
        'Cybersécurité : sommes-nous prêts face aux menaces ?',
        'E-commerce : les défis de la livraison au Bénin',
        'Formation tech : comment intéresser les jeunes filles ?'
      ]
    };

    return titles[category][index % titles[category].length];
  }

  getBenineseForumContent(category) {
    const contents = {
      politique: 'Je m\'interroge sur l\'impact réel des réformes constitutionnelles proposées par le gouvernement. Pensez-vous qu\'elles vont réellement améliorer la gouvernance et renforcer la démocratie au Bénin ? Quels sont les points forts et les faiblesses de ces propositions ?',
      economie: 'Le secteur économique béninois montre des signes encourageants, mais de nombreux défis persistent. Comment pouvons-nous mieux valoriser notre position géographique stratégique et développer notre tissu entrepreneurial ?',
      sport: 'Le sport béninois a connu des succès remarquables ces dernières années. Cependant, il reste beaucoup à faire en termes d\'infrastructures et de formation. Quelles sont vos priorités pour développer le sport national ?',
      culture: 'Notre culture est l\'une de nos plus grandes richesses. Comment pouvons-nous mieux la promouvoir à l\'international tout en la préservant de la folklorisation excessive ? Le Festival d\'Ouidah est-il un bon exemple de valorisation culturelle ?',
      tech: 'Le secteur technologique béninois est en plein essor. Avec le déploiement de la 5G et l\'ouverture de centres de formation, l\'avenir s\'annonce prometteur. Quels sont les secteurs tech les plus porteurs pour notre pays ?'
    };

    return contents[category];
  }

  getBenineseForumTags(category) {
    const tagSets = {
      politique: ['réformes', 'démocratie', 'gouvernance'],
      economie: ['développement', 'entrepreneuriat', 'commerce'],
      sport: ['football', 'formation', 'infrastructures'],
      culture: ['traditions', 'promotion', 'patrimoine'],
      tech: ['innovation', 'formation', 'digital']
    };

    return tagSets[category];
  }

  getBenineseComment() {
    const comments = [
      'Article très intéressant, merci pour cette analyse approfondie.',
      'Je suis d\'accord avec vos conclusions, mais il faudrait aussi mentionner...',
      'Excellente couverture de l\'actualité ! Continuez comme ça.',
      'Cet article soulève des questions importantes pour notre société.',
      'Bravo pour la qualité de l\'information et l\'objectivité du traitement.',
      'Je partage complètement votre point de vue sur ce sujet.',
      'Merci d\'avoir abordé cet aspect souvent négligé de l\'actualité.',
      'Votre analyse est pertinente et bien documentée.',
      'Cet article mérite d\'être largement partagé.',
      'Félicitations pour ce travail journalistique de qualité.'
    ];

    return comments[Math.floor(Math.random() * comments.length)];
  }

  getRandomDate() {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 365);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString();
  }
}

// Fonction pour initialiser l'API mock
export function initMockAPI(options = {}) {
  const api = new MockAPI(options);

  // Exposer globalement
  window.mockAPI = api;

  return api;
}

// Fonctions utilitaires pour l'intégration
export async function fetchArticles(params = {}) {
  if (!window.mockAPI) {
    initMockAPI();
  }

  try {
    const response = await window.mockAPI.getArticles(params);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function fetchArticle(id) {
  if (!window.mockAPI) {
    initMockAPI();
  }

  try {
    const article = await window.mockAPI.getArticle(id);
    return article;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function searchArticles(query, filters = {}) {
  if (!window.mockAPI) {
    initMockAPI();
  }

  try {
    const results = await window.mockAPI.search(query, { ...filters, type: 'articles' });
    return results;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function rateArticle(articleId, rating) {
  if (!window.mockAPI) {
    initMockAPI();
  }

  try {
    const result = await window.mockAPI.rateArticle(articleId, rating);
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Export de la classe pour utilisation avancée
export { MockAPI };
