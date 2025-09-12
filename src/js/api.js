// Les Scoops du Jour - API Module

// Configuration de l'API
const API_CONFIG = {
  baseURL: 'https://newsapi.org/v2',
  apiKey: process.env.NEWS_API_KEY || 'demo-key', // À remplacer par une vraie clé API
  country: 'bj', // Bénin
  pageSize: 12
};

// État du cache
let newsCache = new Map();
let categoriesCache = new Map();

// Initialisation de l'API
export function initAPI() {
  console.log('API initialisée pour Les Scoops du Jour');
}

// Fonction pour récupérer les actualités
export async function fetchNews(category = 'all', page = 1) {
  const cacheKey = `${category}-${page}`;

  // Vérifier le cache
  if (newsCache.has(cacheKey)) {
    return newsCache.get(cacheKey);
  }

  try {
    let url;

    if (category === 'all') {
      // Actualité générale
      url = `${API_CONFIG.baseURL}/top-headlines?country=${API_CONFIG.country}&pageSize=${API_CONFIG.pageSize}&page=${page}&apiKey=${API_CONFIG.apiKey}`;
    } else {
      // Actualité par catégorie
      url = `${API_CONFIG.baseURL}/top-headlines?country=${API_CONFIG.country}&category=${category}&pageSize=${API_CONFIG.pageSize}&page=${page}&apiKey=${API_CONFIG.apiKey}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();

    // Transformer les données
    const transformedData = transformNewsData(data);

    // Mettre en cache
    newsCache.set(cacheKey, transformedData);

    return transformedData;
  } catch (error) {
    console.error('Erreur lors de la récupération des actualités:', error);

    // Retourner des données mock en cas d'erreur
    return getMockNews(category, page);
  }
}

// Fonction de recherche
export async function searchNews(query, page = 1) {
  const cacheKey = `search-${query}-${page}`;

  // Vérifier le cache
  if (newsCache.has(cacheKey)) {
    return newsCache.get(cacheKey);
  }

  try {
    const url = `${API_CONFIG.baseURL}/everything?q=${encodeURIComponent(query)}+benin&language=fr&pageSize=${API_CONFIG.pageSize}&page=${page}&apiKey=${API_CONFIG.apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();

    // Transformer les données
    const transformedData = transformNewsData(data);

    // Mettre en cache
    newsCache.set(cacheKey, transformedData);

    return transformedData;
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);

    // Retourner des données mock
    return getMockSearchResults(query, page);
  }
}

// Transformation des données de l'API
function transformNewsData(data) {
  return {
    articles: data.articles.map(article => ({
      id: generateId(),
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      urlToImage: article.urlToImage || getDefaultImage(),
      publishedAt: new Date(article.publishedAt).toLocaleDateString('fr-FR'),
      source: article.source.name,
      category: determineCategory(article),
      author: article.author || 'Anonyme'
    })),
    totalResults: data.totalResults,
    currentPage: Math.ceil(data.articles.length / API_CONFIG.pageSize)
  };
}

// Déterminer la catégorie d'un article
function determineCategory(article) {
  const title = article.title.toLowerCase();
  const description = article.description ? article.description.toLowerCase() : '';

  if (title.includes('politique') || description.includes('politique')) {
    return 'politique';
  } else if (title.includes('économie') || title.includes('finance') || description.includes('économie')) {
    return 'economie';
  } else if (title.includes('culture') || title.includes('art') || description.includes('culture')) {
    return 'culture';
  } else if (title.includes('sport') || description.includes('sport')) {
    return 'sport';
  } else {
    return 'general';
  }
}

// Générer un ID unique
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Image par défaut
function getDefaultImage() {
  return 'https://via.placeholder.com/400x200/007bff/ffffff?text=Les+Scoops+du+Jour';
}

// Données mock pour le développement
function getMockNews(category, page) {
  const mockArticles = [
    {
      id: '1',
      title: 'Nouveau gouvernement formé : Patrice Talon nomme ses ministres',
      description: 'Le président Patrice Talon a annoncé la composition de son nouveau gouvernement après plusieurs semaines de consultations.',
      content: 'Le président Patrice Talon a annoncé la composition de son nouveau gouvernement. Découvrez les principales nominations et les défis qui attendent l\'équipe gouvernementale.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/FE0202/FFFFFF?text=Gouvernement+Talon',
      publishedAt: '12 sept. 2025',
      source: 'Les Scoops du Jour',
      category: 'politique',
      author: 'Marie KPOGNON',
      rating: 4.8
    },
    {
      id: '2',
      title: 'Économie béninoise : Croissance de 6,8% au premier trimestre',
      description: 'Le Bénin enregistre une croissance économique solide malgré les défis mondiaux.',
      content: 'Selon les derniers chiffres publiés par l\'INSAE, l\'économie béninoise affiche une croissance de 6,8% au premier trimestre 2025.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/4CAF50/FFFFFF?text=Croissance+Économique',
      publishedAt: '11 sept. 2025',
      source: 'Les Scoops du Jour',
      category: 'economie',
      author: 'Jean ADJOVI',
      rating: 4.6
    },
    {
      id: '3',
      title: 'Festival international d\'Ouidah : Plus de 50 000 visiteurs attendus',
      description: 'Le Festival International d\'Ouidah 2025 promet d\'être un événement majeur de la culture béninoise.',
      content: 'Le Festival International d\'Ouidah débute ce weekend et devrait accueillir plus de 50 000 visiteurs venus célébrer la culture vaudou et les arts traditionnels.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/9C27B0/FFFFFF?text=Festival+Ouidah',
      publishedAt: '10 sept. 2025',
      source: 'Les Scoops du Jour',
      category: 'culture',
      author: 'Fatima ALI',
      rating: 4.9
    },
    {
      id: '4',
      title: 'Équipe nationale : Victoire historique contre le Maroc en CAN',
      description: 'Les Écureuils du Bénin créent la sensation en battant le Maroc en Coupe d\'Afrique.',
      content: 'Dans un match épique, l\'équipe nationale du Bénin a battu le Maroc 2-1, se qualifiant pour les quarts de finale de la CAN 2025.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/FF9800/FFFFFF?text=Victoire+CAN',
      publishedAt: '9 sept. 2025',
      source: 'Les Scoops du Jour',
      category: 'sport',
      author: 'Paul HOUNTON',
      rating: 4.7
    },
    {
      id: '5',
      title: 'Réforme éducative : Nouveaux programmes pour 2025-2026',
      description: 'Le ministre de l\'Éducation annonce une réforme majeure du système éducatif béninois.',
      content: 'Le ministre de l\'Éducation présente les grandes lignes de la réforme du système éducatif béninois pour l\'année scolaire 2025-2026.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/2196F3/FFFFFF?text=Réforme+Éducation',
      publishedAt: '8 sept. 2025',
      source: 'Les Scoops du Jour',
      category: 'education',
      author: 'Dr. Marie DOUTI',
      rating: 4.5
    },
    {
      id: '6',
      title: 'Campagne vaccination COVID-19 : Objectif 70% de couverture',
      description: 'Le ministère de la Santé lance une nouvelle campagne de vaccination gratuite.',
      content: 'Le ministère de la Santé lance une nouvelle campagne de vaccination contre la COVID-19 avec pour objectif d\'atteindre 70% de couverture vaccinale.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/607D8B/FFFFFF?text=Vaccination+COVID',
      publishedAt: '7 sept. 2025',
      source: 'Les Scoops du Jour',
      category: 'sante',
      author: 'Dr. Koffi A.',
      rating: 4.4
    },
    {
      id: '7',
      title: 'Intelligence artificielle : Nouveau centre de recherche à Cotonou',
      description: 'Le Bénin inaugure son premier centre dédié à l\'intelligence artificielle.',
      content: 'Un nouveau centre de recherche en IA ouvre ses portes à Cotonou avec le soutien de partenaires internationaux.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/795548/FFFFFF?text=Centre+IA',
      publishedAt: '6 sept. 2025',
      source: 'Les Scoops du Jour',
      category: 'tech',
      author: 'Prof. Alain K.',
      rating: 4.8
    },
    {
      id: '8',
      title: 'Protection environnement : Nouveau parc national dans le nord',
      description: 'Le gouvernement annonce la création d\'un nouveau parc national pour préserver la biodiversité.',
      content: 'Le gouvernement béninois annonce la création d\'un nouveau parc national dans la région nord pour préserver la biodiversité.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/3F51B5/FFFFFF?text=Parc+National',
      publishedAt: '5 sept. 2025',
      source: 'Les Scoops du Jour',
      category: 'environnement',
      author: 'Sophie LOKOSSOU',
      rating: 4.6
    },
    {
      id: '9',
      title: 'Réforme judiciaire : Vers une justice plus rapide et transparente',
      description: 'Le ministre de la Justice présente les nouvelles mesures pour moderniser le système judiciaire.',
      content: 'Le ministre de la Justice présente les nouvelles mesures pour moderniser le système judiciaire béninois.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/E91E63/FFFFFF?text=Réforme+Judiciaire',
      publishedAt: '4 sept. 2025',
      source: 'Les Scoops du Jour',
      category: 'justice',
      author: 'Maître Koffi A.',
      rating: 4.3
    },
    {
      id: '10',
      title: 'Révolution agricole : Le Bénin mise sur les nouvelles technologies',
      description: 'Le gouvernement lance un programme ambitieux pour moderniser l\'agriculture béninoise.',
      content: 'Le gouvernement lance un programme ambitieux pour moderniser l\'agriculture béninoise avec l\'introduction de nouvelles technologies.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/009688/FFFFFF?text=Agriculture+Tech',
      publishedAt: '3 sept. 2025',
      source: 'Les Scoops du Jour',
      category: 'agriculture',
      author: 'Prof. Alain K.',
      rating: 4.7
    },
    {
      id: '11',
      title: 'Port de Cotonou : Nouveaux investissements chinois annoncés',
      description: 'La Chine annonce de nouveaux investissements dans le port de Cotonou.',
      content: 'La Chine annonce de nouveaux investissements dans le port de Cotonou pour améliorer les infrastructures portuaires.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/4CAF50/FFFFFF?text=Port+Cotonou',
      publishedAt: '2 sept. 2025',
      source: 'Les Scoops du Jour',
      category: 'economie',
      author: 'Jean ADJOVI',
      rating: 4.5
    },
    {
      id: '12',
      title: 'Cinéma béninois : Nouveau film primé à Cannes',
      description: 'Un film béninois remporte un prix prestigieux au Festival de Cannes.',
      content: 'Un film réalisé par un cinéaste béninois remporte le prix de la meilleure réalisation dans la catégorie court-métrage.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/9C27B0/FFFFFF?text=Cinéma+Bénin',
      publishedAt: '1 sept. 2025',
      source: 'Les Scoops du Jour',
      category: 'culture',
      author: 'Fatima ALI',
      rating: 4.9
    },
    {
      id: '13',
      title: 'Handball féminin : Les Amazones qualifiées pour les JO 2028',
      description: 'L\'équipe féminine de handball du Bénin se qualifie pour les Jeux Olympiques.',
      content: 'Les Amazones du Bénin créent l\'exploit en se qualifiant pour les Jeux Olympiques de 2028.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/FF9800/FFFFFF?text=Handball+Féminin',
      publishedAt: '31 août 2025',
      source: 'Les Scoops du Jour',
      category: 'sport',
      author: 'Paul HOUNTON',
      rating: 4.8
    },
    {
      id: '14',
      title: 'Université d\'Abomey-Calavi : Nouveau rectorat élu',
      description: 'L\'Université d\'Abomey-Calavi élit son nouveau recteur.',
      content: 'Le Professeur Xavier Crepin a été élu nouveau recteur de l\'Université d\'Abomey-Calavi.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/2196F3/FFFFFF?text=UAC+Rectorat',
      publishedAt: '30 août 2025',
      source: 'Les Scoops du Jour',
      category: 'education',
      author: 'Dr. Marie DOUTI',
      rating: 4.2
    },
    {
      id: '15',
      title: 'Santé mentale : Nouvelle clinique spécialisée inaugurée',
      description: 'Une nouvelle clinique dédiée à la santé mentale ouvre ses portes à Porto-Novo.',
      content: 'Une nouvelle clinique spécialisée dans les soins de santé mentale a été inaugurée à Porto-Novo.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/607D8B/FFFFFF?text=Santé+Mentale',
      publishedAt: '29 août 2025',
      source: 'Les Scoops du Jour',
      category: 'sante',
      author: 'Dr. Koffi A.',
      rating: 4.6
    },
    {
      id: '16',
      title: 'Startups béninoises : Succès à la Silicon Valley',
      description: 'Deux startups béninoises remportent un concours international aux États-Unis.',
      content: 'Deux jeunes entrepreneurs béninois remportent le premier prix d\'un concours de startups à la Silicon Valley.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/795548/FFFFFF?text=Startups+Bénin',
      publishedAt: '28 août 2025',
      source: 'Les Scoops du Jour',
      category: 'tech',
      author: 'Prof. Alain K.',
      rating: 4.7
    },
    {
      id: '17',
      title: 'Littoral protégé : Nouveau projet de restauration des mangroves',
      description: 'Un projet international pour restaurer les mangroves du littoral béninois.',
      content: 'Un projet financé par l\'Union Européenne vise à restaurer 500 hectares de mangroves sur le littoral béninois.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/3F51B5/FFFFFF?text=Mangroves',
      publishedAt: '27 août 2025',
      source: 'Les Scoops du Jour',
      category: 'environnement',
      author: 'Sophie LOKOSSOU',
      rating: 4.5
    },
    {
      id: '18',
      title: 'Justice transitionnelle : Avancées dans les procès des crimes économiques',
      description: 'La Cour de Répression des Infractions Économiques et du Terrorisme annonce des avancées.',
      content: 'La CRIET annonce des avancées significatives dans les procès concernant les crimes économiques.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/E91E63/FFFFFF?text=Justice+Transitionnelle',
      publishedAt: '26 août 2025',
      source: 'Les Scoops du Jour',
      category: 'justice',
      author: 'Maître Koffi A.',
      rating: 4.4
    },
    {
      id: '19',
      title: 'Anacarde : Record d\'exportation pour la campagne 2024-2025',
      description: 'Le Bénin bat son record d\'exportation d\'anacarde avec plus de 200 000 tonnes.',
      content: 'Le Bénin a exporté plus de 200 000 tonnes d\'anacarde durant la campagne 2024-2025, battant tous les records précédents.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/009688/FFFFFF?text=Anacarde+Export',
      publishedAt: '25 août 2025',
      source: 'Les Scoops du Jour',
      category: 'agriculture',
      author: 'Prof. Alain K.',
      rating: 4.6
    },
    {
      id: '20',
      title: 'Assemblée nationale : Nouveau président élu',
      description: 'L\'Assemblée nationale élit son nouveau président après les législatives.',
      content: 'L\'Assemblée nationale a élu Louis Vlavonou comme nouveau président de l\'institution.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/400x250/FE0202/FFFFFF?text=Assemblée+Nationale',
      publishedAt: '24 août 2025',
      source: 'Les Scoops du Jour',
      category: 'politique',
      author: 'Marie KPOGNON',
      rating: 4.5
    }
  ];

  const filteredArticles = category === 'all' ?
    mockArticles :
    mockArticles.filter(article => article.category === category);

  return {
    articles: filteredArticles,
    totalResults: filteredArticles.length,
    currentPage: page
  };
}

function getMockSearchResults(query, page) {
  const mockResults = [
    {
      id: 'search-1',
      title: `Résultats de recherche pour "${query}"`,
      description: 'Voici les articles correspondant à votre recherche...',
      content: 'Contenu détaillé de l\'article trouvé.',
      url: '#',
      urlToImage: getDefaultImage(),
      publishedAt: new Date().toLocaleDateString('fr-FR'),
      source: 'Les Scoops du Jour',
      category: 'general',
      author: 'Rédaction'
    }
  ];

  return {
    articles: mockResults,
    totalResults: mockResults.length,
    currentPage: page
  };
}

// Nettoyer le cache (utile pour les tests ou mise à jour)
export function clearCache() {
  newsCache.clear();
  categoriesCache.clear();
}

// Exporter la configuration pour les tests
export { API_CONFIG };
