// @see https://github.com/cowboy/grunt/blob/master/docs/configuring.md
module.exports = function(grunt) {

  grunt.initConfig({
    // @see https://github.com/millermedeiros/amd-utils/blob/master/.jshintrc#L18-22
    // @see .jshintrc
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },

      all: [
        '*.js',
        'app/**/*.js',
        'server/**/*.js']
    },

    requirejs: {
      debug: {
        options: {
          // Root application module.
          name: "config",
          baseUrl : "app",
          mainConfigFile: "app/config.js",
          out: "dist/debug/main.js",

          // Do not wrap everything in an IIFE.
          wrap: false
        }
      },
      release: {
        options: {
          // Root application module.
          name: "config",
          baseUrl : "app",
          mainConfigFile: "app/config.js",
          out: "dist/release/main.js",

          // Do not wrap everything in an IIFE.
          wrap: false
        }
      }
    },

    // Running the server without specifying an action will run the defaults,
    // port: 8000 and host: 127.0.0.1.  If you would like to change these
    // defaults, simply add in the properties `port` and `host` respectively.
    // Alternatively you can omit the port and host properties and the server
    // task will instead default to process.env.PORT or process.env.HOST.
    //
    // Changing the defaults might look something like this:
    //
    // server: {
    //   host: "127.0.0.1", port: 9001
    //   debug: { ... can set host and port here too ...
    //  }
    //
    //  To learn more about using the server task, please refer to the code
    //  until documentation has been written.
    server: {
      port: 8080,

      // Ensure the favicon is mapped correctly.
      files: { "favicon.ico": "favicon.ico" },

      // For styles.
      prefix: "app/styles/",

      debug: {
        // Ensure the favicon is mapped correctly.
        files: "<config:server.files>",

        // Map `server:debug` to `debug` folders.
        folders: {
          "app": "dist/debug",
          "vendor/js/libs": "dist/debug",
          "app/styles": "dist/debug"
        }
      },

      release: {
        // This makes it easier for deploying, by defaulting to any IP.
        host: "0.0.0.0",

        // Ensure the favicon is mapped correctly.
        files: "<config:server.files>",

        // Map `server:release` to `release` folders.
        folders: {
          "app": "dist/release",
          "vendor/js/libs": "dist/release",
          "app/styles": "dist/release"
        }
      }
    },

    // The headless QUnit testing environment is provided for "free" by Grunt.
    // Simply point the configuration to your test directory.
    qunit: {
      all: ["test/qunit/*.html"]
    },

    // The headless Jasmine testing is provided by grunt-jasmine-task. Simply
    // point the configuration to your test directory.
    jasmine: {
      all: ["test/jasmine/*.html"]
    },

    compass: {
      release: {
        options: {
          sassDir: 'app/styles',
          cssDir: 'app/release',
          environment: 'production',
          httpPath: '',
          generatedImagesDir: 'app/release/images',
          httpImagesPath: '../../images',
          httpGeneratedImagesPath: 'images'
        }
      },
      debug: {
        options: {
          sassDir: 'app/styles',
          cssDir: 'app/debug',
          httpPath: '',
          generatedImagesDir: 'app/debug/images',
          httpImagesPath: '../../images',
          httpGeneratedImagesPath: 'images'
        }
      }
    },

    // The watch task can be used to monitor the filesystem and execute
    // specific tasks when files are modified.  By default, the watch task is
    // available to compile CSS if you are unable to use the runtime compiler
    // (use if you have a custom server, PhoneGap, Adobe Air, etc.)
    watch: {
      files: ["grunt.js", "vendor/**/*", "app/**/*"],
      tasks: ['compass:debug', 'compass:release']
    },

    // The clean task ensures all files are removed from the dist/ directory so
    // that no files linger from previous builds.
    clean: ["dist", "app/release", "app/debug"]

    // If you want to generate targeted `index.html` builds into the `dist/`
    // folders, uncomment the following configuration block and use the
    // conditionals inside `index.html`.
    //targethtml: {
    //  debug: {
    //    src: "index.html",
    //    dest: "dist/debug/index.html"
    //  },
    //
    //  release: {
    //    src: "index.html",
    //    dest: "dist/release/index.html"
    //  }
    //},

    // This task will copy assets into your build directory,
    // automatically.  This makes an entirely encapsulated build into
    // each directory.
    //copy: {
    //  debug: {
    //    files: {
    //      "dist/debug/app/": "app/**",
    //      "dist/debug/vendor/": "vendor/**"
    //    }
    //  },

    //  release: {
    //    files: {
    //      "dist/release/app/": "app/**",
    //      "dist/release/vendor/": "vendor/**"
    //    }
    //  }
    //}

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-jsbeautifier');

  grunt.registerTask("debug", ["clean", "jshint", "requirejs:debug", "compass:debug"]);
  grunt.registerTask("release", ["debug", "requirejs:release", "compass:release"]);

  grunt.registerTask("run", ["server", "watch"]);
};
