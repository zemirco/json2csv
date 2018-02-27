import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default [
  {
    input: 'lib/json2csv.js',
    output: {
      file: pkg.browser,
      format: 'umd',
      name: 'json2csv'
    },
    plugins: [
      resolve({
        browser: true
      }),
      commonjs(),
      globals(),
      builtins(),
      babel({
        exclude: ['node_modules/**'],
        presets: ['es2015-rollup']
      })
    ]
  },
  {
    input: 'lib/json2csv.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    external: [ 'os', 'stream' ],
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: ['node_modules/**'],
        presets: ['es2015-rollup']
      })
    ]
  }
];
