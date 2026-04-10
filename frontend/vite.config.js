import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Auto-update the service worker in the background whenever a new build ships
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      // Assets that must always be pre-cached (exist in /public)
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'mask-icon.svg',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'icons/**/*',
      ],

      // ── Web App Manifest ─────────────────────────────────────────────────────
      manifest: {
        name:             'SteadyFast — Roadside Assistance',
        short_name:       'SteadyFast',
        description:      '24/7 on-demand roadside assistance. Get a verified mechanic to your location in minutes.',
        theme_color:      '#1a2f5e',
        background_color: '#1a2f5e',
        display:          'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'browser'],
        start_url:        '/',
        scope:            '/',
        orientation:      'portrait-primary',
        lang:             'en',
        dir:              'ltr',
        categories:       ['utilities', 'automotive', 'transportation'],

        icons: [
          {
            src:   'pwa-192x192.png',
            sizes: '192x192',
            type:  'image/png',
          },
          {
            src:   'pwa-512x512.png',
            sizes: '512x512',
            type:  'image/png',
          },
          {
            // Maskable icon — Android adaptive icons use this
            src:     'pwa-512x512.png',
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'maskable',
          },
          {
            // Any-purpose fallback
            src:     'pwa-192x192.png',
            sizes:   '192x192',
            type:    'image/png',
            purpose: 'any',
          },
        ],

        // Home-screen shortcuts (long-press the app icon on Android)
        shortcuts: [
          {
            name:        'Request a Mechanic',
            short_name:  'Get Help',
            description: 'Instantly request emergency roadside assistance',
            url:         '/',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name:        'Track Active Jobs',
            short_name:  'My Jobs',
            description: 'View and track your active service requests',
            url:         '/dashboard',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
        ],

        // Rich install UI (shown in Chrome's install dialog on desktop)
        screenshots: [
          {
            src:         'bg.jpg',
            sizes:       '1920x1080',
            type:        'image/jpeg',
            form_factor: 'wide',
            label:       'SteadyFast — Request roadside assistance from your dashboard',
          },
        ],
      },

      // ── Workbox (service worker) caching strategy ────────────────────────────
      workbox: {
        // Pre-cache all build output + public assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],

        // SPA fallback — any navigation miss returns index.html so React Router works offline
        navigateFallback:        'index.html',
        navigateFallbackDenylist: [/^\/api\//],  // never intercept API requests

        cleanupOutdatedCaches: true,

        runtimeCaching: [
          // Font-Awesome CDN — cache for 30 days
          {
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
            handler:    'CacheFirst',
            options: {
              cacheName: 'cdn-fonts-cache',
              expiration: {
                maxEntries:    30,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // Razorpay checkout script — cache to speed up payment modal open
          {
            urlPattern: /^https:\/\/checkout\.razorpay\.com\/.*/i,
            handler:    'CacheFirst',
            options: {
              cacheName: 'razorpay-cache',
              expiration: {
                maxEntries:    5,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // Vehicle types API — network-first, fall back to stale cache (offline UX)
          {
            urlPattern: /\/api\/vehicles/i,
            handler:    'NetworkFirst',
            options: {
              cacheName:            'api-vehicles',
              networkTimeoutSeconds: 8,
              expiration: {
                maxEntries:    5,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // Public reviews — stale-while-revalidate (fast load + fresh data)
          {
            urlPattern: /\/api\/services\/reviews\/public/i,
            handler:    'StaleWhileRevalidate',
            options: {
              cacheName: 'api-reviews',
              expiration: {
                maxEntries:    10,
                maxAgeSeconds: 60 * 60 * 6,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // Vehicle icon images uploaded by admin
          {
            urlPattern: /\/uploads\/vehicle-icons\/.*/i,
            handler:    'CacheFirst',
            options: {
              cacheName: 'vehicle-icons',
              expiration: {
                maxEntries:    50,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      // ── Dev options — lets you test the SW in `vite dev` ────────────────────
      devOptions: {
        enabled:              true,
        type:                 'module',
        navigateFallback:     'index.html',
      },
    }),
  ],
})
