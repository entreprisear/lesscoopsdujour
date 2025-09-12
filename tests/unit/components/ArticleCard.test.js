// Tests unitaires pour ArticleCard
// Tests des fonctionnalités de rendu et d'interaction des cartes d'articles

import { createArticleCard } from '../../../src/js/components/ArticleCard.js';

describe('ArticleCard Component', () => {
  let mockArticle;
  let container;

  beforeEach(() => {
    // Configuration des mocks
    testUtils.mockSocialAPIs();

    // Article de test réaliste
    mockArticle = testUtils.createTestArticle({
      id: 1,
      title: 'Nouveau gouvernement formé : Patrice Talon nomme ses ministres',
      excerpt: 'Le président Patrice Talon a annoncé la composition de son nouveau gouvernement après plusieurs semaines de consultations.',
      author: 'Marie KPOGNON',
      category: 'politique',
      tags: ['gouvernement', 'patrice-talon', 'réformes'],
      image: '/images/articles/gouvernement-talon.jpg',
      publishedAt: '2025-01-15T10:00:00Z',
      views: 1250,
      rating: 4.2,
      reviewCount: 25,
      featured: true
    });

    // Container de test
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Nettoyage
    testUtils.cleanupDOM();
    jest.clearAllMocks();
  });

  describe('Création de la carte', () => {
    test('devrait créer une carte d\'article avec les bonnes propriétés', () => {
      const card = createArticleCard(mockArticle, 'large');

      expect(card).toBeDefined();
      expect(card.article).toEqual(mockArticle);
      expect(card.variant).toBe('large');
    });

    test('devrait utiliser les options par défaut', () => {
      const card = createArticleCard(mockArticle);

      expect(card.options.showRating).toBe(true);
      expect(card.options.showShare).toBe(true);
      expect(card.options.showBookmark).toBe(true);
      expect(card.options.lazyLoad).toBe(true);
    });

    test('devrait fusionner les options personnalisées', () => {
      const customOptions = {
        showRating: false,
        showShare: false,
        lazyLoad: false
      };

      const card = createArticleCard(mockArticle, 'medium', customOptions);

      expect(card.options.showRating).toBe(false);
      expect(card.options.showShare).toBe(false);
      expect(card.options.lazyLoad).toBe(false);
      expect(card.options.showBookmark).toBe(true); // Valeur par défaut préservée
    });
  });

  describe('Rendu de la carte', () => {
    test('devrait rendre une carte large avec toutes les fonctionnalités', () => {
      const card = createArticleCard(mockArticle, 'large', {
        showRating: true,
        showShare: true,
        showBookmark: true
      });

      const element = card.render();
      container.appendChild(element);

      // Vérifications structurelles
      expect(element.className).toContain('article-card');
      expect(element.className).toContain('article-card-large');

      // Vérifications du contenu
      expect(element.querySelector('.article-title')).toBeTruthy();
      expect(element.querySelector('.article-title').textContent).toContain(mockArticle.title);

      expect(element.querySelector('.article-excerpt')).toBeTruthy();
      expect(element.querySelector('.article-excerpt').textContent).toBe(mockArticle.excerpt);

      expect(element.querySelector('.article-author')).toBeTruthy();
      expect(element.querySelector('.article-author').textContent).toContain(mockArticle.author);

      expect(element.querySelector('.article-category')).toBeTruthy();
      expect(element.querySelector('.article-category').textContent).toBe('Politique');

      // Vérifications des fonctionnalités
      expect(element.querySelector('.share-buttons')).toBeTruthy();
      expect(element.querySelector('.bookmark-btn')).toBeTruthy();
      expect(element.querySelector('.news-rating')).toBeTruthy();
    });

    test('devrait rendre une carte small avec fonctionnalités limitées', () => {
      const card = createArticleCard(mockArticle, 'small', {
        showRating: false,
        showShare: false,
        showBookmark: true
      });

      const element = card.render();
      container.appendChild(element);

      expect(element.className).toContain('article-card-small');

      // Fonctionnalités désactivées
      expect(element.querySelector('.share-buttons')).toBeFalsy();
      expect(element.querySelector('.news-rating')).toBeFalsy();

      // Fonctionnalité activée
      expect(element.querySelector('.bookmark-btn')).toBeTruthy();
    });

    test('devrait afficher l\'image avec lazy loading', () => {
      const card = createArticleCard(mockArticle, 'large', { lazyLoad: true });

      const element = card.render();
      const img = element.querySelector('img');

      expect(img).toBeTruthy();
      expect(img.dataset.src).toBe(mockArticle.image);
      expect(img.className).toContain('lazy');
    });

    test('devrait afficher l\'image sans lazy loading', () => {
      const card = createArticleCard(mockArticle, 'large', { lazyLoad: false });

      const element = card.render();
      const img = element.querySelector('img');

      expect(img).toBeTruthy();
      expect(img.src).toContain(mockArticle.image);
      expect(img.className).not.toContain('lazy');
    });
  });

  describe('Interactions utilisateur', () => {
    test('devrait gérer le clic sur la carte', () => {
      const card = createArticleCard(mockArticle);
      const element = card.render();
      container.appendChild(element);

      const clickSpy = jest.spyOn(card, 'handleCardClick');

      // Simuler un clic sur la carte
      const cardElement = element.querySelector('.article-card');
      const event = testUtils.createEvent('click', { target: cardElement });

      cardElement.dispatchEvent(event);

      expect(clickSpy).toHaveBeenCalledWith(event);
    });

    test('devrait gérer le clic sur les boutons de partage', () => {
      const card = createArticleCard(mockArticle, 'large', { showShare: true });
      const element = card.render();
      container.appendChild(element);

      const shareBtn = element.querySelector('.share-btn[data-platform="facebook"]');
      expect(shareBtn).toBeTruthy();

      const shareSpy = jest.spyOn(card, 'handleShare');

      // Simuler un clic sur le bouton de partage
      const event = testUtils.createEvent('click', { target: shareBtn });
      shareBtn.dispatchEvent(event);

      expect(shareSpy).toHaveBeenCalledWith('facebook');
    });

    test('devrait gérer le clic sur le bouton de favoris', () => {
      const card = createArticleCard(mockArticle, 'large', { showBookmark: true });
      const element = card.render();
      container.appendChild(element);

      const bookmarkBtn = element.querySelector('.bookmark-btn');
      expect(bookmarkBtn).toBeTruthy();

      const toggleSpy = jest.spyOn(card, 'handleBookmarkToggle');

      // Simuler un clic sur le bouton de favoris
      const event = testUtils.createEvent('click', { target: bookmarkBtn });
      bookmarkBtn.dispatchEvent(event);

      expect(toggleSpy).toHaveBeenCalled();
    });

    test('devrait gérer la notation d\'article', () => {
      const card = createArticleCard(mockArticle, 'large', { showRating: true });
      const element = card.render();
      container.appendChild(element);

      const ratingSpy = jest.spyOn(card, 'handleRating');

      // Simuler un clic sur une étoile
      const star = element.querySelector('.star');
      const event = testUtils.createEvent('click', { target: star });

      star.dispatchEvent(event);

      expect(ratingSpy).toHaveBeenCalled();
    });
  });

  describe('Gestion des données', () => {
    test('devrait formater correctement la date', () => {
      const card = createArticleCard(mockArticle);
      const formattedDate = card.formatDate(mockArticle.publishedAt);

      expect(formattedDate).toMatch(/\d{1,2} \w{3}\. \d{4}/); // Format: "15 janv. 2025"
    });

    test('devrait formater correctement les vues', () => {
      const card = createArticleCard(mockArticle);

      expect(card.formatViews(1250)).toBe('1.3K');
      expect(card.formatViews(500)).toBe('500');
      expect(card.formatViews(1500000)).toBe('1.5M');
    });

    test('devrait générer le bon slug pour l\'article', () => {
      const card = createArticleCard(mockArticle);
      const slug = card.generateSlug();

      expect(slug).toBe('nouveau-gouvernement-forme-patrice-talon-nomme-ses-ministres');
    });

    test('devrait générer la bonne URL canonique', () => {
      const card = createArticleCard(mockArticle);
      const canonicalUrl = card.getCanonicalUrl();

      expect(canonicalUrl).toContain('/article/1/');
      expect(canonicalUrl).toContain('nouveau-gouvernement-forme');
    });
  });

  describe('Accessibilité', () => {
    test('devrait avoir les bons attributs ARIA', () => {
      const card = createArticleCard(mockArticle);
      const element = card.render();
      container.appendChild(element);

      // Vérifications d'accessibilité
      const articleElement = element.querySelector('.article-card');
      expect(articleElement.getAttribute('role')).toBe('article');

      const titleLink = element.querySelector('.article-title a');
      expect(titleLink.getAttribute('aria-label')).toContain('Lire l\'article');

      const shareButtons = element.querySelectorAll('.share-btn');
      shareButtons.forEach(btn => {
        expect(btn.getAttribute('aria-label')).toBeTruthy();
      });
    });

    test('devrait supporter la navigation clavier', () => {
      const card = createArticleCard(mockArticle);
      const element = card.render();
      container.appendChild(element);

      const focusSpy = jest.spyOn(card, 'handleFocus');
      const blurSpy = jest.spyOn(card, 'handleBlur');

      // Simuler focus/blur
      const cardElement = element.querySelector('.article-card');
      cardElement.focus();
      cardElement.blur();

      // Les gestionnaires devraient être appelés
      expect(focusSpy).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    test('devrait optimiser le rendu avec lazy loading', () => {
      const card = createArticleCard(mockArticle, 'large', { lazyLoad: true });
      const element = card.render();

      const img = element.querySelector('img');
      expect(img.dataset.src).toBe(mockArticle.image);
      expect(img.src).not.toContain(mockArticle.image); // Pas chargé immédiatement
    });

    test('devrait éviter les re-rendus inutiles', () => {
      const card = createArticleCard(mockArticle);
      const element1 = card.render();
      const element2 = card.render();

      // Les éléments devraient être différents (nouveau rendu à chaque fois)
      expect(element1).not.toBe(element2);
      expect(element1.isEqualNode(element2)).toBe(true);
    });
  });

  describe('Gestion d\'erreurs', () => {
    test('devrait gérer les articles sans image', () => {
      const articleWithoutImage = { ...mockArticle, image: null };
      const card = createArticleCard(articleWithoutImage);

      const element = card.render();
      const img = element.querySelector('img');

      expect(img).toBeFalsy(); // Pas d'image rendue
      expect(element.querySelector('.article-image-placeholder')).toBeTruthy();
    });

    test('devrait gérer les articles sans auteur', () => {
      const articleWithoutAuthor = { ...mockArticle, author: null };
      const card = createArticleCard(articleWithoutAuthor);

      const element = card.render();
      const authorElement = element.querySelector('.article-author');

      expect(authorElement.textContent).toContain('Anonyme');
    });

    test('devrait gérer les dates invalides', () => {
      const articleWithBadDate = { ...mockArticle, publishedAt: 'invalid-date' };
      const card = createArticleCard(articleWithBadDate);

      const element = card.render();
      const dateElement = element.querySelector('.article-date');

      expect(dateElement.textContent).toBe('Date inconnue');
    });
  });

  describe('Intégration avec les autres systèmes', () => {
    test('devrait intégrer le système de partage social', () => {
      // Mock du système de partage
      window.socialShare = {
        shareArticle: jest.fn()
      };

      const card = createArticleCard(mockArticle, 'large', { showShare: true });
      const element = card.render();
      container.appendChild(element);

      const shareBtn = element.querySelector('.share-btn[data-platform="facebook"]');
      const event = testUtils.createEvent('click', { target: shareBtn });

      shareBtn.dispatchEvent(event);

      expect(window.socialShare.shareArticle).toHaveBeenCalledWith(mockArticle, 'facebook');
    });

    test('devrait intégrer le système de favoris', () => {
      // Mock du storage manager
      window.storageManager = {
        saveFavorite: jest.fn(),
        removeFavorite: jest.fn(),
        isFavorite: jest.fn().mockReturnValue(false)
      };

      const card = createArticleCard(mockArticle, 'large', { showBookmark: true });
      const element = card.render();
      container.appendChild(element);

      const bookmarkBtn = element.querySelector('.bookmark-btn');
      const event = testUtils.createEvent('click', { target: bookmarkBtn });

      bookmarkBtn.dispatchEvent(event);

      expect(window.storageManager.saveFavorite).toHaveBeenCalledWith(mockArticle.id);
    });

    test('devrait intégrer le système de notation', () => {
      // Mock de l'API
      window.mockAPI = {
        rateArticle: jest.fn().mockResolvedValue({ success: true })
      };

      const card = createArticleCard(mockArticle, 'large', { showRating: true });
      const element = card.render();
      container.appendChild(element);

      const star = element.querySelector('.star');
      const event = testUtils.createEvent('click', { target: star });

      star.dispatchEvent(event);

      expect(window.mockAPI.rateArticle).toHaveBeenCalled();
    });
  });
});
