module.exports = function (grunt) {
  
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

    // print available grunt tasks
    availabletasks: {
        tasks: {
          options: {
            filter: 'include',
            tasks: ['test', 'default', 'release']
          }
        }
    }
    
  });

  // Define the grunt tasks
  grunt.registerTask('no-timer', function() {
    process.removeAllListeners('timegruntexit');
  });
  grunt.registerTask('test', 'Run mocha tests for json2csv.', ['mochaTest']);
  grunt.registerTask('release', 'Bump version, commit, tag, push.', ['bump']);
  grunt.registerTask('default', 'List available Grunt tasks & targets.', ['no-timer', 'availabletasks']);

};