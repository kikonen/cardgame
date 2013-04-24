define([
  'app',
  'server/modules/deck'],
function (
  app,
  Deck) {

  var API = {};

  API.ROOT = app.APP_ROOT + "api/";

  app.get(API.ROOT + 'cards', function(req, res) {
    var cards = [];

    app.deck.cards.each(function(card) {
        cards.push(card);
      });

    if (req.query.order === "shuffle") {
      Deck.shuffle(cards);
    }

    res.json(cards);
  });

  app.get(API.ROOT + 'cards/:id', function(req, res) {
    var card = cards[req.params.id];
    res.json(card);
  });

  // Log unknown requests
  app.get('*', function(req, res) {
    console.log(req.params);
  });

  return API;
});
