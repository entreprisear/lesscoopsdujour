// Les Scoops du Jour - Forum Main Page JavaScript
// Gestion de la page principale du forum communautaire

import { generateMockForumData, formatForumDate, getCategoryIcon, getCategoryColor } from './utils/ForumData.js';

// État du forum
let forumData = null;
let currentUser = null;

// Initialisation de la page forum
document.addEventListener('DOMContentLoaded', () => {
  initForumPage();
});

function initForumPage() {
  // Charger les données du forum
  loadForumData();

  // Initialiser les composants
  initForumStats();
  initCategoriesGrid();
  initRecentActivity();
  initOnlineUsers();

  // Configurer les événements
  setupEventListeners();

  console.log('💬 Page forum initialisée');
}

// Charger les données du forum
function loadForumData() {
  forumData = generateMockForumData();
  currentUser = forumData.currentUser;

  console.log('📊 Données forum chargées:', {
    categories: forumData.categories.length,
    threads: forumData.threads.length,
    users: forumData.users.length
  });
}

// Initialiser les statistiques du forum
function initForumStats() {
  const totalThreads = forumData.threads.length;
  const totalPosts = forumData.threads.reduce((sum, thread) => sum + thread.getPostCount(), 0);
  const totalMembers = forumData.users.length;

  document.getElementById('total-threads').textContent = totalThreads.toLocaleString();
  document.getElementById('total-posts').textContent = totalPosts.toLocaleString();
  document.getElementById('total-members').textContent = totalMembers.toLocaleString();
}

// Initialiser la grille des catégories
function initCategoriesGrid() {
  const categoriesGrid = document.getElementById('categories-grid');
  if (!categoriesGrid) return;

  const categoriesHTML = forumData.categories.map(category => {
    const threadCount = forumData.threads.filter(thread => thread.category === category.id).length;
    const postCount = forumData.threads
      .filter(thread => thread.category === category.id)
      .reduce((sum, thread) => sum + thread.getPostCount(), 0);

    const lastActivity = forumData.threads
      .filter(thread => thread.category === category.id)
      .sort((a, b) => b.lastActivity - a.lastActivity)[0];

    return `
      <div class="category-card" data-category="${category.id}">
        <div class="category-header">
          <div class="category-icon" style="background-color: ${category.color}">
            ${category.icon}
          </div>
          <div class="category-info">
            <h3 class="category-title">
              <a href="forum-category.html?category=${category.id}">${category.name}</a>
            </h3>
            <p class="category-description">${category.description}</p>
          </div>
        </div>

        <div class="category-stats">
          <div class="stat-item">
            <span class="stat-number">${threadCount}</span>
            <span class="stat-label">discussions</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${postCount}</span>
            <span class="stat-label">messages</span>
          </div>
        </div>

        <div class="category-footer">
          ${lastActivity ?
            `<div class="last-activity">
              <span class="activity-text">Dernière activité ${formatForumDate(lastActivity.lastActivity)}</span>
              <span class="activity-author">par ${lastActivity.author.displayName}</span>
            </div>` :
            '<div class="last-activity">Aucune activité</div>'
          }
        </div>
      </div>
    `;
  }).join('');

  categoriesGrid.innerHTML = categoriesHTML;
}

// Initialiser l'activité récente
function initRecentActivity() {
  const activityList = document.getElementById('activity-list');
  if (!activityList) return;

  // Récupérer les 10 dernières activités
  const recentActivities = forumData.threads
    .sort((a, b) => b.lastActivity - a.lastActivity)
    .slice(0, 10);

  const activitiesHTML = recentActivities.map(thread => {
    const category = forumData.categories.find(cat => cat.id === thread.category);
    const lastPost = thread.getLastPost();

    return `
      <div class="activity-item">
        <div class="activity-icon">
          <span style="color: ${category.color}">${category.icon}</span>
        </div>
        <div class="activity-content">
          <div class="activity-thread">
            <a href="forum-thread.html?thread=${thread.id}">${thread.title}</a>
          </div>
          <div class="activity-meta">
            <span class="activity-category">${category.name}</span>
            <span class="activity-time">${formatForumDate(thread.lastActivity)}</span>
            ${lastPost ? `<span class="activity-author">par ${lastPost.author.displayName}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  activityList.innerHTML = activitiesHTML;
}

// Initialiser les utilisateurs en ligne
function initOnlineUsers() {
  const onlineUsersList = document.getElementById('online-users-list');
  const onlineCount = document.getElementById('online-count');

  if (!onlineUsersList || !onlineCount) return;

  // Simuler des utilisateurs en ligne (30% des utilisateurs)
  const onlineUsers = forumData.users
    .filter(() => Math.random() > 0.7)
    .slice(0, 8); // Maximum 8 utilisateurs affichés

  const onlineUsersHTML = onlineUsers.map(user => `
    <div class="online-user" title="${user.displayName}">
      <img src="${user.avatar}" alt="${user.displayName}" class="online-user-avatar">
      <span class="online-user-status"></span>
    </div>
  `).join('');

  onlineUsersList.innerHTML = onlineUsersHTML;
  onlineCount.textContent = onlineUsers.length;
}

// Configurer les événements
function setupEventListeners() {
  // Recherche dans le forum
  const forumSearch = document.getElementById('forum-search');
  const forumSearchBtn = document.getElementById('forum-search-btn');

  if (forumSearch && forumSearchBtn) {
    forumSearchBtn.addEventListener('click', () => {
      const query = forumSearch.value.trim();
      if (query) {
        window.location.href = `search.html?q=${encodeURIComponent(query)}&type=forum`;
      }
    });

    forumSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = forumSearch.value.trim();
        if (query) {
          window.location.href = `search.html?q=${encodeURIComponent(query)}&type=forum`;
        }
      }
    });
  }

  // Navigation vers les catégories
  const categoriesGrid = document.getElementById('categories-grid');
  if (categoriesGrid) {
    categoriesGrid.addEventListener('click', (e) => {
      const categoryCard = e.target.closest('.category-card');
      if (categoryCard) {
        const categoryId = categoryCard.getAttribute('data-category');
        window.location.href = `forum-category.html?category=${categoryId}`;
      }
    });
  }

  // Navigation vers les discussions depuis l'activité récente
  const activityList = document.getElementById('activity-list');
  if (activityList) {
    activityList.addEventListener('click', (e) => {
      const threadLink = e.target.closest('a[href*="forum-thread.html"]');
      if (threadLink) {
        e.preventDefault();
        const href = threadLink.getAttribute('href');
        window.location.href = href;
      }
    });
  }
}

// Fonctions utilitaires
function getThreadCount() {
  return forumData.threads.length;
}

function getPostCount() {
  return forumData.threads.reduce((sum, thread) => sum + thread.getPostCount(), 0);
}

function getMemberCount() {
  return forumData.users.length;
}

function getCategoryById(categoryId) {
  return forumData.categories.find(cat => cat.id === categoryId);
}

function getThreadById(threadId) {
  return forumData.threads.find(thread => thread.id === threadId);
}

function getUserById(userId) {
  return forumData.users.find(user => user.id === userId);
}

// Export pour utilisation externe
window.forumData = forumData;
window.currentUser = currentUser;
window.getThreadCount = getThreadCount;
window.getPostCount = getPostCount;
window.getMemberCount = getMemberCount;
