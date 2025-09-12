// Les Scoops du Jour - Search Page JavaScript
// Gestion complète de la recherche avec filtres, pagination et suggestions

import { generateBenineseArticles } from './utils/mockDataGenerator.js';
import { createSearchEngine, formatSearchResults } from './utils/SearchEngine.js';
import { createArticleCard } from './components/ArticleCard.js';

// État de la recherche
let searchEngine = null;
let currentResults = null;
let currentPage = 1;
let currentFilters = {};
let currentQuery = '';
let searchTimeout = null;

// Initialisation de la page de recherche
document.addEventListener('DOMContentLoaded', () => {
  initSearchPage();
});

function initSearchPage() {
  // Initialiser le moteur de recherche avec des données de test
  const articles = generateBenineseArticles(50); // 50 articles pour la recherche
  searchEngine = createSearchEngine(articles);

  // Configurer les écouteurs d'événements
  setupSearchEventListeners();

  // Vérifier s'il y a une recherche dans l'URL
  checkUrlForSearch();

  // Remplir les filtres d'auteur
  populateAuthorFilter(articles);

  console.log('🔍 Moteur de recherche initialisé avec', articles.length, 'articles');
}

// Configuration des écouteurs d'événements
function setupSearchEventListeners() {
  // Recherche principale
  const mainSearchInput = document.getElementById('main-search-input');
  const mainSearchBtn = document.getElementById('main-search-btn');

  mainSearchInput.addEventListener('input', handleSearchInput);
  mainSearchInput.addEventListener('keydown', handleSearchKeydown);
  mainSearchBtn.addEventListener('click', () => performSearch(mainSearchInput.value.trim()));

  // Recherche dans le header (même logique que la page principale)
  const headerSearchInput = document.getElementById('search-input');
  const headerSearchBtn = document.getElementById('search-btn');

  headerSearchInput.addEventListener('input', debounce((e) => {
    const query = e.target.value.trim();
    if (query.length > 2) {
      performInstantSearch(query, document.getElementById('search-results'));
    } else {
      document.getElementById('search-results').style.display = 'none';
    }
  }, 300));

  headerSearchBtn.addEventListener('click', () => {
    const query = headerSearchInput.value.trim();
    if (query) {
      window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
  });

  headerSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = headerSearchInput.value.trim();
      if (query) {
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
      }
    }
  });

  // Filtres
  document.getElementById('toggle-filters').addEventListener('click', toggleFilters);
  document.getElementById('apply-filters').addEventListener('click', applyFilters);
  document.getElementById('reset-filters').addEventListener('click', resetFilters);

  // Tri
  document.getElementById('sort-select').addEventListener('change', handleSortChange);

  // Pagination
  document.getElementById('prev-page').addEventListener('click', () => changePage(currentPage - 1));
  document.getElementById('next-page').addEventListener('click', () => changePage(currentPage + 1));

  // Historique de recherche (si disponible)
  setupSearchHistory();
}

// Gestion de la saisie de recherche
function handleSearchInput(e) {
  const query = e.target.value.trim();
  clearTimeout(searchTimeout);

  if (query.length === 0) {
    hideSuggestions();
    return;
  }

  if (query.length < 2) {
    hideSuggestions();
    return;
  }

  // Afficher les suggestions après un délai
  searchTimeout = setTimeout(() => {
    showSuggestions(query);
  }, 300);
}

function handleSearchKeydown(e) {
  const suggestions = document.getElementById('search-suggestions');

  if (e.key === 'Enter') {
    e.preventDefault();
    const query = e.target.value.trim();
    if (query) {
      performSearch(query);
    }
  } else if (e.key === 'Escape') {
    hideSuggestions();
  } else if (e.key === 'ArrowDown' && suggestions.classList.contains('show')) {
    e.preventDefault();
    navigateSuggestions('down');
  } else if (e.key === 'ArrowUp' && suggestions.classList.contains('show')) {
    e.preventDefault();
    navigateSuggestions('up');
  }
}

// Suggestions de recherche
function showSuggestions(query) {
  const suggestions = searchEngine.getSuggestions(query, 8);
  const suggestionsContainer = document.getElementById('search-suggestions');

  if (suggestions.length === 0) {
    hideSuggestions();
    return;
  }

  const suggestionsHTML = suggestions.map((suggestion, index) =>
    `<li class="${index === 0 ? 'highlighted' : ''}" data-suggestion="${suggestion}">${highlightMatch(suggestion, query)}</li>`
  ).join('');

  suggestionsContainer.innerHTML = `<ul>${suggestionsHTML}</ul>`;
  suggestionsContainer.classList.add('show');

  // Gestion des clics sur les suggestions
  suggestionsContainer.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      const suggestion = li.getAttribute('data-suggestion');
      document.getElementById('main-search-input').value = suggestion;
      performSearch(suggestion);
    });
  });
}

function hideSuggestions() {
  const suggestions = document.getElementById('search-suggestions');
  suggestions.classList.remove('show');
}

function navigateSuggestions(direction) {
  const suggestions = document.querySelectorAll('#search-suggestions li');
  const highlighted = document.querySelector('#search-suggestions li.highlighted');

  if (!highlighted) return;

  let newIndex;
  const currentIndex = Array.from(suggestions).indexOf(highlighted);

  if (direction === 'down') {
    newIndex = currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0;
  } else {
    newIndex = currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1;
  }

  highlighted.classList.remove('highlighted');
  suggestions[newIndex].classList.add('highlighted');
}

// Recherche instantanée pour le header
function performInstantSearch(query, resultsContainer) {
  const results = searchEngine.search(query, {});
  const suggestions = results.results.slice(0, 5);

  if (suggestions.length > 0) {
    const suggestionsHTML = suggestions.map(result =>
      `<div class="search-result-item" data-query="${query}">
        <div class="font-weight-medium">${result.article.title}</div>
        <div class="text-sm text-muted">${result.article.category} • ${result.article.publishedAt}</div>
      </div>`
    ).join('');

    resultsContainer.innerHTML = suggestionsHTML;
    resultsContainer.style.display = 'block';

    // Gestion des clics
    resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const selectedQuery = item.getAttribute('data-query');
        window.location.href = `search.html?q=${encodeURIComponent(selectedQuery)}`;
      });
    });
  } else {
    resultsContainer.style.display = 'none';
  }
}

// Recherche principale
function performSearch(query) {
  if (!query || query.trim().length < 2) return;

  currentQuery = query;
  currentPage = 1;
  currentFilters = {};

  // Mettre à jour l'URL
  updateUrl(query, currentFilters);

  // Afficher le chargement
  showLoading();

  // Effectuer la recherche
  setTimeout(() => {
    const results = searchEngine.search(query, currentFilters);
    currentResults = results;

    displayResults(results);
    hideSuggestions();
  }, 300); // Simulation d'un délai de recherche
}

// Affichage des résultats
function displayResults(searchResults) {
  const formattedResults = formatSearchResults(searchResults, currentPage, 10);

  // Masquer le chargement
  hideLoading();

  if (formattedResults.paginatedResults.length === 0) {
    showNoResults(searchResults.query);
    return;
  }

  // Afficher les résultats
  showResultsContent();

  // Mettre à jour le compteur
  document.getElementById('results-count').textContent =
    `${searchResults.total} résultat${searchResults.total > 1 ? 's' : ''} trouvé${searchResults.total > 1 ? 's' : ''}`;

  document.getElementById('query-text').textContent = searchResults.query;

  // Afficher les résultats
  const resultsList = document.getElementById('results-list');
  resultsList.innerHTML = '';

  formattedResults.paginatedResults.forEach(result => {
    const resultElement = createResultElement(result);
    resultsList.appendChild(resultElement);
  });

  // Mettre à jour la pagination
  updatePagination(formattedResults);
}

// Création d'un élément de résultat
function createResultElement(result) {
  const { article, highlights } = result;

  const resultDiv = document.createElement('div');
  resultDiv.className = 'result-item';
  resultDiv.onclick = () => {
    // Ici on pourrait naviguer vers l'article complet
    console.log('Article cliqué:', article.title);
  };

  // Générer les étoiles de notation
  const stars = createStarRating(article.rating);

  resultDiv.innerHTML = `
    <div class="result-image">
      <img src="${article.urlToImage}" alt="${article.title}" loading="lazy">
    </div>
    <div class="result-content">
      <div class="result-meta">
        <span class="result-category">${article.category}</span>
        <span>${article.author}</span>
        <span>${article.publishedAt}</span>
      </div>
      <h3 class="result-title">${highlights.title || article.title}</h3>
      <p class="result-excerpt">${highlights.description || article.description}</p>
      <div class="result-footer">
        <div class="result-rating">
          ${stars}
          <span class="rating-score">${article.rating.toFixed(1)}</span>
        </div>
        <span class="result-date">${article.views} lectures</span>
      </div>
    </div>
  `;

  return resultDiv;
}

// Fonction utilitaire pour créer les étoiles
function createStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let starsHTML = '';
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<span class="star full">★</span>';
  }
  if (hasHalfStar) {
    starsHTML += '<span class="star half">★</span>';
  }
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<span class="star empty">★</span>';
  }
  return starsHTML;
}

// Mise en surbrillance des correspondances
function highlightMatch(text, query) {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Gestion des filtres
function toggleFilters() {
  const filtersContent = document.querySelector('.filters-content');
  const toggleBtn = document.getElementById('toggle-filters');

  if (filtersContent.style.display === 'none') {
    filtersContent.style.display = 'block';
    toggleBtn.textContent = 'Masquer les filtres';
  } else {
    filtersContent.style.display = 'none';
    toggleBtn.textContent = 'Afficher les filtres';
  }
}

function applyFilters() {
  const filters = {
    category: document.getElementById('category-filter').value,
    author: document.getElementById('author-filter').value,
    dateRange: document.getElementById('date-filter').value,
    minRating: document.getElementById('rating-filter').value
  };

  // Nettoyer les filtres vides
  Object.keys(filters).forEach(key => {
    if (filters[key] === '' || filters[key] === 'all') {
      delete filters[key];
    }
  });

  currentFilters = filters;
  currentPage = 1;

  // Mettre à jour l'URL
  updateUrl(currentQuery, filters);

  // Relancer la recherche
  if (currentQuery) {
    performSearch(currentQuery);
  }
}

function resetFilters() {
  document.getElementById('category-filter').value = 'all';
  document.getElementById('author-filter').value = 'all';
  document.getElementById('date-filter').value = '';
  document.getElementById('rating-filter').value = '';

  currentFilters = {};
  currentPage = 1;

  updateUrl(currentQuery, {});

  if (currentQuery) {
    performSearch(currentQuery);
  }
}

// Remplir le filtre d'auteur
function populateAuthorFilter(articles) {
  const authors = [...new Set(articles.map(article => article.author))].sort();
  const authorSelect = document.getElementById('author-filter');

  authors.forEach(author => {
    const option = document.createElement('option');
    option.value = author;
    option.textContent = author;
    authorSelect.appendChild(option);
  });
}

// Gestion du tri
function handleSortChange(e) {
  const sortBy = e.target.value;

  if (!currentResults) return;

  let sortedResults = [...currentResults.results];

  switch (sortBy) {
    case 'date':
      sortedResults.sort((a, b) => new Date(b.article.publishedAt) - new Date(a.article.publishedAt));
      break;
    case 'rating':
      sortedResults.sort((a, b) => b.article.rating - a.article.rating);
      break;
    case 'relevance':
    default:
      sortedResults.sort((a, b) => b.score - a.score);
      break;
  }

  currentResults.results = sortedResults;
  displayResults(currentResults);
}

// Gestion de la pagination
function changePage(page) {
  if (!currentResults) return;

  const formattedResults = formatSearchResults(currentResults, page, 10);

  if (page < 1 || page > formattedResults.totalPages) return;

  currentPage = page;
  displayResults(currentResults);
}

function updatePagination(formattedResults) {
  const pagination = document.getElementById('search-pagination');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const currentPageSpan = document.getElementById('current-page');
  const totalPagesSpan = document.getElementById('total-pages');

  currentPageSpan.textContent = formattedResults.currentPage;
  totalPagesSpan.textContent = formattedResults.totalPages;

  prevBtn.disabled = !formattedResults.hasPrevPage;
  nextBtn.disabled = !formattedResults.hasNextPage;

  if (formattedResults.totalPages > 1) {
    pagination.style.display = 'flex';
  } else {
    pagination.style.display = 'none';
  }
}

// Gestion des états d'affichage
function showLoading() {
  document.getElementById('search-loading').style.display = 'flex';
  document.getElementById('no-results').style.display = 'none';
  document.getElementById('search-results-content').style.display = 'none';
}

function hideLoading() {
  document.getElementById('search-loading').style.display = 'none';
}

function showNoResults(query) {
  const noResultsDiv = document.getElementById('no-results');
  const suggestionsList = document.getElementById('no-results-suggestions');

  // Générer des suggestions
  const suggestions = searchEngine.getPopularSuggestions(5);
  const suggestionsHTML = suggestions.map(suggestion =>
    `<li onclick="document.getElementById('main-search-input').value='${suggestion}'; performSearch('${suggestion}')">${suggestion}</li>`
  ).join('');

  suggestionsList.innerHTML = suggestionsHTML;

  noResultsDiv.style.display = 'block';
  document.getElementById('search-results-content').style.display = 'none';
  document.getElementById('search-loading').style.display = 'none';
}

function showResultsContent() {
  document.getElementById('search-results-content').style.display = 'block';
  document.getElementById('no-results').style.display = 'none';
  document.getElementById('search-loading').style.display = 'none';
}

// Gestion de l'URL
function updateUrl(query, filters) {
  const params = new URLSearchParams();

  if (query) params.set('q', query);
  if (filters.category) params.set('category', filters.category);
  if (filters.author) params.set('author', filters.author);
  if (filters.dateRange) params.set('date', filters.dateRange);
  if (filters.minRating) params.set('rating', filters.minRating);

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

function checkUrlForSearch() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');

  if (query) {
    document.getElementById('main-search-input').value = query;
    currentQuery = query;

    // Charger les filtres depuis l'URL
    currentFilters = {
      category: urlParams.get('category') || undefined,
      author: urlParams.get('author') || undefined,
      dateRange: urlParams.get('date') || undefined,
      minRating: urlParams.get('rating') || undefined
    };

    // Nettoyer les filtres undefined
    Object.keys(currentFilters).forEach(key => {
      if (currentFilters[key] === undefined) {
        delete currentFilters[key];
      }
    });

    // Appliquer les filtres dans l'interface
    if (currentFilters.category) document.getElementById('category-filter').value = currentFilters.category;
    if (currentFilters.author) document.getElementById('author-filter').value = currentFilters.author;
    if (currentFilters.dateRange) document.getElementById('date-filter').value = currentFilters.dateRange;
    if (currentFilters.minRating) document.getElementById('rating-filter').value = currentFilters.minRating;

    // Lancer la recherche
    performSearch(query);
  }
}

// Gestion de l'historique de recherche
function setupSearchHistory() {
  // Cette fonctionnalité pourrait être étendue avec un dropdown d'historique
  // Pour l'instant, on sauvegarde simplement dans le moteur de recherche
}

// Fonctions utilitaires
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Exposer les fonctions globales pour les événements HTML
window.performSearch = performSearch;
window.toggleFilters = toggleFilters;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
