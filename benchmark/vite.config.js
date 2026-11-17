import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// TIMELINE_DIR points at the checkout whose `src/` is measured (defaults to this one), so the
// same page can be built against another branch for a before/after comparison.
const timelineDir = resolve(process.env.TIMELINE_DIR || resolve(__dirname, '..'));
const outLabel = process.env.BENCH_LABEL || 'current';

export default defineConfig({
  root: __dirname,
  base: './',
  publicDir: false,
  logLevel: 'warn',
  plugins: [
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!id.includes('/src/') || !/\.js$/.test(id)) {
          return null;
        }
        return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' });
      },
    },
    react({ include: '**/*.{js,jsx}' }),
  ],
  resolve: {
    alias: {
      'timeline-under-test-css': resolve(timelineDir, 'src/lib/Timeline.scss'),
      'timeline-under-test': resolve(timelineDir, 'src/index.js'),
    },
    // one copy of React/interact even when TIMELINE_DIR is another checkout
    dedupe: ['react', 'react-dom', 'interactjs', 'moment', 'prop-types'],
  },
  css: { preprocessorOptions: { scss: { quietDeps: true } } },
  build: {
    outDir: resolve(__dirname, 'dist', outLabel),
    emptyOutDir: true,
    minify: true,
  },
});
