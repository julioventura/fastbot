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
  // base: mode === 'production' ? '/fastbot/' : '/', // Define base path apenas em produção
  base: '/fastbot/',
  
  // Configurações de build otimizadas
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Aumenta o limite de chunk para evitar warnings desnecessários
    chunkSizeWarningLimit: 1000,
    // Garantir que os assets tenham nomes consistentes
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        // Configuração de chunks manuais para otimizar o bundle
        manualChunks: {
          // Separar React e ReactDOM em chunk próprio
          'react-vendor': ['react', 'react-dom'],
          // Separar bibliotecas UI em chunk próprio
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-slot', '@radix-ui/react-toast', 'lucide-react'],
          // Separar bibliotecas de roteamento
          'router-vendor': ['react-router-dom'],
          // Separar Supabase em chunk próprio
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    // Força regeneração do manifesto
    manifest: false,
  },
}));
