// Les Scoops du Jour - User Preferences Component
// Interface utilisateur pour gérer les préférences utilisateur

export class UserPreferences {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.isOpen = false;
    this.currentTab = 'general';

    this.init();
  }

  init() {
    this.createPreferencesModal();
    this.setupEventListeners();
    console.log('⚙️ User Preferences component initialized');
  }

  createPreferencesModal() {
    const modal = document.createElement('div');
    modal.id = 'user-preferences-modal';
    modal.className = 'preferences-modal';
    modal.innerHTML = `
      <div class="preferences-overlay" id="preferences-overlay"></div>
      <div class="preferences-container">
        <div class="preferences-header">
          <h2>Préférences utilisateur</h2>
          <button class="preferences-close" id="preferences-close">×</button>
        </div>

        <div class="preferences-content">
          <div class="preferences-tabs">
            <button class="tab-button active" data-tab="general">Général</button>
            <button class="tab-button" data-tab="appearance">Apparence</button>
            <button class="tab-button" data-tab="notifications">Notifications</button>
            <button class="tab-button" data-tab="privacy">Confidentialité</button>
            <button class="tab-button" data-tab="data">Données</button>
          </div>

          <div class="preferences-panels">
            <div class="preferences-panel active" id="general-panel">
              ${this.createGeneralPanel()}
            </div>
            <div class="preferences-panel" id="appearance-panel">
              ${this.createAppearancePanel()}
            </div>
            <div class="preferences-panel" id="notifications-panel">
              ${this.createNotificationsPanel()}
            </div>
            <div class="preferences-panel" id="privacy-panel">
              ${this.createPrivacyPanel()}
            </div>
            <div class="preferences-panel" id="data-panel">
              ${this.createDataPanel()}
            </div>
          </div>
        </div>

        <div class="preferences-footer">
          <button class="btn-secondary" id="preferences-reset">Réinitialiser</button>
          <div class="footer-actions">
            <button class="btn-secondary" id="preferences-cancel">Annuler</button>
            <button class="btn-primary" id="preferences-save">Sauvegarder</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  createGeneralPanel() {
    const prefs = this.storageManager.getUserPreferences();

    return `
      <div class="panel-section">
        <h3>Langue et région</h3>
        <div class="form-group">
          <label for="language-select">Langue</label>
          <select id="language-select" class="form-control">
            <option value="fr" ${prefs.language === 'fr' ? 'selected' : ''}>Français</option>
            <option value="en" ${prefs.language === 'en' ? 'selected' : ''}>English</option>
          </select>
        </div>
      </div>

      <div class="panel-section">
        <h3>Expérience de lecture</h3>
        <div class="form-group">
          <label for="font-size-select">Taille de police</label>
          <select id="font-size-select" class="form-control">
            <option value="small" ${prefs.reading?.fontSize === 'small' ? 'selected' : ''}>Petite</option>
            <option value="medium" ${prefs.reading?.fontSize === 'medium' ? 'selected' : ''}>Moyenne</option>
            <option value="large" ${prefs.reading?.fontSize === 'large' ? 'selected' : ''}>Grande</option>
          </select>
        </div>

        <div class="form-group">
          <label for="line-height-select">Interligne</label>
          <select id="line-height-select" class="form-control">
            <option value="compact" ${prefs.reading?.lineHeight === 'compact' ? 'selected' : ''}>Compact</option>
            <option value="normal" ${prefs.reading?.lineHeight === 'normal' ? 'selected' : ''}>Normal</option>
            <option value="relaxed" ${prefs.reading?.lineHeight === 'relaxed' ? 'selected' : ''}>Détendu</option>
          </select>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="show-images" ${prefs.reading?.showImages ? 'checked' : ''}>
            Afficher les images dans les articles
          </label>
        </div>
      </div>

      <div class="panel-section">
        <h3>Catégories préférées</h3>
        <p class="panel-description">Sélectionnez les catégories que vous souhaitez voir en priorité</p>
        <div class="categories-grid">
          ${this.createCategoryCheckboxes(prefs.categories)}
        </div>
      </div>
    `;
  }

  createAppearancePanel() {
    const prefs = this.storageManager.getUserPreferences();

    return `
      <div class="panel-section">
        <h3>Thème</h3>
        <div class="theme-options">
          <label class="theme-option">
            <input type="radio" name="theme" value="light" ${prefs.theme === 'light' ? 'checked' : ''}>
            <div class="theme-preview light-theme">
              <div class="theme-name">Clair</div>
            </div>
          </label>
          <label class="theme-option">
            <input type="radio" name="theme" value="dark" ${prefs.theme === 'dark' ? 'checked' : ''}>
            <div class="theme-preview dark-theme">
              <div class="theme-name">Sombre</div>
            </div>
          </label>
          <label class="theme-option">
            <input type="radio" name="theme" value="beninois" ${prefs.theme === 'beninois' ? 'checked' : ''}>
            <div class="theme-preview beninois-theme">
              <div class="theme-name">Béninois</div>
            </div>
          </label>
          <label class="theme-option">
            <input type="radio" name="theme" value="auto" ${prefs.theme === 'auto' ? 'checked' : ''}>
            <div class="theme-preview auto-theme">
              <div class="theme-name">Auto</div>
            </div>
          </label>
        </div>
      </div>

      <div class="panel-section">
        <h3>Animations</h3>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="reduce-motion" ${prefs.appearance?.reduceMotion ? 'checked' : ''}>
            Réduire les animations (recommandé pour les personnes sensibles)
          </label>
        </div>
      </div>
    `;
  }

  createNotificationsPanel() {
    const prefs = this.storageManager.getUserPreferences();

    return `
      <div class="panel-section">
        <h3>Notifications push</h3>
        <div class="notification-options">
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="notify-breaking-news" ${prefs.notifications?.breakingNews ? 'checked' : ''}>
              <div>
                <strong>Breaking News</strong>
                <div class="option-description">Recevoir des notifications pour les actualités urgentes</div>
              </div>
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="notify-daily-digest" ${prefs.notifications?.dailyDigest ? 'checked' : ''}>
              <div>
                <strong>Résumé quotidien</strong>
                <div class="option-description">Recevoir un résumé des actualités du jour</div>
              </div>
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="notify-new-comments" ${prefs.notifications?.newComments ? 'checked' : ''}>
              <div>
                <strong>Nouveaux commentaires</strong>
                <div class="option-description">Être notifié des nouveaux commentaires sur vos articles</div>
              </div>
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="notify-recommendations" ${prefs.notifications?.recommendations ? 'checked' : ''}>
              <div>
                <strong>Recommandations</strong>
                <div class="option-description">Recevoir des suggestions d'articles personnalisées</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div class="panel-section">
        <h3>Fréquence des notifications</h3>
        <div class="form-group">
          <label for="notification-frequency">Fréquence</label>
          <select id="notification-frequency" class="form-control">
            <option value="immediate" ${prefs.notifications?.frequency === 'immediate' ? 'selected' : ''}>Immédiat</option>
            <option value="hourly" ${prefs.notifications?.frequency === 'hourly' ? 'selected' : ''}>Toutes les heures</option>
            <option value="daily" ${prefs.notifications?.frequency === 'daily' ? 'selected' : ''}>Quotidien</option>
            <option value="weekly" ${prefs.notifications?.frequency === 'weekly' ? 'selected' : ''}>Hebdomadaire</option>
          </select>
        </div>
      </div>
    `;
  }

  createPrivacyPanel() {
    const prefs = this.storageManager.getUserPreferences();

    return `
      <div class="panel-section">
        <h3>Analyses et performances</h3>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="analytics-enabled" ${prefs.privacy?.analytics ? 'checked' : ''}>
            <div>
              <strong>Analytics</strong>
              <div class="option-description">Aider à améliorer l'application en collectant des données d'utilisation anonymes</div>
            </div>
          </label>
        </div>
      </div>

      <div class="panel-section">
        <h3>Publicité personnalisée</h3>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="personalized-ads" ${prefs.privacy?.personalizedAds ? 'checked' : ''}>
            <div>
              <strong>Publicités personnalisées</strong>
              <div class="option-description">Recevoir des publicités adaptées à vos centres d'intérêt</div>
            </div>
          </label>
        </div>
      </div>

      <div class="panel-section">
        <h3>Historique de lecture</h3>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="track-reading-history" ${prefs.privacy?.trackReadingHistory !== false ? 'checked' : ''}>
            <div>
              <strong>Suivi de l'historique</strong>
              <div class="option-description">Enregistrer votre historique de lecture pour des recommandations personnalisées</div>
            </div>
          </label>
        </div>
      </div>
    `;
  }

  createDataPanel() {
    const stats = this.storageManager.getStorageStats();
    const readingStats = this.storageManager.getReadingTimeStats();

    return `
      <div class="panel-section">
        <h3>Statistiques d'utilisation</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${stats.totalKeys}</div>
            <div class="stat-label">Éléments stockés</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.totalSize} KB</div>
            <div class="stat-label">Espace utilisé</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${Math.round(readingStats.today / 60000)} min</div>
            <div class="stat-label">Temps de lecture aujourd'hui</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${readingStats.sessionsToday}</div>
            <div class="stat-label">Sessions aujourd'hui</div>
          </div>
        </div>
      </div>

      <div class="panel-section">
        <h3>Export des données</h3>
        <p class="panel-description">Téléchargez une copie de vos données personnelles</p>
        <button class="btn-secondary" id="export-data">Exporter mes données</button>
      </div>

      <div class="panel-section">
        <h3>Import des données</h3>
        <p class="panel-description">Importez des données précédemment exportées</p>
        <input type="file" id="import-file" accept=".json" style="display: none;">
        <button class="btn-secondary" id="import-data">Importer des données</button>
      </div>

      <div class="panel-section danger-zone">
        <h3>Zone de danger</h3>
        <p class="panel-description warning">Ces actions sont irréversibles</p>
        <button class="btn-danger" id="clear-history">Effacer l'historique</button>
        <button class="btn-danger" id="clear-all-data">Effacer toutes les données</button>
      </div>
    `;
  }

  createCategoryCheckboxes(categories) {
    const categoryNames = {
      politique: 'Politique',
      economie: 'Économie',
      sport: 'Sport',
      culture: 'Culture',
      tech: 'Technologie'
    };

    return Object.entries(categoryNames).map(([key, name]) => `
      <label class="category-checkbox">
        <input type="checkbox" value="${key}" ${categories[key] ? 'checked' : ''}>
        <span class="checkmark"></span>
        ${name}
      </label>
    `).join('');
  }

  setupEventListeners() {
    // Ouvrir les préférences
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="open-preferences"]')) {
        this.open();
      }
    });

    // Fermer les préférences
    document.getElementById('preferences-overlay')?.addEventListener('click', () => this.close());
    document.getElementById('preferences-close')?.addEventListener('click', () => this.close());
    document.getElementById('preferences-cancel')?.addEventListener('click', () => this.close());

    // Changer d'onglet
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Sauvegarder
    document.getElementById('preferences-save')?.addEventListener('click', () => this.save());

    // Réinitialiser
    document.getElementById('preferences-reset')?.addEventListener('click', () => this.reset());

    // Actions des données
    document.getElementById('export-data')?.addEventListener('click', () => this.exportData());
    document.getElementById('import-data')?.addEventListener('click', () => this.importData());
    document.getElementById('clear-history')?.addEventListener('click', () => this.clearHistory());
    document.getElementById('clear-all-data')?.addEventListener('click', () => this.clearAllData());

    // Gestionnaire d'import de fichier
    document.getElementById('import-file')?.addEventListener('change', (e) => this.handleFileImport(e));
  }

  open() {
    this.isOpen = true;
    document.getElementById('user-preferences-modal').classList.add('active');
    document.body.style.overflow = 'hidden';

    // Recharger les valeurs actuelles
    this.loadCurrentValues();
  }

  close() {
    this.isOpen = false;
    document.getElementById('user-preferences-modal').classList.remove('active');
    document.body.style.overflow = '';
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    // Mettre à jour les boutons d'onglet
    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.toggle('active', button.dataset.tab === tabName);
    });

    // Mettre à jour les panneaux
    document.querySelectorAll('.preferences-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `${tabName}-panel`);
    });
  }

  loadCurrentValues() {
    const prefs = this.storageManager.getUserPreferences();

    // Général
    this.setSelectValue('language-select', prefs.language);
    this.setSelectValue('font-size-select', prefs.reading?.fontSize);
    this.setSelectValue('line-height-select', prefs.reading?.lineHeight);
    this.setCheckboxValue('show-images', prefs.reading?.showImages);

    // Catégories
    document.querySelectorAll('.category-checkbox input').forEach(checkbox => {
      checkbox.checked = prefs.categories[checkbox.value];
    });

    // Apparence
    this.setRadioValue('theme', prefs.theme);
    this.setCheckboxValue('reduce-motion', prefs.appearance?.reduceMotion);

    // Notifications
    this.setCheckboxValue('notify-breaking-news', prefs.notifications?.breakingNews);
    this.setCheckboxValue('notify-daily-digest', prefs.notifications?.dailyDigest);
    this.setCheckboxValue('notify-new-comments', prefs.notifications?.newComments);
    this.setCheckboxValue('notify-recommendations', prefs.notifications?.recommendations);
    this.setSelectValue('notification-frequency', prefs.notifications?.frequency);

    // Confidentialité
    this.setCheckboxValue('analytics-enabled', prefs.privacy?.analytics);
    this.setCheckboxValue('personalized-ads', prefs.privacy?.personalizedAds);
    this.setCheckboxValue('track-reading-history', prefs.privacy?.trackReadingHistory);
  }

  save() {
    const preferences = {
      language: this.getSelectValue('language-select'),
      reading: {
        fontSize: this.getSelectValue('font-size-select'),
        lineHeight: this.getSelectValue('line-height-select'),
        showImages: this.getCheckboxValue('show-images')
      },
      categories: this.getCategoryPreferences(),
      theme: this.getRadioValue('theme'),
      appearance: {
        reduceMotion: this.getCheckboxValue('reduce-motion')
      },
      notifications: {
        breakingNews: this.getCheckboxValue('notify-breaking-news'),
        dailyDigest: this.getCheckboxValue('notify-daily-digest'),
        newComments: this.getCheckboxValue('notify-new-comments'),
        recommendations: this.getCheckboxValue('notify-recommendations'),
        frequency: this.getSelectValue('notification-frequency')
      },
      privacy: {
        analytics: this.getCheckboxValue('analytics-enabled'),
        personalizedAds: this.getCheckboxValue('personalized-ads'),
        trackReadingHistory: this.getCheckboxValue('track-reading-history')
      }
    };

    this.storageManager.saveUserPreferences(preferences);
    this.close();
  }

  reset() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les préférences ?')) {
      // Supprimer les préférences utilisateur
      this.storageManager.removeItem('userPreferences');

      // Recharger les valeurs par défaut
      this.loadCurrentValues();

      // Appliquer les préférences par défaut
      this.storageManager.applyUserPreferences(this.storageManager.getUserPreferences());
    }
  }

  getCategoryPreferences() {
    const categories = {};
    document.querySelectorAll('.category-checkbox input').forEach(checkbox => {
      categories[checkbox.value] = checkbox.checked;
    });
    return categories;
  }

  // Utilitaires pour les formulaires
  getSelectValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : null;
  }

  setSelectValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value || '';
  }

  getCheckboxValue(id) {
    const element = document.getElementById(id);
    return element ? element.checked : false;
  }

  setCheckboxValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.checked = value || false;
  }

  getRadioValue(name) {
    const element = document.querySelector(`input[name="${name}"]:checked`);
    return element ? element.value : null;
  }

  setRadioValue(name, value) {
    const element = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (element) element.checked = true;
  }

  // Actions des données
  exportData() {
    const data = this.storageManager.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `scoops-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importData() {
    document.getElementById('import-file').click();
  }

  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (this.storageManager.importData(data)) {
          this.loadCurrentValues(); // Recharger l'interface
        }
      } catch (error) {
        alert('Erreur lors de l\'importation du fichier');
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  }

  clearHistory() {
    if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique de lecture ?')) {
      this.storageManager.clearReadingHistory();
    }
  }

  clearAllData() {
    if (confirm('Êtes-vous sûr de vouloir effacer TOUTES les données ? Cette action est irréversible.')) {
      this.storageManager.clearAllData();
      this.close();
      // Recharger la page pour appliquer les changements
      setTimeout(() => window.location.reload(), 1000);
    }
  }
}

// Fonction pour initialiser le composant de préférences utilisateur
export function initUserPreferences(storageManager) {
  const userPreferences = new UserPreferences(storageManager);

  // Exposer globalement
  window.userPreferences = userPreferences;

  return userPreferences;
}

// Fonction utilitaire pour ouvrir les préférences
export function openUserPreferences() {
  if (window.userPreferences) {
    window.userPreferences.open();
  }
}

// Export de la classe pour utilisation avancée
export { UserPreferences };
