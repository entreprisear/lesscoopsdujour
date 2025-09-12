# 🧪 Suite de Tests - Les Scoops du Jour

## Vue d'ensemble

Cette suite de tests complète couvre tous les aspects de l'application "Les Scoops du Jour" avec des scénarios réalistes d'utilisation béninoise.

## 📋 Structure des Tests

```
tests/
├── setup.js                    # Configuration globale Jest
├── unit/                       # Tests unitaires
│   └── components/
│       ├── ArticleCard.test.js
│       └── SocialShare.test.js
├── integration/                # Tests d'intégration
│   └── social-sharing.test.js
├── e2e/                        # Tests End-to-End
│   ├── global-setup.js
│   ├── global-teardown.js
│   └── social-sharing.spec.js
└── performance/                # Tests de performance
    └── performance-tests.js
```

## 🚀 Installation et Configuration

### Prérequis

```bash
Node.js >= 14.0.0
npm >= 6.0.0
```

### Installation des dépendances

```bash
# Installer les dépendances principales
npm install

# Installer Playwright et ses navigateurs
npm run playwright:install

# Installer les dépendances système pour Playwright (Linux/Mac)
npm run playwright:install-deps
```

### Configuration des tests

#### Jest (Tests unitaires et d'intégration)
- **Environnement**: jsdom
- **Seuils de couverture**: 80% minimum
- **Timeout**: 10 secondes
- **Workers**: 50% des CPUs disponibles

#### Playwright (Tests E2E)
- **Navigateurs**: Chromium, Firefox, WebKit
- **Appareils**: Desktop + Mobile (Pixel 5, iPhone 12)
- **Timeout**: 30 secondes
- **Retries**: 2 en CI, 0 en local

#### Lighthouse (Tests de performance)
- **Seuils**: Performance ≥85, Accessibilité ≥90, SEO ≥90, PWA ≥80
- **Emulation**: Mobile 3G lente (Afrique)
- **Budgets**: 2MB total, 1MB JS, 300KB CSS

## 🏃‍♂️ Exécution des Tests

### Tests unitaires
```bash
# Tous les tests unitaires
npm run test:unit

# Avec couverture
npm run test:coverage

# Mode watch
npm run test:watch
```

### Tests d'intégration
```bash
npm run test:integration
```

### Tests E2E
```bash
# Tous les navigateurs
npm run test:e2e

# Interface graphique
npm run test:e2e:ui

# Mode debug
npm run test:e2e:debug
```

### Tests de performance
```bash
# Tests personnalisés Puppeteer
npm run test:performance

# Tests Lighthouse
npm run test:lighthouse

# Tests Lighthouse CI
npm run test:lighthouse:ci
```

### Suite complète
```bash
# Tous les tests séquentiellement
npm run test:all
```

## 📊 Métriques et Rapports

### Couverture de code
- **Générée automatiquement** avec Jest
- **Rapport HTML**: `coverage/lcov-report/index.html`
- **Seuils configurés** dans `jest.config.js`

### Rapports E2E
- **HTML**: `playwright-report/index.html`
- **JSON**: `test-results/results.json`
- **JUnit**: `test-results.xml`

### Rapports de performance
- **Lighthouse**: `lighthouse-reports/`
- **Personnalisés**: `performance-reports/`
- **Métriques Core Web Vitals**

## 🧪 Scénarios de Test

### Tests Unitaires

#### ArticleCard Component
- ✅ Création avec options par défaut/personnalisées
- ✅ Rendu variants (large, medium, small)
- ✅ Interactions utilisateur (clic, partage, favoris)
- ✅ Gestion des données (formatage dates/vues)
- ✅ Accessibilité (ARIA, navigation clavier)
- ✅ Performance (lazy loading, cache)
- ✅ Gestion d'erreurs (données manquantes)

#### SocialShare Component
- ✅ Génération URLs partage (7 plateformes)
- ✅ Web Share API (support/fallback)
- ✅ Partage traditionnel (popups)
- ✅ Copy to clipboard (modern/fallback)
- ✅ Tracking et analytics
- ✅ Rendu boutons (thèmes, tailles)
- ✅ Gestion erreurs (plateformes inconnues)

### Tests d'Intégration

#### Système de Partage Social
- ✅ Workflow complet partage article
- ✅ Intégration widgets sociaux
- ✅ Métadonnées Open Graph
- ✅ Scénarios utilisateur réalistes
- ✅ Analytics et tracking
- ✅ Performance et optimisation
- ✅ Gestion erreurs cross-système

### Tests E2E

#### Parcours Utilisateur Desktop
- ✅ Partage Facebook (popup, URL)
- ✅ Partage Twitter (hashtags, via)
- ✅ Copy lien presse-papiers
- ✅ Affichage compteurs partage

#### Parcours Utilisateur Mobile
- ✅ Web Share API native
- ✅ Optimisation affichage mobile
- ✅ Interactions tactiles

#### Scénarios Béninois Réalistes
- ✅ Partage article politique Facebook
- ✅ Partage économique WhatsApp
- ✅ Partage culturel Twitter
- ✅ Partage sportif LinkedIn

### Tests de Performance

#### Métriques de Base
- ✅ First Contentful Paint (< 1.5s)
- ✅ Largest Contentful Paint (< 2.5s)
- ✅ First Input Delay (< 100ms)
- ✅ Cumulative Layout Shift (< 0.1)

#### Performance Partage Social
- ✅ Temps d'affichage boutons (< 500ms)
- ✅ Temps d'action partage (< 200ms)

#### Performance Mobile
- ✅ Temps de chargement mobile (< 3s)
- ✅ Réponse tactile (< 100ms)

#### Performance Connexion Lente
- ✅ Chargement 3G Afrique (< 8s)
- ✅ FCP lent (< 4s), LCP lent (< 6s)

#### Core Web Vitals
- ✅ CLS (Cumulative Layout Shift)
- ✅ FID (First Input Delay)
- ✅ LCP (Largest Contentful Paint)

#### Interactions Utilisateur
- ✅ Réponse scroll (< 50ms)
- ✅ Réponse clic (< 100ms)

## 🎯 Seuils de Performance

### Lighthouse Scores
| Métrique | Seuil Minimum | Cible |
|----------|---------------|-------|
| Performance | 85 | 90+ |
| Accessibilité | 90 | 95+ |
| Best Practices | 85 | 90+ |
| SEO | 90 | 95+ |
| PWA | 80 | 90+ |

### Core Web Vitals
| Métrique | Seuil | Cible |
|----------|-------|-------|
| LCP | < 2.5s | < 2.0s |
| FID | < 100ms | < 75ms |
| CLS | < 0.1 | < 0.05 |

### Ressources
| Ressource | Budget | Cible |
|-----------|--------|-------|
| Bundle JS | < 1MB | < 800KB |
| Bundle CSS | < 300KB | < 200KB |
| Total | < 2MB | < 1.5MB |

## 🔧 Configuration Avancée

### Variables d'environnement
```bash
# Tests E2E
CI=true                    # Mode CI (retry + rapports)
DEBUG=true                 # Mode debug
SLOWMO=1000               # Ralenti pour debug

# Tests Performance
PERF_BUDGET=2000000       # Budget total (bytes)
PERF_TIMEOUT=30000         # Timeout tests (ms)
```

### Configuration CI/CD
```yaml
# GitHub Actions example
- name: Run Tests
  run: |
    npm run test:all
    npm run test:lighthouse:ci

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info

- name: Upload Lighthouse
  uses: actions/upload-artifact@v3
  with:
    name: lighthouse-reports
    path: ./lighthouse-reports/
```

## 🐛 Debugging

### Tests qui échouent
```bash
# Debug test spécifique
npx jest --testNamePattern="nom du test" --verbose

# Debug E2E avec UI
npm run test:e2e:ui

# Debug performance
DEBUG=perf npm run test:performance
```

### Problèmes courants

#### Tests E2E lents
- Vérifier connexion réseau
- Augmenter timeouts dans `playwright.config.js`
- Utiliser `--headed` pour voir l'exécution

#### Tests de performance variables
- Exécuter plusieurs fois pour moyenne
- Vérifier ressources système
- Utiliser throttling simulé

#### Couverture de code faible
- Ajouter tests manquants
- Vérifier exclusions dans `jest.config.js`
- Utiliser `npm run test:coverage` pour détails

## 📈 Monitoring et Métriques

### Tableaux de bord
- **Jest**: Couverture et résultats
- **Playwright**: Rapports HTML/JSON
- **Lighthouse**: Scores et métriques
- **Performance**: Tendances et seuils

### Alertes
- Scores Lighthouse sous seuils
- Couverture sous 80%
- Tests échouant en CI
- Performance régressant

## 🤝 Contribution

### Ajout de tests
1. **Tests unitaires**: `tests/unit/component/nouveau.test.js`
2. **Tests intégration**: `tests/integration/nouvelle-fonction.test.js`
3. **Tests E2E**: `tests/e2e/nouvelle-page.spec.js`
4. **Tests performance**: Étendre `tests/performance/performance-tests.js`

### Bonnes pratiques
- ✅ Utiliser `testUtils` pour données de test
- ✅ Mock APIs externes
- ✅ Tester cas d'erreur
- ✅ Vérifier accessibilité
- ✅ Maintenir couverture >80%

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Core Web Vitals](https://web.dev/vitals/)
- [Testing Library](https://testing-library.com/docs/)

---

## 🎯 Résumé

Cette suite de tests garantit la **qualité et performance** de "Les Scoops du Jour" avec :

- **4 niveaux de tests**: Unitaire, Intégration, E2E, Performance
- **Couverture complète**: Composants, APIs, UI, UX
- **Scénarios réalistes**: Utilisation béninoise authentique
- **Métriques strictes**: Seuils élevés pour qualité
- **CI/CD intégré**: Automatisation complète
- **Rapports détaillés**: Suivi et amélioration continue

**Résultat**: Application robuste, performante et fiable ! 🚀
