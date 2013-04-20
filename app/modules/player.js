// Player module
define([
  // Application.
  "app"
],
function(
  app) {

  var Player = app.module();

  Player.Model = Backbone.Model.extend({
    moves: 0,

    initialize: function() {
      app.on("game:move", function() {
        this.set("moves", this.get("moves") + 1);
      }, this);
      
      app.on("game:restart", this.reset, this);
      app.on("player:reset", this.reset, this);
    },
    
    reset: function() {
      this.set("moves", 0);
    }
  });

  Player.Views.Layout = Backbone.Layout.extend({
    template: "player",
    
    initialize: function() {
      this.model.on("change", this.render, this);
    },
    
    serialize: function() {
      return { player: this.model.toJSON() };
    }   
  });

  return Player;
});
