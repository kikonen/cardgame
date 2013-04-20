var express = require('express'),
  http = require('http'),
  path = require('path');

var app = express();

var rootURL = "";

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.static(path.join(__dirname, '.')));
  app.set('view engine', 'jade');
  app.set('views', path.join(__dirname, 'app'));
});

/**
 * Create ordered deck of cards
 *
 * @return array of (card)
 */
function createDeck() {
  var deck = [];
  var iconBase = 0;
  var idx = 0;
  
  iconBase = 1;
  for (var i = 1; i < 14; i++) {
    var card = {id: iconBase + (13 - i) * 4, suite: "club", value: (i == 13 ? 1 : i + 1), index: idx++, front: false};
    deck.push(card);
  }
  
  iconBase = 2;
  for (var i = 1; i < 14; i++) {
    var card = {id: iconBase + (13 - i) * 4, suite: "spade", value: (i == 13 ? 1 : i + 1), index: idx++, front: false};
    deck.push(card);
  }
  
  iconBase = 3;
  for (var i = 1; i < 14; i++) {
    var card = {id: iconBase + (13 - i) * 4, suite: "heart", value: (i == 13 ? 1 : i + 1), index: idx++, front: false};
    deck.push(card);
  }
  
  iconBase = 4;
  for (var i = 1; i < 14; i++) {
    var card = {id: iconBase + (13 - i) * 4, suite: "diamond", value: (i == 13 ? 1 : i + 1), index: idx++, front: false};
    deck.push(card);
  }
  
  return deck;
}

/**
 * Create map of cards
 *
 * @return map of (id, card)
 */
function createCards(deck) {
  var result = {};
  for (card in deck) {
    if (deck.hasOwnProperty(card)) {
       result["" + card.id] = card;
    }
  }
  return result;
}

var deck = createDeck();
var cards = createCards(deck);


app.get(rootURL + '/', function(req, res) {
  res.render('index.jade');
});

app.get(rootURL + '/cards', function(req, res) {
  var result = [];
  for (card in deck) {
    if (deck.hasOwnProperty(card)) {
       result.push(deck[card]);
    }
  }
  
  res.json(result);
});

var getShuffledCards = function(req, res) {
  var result = [];
  
  for (card in deck) {
    if (deck.hasOwnProperty(card)) {
       result.push(deck[card]);
    }
  }
  
  shuffle(result);
  
  res.json(result);
};

app.get(rootURL + '/shuffledcards', getShuffledCards);
app.get(rootURL + '//shuffledcards', getShuffledCards);

// Log unknown requests
app.get('*', function(req, res) {
  console.log(req.params);
});

function shuffle(cards) {
  var i;
  for (i = 0; i < cards.length; i++) {
    swap(cards, i);
  }
}

function swap(cards, i) {
  var destIdx = Math.round(Math.random() * cards.length);
  var old = cards[destIdx];
  cards[destIdx] = cards[i];
  cards[i] = old;
}

app.get('/cards/:id', function(req, res) {
  var card = cards[req.params.id];
  res.json(card);
});

app.listen(8090);
