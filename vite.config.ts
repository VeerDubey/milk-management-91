
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: './', // This is crucial for Electron to load assets correctly when packaged
  build: {
    // Optimized build configuration for npm-only environment
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
          ],
          'utils-vendor': ['date-fns', 'clsx', 'sonner', 'zod'],
          'chart-vendor': ['recharts']
        }
      }
    },
    // Add better error handling for missing optional dependencies
    commonjsOptions: {
      esmExternals: true,
      requireReturnsDefault: 'auto',
      transformMixedEsModules: true,
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Add a custom define to allow fallbacks for missing packages
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.VITE_ALLOW_MISSING_DEPENDENCIES': JSON.stringify('true'),
      }
    },
    // Exclude Electron from optimization
    exclude: ['electron', 'electron-is-dev', 'electron-log']
  }
}));
