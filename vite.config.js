import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const peerAndRuntimeExternals = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'prop-types',
  'moment',
  'interactjs',
  'classnames',
  'lodash.isequal',
  'lodash.throttle',
  'memoize-one',
  'styled-components',
  'react-draggable',
  '@ant-design/icons',
];

export default defineConfig({
  plugins: [
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!/\/src\/.*\.js$/.test(id)) {
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
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    copyPublicDir: false,
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'ReactCalendarTimeline',
      formats: ['es', 'cjs'],
      fileName: format => `react-calendar-timeline.${format}.js`,
    },
    rollupOptions: {
      external: id =>
        peerAndRuntimeExternals.some(
          pkg => id === pkg || id.startsWith(`${pkg}/`),
        ),
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          moment: 'moment',
          interactjs: 'interact',
        },
        // Ensure default-export CJS packages (styled-components, etc.) interop correctly
        interop: 'compat',
        exports: 'named',
      },
    },
  },
});
