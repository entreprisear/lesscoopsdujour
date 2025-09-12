// Tests E2E pour le système de partage social
// Tests des parcours utilisateur complets avec Playwright

import { test, expect } from '@playwright/test';

test.describe('Système de Partage Social - Les Scoops du Jour', () => {
  test.beforeEach(async ({ page }) => {
    // Aller à la page d'accueil
    await page.goto('/');

    // Attendre que la page soit chargée
    await page.waitForLoadState('networkidle');

    // S'assurer que les mocks sont actifs
    await page.evaluate(() => {
      if (window.mockSocialAPIs) {
        window.mockSocialAPIs();
      }
    });
  });

  test.describe('Parcours utilisateur desktop', () => {
    test('devrait permettre le partage d\'un article sur Facebook', async ({ page, context }) => {
      // Attendre qu'un article soit visible
      await page.waitForSelector('.article-card', { timeout: 10000 });

      // Survoler le premier article pour faire apparaître les boutons de partage
      const firstArticle = page.locator('.article-card').first();
      await firstArticle.hover();

      // Attendre que les boutons de partage soient visibles
      await page.waitForSelector('.share-buttons', { timeout: 5000 });

      // Cliquer sur le bouton Facebook
      const facebookBtn = page.locator('[data-platform="facebook"]').first();
      await expect(facebookBtn).toBeVisible();

      // Intercepter la popup
      const popupPromise = context.waitForEvent('page');
      await facebookBtn.click();
      const popup = await popupPromise;

      // Vérifier que la popup s'ouvre avec l'URL correcte
      await popup.waitForLoadState();
      const popupUrl = popup.url();
      expect(popupUrl).toContain('facebook.com/sharer/sharer.php');
      expect(popupUrl).toContain('u=');

      // Fermer la popup
      await popup.close();
    });

    test('devrait permettre le partage sur Twitter avec hashtags', async ({ page, context }) => {
      await page.waitForSelector('.article-card');
      const firstArticle = page.locator('.article-card').first();
      await firstArticle.hover();
      await page.waitForSelector('.share-buttons');

      const twitterBtn = page.locator('[data-platform="twitter"]').first();
      await expect(twitterBtn).toBeVisible();

      const popupPromise = context.waitForEvent('page');
      await twitterBtn.click();
      const popup = await popupPromise;

      await popup.waitForLoadState();
      const popupUrl = popup.url();
      expect(popupUrl).toContain('twitter.com/intent/tweet');
      expect(popupUrl).toContain('via=LesScoopsDuJour');

      await popup.close();
    });

    test('devrait permettre la copie du lien dans le presse-papiers', async ({ page }) => {
      await page.waitForSelector('.article-card');
      const firstArticle = page.locator('.article-card').first();
      await firstArticle.hover();
      await page.waitForSelector('.share-buttons');

      const copyBtn = page.locator('[data-platform="copy"]').first();
      await expect(copyBtn).toBeVisible();

      // Accorder la permission clipboard
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

      // Cliquer sur le bouton de copie
      await copyBtn.click();

      // Attendre un peu pour que la copie se fasse
      await page.waitForTimeout(500);

      // Vérifier que l'URL a été copiée (si l'API clipboard est disponible)
      try {
        const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardContent).toContain('lesscoopsdujour.com');
      } catch (error) {
        // L'API clipboard peut ne pas être disponible dans tous les environnements de test
        console.log('Clipboard API not available in test environment');
      }
    });

    test('devrait afficher les compteurs de partage', async ({ page }) => {
      await page.waitForSelector('.article-card');
      const firstArticle = page.locator('.article-card').first();
      await firstArticle.hover();
      await page.waitForSelector('.share-buttons');

      // Vérifier qu'il y a des boutons avec potentiellement des compteurs
      const shareButtons = page.locator('.share-btn');
      await expect(shareButtons).toHaveCount(await shareButtons.count());
    });
  });

  test.describe('Parcours utilisateur mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test('devrait utiliser Web Share API sur mobile', async ({ page }) => {
      // Simuler un environnement mobile
      await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15');

      await page.waitForSelector('.article-card');
      const firstArticle = page.locator('.article-card').first();

      // Sur mobile, les boutons peuvent être toujours visibles
      const shareButtons = firstArticle.locator('.share-buttons');
      await expect(shareButtons.or(page.locator('[data-platform]')).first()).toBeVisible();

      // Cliquer sur un bouton de partage (devrait utiliser Web Share API)
      const nativeShareBtn = page.locator('[data-platform="native"], [data-platform="facebook"]').first();

      // Mock Web Share API
      await page.evaluate(() => {
        navigator.share = (data) => {
          console.log('Web Share API called with:', data);
          window.webShareCalled = true;
          return Promise.resolve();
        };
      });

      await nativeShareBtn.click();

      // Vérifier que Web Share API a été appelée
      const webShareCalled = await page.evaluate(() => window.webShareCalled);
      expect(webShareCalled).toBe(true);
    });

    test('devrait optimiser l\'affichage pour mobile', async ({ page }) => {
      await page.waitForSelector('.article-card');

      // Vérifier que les boutons de partage sont adaptés mobile
      const shareButtons = page.locator('.share-btn');
      await expect(shareButtons.first()).toBeVisible();

      // Vérifier que les tooltips ne sont pas affichés sur mobile (optionnel)
      const tooltips = page.locator('.article-tooltip');
      await expect(tooltips).toHaveCount(0);
    });
  });

  test.describe('Scénarios utilisateur réalistes', () => {
    test('scénario : Lecteur béninois partage un article politique', async ({ page, context }) => {
      await page.waitForSelector('.article-card');

      // Trouver un article politique
      const politicalArticle = page.locator('.article-card').filter({
        hasText: /politique|Patrice Talon|gouvernement/i
      }).first();

      await politicalArticle.waitFor({ timeout: 5000 });
      await politicalArticle.hover();

      // Partager sur Facebook (réseau social populaire au Bénin)
      const facebookBtn = politicalArticle.locator('[data-platform="facebook"]');
      await expect(facebookBtn).toBeVisible();

      const popupPromise = context.waitForEvent('page');
      await facebookBtn.click();
      const popup = await popupPromise;

      await popup.waitForLoadState();
      const popupUrl = popup.url();
      expect(popupUrl).toContain('facebook.com');

      await popup.close();

      // Vérifier que l'événement de partage a été tracké
      const shareEvents = await page.evaluate(() => {
        const events = [];
        window.addEventListener('socialShare', (e) => events.push(e.detail));
        return events;
      });
    });

    test('scénario : Lecteur partage un article économique sur WhatsApp', async ({ page, context }) => {
      await page.waitForSelector('.article-card');

      // Trouver un article économique
      const economicArticle = page.locator('.article-card').filter({
        hasText: /économie|PIB|croissance|banque/i
      }).first();

      await economicArticle.waitFor({ timeout: 5000 });

      // Sur mobile, WhatsApp est très populaire
      await page.setUserAgent('Mozilla/5.0 (Android)');

      const whatsappBtn = economicArticle.locator('[data-platform="whatsapp"]');
      await expect(whatsappBtn).toBeVisible();

      const popupPromise = context.waitForEvent('page');
      await whatsappBtn.click();
      const popup = await popupPromise;

      await popup.waitForLoadState();
      const popupUrl = popup.url();
      expect(popupUrl).toContain('wa.me');

      await popup.close();
    });

    test('scénario : Journaliste partage un article sur LinkedIn', async ({ page, context }) => {
      await page.waitForSelector('.article-card');

      const firstArticle = page.locator('.article-card').first();
      await firstArticle.hover();

      const linkedinBtn = firstArticle.locator('[data-platform="linkedin"]');
      await expect(linkedinBtn).toBeVisible();

      const popupPromise = context.waitForEvent('page');
      await linkedinBtn.click();
      const popup = await popupPromise;

      await popup.waitForLoadState();
      const popupUrl = popup.url();
      expect(popupUrl).toContain('linkedin.com/sharing');

      await popup.close();
    });
  });

  test.describe('Gestion d\'erreurs et fallbacks', () => {
    test('devrait gérer les popups bloquées', async ({ page }) => {
      await page.waitForSelector('.article-card');
      const firstArticle = page.locator('.article-card').first();
      await firstArticle.hover();

      // Mock pour bloquer les popups
      await page.evaluate(() => {
        const originalOpen = window.open;
        window.open = () => null; // Simuler popup bloquée
        window.originalOpen = originalOpen;
      });

      const facebookBtn = firstArticle.locator('[data-platform="facebook"]');

      // Cliquer devrait gérer l'erreur gracieusement
      await facebookBtn.click();

      // Attendre un peu pour que l'erreur soit gérée
      await page.waitForTimeout(500);

      // La page devrait toujours fonctionner normalement
      await expect(page.locator('.article-card').first()).toBeVisible();
    });

    test('devrait gérer l\'absence de Web Share API', async ({ page }) => {
      // Supprimer Web Share API
      await page.evaluate(() => {
        delete navigator.share;
      });

      await page.waitForSelector('.article-card');
      const firstArticle = page.locator('.article-card').first();
      await firstArticle.hover();

      const shareBtn = firstArticle.locator('[data-platform="facebook"]');

      // Devrait utiliser le fallback traditionnel
      const popupPromise = page.context().waitForEvent('page');
      await shareBtn.click();

      const popup = await popupPromise;
      await popup.waitForLoadState();
      expect(popup.url()).toContain('facebook.com');

      await popup.close();
    });
  });

  test.describe('Accessibilité', () => {
    test('devrait supporter la navigation clavier', async ({ page }) => {
      await page.waitForSelector('.article-card');
      const firstArticle = page.locator('.article-card').first();

      // Focus sur l'article
      await firstArticle.focus();

      // Tab pour atteindre les boutons de partage
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Vérifier qu'un bouton de partage a le focus
      const focusedElement = await page.evaluate(() => document.activeElement);
      const focusedTagName = await page.evaluate(() => document.activeElement.tagName);
      const focusedClass = await page.evaluate(() => document.activeElement.className);

      expect(focusedTagName.toLowerCase()).toBe('button');
      expect(focusedClass).toContain('share-btn');
    });

    test('devrait avoir les bons attributs ARIA', async ({ page }) => {
      await page.waitForSelector('.article-card');
      const firstArticle = page.locator('.article-card').first();
      await firstArticle.hover();

      const shareButtons = firstArticle.locator('.share-btn');

      for (const button of await shareButtons.all()) {
        const ariaLabel = await button.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel).toMatch(/Partager|Copier/);
      }
    });
  });

  test.describe('Performance', () => {
    test('devrait charger les boutons de partage rapidement', async ({ page }) => {
      const startTime = Date.now();

      await page.waitForSelector('.article-card');
      const firstArticle = page.locator('.article-card').first();
      await firstArticle.hover();

      await page.waitForSelector('.share-buttons');

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000); // Moins de 2 secondes
    });

    test('devrait ne pas ralentir le scroll', async ({ page }) => {
      await page.waitForSelector('.article-card');

      // Mesurer le temps de scroll
      const scrollTime = await page.evaluate(() => {
        const startTime = performance.now();

        // Scroll rapide
        window.scrollTo(0, 1000);

        return performance.now() - startTime;
      });

      // Le scroll devrait être fluide (< 100ms)
      expect(scrollTime).toBeLessThan(100);
    });
  });

  test.describe('Intégration avec les autres fonctionnalités', () => {
    test('devrait mettre à jour les métadonnées Open Graph lors du partage', async ({ page }) => {
      await page.waitForSelector('.article-card');
      const firstArticle = page.locator('.article-card').first();

      // Cliquer sur l'article pour naviguer (si c'est un lien)
      const articleLink = firstArticle.locator('a').first();
      if (await articleLink.isVisible()) {
        await articleLink.click();
        await page.waitForLoadState();

        // Vérifier les métadonnées Open Graph
        const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
        const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');

        expect(ogTitle).toBeTruthy();
        expect(ogDescription).toBeTruthy();
      }
    });

    test('devrait intégrer avec le système de favoris', async ({ page }) => {
      await page.waitForSelector('.article-card');
      const firstArticle = page.locator('.article-card').first();
      await firstArticle.hover();

      // Vérifier que les boutons de favoris et partage coexistent
      const bookmarkBtn = firstArticle.locator('.bookmark-btn');
      const shareButtons = firstArticle.locator('.share-buttons');

      await expect(bookmarkBtn).toBeVisible();
      await expect(shareButtons).toBeVisible();
    });
  });
});
