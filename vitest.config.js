import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        'dist/',
        'src/services/**',
        'src/main.jsx',
        'src/types/**',
        '**/__tests__/**',
        'src/App.jsx',
        'src/pages/WorkflowEditor.jsx',
        'src/pages/WorkflowsList.jsx',
        'src/pages/RunDetail.jsx',
        'src/pages/index.js',
        'src/components/WorkflowCanvas.jsx',
        'src/components/TaskNode.jsx',
      ],
    },
  },
});
