/**
 * Les Scoops du Jour - Mobile Features
 * Fonctionnalités natives pour expérience mobile optimale
 */

class MobileFeatures {
  constructor() {
    this.isStandalone = this.checkStandaloneMode();
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    this.isAndroid = /Android/.test(navigator.userAgent);
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.pullRefreshThreshold = 80;
    this.shakeThreshold = 15;
    this.longPressDelay = 500;
    this.isOnline = navigator.onLine;
    this.init();
  }

  checkStandaloneMode() {
    return window.navigator.standalone ||
           window.matchMedia('(display-mode: standalone)').matches ||
           document.referrer.includes('android-app://');
  }

  async init() {
    console.log('🚀 Initialisation des fonctionnalités mobiles...');
    this.setupTouchOptimizations();
    this.setupKeyboardHandling();
    this.setupSafeAreaInsets();
    await this.enableNotifications();
    this.setupShakeToRefresh();
    this.enablePullToRefresh();
    this.setupSwipeGestures();
    this.setupLongPressContextMenu();
    this.setupPinchToZoom();
    this.setupSplashScreen();
    this.setupStatusBarStyling();
    this.setupNavigationGestures();
    this.setupNetworkIndicator();
    console.log('✅ Fonctionnalités mobiles initialisées');
  }

  setupTouchOptimizations() {
    this.removeTapDelay();
    this.setupTouchFeedback();
    this.setupScrollMomentum();
    console.log('👆 Touch optimizations enabled');
  }

  removeTapDelay() {
    let touchStartTime = 0;
    document.addEventListener('touchstart', () => {
      touchStartTime = Date.now();
    }, { passive: true });
    document.addEventListener('touchend', (event) => {
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime;
      if (touchDuration < 300) {
        event.target.click();
      }
    }, { passive: true });
  }

  setupTouchFeedback() {
    document.addEventListener('touchstart', (e) => {
      const target = e.target.closest('button, .btn, .card, .news-card');
      if (target) {
        target.style.transform = 'scale(0.98)';
        target.style.transition = 'transform 0.1s ease';
      }
    }, { passive: true });
    document.addEventListener('touchend', (e) => {
      const target = e.target.closest('button, .btn, .card, .news-card');
      if (target) {
        setTimeout(() => {
          target.style.transform = '';
        }, 150);
      }
    }, { passive: true });
  }

  setupScrollMomentum() {
    document.body.style.webkitOverflowScrolling = 'touch';
    const scrollableElements = document.querySelectorAll('.scrollable, .news-container');
    scrollableElements.forEach(el => {
      el.style.webkitOverflowScrolling = 'touch';
      el.style.overflowY = 'auto';
    });
  }

  setupKeyboardHandling() {
    const viewport = document.querySelector('meta[name=viewport]');
    const originalContent = viewport ? viewport.getAttribute('content') : '';
    window.addEventListener('focusin', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (viewport) {
          viewport.setAttribute('content', originalContent + ', height=device-height');
        }
        document.body.classList.add('keyboard-open');
      }
    });
    window.addEventListener('focusout', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (viewport) {
          viewport.setAttribute('content', originalContent);
        }
        document.body.classList.remove('keyboard-open');
      }
    });
    console.log('⌨️ Keyboard handling enabled');
  }

  setupSafeAreaInsets() {
    const style = document.createElement('style');
    style.textContent = `
      @supports (padding: max(0px)) {
        .safe-top { padding-top: max(1rem, env(safe-area-inset-top)); }
        .safe-bottom { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
        .safe-left { padding-left: max(1rem, env(safe-area-inset-left)); }
        .safe-right { padding-right: max(1rem, env(safe-area-inset-right)); }
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('safe-top', 'safe-bottom');
    console.log('📱 Safe area insets configured');
  }

  setupShakeToRefresh() {
    if (!window.DeviceMotionEvent) {
      console.log('📱 Shake detection not supported');
      return;
    }
    let lastX = 0, lastY = 0, lastZ = 0;
    let shakeCount = 0;
    let lastShake = 0;
    window.addEventListener('devicemotion', (event) => {
      const { x, y, z } = event.accelerationIncludingGravity;
      const now = Date.now();
      if (now - lastShake > 1000) {
        shakeCount = 0;
      }
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);
      if (deltaX + deltaY + deltaZ > this.shakeThreshold) {
        shakeCount++;
        lastShake = now;
        if (shakeCount >= 2) {
          this.onShakeRefresh();
          shakeCount = 0;
        }
      }
      lastX = x; lastY = y; lastZ = z;
    });
    console.log('🔄 Shake to refresh enabled');
  }

  onShakeRefresh() {
    console.log('🔄 Shake detected - refreshing...');
    if (window.location.reload) {
      window.location.reload();
    }
  }

  enablePullToRefresh() {
    this.pullRefreshElement = document.querySelector('.news-container') || document.body;
    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    this.pullRefreshElement.addEventListener('touchstart', (e) => {
      if (window.pageYOffset === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    }, { passive: true });
    this.pullRefreshElement.addEventListener('touchmove', (e) => {
      if (!isPulling || window.pageYOffset > 0) return;
      currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;
      if (pullDistance > 0) {
        e.preventDefault();
        this.updatePullRefreshUI(pullDistance);
      }
    }, { passive: false });
    this.pullRefreshElement.addEventListener('touchend', () => {
      if (!isPulling) return;
      const pullDistance = currentY - startY;
      if (pullDistance > this.pullRefreshThreshold) {
        this.triggerPullRefresh();
      }
      this.resetPullRefreshUI();
      isPulling = false;
    });
    console.log('⬇️ Pull to refresh enabled');
  }

  updatePullRefreshUI(distance) {
    const progress = Math.min(distance / this.pullRefreshThreshold, 1);
    const opacity = progress * 0.8;
    if (!this.pullRefreshElement.querySelector('.pull-refresh-indicator')) {
      const indicator = document.createElement('div');
      indicator.className = 'pull-refresh-indicator';
      indicator.innerHTML = '<div class=\"pull-icon\">⬇️</div><div class=\"pull-text\">Tirer pour actualiser</div>';
      indicator.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);background:rgba(254,2,2,0.9);color:white;padding:8px 16px;border-radius:20px;font-size:14px;z-index:1000;display:flex;align-items:center;gap:8px;';
      this.pullRefreshElement.appendChild(indicator);
    }
    const indicator = this.pullRefreshElement.querySelector('.pull-refresh-indicator');
    indicator.style.opacity = opacity;
    indicator.style.transform = `translateX(-50%) translateY(${distance * 0.5}px)`;
  }

  resetPullRefreshUI() {
    const indicator = this.pullRefreshElement.querySelector('.pull-refresh-indicator');
    if (indicator) {
      indicator.style.transition = 'all 0.3s ease';
      indicator.style.opacity = '0';
      setTimeout(() => indicator.remove(), 300);
    }
  }

  triggerPullRefresh() {
    console.log('🔄 Pull to refresh triggered');
    if (window.location.reload) {
      window.location.reload();
    }
  }

  setupSwipeGestures() {
    let startX = 0, startY = 0, startTime = 0;
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    }, { passive: true });
    document.addEventListener('touchend', (e) => {
      if (!startX || !startY) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      if (absDeltaX > this.swipeThreshold && absDeltaY < absDeltaX * 0.5) {
        const velocity = absDeltaX / deltaTime;
        if (velocity > 0.3) {
          if (deltaX > 0) {
            this.onSwipeRight();
          } else {
            this.onSwipeLeft();
          }
        }
      }
      startX = startY = 0;
    }, { passive: true });
    console.log('👆 Swipe gestures enabled');
  }

  onSwipeLeft() {
    console.log('👈 Swipe left detected');
    this.navigateArticle('next');
  }

  onSwipeRight() {
    console.log('👉 Swipe right detected');
    this.navigateArticle('previous');
  }

  navigateArticle(direction) {
    const currentArticle = document.querySelector('.article-content');
    if (currentArticle) {
      console.log(`Loading ${direction} article...`);
    }
  }

  setupLongPressContextMenu() {
    let longPressTimer = null;
    document.addEventListener('touchstart', (e) => {
      const target = e.target.closest('.news-card, .article-content');
      if (target && !longPressTimer) {
        longPressTimer = setTimeout(() => {
          this.showContextMenu(e, target);
        }, this.longPressDelay);
      }
    }, { passive: true });
    document.addEventListener('touchend', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }, { passive: true });
    document.addEventListener('touchmove', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }, { passive: true });
    console.log('👆 Long press context menu enabled');
  }

  showContextMenu(event, target) {
    event.preventDefault();
    this.hideContextMenu();
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = '<div class=\"context-menu-item\" data-action=\"share\">📤 Partager</div><div class=\"context-menu-item\" data-action=\"bookmark\">🔖 Sauvegarder</div><div class=\"context-menu-item\" data-action=\"copy-link\">🔗 Copier le lien</div>';
    menu.style.cssText = 'position:fixed;top:' + event.touches[0].clientY + 'px;left:' + event.touches[0].clientX + 'px;background:white;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:1000;min-width:150px;';
    document.body.appendChild(menu);
    menu.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action) {
        this.handleContextAction(action, target);
        this.hideContextMenu();
      }
    });
    setTimeout(() => {
      document.addEventListener('touchstart', () => this.hideContextMenu(), { once: true });
    }, 100);
  }

  hideContextMenu() {
    const menu = document.querySelector('.context-menu');
    if (menu) {
      menu.remove();
    }
  }

  handleContextAction(action, target) {
    switch (action) {
      case 'share':
        this.shareContent(target);
        break;
      case 'bookmark':
        this.bookmarkContent(target);
        break;
      case 'copy-link':
        this.copyLink(target);
        break;
    }
  }

  shareContent(target) {
    const title = target.querySelector('h3, .article-title')?.textContent || 'Les Scoops du Jour';
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title, url });
    } else {
      navigator.clipboard.writeText(`${title} ${url}`);
    }
  }

  bookmarkContent(target) {
    console.log('Bookmarking content...');
  }

  copyLink(target) {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
  }

  setupPinchToZoom() {
    const images = document.querySelectorAll('img[data-zoomable]');
    let initialDistance = 0;
    let currentScale = 1;
    images.forEach(img => {
      img.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          initialDistance = this.getTouchDistance(e.touches);
        }
      }, { passive: false });
      img.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          const currentDistance = this.getTouchDistance(e.touches);
          const scale = currentScale * (currentDistance / initialDistance);
          currentScale = Math.max(0.5, Math.min(3, scale));
          img.style.transform = `scale(${currentScale})`;
        }
      }, { passive: false });
      img.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
          setTimeout(() => {
            img.style.transform = '';
            currentScale = 1;
          }, 300);
        }
      }, { passive: true });
    });
    console.log('🔍 Pinch to zoom enabled for images');
  }

  getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  setupNetworkIndicator() {
    this.networkIndicator = document.createElement('div');
    this.networkIndicator.className = 'network-indicator';
    this.networkIndicator.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff9800;color:white;text-align:center;padding:4px 8px;font-size:12px;z-index:1000;transform:translateY(-100%);transition:transform 0.3s ease;';
    this.updateNetworkStatus();
    document.body.appendChild(this.networkIndicator);
    window.addEventListener('online', () => this.updateNetworkStatus());
    window.addEventListener('offline', () => this.updateNetworkStatus());
    console.log('📡 Network indicator enabled');
  }

  updateNetworkStatus() {
    this.isOnline = navigator.onLine;
    if (this.isOnline) {
      this.networkIndicator.textContent = '🌐 Connecté';
      this.networkIndicator.style.background = '#4caf50';
      setTimeout(() => {
        this.networkIndicator.style.transform = 'translateY(-100%)';
      }, 2000);
    } else {
      this.networkIndicator.textContent = '🔌 Hors ligne';
      this.networkIndicator.style.background = '#f44336';
      this.networkIndicator.style.transform = 'translateY(0)';
    }
  }

  setupSplashScreen() {
    if (!this.isStandalone) return;
    const splash = document.createElement('div');
    splash.className = 'splash-screen';
    splash.innerHTML = '<div class=\"splash-content\"><div class=\"splash-logo\"><img src=\"/images/logo.svg\" alt=\"Les Scoops du Jour\" /></div><div class=\"splash-text\">Chargement...</div><div class=\"splash-spinner\"></div></div>';
    splash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,#FE0202,#d32f2f);display:flex;align-items:center;justify-content:center;z-index:9999;animation:fadeOut 0.5s ease-in-out 2s forwards;';
    document.body.appendChild(splash);
    setTimeout(() => {
      splash.remove();
    }, 2500);
    console.log('🎨 Splash screen displayed');
  }

  setupStatusBarStyling() {
    if (this.isIOS && this.isStandalone) {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-status-bar-style';
      meta.content = 'black-translucent';
      document.head.appendChild(meta);
    }
    if (this.isAndroid) {
      document.body.style.backgroundColor = '#FE0202';
    }
    console.log('📱 Status bar styling applied');
  }

  setupNavigationGestures() {
    if (!this.isIOS) return;
    let startX = 0;
    let isTracking = false;
    document.addEventListener('touchstart', (e) => {
      if (e.touches[0].clientX < 20) {
        startX = e.touches[0].clientX;
        isTracking = true;
      }
    }, { passive: true });
    document.addEventListener('touchmove', (e) => {
      if (!isTracking) return;
      const currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;
      if (deltaX > 50) {
        if (window.history.length > 1) {
          window.history.back();
        }
        isTracking = false;
      }
    }, { passive: true });
    document.addEventListener('touchend', () => {
      isTracking = false;
    }, { passive: true });
    console.log('👆 Navigation gestures enabled');
  }

  async enableNotifications() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.log('🔔 Notifications non supportées');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Notifications activées');
        this.registerPushNotifications();
      } else {
        console.log('❌ Notifications refusées');
      }
    } catch (error) {
      console.error('Erreur notifications:', error);
    }
  }

  async registerPushNotifications() {
    try {
      const registration = await navigator.serviceWorker.ready;
      console.log('📡 Push notifications ready');
    } catch (error) {
      console.error('Erreur push notifications:', error);
    }
  }
}

export default MobileFeatures;
