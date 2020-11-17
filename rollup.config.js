import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import nodePolyfills from 'rollup-plugin-node-polyfills';
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
      nodePolyfills(),
      babel({
        exclude: ['node_modules/**'],
        babelrc: false,
        presets: [['@babel/env', { modules: false }]],
      })
    ]
  },
  {
    input: 'lib/json2csv.js',
    output: [
      { file: pkg.module, format: 'es' }
    ],
    external: [ 'os', 'stream' ],
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: ['node_modules/**'],
        babelrc: false,
        presets: [['@babel/env', { modules: false }]],
      })
    ]
  }
];
