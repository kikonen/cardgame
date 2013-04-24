define([
  'module',
  'express',
  'http',
  'path',
  'server/modules/deck'],
function (
  module,
  express,
  http,
  path,
  Deck) {
  
  var app = express();
  
  app.APP_ROOT = '/cardgame/';
  app.DIR = path.dirname(module.uri);
  
  app.port = 8090;
  app.deck = new Deck.Model();
  
  app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.static(path.join(app.DIR, '.')));
    app.set('view engine', 'jade');
    app.set('views', path.join(app.DIR, 'app'));
  });
  
  app.get(app.APP_ROOT, function(req, res) {
    res.render('index.jade');
  });
  
  return app;
});
