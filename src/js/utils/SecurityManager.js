// Les Scoops du Jour - Security Manager
// Gestion complète de la sécurité : CSP, validation, protection XSS

class SecurityManager {
  constructor(options = {}) {
    this.options = {
      enableCSP: options.enableCSP !== false,
      enableInputValidation: options.enableInputValidation !== false,
      enableXSSProtection: options.enableXSSProtection !== false,
      enableRateLimiting: options.enableRateLimiting !== false,
      cspReportUri: options.cspReportUri || '/api/csp-report',
      ...options
    };

    this.rateLimits = new Map();
    this.sanitizedElements = new WeakSet();

    this.init();
  }

  init() {
    if (this.options.enableCSP) {
      this.setupCSP();
    }

    if (this.options.enableInputValidation) {
      this.setupInputValidation();
    }

    if (this.options.enableXSSProtection) {
      this.setupXSSProtection();
    }

    if (this.options.enableRateLimiting) {
      this.setupRateLimiting();
    }

    console.log('🔒 Security Manager initialized');
  }

  // ===== CONTENT SECURITY POLICY (CSP) =====

  setupCSP() {
    // Générer la politique CSP
    const cspPolicy = this.generateCSPPolicy();

    // Appliquer la politique
    this.applyCSP(cspPolicy);

    // Configurer les rapports CSP
    this.setupCSPReporting();

    console.log('🔒 CSP policy applied');
  }

  generateCSPPolicy() {
    const policy = {
      // Sources par défaut
      'default-src': ["'self'"],

      // Scripts
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Nécessaire pour certains composants (temporaire)
        "https://platform.twitter.com",
        "https://connect.facebook.net",
        "https://www.youtube.com",
        "https://www.instagram.com"
      ],

      // Styles
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Pour les styles dynamiques
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com"
      ],

      // Images
      'img-src': [
        "'self'",
        "data:", // Pour les images base64
        "https://via.placeholder.com",
        "https://picsum.photos",
        "https://images.unsplash.com",
        "https://platform.twitter.com",
        "https://scontent.xx.fbcdn.net"
      ],

      // Fonts
      'font-src': [
        "'self'",
        "https://fonts.gstatic.com"
      ],

      // Connexions
      'connect-src': [
        "'self'",
        "https://api.twitter.com",
        "https://graph.facebook.com",
        "https://www.googleapis.com",
        "https://api.unsplash.com"
      ],

      // Frames
      'frame-src': [
        "'self'",
        "https://platform.twitter.com",
        "https://www.facebook.com",
        "https://www.youtube.com",
        "https://www.instagram.com"
      ],

      // Media
      'media-src': [
        "'self'",
        "https://www.youtube.com",
        "https://www.instagram.com"
      ],

      // Objects
      'object-src': ["'none'"],

      // Autres directives
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"], // Pas d'iframe embedding
      'upgrade-insecure-requests': [], // Force HTTPS en production

      // Rapports
      'report-uri': [this.options.cspReportUri],
      'report-to': ['csp-endpoint']
    };

    return policy;
  }

  applyCSP(policy) {
    const cspString = Object.entries(policy)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');

    // Créer la meta tag CSP
    const metaTag = document.createElement('meta');
    metaTag.setAttribute('http-equiv', 'Content-Security-Policy');
    metaTag.setAttribute('content', cspString);

    // L'insérer au début du head
    const firstChild = document.head.firstChild;
    document.head.insertBefore(metaTag, firstChild);
  }

  setupCSPReporting() {
    // Écouter les rapports CSP
    document.addEventListener('securitypolicyviolation', (event) => {
      this.reportCSPViolation(event);
    });
  }

  reportCSPViolation(event) {
    const violation = {
      documentURI: event.documentURI,
      violatedDirective: event.violatedDirective,
      effectiveDirective: event.effectiveDirective,
      originalPolicy: event.originalPolicy,
      blockedURI: event.blockedURI,
      statusCode: event.statusCode,
      timestamp: Date.now()
    };

    console.warn('🔒 CSP Violation:', violation);

    // En production, envoyer à un service de monitoring
    if (window.analytics) {
      window.analytics.track('csp_violation', violation);
    }
  }

  // ===== VALIDATION DES INPUTS =====

  setupInputValidation() {
    // Validation en temps réel des inputs
    document.addEventListener('input', (event) => {
      if (event.target.matches('input, textarea, select')) {
        this.validateInput(event.target);
      }
    });

    // Validation avant soumission de formulaire
    document.addEventListener('submit', (event) => {
      if (!this.validateForm(event.target)) {
        event.preventDefault();
      }
    });

    console.log('🔒 Input validation enabled');
  }

  validateInput(input) {
    const value = input.value;
    const type = input.type;
    const name = input.name;

    let isValid = true;
    let errorMessage = '';

    // Validation par type
    switch (type) {
      case 'email':
        isValid = this.isValidEmail(value);
        errorMessage = isValid ? '' : 'Adresse email invalide';
        break;

      case 'url':
        isValid = this.isValidUrl(value);
        errorMessage = isValid ? '' : 'URL invalide';
        break;

      case 'text':
      case 'textarea':
        // Validation basée sur le nom du champ
        if (name === 'comment' || name === 'message') {
          isValid = this.validateTextContent(value);
          errorMessage = isValid ? '' : 'Contenu invalide détecté';
        } else if (name === 'search') {
          isValid = this.validateSearchQuery(value);
          errorMessage = isValid ? '' : 'Requête de recherche invalide';
        }
        break;
    }

    // Appliquer la validation visuelle
    this.updateInputValidationUI(input, isValid, errorMessage);

    return isValid;
  }

  validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateInput(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  validateTextContent(content) {
    // Vérifier la longueur
    if (content.length > 10000) return false;

    // Vérifier les caractères dangereux
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    return !dangerousPatterns.some(pattern => pattern.test(content));
  }

  validateSearchQuery(query) {
    // Vérifier la longueur
    if (query.length > 200) return false;

    // Vérifier les caractères spéciaux dangereux
    const dangerousChars = ['<', '>', '"', "'", ';', '\\'];
    return !dangerousChars.some(char => query.includes(char));
  }

  updateInputValidationUI(input, isValid, errorMessage) {
    // Supprimer les messages d'erreur existants
    const existingError = input.parentNode.querySelector('.validation-error');
    if (existingError) {
      existingError.remove();
    }

    // Mettre à jour les classes CSS
    input.classList.toggle('invalid', !isValid);
    input.classList.toggle('valid', isValid);

    // Ajouter le message d'erreur si nécessaire
    if (!isValid && errorMessage) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'validation-error';
      errorDiv.textContent = errorMessage;
      errorDiv.style.color = '#dc3545';
      errorDiv.style.fontSize = '0.875rem';
      errorDiv.style.marginTop = '0.25rem';

      input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }
  }

  // ===== PROTECTION XSS =====

  setupXSSProtection() {
    // Sanitisation automatique du contenu dynamique
    this.setupContentSanitization();

    // Protection contre les attaques DOM-based XSS
    this.setupDOMXSSProtection();

    console.log('🔒 XSS protection enabled');
  }

  setupContentSanitization() {
    // Intercepter les insertions de contenu HTML
    const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');

    Object.defineProperty(Element.prototype, 'innerHTML', {
      set: function(value) {
        if (typeof value === 'string' && value.includes('<')) {
          // Sanitiser le contenu
          value = window.securityManager ? window.securityManager.sanitizeHTML(value) : value;
        }
        return originalInnerHTML.set.call(this, value);
      }
    });
  }

  setupDOMXSSProtection() {
    // Surveiller les changements DOM suspects
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.checkForXSSPatterns(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  sanitizeHTML(html) {
    // Créer un élément temporaire pour parser le HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Supprimer les éléments dangereux
    const dangerousElements = tempDiv.querySelectorAll('script, iframe, object, embed, form[action*="javascript"]');
    dangerousElements.forEach(element => element.remove());

    // Sanitiser les attributs dangereux
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(element => {
      // Supprimer les attributs d'événement
      Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          element.removeAttribute(attr.name);
        }

        // Sanitiser les attributs href et src
        if (attr.name === 'href' || attr.name === 'src') {
          if (attr.value.startsWith('javascript:') || attr.value.startsWith('data:text/html')) {
            element.removeAttribute(attr.name);
          }
        }
      });
    });

    return tempDiv.innerHTML;
  }

  checkForXSSPatterns(element) {
    // Vérifier les patterns XSS courants
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /eval\(/i,
      /document\.cookie/i
    ];

    const elementHTML = element.outerHTML || element.innerHTML || '';

    if (suspiciousPatterns.some(pattern => pattern.test(elementHTML))) {
      console.warn('🔒 Potential XSS pattern detected:', element);

      // Signaler l'incident
      if (window.analytics) {
        window.analytics.track('xss_attempt_detected', {
          element: element.tagName,
          content: elementHTML.substring(0, 200)
        });
      }

      // Supprimer l'élément suspect
      element.remove();
    }
  }

  // ===== RATE LIMITING =====

  setupRateLimiting() {
    // Rate limiting pour les actions utilisateur
    document.addEventListener('click', (event) => {
      this.checkRateLimit(event.target, 'click');
    });

    document.addEventListener('submit', (event) => {
      if (!this.checkRateLimit(event.target, 'submit')) {
        event.preventDefault();
      }
    });

    console.log('🔒 Rate limiting enabled');
  }

  checkRateLimit(element, action) {
    const key = `${action}_${element.id || element.className || 'unknown'}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 10; // 10 actions par minute

    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, []);
    }

    const timestamps = this.rateLimits.get(key);

    // Nettoyer les anciens timestamps
    const validTimestamps = timestamps.filter(timestamp => now - timestamp < windowMs);
    this.rateLimits.set(key, validTimestamps);

    if (validTimestamps.length >= maxRequests) {
      console.warn('🔒 Rate limit exceeded for:', key);

      // Afficher un message à l'utilisateur
      this.showRateLimitMessage(element);

      return false;
    }

    // Ajouter le nouveau timestamp
    validTimestamps.push(now);

    return true;
  }

  showRateLimitMessage(element) {
    // Créer un message temporaire
    const message = document.createElement('div');
    message.textContent = 'Trop d\'actions détectées. Veuillez patienter.';
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ffc107;
      color: #000;
      padding: 1rem;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;

    document.body.appendChild(message);

    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  // ===== UTILITAIRES =====

  generateNonce() {
    // Générer un nonce cryptographique
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  hashContent(content) {
    // Hash simple pour l'intégrité (en production, utiliser Subresource Integrity)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  // ===== MÉTRIQUES DE SÉCURITÉ =====

  getSecurityMetrics() {
    return {
      cspEnabled: this.options.enableCSP,
      inputValidationEnabled: this.options.enableInputValidation,
      xssProtectionEnabled: this.options.enableXSSProtection,
      rateLimitingEnabled: this.options.enableRateLimiting,
      rateLimitsActive: this.rateLimits.size,
      sanitizedElementsCount: this.sanitizedElements.size
    };
  }

  // ===== NETTOYAGE =====

  destroy() {
    // Nettoyer les event listeners et observers
    this.rateLimits.clear();
    this.sanitizedElements = new WeakSet();
  }
}

// ===== FONCTIONS UTILITAIRES =====

// Initialiser le gestionnaire de sécurité
export function initSecurityManager(options = {}) {
  const securityManager = new SecurityManager(options);

  // Exposer globalement
  window.securityManager = securityManager;

  return securityManager;
}

// Sanitiser du HTML
export function sanitizeHTML(html) {
  if (window.securityManager) {
    return window.securityManager.sanitizeHTML(html);
  }
  return html;
}

// Valider un input
export function validateInput(input) {
  if (window.securityManager) {
    return window.securityManager.validateInput(input);
  }
  return true;
}

// Vérifier le rate limiting
export function checkRateLimit(element, action) {
  if (window.securityManager) {
    return window.securityManager.checkRateLimit(element, action);
  }
  return true;
}

// Obtenir les métriques de sécurité
export function getSecurityMetrics() {
  if (window.securityManager) {
    return window.securityManager.getSecurityMetrics();
  }
  return null;
}

// Export de la classe pour utilisation avancée
export { SecurityManager };
