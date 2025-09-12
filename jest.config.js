// Jest Configuration for Les Scoops du Jour
// Configuration complète pour les tests unitaires et d'intégration

module.exports = {
  // Environnement de test
  testEnvironment: 'jsdom',

  // Fichiers de configuration à charger avant les tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Pattern de découverte des fichiers de test
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js',
    '!**/node_modules/**'
  ],

  // Répertoires à ignorer
  testPathIgnorePatterns: [
    '/node_modules/',
    '/public/',
    '/dist/',
    '/build/'
  ],

  // Collecte de la couverture de code
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.config.js',
    '!src/**/*.min.js',
    '!src/templates/**/*.js',
    '!**/node_modules/**'
  ],

  // Seuils de couverture minimum
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/js/components/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/js/utils/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },

  // Répertoire de sortie de la couverture
  coverageDirectory: 'coverage',

  // Formats de rapport de couverture
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],

  // Répertoires de modules à mapper
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/js/components/$1',
    '^@utils/(.*)$': '<rootDir>/src/js/utils/$1',
    '^@templates/(.*)$': '<rootDir>/src/templates/$1'
  },

  // Extensions de fichiers à traiter
  moduleFileExtensions: [
    'js',
    'json',
    'jsx',
    'ts',
    'tsx',
    'node'
  ],

  // Transformations pour les différents types de fichiers
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.jsx$': 'babel-jest'
  },

  // Fichiers à transformer malgré les extensions
  transformIgnorePatterns: [
    '/node_modules/(?!(@babel|@jest|jest-.*)/)'
  ],

  // Mocks automatiques
  automock: false,

  // Mocks pour les modules Node.js
  nodeModulesToTransform: [],

  // Globals pour les tests
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },

  // Délai d'expiration des tests (en ms)
  testTimeout: 10000,

  // Nombre maximum de workers
  maxWorkers: '50%',

  // Mode verbose pour plus de détails
  verbose: true,

  // Couleurs dans la sortie console
  colors: true,

  // Détection automatique des tests ouverts
  detectOpenHandles: true,

  // Forcer l'arrêt après tous les tests
  forceExit: true,

  // Nettoyer les mocks entre les tests
  clearMocks: true,

  // Restaurer les mocks entre les tests
  restoreMocks: true,

  // Réinitialiser les modules entre les tests
  resetModules: true
};
