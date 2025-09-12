// Les Scoops du Jour - Newsletter Component
// Système complet de gestion des abonnements newsletter

export class Newsletter {
  constructor(options = {}) {
    this.apiEndpoint = options.apiEndpoint || '/api/newsletter';
    this.storageManager = options.storageManager;
    this.currentUser = null;
    this.isSubscribed = false;
    this.preferences = this.getDefaultPreferences();

    this.init();
  }

  init() {
    this.createNewsletterElements();
    this.bindEvents();
    this.loadSubscriptionStatus();
    this.setupExitIntentPopup();
    this.setupAutoPopup();

    console.log('📧 Newsletter system initialized');
  }

  // ===== ÉLÉMENTS DE L'INTERFACE =====

  createNewsletterElements() {
    // Popup newsletter (exit intent)
    this.createExitIntentPopup();

    // Widget newsletter (sidebar)
    this.createSidebarWidget();

    // Formulaire newsletter intégré
    this.createInlineForms();

    // Page de gestion des abonnements
    this.createSubscriptionPage();
  }

  createExitIntentPopup() {
    const popup = document.createElement('div');
    popup.id = 'newsletter-popup';
    popup.className = 'newsletter-popup';
    popup.innerHTML = `
      <div class="newsletter-popup-overlay"></div>
      <div class="newsletter-popup-content">
        <button class="newsletter-popup-close" id="newsletter-popup-close">×</button>
        <div class="newsletter-popup-header">
          <h3>📰 Restez informé des actualités du Bénin</h3>
          <p>Recevez les dernières nouvelles directement dans votre boîte mail</p>
        </div>
        <div class="newsletter-popup-body">
          <form class="newsletter-form" id="newsletter-popup-form">
            <div class="form-group">
              <input type="email" id="newsletter-popup-email" placeholder="Votre adresse email" required>
            </div>
            <div class="newsletter-preferences">
              <label class="preference-option">
                <input type="checkbox" name="frequency" value="daily" checked>
                <span>Résumé quotidien</span>
              </label>
              <label class="preference-option">
                <input type="checkbox" name="frequency" value="breaking">
                <span>Alertes breaking news</span>
              </label>
              <label class="preference-option">
                <input type="checkbox" name="frequency" value="weekly">
                <span>Résumé hebdomadaire</span>
              </label>
            </div>
            <button type="submit" class="btn-primary newsletter-submit">
              <span class="btn-text">S'abonner</span>
              <span class="btn-loading" style="display: none;">Inscription...</span>
            </button>
          </form>
          <div class="newsletter-benefits">
            <div class="benefit-item">
              <span class="benefit-icon">📰</span>
              <span>Articles exclusifs</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">⚡</span>
              <span>Breaking news instantanées</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">📊</span>
              <span>Analyses approfondies</span>
            </div>
          </div>
        </div>
        <div class="newsletter-popup-footer">
          <p class="privacy-text">
            En vous abonnant, vous acceptez notre
            <a href="/privacy" target="_blank">politique de confidentialité</a>.
            Vous pouvez vous désabonner à tout moment.
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(popup);
  }

  createSidebarWidget() {
    const widget = document.createElement('div');
    widget.className = 'sidebar-widget newsletter-widget';
    widget.innerHTML = `
      <h3>📧 Newsletter</h3>
      <p>Recevez les actualités du Bénin dans votre boîte mail</p>
      <form class="newsletter-form" id="newsletter-sidebar-form">
        <div class="form-group">
          <input type="email" id="newsletter-sidebar-email" placeholder="Email" required>
        </div>
        <button type="submit" class="btn-primary btn-sm">
          <span class="btn-text">S'abonner</span>
          <span class="btn-loading" style="display: none;">...</span>
        </button>
      </form>
      <div class="newsletter-stats">
        <span class="stat-number">15,000+</span>
        <span class="stat-label">abonnés</span>
      </div>
    `;

    // Insérer dans la sidebar si elle existe
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.appendChild(widget);
    }
  }

  createInlineForms() {
    // Remplacer les formulaires newsletter existants
    const forms = document.querySelectorAll('.newsletter-form:not(#newsletter-popup-form):not(#newsletter-sidebar-form)');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => this.handleInlineSubscription(e));
    });
  }

  createSubscriptionPage() {
    // Cette page serait créée séparément, mais on peut créer un modal de gestion
    const modal = document.createElement('div');
    modal.id = 'newsletter-management-modal';
    modal.className = 'newsletter-management-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content newsletter-management-content">
        <div class="modal-header">
          <h2>Gestion de votre abonnement</h2>
          <button class="modal-close" id="newsletter-management-close">×</button>
        </div>
        <div class="modal-body">
          <div class="subscription-status">
            <h3>Statut de l'abonnement</h3>
            <div class="status-indicator" id="subscription-status">
              <span class="status-icon">❓</span>
              <span class="status-text">Vérification en cours...</span>
            </div>
          </div>

          <div class="subscription-preferences">
            <h3>Préférences de réception</h3>
            <form id="newsletter-preferences-form">
              <div class="preference-group">
                <h4>Fréquence</h4>
                <label class="radio-option">
                  <input type="radio" name="frequency" value="daily" checked>
                  <span>Quotidienne</span>
                </label>
                <label class="radio-option">
                  <input type="radio" name="frequency" value="weekly">
                  <span>Hebdomadaire</span>
                </label>
                <label class="radio-option">
                  <input type="radio" name="frequency" value="monthly">
                  <span>Mensuelle</span>
                </label>
              </div>

              <div class="preference-group">
                <h4>Types de contenu</h4>
                <label class="checkbox-option">
                  <input type="checkbox" name="content" value="breaking" checked>
                  <span>Breaking news</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" name="content" value="politics" checked>
                  <span>Politique</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" name="content" value="economy" checked>
                  <span>Économie</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" name="content" value="sports">
                  <span>Sports</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" name="content" value="culture">
                  <span>Culture</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" name="content" value="tech">
                  <span>Technologie</span>
                </label>
              </div>

              <div class="preference-group">
                <h4>Format</h4>
                <label class="radio-option">
                  <input type="radio" name="format" value="html" checked>
                  <span>HTML (recommandé)</span>
                </label>
                <label class="radio-option">
                  <input type="radio" name="format" value="text">
                  <span>Texte brut</span>
                </label>
              </div>
            </form>
          </div>

          <div class="subscription-actions">
            <button class="btn-primary" id="save-preferences">Sauvegarder</button>
            <button class="btn-danger" id="unsubscribe-btn">Se désabonner</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  // ===== GESTION DES ÉVÉNEMENTS =====

  bindEvents() {
    // Popup newsletter
    this.bindPopupEvents();

    // Gestion des abonnements
    this.bindSubscriptionEvents();

    // Exit intent
    this.bindExitIntentEvents();
  }

  bindPopupEvents() {
    const popup = document.getElementById('newsletter-popup');
    const closeBtn = document.getElementById('newsletter-popup-close');
    const overlay = document.querySelector('.newsletter-popup-overlay');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hidePopup());
    }

    if (overlay) {
      overlay.addEventListener('click', () => this.hidePopup());
    }

    // Formulaire popup
    const popupForm = document.getElementById('newsletter-popup-form');
    if (popupForm) {
      popupForm.addEventListener('submit', (e) => this.handlePopupSubscription(e));
    }
  }

  bindSubscriptionEvents() {
    // Formulaire sidebar
    const sidebarForm = document.getElementById('newsletter-sidebar-form');
    if (sidebarForm) {
      sidebarForm.addEventListener('submit', (e) => this.handleSidebarSubscription(e));
    }

    // Gestion des abonnements
    const managementModal = document.getElementById('newsletter-management-modal');
    const managementClose = document.getElementById('newsletter-management-close');

    if (managementClose) {
      managementClose.addEventListener('click', () => this.hideManagementModal());
    }

    // Boutons de gestion
    const saveBtn = document.getElementById('save-preferences');
    const unsubscribeBtn = document.getElementById('unsubscribe-btn');

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.savePreferences());
    }

    if (unsubscribeBtn) {
      unsubscribeBtn.addEventListener('click', () => this.unsubscribe());
    }
  }

  bindExitIntentEvents() {
    let mouseLeft = false;

    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 && !mouseLeft) {
        mouseLeft = true;
        this.showExitIntentPopup();
      }
    });

    document.addEventListener('mouseenter', () => {
      mouseLeft = false;
    });
  }

  // ===== LOGIQUE D'ABONNEMENT =====

  async subscribe(email, preferences = {}) {
    try {
      this.showLoading('popup');

      // Validation email
      if (!this.validateEmail(email)) {
        throw new Error('Adresse email invalide');
      }

      // Vérifier si déjà abonné
      if (this.isSubscribed && this.currentUser?.email === email) {
        throw new Error('Vous êtes déjà abonné avec cette adresse email');
      }

      // Préparer les données
      const subscriptionData = {
        email,
        preferences: { ...this.getDefaultPreferences(), ...preferences },
        source: 'website',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        confirmed: false
      };

      // Simuler l'appel API
      const response = await this.mockApiCall('POST', '/subscribe', subscriptionData);

      if (response.success) {
        // Sauvegarder localement
        this.saveSubscriptionLocally(response.subscriber);

        // Envoyer email de confirmation
        await this.sendConfirmationEmail(email, response.subscriber.id);

        // Notification de succès
        this.showNotification('Inscription réussie ! Vérifiez votre boîte mail pour confirmer.', 'success');

        // Masquer le popup
        this.hidePopup();

        // Mettre à jour l'interface
        this.updateSubscriptionStatus();

        return response;
      } else {
        throw new Error(response.message || 'Erreur lors de l\'inscription');
      }

    } catch (error) {
      console.error('Newsletter subscription error:', error);
      this.showNotification(error.message, 'error');
      throw error;
    } finally {
      this.hideLoading('popup');
    }
  }

  async unsubscribe(token) {
    try {
      this.showLoading('management');

      const response = await this.mockApiCall('POST', '/unsubscribe', { token });

      if (response.success) {
        // Supprimer l'abonnement local
        this.clearSubscriptionLocally();

        // Notification
        this.showNotification('Vous avez été désabonné avec succès.', 'info');

        // Fermer le modal
        this.hideManagementModal();

        // Mettre à jour l'interface
        this.updateSubscriptionStatus();

        return response;
      } else {
        throw new Error(response.message || 'Erreur lors du désabonnement');
      }

    } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
      this.showNotification(error.message, 'error');
      throw error;
    } finally {
      this.hideLoading('management');
    }
  }

  async confirmSubscription(token) {
    try {
      const response = await this.mockApiCall('POST', '/confirm', { token });

      if (response.success) {
        // Mettre à jour le statut de confirmation
        if (this.currentUser) {
          this.currentUser.confirmed = true;
          this.saveSubscriptionLocally(this.currentUser);
        }

        this.showNotification('Votre abonnement a été confirmé !', 'success');
        return response;
      } else {
        throw new Error(response.message || 'Erreur lors de la confirmation');
      }

    } catch (error) {
      console.error('Newsletter confirmation error:', error);
      this.showNotification(error.message, 'error');
      throw error;
    }
  }

  async updatePreferences(newPreferences) {
    try {
      if (!this.isSubscribed || !this.currentUser) {
        throw new Error('Aucun abonnement actif trouvé');
      }

      const response = await this.mockApiCall('PUT', `/preferences/${this.currentUser.id}`, {
        preferences: { ...this.currentUser.preferences, ...newPreferences }
      });

      if (response.success) {
        // Mettre à jour localement
        this.currentUser.preferences = { ...this.currentUser.preferences, ...newPreferences };
        this.saveSubscriptionLocally(this.currentUser);

        this.showNotification('Préférences mises à jour avec succès.', 'success');
        return response;
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour');
      }

    } catch (error) {
      console.error('Newsletter preferences update error:', error);
      this.showNotification(error.message, 'error');
      throw error;
    }
  }

  // ===== GESTION DE L'INTERFACE =====

  showPopup() {
    const popup = document.getElementById('newsletter-popup');
    if (popup) {
      popup.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  hidePopup() {
    const popup = document.getElementById('newsletter-popup');
    if (popup) {
      popup.classList.remove('active');
      document.body.style.overflow = '';

      // Marquer comme vu pour éviter de le montrer à nouveau
      localStorage.setItem('scoops_newsletter_popup_shown', 'true');
    }
  }

  showExitIntentPopup() {
    // Ne montrer que si pas déjà vu et pas déjà abonné
    const alreadyShown = localStorage.getItem('scoops_newsletter_popup_shown');
    if (!alreadyShown && !this.isSubscribed) {
      setTimeout(() => this.showPopup(), 1000); // Délai pour éviter les déclenchements accidentels
    }
  }

  setupAutoPopup() {
    // Montrer automatiquement après 30 secondes sur la page d'accueil
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
      setTimeout(() => {
        if (!this.isSubscribed) {
          this.showPopup();
        }
      }, 30000);
    }
  }

  showManagementModal() {
    const modal = document.getElementById('newsletter-management-modal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.loadManagementData();
    }
  }

  hideManagementModal() {
    const modal = document.getElementById('newsletter-management-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  loadManagementData() {
    if (this.isSubscribed && this.currentUser) {
      // Mettre à jour le statut
      const statusEl = document.getElementById('subscription-status');
      if (statusEl) {
        statusEl.innerHTML = `
          <span class="status-icon">✅</span>
          <span class="status-text">Abonné depuis le ${new Date(this.currentUser.subscribedAt).toLocaleDateString('fr-FR')}</span>
        `;
      }

      // Charger les préférences
      this.loadPreferencesIntoForm();
    } else {
      const statusEl = document.getElementById('subscription-status');
      if (statusEl) {
        statusEl.innerHTML = `
          <span class="status-icon">❌</span>
          <span class="status-text">Non abonné</span>
        `;
      }
    }
  }

  loadPreferencesIntoForm() {
    if (!this.currentUser?.preferences) return;

    const prefs = this.currentUser.preferences;

    // Fréquence
    const frequencyInputs = document.querySelectorAll('input[name="frequency"]');
    frequencyInputs.forEach(input => {
      input.checked = input.value === prefs.frequency;
    });

    // Types de contenu
    const contentInputs = document.querySelectorAll('input[name="content"]');
    contentInputs.forEach(input => {
      input.checked = prefs.categories?.includes(input.value) || false;
    });

    // Format
    const formatInputs = document.querySelectorAll('input[name="format"]');
    formatInputs.forEach(input => {
      input.checked = input.value === prefs.format;
    });
  }

  savePreferences() {
    const formData = new FormData(document.getElementById('newsletter-preferences-form'));
    const preferences = {
      frequency: formData.get('frequency'),
      categories: formData.getAll('content'),
      format: formData.get('format')
    };

    this.updatePreferences(preferences);
  }

  // ===== GESTION DES HANDLERS =====

  async handlePopupSubscription(e) {
    e.preventDefault();

    const form = e.target;
    const email = form.querySelector('#newsletter-popup-email').value;
    const preferences = this.getFormPreferences(form);

    try {
      await this.subscribe(email, preferences);
    } catch (error) {
      // Erreur déjà gérée dans la méthode subscribe
    }
  }

  async handleSidebarSubscription(e) {
    e.preventDefault();

    const form = e.target;
    const email = form.querySelector('#newsletter-sidebar-email').value;

    try {
      await this.subscribe(email, { frequency: 'daily' });
    } catch (error) {
      // Erreur déjà gérée
    }
  }

  async handleInlineSubscription(e) {
    e.preventDefault();

    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;

    try {
      await this.subscribe(email, { frequency: 'daily' });
    } catch (error) {
      // Erreur déjà gérée
    }
  }

  getFormPreferences(form) {
    const preferences = { frequency: 'daily', categories: [] };

    // Récupérer les fréquences sélectionnées
    const frequencyCheckboxes = form.querySelectorAll('input[name="frequency"]:checked');
    if (frequencyCheckboxes.length > 0) {
      preferences.frequency = Array.from(frequencyCheckboxes).map(cb => cb.value);
    }

    return preferences;
  }

  // ===== UTILITAIRES =====

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getDefaultPreferences() {
    return {
      frequency: 'daily',
      categories: ['politique', 'economie', 'culture'],
      format: 'html',
      breakingNews: true,
      weeklyDigest: false
    };
  }

  showLoading(type) {
    const selectors = {
      popup: '#newsletter-popup-form .btn-loading',
      sidebar: '#newsletter-sidebar-form .btn-loading',
      management: '#newsletter-management-modal .btn-loading'
    };

    const loadingEl = document.querySelector(selectors[type]);
    const textEl = document.querySelector(`${selectors[type].replace('.btn-loading', ' .btn-text')}`);

    if (loadingEl) loadingEl.style.display = 'inline';
    if (textEl) textEl.style.display = 'none';
  }

  hideLoading(type) {
    const selectors = {
      popup: '#newsletter-popup-form .btn-loading',
      sidebar: '#newsletter-sidebar-form .btn-loading',
      management: '#newsletter-management-modal .btn-loading'
    };

    const loadingEl = document.querySelector(selectors[type]);
    const textEl = document.querySelector(`${selectors[type].replace('.btn-loading', ' .btn-text')}`);

    if (loadingEl) loadingEl.style.display = 'none';
    if (textEl) textEl.style.display = 'inline';
  }

  showNotification(message, type = 'info') {
    // Utiliser le système de notifications global
    window.dispatchEvent(new CustomEvent('showNotification', {
      detail: { message, type }
    }));
  }

  // ===== PERSISTANCE LOCALE =====

  saveSubscriptionLocally(subscriber) {
    this.currentUser = subscriber;
    this.isSubscribed = true;

    // Sauvegarder dans le storage manager
    if (this.storageManager) {
      const userPrefs = this.storageManager.getUserPreferences();
      userPrefs.newsletter = {
        subscribed: true,
        subscriber: subscriber
      };
      this.storageManager.saveUserPreferences(userPrefs);
    }
  }

  clearSubscriptionLocally() {
    this.currentUser = null;
    this.isSubscribed = false;

    if (this.storageManager) {
      const userPrefs = this.storageManager.getUserPreferences();
      userPrefs.newsletter = {
        subscribed: false,
        subscriber: null
      };
      this.storageManager.saveUserPreferences(userPrefs);
    }
  }

  loadSubscriptionStatus() {
    if (this.storageManager) {
      const userPrefs = this.storageManager.getUserPreferences();
      if (userPrefs.newsletter?.subscribed) {
        this.currentUser = userPrefs.newsletter.subscriber;
        this.isSubscribed = true;
      }
    }

    this.updateSubscriptionStatus();
  }

  updateSubscriptionStatus() {
    // Mettre à jour l'interface selon le statut d'abonnement
    const subscribeButtons = document.querySelectorAll('.newsletter-subscribe-btn');
    const manageButtons = document.querySelectorAll('.newsletter-manage-btn');

    if (this.isSubscribed) {
      subscribeButtons.forEach(btn => btn.style.display = 'none');
      manageButtons.forEach(btn => {
        btn.style.display = 'inline-block';
        btn.addEventListener('click', () => this.showManagementModal());
      });
    } else {
      subscribeButtons.forEach(btn => btn.style.display = 'inline-block');
      manageButtons.forEach(btn => btn.style.display = 'none');
    }
  }

  // ===== API MOCK =====

  async mockApiCall(method, endpoint, data = null) {
    // Simulation de latence réseau
    await this.delay(800 + Math.random() * 1200);

    // Simulation de réponses API
    switch (endpoint) {
      case '/subscribe':
        return {
          success: true,
          subscriber: {
            id: Date.now().toString(),
            email: data.email,
            preferences: data.preferences,
            subscribedAt: data.timestamp,
            confirmed: false
          },
          message: 'Subscription successful'
        };

      case '/unsubscribe':
        return {
          success: true,
          message: 'Unsubscribed successfully'
        };

      case '/confirm':
        return {
          success: true,
          message: 'Subscription confirmed'
        };

      default:
        if (endpoint.startsWith('/preferences/')) {
          return {
            success: true,
            message: 'Preferences updated'
          };
        }
        break;
    }

    return { success: false, message: 'Unknown endpoint' };
  }

  async sendConfirmationEmail(email, subscriberId) {
    // Simulation d'envoi d'email
    console.log(`📧 Confirmation email sent to ${email} with subscriber ID ${subscriberId}`);

    // En production, ceci ferait un appel API réel
    return true;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ===== MÉTRIQUES ET ANALYTICS =====

  trackSubscriptionEvent(event, data = {}) {
    // En production, envoyer à Google Analytics, etc.
    console.log('📊 Newsletter event:', event, data);

    if (this.storageManager) {
      // Sauvegarder les métriques localement
      const metrics = this.storageManager.getItem('newsletter_metrics', {});
      metrics[event] = (metrics[event] || 0) + 1;
      this.storageManager.setItem('newsletter_metrics', metrics);
    }
  }

  getMetrics() {
    if (this.storageManager) {
      return this.storageManager.getItem('newsletter_metrics', {});
    }
    return {};
  }
}

// ===== FONCTIONS UTILITAIRES =====

// Initialiser le système newsletter
export function initNewsletter(storageManager) {
  const newsletter = new Newsletter({ storageManager });

  // Exposer globalement
  window.newsletter = newsletter;

  return newsletter;
}

// Fonctions utilitaires pour un accès facile
export function showNewsletterPopup() {
  if (window.newsletter) {
    window.newsletter.showPopup();
  }
}

export function subscribeToNewsletter(email, preferences = {}) {
  if (window.newsletter) {
    return window.newsletter.subscribe(email, preferences);
  }
}

// Export de la classe pour utilisation avancée
export { Newsletter };
