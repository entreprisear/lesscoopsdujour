// Les Scoops du Jour - Social Widgets Component
// Intégration de widgets sociaux (Twitter, Facebook, Instagram, YouTube)

export class SocialWidgets {
  constructor(options = {}) {
    this.options = {
      twitter: options.twitter || {},
      facebook: options.facebook || {},
      instagram: options.instagram || {},
      youtube: options.youtube || {},
      ...options
    };

    this.widgets = {};
    this.init();
  }

  init() {
    this.loadSocialScripts();
    console.log('📱 Social Widgets initialized');
  }

  // ===== CHARGEMENT DES SCRIPTS SOCIAUX =====

  loadSocialScripts() {
    // Twitter Script
    if (this.options.twitter.enabled) {
      this.loadTwitterScript();
    }

    // Facebook Script
    if (this.options.facebook.enabled) {
      this.loadFacebookScript();
    }

    // Instagram Script
    if (this.options.instagram.enabled) {
      this.loadInstagramScript();
    }

    // YouTube Script
    if (this.options.youtube.enabled) {
      this.loadYouTubeScript();
    }
  }

  loadTwitterScript() {
    if (window.twttr) return; // Déjà chargé

    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.onload = () => {
      console.log('🐦 Twitter widgets loaded');
      this.initTwitterWidgets();
    };
    document.head.appendChild(script);
  }

  loadFacebookScript() {
    if (window.FB) return; // Déjà chargé

    // SDK Facebook
    window.fbAsyncInit = () => {
      FB.init({
        appId: this.options.facebook.appId || 'your-facebook-app-id',
        xfbml: true,
        version: 'v18.0'
      });
      console.log('📘 Facebook SDK loaded');
      this.initFacebookWidgets();
    };

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/fr_FR/sdk.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  loadInstagramScript() {
    // Instagram utilise l'API oEmbed, pas de script spécial nécessaire
    console.log('📷 Instagram ready');
    this.initInstagramWidgets();
  }

  loadYouTubeScript() {
    if (window.YT) return; // Déjà chargé

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onload = () => {
      console.log('📺 YouTube API loaded');
      this.initYouTubeWidgets();
    };
    document.head.appendChild(script);
  }

  // ===== WIDGETS TWITTER =====

  createTwitterTimeline(container, options = {}) {
    const defaultOptions = {
      username: 'LesScoopsDuJour',
      height: 400,
      width: '100%',
      theme: 'light',
      ...options
    };

    const widgetId = `twitter-timeline-${Date.now()}`;
    container.id = widgetId;

    const timelineHtml = `
      <a class="twitter-timeline"
         href="https://twitter.com/${defaultOptions.username}"
         data-height="${defaultOptions.height}"
         data-width="${defaultOptions.width}"
         data-theme="${defaultOptions.theme}"
         data-chrome="noheader nofooter noborders transparent"
         data-tweet-limit="3">
        Tweets de @${defaultOptions.username}
      </a>
    `;

    container.innerHTML = timelineHtml;

    // Recharger les widgets Twitter si déjà chargé
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load(container);
    }

    return container;
  }

  createTwitterTweet(container, tweetId, options = {}) {
    const defaultOptions = {
      theme: 'light',
      ...options
    };

    const widgetHtml = `
      <blockquote class="twitter-tweet"
                  data-theme="${defaultOptions.theme}"
                  data-lang="fr">
        <a href="https://twitter.com/user/status/${tweetId}"></a>
      </blockquote>
    `;

    container.innerHTML = widgetHtml;

    // Recharger les widgets Twitter
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load(container);
    }

    return container;
  }

  initTwitterWidgets() {
    // Initialiser tous les widgets Twitter présents sur la page
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load();
    }
  }

  // ===== WIDGETS FACEBOOK =====

  createFacebookPage(container, options = {}) {
    const defaultOptions = {
      pageUrl: 'https://www.facebook.com/LesScoopsDuJour',
      width: 340,
      height: 500,
      showFacepile: true,
      showPosts: false,
      ...options
    };

    const widgetHtml = `
      <div class="fb-page"
           data-href="${defaultOptions.pageUrl}"
           data-width="${defaultOptions.width}"
           data-height="${defaultOptions.height}"
           data-small-header="false"
           data-adapt-container-width="true"
           data-hide-cover="false"
           data-show-facepile="${defaultOptions.showFacepile}"
           data-show-posts="${defaultOptions.showPosts}">
        <blockquote cite="${defaultOptions.pageUrl}" class="fb-xfbml-parse-ignore">
          <a href="${defaultOptions.pageUrl}">Les Scoops du Jour</a>
        </blockquote>
      </div>
    `;

    container.innerHTML = widgetHtml;

    // Recharger les widgets Facebook
    if (window.FB && window.FB.XFBML) {
      window.FB.XFBML.parse(container);
    }

    return container;
  }

  createFacebookPost(container, postUrl, options = {}) {
    const defaultOptions = {
      width: 500,
      showText: true,
      ...options
    };

    const widgetHtml = `
      <div class="fb-post"
           data-href="${postUrl}"
           data-width="${defaultOptions.width}"
           data-show-text="${defaultOptions.showText}">
      </div>
    `;

    container.innerHTML = widgetHtml;

    // Recharger les widgets Facebook
    if (window.FB && window.FB.XFBML) {
      window.FB.XFBML.parse(container);
    }

    return container;
  }

  initFacebookWidgets() {
    // Initialiser tous les widgets Facebook présents sur la page
    if (window.FB && window.FB.XFBML) {
      window.FB.XFBML.parse();
    }
  }

  // ===== WIDGETS INSTAGRAM =====

  async createInstagramPost(container, postUrl, options = {}) {
    const defaultOptions = {
      hideCaption: false,
      maxWidth: 540,
      ...options
    };

    try {
      // Utiliser l'API oEmbed d'Instagram
      const oembedUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(postUrl)}&access_token=${this.options.instagram.accessToken || 'your-instagram-token'}`;

      const response = await fetch(oembedUrl);
      const data = await response.json();

      if (data.html) {
        container.innerHTML = data.html;

        // Ajuster la taille si nécessaire
        const iframe = container.querySelector('iframe');
        if (iframe) {
          iframe.style.maxWidth = `${defaultOptions.maxWidth}px`;
          iframe.style.width = '100%';
        }
      } else {
        // Fallback vers un lien simple
        container.innerHTML = `
          <a href="${postUrl}" target="_blank" rel="noopener">
            Voir la publication Instagram
          </a>
        `;
      }
    } catch (error) {
      console.error('Erreur lors du chargement du post Instagram:', error);
      container.innerHTML = `
        <a href="${postUrl}" target="_blank" rel="noopener">
          Voir la publication Instagram
        </a>
      `;
    }

    return container;
  }

  async createInstagramProfile(container, username, options = {}) {
    const defaultOptions = {
      maxWidth: 320,
      ...options
    };

    // Créer un lien vers le profil Instagram
    const profileUrl = `https://www.instagram.com/${username}/`;

    container.innerHTML = `
      <div class="instagram-profile-widget">
        <a href="${profileUrl}" target="_blank" rel="noopener" class="instagram-link">
          <div class="instagram-icon">📷</div>
          <div class="instagram-text">
            <strong>@${username}</strong><br>
            Suivez-nous sur Instagram
          </div>
        </a>
      </div>
    `;

    return container;
  }

  initInstagramWidgets() {
    // Les widgets Instagram sont initialisés lors de leur création
    console.log('📷 Instagram widgets ready');
  }

  // ===== WIDGETS YOUTUBE =====

  createYouTubeVideo(container, videoId, options = {}) {
    const defaultOptions = {
      width: '100%',
      height: 315,
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      ...options
    };

    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${defaultOptions.autoplay}&controls=${defaultOptions.controls}&modestbranding=${defaultOptions.modestbranding}`;

    const widgetHtml = `
      <div class="youtube-video-widget">
        <iframe width="${defaultOptions.width}"
                height="${defaultOptions.height}"
                src="${embedUrl}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
        </iframe>
      </div>
    `;

    container.innerHTML = widgetHtml;
    return container;
  }

  createYouTubeChannel(container, channelId, options = {}) {
    const defaultOptions = {
      width: '100%',
      height: 315,
      ...options
    };

    // Utiliser l'API YouTube pour obtenir les dernières vidéos
    const apiKey = this.options.youtube.apiKey || 'your-youtube-api-key';
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=3`;

    // Pour l'instant, créer un widget simple
    const widgetHtml = `
      <div class="youtube-channel-widget">
        <div class="youtube-header">
          <h4>📺 Chaîne YouTube</h4>
          <a href="https://www.youtube.com/channel/${channelId}" target="_blank" rel="noopener">
            Voir toutes les vidéos →
          </a>
        </div>
        <div class="youtube-placeholder">
          <p>Vidéos récentes de notre chaîne YouTube</p>
          <a href="https://www.youtube.com/channel/${channelId}" target="_blank" rel="noopener" class="youtube-link">
            S'abonner sur YouTube
          </a>
        </div>
      </div>
    `;

    container.innerHTML = widgetHtml;
    return container;
  }

  initYouTubeWidgets() {
    // Les widgets YouTube sont initialisés lors de leur création
    console.log('📺 YouTube widgets ready');
  }

  // ===== MÉTHODES UTILITAIRES =====

  createWidget(container, type, options = {}) {
    switch (type) {
      case 'twitter-timeline':
        return this.createTwitterTimeline(container, options);
      case 'twitter-tweet':
        return this.createTwitterTweet(container, options.tweetId, options);
      case 'facebook-page':
        return this.createFacebookPage(container, options);
      case 'facebook-post':
        return this.createFacebookPost(container, options.postUrl, options);
      case 'instagram-post':
        return this.createInstagramPost(container, options.postUrl, options);
      case 'instagram-profile':
        return this.createInstagramProfile(container, options.username, options);
      case 'youtube-video':
        return this.createYouTubeVideo(container, options.videoId, options);
      case 'youtube-channel':
        return this.createYouTubeChannel(container, options.channelId, options);
      default:
        console.warn(`Type de widget inconnu: ${type}`);
        return container;
    }
  }

  refreshAllWidgets() {
    // Rafraîchir tous les widgets
    this.initTwitterWidgets();
    this.initFacebookWidgets();
    this.initInstagramWidgets();
    this.initYouTubeWidgets();
  }

  destroy() {
    // Nettoyer les ressources si nécessaire
    this.widgets = {};
  }
}

// ===== FONCTIONS UTILITAIRES =====

// Initialiser les widgets sociaux
export function initSocialWidgets(options = {}) {
  const socialWidgets = new SocialWidgets(options);

  // Exposer globalement
  window.socialWidgets = socialWidgets;

  return socialWidgets;
}

// Créer un widget social spécifique
export function createSocialWidget(container, type, options = {}) {
  if (window.socialWidgets) {
    return window.socialWidgets.createWidget(container, type, options);
  } else {
    console.warn('Social widgets not initialized');
    return container;
  }
}

// Rafraîchir tous les widgets
export function refreshSocialWidgets() {
  if (window.socialWidgets) {
    window.socialWidgets.refreshAllWidgets();
  }
}

// Export de la classe pour utilisation avancée
export { SocialWidgets };
