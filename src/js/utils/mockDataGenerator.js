// Les Scoops du Jour - Mock Data Generator
// Fonction utilitaire pour générer des articles de test avec données béninoises réalistes

// Données de base pour la génération
const benineseData = {
  authors: [
    'Marie KPOGNON', 'Jean ADJOVI', 'Fatima ALI', 'Paul HOUNTON',
    'Dr. Marie DOUTI', 'Dr. Koffi A.', 'Prof. Alain K.', 'Sophie LOKOSSOU',
    'Maître Koffi A.', 'Prof. Xavier CREPIN', 'Dr. Alain DOSSOU',
    'Mme. Amina H.', 'M. Lionel A.', 'Dr. Rachel T.'
  ],

  categories: {
    politique: {
      name: 'politique',
      color: 'primary',
      keywords: ['gouvernement', 'président', 'élection', 'assemblée', 'ministre', 'constitution', 'réforme', 'démocratie']
    },
    economie: {
      name: 'economie',
      color: 'success',
      keywords: ['croissance', 'investissement', 'commerce', 'entreprise', 'emploi', 'développement', 'banque', 'finance']
    },
    culture: {
      name: 'culture',
      color: 'info',
      keywords: ['festival', 'art', 'musique', 'cinéma', 'littérature', 'tradition', 'vaudou', 'danse']
    },
    sport: {
      name: 'sport',
      color: 'warning',
      keywords: ['football', 'basketball', 'handball', 'athlétisme', 'olympique', 'équipe', 'victoire', 'championnat']
    },
    education: {
      name: 'education',
      color: 'info',
      keywords: ['école', 'université', 'étudiant', 'enseignant', 'réforme', 'diplôme', 'formation', 'pédagogie']
    },
    sante: {
      name: 'sante',
      color: 'success',
      keywords: ['hôpital', 'médecin', 'vaccination', 'épidémie', 'soins', 'santé publique', 'clinique', 'maladie']
    },
    tech: {
      name: 'tech',
      color: 'primary',
      keywords: ['intelligence artificielle', 'internet', 'téléphone', 'ordinateur', 'startup', 'innovation', 'numérique']
    },
    environnement: {
      name: 'environnement',
      color: 'success',
      keywords: ['climat', 'forêt', 'eau', 'pollution', 'biodiversité', 'développement durable', 'énergie', 'écologie']
    },
    justice: {
      name: 'justice',
      color: 'warning',
      keywords: ['tribunal', 'procès', 'droit', 'avocat', 'crime', 'justice sociale', 'réforme judiciaire']
    },
    agriculture: {
      name: 'agriculture',
      color: 'success',
      keywords: ['ferme', 'cultures', 'élevage', 'agriculteur', 'récolte', 'irrigation', 'coopérative', 'transformation']
    }
  },

  locations: [
    'Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Bohicon', 'Abomey-Calavi',
    'Ouidah', 'Lokossa', 'Natitingou', 'Kandi', 'Malanville', 'Pobè'
  ],

  organizations: [
    'Gouvernement du Bénin', 'Assemblée Nationale', 'Cour Constitutionnelle',
    'Université d\'Abomey-Calavi', 'INSAE', 'BNB', 'Port Autonome de Cotonou',
    'CCI Bénin', 'Ministère de l\'Économie', 'Ministère de la Santé'
  ]
};

// Templates d'articles par catégorie
const articleTemplates = {
  politique: [
    { title: 'Nouveau gouvernement formé : {president} nomme ses ministres', desc: 'Le président {president} a annoncé la composition de son nouveau gouvernement après plusieurs semaines de consultations.' },
    { title: 'Réforme constitutionnelle : Vers une {keyword} renforcée', desc: 'Le gouvernement présente un projet de réforme visant à renforcer la {keyword} au Bénin.' },
    { title: 'Élections législatives : {organization} annonce les résultats', desc: 'Les résultats définitifs des élections législatives viennent d\'être proclamés par la {organization}.' },
    { title: 'Visite officielle : Le président reçoit le chef d\'État de {country}', desc: 'Le président {president} a reçu en audience le président de {country} pour discuter de coopération bilatérale.' }
  ],

  economie: [
    { title: 'Croissance économique : {percentage}% au {quarter} trimestre', desc: 'Le Bénin enregistre une croissance économique de {percentage}% selon les derniers chiffres publiés par l\'INSAE.' },
    { title: 'Investissements étrangers : {company} s\'installe à {location}', desc: 'Une nouvelle entreprise étrangère annonce son implantation dans la zone économique spéciale de {location}.' },
    { title: 'Commerce extérieur : Record d\'exportation pour le {product}', desc: 'Le Bénin bat son record d\'exportation de {product} avec plus de {number} tonnes cette année.' },
    { title: 'Emploi : {number} nouveaux postes créés dans {sector}', desc: 'Le secteur {sector} annonce la création de {number} emplois suite à un nouveau projet d\'investissement.' }
  ],

  culture: [
    { title: 'Festival {event} : Plus de {number} visiteurs attendus', desc: 'Le Festival {event} débute ce weekend et devrait accueillir plus de {number} visiteurs venus célébrer la culture béninoise.' },
    { title: 'Cinéma béninois : Nouveau film primé à {festival}', desc: 'Un film réalisé par un cinéaste béninois remporte un prix prestigieux au Festival de {festival}.' },
    { title: 'Musique : {artist} sort son nouvel album', desc: 'Le célèbre artiste béninois {artist} vient de sortir son nouvel album intitulé "{album}".' },
    { title: 'Patrimoine : Restauration du Palais Royal de {location}', desc: 'Les travaux de restauration du Palais Royal de {location} touchent à leur fin après plusieurs mois de chantier.' }
  ],

  sport: [
    { title: 'Équipe nationale : Victoire historique contre {country} en {competition}', desc: 'Les Écureuils du Bénin créent la sensation en battant {country} en {competition}.' },
    { title: '{sport} : Les {team} qualifiées pour {competition}', desc: 'L\'équipe {team} du Bénin se qualifie pour {competition} après une victoire décisive.' },
    { title: 'Athlétisme : Record national battu par {athlete}', desc: 'L\'athlète béninois {athlete} établit un nouveau record national dans l\'épreuve du {discipline}.' },
    { title: 'Jeux Olympiques : {athlete} vise une médaille à Paris 2024', desc: 'L\'athlète béninois {athlete} se prépare activement pour les Jeux Olympiques de Paris 2024.' }
  ],

  education: [
    { title: 'Réforme éducative : Nouveaux programmes pour {year}', desc: 'Le ministre de l\'Éducation présente les grandes lignes de la réforme du système éducatif béninois pour l\'année scolaire {year}.' },
    { title: 'Université {university} : Nouveau recteur élu', desc: 'Le Professeur {professor} a été élu nouveau recteur de l\'Université {university}.' },
    { title: 'Bourses d\'études : {number} étudiants bénéficiaires', desc: 'Le gouvernement annonce l\'octroi de bourses d\'études à {number} étudiants méritants.' },
    { title: 'Formation professionnelle : Nouveau centre à {location}', desc: 'Un nouveau centre de formation professionnelle ouvre ses portes à {location} pour former les jeunes aux métiers d\'avenir.' }
  ],

  sante: [
    { title: 'Campagne vaccination {disease} : Objectif {percentage}% de couverture', desc: 'Le ministère de la Santé lance une nouvelle campagne de vaccination contre {disease} avec pour objectif d\'atteindre {percentage}% de couverture vaccinale.' },
    { title: 'Nouvel hôpital : Inauguration à {location}', desc: 'Un nouvel hôpital moderne vient d\'être inauguré à {location} pour améliorer l\'accès aux soins de santé.' },
    { title: 'Santé mentale : Nouvelle clinique spécialisée à {location}', desc: 'Une nouvelle clinique dédiée à la santé mentale ouvre ses portes à {location}.' },
    { title: 'Médecine traditionnelle : Journée mondiale célébrée à {location}', desc: 'La Journée mondiale de la médecine traditionnelle a été célébrée en grande pompe à {location}.' }
  ],

  tech: [
    { title: 'Intelligence artificielle : Nouveau centre de recherche à {location}', desc: 'Un nouveau centre de recherche en IA ouvre ses portes à {location} avec le soutien de partenaires internationaux.' },
    { title: 'Startups béninoises : Succès à {event}', desc: 'Deux startups béninoises remportent le premier prix d\'un concours international à {event}.' },
    { title: 'Numérique : {percentage}% de la population connectée', desc: 'Le taux de connexion internet au Bénin atteint désormais {percentage}% de la population.' },
    { title: 'Innovation : Nouvelle application {app} lancée', desc: 'Une nouvelle application mobile {app} développée par des jeunes béninois facilite {function}.' }
  ],

  environnement: [
    { title: 'Protection environnement : Nouveau parc national dans {region}', desc: 'Le gouvernement annonce la création d\'un nouveau parc national dans la région {region} pour préserver la biodiversité.' },
    { title: 'Énergie solaire : Centrale de {capacity} MW inaugurée', desc: 'Une nouvelle centrale solaire de {capacity} mégawatts vient d\'être inaugurée pour produire de l\'énergie propre.' },
    { title: 'Littoral protégé : Projet de restauration des {ecosystem}', desc: 'Un projet international vise à restaurer {number} hectares de {ecosystem} sur le littoral béninois.' },
    { title: 'Changement climatique : Plan national d\'adaptation adopté', desc: 'Le Bénin adopte son Plan National d\'Adaptation au Changement Climatique pour faire face aux défis environnementaux.' }
  ],

  justice: [
    { title: 'Réforme judiciaire : Vers une justice plus {adjective} et {adjective2}', desc: 'Le ministre de la Justice présente les nouvelles mesures pour moderniser le système judiciaire béninois.' },
    { title: 'Corruption : {organization} annonce des avancées', desc: 'La {organization} annonce des avancées significatives dans les procès concernant les crimes économiques.' },
    { title: 'Droits de l\'homme : Nouveau rapport publié', desc: 'Un nouveau rapport sur la situation des droits de l\'homme au Bénin vient d\'être publié par les Nations Unies.' },
    { title: 'Justice transitionnelle : Avancées dans les procès historiques', desc: 'La Cour de Répression des Infractions Économiques et du Terrorisme annonce des avancées dans les procès historiques.' }
  ],

  agriculture: [
    { title: 'Révolution agricole : Le Bénin mise sur les nouvelles technologies', desc: 'Le gouvernement lance un programme ambitieux pour moderniser l\'agriculture béninoise avec l\'introduction de nouvelles technologies.' },
    { title: '{product} : Record d\'exportation pour la campagne {season}', desc: 'Le Bénin bat son record d\'exportation de {product} avec plus de {number} tonnes durant la campagne {season}.' },
    { title: 'Irrigation : Nouveau système dans la vallée de {river}', desc: 'Un nouveau système d\'irrigation moderne est mis en place dans la vallée de {river} pour améliorer les rendements agricoles.' },
    { title: 'Coopératives : {number} agriculteurs bénéficient de nouvelles aides', desc: 'Le gouvernement annonce l\'octroi d\'aides financières à {number} agriculteurs regroupés en coopératives.' }
  ]
};

// Fonction principale pour générer des articles
export function generateBenineseArticles(count = 20, options = {}) {
  const {
    categories = Object.keys(benineseData.categories),
    minRating = 3.5,
    maxRating = 5.0,
    includeImages = true,
    realisticDates = true
  } = options;

  const articles = [];

  for (let i = 0; i < count; i++) {
    const categoryKey = categories[Math.floor(Math.random() * categories.length)];
    const category = benineseData.categories[categoryKey];
    const templates = articleTemplates[categoryKey];

    if (!templates) continue;

    const template = templates[Math.floor(Math.random() * templates.length)];
    const article = createArticleFromTemplate(template, category, {
      minRating,
      maxRating,
      includeImages,
      realisticDates,
      index: i
    });

    articles.push(article);
  }

  return articles;
}

// Fonction pour créer un article à partir d'un template
function createArticleFromTemplate(template, category, options) {
  const { minRating, maxRating, includeImages, realisticDates, index } = options;

  // Générer le titre et la description
  const title = fillTemplate(template.title, category.name);
  const description = fillTemplate(template.desc, category.name);

  // Générer d'autres propriétés
  const author = benineseData.authors[Math.floor(Math.random() * benineseData.authors.length)];
  const rating = (Math.random() * (maxRating - minRating) + minRating).toFixed(1);
  const publishedAt = realisticDates ? generateRealisticDate() : generateRecentDate();

  // Générer l'URL de l'image
  let urlToImage = '';
  if (includeImages) {
    const imageWidth = category.name === 'politique' ? 800 : 400;
    const imageHeight = category.name === 'politique' ? 500 : 250;
    const titleSlug = title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    urlToImage = `https://via.placeholder.com/${imageWidth}x${imageHeight}/${getCategoryColorHex(category.name)}/FFFFFF?text=${encodeURIComponent(titleSlug)}`;
  }

  return {
    id: `article-${index + 1}`,
    title,
    description,
    content: generateFullContent(description, category.name),
    url: '#',
    urlToImage,
    publishedAt,
    source: 'Les Scoops du Jour',
    category: category.name,
    author,
    rating: parseFloat(rating),
    views: Math.floor(Math.random() * 5000) + 500,
    rank: index < 5 ? index + 1 : null
  };
}

// Fonction pour remplir les templates avec des données réalistes
function fillTemplate(template, category) {
  const replacements = {
    president: ['Patrice Talon', 'Thomas Boni Yayi', 'Mathieu Kérékou'][Math.floor(Math.random() * 3)],
    percentage: [6.8, 7.2, 5.9, 8.1, 4.5][Math.floor(Math.random() * 5)],
    quarter: ['premier', 'deuxième', 'troisième', 'quatrième'][Math.floor(Math.random() * 4)],
    company: ['China State Construction', 'Bouygues', 'Total Energies', 'Orange'][Math.floor(Math.random() * 4)],
    location: benineseData.locations[Math.floor(Math.random() * benineseData.locations.length)],
    product: ['anacarde', 'coton', 'cacao', 'café'][Math.floor(Math.random() * 4)],
    number: [50, 100, 200, 500, 1000, 5000][Math.floor(Math.random() * 6)],
    sector: ['technologique', 'agricole', 'touristique', 'industriel'][Math.floor(Math.random() * 4)],
    event: ['International d\'Ouidah', 'Jazz de Cotonou', 'Artisanat de Porto-Novo'][Math.floor(Math.random() * 3)],
    festival: ['Cannes', 'Berlin', 'Venise', 'Toronto'][Math.floor(Math.random() * 4)],
    artist: ['Angélique Kidjo', 'Gnonnas Pedro', 'Sékouba Bambino'][Math.floor(Math.random() * 3)],
    album: ['Black Ivory Soul', 'Oyotunji', 'Parakou'][Math.floor(Math.random() * 3)],
    country: ['France', 'Chine', 'Nigeria', 'Togo', 'Ghana'][Math.floor(Math.random() * 5)],
    organization: benineseData.organizations[Math.floor(Math.random() * benineseData.organizations.length)],
    competition: ['Coupe d\'Afrique', 'Championnat d\'Afrique', 'Jeux Olympiques'][Math.floor(Math.random() * 3)],
    sport: ['football', 'basketball', 'handball', 'athlétisme'][Math.floor(Math.random() * 4)],
    team: ['Écureuils', 'Amazones', 'Guépards'][Math.floor(Math.random() * 3)],
    athlete: ['Noël Benit', 'Odile Ahouanwanou', 'Mathilde Amivi'][Math.floor(Math.random() * 3)],
    discipline: ['100m', 'saut en longueur', 'lancer du disque'][Math.floor(Math.random() * 3)],
    year: ['2025-2026', '2026-2027', '2027-2028'][Math.floor(Math.random() * 3)],
    university: ['d\'Abomey-Calavi', 'de Parakou', 'Nationale des Sciences Appliquées'][Math.floor(Math.random() * 3)],
    professor: ['Xavier Crepin', 'Alain K.', 'Marie Douti'][Math.floor(Math.random() * 3)],
    disease: ['COVID-19', 'paludisme', 'fièvre jaune'][Math.floor(Math.random() * 3)],
    app: ['e-commerce', 'paiement mobile', 'agriculture connectée'][Math.floor(Math.random() * 3)],
    function: ['les achats en ligne', 'les paiements sécurisés', 'la gestion des cultures'][Math.floor(Math.random() * 3)],
    region: ['nord', 'sud', 'centre', 'Atlantique'][Math.floor(Math.random() * 4)],
    capacity: [50, 100, 150, 200][Math.floor(Math.random() * 4)],
    ecosystem: ['mangroves', 'forêts', 'lagunes'][Math.floor(Math.random() * 3)],
    adjective: ['rapide', 'transparente', 'efficace', 'moderne'][Math.floor(Math.random() * 4)],
    adjective2: ['transparente', 'efficace', 'moderne', 'accessible'][Math.floor(Math.random() * 4)],
    season: ['2024-2025', '2025-2026', '2023-2024'][Math.floor(Math.random() * 3)],
    river: ['Ouémé', 'Niger', 'Mono'][Math.floor(Math.random() * 3)],
    keyword: category === 'politique' ? ['démocratie', 'stabilité', 'transparence'][Math.floor(Math.random() * 3)] :
             category === 'economie' ? ['croissance', 'développement', 'stabilité'][Math.floor(Math.random() * 3)] :
             ['innovation', 'développement', 'modernisation'][Math.floor(Math.random() * 3)]
  };

  let result = template;
  Object.keys(replacements).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, replacements[key]);
  });

  return result;
}

// Fonction pour générer du contenu complet
function generateFullContent(description, category) {
  const contentLength = Math.floor(Math.random() * 500) + 200;
  const sentences = [
    'Cette initiative s\'inscrit dans le cadre du Programme d\'Actions du Gouvernement.',
    'Les autorités compétentes ont été saisies pour la mise en œuvre effective de cette mesure.',
    'Cette décision vise à améliorer les conditions de vie des populations concernées.',
    'Le ministre en charge du secteur a présidé la cérémonie officielle.',
    'Les partenaires techniques et financiers ont apporté leur soutien à ce projet.',
    'Cette réalisation constitue une avancée majeure pour le développement du pays.',
    'Les bénéficiaires ont exprimé leur satisfaction quant à cette initiative.',
    'Cette politique s\'aligne sur les objectifs de développement durable.',
    'Le gouvernement reste déterminé à poursuivre les réformes engagées.',
    'Cette mesure contribuera à renforcer la position du Bénin sur la scène internationale.'
  ];

  let content = description + ' ';
  while (content.length < contentLength) {
    content += sentences[Math.floor(Math.random() * sentences.length)] + ' ';
  }

  return content.trim();
}

// Fonction pour générer des dates réalistes
function generateRealisticDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30); // Derniers 30 jours
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).replace('.', '');
}

// Fonction pour générer des dates récentes
function generateRecentDate() {
  const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const now = new Date();
  const month = months[now.getMonth()];
  const day = now.getDate() + Math.floor(Math.random() * 30) - 15;
  const year = now.getFullYear();

  return `${day} ${month} ${year}`;
}

// Fonction pour obtenir la couleur hexadécimale d'une catégorie
function getCategoryColorHex(category) {
  const colors = {
    politique: 'FE0202',
    economie: '4CAF50',
    culture: '9C27B0',
    sport: 'FF9800',
    education: '2196F3',
    sante: '607D8B',
    tech: '795548',
    environnement: '3F51B5',
    justice: 'E91E63',
    agriculture: '009688'
  };
  return colors[category] || '607D8B';
}

// Fonction pour générer des articles populaires
export function generatePopularArticles(count = 5) {
  const articles = generateBenineseArticles(count * 2); // Générer plus pour sélectionner les meilleurs

  return articles
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count)
    .map((article, index) => ({
      ...article,
      rank: index + 1,
      views: Math.floor(Math.random() * 3000) + 1000 + (count - index) * 200
    }));
}

// Fonction pour générer un article vedette (hero)
export function generateHeroArticle() {
  const articles = generateBenineseArticles(1, {
    categories: ['politique', 'economie'],
    minRating: 4.5,
    maxRating: 5.0
  });

  return articles[0];
}

// Fonction pour générer des articles par catégorie
export function generateArticlesByCategory(category, count = 5) {
  return generateBenineseArticles(count, {
    categories: [category],
    minRating: 3.8,
    maxRating: 4.8
  });
}

// Export des données de base pour utilisation externe
export { benineseData, articleTemplates };
