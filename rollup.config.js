import typescript from '@rollup/plugin-typescript';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from "rollup-plugin-copy";

export default {
  input: 'src/main.ts',
  output: {
    dir: 'dist/tada-obsidian/',
    sourcemap: 'inline',
    format: 'cjs',
    exports: 'default'
  },
  external: ['obsidian'],
  plugins: [
    typescript(),
    nodeResolve({browser: true}),
    commonjs(),
    copy({
      targets: [
        {
          src: 'manifest.json',
          dest: 'dist/tada-obsidian/',
        },
        {
          src: 'styles.css',
          dest: 'dist/tada-obsidian/',
        },
      ],
    }),
  ],
};
