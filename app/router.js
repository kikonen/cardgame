define([
  // Application.
  "app",
  "modules/game"
],

function(app, Game) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index"
    },

    index: function() {
      Game.restart();
    }
  });

  return Router;

});
