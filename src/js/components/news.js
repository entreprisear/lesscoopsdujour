// Les Scoops du Jour - News Components

import { ArticleCard, createArticleCard } from './ArticleCard.js';

// Store card instances for cleanup
let cardInstances = [];

// Fonction pour afficher le chargement
export function showLoading() {
  const newsContainer = document.getElementById('news-container');

  // Clear existing cards
  cleanupCards();

  // Show skeletons
  const skeletonHTML = Array(6).fill(null).map(() =>
    ArticleCard.createSkeleton('medium').outerHTML
  ).join('');

  newsContainer.innerHTML = `
    <div class="news-header">
      <h2>Actualités récentes</h2>
      <p>Chargement...</p>
    </div>
    <div class="news-grid">
      ${skeletonHTML}
    </div>
  `;
}

// Fonction pour masquer le chargement
export function hideLoading() {
  // Le contenu sera remplacé par renderNews
}

// Fonction pour rendre les actualités
export function renderNews(newsData) {
  const newsContainer = document.getElementById('news-container');

  // Clear existing cards
  cleanupCards();

  if (!newsData || !newsData.articles || newsData.articles.length === 0) {
    newsContainer.innerHTML = `
      <div class="no-news">
        <h3>Aucune actualité trouvée</h3>
        <p>Il n'y a pas d'articles disponibles pour le moment.</p>
      </div>
    `;
    return;
  }

  // Create card instances
  const cards = newsData.articles.map(article => {
    const card = createArticleCard(article, 'medium', {
      showRating: true,
      showShare: true,
      showBookmark: true,
      lazyLoad: true
    });
    cardInstances.push(card);
    return card.render();
  });

  newsContainer.innerHTML = `
    <div class="news-header">
      <h2>Actualités récentes</h2>
      <p>${newsData.totalResults} articles trouvés</p>
    </div>
    <div class="news-grid">
      ${cards.map(card => card.outerHTML).join('')}
    </div>
    ${createPagination(newsData)}
  `;

  // Re-attach card instances to DOM elements
  attachCardInstances();
}

// Fonction pour créer les étoiles de notation
function createStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let starsHTML = '';

  // Étoiles pleines
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<span class="star full">★</span>';
  }

  // Demi-étoile
  if (hasHalfStar) {
    starsHTML += '<span class="star half">★</span>';
  }

  // Étoiles vides
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<span class="star empty">★</span>';
  }

  return starsHTML;
}

// Fonction pour obtenir la couleur de la catégorie
function getCategoryColor(category) {
  const colors = {
    politique: 'primary',
    economie: 'success',
    culture: 'info',
    sport: 'warning',
    education: 'info',
    sante: 'success',
    tech: 'primary',
    environnement: 'success',
    justice: 'warning',
    agriculture: 'success',
    general: 'secondary'
  };
  return colors[category] || 'secondary';
}

// Fonction pour créer la pagination
function createPagination(newsData) {
  const totalPages = Math.ceil(newsData.totalResults / 12); // 12 articles par page
  const currentPage = newsData.currentPage || 1;

  if (totalPages <= 1) {
    return '';
  }

  let paginationHTML = '<div class="pagination">';

  // Bouton précédent
  if (currentPage > 1) {
    paginationHTML += `<a href="#" class="page-link" data-page="${currentPage - 1}">Précédent</a>`;
  }

  // Pages
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    paginationHTML += `<a href="#" class="page-link" data-page="1">1</a>`;
    if (startPage > 2) {
      paginationHTML += '<span class="page-dots">...</span>';
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const activeClass = i === currentPage ? ' active' : '';
    paginationHTML += `<a href="#" class="page-link${activeClass}" data-page="${i}">${i}</a>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += '<span class="page-dots">...</span>';
    }
    paginationHTML += `<a href="#" class="page-link" data-page="${totalPages}">${totalPages}</a>`;
  }

  // Bouton suivant
  if (currentPage < totalPages) {
    paginationHTML += `<a href="#" class="page-link" data-page="${currentPage + 1}">Suivant</a>`;
  }

  paginationHTML += '</div>';

  return paginationHTML;
}

// Fonction pour rendre les catégories
export function renderCategories() {
  // Les catégories sont déjà dans le HTML, mais on peut les mettre à jour dynamiquement si nécessaire
  const categories = [
    { id: 'politique', name: 'Politique', description: 'Actualités politiques' },
    { id: 'economie', name: 'Économie', description: 'Économie et finance' },
    { id: 'culture', name: 'Culture', description: 'Culture et arts' },
    { id: 'sport', name: 'Sport', description: 'Sports et loisirs' }
  ];

  const categoryContainer = document.querySelector('.category-grid');
  if (categoryContainer) {
    categoryContainer.innerHTML = categories.map(category =>
      createCategoryCard(category)
    ).join('');
  }
}

// Fonction pour créer une carte de catégorie
function createCategoryCard(category) {
  return `
    <div class="category-card" data-category="${category.id}">
      <h4>${category.name}</h4>
      <p>${category.description}</p>
    </div>
  `;
}

// Fonction pour afficher un article en détail (modal)
export function showArticleModal(article) {
  const modalHTML = `
    <div class="modal show" id="article-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>${article.title}</h3>
          <button class="close-modal" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <img src="${article.urlToImage}" alt="${article.title}" style="width: 100%; margin-bottom: 1rem;">
          <div class="article-meta" style="margin-bottom: 1rem;">
            <span class="badge badge-${getCategoryColor(article.category)}">${article.category}</span>
            <span>${article.source} - ${article.publishedAt}</span>
            <span>Par ${article.author}</span>
          </div>
          <p>${article.description}</p>
          <div class="article-content">
            ${article.content || 'Contenu complet non disponible.'}
          </div>
        </div>
        <div class="modal-footer">
          <a href="${article.url}" class="btn btn-primary" target="_blank" rel="noopener">
            Lire l'article complet
          </a>
          <button class="btn btn-secondary" onclick="closeModal()">Fermer</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Fonction pour fermer la modal
export function closeModal() {
  const modal = document.getElementById('article-modal');
  if (modal) {
    modal.remove();
  }
}

// Fonction pour afficher une notification
export function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type}`;
  notification.innerHTML = `
    <p>${message}</p>
    <button onclick="this.parentElement.remove()">&times;</button>
  `;

  // Insérer au début du body
  document.body.insertBefore(notification, document.body.firstChild);

  // Auto-suppression après 5 secondes
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Fonction pour gérer les erreurs
export function handleError(error, context = '') {
  console.error(`Erreur dans ${context}:`, error);

  let message = 'Une erreur inattendue s\'est produite.';

  if (error.message) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  showNotification(message, 'danger');
}

// Fonction utilitaire pour formater la date
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper functions for card management
function cleanupCards() {
  cardInstances.forEach(card => {
    card.destroy();
  });
  cardInstances = [];
}

function attachCardInstances() {
  // Re-attach event listeners to DOM elements after HTML update
  const newsContainer = document.getElementById('news-container');
  const cardElements = newsContainer.querySelectorAll('.article-card');

  cardElements.forEach((element, index) => {
    if (cardInstances[index]) {
      // Update the element reference in the card instance
      cardInstances[index].element = element;
      cardInstances[index].attachEventListeners();
    }
  });
}

// Fonction utilitaire pour tronquer le texte
export function truncateText(text, maxLength = 150) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}
