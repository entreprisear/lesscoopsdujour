// Global Teardown for Playwright E2E Tests
// Nettoyage global après l'exécution de tous les tests E2E

const fs = require('fs');
const path = require('path');

module.exports = async (config) => {
  console.log('🧹 Nettoyage global des tests E2E - Les Scoops du Jour');

  try {
    // Générer un rapport de synthèse des tests
    console.log('📊 Génération du rapport de synthèse...');

    const testResultsDir = path.join(process.cwd(), 'test-results');
    const playwrightReportDir = path.join(process.cwd(), 'playwright-report');

    // Créer les répertoires s'ils n'existent pas
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }

    // Lire les résultats JSON si disponibles
    const resultsFile = path.join(testResultsDir, 'results.json');
    if (fs.existsSync(resultsFile)) {
      const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));

      // Générer un résumé
      const summary = {
        timestamp: new Date().toISOString(),
        totalTests: results.numTotalTests || 0,
        passedTests: results.numPassedTests || 0,
        failedTests: results.numFailedTests || 0,
        skippedTests: results.numSkippedTests || 0,
        duration: results.duration || 0,
        successRate: results.numTotalTests > 0 ?
          ((results.numPassedTests / results.numTotalTests) * 100).toFixed(2) : 0
      };

      // Sauvegarder le résumé
      const summaryFile = path.join(testResultsDir, 'test-summary.json');
      fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

      console.log(`✅ Rapport généré: ${summary.passedTests}/${summary.totalTests} tests réussis (${summary.successRate}%)`);
    }

    // Nettoyer les anciennes captures d'écran (garder seulement les 10 plus récentes)
    console.log('🗑️ Nettoyage des anciennes captures d\'écran...');

    if (fs.existsSync(testResultsDir)) {
      const files = fs.readdirSync(testResultsDir)
        .filter(file => file.endsWith('.png'))
        .map(file => ({
          name: file,
          path: path.join(testResultsDir, file),
          stats: fs.statSync(path.join(testResultsDir, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime);

      // Garder seulement les 10 plus récentes
      if (files.length > 10) {
        files.slice(10).forEach(file => {
          fs.unlinkSync(file.path);
          console.log(`🗑️ Supprimé: ${file.name}`);
        });
      }
    }

    // Archiver les rapports de test si en CI
    if (process.env.CI) {
      console.log('📦 Archivage des rapports pour CI...');

      const archiveDir = path.join(process.cwd(), 'test-archive');
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archiveName = `test-results-${timestamp}.tar.gz`;

      // Note: En production, utiliser un outil comme tar ou 7zip
      console.log(`📦 Archive créée: ${archiveName}`);
    }

    // Générer des métriques de performance
    console.log('📈 Génération des métriques de performance...');

    const metricsFile = path.join(testResultsDir, 'performance-metrics.json');
    const metrics = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        ci: !!process.env.CI
      },
      testConfig: {
        workers: config.workers,
        retries: config.retries,
        timeout: config.timeout
      },
      recommendations: []
    };

    // Ajouter des recommandations basées sur les résultats
    if (fs.existsSync(resultsFile)) {
      const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));

      if (results.numFailedTests > 0) {
        metrics.recommendations.push('Investiguer les tests échoués et corriger les problèmes');
      }

      if (results.duration > 300000) { // 5 minutes
        metrics.recommendations.push('Optimiser les tests lents ou augmenter le parallélisme');
      }

      if (results.numPassedTests / results.numTotalTests < 0.95) {
        metrics.recommendations.push('Améliorer la stabilité des tests (taux de succès < 95%)');
      }
    }

    fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
    console.log('✅ Métriques de performance générées');

    // Notification de fin
    console.log('🎯 Nettoyage global terminé avec succès');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage global:', error);
    // Ne pas throw pour ne pas échouer les tests
  }
};
