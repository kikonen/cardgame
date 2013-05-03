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

  app.APP_ROOT = '/';
  app.DIR = path.dirname(module.uri);

  app.port = 8090;
  app.deck = new Deck.Model();
  app.dev = false;
  app.release = true;

  app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.static(path.join(app.DIR, '.')));
    app.set('view engine', 'jade');
//    app.set('views', path.join(app.DIR, 'app'));
    app.set('views', app.DIR);
  });

  app.get(app.APP_ROOT, function(req, res) {
    res.render('index.jade', {
        release: app.release,
        dev: app.dev});
  });

  return app;
});
