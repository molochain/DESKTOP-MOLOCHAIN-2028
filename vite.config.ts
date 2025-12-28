import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Detect if we're in Replit environment
const isReplit = process.env.REPLIT_DOMAINS !== undefined;
const replitDomain = process.env.REPLIT_DOMAINS ? process.env.REPLIT_DOMAINS.split(',')[0] : 'localhost';
// Define port with a default value to avoid undefined
const port = parseInt(process.env.PORT || "5000", 10);

// Detect production environment
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  base: '/',
  resolve: {
    alias: {
      "@db": path.resolve(__dirname, "db"),
      "@": path.resolve(__dirname, "client", "src"),
      "@assets": path.resolve(__dirname, "attached_assets"),
      "@shared": path.resolve(__dirname, "shared"),
    },
    dedupe: ['ethers'],
    mainFields: ['browser', 'module', 'main']
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            'lucide-react',
            'framer-motion',
          ],
          'vendor-charts': ['recharts', 'chart.js', 'd3'],
          'vendor-utils': ['date-fns', 'zod', 'axios', '@tanstack/react-query'],
        },
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').pop() || '';
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  optimizeDeps: {
    include: ['ethers'],
    esbuildOptions: {
      target: 'es2020',
      resolveExtensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    }
  },
  define: {
    global: 'globalThis',
  },
  server: {
    host: "0.0.0.0",
    port: port,
    strictPort: true,
    allowedHosts: true,
    // Disable HMR to avoid WebSocket errors in Replit environment
    hmr: false,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      '/api': {
        target: `http://0.0.0.0:${port}`,
        changeOrigin: true,
      },
      '/ws': {
        target: `ws://0.0.0.0:${port}`,
        ws: true,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: port,
    strictPort: true,
  },
});