// Les Scoops du Jour - ArticleCard Component

export class ArticleCard {
  constructor(article, variant = 'medium', options = {}) {
    this.article = article;
    this.variant = variant; // 'large', 'medium', 'small', 'list'
    this.options = {
      showRating: true,
      showShare: true,
      showBookmark: true,
      lazyLoad: true,
      ...options
    };

    this.element = null;
    this.isBookmarked = false;
    this.isLoaded = false;

    this.init();
  }

  init() {
    this.createElement();
    this.attachEventListeners();
    this.setupLazyLoading();
  }

  createElement() {
    const template = this.getTemplate();
    this.element = this.createElementFromHTML(template);
    this.element.classList.add('article-card', `article-card-${this.variant}`);
    this.element.dataset.articleId = this.article.id;
  }

  getTemplate() {
    const baseClasses = {
      large: 'hero-article',
      medium: 'news-card',
      small: 'popular-article',
      list: 'search-result-item'
    };

    const templates = {
      large: this.getLargeTemplate(),
      medium: this.getMediumTemplate(),
      small: this.getSmallTemplate(),
      list: this.getListTemplate()
    };

    return templates[this.variant] || templates.medium;
  }

  getLargeTemplate() {
    return `
      <article class="hero-article">
        <div class="hero-image">
          <img src="${this.article.urlToImage}" alt="${this.article.title}" class="article-image">
          <div class="hero-category">
            <span class="badge badge-primary">${this.article.category}</span>
          </div>
          ${this.options.showShare ? this.getShareButtons() : ''}
        </div>
        <div class="hero-content">
          <h1 class="hero-title">${this.article.title}</h1>
          <p class="hero-excerpt">${this.article.description}</p>
          <div class="hero-meta">
            <span class="hero-author">Par ${this.article.author}</span>
            <span class="hero-date">${this.article.publishedAt}</span>
            <span class="hero-read-time">5 min de lecture</span>
          </div>
          ${this.options.showRating ? this.getRatingElement() : ''}
          <div class="hero-actions">
            <a href="#" class="btn btn-primary hero-cta">Lire l'article complet</a>
            ${this.options.showBookmark ? this.getBookmarkButton() : ''}
          </div>
        </div>
      </article>
    `;
  }

  getMediumTemplate() {
    return `
      <article class="news-card">
        <div class="news-image">
          <img src="${this.article.urlToImage}" alt="${this.article.title}" class="article-image">
          <div class="news-category">
            <span class="badge badge-${this.getCategoryColor(this.article.category)}">${this.article.category}</span>
          </div>
          ${this.options.showShare ? this.getShareButtons() : ''}
        </div>
        <div class="news-content">
          <h3>${this.article.title}</h3>
          <p>${this.article.description}</p>
          <div class="news-meta">
            <span class="news-author">Par ${this.article.author}</span>
            <span class="news-date">${this.article.publishedAt}</span>
          </div>
          ${this.options.showRating ? this.getRatingElement() : ''}
          ${this.options.showBookmark ? this.getBookmarkButton() : ''}
        </div>
      </article>
    `;
  }

  getSmallTemplate() {
    return `
      <article class="popular-article">
        <div class="popular-rank">${this.article.rank || 1}</div>
        <div class="popular-content">
          <h4>${this.article.title}</h4>
          <span class="popular-meta">${this.article.views || '1,234'} lectures • ${this.article.category}</span>
          ${this.options.showBookmark ? this.getBookmarkButton() : ''}
        </div>
      </article>
    `;
  }

  getListTemplate() {
    return `
      <div class="search-result-item">
        <div class="search-result-image">
          <img src="${this.article.urlToImage}" alt="${this.article.title}" class="article-image">
        </div>
        <div class="search-result-content">
          <div class="font-weight-medium">${this.article.title}</div>
          <div class="text-sm text-muted">${this.article.category} • ${this.article.publishedAt}</div>
          <p class="search-result-excerpt">${this.article.description}</p>
          ${this.options.showRating ? this.getRatingElement() : ''}
          ${this.options.showBookmark ? this.getBookmarkButton() : ''}
        </div>
      </div>
    `;
  }

  getRatingElement() {
    const rating = this.article.rating || 4.0;
    const stars = this.createStarRating(rating);

    return `
      <div class="news-rating">
        ${stars}
        <span class="rating-score">${rating.toFixed(1)}</span>
      </div>
    `;
  }

  getShareButtons() {
    return `
      <div class="share-buttons">
        <button class="share-btn" data-platform="facebook" title="Partager sur Facebook">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>
        <button class="share-btn" data-platform="twitter" title="Partager sur Twitter">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        </button>
        <button class="share-btn" data-platform="whatsapp" title="Partager sur WhatsApp">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        </button>
      </div>
    `;
  }

  getBookmarkButton() {
    const bookmarkClass = this.isBookmarked ? 'bookmarked' : '';
    return `
      <button class="bookmark-btn ${bookmarkClass}" title="${this.isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    `;
  }

  createStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHTML = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<span class="star full">★</span>';
    }

    // Half star
    if (hasHalfStar) {
      starsHTML += '<span class="star half">★</span>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<span class="star empty">★</span>';
    }

    return starsHTML;
  }

  getCategoryColor(category) {
    const colors = {
      politique: 'primary',
      economie: 'success',
      culture: 'info',
      sport: 'warning',
      education: 'info',
      sante: 'success',
      tech: 'primary',
      environnement: 'success',
      justice: 'warning',
      agriculture: 'success',
      general: 'secondary'
    };
    return colors[category] || 'secondary';
  }

  createElementFromHTML(htmlString) {
    const template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    return template.content.firstElementChild;
  }

  attachEventListeners() {
    // Hover effects
    this.element.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

    // Click events
    this.element.addEventListener('click', this.handleClick.bind(this));

    // Share buttons
    const shareButtons = this.element.querySelectorAll('.share-btn');
    shareButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleShare(e);
      });
    });

    // Bookmark button
    const bookmarkBtn = this.element.querySelector('.bookmark-btn');
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleBookmark(e);
      });
    }
  }

  setupLazyLoading() {
    if (!this.options.lazyLoad) return;

    const img = this.element.querySelector('.article-image');
    if (!img) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
          }
          this.isLoaded = true;
          this.element.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });

    if (img.dataset.src) {
      img.classList.add('lazy');
      imageObserver.observe(img);
    } else {
      this.isLoaded = true;
      this.element.classList.add('loaded');
    }
  }

  handleMouseEnter(e) {
    this.element.classList.add('hover');
    this.showPreviewTooltip();
  }

  handleMouseLeave(e) {
    this.element.classList.remove('hover');
    this.hidePreviewTooltip();
  }

  handleClick(e) {
    // Navigate to article or trigger custom action
    console.log('Article clicked:', this.article.title);
    // You can implement navigation logic here
  }

  handleShare(e) {
    const platform = e.currentTarget.dataset.platform;
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(this.article.title);

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${title}%20${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }

  handleBookmark(e) {
    this.isBookmarked = !this.isBookmarked;
    const btn = e.currentTarget;

    btn.classList.toggle('bookmarked');

    // Update button appearance
    if (this.isBookmarked) {
      btn.title = 'Retirer des favoris';
      // You can save to localStorage or send to server
      this.saveBookmark();
    } else {
      btn.title = 'Ajouter aux favoris';
      this.removeBookmark();
    }

    // Trigger custom event
    this.element.dispatchEvent(new CustomEvent('bookmarkChange', {
      detail: { article: this.article, isBookmarked: this.isBookmarked }
    }));
  }

  showPreviewTooltip() {
    if (this.variant === 'small' || this.variant === 'list') return;

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'article-tooltip';
    tooltip.innerHTML = `
      <div class="tooltip-content">
        <h4>${this.article.title}</h4>
        <p>${this.article.description.substring(0, 100)}...</p>
        <div class="tooltip-meta">
          <span>Par ${this.article.author}</span>
          <span>${this.article.publishedAt}</span>
        </div>
      </div>
    `;

    document.body.appendChild(tooltip);

    // Position tooltip
    const rect = this.element.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';

    this.tooltip = tooltip;

    // Animate in
    setTimeout(() => tooltip.classList.add('visible'), 10);
  }

  hidePreviewTooltip() {
    if (this.tooltip) {
      this.tooltip.classList.remove('visible');
      setTimeout(() => {
        if (this.tooltip.parentNode) {
          this.tooltip.parentNode.removeChild(this.tooltip);
        }
      }, 300);
      this.tooltip = null;
    }
  }

  saveBookmark() {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    if (!bookmarks.find(b => b.id === this.article.id)) {
      bookmarks.push(this.article);
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }
  }

  removeBookmark() {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const filtered = bookmarks.filter(b => b.id !== this.article.id);
    localStorage.setItem('bookmarks', JSON.stringify(filtered));
  }

  // Public methods
  render() {
    return this.element;
  }

  update(article) {
    this.article = article;
    this.createElement();
    return this.element;
  }

  destroy() {
    this.hidePreviewTooltip();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  // Static method to create loading skeleton
  static createSkeleton(variant = 'medium') {
    const skeleton = document.createElement('div');
    skeleton.className = `article-card article-card-${variant} skeleton`;

    const templates = {
      large: `
        <div class="hero-article">
          <div class="hero-image skeleton-image"></div>
          <div class="hero-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text short"></div>
            <div class="skeleton-meta"></div>
          </div>
        </div>
      `,
      medium: `
        <div class="news-card">
          <div class="news-image skeleton-image"></div>
          <div class="news-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-meta"></div>
          </div>
        </div>
      `,
      small: `
        <div class="popular-article">
          <div class="popular-rank skeleton-rank"></div>
          <div class="popular-content">
            <div class="skeleton-title small"></div>
            <div class="skeleton-meta small"></div>
          </div>
        </div>
      `,
      list: `
        <div class="search-result-item">
          <div class="search-result-image skeleton-image small"></div>
          <div class="search-result-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-meta small"></div>
          </div>
        </div>
      `
    };

    skeleton.innerHTML = templates[variant] || templates.medium;
    return skeleton;
  }
}

// Export factory function for easier usage
export function createArticleCard(article, variant = 'medium', options = {}) {
  return new ArticleCard(article, variant, options);
}
