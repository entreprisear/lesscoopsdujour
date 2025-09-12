// Tests d'intégration pour le système de partage social
// Tests des interactions entre composants et scénarios utilisateur complets

import { createArticleCard } from '../../src/js/components/ArticleCard.js';
import { SocialShare, initSocialShare } from '../../src/js/components/SocialShare.js';
import { initSocialWidgets } from '../../src/js/components/SocialWidgets.js';
import { initOpenGraphManager } from '../../src/js/utils/OpenGraphManager.js';

describe('Social Sharing Integration', () => {
  let mockArticle;
  let container;

  beforeEach(() => {
    // Configuration des mocks
    testUtils.mockSocialAPIs();

    // Article de test réaliste béninois
    mockArticle = testUtils.createTestArticle({
      id: 1,
      title: 'Coton : Le Bénin vise les 2 millions de tonnes en 2025',
      excerpt: 'Le gouvernement béninois ambitionne de produire 2 millions de tonnes de coton cette année, un record historique qui positionnerait le pays comme leader africain.',
      author: 'Fatou SOW',
      category: 'economie',
      tags: ['coton', 'agriculture', 'exportation', 'benin'],
      image: '/images/articles/coton-benin-2025.jpg',
      publishedAt: '2025-01-15T08:30:00Z',
      views: 2850,
      rating: 4.6,
      reviewCount: 32,
      featured: true
    });

    // Container de test
    container = document.createElement('div');
    container.id = 'integration-test-container';
    document.body.appendChild(container);

    // Reset des mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    testUtils.cleanupDOM();
    jest.clearAllMocks();
  });

  describe('Workflow complet de partage d\'article', () => {
    test('devrait permettre le partage complet d\'un article depuis la carte', async () => {
      // Initialiser les systèmes
      initSocialShare();
      initSocialWidgets();
      initOpenGraphManager();

      // Créer une carte d'article avec partage activé
      const card = createArticleCard(mockArticle, 'large', {
        showShare: true,
        showRating: true,
        showBookmark: true
      });

      const cardElement = card.render();
      container.appendChild(cardElement);

      // Vérifier que la carte est rendue correctement
      expect(cardElement.querySelector('.article-title')).toBeTruthy();
      expect(cardElement.querySelector('.share-buttons')).toBeTruthy();

      // Simuler un clic sur le bouton Facebook
      const facebookBtn = cardElement.querySelector('[data-platform="facebook"]');
      expect(facebookBtn).toBeTruthy();

      // Mock la méthode de partage
      const shareSpy = jest.spyOn(window.socialShare, 'shareArticle').mockResolvedValue(true);

      // Déclencher l'événement de clic
      const clickEvent = testUtils.createEvent('click', { target: facebookBtn });
      facebookBtn.dispatchEvent(clickEvent);

      // Vérifier que le partage a été appelé
      expect(shareSpy).toHaveBeenCalledWith(mockArticle, 'facebook');

      // Vérifier que les métadonnées Open Graph ont été mises à jour
      expect(document.title).toContain(mockArticle.title);
      expect(document.querySelector('meta[property="og:title"]')).toBeTruthy();
    });

    test('devrait gérer le partage natif sur mobile', async () => {
      // Simuler un environnement mobile
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true
      });

      initSocialShare();

      // Web Share API disponible
      navigator.share.mockResolvedValue();

      const result = await window.socialShare.shareArticle(mockArticle, 'native');

      expect(navigator.share).toHaveBeenCalledWith({
        title: mockArticle.title,
        text: mockArticle.excerpt,
        url: mockArticle.url
      });

      expect(result).toBe(true);
    });

    test('devrait utiliser le fallback desktop quand Web Share n\'est pas disponible', async () => {
      // Simuler un environnement desktop sans Web Share API
      delete navigator.share;
      global.open = jest.fn();

      initSocialShare();

      const result = await window.socialShare.shareArticle(mockArticle, 'facebook');

      expect(global.open).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('Intégration avec les widgets sociaux', () => {
    test('devrait initialiser tous les widgets sociaux', () => {
      const socialWidgets = initSocialWidgets({
        twitter: { enabled: true },
        facebook: { enabled: true },
        instagram: { enabled: true },
        youtube: { enabled: true }
      });

      expect(window.socialWidgets).toBe(socialWidgets);
      expect(socialWidgets.widgets).toBeDefined();
    });

    test('devrait créer un widget Twitter timeline', () => {
      initSocialWidgets({ twitter: { enabled: true } });

      const widgetContainer = document.createElement('div');
      container.appendChild(widgetContainer);

      const timelineElement = window.socialWidgets.createTwitterTimeline(widgetContainer, {
        username: 'LesScoopsDuJour'
      });

      expect(timelineElement).toBe(widgetContainer);
      expect(widgetContainer.querySelector('.twitter-timeline')).toBeTruthy();
    });

    test('devrait créer un widget Facebook page', () => {
      initSocialWidgets({ facebook: { enabled: true } });

      const widgetContainer = document.createElement('div');
      container.appendChild(widgetContainer);

      const pageElement = window.socialWidgets.createFacebookPage(widgetContainer, {
        pageUrl: 'https://www.facebook.com/LesScoopsDuJour'
      });

      expect(pageElement).toBe(widgetContainer);
      expect(widgetContainer.querySelector('.fb-page')).toBeTruthy();
    });

    test('devrait créer un widget Instagram profile', () => {
      initSocialWidgets({ instagram: { enabled: true } });

      const widgetContainer = document.createElement('div');
      container.appendChild(widgetContainer);

      const profileElement = window.socialWidgets.createInstagramProfile(widgetContainer, 'lesscoopsdujour');

      expect(profileElement).toBe(widgetContainer);
      expect(widgetContainer.querySelector('.instagram-profile-widget')).toBeTruthy();
    });
  });

  describe('Intégration Open Graph et SEO', () => {
    test('devrait mettre à jour les métadonnées Open Graph lors du partage', () => {
      const seoManager = { updateMetaTags: jest.fn() };
      const ogManager = initOpenGraphManager(seoManager);

      ogManager.updateMetaTags(mockArticle);

      // Vérifier que le titre de la page a été mis à jour
      expect(document.title).toContain(mockArticle.title);

      // Vérifier les métadonnées Open Graph
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDescription = document.querySelector('meta[property="og:description"]');
      const ogImage = document.querySelector('meta[property="og:image"]');
      const ogUrl = document.querySelector('meta[property="og:url"]');

      expect(ogTitle).toBeTruthy();
      expect(ogDescription).toBeTruthy();
      expect(ogImage).toBeTruthy();
      expect(ogUrl).toBeTruthy();

      // Vérifier que le SEO Manager a été appelé
      expect(seoManager.updateMetaTags).toHaveBeenCalled();
    });

    test('devrait optimiser les métadonnées pour différentes plateformes', () => {
      const ogManager = initOpenGraphManager();

      // Test Facebook
      const fbMeta = ogManager.optimizeForPlatform('facebook', {
        'og:title': mockArticle.title,
        'og:description': mockArticle.excerpt
      });

      expect(fbMeta['og:image:width']).toBe(1200);
      expect(fbMeta['og:image:height']).toBe(630);

      // Test Twitter
      const twitterMeta = ogManager.optimizeForPlatform('twitter', {
        'og:title': mockArticle.title,
        'og:description': mockArticle.excerpt
      });

      expect(twitterMeta['twitter:card']).toBe('summary_large_image');
    });

    test('devrait valider les métadonnées Open Graph', () => {
      const ogManager = initOpenGraphManager();

      const validMeta = {
        'og:title': 'Titre valide de test',
        'og:description': 'Description suffisamment longue pour être valide selon les standards Open Graph.',
        'og:image': 'https://example.com/image.jpg',
        'og:url': 'https://example.com/article'
      };

      const issues = ogManager.validateMetaTags(validMeta);
      expect(issues.length).toBe(0);

      const invalidMeta = {
        'og:title': 'A', // Trop court
        'og:description': 'B', // Trop court
        // Pas d'image
        // Pas d'URL
      };

      const invalidIssues = ogManager.validateMetaTags(invalidMeta);
      expect(invalidIssues.length).toBeGreaterThan(0);
    });
  });

  describe('Scénarios utilisateur réalistes', () => {
    test('scénario : Lecteur partage un article politique sur Facebook', async () => {
      // Initialiser tous les systèmes
      initSocialShare();
      initOpenGraphManager();

      // Créer un article politique
      const politicalArticle = testUtils.createTestArticle({
        title: 'Présidentielle 2026 : Les candidats se positionnent',
        category: 'politique',
        tags: ['election', 'presidentielle', 'benin-2026']
      });

      // Simuler le partage sur Facebook
      global.open = jest.fn();
      const result = await window.socialShare.shareArticle(politicalArticle, 'facebook');

      expect(result).toBe(true);
      expect(global.open).toHaveBeenCalled();

      const shareUrl = global.open.mock.calls[0][0];
      expect(shareUrl).toContain('facebook.com/sharer/sharer.php');
      expect(shareUrl).toContain(encodeURIComponent(politicalArticle.url));
    });

    test('scénario : Lecteur partage un article économique sur WhatsApp', async () => {
      initSocialShare();

      const economicArticle = testUtils.createTestArticle({
        title: 'PIB du Bénin : Croissance de 7% en 2025',
        category: 'economie',
        tags: ['pib', 'croissance', 'benin']
      });

      // Simuler un mobile avec WhatsApp
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Android)',
        configurable: true
      });

      global.open = jest.fn();
      const result = await window.socialShare.shareArticle(economicArticle, 'whatsapp');

      expect(result).toBe(true);
      expect(global.open).toHaveBeenCalled();

      const shareUrl = global.open.mock.calls[0][0];
      expect(shareUrl).toContain('wa.me');
      expect(shareUrl).toContain(encodeURIComponent(economicArticle.title));
    });

    test('scénario : Lecteur partage un article culturel sur Twitter', async () => {
      initSocialShare();

      const culturalArticle = testUtils.createTestArticle({
        title: 'Festival de Ouidah 2025 : Un succès populaire',
        category: 'culture',
        tags: ['festival', 'ouidah', 'culture-benin']
      });

      global.open = jest.fn();
      const result = await window.socialShare.shareArticle(culturalArticle, 'twitter');

      expect(result).toBe(true);
      expect(global.open).toHaveBeenCalled();

      const shareUrl = global.open.mock.calls[0][0];
      expect(shareUrl).toContain('twitter.com/intent/tweet');
      expect(shareUrl).toContain('via=LesScoopsDuJour');
      expect(shareUrl).toContain(encodeURIComponent(culturalArticle.title));
    });

    test('scénario : Lecteur copie le lien d\'un article sportif', async () => {
      initSocialShare();

      const sportArticle = testUtils.createTestArticle({
        title: 'Écureuils : Victoire historique contre le Maroc',
        category: 'sport',
        tags: ['football', 'ecureuils', 'victoire']
      });

      navigator.clipboard.writeText.mockResolvedValue();
      const result = await window.socialShare.shareArticle(sportArticle, 'copy');

      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(sportArticle.url);
    });
  });

  describe('Analytics et tracking', () => {
    test('devrait tracker les événements de partage', async () => {
      initSocialShare();

      const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

      // Simuler un partage réussi
      navigator.share.mockResolvedValue();
      await window.socialShare.shareArticle(mockArticle, 'native');

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'socialShare',
          detail: expect.objectContaining({
            platform: 'native',
            article: mockArticle,
            success: true
          })
        })
      );
    });

    test('devrait accumuler les statistiques de partage', () => {
      initSocialShare();

      // Simuler plusieurs partages
      window.socialShare.trackShare('facebook', mockArticle, true);
      window.socialShare.trackShare('twitter', mockArticle, true);
      window.socialShare.trackShare('facebook', mockArticle, true);
      window.socialShare.trackShare('whatsapp', mockArticle, false); // Échec

      expect(window.socialShare.shareCounts.facebook).toBe(2);
      expect(window.socialShare.shareCounts.twitter).toBe(1);
      expect(window.socialShare.shareCounts.whatsapp).toBe(0); // Échec non compté
      expect(window.socialShare.shareCounts.total).toBe(3);
    });
  });

  describe('Performance et optimisation', () => {
    test('devrait mettre en cache les URLs générées', () => {
      initSocialShare();

      const generateSpy = jest.spyOn(window.socialShare, 'generateShareUrl');

      // Générer la même URL plusieurs fois
      window.socialShare.generateShareUrl('facebook', mockArticle);
      window.socialShare.generateShareUrl('facebook', mockArticle);
      window.socialShare.generateShareUrl('facebook', mockArticle);

      // Devrait être appelée seulement une fois grâce au cache
      expect(generateSpy).toHaveBeenCalledTimes(1);
    });

    test('devrait optimiser le chargement des widgets sociaux', () => {
      // Mock les scripts externes
      const scriptMock = {
        setAttribute: jest.fn(),
        appendChild: jest.fn()
      };
      global.document.createElement = jest.fn().mockReturnValue(scriptMock);
      global.document.head.appendChild = jest.fn();

      initSocialWidgets({ twitter: { enabled: true } });

      // Vérifier que les scripts sont chargés de manière optimisée
      expect(global.document.createElement).toHaveBeenCalledWith('script');
    });
  });

  describe('Gestion d\'erreurs intégrée', () => {
    test('devrait gérer les erreurs de réseau lors du partage', async () => {
      initSocialShare();

      // Simuler une erreur réseau
      navigator.share.mockRejectedValue(new Error('Network error'));

      const result = await window.socialShare.shareArticle(mockArticle, 'native');

      expect(result).toBe(false);
    });

    test('devrait gérer les popups bloquées', () => {
      initSocialShare();

      // Simuler une popup bloquée
      global.open.mockReturnValue(null);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      window.socialShare.shareTraditional('facebook', mockArticle);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Popup blocked')
      );

      consoleSpy.mockRestore();
    });

    test('devrait gérer les APIs sociales non disponibles', () => {
      // Simuler Twitter non chargé
      delete window.twttr;

      initSocialWidgets({ twitter: { enabled: true } });

      const widgetContainer = document.createElement('div');
      container.appendChild(widgetContainer);

      // Devrait quand même créer le widget (avec fallback)
      const timelineElement = window.socialWidgets.createTwitterTimeline(widgetContainer);

      expect(timelineElement).toBe(widgetContainer);
      // Le widget devrait quand même être créé même si l'API n'est pas disponible
    });
  });

  describe('Accessibilité intégrée', () => {
    test('devrait maintenir l\'accessibilité dans tous les composants', () => {
      initSocialShare();

      const shareButtons = window.socialShare.renderShareButtons(mockArticle);
      container.appendChild(shareButtons);

      const buttons = shareButtons.querySelectorAll('.share-btn');

      buttons.forEach(button => {
        expect(button.getAttribute('aria-label')).toBeTruthy();
        expect(button.getAttribute('role')).toBe('button');
        expect(button.getAttribute('tabindex')).toBe('0');
      });
    });

    test('devrait supporter la navigation clavier complète', () => {
      initSocialShare();

      const shareButtons = window.socialShare.renderShareButtons(mockArticle);
      container.appendChild(shareButtons);

      const firstButton = shareButtons.querySelector('.share-btn');

      // Simuler la navigation clavier
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);

      // Simuler Enter/Space
      const keydownEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      firstButton.dispatchEvent(keydownEvent);
    });
  });

  describe('Tests cross-browser', () => {
    test('devrait fonctionner avec différents navigateurs', () => {
      // Test avec Chrome (Web Share API disponible)
      navigator.share = jest.fn().mockResolvedValue();
      initSocialShare();

      expect(window.socialShare.isWebShareSupported()).toBe(true);

      // Test avec Firefox (Web Share API non disponible)
      delete navigator.share;
      global.open = jest.fn();

      // Le système devrait toujours fonctionner avec les fallbacks
      expect(window.socialShare.shareTraditional).toBeDefined();
    });

    test('devrait gérer les différences de Clipboard API', async () => {
      initSocialShare();

      // Test avec Clipboard API moderne
      navigator.clipboard.writeText.mockResolvedValue();
      let result = await window.socialShare.copyToClipboard(mockArticle);
      expect(result).toBe(true);

      // Test avec fallback execCommand
      delete navigator.clipboard;
      document.execCommand = jest.fn().mockReturnValue(true);

      result = await window.socialShare.copyToClipboard(mockArticle);
      expect(result).toBe(true);
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });
  });
});
