// Tests unitaires pour SocialShare
// Tests du système de partage social avec Web Share API et fallbacks

import { SocialShare, initSocialShare, shareArticle } from '../../../src/js/components/SocialShare.js';

describe('SocialShare Component', () => {
  let mockArticle;
  let container;

  beforeEach(() => {
    // Configuration des mocks
    testUtils.mockSocialAPIs();

    // Article de test réaliste
    mockArticle = testUtils.createTestArticle({
      id: 1,
      title: 'Nouveau gouvernement formé : Patrice Talon nomme ses ministres',
      excerpt: 'Le président Patrice Talon a annoncé la composition de son nouveau gouvernement.',
      url: 'https://lesscoopsdujour.com/article/1/gouvernement-talon',
      image: '/images/articles/gouvernement-talon.jpg'
    });

    // Container de test
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    // Reset des mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    testUtils.cleanupDOM();
    jest.clearAllMocks();
  });

  describe('Initialisation', () => {
    test('devrait créer une instance SocialShare', () => {
      const socialShare = new SocialShare();

      expect(socialShare).toBeDefined();
      expect(socialShare.options).toBeDefined();
      expect(socialShare.shareCounts).toBeDefined();
    });

    test('devrait initialiser avec les options par défaut', () => {
      const socialShare = new SocialShare();

      expect(socialShare.options.showLabels).toBe(false);
      expect(socialShare.options.size).toBe('medium');
      expect(socialShare.options.theme).toBe('light');
      expect(socialShare.options.trackShares).toBe(true);
    });

    test('devrait fusionner les options personnalisées', () => {
      const customOptions = {
        showLabels: true,
        size: 'large',
        theme: 'dark',
        platforms: ['facebook', 'twitter']
      };

      const socialShare = new SocialShare(customOptions);

      expect(socialShare.options.showLabels).toBe(true);
      expect(socialShare.options.size).toBe('large');
      expect(socialShare.options.theme).toBe('dark');
      expect(socialShare.options.platforms).toEqual(['facebook', 'twitter']);
    });

    test('devrait exposer globalement l\'instance', () => {
      initSocialShare();

      expect(window.socialShare).toBeDefined();
      expect(window.socialShare).toBeInstanceOf(SocialShare);
    });
  });

  describe('Génération d\'URLs de partage', () => {
    let socialShare;

    beforeEach(() => {
      socialShare = new SocialShare();
    });

    test('devrait générer une URL Facebook valide', () => {
      const url = socialShare.generateShareUrl('facebook', mockArticle);

      expect(url).toContain('https://www.facebook.com/sharer/sharer.php');
      expect(url).toContain('u=' + encodeURIComponent(mockArticle.url));
    });

    test('devrait générer une URL Twitter valide', () => {
      const url = socialShare.generateShareUrl('twitter', mockArticle);

      expect(url).toContain('https://twitter.com/intent/tweet');
      expect(url).toContain('text=' + encodeURIComponent(mockArticle.title));
      expect(url).toContain('url=' + encodeURIComponent(mockArticle.url));
      expect(url).toContain('via=LesScoopsDuJour');
    });

    test('devrait générer une URL WhatsApp valide', () => {
      const url = socialShare.generateShareUrl('whatsapp', mockArticle);

      expect(url).toContain('https://wa.me/');
      expect(url).toContain(encodeURIComponent(mockArticle.title));
      expect(url).toContain(encodeURIComponent(mockArticle.url));
    });

    test('devrait générer une URL LinkedIn valide', () => {
      const url = socialShare.generateShareUrl('linkedin', mockArticle);

      expect(url).toContain('https://www.linkedin.com/sharing/share-offsite');
      expect(url).toContain('url=' + encodeURIComponent(mockArticle.url));
    });

    test('devrait générer une URL Telegram valide', () => {
      const url = socialShare.generateShareUrl('telegram', mockArticle);

      expect(url).toContain('https://t.me/share/url');
      expect(url).toContain('text=' + encodeURIComponent(mockArticle.title));
      expect(url).toContain('url=' + encodeURIComponent(mockArticle.url));
    });

    test('devrait générer une URL Email valide', () => {
      const url = socialShare.generateShareUrl('email', mockArticle);

      expect(url).toContain('mailto:');
      expect(url).toContain('subject=' + encodeURIComponent(mockArticle.title));
      expect(url).toContain('body=' + encodeURIComponent(mockArticle.excerpt));
    });

    test('devrait gérer les articles sans URL personnalisée', () => {
      const articleWithoutUrl = { ...mockArticle, url: undefined };
      const url = socialShare.generateShareUrl('facebook', articleWithoutUrl);

      expect(url).toContain(window.location.origin);
      expect(url).toContain('/article/1/');
    });
  });

  describe('Web Share API', () => {
    let socialShare;

    beforeEach(() => {
      socialShare = new SocialShare();
    });

    test('devrait utiliser Web Share API quand disponible', async () => {
      // Web Share API disponible
      navigator.share.mockResolvedValue();

      const result = await socialShare.shareNative(mockArticle);

      expect(navigator.share).toHaveBeenCalledWith({
        title: mockArticle.title,
        text: mockArticle.excerpt,
        url: mockArticle.url
      });

      expect(result).toBe(true);
    });

    test('devrait gérer l\'annulation du partage natif', async () => {
      // Utilisateur annule le partage
      const abortError = new Error('Share cancelled');
      abortError.name = 'AbortError';
      navigator.share.mockRejectedValue(abortError);

      const result = await socialShare.shareNative(mockArticle);

      expect(result).toBe(false);
      expect(navigator.share).toHaveBeenCalled();
    });

    test('devrait gérer les erreurs de Web Share API', async () => {
      // Erreur générale
      navigator.share.mockRejectedValue(new Error('Share failed'));

      const result = await socialShare.shareNative(mockArticle);

      expect(result).toBe(false);
    });

    test('devrait vérifier la disponibilité de Web Share API', () => {
      expect(socialShare.isWebShareSupported()).toBe(true);

      // Simuler un navigateur sans Web Share API
      delete navigator.share;

      expect(socialShare.isWebShareSupported()).toBe(false);
    });
  });

  describe('Partage traditionnel (fallback)', () => {
    let socialShare;

    beforeEach(() => {
      socialShare = new SocialShare();
      // Mock window.open
      global.open = jest.fn();
    });

    test('devrait ouvrir une popup pour le partage traditionnel', () => {
      socialShare.shareTraditional('facebook', mockArticle);

      expect(global.open).toHaveBeenCalled();
      const [url, windowName, windowFeatures] = global.open.mock.calls[0];

      expect(url).toContain('facebook.com');
      expect(windowName).toBe('share-facebook');
      expect(windowFeatures).toContain('width=600');
      expect(windowFeatures).toContain('height=400');
    });

    test('devrait gérer les erreurs d\'ouverture de popup', () => {
      global.open.mockReturnValue(null); // Popup bloquée

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      socialShare.shareTraditional('facebook', mockArticle);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Popup blocked')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Copy to clipboard', () => {
    let socialShare;

    beforeEach(() => {
      socialShare = new SocialShare();
    });

    test('devrait copier l\'URL dans le presse-papiers', async () => {
      navigator.clipboard.writeText.mockResolvedValue();

      const result = await socialShare.copyToClipboard(mockArticle);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockArticle.url);
      expect(result).toBe(true);
    });

    test('devrait gérer les erreurs de copie', async () => {
      navigator.clipboard.writeText.mockRejectedValue(new Error('Copy failed'));

      const result = await socialShare.copyToClipboard(mockArticle);

      expect(result).toBe(false);
    });

    test('devrait utiliser le fallback execCommand si nécessaire', async () => {
      // Simuler un navigateur sans Clipboard API
      delete navigator.clipboard;

      // Mock document.execCommand
      document.execCommand = jest.fn().mockReturnValue(true);

      const result = await socialShare.copyToClipboard(mockArticle);

      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(result).toBe(true);
    });
  });

  describe('Méthode principale de partage', () => {
    let socialShare;

    beforeEach(() => {
      socialShare = new SocialShare();
    });

    test('devrait privilégier Web Share API', async () => {
      navigator.share.mockResolvedValue();

      const result = await socialShare.shareArticle(mockArticle, 'native');

      expect(navigator.share).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test('devrait utiliser le partage traditionnel comme fallback', async () => {
      // Web Share API échoue
      navigator.share.mockRejectedValue(new Error('Not supported'));
      global.open = jest.fn();

      const result = await socialShare.shareArticle(mockArticle, 'facebook');

      expect(global.open).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test('devrait gérer le partage par email', async () => {
      global.open = jest.fn();

      const result = await socialShare.shareArticle(mockArticle, 'email');

      expect(global.open).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test('devrait gérer la copie dans le presse-papiers', async () => {
      navigator.clipboard.writeText.mockResolvedValue();

      const result = await socialShare.shareArticle(mockArticle, 'copy');

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockArticle.url);
      expect(result).toBe(true);
    });
  });

  describe('Tracking et analytics', () => {
    let socialShare;

    beforeEach(() => {
      socialShare = new SocialShare({ trackShares: true });
    });

    test('devrait tracker les partages réussis', async () => {
      navigator.share.mockResolvedValue();

      const trackSpy = jest.spyOn(socialShare, 'trackShare');

      await socialShare.shareArticle(mockArticle, 'native');

      expect(trackSpy).toHaveBeenCalledWith('native', mockArticle, true);
    });

    test('devrait tracker les partages échoués', async () => {
      navigator.share.mockRejectedValue(new Error('Failed'));

      const trackSpy = jest.spyOn(socialShare, 'trackShare');

      await socialShare.shareArticle(mockArticle, 'native');

      expect(trackSpy).toHaveBeenCalledWith('native', mockArticle, false);
    });

    test('devrait stocker les métriques de partage', () => {
      socialShare.trackShare('facebook', mockArticle, true);

      expect(socialShare.shareCounts.facebook).toBe(1);
      expect(socialShare.shareCounts.total).toBe(1);
    });

    test('devrait dispatcher des événements personnalisés', () => {
      const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

      socialShare.trackShare('twitter', mockArticle, true);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'socialShare',
          detail: expect.objectContaining({
            platform: 'twitter',
            article: mockArticle,
            success: true
          })
        })
      );
    });
  });

  describe('Rendu des boutons', () => {
    let socialShare;

    beforeEach(() => {
      socialShare = new SocialShare();
    });

    test('devrait rendre tous les boutons de partage par défaut', () => {
      const element = socialShare.renderShareButtons(mockArticle);
      container.appendChild(element);

      const buttons = element.querySelectorAll('.share-btn');
      expect(buttons.length).toBe(7); // 6 plateformes + copy

      const platforms = ['facebook', 'twitter', 'whatsapp', 'linkedin', 'telegram', 'email', 'copy'];
      platforms.forEach(platform => {
        expect(element.querySelector(`[data-platform="${platform}"]`)).toBeTruthy();
      });
    });

    test('devrait rendre seulement les plateformes spécifiées', () => {
      const customSocialShare = new SocialShare({
        platforms: ['facebook', 'twitter', 'copy']
      });

      const element = customSocialShare.renderShareButtons(mockArticle);
      container.appendChild(element);

      const buttons = element.querySelectorAll('.share-btn');
      expect(buttons.length).toBe(3);

      expect(element.querySelector('[data-platform="facebook"]')).toBeTruthy();
      expect(element.querySelector('[data-platform="twitter"]')).toBeTruthy();
      expect(element.querySelector('[data-platform="copy"]')).toBeTruthy();
      expect(element.querySelector('[data-platform="whatsapp"]')).toBeFalsy();
    });

    test('devrait appliquer les bonnes classes CSS', () => {
      const element = socialShare.renderShareButtons(mockArticle);
      container.appendChild(element);

      const containerEl = element.querySelector('.social-share');
      expect(containerEl).toBeTruthy();
      expect(containerEl.className).toContain('social-share-medium');
      expect(containerEl.className).toContain('social-share-light');
    });

    test('devrait afficher les labels si activé', () => {
      const customSocialShare = new SocialShare({ showLabels: true });

      const element = customSocialShare.renderShareButtons(mockArticle);
      container.appendChild(element);

      const buttons = element.querySelectorAll('.share-btn.has-label');
      expect(buttons.length).toBeGreaterThan(0);

      const labels = element.querySelectorAll('.share-label');
      expect(labels.length).toBeGreaterThan(0);
    });

    test('devrait gérer les compteurs de partage', () => {
      socialShare.shareCounts.facebook = 42;

      const element = socialShare.renderShareButtons(mockArticle);
      container.appendChild(element);

      const counter = element.querySelector('.share-counter');
      expect(counter).toBeTruthy();
      expect(counter.textContent).toBe('42');
    });
  });

  describe('Gestion d\'erreurs et edge cases', () => {
    let socialShare;

    beforeEach(() => {
      socialShare = new SocialShare();
    });

    test('devrait gérer les articles sans titre', () => {
      const articleWithoutTitle = { ...mockArticle, title: null };

      expect(() => {
        socialShare.generateShareUrl('facebook', articleWithoutTitle);
      }).not.toThrow();
    });

    test('devrait gérer les articles sans URL', () => {
      const articleWithoutUrl = { ...mockArticle, url: null };

      const url = socialShare.generateShareUrl('facebook', articleWithoutUrl);

      expect(url).toContain(window.location.origin);
    });

    test('devrait gérer les plateformes inconnues', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const url = socialShare.generateShareUrl('unknown', mockArticle);

      expect(url).toBe('');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown platform')
      );

      consoleSpy.mockRestore();
    });

    test('devrait gérer les erreurs réseau lors du partage', async () => {
      navigator.share.mockRejectedValue(new Error('Network error'));

      const result = await socialShare.shareArticle(mockArticle, 'native');

      expect(result).toBe(false);
    });
  });

  describe('Accessibilité', () => {
    let socialShare;

    beforeEach(() => {
      socialShare = new SocialShare();
    });

    test('devrait avoir les bons attributs ARIA', () => {
      const element = socialShare.renderShareButtons(mockArticle);
      container.appendChild(element);

      const buttons = element.querySelectorAll('.share-btn');

      buttons.forEach(button => {
        expect(button.getAttribute('aria-label')).toBeTruthy();
        expect(button.getAttribute('role')).toBe('button');
      });
    });

    test('devrait supporter la navigation clavier', () => {
      const element = socialShare.renderShareButtons(mockArticle);
      container.appendChild(element);

      const firstButton = element.querySelector('.share-btn');
      expect(firstButton.getAttribute('tabindex')).toBe('0');
    });

    test('devrait annoncer les actions aux lecteurs d\'écran', () => {
      const element = socialShare.renderShareButtons(mockArticle);
      container.appendChild(element);

      const buttons = element.querySelectorAll('.share-btn');

      buttons.forEach(button => {
        const ariaLabel = button.getAttribute('aria-label');
        expect(ariaLabel).toMatch(/Partager sur|Copier/);
      });
    });
  });

  describe('Performance', () => {
    test('devrait mettre en cache les URLs générées', () => {
      const socialShare = new SocialShare();
      const generateSpy = jest.spyOn(socialShare, 'generateShareUrl');

      // Première génération
      socialShare.generateShareUrl('facebook', mockArticle);
      // Deuxième génération (devrait utiliser le cache)
      socialShare.generateShareUrl('facebook', mockArticle);

      expect(generateSpy).toHaveBeenCalledTimes(1);
    });

    test('devrait nettoyer le cache régulièrement', () => {
      const socialShare = new SocialShare();

      // Ajouter des entrées dans le cache
      socialShare.generateShareUrl('facebook', mockArticle);
      socialShare.generateShareUrl('twitter', mockArticle);

      expect(Object.keys(socialShare.urlCache).length).toBeGreaterThan(0);

      // Simuler le nettoyage
      socialShare.clearCache();

      expect(Object.keys(socialShare.urlCache).length).toBe(0);
    });
  });

  describe('Fonction utilitaire shareArticle', () => {
    test('devrait utiliser l\'instance globale', () => {
      initSocialShare();
      const shareSpy = jest.spyOn(window.socialShare, 'shareArticle');

      shareArticle(mockArticle, 'facebook');

      expect(shareSpy).toHaveBeenCalledWith(mockArticle, 'facebook');
    });

    test('devrait créer une instance si elle n\'existe pas', () => {
      delete window.socialShare;

      shareArticle(mockArticle, 'twitter');

      expect(window.socialShare).toBeDefined();
    });
  });
});
