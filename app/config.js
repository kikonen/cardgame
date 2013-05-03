// Set the require.js configuration for your application.
require.config({
  // Initialize the application with the main application file and the JamJS
  // generated configuration file.
  deps: [
    "backbone_data",
    "main"],

  paths: {
    "jquery": "../components/jquery/jquery.min",
    "backbone": "../components/backbone/backbone-min",
    "backbone.layoutmanager": "../components/layoutmanager/backbone.layoutmanager",
    "underscore": "../components/underscore/underscore-min"
  },

  shim: {
    'underscore': {
        exports: '_'
    },
    'jquery': {
      exports: '$'
    },
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    'backbone.layoutmanager': {
      deps: ['backbone'],
      exports: 'Backbone.LayoutManager'
    }
  }

});
