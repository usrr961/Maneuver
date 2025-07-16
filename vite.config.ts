import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from "vite-plugin-pwa";
import basicSsl from "@vitejs/plugin-basic-ssl"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    basicSsl(),
    react(),
    tailwindcss(),
    VitePWA({
      manifest: {
        name: 'Maneuver',
        short_name: 'Maneuver',
        description: "Maneuver is a FRC scouting app designed to streamline data collection.",
        theme_color: '#3A3B3E',
        icons: [
          {
            src: '192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      registerType: "autoUpdate", // Automatically updates the service worker when changes are made
      devOptions: {
        enabled: true, // Enable PWA during development for testing
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "script",
            handler: "NetworkFirst",
            options: {
              cacheName: "js-cache",
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "style",
            handler: "NetworkFirst",
            options: {
              cacheName: "css-cache",
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "NetworkFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // Cache images for 30 days
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    https: {}, // enables HTTPS with default settings; configure with cert/key if needed
    host: true, // same as "--host" flag
	},
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
