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
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configuração para produção em subdiretório
  base: mode === 'production' ? '/fastbot/' : '/', // Define base path apenas em produção
  
  // Configurações de build otimizadas
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Garantir que os assets tenham nomes consistentes
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    // Força regeneração do manifesto
    manifest: false,
  },
}));
