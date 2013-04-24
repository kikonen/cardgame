var requirejs = require('requirejs');

requirejs.config({
    baseUrl: __dirname,
    
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});

requirejs(['app', 'server/api'], function(app, api) {
  console.log("server port: " + app.port);
  app.listen(app.port);
});
