// Les Scoops du Jour - Forum Category Page JavaScript
// Gestion de la page de catégorie du forum

import { generateMockForumData, formatForumDate, getCategoryIcon, getCategoryColor } from './utils/ForumData.js';

// État de la catégorie
let currentCategory = null;
let categoryThreads = [];
let currentPage = 1;
let currentSort = 'latest';
let threadsPerPage = 10;

// Initialisation de la page catégorie
document.addEventListener('DOMContentLoaded', () => {
  initCategoryPage();
});

function initCategoryPage() {
  // Récupérer l'ID de la catégorie depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get('category');

  if (!categoryId) {
    window.location.href = 'forum.html';
    return;
  }

  // Charger les données du forum
  const forumData = generateMockForumData();

  // Trouver la catégorie
  currentCategory = forumData.categories.find(cat => cat.id === categoryId);

  if (!currentCategory) {
    window.location.href = 'forum.html';
    return;
  }

  // Filtrer les discussions de cette catégorie
  categoryThreads = forumData.threads.filter(thread => thread.category === categoryId);

  // Initialiser l'interface
  initCategoryHeader();
  initThreadsList();
  initEventListeners();

  console.log('📂 Page catégorie initialisée:', currentCategory.name);
}

// Initialiser le header de la catégorie
function initCategoryHeader() {
  // Mettre à jour le titre de la page
  document.title = `${currentCategory.name} - Forum Communautaire - Les Scoops du Jour`;

  // Mettre à jour les éléments HTML
  document.getElementById('page-title').textContent = `${currentCategory.name} - Forum Communautaire - Les Scoops du Jour`;
  document.getElementById('page-description').content = `Discussions dans la catégorie ${currentCategory.name}`;

  // Mettre à jour le breadcrumb
  document.getElementById('breadcrumb-category').textContent = currentCategory.name;

  // Mettre à jour les informations de la catégorie
  document.getElementById('category-icon').textContent = currentCategory.icon;
  document.getElementById('category-icon').style.backgroundColor = currentCategory.color;
  document.getElementById('category-title').textContent = currentCategory.name;
  document.getElementById('category-description').textContent = currentCategory.description;

  // Statistiques de la catégorie
  const threadCount = categoryThreads.length;
  const postCount = categoryThreads.reduce((sum, thread) => sum + thread.getPostCount(), 0);

  document.getElementById('category-threads').textContent = `${threadCount} discussion${threadCount > 1 ? 's' : ''}`;
  document.getElementById('category-posts').textContent = `${postCount} message${postCount > 1 ? 's' : ''}`;
}

// Initialiser la liste des discussions
function initThreadsList() {
  sortThreads(currentSort);
  renderThreadsList();

  // Masquer l'état vide si nécessaire
  const emptyState = document.getElementById('empty-state');
  if (categoryThreads.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
  }
}

// Trier les discussions
function sortThreads(sortBy) {
  currentSort = sortBy;

  switch (sortBy) {
    case 'popular':
      categoryThreads.sort((a, b) => (b.likes + b.getPostCount()) - (a.likes + a.getPostCount()));
      break;
    case 'oldest':
      categoryThreads.sort((a, b) => a.createdAt - b.createdAt);
      break;
    case 'pinned':
      categoryThreads.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.lastActivity - a.lastActivity;
      });
      break;
    case 'latest':
    default:
      categoryThreads.sort((a, b) => b.lastActivity - a.lastActivity);
      break;
  }
}

// Rendre la liste des discussions
function renderThreadsList() {
  const threadsList = document.getElementById('threads-list');
  const startIndex = (currentPage - 1) * threadsPerPage;
  const endIndex = startIndex + threadsPerPage;
  const paginatedThreads = categoryThreads.slice(startIndex, endIndex);

  const threadsHTML = paginatedThreads.map(thread => renderThreadItem(thread)).join('');
  threadsList.innerHTML = threadsHTML;

  // Mettre à jour la pagination
  updatePagination();

  // Mettre à jour le compteur
  const totalThreads = categoryThreads.length;
  document.getElementById('threads-count').textContent = `${totalThreads} discussion${totalThreads > 1 ? 's' : ''}`;
}

// Rendre un élément de discussion
function renderThreadItem(thread) {
  const lastPost = thread.getLastPost();
  const participantCount = thread.getParticipantCount();
  const isPopular = thread.views > 100 || thread.likes > 10;
  const isNew = (new Date() - thread.createdAt) < (24 * 60 * 60 * 1000); // Moins de 24h

  return `
    <div class="thread-item ${thread.pinned ? 'pinned' : ''}" data-thread-id="${thread.id}">
      <div class="thread-icon">
        <span style="color: ${getCategoryColor(thread.category)}">${getCategoryIcon(thread.category)}</span>
      </div>

      <div class="thread-content">
        <div class="thread-title">
          <a href="forum-thread.html?thread=${thread.id}">${thread.title}</a>
          ${thread.pinned ? '<span class="thread-badge pinned">📌 Épinglé</span>' : ''}
          ${isPopular ? '<span class="thread-badge popular">🔥 Populaire</span>' : ''}
          ${isNew ? '<span class="thread-badge new">🆕 Nouveau</span>' : ''}
          ${thread.locked ? '<span class="thread-badge locked">🔒 Verrouillé</span>' : ''}
        </div>

        <div class="thread-excerpt">
          ${thread.content.substring(0, 150)}${thread.content.length > 150 ? '...' : ''}
        </div>

        <div class="thread-meta">
          <span class="thread-author">
            <img src="${thread.author.avatar}" alt="${thread.author.displayName}" class="author-avatar-small">
            ${thread.author.displayName}
          </span>
          <span class="thread-stats">
            👁️ ${thread.views} • 💬 ${thread.getPostCount()} • 👥 ${participantCount}
          </span>
          <span class="thread-date">
            ${formatForumDate(thread.lastActivity)}
            ${lastPost ? `par ${lastPost.author.displayName}` : ''}
          </span>
        </div>
      </div>
    </div>
  `;
}

// Mettre à jour la pagination
function updatePagination() {
  const totalPages = Math.ceil(categoryThreads.length / threadsPerPage);
  const pagination = document.getElementById('threads-pagination');

  if (totalPages <= 1) {
    pagination.style.display = 'none';
    return;
  }

  pagination.style.display = 'flex';

  // Boutons de pagination
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const currentPageSpan = document.getElementById('current-page');
  const totalPagesSpan = document.getElementById('total-pages');

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
  currentPageSpan.textContent = currentPage;
  totalPagesSpan.textContent = totalPages;
}

// Initialiser les événements
function initEventListeners() {
  // Tri des discussions
  const sortSelect = document.getElementById('sort-select');
  sortSelect.addEventListener('change', (e) => {
    sortThreads(e.target.value);
    currentPage = 1;
    renderThreadsList();
  });

  // Pagination
  document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderThreadsList();
    }
  });

  document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(categoryThreads.length / threadsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderThreadsList();
    }
  });

  // Navigation vers les discussions
  document.getElementById('threads-list').addEventListener('click', (e) => {
    const threadLink = e.target.closest('a[href*="forum-thread.html"]');
    if (threadLink) {
      e.preventDefault();
      const href = threadLink.getAttribute('href');
      window.location.href = href;
    }
  });

  // Bouton "Voir les règles"
  document.getElementById('category-rules').addEventListener('click', (e) => {
    if (e.target.id === 'show-guidelines') {
      e.preventDefault();
      showGuidelines();
    }
  });
}

// Afficher les règles de la catégorie
function showGuidelines() {
  const guidelines = `
    Règles de la catégorie "${currentCategory.name}" :

    • Restez courtois et respectueux envers tous les participants
    • Évitez les attaques personnelles et les propos haineux
    • Restez constructif et argumentez vos points de vue
    • Ne partagez pas d'informations fausses ou trompeuses
    • Respectez la vie privée des individus
    • Utilisez les mentions @ pour interpeller quelqu'un
    • Signalez tout contenu inapproprié aux modérateurs

    Rappel : Cette communauté est dédiée aux échanges constructifs sur l'actualité béninoise.
  `;

  alert(guidelines);
}

// Fonctions utilitaires
function getThreadById(threadId) {
  return categoryThreads.find(thread => thread.id === threadId);
}

// Export pour utilisation externe
window.currentCategory = currentCategory;
window.categoryThreads = categoryThreads;
