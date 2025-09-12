// Les Scoops du Jour - Star Rating Component
// Composant de notation par étoiles interactif et animé

export class StarRating {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      initialRating: 0,
      maxRating: 5,
      readonly: false,
      size: 'medium', // small, medium, large
      showScore: true,
      animate: true,
      onRate: () => {},
      onHover: () => {},
      ...options
    };

    this.currentRating = this.options.initialRating;
    this.hoverRating = 0;
    this.isAnimating = false;

    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    const { maxRating, size, showScore, readonly } = this.options;

    // Créer le conteneur principal
    const container = document.createElement('div');
    container.className = `star-rating star-rating-${size} ${readonly ? 'readonly' : 'interactive'}`;
    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', 'Notation par étoiles');

    // Créer les étoiles
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars-container';

    for (let i = 1; i <= maxRating; i++) {
      const star = this.createStar(i);
      starsContainer.appendChild(star);
    }

    container.appendChild(starsContainer);

    // Ajouter le score si demandé
    if (showScore) {
      const scoreElement = document.createElement('span');
      scoreElement.className = 'rating-score';
      scoreElement.textContent = this.currentRating.toFixed(1);
      container.appendChild(scoreElement);
    }

    // Remplacer le contenu de l'élément
    this.element.innerHTML = '';
    this.element.appendChild(container);

    // Mettre à jour l'affichage initial
    this.updateDisplay();
  }

  createStar(index) {
    const star = document.createElement('button');
    star.className = 'star';
    star.setAttribute('data-rating', index);
    star.setAttribute('aria-label', `Noter ${index} étoile${index > 1 ? 's' : ''}`);
    star.innerHTML = '★';

    if (this.options.readonly) {
      star.disabled = true;
      star.setAttribute('aria-disabled', 'true');
    }

    return star;
  }

  attachEventListeners() {
    if (this.options.readonly) return;

    const stars = this.element.querySelectorAll('.star');

    stars.forEach((star, index) => {
      const rating = index + 1;

      // Événements souris
      star.addEventListener('mouseenter', () => this.handleMouseEnter(rating));
      star.addEventListener('mouseleave', () => this.handleMouseLeave());
      star.addEventListener('click', () => this.handleClick(rating));

      // Événements tactiles
      star.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleMouseEnter(rating);
      });
      star.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.handleClick(rating);
      });

      // Événements clavier
      star.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleClick(rating);
        }
      });
    });

    // Quitter le conteneur
    this.element.addEventListener('mouseleave', () => this.handleMouseLeave());
  }

  handleMouseEnter(rating) {
    if (this.isAnimating) return;

    this.hoverRating = rating;
    this.updateDisplay();

    this.options.onHover(rating);
  }

  handleMouseLeave() {
    if (this.isAnimating) return;

    this.hoverRating = 0;
    this.updateDisplay();

    this.options.onHover(0);
  }

  handleClick(rating) {
    if (this.isAnimating) return;

    this.setRating(rating);
    this.options.onRate(rating);
  }

  setRating(rating) {
    this.currentRating = rating;
    this.hoverRating = 0;

    if (this.options.animate) {
      this.animateRating();
    } else {
      this.updateDisplay();
    }
  }

  animateRating() {
    this.isAnimating = true;

    // Animation de pulsation
    const stars = this.element.querySelectorAll('.star');
    stars.forEach(star => {
      star.style.animation = 'star-pulse 0.6s ease-out';
    });

    // Réinitialiser après l'animation
    setTimeout(() => {
      stars.forEach(star => {
        star.style.animation = '';
      });
      this.isAnimating = false;
      this.updateDisplay();
    }, 600);
  }

  updateDisplay() {
    const stars = this.element.querySelectorAll('.star');
    const displayRating = this.hoverRating || this.currentRating;

    stars.forEach((star, index) => {
      const starRating = index + 1;
      star.className = 'star';

      if (starRating <= displayRating) {
        if (displayRating - starRating < 1 && displayRating - starRating > 0) {
          star.classList.add('half');
        } else {
          star.classList.add('full');
        }
      } else {
        star.classList.add('empty');
      }

      // État hover
      if (this.hoverRating > 0 && starRating <= this.hoverRating) {
        star.classList.add('hover');
      }
    });

    // Mettre à jour le score
    const scoreElement = this.element.querySelector('.rating-score');
    if (scoreElement) {
      scoreElement.textContent = this.currentRating.toFixed(1);
    }
  }

  getRating() {
    return this.currentRating;
  }

  reset() {
    this.currentRating = 0;
    this.hoverRating = 0;
    this.updateDisplay();
  }

  destroy() {
    this.element.innerHTML = '';
  }
}

// Fonction utilitaire pour créer une notation par étoiles
export function createStarRating(element, options = {}) {
  return new StarRating(element, options);
}

// Fonction pour créer une distribution des notes (graphique)
export function createRatingDistribution(ratings, container) {
  const distribution = {};

  // Initialiser la distribution
  for (let i = 1; i <= 5; i++) {
    distribution[i] = 0;
  }

  // Compter les notes
  ratings.forEach(rating => {
    const rounded = Math.round(rating);
    if (distribution[rounded] !== undefined) {
      distribution[rounded]++;
    }
  });

  const total = ratings.length;
  const average = ratings.reduce((sum, rating) => sum + rating, 0) / total;

  // Créer l'HTML
  let html = `
    <div class="rating-distribution">
      <div class="rating-summary">
        <div class="rating-average">${average.toFixed(1)}</div>
        <div class="rating-stars">
          ${createStarsHTML(average)}
        </div>
        <div class="rating-count">${total} avis</div>
      </div>
      <div class="rating-bars">
  `;

  // Barres de distribution (du plus élevé au plus bas)
  for (let i = 5; i >= 1; i--) {
    const count = distribution[i];
    const percentage = total > 0 ? (count / total) * 100 : 0;

    html += `
      <div class="rating-bar">
        <span class="rating-label">${i} <span class="star">★</span></span>
        <div class="rating-bar-container">
          <div class="rating-bar-fill" style="width: ${percentage}%"></div>
        </div>
        <span class="rating-count">${count}</span>
      </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function createStarsHTML(rating) {
  let html = '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    html += '<span class="star full">★</span>';
  }

  if (hasHalfStar) {
    html += '<span class="star half">★</span>';
  }

  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    html += '<span class="star empty">★</span>';
  }

  return html;
}
