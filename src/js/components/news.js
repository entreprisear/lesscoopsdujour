// Les Scoops du Jour - News Components

// Fonction pour afficher le chargement
export function showLoading() {
  const newsContainer = document.getElementById('news-container');
  newsContainer.innerHTML = `
    <div class="loading-container">
      <div class="loading"></div>
      <p>Chargement des actualités...</p>
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

  if (!newsData || !newsData.articles || newsData.articles.length === 0) {
    newsContainer.innerHTML = `
      <div class="no-news">
        <h3>Aucune actualité trouvée</h3>
        <p>Il n'y a pas d'articles disponibles pour le moment.</p>
      </div>
    `;
    return;
  }

  const newsHTML = newsData.articles.map(article => createNewsCard(article)).join('');

  newsContainer.innerHTML = `
    <div class="news-header">
      <h2>Actualités récentes</h2>
      <p>${newsData.totalResults} articles trouvés</p>
    </div>
    <div class="news-grid">
      ${newsHTML}
    </div>
    ${createPagination(newsData)}
  `;
}

// Fonction pour créer une carte d'actualité
function createNewsCard(article) {
  return `
    <article class="news-card" data-id="${article.id}">
      <img src="${article.urlToImage}" alt="${article.title}" loading="lazy">
      <div class="news-card-content">
        <h3>${article.title}</h3>
        <p>${article.description || 'Aucune description disponible'}</p>
        <div class="news-card-meta">
          <span class="source">${article.source}</span>
          <span class="date">${article.publishedAt}</span>
          <span class="category-badge badge badge-${getCategoryColor(article.category)}">${article.category}</span>
        </div>
        <a href="${article.url}" class="btn btn-primary" target="_blank" rel="noopener">
          Lire l'article
        </a>
      </div>
    </article>
  `;
}

// Fonction pour obtenir la couleur de la catégorie
function getCategoryColor(category) {
  const colors = {
    politique: 'primary',
    economie: 'success',
    culture: 'info',
    sport: 'warning',
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

// Fonction utilitaire pour tronquer le texte
export function truncateText(text, maxLength = 150) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}
