module.exports = function (grunt) {
  
  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {});

  // Define the configuration for all the tasks
  grunt.initConfig({

    // grunt-bump: bump package version, create tag, commit, push...
    bump: {
      options: {
        // remote git repo name
        pushTo: 'origin'
      }
    }
    
  });

  // Define the grunt tasks
  grunt.registerTask('default', []);

};