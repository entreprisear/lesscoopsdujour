// Les Scoops du Jour - Social Share Component
// Système complet de partage social avec Web Share API et optimisations

export class SocialShare {
  constructor(article, options = {}) {
    this.article = article;
    this.options = {
      showCounters: options.showCounters || false,
      theme: options.theme || 'default',
      size: options.size || 'medium',
      platforms: options.platforms || [
        'facebook', 'twitter', 'whatsapp',
        'linkedin', 'telegram', 'email', 'copy'
      ],
      ...options
    };

    this.shareUrls = {};
    this.shareCounts = {};
    this.isWebShareSupported = this.checkWebShareSupport();

    this.init();
  }

  init() {
    this.generateShareUrls();
    if (this.options.showCounters) {
      this.loadShareCounts();
    }
    console.log('🔗 Social Share initialized for article:', this.article.title);
  }

  // ===== GÉNÉRATION DES URLS DE PARTAGE =====

  generateShareUrls() {
    const baseUrl = this.getCanonicalUrl();
    const title = this.getShareTitle();
    const description = this.getShareDescription();
    const image = this.getShareImage();

    this.shareUrls = {
      facebook: this.getFacebookUrl(baseUrl, title, description, image),
      twitter: this.getTwitterUrl(baseUrl, title, description),
      whatsapp: this.getWhatsAppUrl(baseUrl, title),
      linkedin: this.getLinkedInUrl(baseUrl, title, description),
      telegram: this.getTelegramUrl(baseUrl, title),
      email: this.getEmailUrl(title, description, baseUrl),
      copy: baseUrl
    };

    return this.shareUrls;
  }

  getCanonicalUrl() {
    // En production, utiliser l'URL réelle de l'article
    const baseUrl = window.location.origin;
    const articleSlug = this.slugify(this.article.title);
    return `${baseUrl}/article/${this.article.id}/${articleSlug}`;
  }

  getShareTitle() {
    const title = this.article.title;
    const maxLength = 60;
    return title.length > maxLength ? title.substring(0, maxLength - 3) + '...' : title;
  }

  getShareDescription() {
    const description = this.article.excerpt || this.article.description || '';
    const maxLength = 160;
    return description.length > maxLength ? description.substring(0, maxLength - 3) + '...' : description;
  }

  getShareImage() {
    return this.article.image || this.article.urlToImage || `${window.location.origin}/images/og-default.jpg`;
  }

  // ===== URLS SPÉCIFIQUES PAR PLATEFORME =====

  getFacebookUrl(url, title, description, image) {
    const params = new URLSearchParams({
      u: url,
      title: title,
      description: description,
      picture: image
    });
    return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
  }

  getTwitterUrl(url, title, description) {
    const text = `${title} - ${description}`;
    const params = new URLSearchParams({
      url: url,
      text: text,
      via: 'LesScoopsDuJour',
      hashtags: this.getHashtags()
    });
    return `https://twitter.com/intent/tweet?${params.toString()}`;
  }

  getWhatsAppUrl(url, title) {
    const text = `${title} ${url}`;
    if (this.isMobile()) {
      return `whatsapp://send?text=${encodeURIComponent(text)}`;
    } else {
      return `https://wa.me/?text=${encodeURIComponent(text)}`;
    }
  }

  getLinkedInUrl(url, title, description) {
    const params = new URLSearchParams({
      url: url,
      title: title,
      summary: description,
      source: 'Les Scoops du Jour'
    });
    return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
  }

  getTelegramUrl(url, title) {
    const text = `${title} - ${url}`;
    return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  }

  getEmailUrl(title, description, url) {
    const subject = `Les Scoops du Jour - ${title}`;
    const body = `${description}\n\nLire l'article complet : ${url}\n\n--\nLes Scoops du Jour - L'actualité du Bénin`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  getHashtags() {
    const categoryHashtags = {
      politique: 'PolitiqueBenin',
      economie: 'EconomieBenin',
      sport: 'SportBenin',
      culture: 'CultureBenin',
      tech: 'TechBenin'
    };

    const categoryTag = categoryHashtags[this.article.category] || 'Benin';
    return `Benin,Actualite,${categoryTag}`;
  }

  // ===== WEB SHARE API =====

  checkWebShareSupport() {
    return navigator.share && navigator.canShare ? true : false;
  }

  async shareNative(platform) {
    if (!this.isWebShareSupported) {
      // Fallback vers les URLs traditionnelles
      return this.shareTraditional(platform);
    }

    try {
      const shareData = {
        title: this.getShareTitle(),
        text: this.getShareDescription(),
        url: this.getCanonicalUrl()
      };

      // Ajouter l'image si supportée
      if (navigator.canShare && navigator.canShare({ files: [] })) {
        try {
          const imageBlob = await this.fetchImageAsBlob(this.getShareImage());
          if (imageBlob) {
            const imageFile = new File([imageBlob], 'article-image.jpg', { type: 'image/jpeg' });
            shareData.files = [imageFile];
          }
        } catch (error) {
          console.warn('Could not load image for sharing:', error);
        }
      }

      await navigator.share(shareData);
      this.trackShare('native', platform);
      this.showNotification('Article partagé avec succès !', 'success');

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Fallback vers les URLs traditionnelles
        this.shareTraditional(platform);
      }
    }
  }

  async fetchImageAsBlob(imageUrl) {
    try {
      const response = await fetch(imageUrl);
      if (response.ok) {
        return await response.blob();
      }
    } catch (error) {
      console.warn('Could not fetch image:', error);
    }
    return null;
  }

  shareTraditional(platform) {
    const url = this.shareUrls[platform];
    if (url) {
      if (platform === 'copy') {
        this.copyToClipboard(url);
      } else {
        this.openShareWindow(url, platform);
      }
      this.trackShare('traditional', platform);
    }
  }

  openShareWindow(url, platform) {
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const windowFeatures = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`;

    window.open(url, `share-${platform}`, windowFeatures);
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showNotification('Lien copié dans le presse-papiers !', 'success');
    } catch (error) {
      // Fallback pour les navigateurs qui ne supportent pas l'API Clipboard
      this.fallbackCopyToClipboard(text);
    }
  }

  fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      this.showNotification('Lien copié dans le presse-papiers !', 'success');
    } catch (error) {
      this.showNotification('Erreur lors de la copie', 'error');
    } finally {
      document.body.removeChild(textArea);
    }
  }

  // ===== COMPOSANTS UI =====

  render() {
    const container = document.createElement('div');
    container.className = `social-share social-share-${this.options.theme} social-share-${this.options.size}`;

    // Titre optionnel
    if (this.options.showTitle) {
      const title = document.createElement('h4');
      title.className = 'share-title';
      title.textContent = 'Partager cet article';
      container.appendChild(title);
    }

    // Conteneur des boutons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'share-buttons';

    this.options.platforms.forEach(platform => {
      const button = this.createShareButton(platform);
      buttonsContainer.appendChild(button);
    });

    container.appendChild(buttonsContainer);

    // Bouton de partage natif (si supporté)
    if (this.isWebShareSupported) {
      const nativeButton = this.createNativeShareButton();
      container.appendChild(nativeButton);
    }

    return container;
  }

  createShareButton(platform) {
    const button = document.createElement('button');
    button.className = `share-btn share-btn-${platform}`;
    button.setAttribute('data-platform', platform);
    button.title = `Partager sur ${this.getPlatformName(platform)}`;

    // Icône
    const icon = document.createElement('span');
    icon.className = 'share-icon';
    icon.innerHTML = this.getPlatformIcon(platform);
    button.appendChild(icon);

    // Label optionnel
    if (this.options.showLabels) {
      const label = document.createElement('span');
      label.className = 'share-label';
      label.textContent = this.getPlatformName(platform);
      button.appendChild(label);
    }

    // Compteur optionnel
    if (this.options.showCounters && this.shareCounts[platform]) {
      const counter = document.createElement('span');
      counter.className = 'share-counter';
      counter.textContent = this.formatCount(this.shareCounts[platform]);
      button.appendChild(counter);
    }

    // Événement de clic
    button.addEventListener('click', () => this.handleShare(platform));

    return button;
  }

  createNativeShareButton() {
    const button = document.createElement('button');
    button.className = 'share-btn share-btn-native';
    button.title = 'Partager';

    const icon = document.createElement('span');
    icon.className = 'share-icon';
    icon.innerHTML = '📤';
    button.appendChild(icon);

    if (this.options.showLabels) {
      const label = document.createElement('span');
      label.className = 'share-label';
      label.textContent = 'Partager';
      button.appendChild(label);
    }

    button.addEventListener('click', () => this.shareNative());

    return button;
  }

  getPlatformIcon(platform) {
    const icons = {
      facebook: '📘',
      twitter: '🐦',
      whatsapp: '💬',
      linkedin: '💼',
      telegram: '✈️',
      email: '✉️',
      copy: '📋'
    };
    return icons[platform] || '🔗';
  }

  getPlatformName(platform) {
    const names = {
      facebook: 'Facebook',
      twitter: 'Twitter',
      whatsapp: 'WhatsApp',
      linkedin: 'LinkedIn',
      telegram: 'Telegram',
      email: 'Email',
      copy: 'Copier'
    };
    return names[platform] || platform;
  }

  // ===== GESTION DES ÉVÉNEMENTS =====

  handleShare(platform) {
    if (platform === 'copy') {
      this.copyToClipboard(this.shareUrls.copy);
    } else {
      this.shareTraditional(platform);
    }
  }

  // ===== COMPTEURS DE PARTAGE =====

  async loadShareCounts() {
    // Simulation des compteurs (en production, utiliser les APIs des réseaux sociaux)
    this.shareCounts = {
      facebook: Math.floor(Math.random() * 50) + 10,
      twitter: Math.floor(Math.random() * 30) + 5,
      whatsapp: Math.floor(Math.random() * 20) + 3,
      linkedin: Math.floor(Math.random() * 15) + 2,
      telegram: Math.floor(Math.random() * 10) + 1,
      email: Math.floor(Math.random() * 5) + 1
    };
  }

  formatCount(count) {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  // ===== ANALYTICS ET TRACKING =====

  trackShare(method, platform) {
    // Analytics (en production, envoyer à Google Analytics, etc.)
    console.log(`📊 Share tracked: ${method} - ${platform}`, {
      articleId: this.article.id,
      articleTitle: this.article.title,
      platform,
      method,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Stocker localement pour les métriques
    if (window.storageManager) {
      const metrics = window.storageManager.getItem('share_metrics', {});
      const key = `${platform}_${method}`;
      metrics[key] = (metrics[key] || 0) + 1;
      window.storageManager.setItem('share_metrics', metrics);
    }

    // Événement personnalisé pour d'autres composants
    window.dispatchEvent(new CustomEvent('articleShared', {
      detail: {
        article: this.article,
        platform,
        method,
        timestamp: new Date()
      }
    }));
  }

  // ===== UTILITAIRES =====

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  showNotification(message, type = 'info') {
    window.dispatchEvent(new CustomEvent('showNotification', {
      detail: { message, type }
    }));
  }

  // ===== MÉTHODES STATIQUES =====

  static createShareWidget(article, container, options = {}) {
    const shareComponent = new SocialShare(article, options);
    container.appendChild(shareComponent.render());
    return shareComponent;
  }

  static shareArticle(article, platform = 'native') {
    const shareComponent = new SocialShare(article);
    if (platform === 'native' && shareComponent.isWebShareSupported) {
      return shareComponent.shareNative();
    } else {
      return shareComponent.shareTraditional(platform);
    }
  }
}

// ===== FONCTIONS UTILITAIRES =====

// Initialiser le partage social pour un article
export function initSocialShare(article, container, options = {}) {
  const socialShare = new SocialShare(article, options);
  if (container) {
    container.appendChild(socialShare.render());
  }
  return socialShare;
}

// Partage rapide d'un article
export function quickShare(article, platform = 'native') {
  return SocialShare.shareArticle(article, platform);
}

// Obtenir les URLs de partage pour un article
export function getShareUrls(article) {
  const shareComponent = new SocialShare(article);
  return shareComponent.generateShareUrls();
}

// Export de la classe pour utilisation avancée
export { SocialShare };
