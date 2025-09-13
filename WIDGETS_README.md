# 📰 Widgets Les Scoops du Jour

Widgets embarquables pour intégrer facilement les actualités béninoises sur votre site web.

## 📋 Vue d'ensemble

Les widgets Les Scoops du Jour permettent aux médias partenaires béninois d'intégrer facilement nos actualités sur leurs sites web. Quatre types de widgets sont disponibles :

- **Articles Récents** : Liste des derniers articles avec personnalisation complète
- **Article du Jour** : Mise en avant de l'article principal
- **Météo Bénin** : Conditions météorologiques et prévisions
- **Breaking News** : Bandeau défilant avec actualités urgentes

## 🚀 Démarrage Rapide

### 1. Inclure le script

```html
<script src="https://lesscoopsdujour.com/widgets.js"></script>
```

### 2. Créer un conteneur

```html
<div id="scoops-widget"></div>
```

### 3. Initialiser le widget

```html
<script>
new ScoopsWidgets.ScoopsWidget('scoops-widget', {
  limit: 5,
  showImages: true,
  primaryColor: '#FE0202'
});
</script>
```

## 📖 Documentation Détaillée

### Widget Articles Récents

Le widget principal pour afficher les derniers articles.

#### Options disponibles

```javascript
const options = {
  // Configuration de base
  limit: 5,                    // Nombre d'articles (3, 5, 10)
  category: null,              // Catégorie spécifique ou null pour toutes
  layout: 'vertical',          // 'vertical', 'horizontal', 'grid'

  // Affichage du contenu
  showImages: true,            // Afficher les images
  showDates: true,             // Afficher les dates
  showExcerpt: true,           // Afficher les extraits
  showSource: true,            // Afficher la source

  // Limites de texte
  maxTitleLength: 80,          // Longueur max du titre
  maxExcerptLength: 120,       // Longueur max de l'extrait

  // Personnalisation visuelle
  primaryColor: '#FE0202',     // Couleur principale
  secondaryColor: '#757575',   // Couleur secondaire
  backgroundColor: '#ffffff',  // Couleur de fond
  textColor: '#1a1a1a',        // Couleur du texte
  borderRadius: '8px',         // Rayon des bordures
  fontFamily: 'Inter, sans-serif', // Police de caractères

  // Thème
  theme: 'light'               // 'light' ou 'dark'
};
```

#### Exemples d'utilisation

**Widget simple :**
```html
<div id="simple-widget"></div>
<script>
new ScoopsWidgets.ScoopsWidget('simple-widget');
</script>
```

**Widget personnalisé :**
```html
<div id="custom-widget"></div>
<script>
new ScoopsWidgets.ScoopsWidget('custom-widget', {
  limit: 3,
  category: 'politique',
  layout: 'grid',
  primaryColor: '#00a651',
  showImages: true,
  showDates: true,
  showExcerpt: false
});
</script>
```

**Widget horizontal :**
```html
<div id="horizontal-widget"></div>
<script>
new ScoopsWidgets.ScoopsWidget('horizontal-widget', {
  layout: 'horizontal',
  limit: 4,
  showExcerpt: false
});
</script>
```

### Widget Article du Jour

Mise en avant de l'article principal du jour.

#### Options disponibles

```javascript
const options = {
  showImage: true,             // Afficher l'image
  showExcerpt: true,           // Afficher l'extrait
  showAuthor: true,            // Afficher l'auteur

  // Personnalisation
  primaryColor: '#FE0202',
  secondaryColor: '#757575',
  backgroundColor: '#ffffff',
  textColor: '#1a1a1a',
  borderRadius: '12px',
  fontFamily: 'Inter, sans-serif',
  theme: 'light'
};
```

#### Exemple d'utilisation

```html
<div id="article-day"></div>
<script>
new ScoopsWidgets.ArticleOfTheDayWidget('article-day', {
  showImage: true,
  showExcerpt: true,
  primaryColor: '#FE0202'
});
</script>
```

### Widget Météo Bénin

Conditions météorologiques pour les villes béninoises.

#### Options disponibles

```javascript
const options = {
  city: 'Cotonou',             // Ville (Cotonou, Porto-Novo, Parakou, etc.)
  showHumidity: true,          // Afficher l'humidité
  showWind: true,              // Afficher la vitesse du vent
  showForecast: true,          // Afficher les prévisions

  // Personnalisation
  primaryColor: '#2196F3',
  backgroundColor: '#ffffff',
  textColor: '#1a1a1a',
  borderRadius: '12px',
  fontFamily: 'Inter, sans-serif',
  theme: 'light'
};
```

#### Exemple d'utilisation

```html
<div id="weather"></div>
<script>
new ScoopsWidgets.WeatherWidget('weather', {
  city: 'Cotonou',
  showForecast: true,
  primaryColor: '#2196F3'
});
</script>
```

### Widget Breaking News

Bandeau défilant avec les actualités urgentes.

#### Options disponibles

```javascript
const options = {
  speed: 50,                   // Vitesse de défilement (pixels/seconde)
  showIcon: true,              // Afficher les icônes

  // Personnalisation
  primaryColor: '#FE0202',
  backgroundColor: '#FE0202',
  textColor: '#ffffff',
  fontFamily: 'Inter, sans-serif',
  theme: 'light'
};
```

#### Exemple d'utilisation

```html
<div id="breaking-news"></div>
<script>
new ScoopsWidgets.BreakingNewsTicker('breaking-news', {
  speed: 30,
  showIcon: true
});
</script>
```

## 🎨 Personnalisation Avancée

### Thèmes

Tous les widgets supportent les thèmes light et dark :

```javascript
// Thème sombre
new ScoopsWidgets.ScoopsWidget('widget', {
  theme: 'dark',
  backgroundColor: '#1a1a1a',
  textColor: '#ffffff'
});
```

### Couleurs personnalisées

```javascript
const customOptions = {
  primaryColor: '#00a651',      // Vert béninois
  secondaryColor: '#ffd700',    // Or
  backgroundColor: '#f0f8e8',   // Fond vert clair
  textColor: '#1a1a1a'
};
```

### Polices personnalisées

```javascript
const fontOptions = {
  fontFamily: "'Poppins', sans-serif",
  // Le widget chargera automatiquement Google Fonts
};
```

## 📱 Responsive Design

Tous les widgets sont entièrement responsives et s'adaptent automatiquement :

- **Desktop** : Mise en page complète
- **Tablette** : Ajustements pour écrans moyens
- **Mobile** : Design optimisé pour petits écrans

## ⚡ Performance

### Optimisations incluses

- **Cache intelligent** : Mise en cache des données pendant 5 minutes
- **Lazy loading** : Chargement des images à la demande
- **Compression** : Code minifié pour production
- **CDN** : Distribution via réseau de diffusion de contenu

### Métriques de performance

- **Temps de chargement** : < 100ms pour le script principal
- **Taille** : ~50KB minifié et gzippé
- **Score Lighthouse** : > 90/100

## 🔧 Intégration Avancée

### Auto-initialisation avec data attributes

```html
<!-- Le widget s'initialise automatiquement -->
<div id="auto-widget"
     data-widget="scoops-recent"
     data-options='{"limit": 3, "category": "politique"}'>
</div>
```

### Gestion d'événements

```javascript
const widget = new ScoopsWidgets.ScoopsWidget('widget');

// Écouter les clics sur les articles
widget.addEventListener('articleClick', (event) => {
  console.log('Article cliqué:', event.detail);
});

// Actualiser le widget
widget.refresh();

// Détruire le widget
widget.destroy();
```

### Analytics intégré

Le suivi Google Analytics est automatiquement configuré :

```javascript
// Événements trackés automatiquement
- widget_article_click
- widget_load
- widget_error
```

## 🛡️ Sécurité

### Mesures de sécurité

- **CSP compliant** : Compatible avec Content Security Policy
- **XSS protection** : Échappement automatique du HTML
- **Input validation** : Validation de toutes les entrées utilisateur
- **HTTPS only** : Fonctionne uniquement en HTTPS

### Bonnes pratiques

```javascript
// Utilisez toujours des options validées
const safeOptions = {
  limit: Math.min(Math.max(options.limit || 5, 1), 20), // Entre 1 et 20
  category: ['politique', 'economie', 'culture', 'sport'].includes(options.category)
    ? options.category : null
};
```

## 🌍 Support Multilingue

### Langues supportées

- **Français** (par défaut)
- **Anglais** (bientôt disponible)
- **Autres langues africaines** (planifiées)

### Configuration de langue

```javascript
new ScoopsWidgets.ScoopsWidget('widget', {
  lang: 'fr'  // 'fr', 'en', etc.
});
```

## 📊 Analytics et Métriques

### Événements trackés

```javascript
// Articles vus
widget_view: {
  widget_type: 'scoops-recent',
  article_count: 5
}

// Articles cliqués
widget_article_click: {
  widget_type: 'scoops-recent',
  article_title: '...',
  article_url: '...',
  position: 1
}

// Erreurs
widget_error: {
  widget_type: 'scoops-recent',
  error_type: 'network',
  error_message: '...'
}
```

### Intégration Google Analytics 4

```javascript
// Automatique si gtag est disponible
if (window.gtag) {
  gtag('event', 'widget_interaction', {
    custom_parameter_1: widgetId
  });
}
```

## 🐛 Dépannage

### Problèmes courants

**Le widget ne se charge pas**
```javascript
// Vérifier que le script est chargé
console.log(window.ScoopsWidgets); // Devrait afficher l'objet

// Vérifier l'ID du conteneur
console.log(document.getElementById('widget-id'));
```

**Erreur "Container not found"**
```html
<!-- Assurez-vous que l'ID existe -->
<div id="correct-id"></div>
<script>
new ScoopsWidgets.ScoopsWidget('correct-id');
</script>
```

**Problèmes de style**
```css
/* Reset des styles si nécessaire */
#widget-container * {
  box-sizing: border-box;
}
```

### Debug mode

```javascript
// Activer le mode debug
window.SCOOPS_WIDGETS_DEBUG = true;

// Les erreurs seront loggées dans la console
```

## 📝 Exemples Complets

### Site d'information régional

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <title>Mon Journal Régional</title>
    <script src="https://lesscoopsdujour.com/widgets.js"></script>
</head>
<body>
    <header>
        <h1>Mon Journal Régional</h1>
    </header>

    <main>
        <section>
            <h2>Actualités Nationales</h2>
            <div id="national-news"></div>
        </section>

        <section>
            <h2>Météo</h2>
            <div id="weather"></div>
        </section>
    </main>

    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // Widget actualités nationales
        new ScoopsWidgets.ScoopsWidget('national-news', {
            limit: 6,
            category: null,
            layout: 'grid',
            primaryColor: '#FE0202',
            showImages: true,
            showDates: true,
            showExcerpt: true
        });

        // Widget météo
        new ScoopsWidgets.WeatherWidget('weather', {
            city: 'Cotonou',
            showForecast: true,
            primaryColor: '#2196F3'
        });
    });
    </script>
</body>
</html>
```

### Blog personnel

```html
<!-- Sidebar avec widgets -->
<aside>
    <div id="recent-posts"></div>
    <div id="featured-article"></div>
    <div id="breaking-ticker"></div>
</aside>

<script>
new ScoopsWidgets.ScoopsWidget('recent-posts', {
    limit: 3,
    layout: 'vertical',
    showExcerpt: false,
    primaryColor: '#6c757d'
});

new ScoopsWidgets.ArticleOfTheDayWidget('featured-article', {
    showAuthor: true,
    primaryColor: '#28a745'
});

new ScoopsWidgets.BreakingNewsTicker('breaking-ticker', {
    speed: 40,
    backgroundColor: '#dc3545'
});
</script>
```

## 📞 Support

### Contact

- **Email** : widgets@lesscoopsdujour.com
- **Documentation** : https://lesscoopsdujour.com/widgets/docs
- **Démonstration** : https://lesscoopsdujour.com/widgets/demo

### FAQ

**Q: Les widgets sont-ils gratuits ?**
R: Oui, les widgets de base sont gratuits pour tous les médias partenaires béninois.

**Q: Puis-je personnaliser complètement l'apparence ?**
R: Oui, tous les aspects visuels peuvent être personnalisés via les options.

**Q: Les widgets fonctionnent-ils sur mobile ?**
R: Oui, tous les widgets sont entièrement responsives.

**Q: Comment mettre à jour les données ?**
R: Les données sont automatiquement actualisées toutes les 5 minutes.

## 📋 Changelog

### Version 1.0.0 (2025-09-13)
- ✅ Lancement officiel des widgets
- ✅ Widget Articles Récents avec 3 layouts
- ✅ Widget Article du Jour
- ✅ Widget Météo Bénin
- ✅ Widget Breaking News
- ✅ Personnalisation complète
- ✅ Support responsive
- ✅ Cache intelligent
- ✅ Analytics intégré
- ✅ Documentation complète

### Roadmap
- 🔄 Widget Cours des Matières Premières
- 🔄 Widget Événements Culturels
- 🔄 Support multilingue étendu
- 🔄 API REST pour intégration avancée
- 🔄 Dashboard d'analytics pour partenaires

---

**Les Scoops du Jour** - *L'information qui vous rapproche*
