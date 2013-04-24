// Game module
define([
  // Application.
  "app",
  "modules/header",
  "modules/footer",
  "modules/board",
  "modules/card",
  "modules/player",
  "modules/debug"
],
function(
  app,
  Header,
  Footer,
  Board,
  Card,
  Player,
  Debug) {

  var Game = app.module();

  Game.Model = Backbone.Model.extend({
    footer: null,
    header: null,
    board: null,
    player: null,
    debug: null,

    initialize: function() {
      this.footer = new Footer.Model();
      this.header = new Header.Model();
      this.board = new Board.Model();
      this.player = new Player.Model();
      this.debug = new Debug.Model();

      app.on("game:tip", function() {
        alert("TIP: On touch device use touch card and then touch destination. In desktop use Drag'n'Drop");
      });
    }
  });

  Game.Collection = Backbone.Collection.extend({
    model: Game.Model
  });

  // Game layout
  Game.Views.Layout = Backbone.Layout.extend({
    el: "#main",
    template: "game"
  });

  Game.restart = function() {
      var game = new Game.Model();
      game.name = 'so called "master plan"';

      var layout = new Game.Views.Layout({model: game});

      layout.setView( "#footer", new Footer.Views.Layout({model: game.footer}) );
      layout.setView( "#header", new Header.Views.Layout({model: game.header}) );

      layout.setView( "#board", new Board.Views.Layout({model: game.board}) );
      layout.setView( "#player", new Player.Views.Layout({model: game.player}) );

//      layout.setView( "#debug", new Debug.Views.Layout({model: game.debug}) );

      layout.render();

      app.game = game;
      app.debug = game.debug;

      app.trigger("game:restart");
  };

  return Game;
});
