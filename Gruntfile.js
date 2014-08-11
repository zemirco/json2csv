module.exports = function(grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    availabletasks: 'grunt-available-tasks'
  });

  // Define the configuration for all the tasks
  grunt.initConfig({

    // grunt-bump: bump package version, create tag, commit, push...
    bump: {
      options: {
        // remote git repo name
        pushTo: 'origin'
      }
    },

    // mocha tests
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/test.js']
      }
    },

    // format csv2json
    jsbeautifier: {
      files: [
        'Gruntfile.js',
        '{bin,lib,test}/**/*.js'
      ],
      options: {
        config: 'js-beautify.json'
      }
    },

    // print available grunt tasks
    availabletasks: {
      tasks: {
        options: {
          filter: 'include',
          tasks: ['test', 'default', 'release', 'format']
        }
      }
    }

  });

  // Define the grunt tasks
  grunt.registerTask('no-timer', function() {
    process.removeAllListeners('timegruntexit');
  });
  grunt.registerTask('test', 'Run mocha tests for json2csv.', ['mochaTest']);
  grunt.registerTask('format', 'Formats the csv2json javascript files.', ['jsbeautifier']);
  grunt.registerTask('release', 'Format, test, bump version, commit, tag, push.', [
    'format',
    'test',
    'bump'
  ]);
  grunt.registerTask('default', 'List available Grunt tasks & targets.', ['no-timer', 'availabletasks']);

};
