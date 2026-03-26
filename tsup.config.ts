import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Disabling dts here because of TS 6.0 compatibility issue
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  external: ['react', 'react-native', 'firebase'],
  outDir: 'dist',
});
