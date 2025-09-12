// Les Scoops du Jour - Main JavaScript File

import '../css/main.css';
import '../css/components.css';
import '../css/responsive.css';
import { initAPI, fetchNews, searchNews } from './api.js';
import { renderNews, renderCategories, showLoading, hideLoading } from './components/news.js';
import { createArticleCard } from './components/ArticleCard.js';

// Importer les systèmes d'optimisation
import { initGlobalLazyLoading, measureLoadingPerformance } from './utils/LazyLoader.js';
import { initImageOptimization, initCacheManager } from './utils/ImageOptimizer.js';
import {
  initAssetOptimization,
  measureCoreWebVitals,
  measureRenderTime,
  setupHTTPCaching,
  setupResponseCompression,
  setupNetworkOptimization
} from './utils/AssetOptimizer.js';

// Importer le système PWA
import { initPWACore } from './utils/PWA.js';

// Importer le système SEO
import { initSEOManager, measureSEOEffectiveness } from './utils/SEOManager.js';

// Importer le système AMP
import { initAMPGenerator, setupAutoAMPGeneration } from './utils/AMPGenerator.js';

// Importer l'API Mock robuste
import { initMockAPI, fetchArticles, fetchArticle, searchArticles, rateArticle } from './utils/MockAPI.js';

// Importer le système de stockage utilisateur
import { initStorageManager, saveFavorite, getFavorites, saveReadingHistory, getReadingHistory, saveUserPreferences, getUserPreferences } from './utils/StorageManager.js';

// Importer le composant de préférences utilisateur
import { initUserPreferences } from './components/UserPreferences.js';

// Importer le système newsletter
import { initNewsletter } from './components/Newsletter.js';

// Importer le système de partage social
import { initSocialShare, SocialShare } from './components/SocialShare.js';

// Importer les widgets sociaux
import { initSocialWidgets } from './components/SocialWidgets.js';

// Importer le gestionnaire Open Graph
import { initOpenGraphManager } from './utils/OpenGraphManager.js';

// État de l'application
let currentPage = 1;
let currentCategory = 'all';
let searchQuery = '';
let lastScrollTop = 0;

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  // Mesurer les performances de chargement
  await measureLoadingPerformance(async () => {
    // Initialiser les systèmes d'optimisation en parallèle
    const optimizationPromises = [
      initGlobalLazyLoading(),
      initImageOptimization(),
      initCacheManager(),
      initAssetOptimization()
    ];

    // Attendre que toutes les optimisations soient initialisées
    await Promise.allSettled(optimizationPromises);

    // Initialiser l'API Mock robuste
    initMockAPI();

    // Initialiser le système de stockage utilisateur
    initStorageManager();

    // Initialiser les préférences utilisateur
    initUserPreferences(window.storageManager);

    // Initialiser le système newsletter
    initNewsletter(window.storageManager);

    // Initialiser les widgets sociaux
    initSocialWidgets({
      twitter: { enabled: true },
      facebook: { enabled: true },
      instagram: { enabled: true },
      youtube: { enabled: true }
    });

    // Initialiser le gestionnaire Open Graph
    initOpenGraphManager(window.seoManager);

    // Configurer les écouteurs d'événements
    setupEventListeners();

    // Initialiser les fonctionnalités du header
    initHeaderFeatures();

    // Charger les actualités initiales
    await loadInitialNews();

    // Initialiser les optimisations réseau
    setupHTTPCaching();
    setupResponseCompression();
    setupNetworkOptimization();

    // Mesurer les Core Web Vitals
    measureCoreWebVitals();

    // Initialiser le système PWA
    initPWACore();

    // Initialiser le système SEO
    initSEOManager();

    // Mesurer l'efficacité SEO après initialisation
    setTimeout(() => {
      measureSEOEffectiveness();
    }, 2000);

    // Initialiser le système AMP
    initAMPGenerator();
    setupAutoAMPGeneration();

    console.log('🚀 Application "Les Scoops du Jour" initialisée avec optimisations de performance, PWA, SEO et AMP');
  });
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

  // Recherche instantanée avec suggestions
  searchInput.addEventListener('input', debounce((e) => {
    const query = e.target.value.trim();
    if (query.length > 2) {
      // Ici on pourrait afficher des suggestions instantanées
      // Pour l'instant, on garde simple
    } else {
      // Masquer les suggestions si elles existent
    }
  }, 300));

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
    // Rediriger vers la page de recherche dédiée
    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
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

// ===== FONCTIONNALITÉS DE LA PAGE D'ACCUEIL =====

// Gestion du formulaire newsletter
function initNewsletter() {
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }
}

function handleNewsletterSubmit(e) {
  e.preventDefault();
  const emailInput = e.target.querySelector('.newsletter-input');
  const email = emailInput.value.trim();

  if (email && isValidEmail(email)) {
    // Simulation d'inscription
    showNotification('Merci ! Vous êtes maintenant inscrit à notre newsletter.', 'success');
    emailInput.value = '';
  } else {
    showNotification('Veuillez entrer une adresse email valide.', 'error');
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Gestion des interactions avec les articles
function initArticleInteractions() {
  // Gestion des clics sur les articles
  document.addEventListener('click', (e) => {
    const article = e.target.closest('.news-card, .hero-article, .secondary-article, .category-card-large');
    if (article && !e.target.closest('a')) {
      e.preventDefault();
      handleArticleClick(article);
    }
  });

  // Gestion des clics sur les catégories
  document.addEventListener('click', (e) => {
    const categoryCard = e.target.closest('.category-card-large');
    if (categoryCard) {
      e.preventDefault();
      const category = categoryCard.getAttribute('data-category');
      if (category) {
        // Mettre à jour la navigation
        document.querySelectorAll('.nav a, .mobile-nav a').forEach(link => {
          link.classList.remove('active');
        });

        const navLink = document.querySelector(`.nav a[data-section="${category}"]`);
        const mobileNavLink = document.querySelector(`.mobile-nav a[data-section="${category}"]`);

        if (navLink) navLink.classList.add('active');
        if (mobileNavLink) mobileNavLink.classList.add('active');

        // Changer de catégorie
        currentCategory = category === 'accueil' ? 'all' : category;
        currentPage = 1;
        searchQuery = '';

        loadNews();

        // Scroll vers le haut
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  });
}

function handleArticleClick(article) {
  // Animation de clic
  article.style.transform = 'scale(0.98)';
  setTimeout(() => {
    article.style.transform = '';
  }, 150);

  // Ici vous pourriez naviguer vers l'article complet
  console.log('Article cliqué:', article.querySelector('h3, .hero-title')?.textContent);
}

// Système de notifications
function showNotification(message, type = 'info') {
  // Supprimer les notifications existantes
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());

  // Créer la nouvelle notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${getNotificationIcon(type)}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;

  // Ajouter au DOM
  document.body.appendChild(notification);

  // Animation d'entrée
  setTimeout(() => notification.classList.add('show'), 10);

  // Auto-suppression après 5 secondes
  setTimeout(() => {
    if (notification.parentElement) {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

function getNotificationIcon(type) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  return icons[type] || icons.info;
}

// Animation des éléments au scroll
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  // Observer les éléments à animer
  const animateElements = document.querySelectorAll('.news-card, .category-card-large, .sidebar-widget');
  animateElements.forEach(element => {
    observer.observe(element);
  });
}

// Gestion du lazy loading des images
function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback pour les navigateurs qui ne supportent pas IntersectionObserver
    images.forEach(img => {
      img.src = img.dataset.src;
    });
  }
}

// Améliorations de performance
function initPerformanceOptimizations() {
  // Préchargement des ressources critiques
  const criticalResources = [
    'css/main.css',
    'css/components.css',
    'css/responsive.css'
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = 'style';
    document.head.appendChild(link);
  });
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

// Initialisation des fonctionnalités de la page d'accueil
function initHomePageFeatures() {
  initNewsletter();
  initArticleInteractions();
  initScrollAnimations();
  initLazyLoading();
  initPerformanceOptimizations();
  initArticleCards();
}

// Initialize ArticleCard components for hero and sidebar
function initArticleCards() {
  // Hero article (large variant)
  const heroArticle = {
    id: 'hero-1',
    title: 'Nouveau gouvernement formé : Patrice Talon nomme ses ministres',
    description: 'Le président Patrice Talon a annoncé la composition de son nouveau gouvernement après plusieurs semaines de consultations. Découvrez les principales nominations et les défis qui attendent l\'équipe gouvernementale.',
    urlToImage: 'https://via.placeholder.com/800x500/FE0202/FFFFFF?text=Gouvernement+Talon',
    publishedAt: '12 sept. 2025',
    source: 'Les Scoops du Jour',
    category: 'politique',
    author: 'Marie KPOGNON',
    rating: 4.8
  };

  const heroCard = createArticleCard(heroArticle, 'large', {
    showRating: true,
    showShare: true,
    showBookmark: false,
    lazyLoad: true
  });

  const heroContainer = document.querySelector('.hero-article');
  if (heroContainer) {
    heroContainer.parentNode.replaceChild(heroCard.render(), heroContainer);
  }

  // Popular articles in sidebar (small variant)
  const popularArticles = [
    {
      id: 'popular-1',
      title: 'Nouveau gouvernement : Les premières décisions',
      category: 'politique',
      views: 2450,
      rank: 1
    },
    {
      id: 'popular-2',
      title: 'Économie : Croissance record au Bénin',
      category: 'economie',
      views: 1890,
      rank: 2
    },
    {
      id: 'popular-3',
      title: 'Festival d\'Ouidah : Bilan positif',
      category: 'culture',
      views: 1650,
      rank: 3
    },
    {
      id: 'popular-4',
      title: 'Équipe nationale : Préparation CAN 2025',
      category: 'sport',
      views: 1420,
      rank: 4
    },
    {
      id: 'popular-5',
      title: 'Intelligence artificielle : Nouveau centre',
      category: 'tech',
      views: 1380,
      rank: 5
    }
  ];

  const popularContainer = document.querySelector('.popular-articles');
  if (popularContainer) {
    popularContainer.innerHTML = '';
    popularArticles.forEach(article => {
      const card = createArticleCard(article, 'small', {
        showRating: false,
        showShare: false,
        showBookmark: true,
        lazyLoad: false
      });
      popularContainer.appendChild(card.render());
    });
  }
}

// Ajouter l'initialisation dans la fonction principale
const originalInitApp = window.initApp || function() {};
window.initApp = function() {
  originalInitApp();
  initHomePageFeatures();
};

// Export pour utilisation dans d'autres modules
export { loadNews, currentCategory, currentPage, searchQuery };
