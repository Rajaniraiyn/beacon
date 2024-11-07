import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/child.ts'],
  format: ['esm'],
  dts: true,
  platform: 'node',
  treeshake: true,
});
