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
let lastScrollTop = 0;

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // Initialiser l'API
  initAPI();

  // Configurer les écouteurs d'événements
  setupEventListeners();

  // Initialiser les fonctionnalités du header
  initHeaderFeatures();

  // Charger les actualités initiales
  loadInitialNews();
}

function initHeaderFeatures() {
  // Header scroll effect
  initScrollHeader();

  // Mobile menu
  initMobileMenu();

  // Search functionality
  initSearch();

  // Set active navigation based on current section
  setActiveNavigation();
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

// ===== FONCTIONNALITÉS DU HEADER =====

// Header scroll effect
function initScrollHeader() {
  const header = document.getElementById('main-header');
  const scrollThreshold = 100;

  window.addEventListener('scroll', throttle(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > scrollThreshold) {
      header.classList.add('scrolled');
      if (scrollTop > lastScrollTop && scrollTop > 200) {
        header.classList.add('shrunk');
      } else {
        header.classList.remove('shrunk');
      }
    } else {
      header.classList.remove('scrolled', 'shrunk');
    }

    lastScrollTop = scrollTop;
  }, 16)); // ~60fps
}

// Mobile menu functionality
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger-menu');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavClose = document.getElementById('mobile-nav-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

  // Toggle mobile menu
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
  });

  // Close mobile menu
  mobileNavClose.addEventListener('click', () => {
    closeMobileMenu();
  });

  // Close on overlay click
  mobileNav.addEventListener('click', (e) => {
    if (e.target === mobileNav) {
      closeMobileMenu();
    }
  });

  // Close on link click
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
      // Handle navigation
      handleMobileNavigation(link);
    });
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
      closeMobileMenu();
    }
  });
}

function closeMobileMenu() {
  const hamburger = document.getElementById('hamburger-menu');
  const mobileNav = document.getElementById('mobile-nav');

  hamburger.classList.remove('active');
  mobileNav.classList.remove('active');
  document.body.style.overflow = '';
}

function handleMobileNavigation(link) {
  const section = link.getAttribute('data-section');

  // Update active states
  document.querySelectorAll('.nav a, .mobile-nav a').forEach(navLink => {
    navLink.classList.remove('active');
  });

  // Set active on both desktop and mobile
  document.querySelector(`.nav a[data-section="${section}"]`).classList.add('active');
  document.querySelector(`.mobile-nav a[data-section="${section}"]`).classList.add('active');

  // Handle category change
  currentCategory = section === 'accueil' ? 'all' : section;
  currentPage = 1;
  searchQuery = '';

  loadNews();
}

// Search functionality
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const mobileSearchInput = document.getElementById('mobile-search-input');
  const searchBtn = document.getElementById('search-btn');
  const mobileSearchBtn = document.getElementById('mobile-search-btn');
  const searchResults = document.getElementById('search-results');

  let searchTimeout;

  // Desktop search
  searchInput.addEventListener('input', debounce((e) => {
    const query = e.target.value.trim();
    if (query.length > 2) {
      performSearch(query, searchResults);
    } else {
      searchResults.style.display = 'none';
    }
  }, 300));

  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length > 2) {
      searchResults.style.display = 'block';
    }
  });

  searchInput.addEventListener('blur', () => {
    // Delay hiding to allow clicking on results
    setTimeout(() => {
      searchResults.style.display = 'none';
    }, 200);
  });

  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      performFullSearch(query);
    }
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        performFullSearch(query);
      }
    }
  });

  // Mobile search
  mobileSearchInput.addEventListener('input', debounce((e) => {
    const query = e.target.value.trim();
    if (query.length > 2) {
      // For mobile, we can show suggestions or just prepare for search
      console.log('Mobile search query:', query);
    }
  }, 300));

  mobileSearchBtn.addEventListener('click', () => {
    const query = mobileSearchInput.value.trim();
    if (query) {
      performFullSearch(query);
      closeMobileMenu();
    }
  });

  mobileSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = mobileSearchInput.value.trim();
      if (query) {
        performFullSearch(query);
        closeMobileMenu();
      }
    }
  });

  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });
}

async function performSearch(query, resultsContainer) {
  try {
    // This would typically call a search API
    // For demo purposes, we'll show mock results
    const mockResults = [
      { title: 'Nouveau gouvernement formé', category: 'Politique', date: '2025-01-15' },
      { title: 'Économie béninoise en croissance', category: 'Économie', date: '2025-01-14' },
      { title: 'Festival de Ouidah 2025', category: 'Culture', date: '2025-01-13' },
      { title: 'Victoire en Coupe d\'Afrique', category: 'Sport', date: '2025-01-12' }
    ].filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );

    if (mockResults.length > 0) {
      resultsContainer.innerHTML = mockResults.map(result => `
        <div class="search-result-item" data-query="${query}">
          <div class="font-weight-medium">${result.title}</div>
          <div class="text-sm text-muted">${result.category} • ${result.date}</div>
        </div>
      `).join('');

      resultsContainer.style.display = 'block';

      // Add click handlers for search results
      resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const selectedQuery = item.getAttribute('data-query');
          performFullSearch(selectedQuery);
        });
      });
    } else {
      resultsContainer.innerHTML = `
        <div class="search-result-item">
          <div class="text-muted">Aucun résultat trouvé pour "${query}"</div>
        </div>
      `;
      resultsContainer.style.display = 'block';
    }
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
  }
}

function performFullSearch(query) {
  searchQuery = query;
  currentCategory = 'all';
  currentPage = 1;

  // Update search input
  document.getElementById('search-input').value = query;
  document.getElementById('mobile-search-input').value = query;

  // Hide search results
  document.getElementById('search-results').style.display = 'none';

  // Load search results
  loadNews();

  // Update URL hash for search
  window.location.hash = `search=${encodeURIComponent(query)}`;
}

// Set active navigation based on current section
function setActiveNavigation() {
  const hash = window.location.hash.substring(1);

  if (hash) {
    if (hash.startsWith('search=')) {
      const query = decodeURIComponent(hash.split('=')[1]);
      document.getElementById('search-input').value = query;
      document.getElementById('mobile-search-input').value = query;
      performFullSearch(query);
    } else {
      // Set active navigation for category
      const navLinks = document.querySelectorAll('.nav a, .mobile-nav a');
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${hash}`) {
          link.classList.add('active');
        }
      });

      currentCategory = hash === 'accueil' ? 'all' : hash;
      loadNews();
    }
  }
}

// Update body padding to account for fixed header
function updateBodyPadding() {
  const header = document.getElementById('main-header');
  const breakingNews = document.querySelector('.breaking-news');
  const headerHeight = header.offsetHeight;
  const breakingNewsHeight = breakingNews ? breakingNews.offsetHeight : 0;

  document.body.style.paddingTop = `${headerHeight + breakingNewsHeight}px`;
}

// Initialize body padding on load and resize
window.addEventListener('load', updateBodyPadding);
window.addEventListener('resize', debounce(updateBodyPadding, 100));

// Export pour utilisation dans d'autres modules
export { loadNews, currentCategory, currentPage, searchQuery };
