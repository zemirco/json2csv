var webpack = require('webpack');

var webpackConfig = {
  entry: './lib/json2csv.js',
  resolve: {
    extensions: ['', '.js']
  },
  output: {
    path: __dirname + '/dist',
    libraryTarget: 'umd',
    library: 'json2csv',
    filename: 'json2csv.js'
  }
};

module.exports = webpackConfig;
