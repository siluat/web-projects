import { readFileSync } from 'node:fs';
import { defineConfig } from 'tsdown';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  fixedExtension: false,
  dts: true,
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
});
