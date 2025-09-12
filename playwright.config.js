// Playwright Configuration for Les Scoops du Jour
// Configuration pour les tests E2E (End-to-End)

const { devices } = require('@playwright/test');

module.exports = {
  // Répertoire des tests
  testDir: './tests/e2e',

  // Répertoire des résultats des tests
  outputDir: './test-results',

  // Timeout global pour les tests
  timeout: 30000,

  // Timeout pour les actions individuelles
  expect: {
    timeout: 10000
  },

  // Configuration des navigateurs
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure'
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure'
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure'
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure'
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure'
      },
    }
  ],

  // Configuration du serveur de développement
  webServer: {
    command: 'npm run dev',
    port: 8080,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },

  // Configuration globale
  use: {
    // URL de base pour les tests
    baseURL: 'http://localhost:8080',

    // Capture d'écran en cas d'échec
    screenshot: 'only-on-failure',

    // Enregistrement vidéo en cas d'échec
    video: 'retain-on-failure',

    // Trace en cas d'échec
    trace: 'retain-on-failure',

    // Configuration des actions
    actionTimeout: 10000,
    navigationTimeout: 30000,

    // Ignorer les erreurs HTTPS
    ignoreHTTPSErrors: true,

    // Permissions
    permissions: ['clipboard-read', 'clipboard-write'],
  },

  // Configuration des rapports
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    ['list']
  ],

  // Nombre de workers (processus parallèles)
  workers: process.env.CI ? 2 : undefined,

  // Retry en cas d'échec
  retries: process.env.CI ? 2 : 0,

  // Tests à exécuter en parallèle
  fullyParallel: true,

  // Fichiers à considérer comme des tests
  testMatch: '**/*.spec.js',

  // Fichiers à ignorer
  testIgnore: '**/*.config.js',

  // Configuration globale des tests
  globalSetup: require.resolve('./tests/e2e/global-setup.js'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.js'),
};
