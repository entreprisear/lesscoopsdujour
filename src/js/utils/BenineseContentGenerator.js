/**
 * Générateur de contenu béninois pour les recommandations
 * Crée des données d'articles et d'utilisateurs représentatifs du Bénin
 */
class BenineseContentGenerator {
  constructor() {
    this.categories = {
      'économie': {
        icon: '💰',
        keywords: ['investissement', 'croissance', 'entreprise', 'startup', 'développement'],
        weight: 1.2
      },
      'politique': {
        icon: '🏛️',
        keywords: ['gouvernement', 'réforme', 'développement', 'institution', 'démocratie'],
        weight: 1.0
      },
      'culture': {
        icon: '🎭',
        keywords: ['tradition', 'art', 'musique', 'danse', 'festival', 'patrimoine'],
        weight: 1.3
      },
      'sport': {
        icon: '⚽',
        keywords: ['football', 'basketball', 'athlétisme', 'olympique', 'compétition'],
        weight: 1.1
      },
      'éducation': {
        icon: '📚',
        keywords: ['université', 'formation', 'enseignement', 'recherche', 'innovation'],
        weight: 1.4
      },
      'agriculture': {
        icon: '🌾',
        keywords: ['coton', 'anacarde', 'riz', 'maïs', 'transformation', 'export'],
        weight: 1.2
      },
      'technologie': {
        icon: '💻',
        keywords: ['digital', 'innovation', 'startup', 'intelligence artificielle', 'e-commerce'],
        weight: 1.5
      },
      'santé': {
        icon: '🏥',
        keywords: ['médecine', 'hôpital', 'prévention', 'vaccination', 'bien-être'],
        weight: 1.1
      },
      'tourisme': {
        icon: '🏖️',
        keywords: ['lac ahémé', 'parc w', 'cotonou', 'porto-novo', 'villages touristiques'],
        weight: 1.0
      },
      'entrepreneuriat': {
        icon: '🚀',
        keywords: ['business', 'startup', 'innovation', 'investissement', 'succès'],
        weight: 1.6
      }
    };

    this.authors = this.generateAuthors();
    this.articles = this.generateArticles();
    this.users = this.generateUsers();
  }

  /**
   * Génère des auteurs béninois représentatifs
   */
  generateAuthors() {
    return [
      {
        id: 'author_1',
        name: 'Dr. Marie KPOGNON',
        avatar: '👩‍⚕️',
        bio: 'Médecin et chercheuse en santé publique',
        expertise: ['santé', 'éducation'],
        location: 'Cotonou',
        articlesCount: 45,
        followers: 1250
      },
      {
        id: 'author_2',
        name: 'Prof. Jean-Baptiste HOUNKPE',
        avatar: '👨‍🏫',
        bio: 'Économiste spécialisé dans le développement durable',
        expertise: ['économie', 'agriculture', 'développement'],
        location: 'Porto-Novo',
        articlesCount: 67,
        followers: 2100
      },
      {
        id: 'author_3',
        name: 'Amina TOHOUEGNON',
        avatar: '👩‍💼',
        bio: 'Entrepreneure et fondatrice de startups technologiques',
        expertise: ['technologie', 'entrepreneuriat', 'innovation'],
        location: 'Cotonou',
        articlesCount: 38,
        followers: 890
      },
      {
        id: 'author_4',
        name: 'Kofi ADJOVI',
        avatar: '👨‍🎨',
        bio: 'Artiste et conservateur du patrimoine culturel',
        expertise: ['culture', 'tourisme', 'patrimoine'],
        location: 'Ouidah',
        articlesCount: 29,
        followers: 650
      },
      {
        id: 'author_5',
        name: 'Dr. Fatima ALASSANI',
        avatar: '👩‍🔬',
        bio: 'Chercheuse en agriculture et développement rural',
        expertise: ['agriculture', 'développement', 'économie'],
        location: 'Parakou',
        articlesCount: 52,
        followers: 1450
      },
      {
        id: 'author_6',
        name: 'Marcus DOSSOU',
        avatar: '👨‍⚽',
        bio: 'Journaliste sportif et commentateur',
        expertise: ['sport', 'jeunesse', 'éducation'],
        location: 'Cotonou',
        articlesCount: 41,
        followers: 980
      },
      {
        id: 'author_7',
        name: 'Émilie HOUNGUE',
        avatar: '👩‍🎓',
        bio: 'Enseignante et formatrice en technologies éducatives',
        expertise: ['éducation', 'technologie', 'innovation'],
        location: 'Abomey-Calavi',
        articlesCount: 33,
        followers: 720
      },
      {
        id: 'author_8',
        name: 'Dr. Paul AHOUANSOU',
        avatar: '👨‍💼',
        bio: 'Consultant en développement économique et politique',
        expertise: ['politique', 'économie', 'développement'],
        location: 'Porto-Novo',
        articlesCount: 58,
        followers: 1680
      }
    ];
  }

  /**
   * Génère des articles représentatifs du Bénin
   */
  generateArticles() {
    const articles = [];
    const now = Date.now();
    let articleId = 1;

    // Articles sur l'économie et l'entrepreneuriat
    articles.push({
      id: `article_${articleId++}`,
      title: 'La révolution des startups au Bénin : Cotonou, hub technologique d\'Afrique de l\'Ouest',
      content: 'Le Bénin se positionne comme un acteur majeur dans l\'écosystème startup africain. Avec plus de 150 startups créées ces trois dernières années, Cotonou attire investisseurs et talents du continent.',
      excerpt: 'Découvrez comment le Bénin devient un hub technologique incontournable en Afrique de l\'Ouest.',
      category: 'technologie',
      author: 'author_3',
      publishedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      readingTime: 8,
      views: 2450,
      likes: 89,
      comments: 23,
      shares: 45,
      tags: ['startup', 'technologie', 'investissement', 'cotonou'],
      image: 'https://via.placeholder.com/600x400/2196F3/white?text=Startups+Bénin',
      featured: true,
      benineseRelevance: 0.95
    });

    articles.push({
      id: `article_${articleId++}`,
      title: 'Le coton béninois : Une filière en pleine transformation',
      content: 'La filière coton représente 40% des recettes d\'exportation du Bénin. Découvrez les innovations qui transforment cette industrie traditionnelle en un secteur moderne et durable.',
      excerpt: 'Comment le Bénin modernise sa filière coton pour rester compétitif sur les marchés mondiaux.',
      category: 'agriculture',
      author: 'author_5',
      publishedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      readingTime: 6,
      views: 1890,
      likes: 67,
      comments: 18,
      shares: 32,
      tags: ['coton', 'agriculture', 'export', 'transformation'],
      image: 'https://via.placeholder.com/600x400/4CAF50/white?text=Coton+Bénin',
      featured: false,
      benineseRelevance: 0.98
    });

    // Articles sur la culture et le tourisme
    articles.push({
      id: `article_${articleId++}`,
      title: 'Les festivals culturels du Bénin : Entre tradition et modernité',
      content: 'Du Festival International de la Danse d\'Ouidah aux cérémonies vodoun d\'Abomey, découvrez la richesse culturelle du Bénin qui séduit touristes du monde entier.',
      excerpt: 'Un voyage à travers les festivals qui font la réputation culturelle du Bénin.',
      category: 'culture',
      author: 'author_4',
      publishedAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
      readingTime: 7,
      views: 3120,
      likes: 124,
      comments: 35,
      shares: 67,
      tags: ['festival', 'culture', 'tourisme', 'tradition'],
      image: 'https://via.placeholder.com/600x400/FF9800/white?text=Festivals+Bénin',
      featured: true,
      benineseRelevance: 0.92
    });

    // Articles sur l'éducation
    articles.push({
      id: `article_${articleId++}`,
      title: 'L\'Université d\'Abomey-Calavi : Excellence académique et innovation',
      content: 'Avec plus de 50 000 étudiants, l\'UAC est le plus grand établissement d\'enseignement supérieur du Bénin. Découvrez ses programmes innovants et son rôle dans le développement national.',
      excerpt: 'L\'UAC, fer de lance de l\'excellence académique au Bénin.',
      category: 'éducation',
      author: 'author_7',
      publishedAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      readingTime: 5,
      views: 1650,
      likes: 78,
      comments: 29,
      shares: 41,
      tags: ['université', 'éducation', 'recherche', 'innovation'],
      image: 'https://via.placeholder.com/600x400/3F51B5/white?text=UAC+Bénin',
      featured: false,
      benineseRelevance: 0.96
    });

    // Articles sur la santé
    articles.push({
      id: `article_${articleId++}`,
      title: 'La télémédecine au Bénin : Révolutionner l\'accès aux soins',
      content: 'Face aux défis de l\'accessibilité géographique, le Bénin investit massivement dans la télémédecine. Découvrez comment cette technologie transforme les soins de santé dans les zones rurales.',
      excerpt: 'Comment la télémédecine améliore l\'accès aux soins dans tout le Bénin.',
      category: 'santé',
      author: 'author_1',
      publishedAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
      readingTime: 6,
      views: 2230,
      likes: 95,
      comments: 31,
      shares: 52,
      tags: ['télémédecine', 'santé', 'innovation', 'accessibilité'],
      image: 'https://via.placeholder.com/600x400/E91E63/white?text=Télémédecine+Bénin',
      featured: false,
      benineseRelevance: 0.94
    });

    // Articles sur le sport
    articles.push({
      id: `article_${articleId++}`,
      title: 'Le football béninois : De l\'Étoile Filante à la CAN 2019',
      content: 'Du mythique Étoile Filante de Lomé aux performances de l\'équipe nationale à la CAN 2019, retracez l\'histoire glorieuse du football béninois.',
      excerpt: 'L\'histoire riche et passionnante du football au Bénin.',
      category: 'sport',
      author: 'author_6',
      publishedAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
      readingTime: 9,
      views: 2890,
      likes: 156,
      comments: 42,
      shares: 78,
      tags: ['football', 'sport', 'équipe nationale', 'histoire'],
      image: 'https://via.placeholder.com/600x400/4CAF50/white?text=Football+Bénin',
      featured: true,
      benineseRelevance: 0.97
    });

    // Articles sur la politique et le développement
    articles.push({
      id: `article_${articleId++}`,
      title: 'Le Programme d\'Action du Gouvernement : Vers un Bénin émergent',
      content: 'Le PAG 2016-2021 a transformé le Bénin. Découvrez les réalisations majeures et les perspectives pour l\'émergence économique du pays.',
      excerpt: 'Les transformations économiques et sociales du Bénin sous le PAG.',
      category: 'politique',
      author: 'author_8',
      publishedAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
      readingTime: 10,
      views: 3450,
      likes: 203,
      comments: 67,
      shares: 89,
      tags: ['développement', 'politique', 'économie', 'emergence'],
      image: 'https://via.placeholder.com/600x400/2196F3/white?text=PAG+Bénin',
      featured: true,
      benineseRelevance: 0.99
    });

    // Articles sur l'entrepreneuriat
    articles.push({
      id: `article_${articleId++}`,
      title: 'Les success stories des entrepreneurs béninois',
      content: 'De la transformation du karité à l\'e-commerce, découvrez les parcours inspirants d\'entrepreneurs béninois qui ont réussi à l\'international.',
      excerpt: 'Des histoires de réussite qui inspirent toute une génération d\'entrepreneurs.',
      category: 'entrepreneuriat',
      author: 'author_3',
      publishedAt: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
      readingTime: 7,
      views: 2780,
      likes: 134,
      comments: 38,
      shares: 56,
      tags: ['entrepreneuriat', 'success', 'innovation', 'inspiration'],
      image: 'https://via.placeholder.com/600x400/FFC107/white?text=Entrepreneurs+Bénin',
      featured: false,
      benineseRelevance: 0.93
    });

    // Articles sur le tourisme
    articles.push({
      id: `article_${articleId++}`,
      title: 'Le Parc National de la Pendjari : Joyau écologique du Bénin',
      content: 'Avec ses éléphants, lions et paysages spectaculaires, le Parc de la Pendjari est l\'une des destinations safari les plus prisées d\'Afrique de l\'Ouest.',
      excerpt: 'Découvrez la biodiversité exceptionnelle du Parc National de la Pendjari.',
      category: 'tourisme',
      author: 'author_4',
      publishedAt: new Date(now - 9 * 24 * 60 * 60 * 1000).toISOString(),
      readingTime: 5,
      views: 1980,
      likes: 87,
      comments: 24,
      shares: 43,
      tags: ['parc', 'tourisme', 'nature', 'safari'],
      image: 'https://via.placeholder.com/600x400/4CAF50/white?text=Parc+Pendjari',
      featured: false,
      benineseRelevance: 0.91
    });

    // Générer plus d'articles automatiquement
    for (let i = 0; i < 20; i++) {
      const categoryKeys = Object.keys(this.categories);
      const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
      const category = this.categories[randomCategory];

      articles.push({
        id: `article_${articleId++}`,
        title: this.generateArticleTitle(randomCategory),
        content: this.generateArticleContent(randomCategory),
        excerpt: this.generateArticleExcerpt(randomCategory),
        category: randomCategory,
        author: this.authors[Math.floor(Math.random() * this.authors.length)].id,
        publishedAt: new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        readingTime: Math.floor(Math.random() * 10) + 3,
        views: Math.floor(Math.random() * 2000) + 500,
        likes: Math.floor(Math.random() * 100) + 10,
        comments: Math.floor(Math.random() * 30) + 5,
        shares: Math.floor(Math.random() * 50) + 5,
        tags: this.generateTags(randomCategory),
        image: `https://via.placeholder.com/600x400/${this.getCategoryColor(randomCategory)}/white?text=${randomCategory}`,
        featured: Math.random() < 0.2,
        benineseRelevance: 0.85 + Math.random() * 0.15
      });
    }

    return articles;
  }

  /**
   * Génère des utilisateurs représentatifs
   */
  generateUsers() {
    const users = [];
    const now = Date.now();

    for (let i = 1; i <= 50; i++) {
      const userId = `user_${i}`;
      const behavior = this.generateUserBehavior(userId);

      users.push({
        id: userId,
        name: this.generateUserName(),
        email: `user${i}@benin.com`,
        location: this.getRandomLocation(),
        joinDate: new Date(now - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        preferences: this.generateUserPreferences(),
        behavior: behavior,
        stats: {
          articlesRead: behavior.viewedArticles?.length || 0,
          commentsPosted: Math.floor(Math.random() * 20),
          articlesShared: Math.floor(Math.random() * 15),
          following: Math.floor(Math.random() * 50) + 5
        }
      });
    }

    return users;
  }

  /**
   * Génère le comportement d'un utilisateur
   */
  generateUserBehavior(userId) {
    const behavior = {
      interactions: [],
      viewedArticles: [],
      searchHistory: [],
      preferences: {},
      lastActivity: Date.now()
    };

    // Générer des interactions passées
    const interactionCount = Math.floor(Math.random() * 100) + 20;
    const now = Date.now();

    for (let i = 0; i < interactionCount; i++) {
      const timestamp = now - Math.random() * 30 * 24 * 60 * 60 * 1000;
      const article = this.articles[Math.floor(Math.random() * this.articles.length)];

      behavior.interactions.push({
        type: this.getRandomInteractionType(),
        articleId: article.id,
        category: article.category,
        timestamp: timestamp,
        duration: Math.floor(Math.random() * 600) + 60, // 1-10 minutes
        completionRate: Math.random() * 0.5 + 0.5 // 50-100%
      });
    }

    // Générer des articles vus
    const viewedCount = Math.floor(Math.random() * 30) + 10;
    const viewedArticles = new Set();

    while (viewedArticles.size < viewedCount) {
      const article = this.articles[Math.floor(Math.random() * this.articles.length)];
      viewedArticles.add(article);
    }

    behavior.viewedArticles = Array.from(viewedArticles).map(article => ({
      id: article.id,
      title: article.title,
      category: article.category,
      firstViewed: now - Math.random() * 30 * 24 * 60 * 60 * 1000,
      lastViewed: now - Math.random() * 7 * 24 * 60 * 60 * 1000,
      viewCount: Math.floor(Math.random() * 5) + 1,
      totalTimeSpent: Math.floor(Math.random() * 1800) + 300,
      completionRate: Math.random() * 0.4 + 0.6,
      scrollDepth: Math.floor(Math.random() * 40) + 60
    }));

    return behavior;
  }

  /**
   * Génère des préférences utilisateur
   */
  generateUserPreferences() {
    const categories = Object.keys(this.categories);
    const preferences = {};

    categories.forEach(category => {
      preferences[category] = Math.random();
    });

    return preferences;
  }

  /**
   * Méthodes utilitaires pour la génération de contenu
   */
  generateArticleTitle(category) {
    const titleTemplates = {
      'économie': [
        'Le secteur économique au Bénin : Opportunités et défis',
        'Entreprise innovante révolutionne le marché béninois',
        'Investissement étranger pour le développement du Bénin',
        'La croissance économique du Bénin en 2025'
      ],
      'technologie': [
        'L\'innovation technologique transforme le Bénin',
        'Le numérique au service du développement béninois',
        'Intelligence artificielle : La nouvelle tendance au Bénin',
        'Formation en technologie : L\'UAC forme les experts'
      ],
      'culture': [
        'Le festival culturel célèbre la tradition béninoise',
        'Artiste engagé : Portrait d\'un créateur béninois',
        'Le patrimoine culturel entre tradition et modernité',
        'Pratique ancestrale toujours vivante au Bénin'
      ],
      'sport': [
        'Le sport béninois : De la gloire à l\'international',
        'Les Jeux Olympiques : L\'ambition sportive du Bénin',
        'Équipe sportive qui fait vibrer le Bénin',
        'Sport et développement : L\'impact positif au Bénin'
      ],
      'éducation': [
        'L\'enseignement supérieur au Bénin en pointe',
        'Réforme éducative : Vers une éducation de qualité',
        'Défis de l\'enseignement au Bénin',
        'Innovation pédagogique transforme les classes'
      ],
      'agriculture': [
        'L\'agriculture béninoise : Pilier de l\'économie',
        'Agriculture durable : Les initiatives du Bénin',
        'Technique innovante révolutionne l\'agriculture',
        'Export agricole : Le Bénin conquiert les marchés'
      ],
      'santé': [
        'La santé au Bénin : Progrès et défis',
        'Lutte contre les épidémies au Bénin',
        'Système de santé : Les réformes en cours',
        'Prévention : Les campagnes de santé publique'
      ],
      'tourisme': [
        'Site touristique exceptionnel du Bénin',
        'Tourisme durable : La vision du Bénin',
        'Destination touristique d\'exception',
        'Écotourisme préserve la biodiversité béninoise'
      ],
      'entrepreneuriat': [
        'Parcours d\'un succès entrepreneurial béninois',
        'Startup innovante made in Bénin',
        'Incubateur accompagne les entrepreneurs',
        'Entrepreneuriat féminin : Les pionnières du Bénin'
      ],
      'politique': [
        'Politique de développement : Les ambitions du Bénin',
        'Réforme moderne pour le Bénin',
        'Gouvernance locale : La décentralisation en marche',
        'Politique extérieure : Le Bénin sur la scène internationale'
      ]
    };

    const templates = titleTemplates[category] || ['Article sur le Bénin'];
    const template = templates[Math.floor(Math.random() * templates.length)];

    return template;
  }

  generateArticleContent(category) {
    const baseContent = `Au Bénin, le secteur ${category} représente un domaine stratégique pour le développement national. `;
    const additionalContent = this.getCategorySpecificContent(category);
    return baseContent + additionalContent;
  }

  generateArticleExcerpt(category) {
    const excerpts = {
      'économie': 'Découvrez les dernières tendances économiques au Bénin et leur impact sur le développement national.',
      'technologie': 'L\'innovation technologique transforme le paysage béninois avec des solutions locales adaptées.',
      'culture': 'Entre tradition et modernité, la culture béninoise continue de rayonner sur la scène internationale.',
      'sport': 'Le sport béninois écrit de nouvelles pages de gloire avec des performances remarquables.',
      'éducation': 'L\'éducation au Bénin évolue vers l\'excellence avec des réformes innovantes.',
      'agriculture': 'L\'agriculture béninoise se modernise pour répondre aux défis du XXIe siècle.',
      'santé': 'Le système de santé béninois s\'améliore avec des initiatives innovantes.',
      'tourisme': 'Le tourisme au Bénin offre des expériences uniques aux visiteurs du monde entier.',
      'entrepreneuriat': 'Les entrepreneurs béninois créent de la valeur et génèrent des emplois.',
      'politique': 'La politique de développement du Bénin porte ses fruits pour le bien-être des citoyens.'
    };

    return excerpts[category] || `Découvrez les actualités ${category} au Bénin.`;
  }

  generateTags(category) {
    const categoryTags = {
      'économie': ['économie', 'développement', 'investissement', 'croissance', 'bénin'],
      'technologie': ['technologie', 'innovation', 'digital', 'startup', 'bénin'],
      'culture': ['culture', 'tradition', 'art', 'patrimoine', 'bénin'],
      'sport': ['sport', 'compétition', 'performance', 'jeunesse', 'bénin'],
      'éducation': ['éducation', 'formation', 'recherche', 'innovation', 'bénin'],
      'agriculture': ['agriculture', 'développement rural', 'export', 'transformation', 'bénin'],
      'santé': ['santé', 'prévention', 'soins', 'bien-être', 'bénin'],
      'tourisme': ['tourisme', 'culture', 'nature', 'découverte', 'bénin'],
      'entrepreneuriat': ['entrepreneuriat', 'business', 'innovation', 'création', 'bénin'],
      'politique': ['politique', 'développement', 'gouvernance', 'réforme', 'bénin']
    };

    return categoryTags[category] || [category, 'bénin'];
  }

  generateUserName() {
    const firstNames = ['Jean', 'Marie', 'Pierre', 'Paul', 'Jacques', 'François', 'Michel', 'Daniel', 'André', 'Philippe'];
    const lastNames = ['ADANDE', 'ADJOVI', 'AGBO', 'AKAKPO', 'ALASSANI', 'AMOUSSOU', 'ASSOGBA', 'ATCHADE', 'AVOCE', 'AZIABLE'];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
  }

  getRandomLocation() {
    const locations = ['Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Abomey-Calavi', 'Bohicon', 'Lokossa', 'Ouidah', 'Natitingou', 'Abomey'];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  getRandomInteractionType() {
    const types = ['view', 'like', 'comment', 'share', 'bookmark', 'read_complete'];
    return types[Math.floor(Math.random() * types.length)];
  }

  getCategorySpecificContent(category) {
    const contents = {
      'économie': 'Les investissements étrangers et les politiques de développement économique contribuent à la croissance du PIB et à la création d\'emplois.',
      'technologie': 'Les startups technologiques et l\'adoption du numérique transforment les secteurs traditionnels et créent de nouvelles opportunités.',
      'culture': 'Le patrimoine culturel riche et diversifié du Bénin attire les touristes et préserve les traditions ancestrales.',
      'sport': 'Les performances sportives internationales mettent en valeur les talents béninois et inspirent la jeunesse.',
      'éducation': 'Les réformes éducatives et l\'investissement dans la recherche universitaire renforcent les compétences nationales.',
      'agriculture': 'L\'agriculture moderne et durable assure la sécurité alimentaire et booste les exportations agricoles.',
      'santé': 'Les avancées médicales et les campagnes de prévention améliorent la qualité de vie des citoyens.',
      'tourisme': 'Le développement touristique durable valorise les richesses naturelles et culturelles du pays.',
      'entrepreneuriat': 'L\'écosystème entrepreneurial dynamique favorise l\'innovation et la création de valeur.',
      'politique': 'Les politiques publiques efficaces et la gouvernance transparente soutiennent le développement national.'
    };

    return contents[category] || 'Ce secteur contribue activement au développement du Bénin.';
  }

  getCategoryColor(category) {
    const colors = {
      'économie': '4CAF50',
      'politique': '2196F3',
      'culture': 'FF9800',
      'sport': '4CAF50',
      'éducation': '3F51B5',
      'agriculture': '4CAF50',
      'technologie': '9C27B0',
      'santé': 'E91E63',
      'tourisme': 'FF9800',
      'entrepreneuriat': 'FFC107'
    };

    return colors[category] || '607D8B';
  }

  /**
   * Obtient toutes les données générées
   */
  getAllData() {
    return {
      authors: this.authors,
      articles: this.articles,
      users: this.users,
      categories: this.categories
    };
  }

  /**
   * Obtient les statistiques des données générées
   */
  getStats() {
    return {
      totalAuthors: this.authors.length,
      totalArticles: this.articles.length,
      totalUsers: this.users.length,
      articlesByCategory: this.getArticlesByCategory(),
      featuredArticles: this.articles.filter(a => a.featured).length,
      avgBenineseRelevance: this.articles.reduce((sum, a) => sum + a.benineseRelevance, 0) / this.articles.length
    };
  }

  getArticlesByCategory() {
    const stats = {};
    this.articles.forEach(article => {
      stats[article.category] = (stats[article.category] || 0) + 1;
    });
    return stats;
  }
}

// Export pour utilisation globale
if (typeof window !== 'undefined') {
  window.BenineseContentGenerator = BenineseContentGenerator;
}

export default BenineseContentGenerator;
