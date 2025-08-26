import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa' // <-- 1. Importa el plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),

    // --- 2. Añade la configuración de VitePWA aquí ---
    VitePWA({
      registerType: 'autoUpdate',
      // Incluye los recursos estáticos que quieres que se cacheen
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        // Personaliza estos datos con los de tu aplicación
        name: 'Registro Supervisores',
        short_name: 'RS',
        description: 'Captura y envío del registro de supervisores de producción',
        theme_color: '#theme_color', // Color de la barra de herramientas del navegador
        background_color: '#background_color', // Color de la pantalla de bienvenida (splash screen)
        icons: [
          {
            src: 'icons/icon-192x192.png', // Ruta relativa a la carpeta 'public'
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png', // Ruta relativa a la carpeta 'public'
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png', // Icono "maskable" opcional
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
    // --- Fin de la configuración de VitePWA ---
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})