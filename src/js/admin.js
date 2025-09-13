/**
 * Les Scoops du Jour - Admin Dashboard
 * Interface d'administration complète
 */

class AdminDashboard {
  constructor() {
    this.currentSection = 'overview';
    this.analytics = new AdminAnalytics();
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupEventListeners();
    this.loadInitialData();
    this.setupTinyMCE();
    console.log('🚀 Admin Dashboard initialized');
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav-item a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.target.closest('.admin-nav-item').dataset.section;
        this.switchSection(section);
      });
    });
  }

  setupEventListeners() {
    // Refresh data button
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshData());
    }

    // New article button
    const newArticleBtn = document.getElementById('new-article-btn');
    if (newArticleBtn) {
      newArticleBtn.addEventListener('click', () => this.openArticleEditor());
    }

    // Article editor
    const editorClose = document.getElementById('editor-close');
    if (editorClose) {
      editorClose.addEventListener('click', () => this.closeArticleEditor());
    }

    // Article form
    const articleForm = document.getElementById('article-form');
    if (articleForm) {
      articleForm.addEventListener('submit', (e) => this.handleArticleSubmit(e));
    }

    // Status change handler
    const statusSelect = document.getElementById('article-status');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        const scheduleGroup = document.getElementById('schedule-group');
        if (scheduleGroup) {
          scheduleGroup.style.display = e.target.value === 'scheduled' ? 'block' : 'none';
        }
      });
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Settings forms
    this.setupSettingsForms();
  }

  switchSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update sections
    document.querySelectorAll('.admin-section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');

    this.currentSection = sectionName;

    // Load section data
    this.loadSectionData(sectionName);
  }

  async loadInitialData() {
    await Promise.all([
      this.loadOverviewData(),
      this.loadArticlesData(),
      this.loadUsersData(),
      this.loadForumData()
    ]);
  }

  async loadSectionData(section) {
    switch (section) {
      case 'overview':
        await this.loadOverviewData();
        break;
      case 'articles':
        await this.loadArticlesData();
        break;
      case 'users':
        await this.loadUsersData();
        break;
      case 'forum':
        await this.loadForumData();
        break;
      case 'analytics':
        this.analytics.renderCharts();
        break;
    }
  }

  async loadOverviewData() {
    try {
      // Load stats
      const stats = await this.fetchStats();
      this.updateStats(stats);

      // Load recent activity
      const activity = await this.fetchRecentActivity();
      this.updateRecentActivity(activity);

      // Update sidebar stats
      this.updateSidebarStats(stats);

    } catch (error) {
      console.error('Error loading overview data:', error);
    }
  }

  async loadArticlesData() {
    try {
      const articles = await this.fetchArticles();
      this.renderArticlesTable(articles);
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  }

  async loadUsersData() {
    try {
      const users = await this.fetchUsers();
      this.renderUsersTable(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  async loadForumData() {
    try {
      const moderationQueue = await this.fetchModerationQueue();
      const reports = await this.fetchReports();

      this.renderModerationQueue(moderationQueue);
      this.renderReports(reports);
    } catch (error) {
      console.error('Error loading forum data:', error);
    }
  }

  // ==========================================
  // DATA FETCHING (Mock implementations)
  // ==========================================

  async fetchStats() {
    // Simulate API call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          totalViews: 45231,
          uniqueVisitors: 8942,
          totalArticles: 156,
          totalComments: 1203,
          todayArticles: 12,
          activeUsers: 1247,
          pendingComments: 8,
          viewsChange: 12.5,
          visitorsChange: 8.2,
          articlesChange: 5,
          commentsChange: 15.3
        });
      }, 500);
    });
  }

  async fetchRecentActivity() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            type: 'article',
            action: 'published',
            title: 'Nouveau gouvernement formé',
            user: 'Admin',
            time: '2 minutes ago',
            icon: '📝'
          },
          {
            type: 'user',
            action: 'registered',
            title: 'Marie KPOGNON s\'est inscrite',
            user: 'System',
            time: '15 minutes ago',
            icon: '👤'
          },
          {
            type: 'comment',
            action: 'moderated',
            title: 'Commentaire approuvé',
            user: 'Modérateur',
            time: '1 heure ago',
            icon: '💬'
          },
          {
            type: 'article',
            action: 'edited',
            title: 'Article mis à jour: Économie',
            user: 'Admin',
            time: '2 heures ago',
            icon: '✏️'
          }
        ]);
      }, 300);
    });
  }

  async fetchArticles() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            title: 'Nouveau gouvernement formé : Patrice Talon nomme ses ministres',
            author: 'Marie KPOGNON',
            category: 'Politique',
            status: 'published',
            views: 2450,
            createdAt: '2025-01-15',
            publishedAt: '2025-01-15'
          },
          {
            id: 2,
            title: 'Économie béninoise : Croissance de 6,8% au premier trimestre',
            author: 'Jean-Pierre ADOVELANDE',
            category: 'Économie',
            status: 'published',
            views: 1890,
            createdAt: '2025-01-14',
            publishedAt: '2025-01-14'
          },
          {
            id: 3,
            title: 'Festival international d\'Ouidah : Plus de 50 000 visiteurs attendus',
            author: 'Sophie HOUNTONDJI',
            category: 'Culture',
            status: 'draft',
            views: 0,
            createdAt: '2025-01-13',
            publishedAt: null
          },
          {
            id: 4,
            title: 'Équipe nationale : Victoire historique contre le Maroc en CAN',
            author: 'Pierre DOSSOU',
            category: 'Sport',
            status: 'scheduled',
            views: 0,
            createdAt: '2025-01-12',
            publishedAt: '2025-01-16'
          }
        ]);
      }, 400);
    });
  }

  async fetchUsers() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: 'Marie KPOGNON',
            email: 'marie.kpognon@email.com',
            role: 'admin',
            lastActivity: '2025-01-15 14:30',
            status: 'active',
            joinDate: '2024-06-15'
          },
          {
            id: 2,
            name: 'Jean-Pierre ADOVELANDE',
            email: 'jp.adovelande@email.com',
            role: 'editor',
            lastActivity: '2025-01-15 12:15',
            status: 'active',
            joinDate: '2024-08-20'
          },
          {
            id: 3,
            name: 'Sophie HOUNTONDJI',
            email: 'sophie.hountondji@email.com',
            role: 'author',
            lastActivity: '2025-01-14 16:45',
            status: 'active',
            joinDate: '2024-09-10'
          }
        ]);
      }, 350);
    });
  }

  async fetchModerationQueue() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            content: 'Excellent article sur la politique au Bénin !',
            author: 'Anonymous User',
            type: 'comment',
            submittedAt: '2025-01-15 13:20',
            reason: 'auto'
          },
          {
            id: 2,
            content: 'Discussion intéressante sur l\'économie',
            author: 'Forum User',
            type: 'post',
            submittedAt: '2025-01-15 11:45',
            reason: 'manual'
          }
        ]);
      }, 300);
    });
  }

  async fetchReports() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            reporter: 'Marie KPOGNON',
            reportedUser: 'Troll User',
            reason: 'Spam',
            description: 'Publication répétée de contenu inapproprié',
            status: 'pending',
            reportedAt: '2025-01-15 10:30'
          }
        ]);
      }, 300);
    });
  }

  // ==========================================
  // UI UPDATES
  // ==========================================

  updateStats(stats) {
    // Update main stats
    document.getElementById('total-views').textContent = stats.totalViews.toLocaleString();
    document.getElementById('unique-visitors').textContent = stats.uniqueVisitors.toLocaleString();
    document.getElementById('total-articles').textContent = stats.totalArticles;
    document.getElementById('total-comments').textContent = stats.totalComments.toLocaleString();

    // Update change indicators
    this.updateStatChange('total-views', stats.viewsChange);
    this.updateStatChange('unique-visitors', stats.visitorsChange);
    this.updateStatChange('total-articles', stats.articlesChange);
    this.updateStatChange('total-comments', stats.commentsChange);
  }

  updateStatChange(statId, change) {
    const changeElement = document.querySelector(`#${statId}`).closest('.stat-content').querySelector('.stat-change');
    if (changeElement) {
      changeElement.textContent = `${change > 0 ? '+' : ''}${change}${statId.includes('articles') ? '' : '%'} `;
      changeElement.classList.toggle('positive', change > 0);
      changeElement.classList.toggle('negative', change < 0);
    }
  }

  updateSidebarStats(stats) {
    document.getElementById('today-articles').textContent = stats.todayArticles;
    document.getElementById('active-users').textContent = stats.activeUsers.toLocaleString();
    document.getElementById('pending-comments').textContent = stats.pendingComments;
  }

  updateRecentActivity(activity) {
    const container = document.getElementById('recent-activity');
    if (!container) return;

    container.innerHTML = activity.map(item => `
      <div class="activity-item">
        <div class="activity-icon">${item.icon}</div>
        <div class="activity-content">
          <h4>${item.title}</h4>
          <p>${item.user} • ${item.action}</p>
        </div>
        <div class="activity-time">${item.time}</div>
      </div>
    `).join('');
  }

  renderArticlesTable(articles) {
    const tbody = document.getElementById('articles-tbody');
    if (!tbody) return;

    tbody.innerHTML = articles.map(article => `
      <tr>
        <td>${article.title}</td>
        <td>${article.author}</td>
        <td>${article.category}</td>
        <td><span class="status-badge status-${article.status}">${this.getStatusLabel(article.status)}</span></td>
        <td>${article.views.toLocaleString()}</td>
        <td>${this.formatDate(article.createdAt)}</td>
        <td>
          <button class="action-btn view" onclick="adminDashboard.viewArticle(${article.id})">Voir</button>
          <button class="action-btn edit" onclick="adminDashboard.editArticle(${article.id})">Modifier</button>
          <button class="action-btn delete" onclick="adminDashboard.deleteArticle(${article.id})">Supprimer</button>
        </td>
      </tr>
    `).join('');
  }

  renderUsersTable(users) {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;

    tbody.innerHTML = users.map(user => `
      <tr>
        <td>
          <div class="user-info">
            <strong>${user.name}</strong>
            <small>${user.email}</small>
          </div>
        </td>
        <td><span class="role-badge role-${user.role}">${this.getRoleLabel(user.role)}</span></td>
        <td>${this.formatDateTime(user.lastActivity)}</td>
        <td><span class="status-badge status-${user.status}">${this.getStatusLabel(user.status)}</span></td>
        <td>
          <button class="action-btn edit" onclick="adminDashboard.editUser(${user.id})">Modifier</button>
          <button class="action-btn delete" onclick="adminDashboard.deleteUser(${user.id})">Supprimer</button>
        </td>
      </tr>
    `).join('');
  }

  renderModerationQueue(queue) {
    const container = document.getElementById('moderation-queue');
    if (!container) return;

    container.innerHTML = queue.map(item => `
      <div class="moderation-item">
        <div class="moderation-content">
          <p><strong>${item.author}</strong> - ${item.type}</p>
          <p>${item.content}</p>
          <small>Soumis le ${this.formatDateTime(item.submittedAt)}</small>
        </div>
        <div class="moderation-actions">
          <button class="btn btn-success" onclick="adminDashboard.approveModeration(${item.id})">Approuver</button>
          <button class="btn btn-danger" onclick="adminDashboard.rejectModeration(${item.id})">Rejeter</button>
        </div>
      </div>
    `).join('');
  }

  renderReports(reports) {
    const container = document.getElementById('reports-list');
    if (!container) return;

    container.innerHTML = reports.map(report => `
      <div class="report-item">
        <div class="report-content">
          <p><strong>${report.reporter}</strong> a signalé <strong>${report.reportedUser}</strong></p>
          <p><em>Raison:</em> ${report.reason}</p>
          <p>${report.description}</p>
          <small>Signalé le ${this.formatDateTime(report.reportedAt)}</small>
        </div>
        <div class="report-actions">
          <button class="btn btn-warning" onclick="adminDashboard.investigateReport(${report.id})">Examiner</button>
          <button class="btn btn-danger" onclick="adminDashboard.banUser(${report.id})">Bannir</button>
        </div>
      </div>
    `).join('');
  }

  // ==========================================
  // ARTICLE MANAGEMENT
  // ==========================================

  openArticleEditor(articleId = null) {
    const modal = document.getElementById('article-editor');
    const title = document.getElementById('editor-title');
    const form = document.getElementById('article-form');

    if (articleId) {
      title.textContent = 'Modifier l\'article';
      // Load article data
      this.loadArticleForEditing(articleId);
    } else {
      title.textContent = 'Nouvel article';
      form.reset();
    }

    modal.classList.add('active');
  }

  closeArticleEditor() {
    const modal = document.getElementById('article-editor');
    modal.classList.remove('active');
  }

  async handleArticleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const articleData = {
      title: formData.get('title'),
      category: formData.get('category'),
      content: tinymce.get('article-content').getContent(),
      tags: formData.get('tags'),
      status: formData.get('status'),
      scheduledDate: formData.get('scheduledDate')
    };

    try {
      // Simulate API call
      await this.saveArticle(articleData);
      this.showNotification('Article sauvegardé avec succès', 'success');
      this.closeArticleEditor();
      this.loadArticlesData();
    } catch (error) {
      this.showNotification('Erreur lors de la sauvegarde', 'error');
    }
  }

  async saveArticle(data) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate save operation
        console.log('Article saved:', data);
        resolve({ success: true });
      }, 1000);
    });
  }

  // ==========================================
  // UTILITIES
  // ==========================================

  getStatusLabel(status) {
    const labels = {
      published: 'Publié',
      draft: 'Brouillon',
      scheduled: 'Planifié',
      active: 'Actif',
      inactive: 'Inactif'
    };
    return labels[status] || status;
  }

  getRoleLabel(role) {
    const labels = {
      admin: 'Administrateur',
      editor: 'Éditeur',
      author: 'Auteur',
      user: 'Utilisateur'
    };
    return labels[role] || role;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('fr-FR');
  }

  showNotification(message, type = 'info') {
    // Use existing notification system or create simple alert
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      alert(message);
    }
  }

  refreshData() {
    this.loadInitialData();
    this.showNotification('Données actualisées', 'success');
  }

  handleLogout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      // Simulate logout
      window.location.href = '/';
    }
  }

  setupSettingsForms() {
    const generalSettings = document.getElementById('general-settings');
    const moderationSettings = document.getElementById('moderation-settings');

    if (generalSettings) {
      generalSettings.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveGeneralSettings(new FormData(e.target));
      });
    }

    if (moderationSettings) {
      moderationSettings.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveModerationSettings(new FormData(e.target));
      });
    }
  }

  async saveGeneralSettings(formData) {
    try {
      // Simulate API call
      console.log('General settings saved:', Object.fromEntries(formData));
      this.showNotification('Paramètres généraux sauvegardés', 'success');
    } catch (error) {
      this.showNotification('Erreur lors de la sauvegarde', 'error');
    }
  }

  async saveModerationSettings(formData) {
    try {
      // Simulate API call
      console.log('Moderation settings saved:', Object.fromEntries(formData));
      this.showNotification('Paramètres de modération sauvegardés', 'success');
    } catch (error) {
      this.showNotification('Erreur lors de la sauvegarde', 'error');
    }
  }

  setupTinyMCE() {
    if (typeof tinymce !== 'undefined') {
      tinymce.init({
        selector: '#article-content',
        height: 400,
        menubar: false,
        plugins: 'lists link image code',
        toolbar: 'bold italic underline | bullist numlist | link image | code',
        content_style: 'body { font-family: Inter, sans-serif; font-size: 14px }'
      });
    }
  }

  // Action handlers (to be called from HTML)
  viewArticle(id) {
    console.log('View article:', id);
    // Implement view logic
  }

  editArticle(id) {
    console.log('Edit article:', id);
    this.openArticleEditor(id);
  }

  deleteArticle(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      console.log('Delete article:', id);
      // Implement delete logic
      this.showNotification('Article supprimé', 'success');
      this.loadArticlesData();
    }
  }

  editUser(id) {
    console.log('Edit user:', id);
    // Implement edit logic
  }

  deleteUser(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      console.log('Delete user:', id);
      // Implement delete logic
      this.showNotification('Utilisateur supprimé', 'success');
      this.loadUsersData();
    }
  }

  approveModeration(id) {
    console.log('Approve moderation:', id);
    this.showNotification('Contenu approuvé', 'success');
    this.loadForumData();
  }

  rejectModeration(id) {
    console.log('Reject moderation:', id);
    this.showNotification('Contenu rejeté', 'warning');
    this.loadForumData();
  }

  investigateReport(id) {
    console.log('Investigate report:', id);
    // Implement investigation logic
  }

  banUser(id) {
    if (confirm('Êtes-vous sûr de vouloir bannir cet utilisateur ?')) {
      console.log('Ban user:', id);
      this.showNotification('Utilisateur banni', 'warning');
      this.loadForumData();
    }
  }
}

// ==========================================
// ANALYTICS DASHBOARD CLASS
// ==========================================

class AdminAnalytics {
  constructor() {
    this.charts = {};
    this.init();
  }

  async init() {
    await this.loadData();
    this.renderCharts();
    this.setupRealTimeUpdates();
  }

  async loadData() {
    // Simulate loading analytics data
    this.data = {
      visitors: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        data: [120, 150, 180, 200, 250, 220, 190]
      },
      popularArticles: {
        labels: ['Gouvernement', 'Économie', 'Festival', 'Sport', 'Tech'],
        data: [2450, 1890, 1650, 1420, 1380]
      },
      trafficSources: {
        labels: ['Direct', 'Search', 'Social', 'Referral', 'Email'],
        data: [40, 30, 15, 10, 5]
      },
      categoryEngagement: {
        labels: ['Politique', 'Économie', 'Sport', 'Culture', 'Tech'],
        data: [35, 28, 20, 12, 5]
      },
      sessionDuration: {
        labels: ['0-30s', '30s-1m', '1-2m', '2-5m', '5m+'],
        data: [15, 25, 30, 20, 10]
      }
    };
  }

  renderCharts() {
    this.renderVisitorsChart();
    this.renderPopularArticles();
    this.renderTrafficSourcesChart();
    this.renderCategoryEngagementChart();
    this.renderSessionDurationChart();
    this.renderPerformanceMetrics();
  }

  renderVisitorsChart() {
    const ctx = document.getElementById('visitors-chart');
    if (!ctx) return;

    this.charts.visitors = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.data.visitors.labels,
        datasets: [{
          label: 'Visiteurs',
          data: this.data.visitors.data,
          borderColor: '#FE0202',
          backgroundColor: 'rgba(254, 2, 2, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  renderPopularArticles() {
    const ctx = document.getElementById('popular-articles-chart');
    if (!ctx) return;

    this.charts.popularArticles = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.data.popularArticles.labels,
        datasets: [{
          label: 'Vues',
          data: this.data.popularArticles.data,
          backgroundColor: '#4CAF50',
          borderColor: '#388E3C',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  renderTrafficSourcesChart() {
    const ctx = document.getElementById('traffic-sources-chart');
    if (!ctx) return;

    this.charts.trafficSources = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.data.trafficSources.labels,
        datasets: [{
          data: this.data.trafficSources.data,
          backgroundColor: [
            '#FE0202',
            '#4CAF50',
            '#2196F3',
            '#FF9800',
            '#9C27B0'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  renderCategoryEngagementChart() {
    const ctx = document.getElementById('category-engagement-chart');
    if (!ctx) return;

    this.charts.categoryEngagement = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: this.data.categoryEngagement.labels,
        datasets: [{
          label: 'Engagement (%)',
          data: this.data.categoryEngagement.data,
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          pointBackgroundColor: '#2196F3'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 40
          }
        }
      }
    });
  }

  renderSessionDurationChart() {
    const ctx = document.getElementById('session-duration-chart');
    if (!ctx) return;

    this.charts.sessionDuration = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.data.sessionDuration.labels,
        datasets: [{
          data: this.data.sessionDuration.data,
          backgroundColor: [
            '#FF5722',
            '#FF9800',
            '#FFC107',
            '#4CAF50',
            '#2196F3'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  renderPerformanceMetrics() {
    const container = document.getElementById('performance-metrics');
    if (!container) return;

    const metrics = [
      { label: 'Temps de chargement moyen', value: '2.3s', change: -0.2 },
      { label: 'Taux de conversion', value: '3.2%', change: 0.5 },
      { label: 'Temps passé par page', value: '4:32', change: 0.8 },
      { label: 'Taux de rebond', value: '42%', change: -2.1 },
      { label: 'Pages par session', value: '2.8', change: 0.3 }
    ];

    container.innerHTML = metrics.map(metric => `
      <div class="metric-item">
        <div class="metric-label">${metric.label}</div>
        <div class="metric-value">${metric.value} <span class="${metric.change >= 0 ? 'positive' : 'negative'}">(${metric.change >= 0 ? '+' : ''}${metric.change})</span></div>
      </div>
    `).join('');
  }

  setupRealTimeUpdates() {
    // Simulate real-time updates every 30 seconds
    setInterval(() => {
      this.updateRealTimeData();
    }, 30000);
  }

  updateRealTimeData() {
    // Simulate updating charts with new data
    if (this.charts.visitors) {
      const newData = this.data.visitors.data.map(val => val + Math.floor(Math.random() * 20 - 10));
      this.charts.visitors.data.datasets[0].data = newData;
      this.charts.visitors.update();
    }
  }
}

// ==========================================
// INITIALIZATION
// ==========================================

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.adminDashboard = new AdminDashboard();
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AdminDashboard, AdminAnalytics };
}
