// Game module
define([
  // Application.
  "app",
  "modules/header",
  "modules/footer",
  "modules/board",
  "modules/card",
  "modules/player"
],
function(
  app,
  Header,
  Footer,
  Board,
  Card,
  Player) {

  var Game = app.module();

  Game.Model = Backbone.Model.extend({
    footer: null,
    header: null,
    board: null,
    player: null,
    
    initialize: function() {
      this.footer = new Footer.Model();
      this.header = new Header.Model();
      this.board = new Board.Model();
      this.player = new Player.Model();
      
      app.on("game:tip", function() {
        alert("TIP: Try moving cards!");
      })
    }
  });

  Game.Collection = Backbone.Collection.extend({
    model: Game.Model
  });

  // Game layout
  Game.Views.Layout = Backbone.Layout.extend({
    el: "#main",
    template: "game",
    
  });

  Game.restart = function() {
      var game = new Game.Model();
      game.name = 'so called "master plan"';
      
      var layout = new Game.Views.Layout({model: game});
      
      layout.setView( "#footer", new Footer.Views.Layout({model: game.footer}) );
      layout.setView( "#header", new Header.Views.Layout({model: game.header}) );
      
      layout.setView( "#board", new Board.Views.Layout({model: game.board}) );
      layout.setView( "#player", new Player.Views.Layout({model: game.player}) );
      
      layout.render();
      
      app.game = game;
      
      app.trigger("game:restart");
  }

  return Game;
});
