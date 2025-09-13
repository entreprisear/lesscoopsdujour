// Les Scoops du Jour - Theme Manager
// Gestionnaire complet des thèmes avec transitions fluides

export class ThemeManager {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.currentTheme = this.getStoredTheme() || 'light';
    this.themes = ['light', 'dark', 'beninois', 'sepia', 'auto'];
    this.isTransitioning = false;
    this.transitionDuration = 300; // ms

    this.init();
  }

  init() {
    console.log('🎨 Theme Manager initialized');

    // Appliquer le thème actuel
    this.applyTheme(this.currentTheme, false);

    // Écouter les changements de préférences système
    this.setupSystemThemeListener();

    // Créer le sélecteur de thème
    this.createThemeSelector();

    // Écouter les événements personnalisés
    this.setupEventListeners();
  }

  // ===== GESTION DES THÈMES =====

  toggleTheme(themeName) {
    if (this.isTransitioning || !this.themes.includes(themeName)) {
      return false;
    }

    console.log(`🎨 Switching to theme: ${themeName}`);
    this.currentTheme = themeName;
    this.applyTheme(themeName, true);
    this.storeTheme(themeName);
    this.broadcastThemeChange();

    return true;
  }

  applyTheme(theme, withTransition = true) {
    if (this.isTransitioning) return;

    this.isTransitioning = withTransition;

    // Appliquer la classe de transition
    if (withTransition) {
      document.documentElement.classList.add('theme-transitioning');
    }

    // Déterminer le thème réel (pour auto)
    const actualTheme = theme === 'auto' ? this.getSystemTheme() : theme;

    // Appliquer le thème
    document.documentElement.setAttribute('data-theme', actualTheme);
    this.updateMetaThemeColor(actualTheme);

    // Mettre à jour l'interface
    this.updateThemeSelector(actualTheme);

    // Retirer la classe de transition après l'animation
    if (withTransition) {
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
        this.isTransitioning = false;
      }, this.transitionDuration);
    } else {
      this.isTransitioning = false;
    }
  }

  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // ===== STOCKAGE =====

  getStoredTheme() {
    const prefs = this.storageManager.getUserPreferences();
    return prefs.theme || 'light';
  }

  storeTheme(theme) {
    const prefs = this.storageManager.getUserPreferences();
    prefs.theme = theme;
    this.storageManager.saveUserPreferences(prefs);
  }

  // ===== SÉLECTEUR DE THÈME =====

  createThemeSelector() {
    const selector = document.createElement('div');
    selector.id = 'theme-selector';
    selector.className = 'theme-selector';
    selector.innerHTML = `
      <button class="theme-toggle-btn" id="theme-toggle-btn" aria-label="Changer de thème">
        <span class="theme-icon">${this.getThemeIcon(this.currentTheme)}</span>
        <span class="theme-label">${this.getThemeLabel(this.currentTheme)}</span>
      </button>
      <div class="theme-dropdown" id="theme-dropdown">
        ${this.themes.map(theme => `
          <button class="theme-option" data-theme="${theme}" ${theme === this.currentTheme ? 'aria-current="true"' : ''}>
            <span class="theme-option-icon">${this.getThemeIcon(theme)}</span>
            <span class="theme-option-label">${this.getThemeLabel(theme)}</span>
            ${theme === this.currentTheme ? '<span class="theme-check">✓</span>' : ''}
          </button>
        `).join('')}
      </div>
    `;

    // Insérer dans le header
    const header = document.querySelector('.header-main .container');
    if (header) {
      header.appendChild(selector);
      this.bindThemeSelectorEvents();
    }
  }

  updateThemeSelector(activeTheme) {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const options = document.querySelectorAll('.theme-option');

    if (toggleBtn) {
      toggleBtn.querySelector('.theme-icon').textContent = this.getThemeIcon(activeTheme);
      toggleBtn.querySelector('.theme-label').textContent = this.getThemeLabel(activeTheme);
    }

    options.forEach(option => {
      const theme = option.dataset.theme;
      const isActive = theme === activeTheme;
      option.setAttribute('aria-current', isActive);
      option.querySelector('.theme-check').style.opacity = isActive ? '1' : '0';
    });
  }

  bindThemeSelectorEvents() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const dropdown = document.getElementById('theme-dropdown');
    const options = document.querySelectorAll('.theme-option');

    // Toggle dropdown
    if (toggleBtn && dropdown) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
        toggleBtn.classList.toggle('active');
      });

      // Fermer dropdown au clic extérieur
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
          dropdown.classList.remove('active');
          toggleBtn.classList.remove('active');
        }
      });
    }

    // Sélection de thème
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        const theme = e.currentTarget.dataset.theme;
        this.toggleTheme(theme);

        // Fermer dropdown
        dropdown.classList.remove('active');
        toggleBtn.classList.remove('active');
      });
    });
  }

  // ===== UTILITAIRES =====

  getThemeIcon(theme) {
    const icons = {
      light: '☀️',
      dark: '🌙',
      beninois: '🇧🇯',
      sepia: '📖',
      auto: '⚙️'
    };
    return icons[theme] || '🎨';
  }

  getThemeLabel(theme) {
    const labels = {
      light: 'Clair',
      dark: 'Sombre',
      beninois: 'Béninois',
      sepia: 'Sepia',
      auto: 'Auto'
    };
    return labels[theme] || theme;
  }

  updateMetaThemeColor(theme) {
    const colors = {
      light: '#ffffff',
      dark: '#1a1a1a',
      beninois: '#f0f8e8',
      sepia: '#f4ecd8',
      auto: this.getSystemTheme() === 'dark' ? '#1a1a1a' : '#ffffff'
    };

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', colors[theme] || colors.light);
    }
  }

  // ===== ÉCOUTEURS =====

  setupSystemThemeListener() {
    // Écouter les changements de préférences système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (this.currentTheme === 'auto') {
        this.applyTheme('auto', true);
      }
    });
  }

  setupEventListeners() {
    // Écouter les changements de thème depuis d'autres composants
    window.addEventListener('themeChange', (e) => {
      if (e.detail && e.detail.theme) {
        this.toggleTheme(e.detail.theme);
      }
    });

    // Écouter les changements de stockage (sync entre onglets)
    window.addEventListener('storageSync', (e) => {
      if (e.detail.key === 'userPreferences') {
        const newPrefs = JSON.parse(e.detail.newValue);
        if (newPrefs.theme && newPrefs.theme !== this.currentTheme) {
          this.currentTheme = newPrefs.theme;
          this.applyTheme(this.currentTheme, false);
        }
      }
    });
  }

  broadcastThemeChange() {
    // Notifier les autres composants du changement de thème
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: {
        theme: this.currentTheme,
        actualTheme: this.currentTheme === 'auto' ? this.getSystemTheme() : this.currentTheme
      }
    }));
  }

  // ===== API PUBLIQUE =====

  getCurrentTheme() {
    return this.currentTheme;
  }

  getActualTheme() {
    return this.currentTheme === 'auto' ? this.getSystemTheme() : this.currentTheme;
  }

  getAvailableThemes() {
    return [...this.themes];
  }

  isThemeAvailable(theme) {
    return this.themes.includes(theme);
  }
}

// ===== FONCTIONS UTILITAIRES =====

// Initialiser le Theme Manager
export function initThemeManager(storageManager) {
  const themeManager = new ThemeManager(storageManager);

  // Exposer globalement
  window.themeManager = themeManager;

  return themeManager;
}

// Fonctions utilitaires pour un accès facile
export function toggleTheme(theme) {
  if (window.themeManager) {
    return window.themeManager.toggleTheme(theme);
  }
  return false;
}

export function getCurrentTheme() {
  if (window.themeManager) {
    return window.themeManager.getCurrentTheme();
  }
  return 'light';
}

export function getActualTheme() {
  if (window.themeManager) {
    return window.themeManager.getActualTheme();
  }
  return 'light';
}

// Export de la classe pour utilisation avancée
export { ThemeManager };
