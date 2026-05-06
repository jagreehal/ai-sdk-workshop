import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const { apiPlugin } = await import('./vite-api-plugin');

function getPackageChunkName(id: string): string | undefined {
  if (!id.includes('node_modules')) return;

  const pkgPath = id.split('node_modules/').pop();
  if (!pkgPath) return;

  const segments = pkgPath.split('/');
  const packageName = segments[0]?.startsWith('@')
    ? `${segments[0]}/${segments[1]}`
    : segments[0];

  if (!packageName) return 'vendor';

  const chunkNames: Record<string, string> = {
    react: 'react',
    ai: 'ai-core',
    '@ai-sdk/react': 'ai-sdk-react',
    '@ai-sdk/provider-utils': 'ai-sdk-provider-utils',
    streamdown: 'streamdown',
    marked: 'marked',
    zod: 'zod',
    'tailwind-merge': 'tailwind-merge',
    'lucide-react': 'lucide-react',
  };

  return chunkNames[packageName] ?? 'vendor';
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          return getPackageChunkName(id);
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api/tags': {
        target: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        changeOrigin: true,
      },
    },
  },
});
