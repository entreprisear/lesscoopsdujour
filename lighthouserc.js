// Configuration Lighthouse pour Les Scoops du Jour
// Tests de performance automatisés

module.exports = {
  ci: {
    collect: {
      // URL à tester
      url: ['http://localhost:8080/'],

      // Nombre d'exécutions par URL
      numberOfRuns: 3,

      // Configuration des tests
      settings: {
        // Seuils de performance
        budgets: [
          {
            path: '/',
            resourceSizes: [
              {
                resourceType: 'total',
                budget: 2000 // 2MB max
              },
              {
                resourceType: 'script',
                budget: 1000 // 1MB max pour JS
              },
              {
                resourceType: 'stylesheet',
                budget: 300 // 300KB max pour CSS
              }
            ],
            resourceCounts: [
              {
                resourceType: 'total',
                budget: 50 // 50 ressources max
              }
            ]
          }
        ],

        // Configuration Lighthouse
        config: {
          extends: 'lighthouse:default',
          settings: {
            // Seuils personnalisés
            thresholds: {
              performance: 85,
              accessibility: 90,
              'best-practices': 85,
              seo: 90,
              pwa: 80
            },

            // Options de performance
            performance: {
              // Métriques Core Web Vitals
              coreWebVitals: true,

              // Budgets personnalisés
              budgets: [
                {
                  path: '/',
                  timings: [
                    {
                      metric: 'interactive',
                      budget: 3000 // 3 secondes max pour interactive
                    },
                    {
                      metric: 'first-contentful-paint',
                      budget: 1500 // 1.5 secondes max pour FCP
                    },
                    {
                      metric: 'largest-contentful-paint',
                      budget: 2500 // 2.5 secondes max pour LCP
                    }
                  ]
                }
              ]
            },

            // Options d'accessibilité
            accessibility: {
              // Vérifications supplémentaires
              runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa']
              }
            },

            // Options SEO
            seo: {
              // Vérifications supplémentaires
              plugins: [
                {
                  plugin: 'lighthouse-plugin-field-performance'
                }
              ]
            },

            // Options PWA
            pwa: {
              // Vérifications supplémentaires
              manifestChecks: [
                'hasName',
                'hasShortName',
                'hasStartUrl',
                'hasIcons',
                'hasBackgroundColor',
                'hasThemeColor'
              ]
            }
          },

          // Catégories à tester
          categories: {
            performance: {
              weight: 1,
              score: 85
            },
            accessibility: {
              weight: 1,
              score: 90
            },
            'best-practices': {
              weight: 1,
              score: 85
            },
            seo: {
              weight: 1,
              score: 90
            },
            pwa: {
              weight: 1,
              score: 80
            }
          },

          // Plugins supplémentaires
          plugins: [
            'lighthouse-plugin-field-performance',
            'lighthouse-plugin-publisher-ads'
          ]
        },

        // Options de capture d'écran
        screenshot: true,

        // Options de throttling
        throttling: {
          // Test en 3G lente pour simuler mobile africain
          mobileSlow3G: {
            rttMs: 150,
            throughputKbps: 500,
            cpuSlowdownMultiplier: 4
          }
        },

        // Options de présimulation
        precomputedLanternData: {
          // Données de réseau précalculées
          additionalRttByOrigin: [
            {
              origin: 'https://fonts.googleapis.com',
              rttMs: 100
            },
            {
              origin: 'https://fonts.gstatic.com',
              rttMs: 100
            }
          ]
        },

        // Options d'émulation
        emulatedFormFactor: 'mobile',
        throttlingMethod: 'simulate',

        // Options de localisation
        locale: 'fr-FR',

        // Options de logging
        logLevel: 'info',
        output: ['html', 'json'],

        // Répertoire de sortie
        outputPath: './lighthouse-reports'
      }
    },

    // Configuration d'upload
    upload: {
      target: 'temporary-public-storage'
    },

    // Configuration des assertions
    assert: {
      // Assertions sur les scores
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'categories:best-practices': ['error', { minScore: 0.85 }],
        'categories:seo': ['error', { minScore: 0.90 }],
        'categories:pwa': ['error', { minScore: 0.80 }],

        // Assertions sur les métriques Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],

        // Assertions sur les ressources
        'total-byte-weight': ['error', { maxNumericValue: 2000000 }],
        'script-parse-compile': ['error', { maxNumericValue: 1000 }],

        // Assertions d'accessibilité
        'color-contrast': 'error',
        'image-alt': 'error',
        'link-name': 'error',
        'button-name': 'error',

        // Assertions SEO
        'meta-description': 'error',
        'http-status-code': 'error',
        'font-size': 'error',
        'tap-targets': 'error',

        // Assertions PWA
        'webapp-install-banner': 'error',
        'service-worker': 'error',
        'works-offline': 'error',
        'redirects-http': 'error'
      }
    }
  }
};
