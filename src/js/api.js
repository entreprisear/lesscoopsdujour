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
      title: 'Développement économique au Bénin : De nouveaux investissements annoncés',
      description: 'Le gouvernement béninois annonce de nouveaux investissements dans le secteur agricole...',
      content: 'Le gouvernement béninois annonce de nouveaux investissements dans le secteur agricole qui devraient créer des milliers d\'emplois.',
      url: '#',
      urlToImage: getDefaultImage(),
      publishedAt: new Date().toLocaleDateString('fr-FR'),
      source: 'Les Scoops du Jour',
      category: 'economie',
      author: 'Rédaction'
    },
    {
      id: '2',
      title: 'Élections législatives : La campagne bat son plein',
      description: 'Les candidats se mobilisent pour les élections législatives prochaines...',
      content: 'Les candidats se mobilisent pour les élections législatives prochaines avec des programmes variés.',
      url: '#',
      urlToImage: getDefaultImage(),
      publishedAt: new Date().toLocaleDateString('fr-FR'),
      source: 'Les Scoops du Jour',
      category: 'politique',
      author: 'Rédaction'
    },
    {
      id: '3',
      title: 'Festival culturel : Cotonou accueille les artistes du monde entier',
      description: 'Le festival international de Cotonou commence ce weekend...',
      content: 'Le festival international de Cotonou commence ce weekend avec des artistes venus du monde entier.',
      url: '#',
      urlToImage: getDefaultImage(),
      publishedAt: new Date().toLocaleDateString('fr-FR'),
      source: 'Les Scoops du Jour',
      category: 'culture',
      author: 'Rédaction'
    },
    {
      id: '4',
      title: 'Équipe nationale : Préparation pour les éliminatoires',
      description: 'Les Écureuils se préparent pour les prochains matchs...',
      content: 'Les Écureuils se préparent pour les prochains matchs des éliminatoires de la CAN.',
      url: '#',
      urlToImage: getDefaultImage(),
      publishedAt: new Date().toLocaleDateString('fr-FR'),
      source: 'Les Scoops du Jour',
      category: 'sport',
      author: 'Rédaction'
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
