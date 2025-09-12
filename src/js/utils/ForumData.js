// Les Scoops du Jour - Forum Data Models
// Modèles de données pour le forum communautaire

export class ForumThread {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.title = data.title || '';
    this.content = data.content || '';
    this.author = data.author || {};
    this.category = data.category || '';
    this.posts = data.posts || [];
    this.views = data.views || 0;
    this.likes = data.likes || 0;
    this.pinned = data.pinned || false;
    this.locked = data.locked || false;
    this.isSticky = data.isSticky || false;
    this.lastActivity = data.lastActivity || new Date();
    this.createdAt = data.createdAt || new Date();
    this.tags = data.tags || [];
    this.poll = data.poll || null; // Sondage optionnel
  }

  generateId() {
    return `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  addPost(post) {
    this.posts.push(post);
    this.lastActivity = new Date();
  }

  incrementViews() {
    this.views++;
  }

  togglePin() {
    this.pinned = !this.pinned;
  }

  toggleLock() {
    this.locked = !this.locked;
  }

  getPostCount() {
    return this.posts.length;
  }

  getLastPost() {
    return this.posts.length > 0 ? this.posts[this.posts.length - 1] : null;
  }

  getParticipantCount() {
    const participants = new Set();
    participants.add(this.author.id);
    this.posts.forEach(post => participants.add(post.author.id));
    return participants.size;
  }
}

export class ForumPost {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.content = data.content || '';
    this.author = data.author || {};
    this.threadId = data.threadId || '';
    this.parentId = data.parentId || null; // Pour les réponses
    this.likes = data.likes || 0;
    this.dislikes = data.dislikes || 0;
    this.reports = data.reports || 0;
    this.edited = data.edited || false;
    this.editHistory = data.editHistory || [];
    this.attachments = data.attachments || [];
    this.mentions = data.mentions || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  generateId() {
    return `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  edit(newContent, editor) {
    this.editHistory.push({
      oldContent: this.content,
      newContent: newContent,
      editedBy: editor,
      editedAt: new Date()
    });
    this.content = newContent;
    this.edited = true;
    this.updatedAt = new Date();
  }

  addLike(userId) {
    // Logique pour éviter les likes multiples
    this.likes++;
  }

  removeLike(userId) {
    if (this.likes > 0) {
      this.likes--;
    }
  }

  report(reason, reporter) {
    this.reports++;
    // Logique de modération
  }
}

export class ForumCategory {
  constructor(data) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.icon = data.icon || '📝';
    this.color = data.color || '#2196F3';
    this.order = data.order || 0;
    this.threadCount = data.threadCount || 0;
    this.postCount = data.postCount || 0;
    this.lastActivity = data.lastActivity || null;
    this.permissions = data.permissions || {
      canView: true,
      canPost: true,
      canModerate: false
    };
    this.subcategories = data.subcategories || [];
  }

  updateStats() {
    // Recalculer les statistiques
    this.threadCount = 0;
    this.postCount = 0;
    // Logique pour compter les threads et posts
  }
}

export class ForumUser {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.username = data.username || '';
    this.displayName = data.displayName || '';
    this.email = data.email || '';
    this.avatar = data.avatar || '';
    this.role = data.role || 'member'; // member, moderator, admin
    this.joinDate = data.joinDate || new Date();
    this.lastActivity = data.lastActivity || new Date();
    this.postCount = data.postCount || 0;
    this.threadCount = data.threadCount || 0;
    this.reputation = data.reputation || 0;
    this.badges = data.badges || [];
    this.signature = data.signature || '';
    this.preferences = data.preferences || {};
  }

  generateId() {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  canModerate() {
    return ['moderator', 'admin'].includes(this.role);
  }

  canAdmin() {
    return this.role === 'admin';
  }

  addReputation(points) {
    this.reputation += points;
  }

  addBadge(badge) {
    if (!this.badges.includes(badge)) {
      this.badges.push(badge);
    }
  }
}

// Fonction pour créer des données de test réalistes
export function generateMockForumData() {
  const users = [
    new ForumUser({
      id: 'user-1',
      username: 'marie_k',
      displayName: 'Marie KPOGNON',
      role: 'admin',
      postCount: 247,
      reputation: 1250,
      avatar: 'https://via.placeholder.com/40x40/2196F3/FFFFFF?text=MK'
    }),
    new ForumUser({
      id: 'user-2',
      username: 'jean_a',
      displayName: 'Jean ADJOVI',
      role: 'moderator',
      postCount: 189,
      reputation: 890,
      avatar: 'https://via.placeholder.com/40x40/4CAF50/FFFFFF?text=JA'
    }),
    new ForumUser({
      id: 'user-3',
      username: 'fatima_a',
      displayName: 'Fatima ALI',
      role: 'member',
      postCount: 67,
      reputation: 340,
      avatar: 'https://via.placeholder.com/40x40/FF9800/FFFFFF?text=FA'
    }),
    new ForumUser({
      id: 'user-4',
      username: 'paul_h',
      displayName: 'Paul HOUNTON',
      role: 'member',
      postCount: 45,
      reputation: 210,
      avatar: 'https://via.placeholder.com/40x40/9C27B0/FFFFFF?text=PH'
    }),
    new ForumUser({
      id: 'user-5',
      username: 'dr_marie',
      displayName: 'Dr. Marie DOUTI',
      role: 'member',
      postCount: 123,
      reputation: 567,
      avatar: 'https://via.placeholder.com/40x40/E91E63/FFFFFF?text=MD'
    })
  ];

  const categories = [
    new ForumCategory({
      id: 'general',
      name: 'Actualités générales',
      description: 'Discussions générales sur l\'actualité béninoise',
      icon: '📰',
      color: '#2196F3',
      order: 1
    }),
    new ForumCategory({
      id: 'politics',
      name: 'Politique béninoise',
      description: 'Débats sur la politique nationale et internationale',
      icon: '🏛️',
      color: '#4CAF50',
      order: 2
    }),
    new ForumCategory({
      id: 'economy',
      name: 'Économie et business',
      description: 'Discussions sur l\'économie, l\'entrepreneuriat et les affaires',
      icon: '💰',
      color: '#FF9800',
      order: 3
    }),
    new ForumCategory({
      id: 'sports',
      name: 'Sport national',
      description: 'Actualités sportives et discussions sur le sport béninois',
      icon: '⚽',
      color: '#9C27B0',
      order: 4
    }),
    new ForumCategory({
      id: 'culture',
      name: 'Culture et traditions',
      description: 'Culture, arts, musique et traditions béninoises',
      icon: '🎭',
      color: '#E91E63',
      order: 5
    }),
    new ForumCategory({
      id: 'help',
      name: 'Questions/Aide',
      description: 'Posez vos questions et aidez les autres membres',
      icon: '❓',
      color: '#607D8B',
      order: 6
    })
  ];

  // Générer des threads de test
  const threads = [];
  const threadTitles = [
    'Réforme constitutionnelle : quels impacts sur la démocratie ?',
    'Économie béninoise : croissance ou stagnation ?',
    'Équipe nationale : qualification CAN 2025 en danger ?',
    'Culture vaudou : préservation des traditions ancestrales',
    'Entrepreneuriat au Bénin : défis et opportunités',
    'Éducation : réforme du système scolaire nécessaire',
    'Tourisme : développer le potentiel du Bénin',
    'Santé publique : couverture médicale insuffisante',
    'Agriculture : révolution verte pour l\'autosuffisance',
    'Technologie : Bénin 2.0, rêve ou réalité ?',
    'Justice : indépendance de la magistrature',
    'Environnement : protection des forêts sacrées',
    'Jeunesse : emploi et perspectives d\'avenir',
    'Diaspora : rôle dans le développement national',
    'Médias : liberté de presse et responsabilité'
  ];

  const threadContents = [
    'Bonjour à tous, je souhaiterais avoir votre avis sur les récentes propositions de réforme constitutionnelle. Pensez-vous que cela renforcera la démocratie ou au contraire la fragilisera ? Quels sont les points positifs et négatifs selon vous ?',
    'L\'économie béninoise montre des signes de reprise, mais est-ce durable ? Les investissements étrangers augmentent, mais le chômage reste élevé. Quelles sont vos analyses et propositions ?',
    'Après la défaite contre le Maroc, l\'équipe nationale semble en difficulté. Les Écureuils peuvent-ils se qualifier pour la CAN 2025 ? Quelles sont les solutions pour redresser la barre ?',
    'La culture vaudou est au cœur de l\'identité béninoise, mais elle est menacée par la modernité. Comment préserver nos traditions tout en évoluant ?',
    'Créer une entreprise au Bénin n\'est pas chose facile. Manque de financements, bureaucratie excessive, concurrence déloyale... Quelles solutions pour encourager l\'entrepreneuriat ?'
  ];

  for (let i = 0; i < 35; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const author = users[Math.floor(Math.random() * users.length)];
    const title = threadTitles[Math.floor(Math.random() * threadTitles.length)];
    const content = threadContents[Math.floor(Math.random() * threadContents.length)];

    const thread = new ForumThread({
      title: `${title} (${i + 1})`,
      content: content,
      author: author,
      category: category.id,
      views: Math.floor(Math.random() * 500) + 10,
      likes: Math.floor(Math.random() * 50),
      pinned: i < 2, // Les 2 premiers sont épinglés
      locked: Math.random() > 0.95, // 5% sont verrouillés
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Derniers 30 jours
      tags: ['actualité', 'discussion', 'bénin']
    });

    // Ajouter des posts de réponse
    const postCount = Math.floor(Math.random() * 8) + 1; // 1-8 réponses
    for (let j = 0; j < postCount; j++) {
      const postAuthor = users[Math.floor(Math.random() * users.length)];
      const postContent = `Je suis ${postAuthor === author ? 'd\'accord' : 'en désaccord'} avec votre analyse. ${threadContents[Math.floor(Math.random() * threadContents.length)]}`;

      const post = new ForumPost({
        content: postContent,
        author: postAuthor,
        threadId: thread.id,
        likes: Math.floor(Math.random() * 20),
        createdAt: new Date(thread.createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) // Dans la semaine
      });

      thread.addPost(post);
    }

    threads.push(thread);
  }

  // Trier par activité récente
  threads.sort((a, b) => b.lastActivity - a.lastActivity);

  return {
    users,
    categories,
    threads,
    currentUser: users[0] // Marie KPOGNON comme utilisateur connecté
  };
}

// Fonctions utilitaires
export function formatForumDate(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'À l\'instant';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;

  return date.toLocaleDateString('fr-FR');
}

export function getUserRoleColor(role) {
  const colors = {
    admin: '#dc3545',
    moderator: '#ffc107',
    member: '#6c757d'
  };
  return colors[role] || colors.member;
}

export function getCategoryIcon(categoryId) {
  const icons = {
    general: '📰',
    politics: '🏛️',
    economy: '💰',
    sports: '⚽',
    culture: '🎭',
    help: '❓'
  };
  return icons[categoryId] || '📝';
}

export function getCategoryColor(categoryId) {
  const colors = {
    general: '#2196F3',
    politics: '#4CAF50',
    economy: '#FF9800',
    sports: '#9C27B0',
    culture: '#E91E63',
    help: '#607D8B'
  };
  return colors[categoryId] || '#2196F3';
}
