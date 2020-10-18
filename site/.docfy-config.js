const path = require('path');
const autolinkHeadings = require('remark-autolink-headings');
const highlight = require('@gridsome/remark-prismjs');
const codeImport = require('remark-code-import');

module.exports = {
  repository: {
    url: 'https://github.com/zemirco/json2csv',
  },
  remarkPlugins: [
    [autolinkHeadings, { behavior: 'wrap' }],
    codeImport,
    [highlight, { showLineNumbers: true }],
  ],
  sources: [
    {
      root: path.resolve(__dirname, '../docs'),
      pattern: '**/*.md',
      urlPrefix: 'docs',
    },
  ],
};
