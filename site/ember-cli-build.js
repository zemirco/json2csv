'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

let postCssPlugins = {
  before: [require('postcss-nested')()],
  after: [
    require('postcss-import')({ path: ['node_modules'] }),
    require('tailwindcss')('./app/tailwind/config.js'),
  ],
};

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    cssModules: {
      plugins: postCssPlugins,
    },
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  app.import('node_modules/prismjs/themes/prism.css');
  app.import('node_modules/prismjs/themes/prism-okaidia.css');
  app.import(
    'node_modules/prismjs/plugins/line-numbers/prism-line-numbers.css'
  );

  return app.toTree();
};
