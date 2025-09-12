// Global Setup for Playwright E2E Tests
// Configuration globale avant l'exécution de tous les tests E2E

const { chromium } = require('@playwright/test');

module.exports = async (config) => {
  console.log('🚀 Initialisation des tests E2E - Les Scoops du Jour');

  // Créer un navigateur pour les tâches de préparation
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Vérifier que le serveur de développement fonctionne
    console.log('📡 Vérification du serveur de développement...');
    await page.goto('http://localhost:8080', { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    console.log(`✅ Serveur opérationnel - Titre: ${title}`);

    // Préparer les données de test
    console.log('📊 Préparation des données de test...');

    // Injecter des données de test dans localStorage
    await page.evaluate(() => {
      // Données utilisateur de test
      const testUser = {
        id: 'test-user-123',
        email: 'test@lescoopsdujour.com',
        name: 'Test User',
        preferences: {
          frequency: 'daily',
          categories: ['politique', 'economie', 'sport'],
          format: 'html'
        },
        subscribedAt: new Date().toISOString(),
        confirmed: true
      };

      localStorage.setItem('user', JSON.stringify(testUser));
      localStorage.setItem('userPreferences', JSON.stringify(testUser.preferences));

      // Articles lus récemment
      const recentArticles = [
        { id: 1, title: 'Article politique récent', readAt: new Date().toISOString() },
        { id: 2, title: 'Article économique récent', readAt: new Date(Date.now() - 3600000).toISOString() }
      ];

      localStorage.setItem('recentArticles', JSON.stringify(recentArticles));

      // Favoris
      const favorites = [1, 3, 5];
      localStorage.setItem('favorites', JSON.stringify(favorites));

      // Statistiques de partage (pour les tests)
      const shareStats = {
        facebook: 15,
        twitter: 8,
        whatsapp: 12,
        linkedin: 3,
        telegram: 2,
        email: 5,
        copy: 7,
        total: 52
      };

      localStorage.setItem('shareStats', JSON.stringify(shareStats));

      console.log('✅ Données de test préparées');
    });

    // Vérifier que les APIs sociales sont mockées pour les tests
    console.log('🔗 Configuration des mocks pour les APIs sociales...');

    await page.addScriptTag({
      content: `
// Mock des APIs sociales pour les tests E2E
window.mockSocialAPIs = () => {
  // Mock Twitter
  window.twttr = {
    widgets: {
      load: () => Promise.resolve(),
      createTweet: (id, options) => {
        const div = document.createElement('div');
        div.innerHTML = '<p>Mock Twitter Tweet</p>';
        return Promise.resolve(div);
      },
      createTimeline: (id, options) => {
        const div = document.createElement('div');
        div.innerHTML = '<p>Mock Twitter Timeline</p>';
        return Promise.resolve(div);
      }
    }
  };

  // Mock Facebook
  window.FB = {
    init: () => {},
    XFBML: {
      parse: () => {}
    }
  };

  // Mock Web Share API
  if (!navigator.share) {
    navigator.share = (data) => {
      console.log('Mock Web Share:', data);
      return Promise.resolve();
    };
  }

  // Mock Clipboard API
  if (!navigator.clipboard) {
    navigator.clipboard = {
      writeText: (text) => {
        console.log('Mock Clipboard write:', text);
        return Promise.resolve();
      },
      readText: () => Promise.resolve('mock-clipboard-text')
    };
  }

  console.log('✅ APIs sociales mockées pour les tests');
};

// Initialiser les mocks
window.mockSocialAPIs();
      `
    });

    console.log('✅ Mocks des APIs sociales configurés');

    // Capturer une capture d'écran de référence
    await page.screenshot({ path: 'test-results/setup-screenshot.png', fullPage: true });
    console.log('📸 Capture d\'écran de référence sauvegardée');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration globale:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('🎯 Configuration globale terminée');
};
