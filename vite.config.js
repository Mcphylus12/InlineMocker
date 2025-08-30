import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true,
        entryFileNames: `mocker.js`,
        assetFileNames: `assets/[name][extname]`,
      }
    }
  }
});