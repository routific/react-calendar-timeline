import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const port = Number(process.env.PORT) || 8888;

export default defineConfig({
  root: resolve(__dirname, 'demo'),
  publicDir: false,
  plugins: [
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!id.includes('/demo/') && !id.includes('/src/')) {
          return null;
        }
        if (!/\.js$/.test(id)) {
          return null;
        }
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      },
    },
    react({
      include: '**/*.{js,jsx}',
    }),
  ],
  resolve: {
    alias: {
      '~': resolve(__dirname, 'demo'),
      'react-calendar-timeline': resolve(__dirname, 'src'),
      'react-calendar-timeline-css': resolve(__dirname, 'src/lib/Timeline.scss'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // silence legacy sass API noise from the demo styles
        quietDeps: true,
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port,
    strictPort: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
