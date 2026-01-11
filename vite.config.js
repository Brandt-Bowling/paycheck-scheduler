import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt"], // robots.txt is standard, though not currently in public/
      manifest: {
        name: "You Go Work?",
        short_name: "Schedule",
        description: "Quick Event Adder",
        theme_color: "#f1f5f9",
        background_color: "#f1f5f9",
        display: "standalone",
        icons: [
          {
            src: "pwa-icon.svg",
            sizes: "any", // For SVG
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "pwa-icon-maskable.svg",
            sizes: "any", // For SVG
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
