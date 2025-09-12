// Les Scoops du Jour - Forum New Thread Page JavaScript
// Gestion de la création de nouvelles discussions

import { generateMockForumData, ForumThread } from './utils/ForumData.js';

// État du formulaire
let currentUser = null;
let categories = [];
let isPreviewMode = false;
let autoSaveInterval = null;

// Initialisation de la page création
document.addEventListener('DOMContentLoaded', () => {
  initNewThreadPage();
});

function initNewThreadPage() {
  // Charger les données
  const forumData = generateMockForumData();
  currentUser = forumData.currentUser;
  categories = forumData.categories;

  // Initialiser les composants
  initCategorySelect();
  initEditor();
  initPollSystem();
  initEventListeners();
  initAutoSave();

  console.log('✏️ Page création discussion initialisée');
}

// Initialiser la sélection de catégorie
function initCategorySelect() {
  const categorySelect = document.getElementById('thread-category');

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = `${category.icon} ${category.name}`;
    categorySelect.appendChild(option);
  });
}

// Initialiser l'éditeur de contenu
function initEditor() {
  const editor = document.getElementById('thread-content');
  const toolbar = document.querySelector('.editor-toolbar');
  const titleInput = document.getElementById('thread-title');
  const titleCounter = document.getElementById('title-counter');
  const contentCounter = document.getElementById('content-counter');

  // Compteurs de caractères
  titleInput.addEventListener('input', () => {
    titleCounter.textContent = titleInput.value.length;
    validateForm();
  });

  editor.addEventListener('input', () => {
    contentCounter.textContent = editor.textContent.length;
    validateForm();
  });

  // Boutons de formatage
  toolbar.addEventListener('click', (e) => {
    const button = e.target.closest('.editor-btn');
    if (!button) return;

    e.preventDefault();
    const command = button.getAttribute('data-command');

    // Gestion spéciale pour les liens
    if (command === 'createLink') {
      const url = prompt('Entrez l\'URL du lien:');
      if (url) {
        document.execCommand('createLink', false, url);
      }
    } else if (command === 'insertImage') {
      const url = prompt('Entrez l\'URL de l\'image:');
      if (url) {
        document.execCommand('insertImage', false, url);
      }
    } else {
      document.execCommand(command, false, null);
    }

    editor.focus();
    updateToolbarState();
  });

  // Mettre à jour l'état de la barre d'outils
  editor.addEventListener('keyup', updateToolbarState);
  editor.addEventListener('mouseup', updateToolbarState);
  editor.addEventListener('focus', updateToolbarState);
}

// Mettre à jour l'état de la barre d'outils
function updateToolbarState() {
  const buttons = document.querySelectorAll('.editor-btn');

  buttons.forEach(button => {
    const command = button.getAttribute('data-command');
    if (command && document.queryCommandState) {
      const isActive = document.queryCommandState(command);
      button.classList.toggle('active', isActive);
    }
  });
}

// Initialiser le système de sondage
function initPollSystem() {
  const enablePollCheckbox = document.getElementById('enable-poll');
  const pollSection = document.getElementById('poll-section');
  const addPollOptionBtn = document.getElementById('add-poll-option');

  enablePollCheckbox.addEventListener('change', () => {
    pollSection.style.display = enablePollCheckbox.checked ? 'block' : 'none';
    validateForm();
  });

  addPollOptionBtn.addEventListener('click', addPollOption);

  // Gestion de la suppression d'options
  pollSection.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-option-btn')) {
      e.target.closest('.poll-option').remove();
      validateForm();
    }
  });

  // Validation des options de sondage
  pollSection.addEventListener('input', validateForm);
}

// Ajouter une option de sondage
function addPollOption() {
  const pollOptions = document.getElementById('poll-options');
  const optionCount = pollOptions.children.length;

  if (optionCount >= 10) {
    alert('Maximum 10 options de sondage autorisées.');
    return;
  }

  const optionDiv = document.createElement('div');
  optionDiv.className = 'poll-option';
  optionDiv.innerHTML = `
    <input
      type="text"
      placeholder="Option ${optionCount + 1}"
      maxlength="100"
      class="poll-option-input"
    >
    <button type="button" class="remove-option-btn" title="Supprimer cette option">×</button>
  `;

  pollOptions.appendChild(optionDiv);
  validateForm();
}

// Initialiser les événements
function initEventListeners() {
  // Aperçu
  document.getElementById('preview-thread').addEventListener('click', showPreview);

  // Soumission du formulaire
  document.getElementById('new-thread-form').addEventListener('submit', handleSubmit);

  // Annulation
  document.getElementById('cancel-thread').addEventListener('click', handleCancel);

  // Fermeture de l'aperçu
  document.getElementById('close-preview').addEventListener('click', hidePreview);

  // Clic en dehors de l'aperçu pour fermer
  document.getElementById('preview-modal').addEventListener('click', (e) => {
    if (e.target.id === 'preview-modal') {
      hidePreview();
    }
  });
}

// Validation du formulaire
function validateForm() {
  const category = document.getElementById('thread-category').value;
  const title = document.getElementById('thread-title').value.trim();
  const content = document.getElementById('thread-content').textContent.trim();
  const enablePoll = document.getElementById('enable-poll').checked;

  let isValid = category && title.length >= 5 && content.length >= 10;

  // Validation du sondage si activé
  if (enablePoll) {
    const pollQuestion = document.getElementById('poll-question').value.trim();
    const pollOptions = document.querySelectorAll('.poll-option-input');
    const validOptions = Array.from(pollOptions).filter(input => input.value.trim().length > 0);

    isValid = isValid && pollQuestion.length >= 5 && validOptions.length >= 2;
  }

  document.getElementById('submit-thread').disabled = !isValid;
}

// Sauvegarde automatique
function initAutoSave() {
  autoSaveInterval = setInterval(() => {
    const draft = getFormData();
    if (draft.title || draft.content) {
      saveDraft(draft);
    }
  }, 30000); // Toutes les 30 secondes
}

// Récupérer les données du formulaire
function getFormData() {
  const category = document.getElementById('thread-category').value;
  const title = document.getElementById('thread-title').value.trim();
  const content = document.getElementById('thread-content').innerHTML;
  const tags = document.getElementById('thread-tags').value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  const poll = getPollData();

  return {
    category,
    title,
    content,
    tags,
    poll
  };
}

// Récupérer les données du sondage
function getPollData() {
  if (!document.getElementById('enable-poll').checked) {
    return null;
  }

  const question = document.getElementById('poll-question').value.trim();
  const options = Array.from(document.querySelectorAll('.poll-option-input'))
    .map(input => input.value.trim())
    .filter(option => option.length > 0);

  if (!question || options.length < 2) {
    return null;
  }

  return {
    question,
    options,
    votes: options.map(() => 0),
    voters: []
  };
}

// Sauvegarder le brouillon
function saveDraft(draft) {
  try {
    localStorage.setItem('forum-draft', JSON.stringify({
      ...draft,
      savedAt: new Date().toISOString()
    }));

    showNotification('Brouillon sauvegardé automatiquement', 'info');
  } catch (e) {
    console.warn('Impossible de sauvegarder le brouillon:', e);
  }
}

// Restaurer le brouillon
function restoreDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem('forum-draft'));
    if (draft) {
      document.getElementById('thread-category').value = draft.category || '';
      document.getElementById('thread-title').value = draft.title || '';
      document.getElementById('thread-content').innerHTML = draft.content || '';
      document.getElementById('thread-tags').value = (draft.tags || []).join(', ');

      if (draft.poll) {
        document.getElementById('enable-poll').checked = true;
        document.getElementById('poll-section').style.display = 'block';
        document.getElementById('poll-question').value = draft.poll.question || '';

        // Restaurer les options
        draft.poll.options.forEach((option, index) => {
          if (index === 0) {
            document.querySelector('.poll-option-input').value = option;
          } else {
            addPollOption();
            const inputs = document.querySelectorAll('.poll-option-input');
            inputs[inputs.length - 1].value = option;
          }
        });
      }

      validateForm();
      showNotification('Brouillon restauré', 'info');
    }
  } catch (e) {
    console.warn('Impossible de restaurer le brouillon:', e);
  }
}

// Afficher l'aperçu
function showPreview() {
  const data = getFormData();

  if (!data.title || !data.content) {
    showNotification('Veuillez remplir au moins le titre et le contenu', 'warning');
    return;
  }

  const category = categories.find(cat => cat.id === data.category);
  const previewHTML = `
    <div class="thread-preview">
      <div class="preview-header">
        <div class="preview-category">
          <span class="category-badge">${category ? category.icon + ' ' + category.name : 'Catégorie'}</span>
        </div>
        <h2 class="preview-title">${escapeHtml(data.title)}</h2>
        <div class="preview-meta">
          Par <strong>${currentUser.displayName}</strong> • À l'instant
        </div>
      </div>

      <div class="preview-content">
        ${data.content}
      </div>

      ${data.tags && data.tags.length > 0 ? `
        <div class="preview-tags">
          ${data.tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}

      ${data.poll ? `
        <div class="preview-poll">
          <h4>📊 ${escapeHtml(data.poll.question)}</h4>
          <ul>
            ${data.poll.options.map(option => `<li>${escapeHtml(option)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;

  document.getElementById('preview-content').innerHTML = previewHTML;
  document.getElementById('preview-modal').classList.add('show');
}

// Masquer l'aperçu
function hidePreview() {
  document.getElementById('preview-modal').classList.remove('show');
}

// Gérer la soumission
function handleSubmit(e) {
  e.preventDefault();

  const data = getFormData();

  if (!validateSubmission(data)) {
    return;
  }

  // Créer la nouvelle discussion
  const newThread = new ForumThread({
    title: data.title,
    content: data.content,
    author: currentUser,
    category: data.category,
    tags: data.tags,
    poll: data.poll
  });

  // Simuler l'envoi au serveur
  console.log('Nouvelle discussion créée:', newThread);

  // Supprimer le brouillon
  localStorage.removeItem('forum-draft');

  // Arrêter la sauvegarde automatique
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }

  // Rediriger vers la nouvelle discussion
  showNotification('Discussion créée avec succès !', 'success');

  setTimeout(() => {
    window.location.href = `forum-thread.html?thread=${newThread.id}`;
  }, 1500);
}

// Valider la soumission
function validateSubmission(data) {
  if (!data.category) {
    showNotification('Veuillez sélectionner une catégorie', 'error');
    return false;
  }

  if (data.title.length < 5) {
    showNotification('Le titre doit contenir au moins 5 caractères', 'error');
    return false;
  }

  if (data.content.length < 10) {
    showNotification('Le contenu doit contenir au moins 10 caractères', 'error');
    return false;
  }

  if (data.poll) {
    if (data.poll.question.length < 5) {
      showNotification('La question du sondage doit contenir au moins 5 caractères', 'error');
      return false;
    }

    if (data.poll.options.length < 2) {
      showNotification('Le sondage doit avoir au moins 2 options', 'error');
      return false;
    }
  }

  return true;
}

// Gérer l'annulation
function handleCancel() {
  if (confirm('Êtes-vous sûr de vouloir annuler ? Votre brouillon sera supprimé.')) {
    localStorage.removeItem('forum-draft');
    window.location.href = 'forum.html';
  }
}

// Échapper le HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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

// Restaurer le brouillon au chargement
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(restoreDraft, 100); // Petit délai pour s'assurer que le DOM est prêt
});

// Nettoyer au départ de la page
window.addEventListener('beforeunload', () => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
});

// Export pour utilisation externe
window.getFormData = getFormData;
window.validateForm = validateForm;
