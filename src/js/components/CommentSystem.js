// Les Scoops du Jour - Comment System
// Système de commentaires hiérarchique avec likes et modération

export class CommentSystem {
  constructor(container, articleId, options = {}) {
    this.container = container;
    this.articleId = articleId;
    this.options = {
      maxDepth: 3,
      commentsPerPage: 10,
      allowAnonymous: false,
      requireModeration: false,
      enableMentions: true,
      enableNotifications: true,
      onCommentAdd: () => {},
      onCommentLike: () => {},
      onCommentReport: () => {},
      ...options
    };

    this.comments = [];
    this.currentPage = 1;
    this.currentUser = this.getCurrentUser();
    this.mentionedUsers = [];

    this.init();
  }

  init() {
    this.loadComments();
    this.render();
    this.attachEventListeners();
  }

  // Charger les commentaires (simulation)
  loadComments() {
    // Simulation de chargement de commentaires
    this.comments = this.generateMockComments(25);
  }

  // Générer des commentaires de test
  generateMockComments(count) {
    const comments = [];
    const authors = [
      'Marie KPOGNON', 'Jean ADJOVI', 'Fatima ALI', 'Paul HOUNTON',
      'Dr. Marie DOUTI', 'Sophie LOKOSSOU', 'M. Lionel A.', 'Dr. Rachel T.',
      'Anonymous User', 'Visiteur', 'Lecteur engagé'
    ];

    const commentTexts = [
      'Article très intéressant, merci pour cette analyse approfondie.',
      'Je suis d\'accord avec vos conclusions. Le gouvernement doit agir rapidement.',
      'Excellente couverture de l\'actualité. Continuez comme ça !',
      'Cet article soulève des questions importantes sur notre société.',
      'Bravo pour la qualité de l\'information. Très objectif.',
      'Je ne partage pas entièrement votre point de vue, mais c\'est bien argumenté.',
      'Article bien documenté, sources fiables.',
      'Merci d\'avoir abordé ce sujet sensible avec autant de tact.',
      'Votre analyse économique est particulièrement pertinente.',
      'J\'aimerais en savoir plus sur les implications à long terme.',
      'Article alarmant mais nécessaire. Il faut agir maintenant.',
      'Belle plume ! Vous avez un réel talent pour vulgariser des sujets complexes.',
      'Cet article m\'a fait réfléchir. Merci pour cette contribution.',
      'Position intéressante, même si je ne la partage pas entièrement.',
      'Documentation impeccable. On sent le travail de recherche.'
    ];

    for (let i = 0; i < count; i++) {
      const author = authors[Math.floor(Math.random() * authors.length)];
      const text = commentTexts[Math.floor(Math.random() * commentTexts.length)];
      const likes = Math.floor(Math.random() * 50);
      const replies = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0;

      const comment = {
        id: `comment-${i + 1}`,
        articleId: this.articleId,
        author: author,
        text: text,
        timestamp: this.generateRandomDate(),
        likes: likes,
        likedByUser: Math.random() > 0.8,
        replies: [],
        depth: 0,
        isModerated: false,
        isReported: false,
        mentions: this.extractMentions(text)
      };

      // Ajouter des réponses si nécessaire
      if (replies > 0) {
        for (let j = 0; j < replies; j++) {
          const replyAuthor = authors[Math.floor(Math.random() * authors.length)];
          const replyText = `Je suis d'accord avec ${author.split(' ')[0]}. ${commentTexts[Math.floor(Math.random() * commentTexts.length)]}`;

          const reply = {
            id: `reply-${i + 1}-${j + 1}`,
            articleId: this.articleId,
            author: replyAuthor,
            text: replyText,
            timestamp: new Date(comment.timestamp.getTime() + Math.random() * 86400000), // 24h max
            likes: Math.floor(Math.random() * 20),
            likedByUser: Math.random() > 0.9,
            replies: [],
            depth: 1,
            parentId: comment.id,
            isModerated: false,
            isReported: false,
            mentions: this.extractMentions(replyText)
          };

          comment.replies.push(reply);
        }
      }

      comments.push(comment);
    }

    // Trier par date (plus récent en premier)
    return comments.sort((a, b) => b.timestamp - a.timestamp);
  }

  generateRandomDate() {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  }

  extractMentions(text) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }

  render() {
    const paginatedComments = this.getPaginatedComments();

    const html = `
      <div class="comments-section">
        <div class="comments-header">
          <h3>Commentaires (${this.comments.length})</h3>
          <div class="comments-sort">
            <label for="comments-sort">Trier par :</label>
            <select id="comments-sort">
              <option value="newest">Plus récent</option>
              <option value="oldest">Plus ancien</option>
              <option value="popular">Plus populaire</option>
            </select>
          </div>
        </div>

        <div class="add-comment">
          <div class="comment-avatar">
            <img src="https://via.placeholder.com/40x40/2196F3/FFFFFF?text=${this.currentUser.name.charAt(0)}" alt="${this.currentUser.name}">
          </div>
          <div class="comment-input-container">
            <textarea
              id="comment-input"
              placeholder="Partagez votre avis sur cet article..."
              maxlength="1000"
            ></textarea>
            <div class="comment-actions">
              <div class="comment-char-count">
                <span id="char-count">0</span>/1000
              </div>
              <button id="submit-comment" class="btn btn-primary" disabled>
                Commenter
              </button>
            </div>
          </div>
        </div>

        <div class="comments-list">
          ${paginatedComments.map(comment => this.renderComment(comment)).join('')}
        </div>

        ${this.renderPagination()}

        <div class="comments-footer">
          <p class="comments-guidelines">
            Soyez respectueux et constructif dans vos commentaires.
            <a href="#" id="show-guidelines">Voir les règles</a>
          </p>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  renderComment(comment, isReply = false) {
    const avatarUrl = `https://via.placeholder.com/40x40/${this.getUserColor(comment.author)}/FFFFFF?text=${comment.author.charAt(0)}`;
    const timeAgo = this.getTimeAgo(comment.timestamp);
    const likes = comment.likes + (comment.likedByUser ? 1 : 0);

    const repliesHtml = comment.replies.map(reply => this.renderComment(reply, true)).join('');

    return `
      <div class="comment ${isReply ? 'comment-reply' : ''} ${comment.isModerated ? 'moderated' : ''}" data-comment-id="${comment.id}">
        <div class="comment-avatar">
          <img src="${avatarUrl}" alt="${comment.author}">
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">${comment.author}</span>
            <span class="comment-time">${timeAgo}</span>
            ${comment.isModerated ? '<span class="comment-moderated">Modéré</span>' : ''}
          </div>
          <div class="comment-text">
            ${this.formatCommentText(comment.text, comment.mentions)}
          </div>
          <div class="comment-actions">
            <button class="comment-action like-btn ${comment.likedByUser ? 'liked' : ''}" data-action="like">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              ${likes}
            </button>
            <button class="comment-action reply-btn" data-action="reply">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M8 16H3v5"/>
              </svg>
              Répondre
            </button>
            <button class="comment-action report-btn" data-action="report">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              Signaler
            </button>
          </div>

          ${repliesHtml ? `<div class="comment-replies">${repliesHtml}</div>` : ''}
        </div>
      </div>
    `;
  }

  renderPagination() {
    const totalPages = Math.ceil(this.comments.length / this.options.commentsPerPage);

    if (totalPages <= 1) return '';

    let paginationHtml = '<div class="comments-pagination">';

    // Bouton précédent
    if (this.currentPage > 1) {
      paginationHtml += `<button class="page-btn" data-page="${this.currentPage - 1}">Précédent</button>`;
    }

    // Pages
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, this.currentPage + 2);

    if (startPage > 1) {
      paginationHtml += `<button class="page-btn" data-page="1">1</button>`;
      if (startPage > 2) {
        paginationHtml += '<span class="page-dots">...</span>';
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const activeClass = i === this.currentPage ? 'active' : '';
      paginationHtml += `<button class="page-btn ${activeClass}" data-page="${i}">${i}</button>`;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHtml += '<span class="page-dots">...</span>';
      }
      paginationHtml += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    // Bouton suivant
    if (this.currentPage < totalPages) {
      paginationHtml += `<button class="page-btn" data-page="${this.currentPage + 1}">Suivant</button>`;
    }

    paginationHtml += '</div>';

    return paginationHtml;
  }

  attachEventListeners() {
    // Saisie de commentaire
    const commentInput = this.container.querySelector('#comment-input');
    const charCount = this.container.querySelector('#char-count');
    const submitBtn = this.container.querySelector('#submit-comment');

    commentInput.addEventListener('input', (e) => {
      const length = e.target.value.length;
      charCount.textContent = length;
      submitBtn.disabled = length === 0 || length > 1000;
    });

    // Soumission de commentaire
    submitBtn.addEventListener('click', () => this.addComment());

    // Tri des commentaires
    const sortSelect = this.container.querySelector('#comments-sort');
    sortSelect.addEventListener('change', (e) => this.sortComments(e.target.value));

    // Pagination
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('page-btn')) {
        const page = parseInt(e.target.getAttribute('data-page'));
        this.changePage(page);
      }
    });

    // Actions sur commentaires
    this.container.addEventListener('click', (e) => {
      const action = e.target.closest('.comment-action');
      if (!action) return;

      const commentElement = e.target.closest('.comment');
      const commentId = commentElement.getAttribute('data-comment-id');
      const actionType = action.getAttribute('data-action');

      switch (actionType) {
        case 'like':
          this.toggleLike(commentId);
          break;
        case 'reply':
          this.showReplyForm(commentId);
          break;
        case 'report':
          this.reportComment(commentId);
          break;
      }
    });

    // Règles de commentaires
    const guidelinesLink = this.container.querySelector('#show-guidelines');
    guidelinesLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.showGuidelines();
    });
  }

  addComment(text = null, parentId = null) {
    const input = text || this.container.querySelector('#comment-input').value.trim();
    if (!input) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      articleId: this.articleId,
      author: this.currentUser.name,
      text: input,
      timestamp: new Date(),
      likes: 0,
      likedByUser: false,
      replies: [],
      depth: parentId ? 1 : 0,
      parentId: parentId,
      isModerated: false,
      isReported: false,
      mentions: this.extractMentions(input)
    };

    if (parentId) {
      // Ajouter comme réponse
      const parentComment = this.findCommentById(parentId);
      if (parentComment) {
        parentComment.replies.unshift(newComment);
      }
    } else {
      // Ajouter comme commentaire principal
      this.comments.unshift(newComment);
    }

    // Vider le formulaire
    if (!text) {
      this.container.querySelector('#comment-input').value = '';
      this.container.querySelector('#char-count').textContent = '0';
      this.container.querySelector('#submit-comment').disabled = true;
    }

    // Re-rendre
    this.render();

    // Callback
    this.options.onCommentAdd(newComment);
  }

  toggleLike(commentId) {
    const comment = this.findCommentById(commentId);
    if (!comment) return;

    comment.likedByUser = !comment.likedByUser;
    this.render();

    this.options.onCommentLike(commentId, comment.likedByUser);
  }

  showReplyForm(commentId) {
    const commentElement = this.container.querySelector(`[data-comment-id="${commentId}"]`);
    const existingForm = commentElement.querySelector('.reply-form');

    if (existingForm) {
      existingForm.remove();
      return;
    }

    const replyForm = document.createElement('div');
    replyForm.className = 'reply-form';
    replyForm.innerHTML = `
      <div class="comment-avatar">
        <img src="https://via.placeholder.com/32x32/2196F3/FFFFFF?text=${this.currentUser.name.charAt(0)}" alt="${this.currentUser.name}">
      </div>
      <div class="comment-input-container">
        <textarea placeholder="Répondre à ce commentaire..." maxlength="500"></textarea>
        <div class="comment-actions">
          <button class="btn btn-secondary cancel-reply">Annuler</button>
          <button class="btn btn-primary submit-reply" disabled>Répondre</button>
        </div>
      </div>
    `;

    commentElement.appendChild(replyForm);

    const textarea = replyForm.querySelector('textarea');
    const submitBtn = replyForm.querySelector('.submit-reply');
    const cancelBtn = replyForm.querySelector('.cancel-reply');

    textarea.addEventListener('input', (e) => {
      submitBtn.disabled = e.target.value.trim().length === 0;
    });

    submitBtn.addEventListener('click', () => {
      const text = textarea.value.trim();
      if (text) {
        this.addComment(text, commentId);
      }
    });

    cancelBtn.addEventListener('click', () => {
      replyForm.remove();
    });

    // Focus sur le textarea
    setTimeout(() => textarea.focus(), 100);
  }

  reportComment(commentId) {
    const comment = this.findCommentById(commentId);
    if (!comment) return;

    if (confirm('Êtes-vous sûr de vouloir signaler ce commentaire ?')) {
      comment.isReported = true;
      this.render();

      this.options.onCommentReport(commentId);
    }
  }

  sortComments(sortBy) {
    switch (sortBy) {
      case 'oldest':
        this.comments.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'popular':
        this.comments.sort((a, b) => (b.likes + b.replies.length) - (a.likes + a.replies.length));
        break;
      case 'newest':
      default:
        this.comments.sort((a, b) => b.timestamp - a.timestamp);
        break;
    }

    this.currentPage = 1;
    this.render();
  }

  changePage(page) {
    this.currentPage = page;
    this.render();
  }

  getPaginatedComments() {
    const startIndex = (this.currentPage - 1) * this.options.commentsPerPage;
    const endIndex = startIndex + this.options.commentsPerPage;

    return this.comments.slice(startIndex, endIndex);
  }

  findCommentById(commentId) {
    for (const comment of this.comments) {
      if (comment.id === commentId) {
        return comment;
      }
      const reply = comment.replies.find(r => r.id === commentId);
      if (reply) {
        return reply;
      }
    }
    return null;
  }

  formatCommentText(text, mentions) {
    let formattedText = text;

    // Formater les mentions
    if (mentions && mentions.length > 0) {
      mentions.forEach(mention => {
        const regex = new RegExp(`@${mention}`, 'g');
        formattedText = formattedText.replace(regex, `<span class="mention">@${mention}</span>`);
      });
    }

    // Convertir les URLs en liens
    formattedText = formattedText.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>'
    );

    return formattedText;
  }

  getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;

    return date.toLocaleDateString('fr-FR');
  }

  getCurrentUser() {
    // Simulation d'utilisateur connecté
    return {
      id: 'user-1',
      name: 'Visiteur',
      avatar: 'https://via.placeholder.com/40x40/2196F3/FFFFFF?text=V',
      isLoggedIn: false
    };
  }

  getUserColor(username) {
    const colors = ['2196F3', '4CAF50', 'FF9800', '9C27B0', '607D8B', '3F51B5', 'E91E63', '009688'];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  showGuidelines() {
    const guidelines = `
      Règles de commentaires :
      • Soyez respectueux envers les autres utilisateurs
      • Évitez les attaques personnelles et les insultes
      • Restez constructif et argumentez vos points de vue
      • Ne partagez pas d'informations fausses ou trompeuses
      • Respectez la vie privée des individus
      • Utilisez les mentions @ pour interpeller quelqu'un
      • Signalez les commentaires inappropriés
    `;

    alert(guidelines);
  }

  // Méthodes publiques
  getCommentCount() {
    return this.comments.length;
  }

  getTopComments(limit = 5) {
    return this.comments
      .sort((a, b) => (b.likes + b.replies.length) - (a.likes + a.replies.length))
      .slice(0, limit);
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

// Fonction utilitaire pour créer un système de commentaires
export function createCommentSystem(container, articleId, options = {}) {
  return new CommentSystem(container, articleId, options);
}
