// Les Scoops du Jour - Forum Thread Page JavaScript
// Gestion de la page de discussion complète du forum

import { generateMockForumData, formatForumDate, getCategoryIcon, getCategoryColor, ForumPost } from './utils/ForumData.js';

// État de la discussion
let currentThread = null;
let currentUser = null;
let posts = [];
let currentPage = 1;
let postsPerPage = 15;

// Initialisation de la page discussion
document.addEventListener('DOMContentLoaded', () => {
  initThreadPage();
});

function initThreadPage() {
  // Récupérer l'ID de la discussion depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const threadId = urlParams.get('thread');

  if (!threadId) {
    window.location.href = 'forum.html';
    return;
  }

  // Charger les données du forum
  const forumData = generateMockForumData();
  currentUser = forumData.currentUser;

  // Trouver la discussion
  currentThread = forumData.threads.find(thread => thread.id === threadId);

  if (!currentThread) {
    window.location.href = 'forum.html';
    return;
  }

  // Préparer les posts (message principal + réponses)
  posts = [currentThread, ...currentThread.posts];

  // Incrémenter les vues
  currentThread.incrementViews();

  // Initialiser l'interface
  initThreadHeader();
  initPostsList();
  initReplyForm();
  initEventListeners();

  console.log('🧵 Page discussion initialisée:', currentThread.title);
}

// Initialiser le header de la discussion
function initThreadHeader() {
  const category = getCategoryInfo(currentThread.category);

  // Mettre à jour le titre de la page
  document.title = `${currentThread.title} - Forum Communautaire - Les Scoops du Jour`;

  // Mettre à jour les éléments HTML
  document.getElementById('page-title').textContent = `${currentThread.title} - Forum Communautaire - Les Scoops du Jour`;
  document.getElementById('page-description').content = currentThread.content.substring(0, 160);

  // Mettre à jour le breadcrumb
  document.getElementById('breadcrumb-category').innerHTML = `<a href="forum-category.html?category=${currentThread.category}">${category.name}</a>`;
  document.getElementById('category-link').href = `forum-category.html?category=${currentThread.category}`;
  document.getElementById('breadcrumb-thread').textContent = currentThread.title;

  // Header de la discussion
  document.getElementById('thread-status').className = `status-indicator ${currentThread.pinned ? 'pinned' : ''} ${currentThread.locked ? 'locked' : ''}`;
  document.getElementById('thread-category').textContent = category.name;
  document.getElementById('thread-title').textContent = currentThread.title;

  // Auteur
  document.getElementById('author-avatar').src = currentThread.author.avatar;
  document.getElementById('author-name').textContent = currentThread.author.displayName;
  document.getElementById('author-role').textContent = getRoleDisplayName(currentThread.author.role);

  // Statistiques
  document.getElementById('thread-views').textContent = `👁️ ${currentThread.views} vues`;
  document.getElementById('thread-replies').textContent = `💬 ${currentThread.getPostCount()} réponses`;
  document.getElementById('thread-created').textContent = `Créé ${formatForumDate(currentThread.createdAt)}`;

  // Likes
  document.getElementById('thread-likes').textContent = currentThread.likes;

  // Actions d'administration
  if (currentUser.canModerate()) {
    document.getElementById('thread-admin-actions').style.display = 'flex';
  }
}

// Initialiser la liste des messages
function initPostsList() {
  renderPostsList();
}

// Rendre la liste des messages
function renderPostsList() {
  const postsList = document.getElementById('posts-list');
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = posts.slice(startIndex, endIndex);

  const postsHTML = paginatedPosts.map((post, index) => renderPost(post, index === 0)).join('');
  postsList.innerHTML = postsHTML;

  // Mettre à jour la pagination
  updatePostsPagination();
}

// Rendre un message
function renderPost(post, isMainPost = false) {
  const timeAgo = formatForumDate(post.createdAt);
  const likes = post.likes + (post.likedByUser ? 1 : 0);

  if (isMainPost) {
    // Message principal (différent design)
    return `
      <div class="post-item main-post" data-post-id="${post.id}">
        <div class="post-header">
          <div class="post-author">
            <img src="${post.author.avatar}" alt="${post.author.displayName}" class="post-avatar">
            <div class="post-info">
              <span class="post-author-name">${post.author.displayName}</span>
              <span class="post-meta">${getRoleDisplayName(post.author.role)} • ${timeAgo}</span>
            </div>
          </div>
          <div class="post-actions">
            <button class="post-action" data-action="quote" title="Citer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/>
              </svg>
            </button>
            <button class="post-action" data-action="report" title="Signaler">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="post-content">
          <div class="post-text">
            ${formatPostContent(post.content)}
          </div>
          ${post.tags && post.tags.length > 0 ? `
            <div class="post-tags">
              ${post.tags.map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>

        <div class="post-footer">
          <div class="post-stats">
            <span class="post-likes">👍 ${likes}</span>
          </div>
          <div class="post-buttons">
            <button class="post-action like-btn ${post.likedByUser ? 'liked' : ''}" data-action="like">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              ${likes}
            </button>
            <button class="post-action" data-action="reply">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
              </svg>
              Répondre
            </button>
          </div>
        </div>
      </div>
    `;
  } else {
    // Réponse normale
    return `
      <div class="post-item reply-post" data-post-id="${post.id}">
        <div class="post-header">
          <div class="post-author">
            <img src="${post.author.avatar}" alt="${post.author.displayName}" class="post-avatar">
            <div class="post-info">
              <span class="post-author-name">${post.author.displayName}</span>
              <span class="post-meta">${getRoleDisplayName(post.author.role)} • ${timeAgo}</span>
              ${post.edited ? '<span class="post-edited">(édité)</span>' : ''}
            </div>
          </div>
          <div class="post-actions">
            <button class="post-action" data-action="quote" title="Citer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/>
              </svg>
            </button>
            <button class="post-action" data-action="report" title="Signaler">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="post-content">
          <div class="post-text">
            ${formatPostContent(post.content)}
          </div>
        </div>

        <div class="post-footer">
          <div class="post-stats">
            <span class="post-likes">👍 ${likes}</span>
          </div>
          <div class="post-buttons">
            <button class="post-action like-btn ${post.likedByUser ? 'liked' : ''}" data-action="like">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              ${likes}
            </button>
            <button class="post-action" data-action="reply">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
              </svg>
              Répondre
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

// Mettre à jour la pagination des messages
function updatePostsPagination() {
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const pagination = document.getElementById('posts-pagination');

  if (totalPages <= 1) {
    pagination.style.display = 'none';
    return;
  }

  pagination.style.display = 'flex';

  const prevBtn = document.getElementById('posts-prev-page');
  const nextBtn = document.getElementById('posts-next-page');
  const currentPageSpan = document.getElementById('posts-current-page');
  const totalPagesSpan = document.getElementById('posts-total-pages');

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
  currentPageSpan.textContent = currentPage;
  totalPagesSpan.textContent = totalPages;
}

// Initialiser le formulaire de réponse
function initReplyForm() {
  const replyFormContainer = document.getElementById('reply-form-container');

  if (currentThread.locked && !currentUser.canModerate()) {
    replyFormContainer.innerHTML = `
      <div class="locked-notice">
        <div class="locked-icon">🔒</div>
        <h3>Discussion verrouillée</h3>
        <p>Cette discussion est verrouillée. Vous ne pouvez plus y répondre.</p>
      </div>
    `;
    return;
  }

  replyFormContainer.innerHTML = `
    <div class="reply-form">
      <div class="reply-input-group">
        <img src="${currentUser.avatar}" alt="${currentUser.displayName}" class="reply-avatar">
        <div class="reply-content">
          <div class="reply-editor">
            <div class="reply-toolbar">
              <button type="button" class="editor-btn" data-command="bold" title="Gras">
                <strong>B</strong>
              </button>
              <button type="button" class="editor-btn" data-command="italic" title="Italique">
                <em>I</em>
              </button>
              <button type="button" class="editor-btn" data-command="insertUnorderedList" title="Liste">
                • List
              </button>
              <button type="button" class="editor-btn" data-command="createLink" title="Lien">
                🔗
              </button>
            </div>
            <div class="reply-textarea" contenteditable="true" placeholder="Écrivez votre réponse..."></div>
          </div>
          <div class="reply-actions">
            <div class="reply-char-count">
              <span id="reply-char-count">0</span>/2000 caractères
            </div>
            <div class="reply-buttons">
              <button type="button" id="cancel-reply" class="btn btn-secondary">Annuler</button>
              <button type="button" id="submit-reply" class="btn btn-primary" disabled>Publier</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attacher les événements de l'éditeur
  initReplyEditor();
}

// Initialiser l'éditeur de réponse
function initReplyEditor() {
  const textarea = document.querySelector('.reply-textarea');
  const charCount = document.getElementById('reply-char-count');
  const submitBtn = document.getElementById('submit-reply');
  const cancelBtn = document.getElementById('cancel-reply');

  // Compteur de caractères
  textarea.addEventListener('input', () => {
    const length = textarea.textContent.length;
    charCount.textContent = `${length}/2000`;
    submitBtn.disabled = length === 0 || length > 2000;
  });

  // Boutons de formatage
  document.querySelectorAll('.editor-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const command = btn.getAttribute('data-command');
      document.execCommand(command, false, null);
      textarea.focus();
    });
  });

  // Soumission
  submitBtn.addEventListener('click', () => {
    const content = textarea.textContent.trim();
    if (content) {
      submitReply(content);
    }
  });

  // Annulation
  cancelBtn.addEventListener('click', () => {
    textarea.textContent = '';
    charCount.textContent = '0/2000';
    submitBtn.disabled = true;
  });
}

// Soumettre une réponse
function submitReply(content) {
  const newPost = new ForumPost({
    content: content,
    author: currentUser,
    threadId: currentThread.id,
    createdAt: new Date()
  });

  // Ajouter à la discussion
  currentThread.addPost(newPost);
  posts.push(newPost);

  // Re-rendre la liste
  renderPostsList();

  // Vider le formulaire
  document.querySelector('.reply-textarea').textContent = '';
  document.getElementById('reply-char-count').textContent = '0/2000';
  document.getElementById('submit-reply').disabled = true;

  // Notification
  showNotification('Votre réponse a été publiée avec succès !', 'success');

  // Scroll vers le nouveau message
  setTimeout(() => {
    const newPostElement = document.querySelector(`[data-post-id="${newPost.id}"]`);
    if (newPostElement) {
      newPostElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);
}

// Initialiser les événements
function initEventListeners() {
  // Actions sur les messages
  document.getElementById('posts-list').addEventListener('click', (e) => {
    const actionBtn = e.target.closest('.post-action');
    if (!actionBtn) return;

    const postElement = e.target.closest('.post-item');
    const postId = postElement.getAttribute('data-post-id');
    const action = actionBtn.getAttribute('data-action');

    handlePostAction(action, postId);
  });

  // Pagination
  document.getElementById('posts-prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderPostsList();
    }
  });

  document.getElementById('posts-next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(posts.length / postsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderPostsList();
    }
  });

  // Actions sur la discussion
  initThreadActions();

  // Sidebar
  initSidebar();
}

// Gérer les actions sur les messages
function handlePostAction(action, postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  switch (action) {
    case 'like':
      togglePostLike(post);
      break;
    case 'reply':
      showQuickReply(post);
      break;
    case 'quote':
      quotePost(post);
      break;
    case 'report':
      reportPost(post);
      break;
  }
}

// Basculer le like d'un message
function togglePostLike(post) {
  post.likedByUser = !post.likedByUser;
  renderPostsList();
}

// Afficher la réponse rapide
function showQuickReply(post) {
  const replyTextarea = document.querySelector('.reply-textarea');
  replyTextarea.textContent = `@${post.author.displayName} `;
  replyTextarea.focus();

  // Placer le curseur à la fin
  const range = document.createRange();
  const sel = window.getSelection();
  range.setStart(replyTextarea, 1);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

// Citer un message
function quotePost(post) {
  const quote = `\n> ${post.content.replace(/\n/g, '\n> ')}\n\n`;
  const replyTextarea = document.querySelector('.reply-textarea');
  replyTextarea.textContent += quote;
  replyTextarea.focus();
}

// Signaler un message
function reportPost(post) {
  if (confirm('Êtes-vous sûr de vouloir signaler ce message ?')) {
    post.report('Contenu inapproprié', currentUser);
    showNotification('Le message a été signalé aux modérateurs.', 'info');
  }
}

// Initialiser les actions sur la discussion
function initThreadActions() {
  // Like de la discussion
  document.getElementById('thread-like').addEventListener('click', () => {
    currentThread.likes++;
    document.getElementById('thread-likes').textContent = currentThread.likes;
    showNotification('Discussion aimée !', 'success');
  });

  // Sauvegarde
  document.getElementById('thread-bookmark').addEventListener('click', () => {
    showNotification('Discussion sauvegardée !', 'success');
  });

  // Partage
  document.getElementById('thread-share').addEventListener('click', () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      showNotification('Lien copié dans le presse-papiers !', 'success');
    });
  });

  // Actions d'administration
  if (currentUser.canModerate()) {
    document.getElementById('thread-pin').addEventListener('click', () => {
      currentThread.togglePin();
      showNotification(`Discussion ${currentThread.pinned ? 'épinglée' : 'désépinglée'} !`, 'success');
    });

    document.getElementById('thread-lock').addEventListener('click', () => {
      currentThread.toggleLock();
      showNotification(`Discussion ${currentThread.locked ? 'verrouillée' : 'déverrouillée'} !`, 'success');
      initReplyForm(); // Recharger le formulaire de réponse
    });
  }
}

// Initialiser la sidebar
function initSidebar() {
  // Informations de la discussion
  document.getElementById('sidebar-author').textContent = currentThread.author.displayName;
  document.getElementById('sidebar-created').textContent = formatForumDate(currentThread.createdAt);
  document.getElementById('sidebar-last-activity').textContent = formatForumDate(currentThread.lastActivity);
  document.getElementById('sidebar-views').textContent = currentThread.views;
  document.getElementById('sidebar-replies').textContent = currentThread.getPostCount();

  // Participants
  const participants = [...new Set(posts.map(p => p.author.id))];
  const participantsHTML = participants.slice(0, 10).map(userId => {
    const user = getUserById(userId);
    return user ? `
      <div class="participant-item" title="${user.displayName}">
        <img src="${user.avatar}" alt="${user.displayName}" class="participant-avatar">
        <span class="participant-name">${user.displayName}</span>
        <span class="participant-role">${getRoleDisplayName(user.role)}</span>
      </div>
    ` : '';
  }).join('');

  document.getElementById('participants-list').innerHTML = participantsHTML;

  // Discussions similaires (simulées)
  const relatedThreads = generateMockForumData().threads
    .filter(thread => thread.category === currentThread.category && thread.id !== currentThread.id)
    .slice(0, 5);

  const relatedHTML = relatedThreads.map(thread => `
    <div class="related-thread">
      <a href="forum-thread.html?thread=${thread.id}">${thread.title}</a>
      <div class="related-meta">${formatForumDate(thread.lastActivity)}</div>
    </div>
  `).join('');

  document.getElementById('related-threads-list').innerHTML = relatedHTML;
}

// Formater le contenu d'un message
function formatPostContent(content) {
  let formatted = content;

  // Mentions
  formatted = formatted.replace(/@(\w+)/g, '<span class="mention">@$1</span>');

  // Liens
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener">$1</a>'
  );

  // Citations
  formatted = formatted.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  return formatted;
}

// Obtenir les informations d'une catégorie
function getCategoryInfo(categoryId) {
  const categories = generateMockForumData().categories;
  return categories.find(cat => cat.id === categoryId) || { name: 'Catégorie', icon: '📝' };
}

// Obtenir l'affichage du rôle
function getRoleDisplayName(role) {
  const roles = {
    admin: 'Administrateur',
    moderator: 'Modérateur',
    member: 'Membre'
  };
  return roles[role] || 'Membre';
}

// Obtenir un utilisateur par ID
function getUserById(userId) {
  const users = generateMockForumData().users;
  return users.find(user => user.id === userId);
}

// Afficher une notification
function showNotification(message, type = 'info') {
  // Créer la notification
  const notification = document.createElement('div');
  notification.className = `article-notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${getNotificationIcon(type)}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    </div>
  `;

  // Ajouter au DOM
  document.body.appendChild(notification);

  // Animation
  setTimeout(() => notification.classList.add('show'), 10);

  // Auto-suppression
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

// Export pour utilisation externe
window.currentThread = currentThread;
window.currentUser = currentUser;
