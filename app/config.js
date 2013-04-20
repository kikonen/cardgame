// Set the require.js configuration for your application.
require.config({
  // Initialize the application with the main application file and the JamJS
  // generated configuration file.
  deps: [
        "../vendor/jam/require.config",
        "backbone_data",
        "main"],

  paths: {
    // Put paths here.
  },

  shim: {
    // Put shims here.
  }

});
