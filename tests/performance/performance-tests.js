// Tests de performance personnalisés pour Les Scoops du Jour
// Métriques de performance avancées et monitoring

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PerformanceTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      tests: []
    };
  }

  async runAllTests() {
    console.log('🚀 Démarrage des tests de performance - Les Scoops du Jour');

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    try {
      // Test de performance de base
      await this.testBasicPerformance(browser);

      // Test de performance des partages sociaux
      await this.testSocialSharingPerformance(browser);

      // Test de performance mobile
      await this.testMobilePerformance(browser);

      // Test de performance avec connexion lente
      await this.testSlowConnectionPerformance(browser);

      // Test de performance des Core Web Vitals
      await this.testCoreWebVitals(browser);

      // Test de performance des interactions utilisateur
      await this.testUserInteractionPerformance(browser);

      // Générer le rapport
      this.generateReport();

    } finally {
      await browser.close();
    }

    console.log('✅ Tests de performance terminés');
  }

  async testBasicPerformance(browser) {
    console.log('📊 Test de performance de base...');

    const page = await browser.newPage();

    try {
      // Mesurer les métriques de chargement
      const metrics = await this.measurePageLoad(page, 'http://localhost:8080');

      // Mesurer la taille du bundle
      const bundleSize = await this.measureBundleSize(page);

      // Mesurer les métriques de rendu
      const renderMetrics = await this.measureRenderPerformance(page);

      this.results.tests.push({
        name: 'Basic Performance',
        metrics: {
          ...metrics,
          bundleSize,
          ...renderMetrics
        },
        thresholds: {
          'First Contentful Paint': '< 1500ms',
          'Largest Contentful Paint': '< 2500ms',
          'First Input Delay': '< 100ms',
          'Cumulative Layout Shift': '< 0.1',
          'Bundle Size': '< 1000KB'
        }
      });

    } finally {
      await page.close();
    }
  }

  async testSocialSharingPerformance(browser) {
    console.log('📱 Test de performance du partage social...');

    const page = await browser.newPage();

    try {
      await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

      // Attendre que les articles soient chargés
      await page.waitForSelector('.article-card');

      // Mesurer le temps de survol et d'affichage des boutons
      const hoverMetrics = await page.evaluate(() => {
        const startTime = performance.now();

        return new Promise((resolve) => {
          const firstArticle = document.querySelector('.article-card');
          if (!firstArticle) {
            resolve({ error: 'No article found' });
            return;
          }

          // Simuler le survol
          const mouseoverEvent = new MouseEvent('mouseover', { bubbles: true });
          firstArticle.dispatchEvent(mouseoverEvent);

          // Attendre que les boutons apparaissent
          const checkButtons = () => {
            const buttons = firstArticle.querySelector('.share-buttons');
            if (buttons && buttons.offsetHeight > 0) {
              const endTime = performance.now();
              resolve({
                hoverTime: endTime - startTime,
                buttonsVisible: true
              });
            } else {
              setTimeout(checkButtons, 10);
            }
          };

          setTimeout(() => {
            resolve({ error: 'Buttons not visible within timeout' });
          }, 2000);

          checkButtons();
        });
      });

      // Mesurer le temps d'ouverture d'une popup de partage
      const shareMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const startTime = performance.now();

          // Mock window.open pour mesurer le temps
          const originalOpen = window.open;
          window.open = function(url, name, features) {
            const endTime = performance.now();
            window.open = originalOpen;
            resolve({
              shareTime: endTime - startTime,
              url: url,
              popupOpened: true
            });
            return { closed: false };
          };

          // Trouver et cliquer sur un bouton de partage
          const shareBtn = document.querySelector('[data-platform="facebook"]');
          if (shareBtn) {
            shareBtn.click();
          } else {
            resolve({ error: 'Share button not found' });
          }

          setTimeout(() => {
            resolve({ error: 'Share action timeout' });
          }, 2000);
        });
      });

      this.results.tests.push({
        name: 'Social Sharing Performance',
        metrics: {
          ...hoverMetrics,
          ...shareMetrics
        },
        thresholds: {
          'Hover Time': '< 500ms',
          'Share Action Time': '< 200ms'
        }
      });

    } finally {
      await page.close();
    }
  }

  async testMobilePerformance(browser) {
    console.log('📱 Test de performance mobile...');

    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 375, height: 667 });

    try {
      // Simuler un user agent mobile
      await mobilePage.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15');

      const metrics = await this.measurePageLoad(mobilePage, 'http://localhost:8080');

      // Mesurer spécifiquement les interactions tactiles
      const touchMetrics = await mobilePage.evaluate(() => {
        return new Promise((resolve) => {
          let touchStartTime = 0;
          let touchEndTime = 0;

          // Simuler un touch sur un article
          const article = document.querySelector('.article-card');
          if (!article) {
            resolve({ error: 'No article found' });
            return;
          }

          const touchStart = new TouchEvent('touchstart', {
            touches: [new Touch({ identifier: 0, target: article, clientX: 100, clientY: 100 })]
          });

          const touchEnd = new TouchEvent('touchend', {
            touches: [],
            changedTouches: [new Touch({ identifier: 0, target: article, clientX: 100, clientY: 100 })]
          });

          touchStartTime = performance.now();
          article.dispatchEvent(touchStart);

          setTimeout(() => {
            article.dispatchEvent(touchEnd);
            touchEndTime = performance.now();

            resolve({
              touchResponseTime: touchEndTime - touchStartTime
            });
          }, 100);
        });
      });

      this.results.tests.push({
        name: 'Mobile Performance',
        metrics: {
          ...metrics,
          ...touchMetrics
        },
        thresholds: {
          'Mobile Load Time': '< 3000ms',
          'Touch Response Time': '< 100ms'
        }
      });

    } finally {
      await mobilePage.close();
    }
  }

  async testSlowConnectionPerformance(browser) {
    console.log('🐌 Test de performance avec connexion lente...');

    const slowPage = await browser.newPage();

    // Simuler une connexion 3G lente (Afrique)
    await slowPage.setViewport({ width: 375, height: 667 });
    await slowPage.emulateNetworkConditions({
      offline: false,
      downloadThroughput: 500 * 1024 / 8, // 500 Kbps
      uploadThroughput: 100 * 1024 / 8,   // 100 Kbps
      latency: 150 // 150ms
    });

    try {
      const metrics = await this.measurePageLoad(slowPage, 'http://localhost:8080');

      this.results.tests.push({
        name: 'Slow Connection Performance',
        metrics,
        thresholds: {
          'Slow Load Time': '< 8000ms', // Plus tolérant pour connexion lente
          'Slow FCP': '< 4000ms',
          'Slow LCP': '< 6000ms'
        }
      });

    } finally {
      await slowPage.close();
    }
  }

  async testCoreWebVitals(browser) {
    console.log('📈 Test des Core Web Vitals...');

    const page = await browser.newPage();

    try {
      // Collecter les métriques Core Web Vitals
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals = {};

          // Écouter les événements Web Vitals
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              vitals[entry.name] = {
                value: entry.value,
                timestamp: entry.timestamp
              };
            }
          });

          observer.observe({ entryTypes: ['measure', 'navigation', 'paint', 'layout-shift'] });

          // Attendre un peu pour collecter les métriques
          setTimeout(() => {
            observer.disconnect();
            resolve(vitals);
          }, 3000);
        });
      });

      this.results.tests.push({
        name: 'Core Web Vitals',
        metrics: webVitals,
        thresholds: {
          'CLS': '< 0.1',
          'FID': '< 100ms',
          'LCP': '< 2500ms',
          'FCP': '< 1500ms'
        }
      });

    } finally {
      await page.close();
    }
  }

  async testUserInteractionPerformance(browser) {
    console.log('👆 Test de performance des interactions utilisateur...');

    const page = await browser.newPage();

    try {
      await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

      // Mesurer les interactions de scroll
      const scrollMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const metrics = { scrolls: [] };

          let scrollStartTime = 0;
          const scrollHandler = () => {
            if (scrollStartTime === 0) {
              scrollStartTime = performance.now();
            }
          };

          window.addEventListener('scroll', scrollHandler);

          // Simuler plusieurs scrolls
          const scrollPromises = [];
          for (let i = 0; i < 5; i++) {
            scrollPromises.push(
              new Promise((res) => {
                setTimeout(() => {
                  window.scrollBy(0, 200);
                  metrics.scrolls.push({
                    scrollNumber: i + 1,
                    timestamp: performance.now()
                  });
                  res();
                }, i * 200);
              })
            );
          }

          Promise.all(scrollPromises).then(() => {
            setTimeout(() => {
              window.removeEventListener('scroll', scrollHandler);
              resolve(metrics);
            }, 500);
          });
        });
      });

      // Mesurer les clics sur les articles
      const clickMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const metrics = { clicks: [] };

          const articles = document.querySelectorAll('.article-card');
          if (articles.length === 0) {
            resolve({ error: 'No articles found' });
            return;
          }

          // Simuler des clics sur les premiers articles
          const clickPromises = [];
          for (let i = 0; i < Math.min(3, articles.length); i++) {
            clickPromises.push(
              new Promise((res) => {
                setTimeout(() => {
                  const startTime = performance.now();
                  articles[i].click();
                  const endTime = performance.now();

                  metrics.clicks.push({
                    articleIndex: i,
                    clickTime: endTime - startTime
                  });
                  res();
                }, i * 300);
              })
            );
          }

          Promise.all(clickPromises).then(() => {
            resolve(metrics);
          });
        });
      });

      this.results.tests.push({
        name: 'User Interaction Performance',
        metrics: {
          ...scrollMetrics,
          ...clickMetrics
        },
        thresholds: {
          'Average Scroll Response': '< 50ms',
          'Average Click Response': '< 100ms'
        }
      });

    } finally {
      await page.close();
    }
  }

  async measurePageLoad(page, url) {
    const startTime = Date.now();

    await page.goto(url, { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    // Collecter les métriques de performance
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');

      return {
        loadTime: perfData.loadEventEnd - perfData.fetchStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        domInteractive: perfData.domInteractive,
        domComplete: perfData.domComplete
      };
    });

    return {
      totalLoadTime: loadTime,
      ...metrics
    };
  }

  async measureBundleSize(page) {
    return await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const scripts = resources.filter(r => r.initiatorType === 'script');
      const stylesheets = resources.filter(r => r.initiatorType === 'link' && r.name.includes('.css'));

      return {
        totalScripts: scripts.reduce((sum, s) => sum + s.transferSize, 0),
        totalStylesheets: stylesheets.reduce((sum, s) => sum + s.transferSize, 0),
        scriptCount: scripts.length,
        stylesheetCount: stylesheets.length
      };
    });
  }

  async measureRenderPerformance(page) {
    return await page.evaluate(() => {
      // Mesurer les métriques de rendu
      const observer = new PerformanceObserver((list) => {
        // Collecter les métriques de layout shift
      });

      observer.observe({ entryTypes: ['layout-shift'] });

      return new Promise((resolve) => {
        setTimeout(() => {
          observer.disconnect();

          const layoutShifts = performance.getEntriesByType('layout-shift');
          const totalCLS = layoutShifts.reduce((sum, entry) => sum + entry.value, 0);

          resolve({
            cumulativeLayoutShift: totalCLS,
            layoutShiftCount: layoutShifts.length,
            largestLayoutShift: Math.max(...layoutShifts.map(s => s.value), 0)
          });
        }, 2000);
      });
    });
  }

  generateReport() {
    console.log('📊 Génération du rapport de performance...');

    const reportDir = path.join(process.cwd(), 'performance-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `performance-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

    // Générer un résumé console
    console.log('\n📈 RÉSULTATS DES TESTS DE PERFORMANCE');
    console.log('=' .repeat(50));

    this.results.tests.forEach(test => {
      console.log(`\n🔍 ${test.name}`);
      console.log('-'.repeat(30));

      Object.entries(test.metrics).forEach(([key, value]) => {
        if (typeof value === 'number') {
          const unit = key.toLowerCase().includes('time') ? 'ms' :
                      key.toLowerCase().includes('size') ? 'KB' : '';
          console.log(`  ${key}: ${value}${unit}`);
        } else if (typeof value === 'object' && value !== null) {
          console.log(`  ${key}:`, JSON.stringify(value, null, 2));
        } else {
          console.log(`  ${key}: ${value}`);
        }
      });

      if (test.thresholds) {
        console.log('  Seuils:');
        Object.entries(test.thresholds).forEach(([metric, threshold]) => {
          console.log(`    ${metric}: ${threshold}`);
        });
      }
    });

    console.log(`\n💾 Rapport sauvegardé: ${reportPath}`);
  }
}

// Fonction principale pour exécuter les tests
async function runPerformanceTests() {
  const tester = new PerformanceTester();
  await tester.runAllTests();
}

// Exporter pour utilisation en module
module.exports = { PerformanceTester, runPerformanceTests };

// Exécuter si appelé directement
if (require.main === module) {
  runPerformanceTests().catch(console.error);
}
