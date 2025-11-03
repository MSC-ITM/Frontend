import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',  // Excluir tests E2E de Playwright
      '**/.{idea,git,cache,output,temp}/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/**/*.{ts,tsx}',
      ],
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.test.{ts,tsx}',
        '**/__tests__/**',
        // Excluir archivos de configuración
        '**/*.config.{ts,js,mjs}',
        '**/vite-env.d.ts',
        'dist/**',
        // Excluir servicios
        'src/services/**',
        // Excluir páginas excepto Login
        'src/pages/RunDetail.tsx',
        'src/pages/WorkflowEditor.tsx',
        'src/pages/WorkflowsList.tsx',
        'src/pages/index.ts',
        // Excluir componentes complejos de ReactFlow
        'src/components/TaskNode.tsx',
        'src/components/WorkflowCanvas.tsx',
        // Excluir archivos de aplicación principales
        'src/App.tsx',
        'src/main.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
