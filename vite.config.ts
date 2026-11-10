import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'PEPEMEDIC — SaaS para Clínicas Dentales y Fisioterapia',
        short_name: 'PEPEMEDIC',
        description: 'Plataforma PWA Multi-tenant de reservas médicas, agenda clínica y recordatorios automáticos.',
        theme_color: '#0284c7',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/index.html'
      }
    })
  ]
});
