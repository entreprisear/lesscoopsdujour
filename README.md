# Les Scoops du Jour

Plateforme d'actualités béninoises moderne et interactive.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![Webpack](https://img.shields.io/badge/webpack-5.88.2-blue)](https://webpack.js.org/)

## 📋 Description

Les Scoops du Jour est une application web moderne dédiée à la diffusion d'actualités et d'informations pertinentes sur le Bénin. La plateforme offre une expérience utilisateur exceptionnelle avec une interface responsive, une navigation intuitive et des fonctionnalités avancées.

## ✨ Fonctionnalités

- 📰 **Actualité en temps réel** - Articles frais et pertinents
- 📂 **Catégorisation intelligente** - Politique, Économie, Culture, Sport
- 🔍 **Recherche avancée** - Trouvez rapidement ce que vous cherchez
- 📱 **Interface responsive** - Optimisée pour tous les appareils
- 🌙 **Mode sombre** - Support automatique du thème système
- ⚡ **Performance optimisée** - Lazy loading et cache intelligent
- 🔗 **Partage social** - Partagez les articles facilement
- ♿ **Accessibilité** - Conforme aux standards WCAG

## 🎨 Design

- **Couleur principale** : `#FE0202` (Rouge dynamique)
- **Design system** : Variables CSS modulaires
- **Typography** : Police système optimisée
- **Animations** : Transitions fluides et subtiles

## 🛠️ Technologies utilisées

- **Frontend** :
  - HTML5 sémantique
  - CSS3 avec variables et Grid/Flexbox
  - JavaScript ES6+ avec modules
  - Webpack 5 pour le bundling

- **Outils de développement** :
  - Node.js pour l'environnement
  - Jest pour les tests
  - ESLint pour la qualité du code
  - Git pour le versionnement

- **APIs** :
  - NewsAPI pour les actualités
  - Cache local pour les performances

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (version 14.0.0 ou supérieure)
- [npm](https://www.npmjs.com/) (inclus avec Node.js)
- [Git](https://git-scm.com/)

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/entreprisear/lesscoopsdujour.git
cd lesscoopsdujour
```

### 2. Installer les dépendances

```bash
npm install
```

Cette commande installera toutes les dépendances listées dans `package.json`.

### 3. Configuration (optionnel)

Pour utiliser l'API News réelle, créez un fichier `.env` à la racine :

```env
NEWS_API_KEY=votre_clé_api_ici
```

Obtenez une clé API gratuite sur [NewsAPI](https://newsapi.org/).

## 🏃‍♂️ Utilisation

### Développement

Lancez le serveur de développement :

```bash
npm run dev
```

Le serveur démarrera sur [http://localhost:9000](http://localhost:9000) avec rechargement automatique.

### Production

Construisez l'application pour la production :

```bash
npm run build
```

Les fichiers optimisés seront générés dans le dossier `public/`.

### Tests

Exécutez les tests automatisés :

```bash
npm test
```

## 📁 Structure du projet

```
lesscoopsdujour/
├── src/
│   ├── index.html              # Page principale
│   ├── css/
│   │   ├── variables.css       # Variables CSS et thème
│   │   ├── main.css           # Styles principaux
│   │   ├── components.css     # Styles des composants
│   │   └── responsive.css     # Media queries responsives
│   ├── js/
│   │   ├── main.js            # Point d'entrée de l'application
│   │   ├── api.js             # Gestion des appels API
│   │   └── components/
│   │       └── news.js        # Composants d'actualités
│   ├── assets/
│   │   ├── images/            # Images et médias
│   │   └── icons/             # Icônes de l'application
│   └── pages/                 # Pages supplémentaires (futur)
├── public/                    # Fichiers de production
├── node_modules/              # Dépendances (généré)
├── package.json               # Configuration du projet
├── webpack.config.js          # Configuration Webpack
├── .gitignore                 # Fichiers ignorés par Git
└── README.md                  # Documentation
```

## 🔧 Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Construit l'application pour la production
- `npm run start` - Alias pour `npm run dev`
- `npm test` - Exécute les tests

## 🧪 Tests

Le projet utilise Jest pour les tests. Les tests sont organisés dans le dossier `__tests__/` :

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests en mode watch
npm test -- --watch

# Générer un rapport de couverture
npm test -- --coverage
```

## 🚀 Déploiement

### Sur un serveur web

1. Construisez l'application :
   ```bash
   npm run build
   ```

2. Déployez le contenu du dossier `public/` sur votre serveur web.

### Avec Docker (futur)

```bash
docker build -t lesscoopsdujour .
docker run -p 8080:80 lesscoopsdujour
```

## 🔧 Dépannage

### Problèmes courants

**Erreur "Cannot find module"**
```bash
# Supprimez node_modules et réinstallez
rm -rf node_modules package-lock.json
npm install
```

**Port 9000 déjà utilisé**
```bash
# Changez le port dans webpack.config.js ou utilisez
npm run dev -- --port 3000
```

**API News non disponible**
- L'application utilise des données mock en cas d'indisponibilité de l'API
- Vérifiez votre connexion internet
- Configurez une clé API valide

### Support

Pour obtenir de l'aide :
- Consultez les [Issues](https://github.com/entreprisear/lesscoopsdujour/issues) GitHub
- Vérifiez la documentation dans le code
- Contactez l'équipe de développement

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

### Processus de contribution

1. **Fork** le projet
2. **Clone** votre fork :
   ```bash
   git clone https://github.com/votre-username/lesscoopsdujour.git
   ```

3. **Créez** une branche pour votre fonctionnalité :
   ```bash
   git checkout -b feature/nouvelle-fonctionnalite
   ```

4. **Développez** et **testez** vos changements

5. **Committez** vos changements :
   ```bash
   git commit -m "Ajout: Nouvelle fonctionnalité"
   ```

6. **Pushez** vers votre fork :
   ```bash
   git push origin feature/nouvelle-fonctionnalite
   ```

7. **Ouvrez** une Pull Request

### Guidelines

- Respectez le style de code existant
- Ajoutez des tests pour les nouvelles fonctionnalités
- Mettez à jour la documentation si nécessaire
- Utilisez des messages de commit descriptifs

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [NewsAPI](https://newsapi.org/) pour les données d'actualités
- [Webpack](https://webpack.js.org/) pour le bundling
- La communauté open source

## 📞 Contact

**Entreprise AR**
- GitHub : [@entreprisear](https://github.com/entreprisear)
- Email : entrepriseactivitesrentables@gmail.com

---

⭐ **N'hésitez pas à mettre une étoile si ce projet vous plaît !**
