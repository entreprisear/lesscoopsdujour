// Configuration Webpack pour la production - Les Scoops du Jour
// Build optimisé avec toutes les optimisations de performance

const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');

// Plugins de production
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const Critters = require('critters-webpack-plugin');
const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',

  // Optimisations de build
  optimization: {
    // Code splitting avancé
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor chunks
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
          enforce: true
        },

        // React/ReactDOM séparés (si utilisé)
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20
        },

        // Bibliothèques sociales
        social: {
          test: /[\\/]src[\\/]js[\\/](components[\\/]SocialShare|components[\\/]SocialWidgets|utils[\\/]OpenGraphManager)[\\/]/,
          name: 'social',
          chunks: 'all',
          priority: 15
        },

        // Utilitaires
        utils: {
          test: /[\\/]src[\\/]js[\\/]utils[\\/]/,
          name: 'utils',
          chunks: 'all',
          priority: 5,
          minChunks: 2
        },

        // Styles séparés
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    },

    // Minimisation
    minimize: true,
    minimizer: [
      // Minification JavaScript avancée
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Supprimer console.log en production
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug'],
            passes: 2,
            unsafe: true,
            unsafe_comps: true,
            unsafe_Function: true,
            unsafe_math: true,
            unsafe_symbols: true,
            unsafe_methods: true,
            unsafe_proto: true,
            unsafe_regexp: true,
            unsafe_undefined: true
          },
          mangle: {
            safari10: true
          },
          format: {
            comments: false
          }
        },
        extractComments: false,
        parallel: true
      }),

      // Minification CSS
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
              minifyFontValues: { removeQuotes: false },
              minifySelectors: true
            }
          ]
        },
        parallel: true
      })
    ],

    // Optimisations runtime
    runtimeChunk: 'single',
    moduleIds: 'deterministic',
    chunkIds: 'deterministic'
  },

  // Plugins de production
  plugins: [
    // Variables d'environnement
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
      'process.env.VERSION': JSON.stringify(require('./package.json').version),
      // Feature flags pour la production
      __PRODUCTION__: JSON.stringify(true),
      __ANALYTICS_ENABLED__: JSON.stringify(true),
      __SECURITY_ENABLED__: JSON.stringify(true),
      __PWA_ENABLED__: JSON.stringify(true)
    }),

    // Compression Gzip/Brotli
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg|json|txt|ico)$/,
      threshold: 10240, // 10KB minimum
      minRatio: 0.8,
      deleteOriginalAssets: false
    }),

    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg|json|txt|ico)$/,
      threshold: 10240,
      minRatio: 0.8,
      deleteOriginalAssets: false
    }),

    // Service Worker optimisé
    new GenerateSW({
      swDest: 'sw.js',
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        // Cache des API
        {
          urlPattern: /^https:\/\/api\./,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 // 1 heure
            },
            cacheKeyWillBeUsed: async ({ request }) => {
              return `${request.url}?${Date.now()}`;
            }
          }
        },

        // Cache des images
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 jours
            }
          }
        },

        // Cache des fonts
        {
          urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 an
            }
          }
        },

        // Cache des pages HTML
        {
          urlPattern: /\.html$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 // 1 heure
            }
          }
        }
      ],

      // Pré-cache des ressources critiques
      additionalManifestEntries: [
        { url: '/offline.html', revision: null },
        { url: '/manifest.json', revision: null },
        { url: '/images/logo-192.svg', revision: null },
        { url: '/images/logo-512.svg', revision: null }
      ]
    }),

    // Critical CSS inlining
    new Critters({
      preload: 'swap',
      inlineFonts: true,
      preloadFonts: true,
      fonts: true,
      keyframeAnimations: true,
      compress: true
    }),

    // Resource hints
    new PreloadWebpackPlugin({
      rel: 'preload',
      include: 'initial',
      fileBlacklist: [/\.map$/, /hot-update\.js$/]
    }),

    new PreloadWebpackPlugin({
      rel: 'prefetch',
      include: 'asyncChunks'
    }),

    // Bundle analyzer (optionnel - activé avec ANALYZE=true)
    ...(process.env.ANALYZE ? [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-analysis.html',
        openAnalyzer: false,
        generateStatsFile: true,
        statsFilename: 'bundle-stats.json'
      })
    ] : [])
  ],

  // Configuration des assets
  module: {
    rules: [
      // Optimisation des images
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
        type: 'asset',
        generator: {
          filename: 'images/[name].[contenthash][ext]'
        },
        use: [
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 75
              },
              optipng: {
                enabled: true
              },
              pngquant: {
                quality: [0.65, 0.90],
                speed: 4
              },
              gifsicle: {
                interlaced: false
              },
              webp: {
                quality: 75
              }
            }
          }
        ]
      },

      // Optimisation des fonts
      {
        test: /\.(woff|woff2|ttf|eot)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[contenthash][ext]'
        }
      }
    ]
  },

  // Configuration de sortie optimisée
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: (pathData) => {
      const name = pathData.chunk.name;
      return name === 'vendors' ? 'js/[name].[contenthash].js' :
             name === 'react' ? 'js/[name].[contenthash].js' :
             name === 'social' ? 'js/[name].[contenthash].js' :
             name === 'utils' ? 'js/[name].[contenthash].js' :
             'js/[name].[contenthash].js';
    },
    chunkFilename: 'js/chunks/[name].[contenthash].js',
    assetModuleFilename: 'assets/[name].[contenthash][ext]',
    clean: true,
    publicPath: '/',

    // Optimisations de chargement
    chunkLoadTimeout: 120000,
    crossOriginLoading: 'anonymous'
  },

  // Stats de build détaillés
  stats: {
    colors: true,
    chunks: true,
    chunkModules: false,
    modules: false,
    chunkOrigins: false,
    assets: true,
    assetsSort: 'size',
    builtAt: true,
    timings: true,
    version: true,
    hash: true,
    entrypoints: true,
    cachedAssets: false,
    reasons: false,
    source: false,
    errorDetails: true,
    publicPath: true,
    excludeAssets: [/\.map$/]
  },

  // Performance budget
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000, // 512KB
    maxAssetSize: 1024000,    // 1MB
    assetFilter: (assetFilename) => {
      // Exclure les assets générés
      return !assetFilename.endsWith('.map') &&
             !assetFilename.includes('hot-update');
    }
  },

  // Devtool pour la production (source maps séparés)
  devtool: 'source-map',

  // Configuration des résolveurs
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/js/components'),
      '@utils': path.resolve(__dirname, 'src/js/utils'),
      '@templates': path.resolve(__dirname, 'src/templates')
    },
    extensions: ['.js', '.json', '.wasm'],
    mainFields: ['browser', 'module', 'main']
  },

  // Configuration des experiments
  experiments: {
    topLevelAwait: true
  }
});
