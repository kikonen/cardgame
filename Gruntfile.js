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
      compile: {
        options: {
          // Root application module.
          name: "config",
          baseUrl : "app",
          mainConfigFile: "app/config.js",
          include: ["vendor/jam/require.config"],
          out: "dist/debug/require.js",

          // Do not wrap everything in an IIFE.
          wrap: false
        }
      }
    },

    // The concatenate task is used here to merge the almond require/define
    // shim and the templates into the application code.  It's named
    // dist/debug/require.js, because we want to only load one script file in
    // index.html.
    concat: {
      dist: {
        src: [
          "vendor/js/libs/almond.js",
          "dist/debug/templates.js",
          "dist/debug/require.js"
        ],

        dest: "dist/debug/require.js",

        separator: ";"
      }
    },

    // This task uses the MinCSS Node.js project to take all your CSS files in
    // order and concatenate them into a single CSS file named index.css.  It
    // also minifies all the CSS as well.  This is named index.css, because we
    // only want to load one stylesheet in index.html.
    mincss: {
      "dist/release/index.css": [
        "dist/debug/index.css"
      ]
    },

    // Takes the built require.js file and minifies it for filesize benefits.
    min: {
      "dist/release/require.js": [
        "dist/debug/require.js"
      ]
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
      prod: {
        options: {
          sassDir: 'app/styles',
          cssDir: 'app/release',
          environment: 'production',
          httpPath: '',
          generatedImagesDir: 'app/prod/images',
          httpImagesPath: '../../images',
          httpGeneratedImagesPath: 'images'
        }
      },
      dev: {
        options: {
          sassDir: 'app/styles',
          cssDir: 'app/dev',
          httpPath: '',
          generatedImagesDir: 'app/dev/images',
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
      tasks: ['compass:dev', 'compass:prod']
    },

    // The clean task ensures all files are removed from the dist/ directory so
    // that no files linger from previous builds.
    clean: ["dist/", "app/dev", "app/prod"]

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
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-compass');

  // The debug task will remove all contents inside the dist/ folder, lint
  // all your code, precompile all the underscore templates into
  // dist/debug/templates.js, compile all the application code into
  // dist/debug/require.js, and then concatenate the require/define shim
  // almond.js and dist/debug/templates.js into the require.js file.
//  grunt.registerTask("debug", "clean lint jst requirejs concat compass:dev");
  grunt.registerTask("debug", ["clean", "jshint", "requirejs", "concat", "compass:dev"]);

  // The release task will run the debug tasks and then minify the
  // dist/debug/require.js file and CSS files.
  grunt.registerTask("release", ["debug", "min", "compass:prod", "mincss"]);

  grunt.registerTask("releasedev", ["debug", "min", "compass:dev"]);

  grunt.registerTask("run", ["server", "watch"]);
};
