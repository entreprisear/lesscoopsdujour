// Les Scoops du Jour - Search Engine
// Système de recherche avancé avec indexation et algorithmes de recherche

class SearchEngine {
  constructor(articles = []) {
    this.articles = articles;
    this.index = this.buildIndex();
    this.synonyms = this.buildSynonyms();
    this.searchHistory = this.loadSearchHistory();
    this.suggestions = this.buildSuggestions();
  }

  // Construction de l'index de recherche
  buildIndex() {
    const index = {
      title: {},
      description: {},
      content: {},
      author: {},
      category: {},
      tags: {}
    };

    this.articles.forEach((article, articleIndex) => {
      // Indexation du titre (poids élevé)
      this.addToIndex(index.title, article.title, articleIndex, 3);

      // Indexation de la description (poids moyen)
      this.addToIndex(index.description, article.description, articleIndex, 2);

      // Indexation du contenu (poids faible)
      this.addToIndex(index.content, article.content, articleIndex, 1);

      // Indexation de l'auteur
      this.addToIndex(index.author, article.author, articleIndex, 2);

      // Indexation de la catégorie
      this.addToIndex(index.category, article.category, articleIndex, 2);

      // Indexation des tags (mots-clés extraits)
      const tags = this.extractTags(article);
      tags.forEach(tag => {
        this.addToIndex(index.tags, tag, articleIndex, 1);
      });
    });

    return index;
  }

  // Ajout d'un terme à l'index
  addToIndex(indexSection, text, articleIndex, weight) {
    if (!text) return;

    const words = this.tokenize(text);
    words.forEach(word => {
      const normalizedWord = this.normalizeWord(word);

      if (!indexSection[normalizedWord]) {
        indexSection[normalizedWord] = {};
      }

      if (!indexSection[normalizedWord][articleIndex]) {
        indexSection[normalizedWord][articleIndex] = 0;
      }

      indexSection[normalizedWord][articleIndex] += weight;
    });
  }

  // Tokenisation du texte
  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\w\sàâäéèêëïîôöùûüÿç]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1);
  }

  // Normalisation des mots
  normalizeWord(word) {
    return word.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  // Extraction des tags/mots-clés
  extractTags(article) {
    const tags = [];

    // Mots-clés de la catégorie
    const categoryKeywords = {
      politique: ['gouvernement', 'president', 'election', 'loi', 'parlement'],
      economie: ['croissance', 'investissement', 'commerce', 'entreprise', 'emploi'],
      culture: ['festival', 'art', 'musique', 'cinema', 'tradition'],
      sport: ['football', 'equipe', 'victoire', 'championnat', 'joueur'],
      education: ['ecole', 'universite', 'etudiant', 'formation', 'diplome'],
      sante: ['hopital', 'medecin', 'vaccination', 'soins', 'sante publique'],
      tech: ['intelligence artificielle', 'internet', 'innovation', 'startup'],
      environnement: ['climat', 'foret', 'pollution', 'energie', 'biodiversite'],
      justice: ['tribunal', 'proces', 'droit', 'avocat', 'loi'],
      agriculture: ['ferme', 'culture', 'elevage', 'recolte', 'agriculteur']
    };

    if (categoryKeywords[article.category]) {
      tags.push(...categoryKeywords[article.category]);
    }

    // Extraction de mots importants du contenu
    const contentWords = this.tokenize(article.title + ' ' + article.description);
    const importantWords = contentWords.filter(word =>
      word.length > 3 && !this.isStopWord(word)
    );

    tags.push(...importantWords.slice(0, 5)); // Top 5 mots importants

    return [...new Set(tags)]; // Élimination des doublons
  }

  // Mots vides (stop words) en français
  isStopWord(word) {
    const stopWords = ['les', 'des', 'une', 'dans', 'pour', 'avec', 'sur', 'par', 'aux', 'qui', 'que', 'est', 'son', 'ses', 'leur', 'leurs', 'notre', 'votre', 'cette', 'plus', 'tout', 'tous', 'toute', 'toutes', 'comme', 'mais', 'sans', 'sous', 'entre', 'vers', 'depuis', 'pendant', 'contre', 'selon', 'aussi', 'bien', 'tres', 'encore', 'toujours', 'jamais', 'peut', 'doit', 'peuvent', 'doivent'];
    return stopWords.includes(word);
  }

  // Construction du dictionnaire de synonymes
  buildSynonyms() {
    return {
      president: ['chef d\'etat', 'chef de l\'etat', 'patrice talon', 'mathieu kerekou', 'thomas boni yayi'],
      gouvernement: ['ministres', 'conseil des ministres', 'executif'],
      economie: ['croissance', 'commerce', 'investissement', 'finance'],
      sante: ['hopital', 'medecin', 'soins', 'vaccination'],
      education: ['ecole', 'universite', 'etudiant', 'formation'],
      culture: ['festival', 'art', 'musique', 'tradition', 'vaudou'],
      sport: ['football', 'equipe nationale', 'ecureuils', 'can'],
      tech: ['technologie', 'intelligence artificielle', 'innovation', 'numerique'],
      environnement: ['climat', 'foret', 'pollution', 'biodiversite'],
      justice: ['tribunal', 'proces', 'droit', 'loi'],
      agriculture: ['ferme', 'culture', 'elevage', 'recolte'],
      cotonou: ['economic capital', 'port city'],
      'porto-novo': ['constitutional capital', 'capitale constitutionnelle'],
      benin: ['republique du benin', 'afrique de l\'ouest']
    };
  }

  // Construction des suggestions de recherche
  buildSuggestions() {
    const suggestions = new Set();

    // Suggestions basées sur les catégories
    Object.keys(this.synonyms).forEach(key => {
      suggestions.add(key);
      this.synonyms[key].forEach(synonym => suggestions.add(synonym));
    });

    // Suggestions basées sur les auteurs populaires
    this.articles.forEach(article => {
      suggestions.add(article.author.toLowerCase());
    });

    // Suggestions basées sur les titres populaires
    this.articles.slice(0, 10).forEach(article => {
      const words = this.tokenize(article.title);
      words.forEach(word => {
        if (word.length > 3) suggestions.add(word);
      });
    });

    return Array.from(suggestions).sort();
  }

  // Recherche principale
  search(query, filters = {}) {
    if (!query || query.trim().length < 2) {
      return { results: [], total: 0, query: query };
    }

    const normalizedQuery = this.normalizeWord(query.trim());
    const queryWords = this.tokenize(query);

    // Recherche avec synonymes
    const expandedQuery = this.expandWithSynonyms(queryWords);

    // Calcul des scores pour chaque article
    const scores = {};

    expandedQuery.forEach(word => {
      const normalizedWord = this.normalizeWord(word);

      // Recherche dans toutes les sections de l'index
      Object.keys(this.index).forEach(section => {
        if (this.index[section][normalizedWord]) {
          Object.keys(this.index[section][normalizedWord]).forEach(articleIndex => {
            const weight = this.index[section][normalizedWord][articleIndex];
            scores[articleIndex] = (scores[articleIndex] || 0) + weight;
          });
        }
      });

      // Recherche floue (fuzzy search)
      this.fuzzySearch(normalizedWord, scores);
    });

    // Conversion en tableau de résultats
    let results = Object.keys(scores).map(articleIndex => ({
      article: this.articles[parseInt(articleIndex)],
      score: scores[articleIndex],
      highlights: this.generateHighlights(queryWords, this.articles[parseInt(articleIndex)])
    }));

    // Tri par score décroissant
    results.sort((a, b) => b.score - a.score);

    // Application des filtres
    results = this.applyFilters(results, filters);

    // Sauvegarde dans l'historique
    this.saveToHistory(query);

    return {
      results: results,
      total: results.length,
      query: query,
      filters: filters
    };
  }

  // Recherche floue (tolérance aux fautes de frappe)
  fuzzySearch(word, scores) {
    const maxDistance = Math.min(2, Math.floor(word.length / 3));

    Object.keys(this.index.title).forEach(indexWord => {
      if (this.levenshteinDistance(word, indexWord) <= maxDistance) {
        Object.keys(this.index.title[indexWord]).forEach(articleIndex => {
          scores[articleIndex] = (scores[articleIndex] || 0) + 0.5; // Score réduit pour fuzzy
        });
      }
    });
  }

  // Distance de Levenshtein pour la recherche floue
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Expansion de la requête avec les synonymes
  expandWithSynonyms(queryWords) {
    const expanded = [...queryWords];

    queryWords.forEach(word => {
      const normalizedWord = this.normalizeWord(word);

      Object.keys(this.synonyms).forEach(key => {
        if (key === normalizedWord || this.synonyms[key].includes(normalizedWord)) {
          expanded.push(...this.synonyms[key]);
        }
      });
    });

    return [...new Set(expanded)]; // Élimination des doublons
  }

  // Génération des surlignages
  generateHighlights(queryWords, article) {
    const highlights = {};

    queryWords.forEach(word => {
      const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi');

      if (regex.test(article.title)) {
        highlights.title = article.title.replace(regex, '<mark>$1</mark>');
      }

      if (regex.test(article.description)) {
        highlights.description = article.description.replace(regex, '<mark>$1</mark>');
      }
    });

    return highlights;
  }

  // Échappement des caractères spéciaux pour les regex
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Application des filtres
  applyFilters(results, filters) {
    return results.filter(result => {
      const article = result.article;

      // Filtre par catégorie
      if (filters.category && filters.category !== 'all' && article.category !== filters.category) {
        return false;
      }

      // Filtre par auteur
      if (filters.author && filters.author !== 'all' && article.author !== filters.author) {
        return false;
      }

      // Filtre par date
      if (filters.dateRange) {
        const articleDate = new Date(article.publishedAt);
        const now = new Date();
        const daysDiff = Math.floor((now - articleDate) / (1000 * 60 * 60 * 24));

        switch (filters.dateRange) {
          case 'today':
            if (daysDiff > 0) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
          case 'year':
            if (daysDiff > 365) return false;
            break;
        }
      }

      // Filtre par note minimale
      if (filters.minRating && article.rating < parseFloat(filters.minRating)) {
        return false;
      }

      return true;
    });
  }

  // Recherche en temps réel (suggestions)
  getSuggestions(query, limit = 5) {
    if (!query || query.length < 1) {
      return this.getPopularSuggestions(limit);
    }

    const normalizedQuery = this.normalizeWord(query);
    const matches = [];

    this.suggestions.forEach(suggestion => {
      if (suggestion.startsWith(normalizedQuery)) {
        matches.push(suggestion);
      }
    });

    // Tri par longueur (suggestions plus courtes en premier)
    matches.sort((a, b) => a.length - b.length);

    return matches.slice(0, limit);
  }

  // Suggestions populaires
  getPopularSuggestions(limit = 5) {
    const popular = [
      'politique',
      'économie',
      'culture',
      'sport',
      'santé',
      'patrice talon',
      'cotonou',
      'festival',
      'vaccination',
      'croissance'
    ];

    return popular.slice(0, limit);
  }

  // Gestion de l'historique de recherche
  loadSearchHistory() {
    try {
      return JSON.parse(localStorage.getItem('searchHistory') || '[]');
    } catch (e) {
      return [];
    }
  }

  saveToHistory(query) {
    if (!query || query.trim().length < 2) return;

    const history = this.searchHistory.filter(item => item !== query);
    history.unshift(query);

    // Garder seulement les 20 dernières recherches
    this.searchHistory = history.slice(0, 20);

    try {
      localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    } catch (e) {
      console.warn('Impossible de sauvegarder l\'historique de recherche');
    }
  }

  getSearchHistory() {
    return this.searchHistory;
  }

  clearSearchHistory() {
    this.searchHistory = [];
    localStorage.removeItem('searchHistory');
  }

  // Mise à jour des articles
  updateArticles(articles) {
    this.articles = articles;
    this.index = this.buildIndex();
    this.suggestions = this.buildSuggestions();
  }

  // Statistiques de recherche
  getStats() {
    return {
      totalArticles: this.articles.length,
      totalIndexedTerms: Object.keys(this.index.title).length,
      searchHistoryCount: this.searchHistory.length,
      suggestionsCount: this.suggestions.length
    };
  }
}

// Fonction utilitaire pour créer une instance du moteur de recherche
export function createSearchEngine(articles = []) {
  return new SearchEngine(articles);
}

// Fonction pour formater les résultats de recherche
export function formatSearchResults(searchResults, currentPage = 1, resultsPerPage = 10) {
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;

  return {
    ...searchResults,
    paginatedResults: searchResults.results.slice(startIndex, endIndex),
    currentPage,
    resultsPerPage,
    totalPages: Math.ceil(searchResults.results.length / resultsPerPage),
    hasNextPage: endIndex < searchResults.results.length,
    hasPrevPage: currentPage > 1
  };
}

export { SearchEngine };
