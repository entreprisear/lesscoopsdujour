// Jest Setup for Les Scoops du Jour
// Configuration globale pour tous les tests

// Mock de l'API fetch globale
global.fetch = jest.fn();

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};

global.localStorage = localStorageMock;

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};

global.sessionStorage = sessionStorageMock;

// Mock de l'API Notification
global.Notification = {
  requestPermission: jest.fn().mockResolvedValue('granted'),
  permission: 'granted'
};

// Mock de l'API Share
global.navigator.share = jest.fn().mockResolvedValue();
global.navigator.canShare = jest.fn().mockReturnValue(true);

// Mock de l'API Clipboard
global.navigator.clipboard = {
  writeText: jest.fn().mockResolvedValue(),
  readText: jest.fn().mockResolvedValue('')
};

// Mock de IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    return null;
  }

  disconnect() {
    return null;
  }

  unobserve() {
    return null;
  }
};

// Mock de ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    return null;
  }

  disconnect() {
    return null;
  }

  unobserve() {
    return null;
  }
};

// Mock de matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock des APIs de performance
global.performance.mark = jest.fn();
global.performance.measure = jest.fn();
global.performance.getEntriesByName = jest.fn().mockReturnValue([]);

// Mock de requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();

// Mock de setTimeout et setInterval pour les tests
jest.useFakeTimers();

// Configuration des mocks par défaut
beforeEach(() => {
  // Reset des mocks
  jest.clearAllMocks();

  // Configuration par défaut de fetch
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
  });

  // Configuration par défaut de localStorage
  localStorage.getItem.mockReturnValue(null);
  localStorage.setItem.mockImplementation(() => null);
  localStorage.removeItem.mockImplementation(() => null);
  localStorage.clear.mockImplementation(() => null);

  // Reset des timers
  jest.clearAllTimers();
});

// Utilitaires de test globaux
global.testUtils = {
  // Créer un article de test réaliste
  createTestArticle: (overrides = {}) => ({
    id: 1,
    title: 'Nouveau gouvernement formé : Patrice Talon nomme ses ministres',
    excerpt: 'Le président Patrice Talon a annoncé la composition de son nouveau gouvernement après plusieurs semaines de consultations.',
    content: 'Contenu détaillé de l\'article...',
    author: 'Marie KPOGNON',
    authorAvatar: '/images/authors/author-1.jpg',
    category: 'politique',
    tags: ['gouvernement', 'patrice-talon', 'réformes'],
    image: '/images/articles/gouvernement-talon.jpg',
    publishedAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    views: 1250,
    rating: 4.2,
    reviewCount: 25,
    featured: true,
    ...overrides
  }),

  // Créer un utilisateur de test
  createTestUser: (overrides = {}) => ({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Jean Dupont',
    preferences: {
      frequency: 'daily',
      categories: ['politique', 'economie'],
      format: 'html'
    },
    subscribedAt: '2025-01-10T09:00:00Z',
    confirmed: true,
    ...overrides
  }),

  // Simuler un événement DOM
  createEvent: (type, options = {}) => {
    const event = new Event(type, {
      bubbles: true,
      cancelable: true,
      ...options
    });

    if (options.target) {
      Object.defineProperty(event, 'target', {
        value: options.target,
        writable: false
      });
    }

    return event;
  },

  // Attendre qu'un élément soit rendu dans le DOM
  waitForElement: (selector, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  },

  // Mock des APIs sociales
  mockSocialAPIs: () => {
    // Mock Twitter
    window.twttr = {
      widgets: {
        load: jest.fn(),
        createTweet: jest.fn().mockResolvedValue(document.createElement('div')),
        createTimeline: jest.fn().mockResolvedValue(document.createElement('div'))
      }
    };

    // Mock Facebook
    window.FB = {
      init: jest.fn(),
      XFBML: {
        parse: jest.fn()
      }
    };

    // Mock Instagram API
    global.fetch.mockImplementation((url) => {
      if (url.includes('instagram_oembed')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            html: '<blockquote class="instagram-media">Test Instagram</blockquote>'
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  },

  // Nettoyer le DOM après chaque test
  cleanupDOM: () => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  }
};

// Configuration des snapshots
expect.addSnapshotSerializer({
  test: (val) => val && typeof val === 'object' && val.constructor === HTMLElement,
  print: (val) => {
    return `HTMLElement(${val.tagName}${val.id ? `#${val.id}` : ''}${val.className ? `.${val.className}` : ''})`;
  }
});

// Export pour utilisation dans les tests
module.exports = {
  testUtils: global.testUtils
};
