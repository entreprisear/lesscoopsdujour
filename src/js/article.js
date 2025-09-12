// Les Scoops du Jour - Article Page JavaScript
// Gestion complète de la page article avec notation et commentaires

import { createStarRating, createRatingDistribution } from './components/StarRating.js';
import { createCommentSystem } from './components/CommentSystem.js';

// État de l'article
let articleRating = null;
let commentSystem = null;
let articleData = {
  id: 'article-gouvernement-2025',
  title: 'Nouveau gouvernement formé : Patrice Talon nomme ses ministres',
  ratings: [], // Notes des utilisateurs
  totalRatings: 0,
  averageRating: 0
};

// Initialisation de la page article
document.addEventListener('DOMContentLoaded', () => {
  initArticlePage();
});

function initArticlePage() {
  // Charger les données de l'article (simulation)
  loadArticleData();

  // Initialiser le système de notation
  initRatingSystem();

  // Initialiser le système de commentaires
  initCommentSystem();

  // Initialiser les autres fonctionnalités
  initArticleFeatures();

  console.log('📄 Page article initialisée');
}

// Charger les données de l'article
function loadArticleData() {
  // Simulation de chargement des données depuis une API
  // En production, ceci viendrait d'un appel API
  articleData = {
    id: 'article-gouvernement-2025',
    title: 'Nouveau gouvernement formé : Patrice Talon nomme ses ministres',
    ratings: generateMockRatings(47), // 47 utilisateurs ont noté
    totalRatings: 47,
    averageRating: 4.6,
    userRating: null // L'utilisateur n'a pas encore noté
  };

  // Mettre à jour l'affichage initial
  updateArticleStats();
}

// Générer des notes de test réalistes
function generateMockRatings(count) {
  const ratings = [];
  const distribution = {
    5: 18, // 18 notes de 5 étoiles
    4: 15, // 15 notes de 4 étoiles
    3: 8,  // 8 notes de 3 étoiles
    2: 4,  // 4 notes de 2 étoiles
    1: 2   // 2 notes de 1 étoile
  };

  Object.keys(distribution).forEach(stars => {
    for (let i = 0; i < distribution[stars]; i++) {
      ratings.push(parseInt(stars));
    }
  });

  return ratings;
}

// Initialiser le système de notation
function initRatingSystem() {
  const ratingContainer = document.getElementById('article-rating');
  const feedbackElement = document.getElementById('rating-feedback');

  if (!ratingContainer) return;

  // Créer le composant de notation
  articleRating = createStarRating(ratingContainer, {
    initialRating: articleData.userRating || 0,
    readonly: false,
    size: 'large',
    showScore: true,
    animate: true,
    onRate: handleRating,
    onHover: handleRatingHover
  });

  // Créer la distribution des notes
  const statsContainer = document.getElementById('rating-stats');
  if (statsContainer) {
    createRatingDistribution(articleData.ratings, statsContainer);
  }

  // Fonction de gestion des notes
  function handleRating(rating) {
    // Simulation d'envoi au serveur
    setTimeout(() => {
      // Mettre à jour les données locales
      if (!articleData.userRating) {
        articleData.ratings.push(rating);
        articleData.totalRatings++;
      } else {
        // Remplacer la note existante
        const oldRating = articleData.userRating;
        const index = articleData.ratings.indexOf(oldRating);
        if (index > -1) {
          articleData.ratings[index] = rating;
        }
      }

      articleData.userRating = rating;
      articleData.averageRating = articleData.ratings.reduce((sum, r) => sum + r, 0) / articleData.ratings.length;

      // Mettre à jour l'affichage
      updateArticleStats();
      createRatingDistribution(articleData.ratings, statsContainer);

      // Feedback utilisateur
      showRatingFeedback(rating);

      // Notification
      showNotification(`Merci pour votre note de ${rating} étoile${rating > 1 ? 's' : ''} !`, 'success');
    }, 500);
  }

  function handleRatingHover(rating) {
    if (feedbackElement) {
      if (rating === 0) {
        feedbackElement.textContent = '';
      } else {
        const messages = {
          1: 'Pas du tout satisfait',
          2: 'Peu satisfait',
          3: 'Moyennement satisfait',
          4: 'Satisfait',
          5: 'Très satisfait'
        };
        feedbackElement.textContent = messages[rating] || '';
        feedbackElement.className = `rating-feedback rating-${rating}`;
      }
    }
  }
}

// Afficher le feedback de notation
function showRatingFeedback(rating) {
  const feedbackElement = document.getElementById('rating-feedback');

  if (feedbackElement) {
    const messages = {
      1: '😞 Nous ferons mieux la prochaine fois !',
      2: '😐 Merci pour vos retours constructifs.',
      3: '🙂 Nous apprécions votre retour.',
      4: '😊 Merci beaucoup !',
      5: '😍 Merci infiniment pour cette excellente note !'
    };

    feedbackElement.textContent = messages[rating] || '';
    feedbackElement.className = `rating-feedback rating-${rating} show`;

    // Masquer après 3 secondes
    setTimeout(() => {
      feedbackElement.classList.remove('show');
    }, 3000);
  }
}

// Mettre à jour les statistiques de l'article
function updateArticleStats() {
  // Ici on pourrait mettre à jour des compteurs globaux
  // ou envoyer les stats au serveur
  console.log('📊 Stats article mises à jour:', {
    totalRatings: articleData.totalRatings,
    averageRating: articleData.averageRating.toFixed(1),
    userRating: articleData.userRating
  });
}

// Initialiser le système de commentaires
function initCommentSystem() {
  const commentsContainer = document.getElementById('comments-container');

  if (!commentsContainer) return;

  // Créer le système de commentaires
  commentSystem = createCommentSystem(commentsContainer, articleData.id, {
    maxDepth: 3,
    commentsPerPage: 10,
    allowAnonymous: false,
    requireModeration: false,
    enableMentions: true,
    enableNotifications: true,
    onCommentAdd: handleCommentAdd,
    onCommentLike: handleCommentLike,
    onCommentReport: handleCommentReport
  });

  // Fonctions de callback
  function handleCommentAdd(comment) {
    console.log('💬 Nouveau commentaire ajouté:', comment);
    showNotification('Votre commentaire a été publié avec succès !', 'success');

    // Ici on pourrait envoyer une notification aux mentions
    if (comment.mentions && comment.mentions.length > 0) {
      console.log('📢 Mentions détectées:', comment.mentions);
      // Envoyer des notifications aux utilisateurs mentionnés
    }
  }

  function handleCommentLike(commentId, liked) {
    const action = liked ? 'aimé' : 'retiré son like du';
    console.log(`👍 Commentaire ${action}:`, commentId);
  }

  function handleCommentReport(commentId) {
    console.log('🚨 Commentaire signalé:', commentId);
    showNotification('Le commentaire a été signalé à notre modération.', 'info');
  }
}

// Initialiser les autres fonctionnalités de l'article
function initArticleFeatures() {
  // Partage social
  initSocialSharing();

  // Lecture de l'article (tracking)
  initReadingTracker();

  // Articles connexes
  initRelatedArticles();

  // Newsletter
  initNewsletterSignup();
}

// Partage social
function initSocialSharing() {
  const shareButtons = document.querySelectorAll('.article-share .share-btn');

  shareButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const platform = e.currentTarget.getAttribute('data-platform');
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(document.title);
      const text = encodeURIComponent(document.querySelector('.article-excerpt').textContent.trim());

      let shareUrl = '';

      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${title}%20${url}`;
          break;
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        showNotification('Article partagé avec succès !', 'success');
      }
    });
  });
}

// Tracker de lecture
function initReadingTracker() {
  let readingTime = 0;
  let hasTracked = false;

  const trackReading = () => {
    readingTime += 1;

    // Marquer comme lu après 30 secondes
    if (readingTime >= 30 && !hasTracked) {
      hasTracked = true;
      console.log('📖 Article marqué comme lu');

      // Ici on pourrait envoyer les analytics au serveur
      // trackArticleRead(articleData.id, readingTime);
    }
  };

  // Tracker toutes les 10 secondes
  const readingInterval = setInterval(trackReading, 10000);

  // Arrêter le tracking quand l'utilisateur quitte la page
  window.addEventListener('beforeunload', () => {
    clearInterval(readingInterval);
    if (readingTime > 0) {
      console.log(`👁️ Temps de lecture: ${readingTime} secondes`);
    }
  });
}

// Articles connexes
function initRelatedArticles() {
  const relatedArticles = document.querySelectorAll('.related-article');

  relatedArticles.forEach(article => {
    article.addEventListener('click', (e) => {
      e.preventDefault();
      const title = article.querySelector('h4').textContent;
      console.log('🔗 Clic sur article connexe:', title);

      // Ici on pourrait naviguer vers l'article ou ouvrir dans un nouvel onglet
      // window.location.href = article.href;
    });
  });
}

// Inscription newsletter
function initNewsletterSignup() {
  const newsletterForm = document.querySelector('.newsletter-form');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailInput = newsletterForm.querySelector('.newsletter-input');
      const email = emailInput.value.trim();

      if (email && isValidEmail(email)) {
        // Simulation d'inscription
        showNotification('Merci ! Vous êtes maintenant inscrit à notre newsletter.', 'success');
        emailInput.value = '';

        // Ici on pourrait envoyer l'email au serveur
        console.log('📧 Inscription newsletter:', email);
      } else {
        showNotification('Veuillez entrer une adresse email valide.', 'error');
      }
    });
  }
}

// Validation email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Système de notifications
function showNotification(message, type = 'info') {
  // Supprimer les notifications existantes
  const existingNotifications = document.querySelectorAll('.article-notification');
  existingNotifications.forEach(notification => notification.remove());

  // Créer la nouvelle notification
  const notification = document.createElement('div');
  notification.className = `article-notification notification-${type}`;
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

// Gestion du scroll pour les ancres
function initScrollAnchors() {
  const hash = window.location.hash;
  if (hash) {
    setTimeout(() => {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }
}

// Initialiser les ancres au chargement
initScrollAnchors();

// Export pour utilisation externe
window.articleData = articleData;
window.commentSystem = commentSystem;
window.articleRating = articleRating;
