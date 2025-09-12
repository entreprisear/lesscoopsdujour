// Les Scoops du Jour - Main JavaScript File

import '../css/main.css';
import '../css/components.css';
import '../css/responsive.css';
import { initAPI, fetchNews, searchNews } from './api.js';
import { renderNews, renderCategories, showLoading, hideLoading } from './components/news.js';

// État de l'application
let currentPage = 1;
let currentCategory = 'all';
let searchQuery = '';

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // Initialiser l'API
  initAPI();

  // Configurer les écouteurs d'événements
  setupEventListeners();

  // Charger les actualités initiales
  loadInitialNews();
}

function setupEventListeners() {
  // Navigation
  const navLinks = document.querySelectorAll('.nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', handleNavigation);
  });

  // Recherche
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');

  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

  // Catégories
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(card => {
    card.addEventListener('click', handleCategoryClick);
  });

  // Pagination (sera ajouté dynamiquement)
  document.addEventListener('click', handlePagination);
}

function handleNavigation(e) {
  e.preventDefault();
  const target = e.target.getAttribute('href').substring(1);

  // Mettre à jour la navigation active
  document.querySelectorAll('.nav a').forEach(link => {
    link.classList.remove('active');
  });
  e.target.classList.add('active');

  // Changer de catégorie
  currentCategory = target === 'accueil' ? 'all' : target;
  currentPage = 1;
  searchQuery = '';

  loadNews();
}

function handleSearch() {
  const query = document.getElementById('search-input').value.trim();
  if (query) {
    searchQuery = query;
    currentCategory = 'all';
    currentPage = 1;
    loadNews();
  }
}

function handleCategoryClick(e) {
  const category = e.currentTarget.getAttribute('data-category');
  currentCategory = category;
  currentPage = 1;
  searchQuery = '';

  // Mettre à jour la navigation
  document.querySelectorAll('.nav a').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector(`.nav a[href="#${category}"]`).classList.add('active');

  loadNews();
}

function handlePagination(e) {
  if (e.target.classList.contains('page-link') && !e.target.classList.contains('active')) {
    e.preventDefault();
    const page = parseInt(e.target.textContent);
    currentPage = page;
    loadNews();
  }
}

async function loadInitialNews() {
  showLoading();
  try {
    const news = await fetchNews(currentCategory, currentPage);
    renderNews(news);
    renderCategories();
  } catch (error) {
    console.error('Erreur lors du chargement des actualités:', error);
    showError('Erreur lors du chargement des actualités');
  } finally {
    hideLoading();
  }
}

async function loadNews() {
  showLoading();
  try {
    let news;
    if (searchQuery) {
      news = await searchNews(searchQuery, currentPage);
    } else {
      news = await fetchNews(currentCategory, currentPage);
    }
    renderNews(news);
  } catch (error) {
    console.error('Erreur lors du chargement des actualités:', error);
    showError('Erreur lors du chargement des actualités');
  } finally {
    hideLoading();
  }
}

function showError(message) {
  const newsContainer = document.getElementById('news-container');
  newsContainer.innerHTML = `
    <div class="alert alert-danger">
      <h3>Erreur</h3>
      <p>${message}</p>
    </div>
  `;
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

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Export pour utilisation dans d'autres modules
export { loadNews, currentCategory, currentPage, searchQuery };
